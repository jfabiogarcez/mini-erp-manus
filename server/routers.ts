import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
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
});

export type AppRouter = typeof appRouter;
