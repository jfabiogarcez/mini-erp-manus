import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  registros: router({
    list: publicProcedure.query(async () => {
      const { getAllRegistros } = await import("./db");
      return getAllRegistros();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const { getRegistroById } = await import("./db");
      return getRegistroById(input.id);
    }),
    create: publicProcedure
      .input(
        z.object({
          assunto: z.string(),
          categoria: z.string(),
          clienteFornecedor: z.string().optional(),
          nDocumentoPedido: z.string().optional(),
          dataDocumento: z.date().optional(),
          dataVencimento: z.date().optional(),
          valorTotal: z.number().default(0),
          status: z.string().default("Pendente"),
          origemArquivo: z.string().optional(),
          origemAba: z.string().optional(),
          observacoes: z.string().optional(),
          chaveAgrupamento: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { createRegistro } = await import("./db");
        const id = await createRegistro(input);
        return { id };
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          assunto: z.string().optional(),
          categoria: z.string().optional(),
          clienteFornecedor: z.string().optional(),
          nDocumentoPedido: z.string().optional(),
          dataDocumento: z.date().optional(),
          dataVencimento: z.date().optional(),
          valorTotal: z.number().optional(),
          status: z.string().optional(),
          origemArquivo: z.string().optional(),
          origemAba: z.string().optional(),
          observacoes: z.string().optional(),
          chaveAgrupamento: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updateRegistro } = await import("./db");
        const { id, ...data } = input;
        await updateRegistro(id, data);
        return { success: true };
      }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const { deleteRegistro } = await import("./db");
      await deleteRegistro(input.id);
      return { success: true };
    }),
  }),
  notificacoes: router({
    verificarTarefasProximas: publicProcedure
      .input(z.object({ diasAntecedencia: z.number().optional() }))
      .mutation(async ({ input }) => {
        const { verificarTarefasProximasVencimento } = await import("./notifications");
        return verificarTarefasProximasVencimento(input.diasAntecedencia);
      }),
  }),
  ia: router({
    getConfig: publicProcedure.query(async () => {
      const { getConfiguracaoIA } = await import("./aiSystem");
      return getConfiguracaoIA();
    }),
    toggle: publicProcedure.mutation(async () => {
      const { toggleIA } = await import("./aiSystem");
      return toggleIA();
    }),
    getPadroes: publicProcedure.query(async () => {
      const { getPadroesAprendidos } = await import("./aiSystem");
      return getPadroesAprendidos();
    }),
    getEstatisticas: publicProcedure.query(async () => {
      const { getEstatisticasIA } = await import("./aiSystem");
      return getEstatisticasIA();
    }),
    marcarCorreto: publicProcedure
      .input(z.object({ padraoId: z.number() }))
      .mutation(async ({ input }) => {
        const { marcarPadraoCorreto } = await import("./aiSystem");
        await marcarPadraoCorreto(input.padraoId);
        return { success: true };
      }),
  }),
  missoes: router({
    list: publicProcedure.query(async () => {
      const { getAllMissoes } = await import("./db");
      return getAllMissoes();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const { getMissaoById } = await import("./db");
      return getMissaoById(input.id);
    }),
    getByCodigo: publicProcedure.input(z.object({ codigoMissao: z.string() })).query(async ({ input }) => {
      const { getMissaoByCodigo } = await import("./db");
      return getMissaoByCodigo(input.codigoMissao);
    }),
    create: publicProcedure
      .input(
        z.object({
          cliente: z.string().optional(),
          motorista: z.string().optional(),
          dataInicio: z.date().optional(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { createMissao, getMissaoById } = await import("./db");
        const id = await createMissao(input);
        return await getMissaoById(id);
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          cliente: z.string().optional(),
          motorista: z.string().optional(),
          status: z.enum(["Pendente", "Em Andamento", "Concluída", "Cancelada"]).optional(),
          dataFim: z.date().optional(),
          observacoes: z.string().optional(),
          linkGoogleDrive: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updateMissao } = await import("./db");
        const { id, ...data } = input;
        await updateMissao(id, data);
        return { success: true };
      }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const { deleteMissao } = await import("./db");
      await deleteMissao(input.id);
      return { success: true };
    }),
    getArquivos: publicProcedure.input(z.object({ missaoId: z.number() })).query(async ({ input }) => {
      const { getArquivosByMissaoId } = await import("./db");
      return getArquivosByMissaoId(input.missaoId);
    }),
  }),
  tarefas: router({
    list: publicProcedure.query(async () => {
      const { getAllTarefas } = await import("./db");
      return getAllTarefas();
    }),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      const { getTarefaById } = await import("./db");
      return getTarefaById(input.id);
    }),
    create: publicProcedure
      .input(
        z.object({
          titulo: z.string(),
          descricao: z.string().optional(),
          dataVencimento: z.date(),
          status: z.string().default("Pendente"),
          registroId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { createTarefa } = await import("./db");
        const id = await createTarefa(input);
        return { id };
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.number(),
          titulo: z.string().optional(),
          descricao: z.string().optional(),
          dataVencimento: z.date().optional(),
          status: z.string().optional(),
          registroId: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { updateTarefa } = await import("./db");
        const { id, ...data } = input;
        await updateTarefa(id, data);
        return { success: true };
      }),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      const { deleteTarefa } = await import("./db");
      await deleteTarefa(input.id);
      return { success: true };
    }),
  }),
  equipe: router({
    uploadExcel: protectedProcedure
      .input(z.object({
        fileUrl: z.string(),
      }))
      .mutation(async ({ input }) => {
        // TODO: Implementar leitura do Excel e cadastro em massa
        // Por enquanto, retorna sucesso
        return { success: true, message: "Funcionalidade será implementada em breve" };
      }),
    listAll: protectedProcedure.query(async () => {
      const { getAllMembrosEquipe } = await import("./db");
      return getAllMembrosEquipe();
    }),
    listByTipo: protectedProcedure
      .input(z.enum(["Motorista", "Segurança", "Receptivo"]))
      .query(async ({ input }) => {
        const { getMembrosByTipo } = await import("./db");
        return getMembrosByTipo(input);
      }),
    create: protectedProcedure
      .input(z.object({
        nome: z.string(),
        fotoUrl: z.string().optional(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        whatsapp: z.string().optional(),
        cpf: z.string().optional(),
        tipo: z.enum(["Motorista", "Segurança", "Receptivo"]),
        dadosBancarios: z.string().optional(),
        chavePix: z.string().optional(),
        endereco: z.string().optional(),
        documentos: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createMembroEquipe } = await import("./db");
        const id = await createMembroEquipe(input);
        return { id, success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        fotoUrl: z.string().optional(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
        whatsapp: z.string().optional(),
        cpf: z.string().optional(),
        tipo: z.enum(["Motorista", "Segurança", "Receptivo"]).optional(),
        dadosBancarios: z.string().optional(),
        chavePix: z.string().optional(),
        endereco: z.string().optional(),
        documentos: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const { updateMembroEquipe } = await import("./db");
        await updateMembroEquipe(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteMembroEquipe } = await import("./db");
        await deleteMembroEquipe(input.id);
        return { success: true };
      }),
  }),

  multas: router({
    listAll: protectedProcedure.query(async () => {
      const { getAllMultas } = await import("./db");
      return getAllMultas();
    }),
    create: protectedProcedure
      .input(z.object({
        numeroAuto: z.string().optional(),
        dataInfracao: z.date().optional(),
        horaInfracao: z.string().optional(),
        localInfracao: z.string().optional(),
        codigoInfracao: z.string().optional(),
        descricaoInfracao: z.string().optional(),
        valor: z.number().optional(),
        pontos: z.number().optional(),
        veiculoPlaca: z.string().optional(),
        motoristaId: z.number().optional(),
        dataVencimento: z.date().optional(),
        status: z.enum(["Pendente", "Pago", "Recorrido", "Cancelado"]).optional(),
        pdfUrl: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { createMulta } = await import("./db");
        const id = await createMulta(input);
        return { id };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        numeroAuto: z.string().optional(),
        dataInfracao: z.date().optional(),
        horaInfracao: z.string().optional(),
        localInfracao: z.string().optional(),
        codigoInfracao: z.string().optional(),
        descricaoInfracao: z.string().optional(),
        valor: z.number().optional(),
        pontos: z.number().optional(),
        veiculoPlaca: z.string().optional(),
        motoristaId: z.number().optional(),
        dataVencimento: z.date().optional(),
        status: z.enum(["Pendente", "Pago", "Recorrido", "Cancelado"]).optional(),
        pdfUrl: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const { updateMulta } = await import("./db");
        await updateMulta(id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deleteMulta } = await import("./db");
        await deleteMulta(input.id);
        return { success: true };
      }),
    extractFromPDF: protectedProcedure
      .input(z.object({ pdfUrl: z.string() }))
      .mutation(async ({ input }) => {
        const { extractMultaFromPDF } = await import("./pdfExtractor");
        const data = await extractMultaFromPDF(undefined, input.pdfUrl);
        return data;
      }),
  }),
});

export type AppRouter = typeof appRouter;
