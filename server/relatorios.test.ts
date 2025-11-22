import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "sample-user",
    email: "sample@example.com",
    name: "Sample User",
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

describe("relatorios", () => {
  it("deve listar todos os relatórios", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.relatorios.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("deve validar tipo de relatório ao gerar", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.relatorios.gerar({
        tipo: "Missões",
        mes: 1,
        ano: 2024,
      })
    ).resolves.toBeDefined();
  });

  it("deve validar mês entre 1 e 12", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.relatorios.gerar({
        tipo: "Missões",
        mes: 13, // Inválido
        ano: 2024,
      })
    ).rejects.toThrow();
  });

  it("deve validar ano entre 2020 e 2100", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.relatorios.gerar({
        tipo: "Missões",
        mes: 1,
        ano: 2019, // Inválido
      })
    ).rejects.toThrow();
  });

  it("deve retornar relatório existente se já foi gerado", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Gerar relatório pela primeira vez
    const result1 = await caller.relatorios.gerar({
      tipo: "Missões",
      mes: 1,
      ano: 2024,
    });

    expect(result1.success).toBe(true);
    expect(result1.relatorioId).toBeDefined();

    // Tentar gerar novamente
    const result2 = await caller.relatorios.gerar({
      tipo: "Missões",
      mes: 1,
      ano: 2024,
    });

    expect(result2.success).toBe(true);
    expect(result2.mensagem).toContain("já existe");
    expect(result2.relatorioId).toBe(result1.relatorioId);
  });

  it("deve gerar relatório de multas", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.relatorios.gerar({
      tipo: "Multas",
      mes: 2,
      ano: 2024,
    });

    expect(result.success).toBe(true);
    expect(result.arquivoUrl).toBeDefined();
    expect(result.arquivoUrl).toContain(".pdf");
  });

  it("deve gerar relatório consolidado", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.relatorios.gerar({
      tipo: "Consolidado",
      mes: 3,
      ano: 2024,
    });

    expect(result.success).toBe(true);
    expect(result.arquivoUrl).toBeDefined();
  });

  it("deve filtrar relatórios por tipo", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Gerar alguns relatórios
    await caller.relatorios.gerar({
      tipo: "Missões",
      mes: 4,
      ano: 2024,
    });

    await caller.relatorios.gerar({
      tipo: "Multas",
      mes: 4,
      ano: 2024,
    });

    // Filtrar por tipo
    const missoes = await caller.relatorios.getByTipo({ tipo: "Missões" });
    const multas = await caller.relatorios.getByTipo({ tipo: "Multas" });

    expect(Array.isArray(missoes)).toBe(true);
    expect(Array.isArray(multas)).toBe(true);
    
    // Verificar se os tipos estão corretos
    if (missoes.length > 0) {
      expect(missoes[0]?.tipo).toBe("Missões");
    }
    if (multas.length > 0) {
      expect(multas[0]?.tipo).toBe("Multas");
    }
  });
});

describe("agregação de dados", () => {
  it("deve agregar dados de missões mensais", async () => {
    const { agregarDadosMissoesMensal } = await import("./db");

    const dados = await agregarDadosMissoesMensal(1, 2024);

    expect(dados).toBeDefined();
    expect(dados.periodo).toEqual({ mes: 1, ano: 2024 });
    expect(typeof dados.total).toBe("number");
    expect(typeof dados.receitaTotal).toBe("number");
    expect(dados.porStatus).toBeDefined();
    expect(Array.isArray(dados.rankingMotoristas)).toBe(true);
  });

  it("deve agregar dados de multas mensais", async () => {
    const { agregarDadosMultasMensal } = await import("./db");

    const dados = await agregarDadosMultasMensal(1, 2024);

    expect(dados).toBeDefined();
    expect(dados.periodo).toEqual({ mes: 1, ano: 2024 });
    expect(typeof dados.total).toBe("number");
    expect(typeof dados.valorTotal).toBe("number");
    expect(dados.porStatus).toBeDefined();
    expect(Array.isArray(dados.rankingVeiculos)).toBe(true);
  });

  it("deve calcular receita média corretamente", async () => {
    const { agregarDadosMissoesMensal } = await import("./db");

    const dados = await agregarDadosMissoesMensal(1, 2024);

    if (dados.total > 0) {
      expect(dados.receitaMedia).toBe(Math.round(dados.receitaTotal / dados.total));
    } else {
      expect(dados.receitaMedia).toBe(0);
    }
  });

  it("deve calcular valor médio de multa corretamente", async () => {
    const { agregarDadosMultasMensal } = await import("./db");

    const dados = await agregarDadosMultasMensal(1, 2024);

    if (dados.total > 0) {
      expect(dados.valorMedio).toBe(Math.round(dados.valorTotal / dados.total));
    } else {
      expect(dados.valorMedio).toBe(0);
    }
  });
});
