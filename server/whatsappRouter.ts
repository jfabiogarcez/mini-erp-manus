import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { enviarMensagemWhatsApp, formatarTelefoneWhatsApp } from "./twilioService";
import { processarMensagemComContexto, analisarIntencao } from "./chatgptService";
import { getDb } from "./db";
import { conversasWhatsapp, mensagensWhatsapp } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const whatsappRouter = router({
  /**
   * Webhook para receber mensagens do Twilio
   */
  webhook: publicProcedure
    .input(
      z.object({
        From: z.string(),
        To: z.string(),
        Body: z.string(),
        MessageSid: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Extrair número de telefone (remover "whatsapp:")
        const telefonOrigem = input.From.replace("whatsapp:", "");
        const telefoneDestino = input.To.replace("whatsapp:", "");

        // Buscar ou criar conversa
        let conversa = await db
          .select()
          .from(conversasWhatsapp)
          .where(eq(conversasWhatsapp.telefoneContato, telefonOrigem))
          .limit(1);

        let conversaId: number;

        if (conversa.length === 0) {
          // Criar nova conversa
          await db.insert(conversasWhatsapp).values({
            telefoneContato: telefonOrigem,
            tipoContato: "Cliente",
            ultimaMensagem: input.Body,
            dataUltimaMensagem: new Date(),
            ativo: 1,
          });

          // Buscar conversa criada
          const novaConversa = await db
            .select()
            .from(conversasWhatsapp)
            .where(eq(conversasWhatsapp.telefoneContato, telefonOrigem))
            .limit(1);
          conversaId = novaConversa[0]?.id || 0;
        } else {
          conversaId = conversa[0].id;

          // Atualizar última mensagem
          await db
            .update(conversasWhatsapp)
            .set({
              ultimaMensagem: input.Body,
              dataUltimaMensagem: new Date(),
            })
            .where(eq(conversasWhatsapp.id, conversaId));
        }

        // Salvar mensagem recebida
        await db.insert(mensagensWhatsapp).values({
          conversaId,
          telefoneOrigem: telefonOrigem,
          telefoneDestino,
          conteudo: input.Body,
          tipo: "Entrada",
          idTwilio: input.MessageSid,
        });

        // Buscar histórico de mensagens para contexto
        const historico = await db
          .select()
          .from(mensagensWhatsapp)
          .where(eq(mensagensWhatsapp.conversaId, conversaId))
          .limit(10);

        // Processar mensagem com ChatGPT
        const contexto = {
          historico: historico.map((msg) => ({
            papel: msg.tipo === "Entrada" ? ("usuario" as const) : ("assistente" as const),
            conteudo: msg.conteudo,
          })),
          cliente: conversa[0]
            ? {
                nome: conversa[0].nomeContato || "Cliente",
                telefone: conversa[0].telefoneContato,
                tipo: conversa[0].tipoContato,
              }
            : undefined,
          ultimaInteracao: new Date().toLocaleString("pt-BR"),
        };

        const { resposta } = await processarMensagemComContexto(input.Body, contexto);

        // Enviar resposta via Twilio
        const resultadoEnvio = await enviarMensagemWhatsApp(telefonOrigem, resposta);

        if (resultadoEnvio.sucesso) {
          // Salvar resposta no banco
          await db.insert(mensagensWhatsapp).values({
            conversaId,
            telefoneOrigem: telefoneDestino,
            telefoneDestino: telefonOrigem,
            conteudo: resposta,
            tipo: "Saída",
            statusEntrega: "Enviada",
            idTwilio: resultadoEnvio.idMensagem,
          });
        }

        return {
          sucesso: true,
          resposta,
        };
      } catch (erro) {
        const mensagemErro = erro instanceof Error ? erro.message : String(erro);
        console.error("[WhatsApp Webhook] Erro:", mensagemErro);
        return {
          sucesso: false,
          erro: mensagemErro,
        };
      }
    }),

  /**
   * Enviar mensagem manual via WhatsApp
   */
  enviarMensagem: publicProcedure
    .input(
      z.object({
        telefone: z.string(),
        mensagem: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const telefoneFormatado = formatarTelefoneWhatsApp(input.telefone);
        const resultado = await enviarMensagemWhatsApp(telefoneFormatado, input.mensagem);

        if (!resultado.sucesso) {
          throw new Error(resultado.erro);
        }

        return {
          sucesso: true,
          idMensagem: resultado.idMensagem,
        };
      } catch (erro) {
        const mensagemErro = erro instanceof Error ? erro.message : String(erro);
        return {
          sucesso: false,
          erro: mensagemErro,
        };
      }
    }),

  /**
   * Listar conversas WhatsApp
   */
  listarConversas: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conversas = await db
        .select()
        .from(conversasWhatsapp)
        .where(eq(conversasWhatsapp.ativo, 1));

      return conversas;
    } catch (erro) {
      console.error("[WhatsApp] Erro ao listar conversas:", erro);
      return [];
    }
  }),

  /**
   * Obter histórico de conversa
   */
  obterHistorico: publicProcedure
    .input(z.object({ conversaId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const mensagens = await db
          .select()
          .from(mensagensWhatsapp)
          .where(eq(mensagensWhatsapp.conversaId, input.conversaId));

        return mensagens;
      } catch (erro) {
        console.error("[WhatsApp] Erro ao obter histórico:", erro);
        return [];
      }
    }),

  /**
   * Analisar intenção de mensagem
   */
  analisarIntencao: publicProcedure
    .input(z.object({ mensagem: z.string() }))
    .query(async ({ input }) => {
      const resultado = await analisarIntencao(input.mensagem);
      return resultado;
    }),
});
