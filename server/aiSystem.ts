import { getDb } from "./db";
import { configuracaoIA, acoesUsuario, padroesAprendidos, InsertAcaoUsuario, InsertPadraoAprendido } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "./_core/llm";

/**
 * Obtém a configuração atual da IA
 */
export async function getConfiguracaoIA() {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(configuracaoIA).limit(1);
  
  // Se não existir, criar configuração padrão
  if (result.length === 0) {
    await db.insert(configuracaoIA).values({
      iaLigada: 0,
      confiancaMinima: 80,
    });
    return { id: 1, iaLigada: 0, confiancaMinima: 80, updatedAt: new Date() };
  }
  
  return result[0];
}

/**
 * Alterna o estado da IA (liga/desliga)
 */
export async function toggleIA(): Promise<{ iaLigada: boolean; mensagem: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const config = await getConfiguracaoIA();
  if (!config) throw new Error("Configuração da IA não encontrada");
  
  const novoEstado = config.iaLigada === 0 ? 1 : 0;
  
  await db.update(configuracaoIA)
    .set({ iaLigada: novoEstado })
    .where(eq(configuracaoIA.id, config.id));
  
  return {
    iaLigada: novoEstado === 1,
    mensagem: novoEstado === 1 
      ? "IA ativada! Executando ações automaticamente com base nos padrões aprendidos." 
      : "IA desativada. Modo de aprendizado ativado - registrando suas ações.",
  };
}

/**
 * Registra uma ação do usuário para aprendizado
 */
export async function registrarAcaoUsuario(acao: Omit<InsertAcaoUsuario, "createdAt">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(acoesUsuario).values(acao);
  const acaoId = Number((result as any).insertId);
  
  // Analisar padrões após registrar a ação
  await analisarPadroes();
  
  return acaoId;
}

/**
 * Analisa ações do usuário e identifica padrões usando LLM
 */
async function analisarPadroes(): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  // Buscar últimas 50 ações
  const acoes = await db.select().from(acoesUsuario).limit(50).orderBy(acoesUsuario.createdAt);
  
  if (acoes.length < 5) return; // Precisa de pelo menos 5 ações para identificar padrões
  
  // Usar LLM para identificar padrões
  const prompt = `
Analise as seguintes ações do usuário em um sistema de gerenciamento e identifique padrões recorrentes:

${acoes.map((a, i) => `${i + 1}. Tipo: ${a.tipoAcao}, Contexto: ${a.contexto}`).join("\n")}

Identifique padrões como:
- Regras de categorização (ex: sempre categoriza "transporte" quando tem palavra-chave X)
- Regras de agendamento (ex: sempre agenda para 3 dias após criação)
- Regras de priorização (ex: sempre marca como urgente quando valor > Y)

Retorne em formato JSON:
{
  "padroes": [
    {
      "tipoPadrao": "regra_categorizacao",
      "condicao": { "campo": "descricao", "contem": "palavra-chave" },
      "acao": { "tipo": "definir_categoria", "valor": "Transporte" },
      "confianca": 85
    }
  ]
}
`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "Você é um assistente que identifica padrões em ações de usuários." },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "padroes_identificados",
          strict: true,
          schema: {
            type: "object",
            properties: {
              padroes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    tipoPadrao: { type: "string" },
                    condicao: { type: "object" },
                    acao: { type: "object" },
                    confianca: { type: "number" },
                  },
                  required: ["tipoPadrao", "condicao", "acao", "confianca"],
                  additionalProperties: false,
                },
              },
            },
            required: ["padroes"],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0]?.message?.content;
    if (typeof messageContent === "string") {
      const resultado = JSON.parse(messageContent);
      
      // Salvar padrões identificados
      for (const padrao of resultado.padroes) {
        // Verificar se padrão similar já existe
        const existentes = await db.select().from(padroesAprendidos)
          .where(eq(padroesAprendidos.tipoPadrao, padrao.tipoPadrao));
        
        const padraoSimilar = existentes.find(p => 
          JSON.stringify(JSON.parse(p.condicao)) === JSON.stringify(padrao.condicao)
        );
        
        if (padraoSimilar) {
          // Atualizar confiança do padrão existente
          const novaConfianca = Math.min(100, padraoSimilar.confianca + 5);
          await db.update(padroesAprendidos)
            .set({ confianca: novaConfianca })
            .where(eq(padroesAprendidos.id, padraoSimilar.id));
        } else {
          // Criar novo padrão
          await db.insert(padroesAprendidos).values({
            tipoPadrao: padrao.tipoPadrao,
            condicao: JSON.stringify(padrao.condicao),
            acao: JSON.stringify(padrao.acao),
            confianca: padrao.confianca,
            vezesAplicado: 0,
            vezesCorreto: 0,
            ativo: 1,
          });
        }
      }
    }
  } catch (error) {
    console.error("[AI System] Erro ao analisar padrões:", error);
  }
}

/**
 * Obtém todos os padrões aprendidos
 */
export async function getPadroesAprendidos() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(padroesAprendidos)
    .where(eq(padroesAprendidos.ativo, 1))
    .orderBy(padroesAprendidos.confianca);
}

/**
 * Executa ação automática baseada em padrões aprendidos
 */
export async function executarAcaoAutomatica(contexto: any): Promise<{
  executado: boolean;
  acao?: any;
  padraoId?: number;
  confianca?: number;
}> {
  const config = await getConfiguracaoIA();
  
  // Se IA está desligada, não executar
  if (!config || config.iaLigada === 0) {
    return { executado: false };
  }
  
  const padroes = await getPadroesAprendidos();
  
  // Buscar padrão que se aplica ao contexto
  for (const padrao of padroes) {
    if (padrao.confianca < config.confiancaMinima) continue;
    
    const condicao = JSON.parse(padrao.condicao);
    
    // Verificar se condição se aplica
    if (verificarCondicao(contexto, condicao)) {
      const acao = JSON.parse(padrao.acao);
      
      // Incrementar contador de aplicações
      const db = await getDb();
      if (db) {
        await db.update(padroesAprendidos)
          .set({ vezesAplicado: padrao.vezesAplicado + 1 })
          .where(eq(padroesAprendidos.id, padrao.id));
      }
      
      return {
        executado: true,
        acao,
        padraoId: padrao.id,
        confianca: padrao.confianca,
      };
    }
  }
  
  return { executado: false };
}

/**
 * Verifica se uma condição se aplica a um contexto
 */
function verificarCondicao(contexto: any, condicao: any): boolean {
  // Implementação simplificada - pode ser expandida
  if (condicao.campo && condicao.contem) {
    const valor = contexto[condicao.campo];
    if (typeof valor === "string") {
      return valor.toLowerCase().includes(condicao.contem.toLowerCase());
    }
  }
  
  if (condicao.campo && condicao.igual) {
    return contexto[condicao.campo] === condicao.igual;
  }
  
  if (condicao.campo && condicao.maior_que) {
    return contexto[condicao.campo] > condicao.maior_que;
  }
  
  return false;
}

/**
 * Marca um padrão como correto (feedback positivo)
 */
export async function marcarPadraoCorreto(padraoId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const padrao = await db.select().from(padroesAprendidos)
    .where(eq(padroesAprendidos.id, padraoId))
    .limit(1);
  
  if (padrao.length > 0) {
    const p = padrao[0];
    const novaConfianca = Math.min(100, Math.round((p.vezesCorreto + 1) / (p.vezesAplicado + 1) * 100));
    
    await db.update(padroesAprendidos)
      .set({ 
        vezesCorreto: p.vezesCorreto + 1,
        confianca: novaConfianca,
      })
      .where(eq(padroesAprendidos.id, padraoId));
  }
}

/**
 * Obtém estatísticas da IA
 */
export async function getEstatisticasIA() {
  const db = await getDb();
  if (!db) return null;
  
  const config = await getConfiguracaoIA();
  const padroes = await getPadroesAprendidos();
  const totalAcoes = await db.select().from(acoesUsuario);
  
  const padroesAltaConfianca = padroes.filter(p => p.confianca >= 80).length;
  const padroesMediaConfianca = padroes.filter(p => p.confianca >= 50 && p.confianca < 80).length;
  const padroesBaixaConfianca = padroes.filter(p => p.confianca < 50).length;
  
  return {
    iaLigada: config?.iaLigada === 1,
    totalAcoesRegistradas: totalAcoes.length,
    totalPadroesAprendidos: padroes.length,
    padroesAltaConfianca,
    padroesMediaConfianca,
    padroesBaixaConfianca,
    confiancaMinima: config?.confiancaMinima || 80,
  };
}
