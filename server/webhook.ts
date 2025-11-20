import { Router } from "express";
import { createRegistro, getRegistroByChaveAgrupamento, updateRegistro, createTarefa } from "./db";

const router = Router();

/**
 * Webhook público para receber dados do Manus.
 * POST /api/webhook/consolidar
 * 
 * Body esperado:
 * {
 *   "registros": [
 *     {
 *       "assunto": "string",
 *       "categoria": "string",
 *       "clienteFornecedor": "string",
 *       "nDocumentoPedido": "string",
 *       "dataDocumento": "ISO 8601 string",
 *       "dataVencimento": "ISO 8601 string",
 *       "valorTotal": number (em centavos),
 *       "status": "string",
 *       "origemArquivo": "string",
 *       "origemAba": "string",
 *       "observacoes": "string"
 *     }
 *   ]
 * }
 */
router.post("/consolidar", async (req, res) => {
  try {
    const { registros } = req.body;

    if (!registros || !Array.isArray(registros)) {
      return res.status(400).json({
        success: false,
        error: "O campo 'registros' deve ser um array.",
      });
    }

    const resultados = [];

    for (const registro of registros) {
      try {
        // 1. Gerar chave de agrupamento
        const chaveAgrupamento = `${registro.clienteFornecedor || ""}_${registro.nDocumentoPedido || ""}`;

        // 2. Verificar se já existe um registro com essa chave
        const existente = await getRegistroByChaveAgrupamento(chaveAgrupamento);

        let registroId: number;

        if (existente) {
          // Atualizar registro existente
          await updateRegistro(existente.id, {
            ...registro,
            dataDocumento: registro.dataDocumento ? new Date(registro.dataDocumento) : undefined,
            dataVencimento: registro.dataVencimento ? new Date(registro.dataVencimento) : undefined,
            chaveAgrupamento,
          });
          registroId = existente.id;
          resultados.push({
            chaveAgrupamento,
            acao: "atualizado",
            registroId,
          });
        } else {
          // Criar novo registro
          registroId = await createRegistro({
            ...registro,
            dataDocumento: registro.dataDocumento ? new Date(registro.dataDocumento) : undefined,
            dataVencimento: registro.dataVencimento ? new Date(registro.dataVencimento) : undefined,
            chaveAgrupamento,
          });
          resultados.push({
            chaveAgrupamento,
            acao: "criado",
            registroId,
          });
        }

        // 3. Criar tarefa automática se houver data de vencimento
        if (registro.dataVencimento) {
          const dataVencimento = new Date(registro.dataVencimento);
          const titulo = `[${registro.categoria}] – ${registro.nDocumentoPedido || "Sem Nº"} – ${registro.clienteFornecedor || "Sem Cliente"}`;
          const descricao = `Assunto: ${registro.assunto}\nValor: R$ ${(registro.valorTotal / 100).toFixed(2)}\nStatus: ${registro.status}`;

          await createTarefa({
            titulo,
            descricao,
            dataVencimento,
            status: "Pendente",
            registroId,
          });
        }
      } catch (error) {
        console.error("Erro ao processar registro:", error);
        resultados.push({
          chaveAgrupamento: `${registro.clienteFornecedor || ""}_${registro.nDocumentoPedido || ""}`,
          acao: "erro",
          erro: error instanceof Error ? error.message : "Erro desconhecido",
        });
      }
    }

    return res.json({
      success: true,
      totalProcessados: registros.length,
      resultados,
    });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro interno do servidor",
    });
  }
});

export default router;
