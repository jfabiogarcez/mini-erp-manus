import { getDb } from "./db";
import { conversasWhatsapp, mensagensWhatsapp } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

/**
 * Processa mensagens recebidas do Twilio
 * Salva no banco de dados e gera resposta com ChatGPT
 */
export async function processarMensagemWhatsapp(
  numeroCliente: string,
  mensagem: string,
  nomeCliente?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // 1. Buscar ou criar conversa
    let conversa = await db
      .select()
      .from(conversasWhatsapp)
      .where(eq(conversasWhatsapp.numeroCliente, numeroCliente))
      .limit(1);

    let conversaId: number;

    if (conversa.length === 0) {
      // Criar nova conversa
      const result = await db.insert(conversasWhatsapp).values({
        numeroCliente,
        nomeCliente: nomeCliente || "Cliente",
        ultimaMensagem: mensagem,
        dataUltimaMsg: new Date(),
        statusConversa: "Ativa",
      });
      conversaId = Number((result as any).insertId);
    } else {
      conversaId = conversa[0].id;
      // Atualizar última mensagem
      await db
        .update(conversasWhatsapp)
        .set({
          ultimaMensagem: mensagem,
          dataUltimaMsg: new Date(),
        })
        .where(eq(conversasWhatsapp.id, conversaId));
    }

    // 2. Salvar mensagem do cliente
    await db.insert(mensagensWhatsapp).values({
      conversaId,
      remetente: "Cliente",
      mensagem,
      tipo: "Texto",
      dataEnvio: new Date(),
      lida: 1,
    });

    // 3. Gerar resposta com ChatGPT
    const resposta = await gerarRespostaIA(numeroCliente, mensagem);

    // 4. Salvar resposta do sistema
    await db.insert(mensagensWhatsapp).values({
      conversaId,
      remetente: "Sistema",
      mensagem: resposta,
      tipo: "Texto",
      dataEnvio: new Date(),
      lida: 0,
    });

    return {
      conversaId,
      resposta,
      sucesso: true,
    };
  } catch (error) {
    console.error("Erro ao processar mensagem WhatsApp:", error);
    throw error;
  }
}

/**
 * Gera resposta usando ChatGPT com contexto dos documentos
 */
async function gerarRespostaIA(numeroCliente: string, mensagemCliente: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Buscar documentos para contexto
    const documentos = await db.select().from(conversasWhatsapp).limit(5);

    const contexto = documentos
      .map((d: any) => d.conteudoExtraido || "")
      .filter((c: string) => c.length > 0)
      .join("\n\n");

    const systemPrompt = `Você é um assistente de atendimento ao cliente da Transblindados, especializada em serviços de transporte executivo, segurança pessoal e receptivo de aeroporto.

Instruções:
1. Sempre responda em português brasileiro
2. Seja profissional, cortês e prestativo
3. Se o cliente solicitar um serviço específico, ofereça as opções disponíveis
4. Para orçamentos, solicite informações como: data, horário, origem e destino
5. Sempre termine com uma pergunta para manter o diálogo

Contexto dos serviços e documentos:
${contexto || "Serviços: Transporte Executivo, Segurança Pessoal, Receptivo de Aeroporto"}

Responda de forma concisa (máximo 2-3 linhas) e natural.`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: mensagemCliente },
      ],
    });

    const conteudo = response.choices?.[0]?.message?.content;
    const resposta = typeof conteudo === "string" ? conteudo : "Desculpe, não consegui processar sua mensagem. Tente novamente.";
    return resposta;
  } catch (error) {
    console.error("Erro ao gerar resposta IA:", error);
    return "Desculpe, estou temporariamente indisponível. Um agente humano entrará em contato em breve.";
  }
}

/**
 * Gera menu numerado (1-5) para o cliente
 */
export function gerarMenuNumerado(): string {
  return `Olá! 👋 Bem-vindo à Transblindados!

Como posso ajudá-lo?

1️⃣ *Transporte Executivo* - Viagens com motorista profissional
2️⃣ *Segurança Pessoal* - Proteção e acompanhamento
3️⃣ *Receptivo de Aeroporto* - Busca e entrega em aeroportos
4️⃣ *Informações Gerais* - Dúvidas sobre a empresa
5️⃣ *Falar com Agente* - Conectar com um atendente

Digite o número da opção desejada (1-5):`;
}

/**
 * Processa seleção do menu numerado
 */
export async function processarSelecaoMenu(opcao: string): Promise<string> {
  const opcaoNum = parseInt(opcao.trim());

  const respostas: Record<number, string> = {
    1: `🚗 *Transporte Executivo*

Oferecemos:
• Viagens diárias com motorista profissional
• Veículos confortáveis e bem mantidos
• Segurança e pontualidade garantidas

Para solicitar um orçamento, informe:
- Data e horário
- Origem e destino
- Número de passageiros

Deseja prosseguir com um orçamento?`,

    2: `🛡️ *Segurança Pessoal*

Nossos serviços incluem:
• Proteção pessoal 24/7
• Acompanhamento em eventos
• Consultoria de segurança

Para mais informações, qual é sua necessidade específica?`,

    3: `✈️ *Receptivo de Aeroporto*

Serviços:
• Busca no aeroporto
• Entrega em hotel ou residência
• Acompanhamento de executivos

Qual aeroporto você utilizará?`,

    4: `ℹ️ *Informações Gerais*

Somos a Transblindados, especializada em:
• Transporte executivo de qualidade
• Segurança profissional
• Receptivo de aeroporto

Fundada em 2015, atendemos empresas e executivos em toda a região.

Tem alguma dúvida específica?`,

    5: `📞 *Conectando com Agente*

Um agente humano entrará em contato em breve.
Obrigado por aguardar!`,
  };

  return (
    respostas[opcaoNum] ||
    `❌ Opção inválida. Digite um número de 1 a 5:\n\n${gerarMenuNumerado()}`
  );
}

/**
 * Valida se a mensagem é uma seleção do menu
 */
export function ehSelecaoMenu(mensagem: string): boolean {
  const numero = parseInt(mensagem.trim());
  return !isNaN(numero) && numero >= 1 && numero <= 5;
}
