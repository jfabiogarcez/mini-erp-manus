import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("Aprendizados", () => {
  it("deve criar um novo aprendizado", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.aprendizados.create({
      titulo: "Categorizar transportes automaticamente",
      descricao: "Quando a descrição contém 'transporte', categorizar como Transporte",
      categoria: "Registros",
      confianca: 85,
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("deve listar aprendizados", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const aprendizados = await caller.aprendizados.listAll();

    expect(Array.isArray(aprendizados)).toBe(true);
  });

  it("deve validar campos obrigatórios ao criar aprendizado", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Zod validação - titulo vazio deve falhar
    try {
      await caller.aprendizados.create({
        titulo: "",
        descricao: "Teste",
      });
      expect.fail("Deveria ter lançado erro");
    } catch (error: any) {
      expect(error.message).toContain("Too small");
    }
  });
});

describe("Modelos", () => {
  it("deve criar um novo modelo", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.modelos.create({
      nome: "Orçamento Padrão",
      descricao: "Modelo de orçamento para serviços",
      categoria: "Orçamento",
      arquivoUrl: "https://example.com/modelo.docx",
      arquivoNome: "modelo.docx",
      tipoArquivo: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("deve listar modelos", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const modelos = await caller.modelos.listAll();

    expect(Array.isArray(modelos)).toBe(true);
  });

  it("deve validar categoria ao criar modelo", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.modelos.create({
        nome: "Teste",
        categoria: "CategoriaInvalida" as any,
        arquivoUrl: "https://example.com/test.pdf",
      })
    ).rejects.toThrow();
  });
});

describe("Toggle IA", () => {
  it("deve alternar o estado da IA", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ia.toggle();

    expect(result).toHaveProperty("iaLigada");
    expect(result).toHaveProperty("mensagem");
    expect(typeof result.iaLigada).toBe("boolean");
    expect(typeof result.mensagem).toBe("string");
  });

  it("deve obter configuração da IA", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const config = await caller.ia.getConfig();

    expect(config).toBeTruthy();
    if (config) {
      expect(config).toHaveProperty("iaLigada");
      expect([0, 1]).toContain(config.iaLigada);
    }
  });

  it("deve obter estatísticas da IA", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.ia.getEstatisticas();

    expect(stats).toBeTruthy();
    if (stats) {
      expect(stats).toHaveProperty("iaLigada");
      expect(stats).toHaveProperty("totalAcoesRegistradas");
      expect(stats).toHaveProperty("totalPadroesAprendidos");
      expect(typeof stats.iaLigada).toBe("boolean");
      expect(typeof stats.totalAcoesRegistradas).toBe("number");
      expect(typeof stats.totalPadroesAprendidos).toBe("number");
    }
  });
});
