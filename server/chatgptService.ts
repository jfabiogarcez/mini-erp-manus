import OpenAI from "openai";
import { ENV } from "./_core/env";

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: ENV.openaiApiKey,
});

export interface ContextoConversa {
  historico: Array<{
    papel: "usuario" | "assistente";
    conteudo: string;
  }>;
  cliente?: {
    nome: string;
    telefone: string;
    tipo: string;
  };
  ultimaInteracao?: string;
}

/**
 * Processar mensagem com ChatGPT usando contexto
 */
export async function processarMensagemComContexto(
  mensagem: string,
  contexto: ContextoConversa
): Promise<{ resposta: string; erro?: string }> {
  try {
    // Construir prompt do sistema com contexto
    const promptSistema = `Você é um assistente inteligente da Transblindados, empresa de transportes executivos e segurança.

INFORMAÇÕES SOBRE A EMPRESA:
- Serviços: Transporte Executivo, Segurança Pessoal, Receptivo de Aeroporto, Escolta Armada, Transporte para Eventos, Consultoria de Segurança
- Preços: Transporte Executivo = R$ 500, Segurança Pessoal = R$ 800, Receptivo = R$ 350, Escolta = R$ 1.200, Eventos = R$ 600, Consultoria = R$ 1.000
- Objetivo: Ajudar clientes com informações sobre serviços, agendamentos e suporte

CONTEXTO DO CLIENTE:
- Nome: ${contexto.cliente?.nome || "Cliente"}
- Tipo: ${contexto.cliente?.tipo || "Novo"}
- Última interação: ${contexto.ultimaInteracao || "Primeira conversa"}

HISTÓRICO RECENTE:
${contexto.historico
  .slice(-5) // Últimas 5 mensagens
  .map((msg) => `${msg.papel === "usuario" ? "Cliente" : "Você"}: ${msg.conteudo}`)
  .join("\n")}

Responda de forma amigável, profissional e concisa. Se o cliente perguntar sobre serviços, forneça informações claras. Se quiser agendar, solicite os detalhes necessários.`;

    const resposta = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: promptSistema,
        },
        {
          role: "user",
          content: mensagem,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const conteudoResposta =
      resposta.choices[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

    return {
      resposta: conteudoResposta,
    };
  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : String(erro);
    console.error("[ChatGPT] Erro ao processar mensagem:", mensagemErro);
    return {
      resposta:
        "Desculpe, estou com dificuldades no momento. Por favor, tente novamente mais tarde.",
      erro: mensagemErro,
    };
  }
}

/**
 * Analisar intenção da mensagem
 */
export async function analisarIntencao(
  mensagem: string
): Promise<{
  intencao: "consulta" | "agendamento" | "reclamacao" | "outro";
  confianca: number;
}> {
  try {
    const resposta = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Analise a intenção da mensagem e responda com JSON válido.
Intenções possíveis: "consulta", "agendamento", "reclamacao", "outro"
Responda APENAS com JSON: {"intencao": "...", "confianca": 0-100}`,
        },
        {
          role: "user",
          content: mensagem,
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    const conteudo = resposta.choices[0]?.message?.content || "{}";
    const resultado = JSON.parse(conteudo);

    return {
      intencao: resultado.intencao || "outro",
      confianca: resultado.confianca || 0,
    };
  } catch (erro) {
    console.error("[ChatGPT] Erro ao analisar intenção:", erro);
    return {
      intencao: "outro",
      confianca: 0,
    };
  }
}

/**
 * Gerar resposta de agendamento
 */
export async function gerarRespostaAgendamento(
  servico: string,
  data?: string,
  horario?: string
): Promise<string> {
  try {
    const resposta = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente de agendamento da Transblindados. Gere uma mensagem confirmando o agendamento de forma profissional e amigável.",
        },
        {
          role: "user",
          content: `Gere uma mensagem de confirmação para: Serviço: ${servico}, Data: ${data || "a definir"}, Horário: ${horario || "a definir"}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    return resposta.choices[0]?.message?.content || "Agendamento realizado com sucesso!";
  } catch (erro) {
    console.error("[ChatGPT] Erro ao gerar resposta de agendamento:", erro);
    return "Seu agendamento foi registrado. Entraremos em contato para confirmar os detalhes.";
  }
}

export default openai;
