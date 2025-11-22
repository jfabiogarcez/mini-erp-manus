import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Drag-and-Drop de Missões", () => {
  it("deve permitir atualizar a data de uma missão", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Criar uma missão com timestamp único
    const timestamp = Date.now();
    const missao = await caller.missoes.create({
      data: new Date("2025-12-01"),
      cliente: `Cliente Teste ${timestamp}`,
      servico: "Transporte Executivo",
      status: "Agendada",
    });

    // Atualizar a data (simular drag-and-drop)
    const novaData = new Date("2025-12-05");
    const resultado = await caller.missoes.update({
      id: missao.id,
      data: novaData,
    });

    expect(resultado.success).toBe(true);
  });

  it("deve validar que o ID da missão é obrigatório", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.missoes.update({
        // @ts-expect-error - testando validação
        data: new Date(),
      })
    ).rejects.toThrow();
  });
});

describe("Sistema de Notificações", () => {
  it("deve verificar notificações de missões sem erro", async () => {
    const { verificarNotificacoesMissoes } = await import("./notificationSystem");
    const resultado = await verificarNotificacoesMissoes();

    expect(resultado).toHaveProperty("agendadas");
    expect(resultado).toHaveProperty("total");
    expect(typeof resultado.agendadas).toBe("number");
  });

  it("deve verificar notificações de multas sem erro", async () => {
    const { verificarNotificacoesMultas } = await import("./notificationSystem");
    const resultado = await verificarNotificacoesMultas();

    expect(resultado).toHaveProperty("agendadas");
    expect(resultado).toHaveProperty("total");
    expect(typeof resultado.agendadas).toBe("number");
  });

  it("deve executar verificação completa de notificações", async () => {
    const { executarVerificacaoNotificacoes } = await import("./notificationSystem");
    const resultado = await executarVerificacaoNotificacoes();

    expect(resultado).toHaveProperty("missoes");
    expect(resultado).toHaveProperty("multas");
    expect(resultado).toHaveProperty("envio");
    expect(resultado.missoes).toHaveProperty("agendadas");
    expect(resultado.multas).toHaveProperty("agendadas");
    expect(resultado.envio).toHaveProperty("enviadas");
  });

  it("deve enviar notificações agendadas sem erro", async () => {
    const { enviarNotificacoesAgendadas } = await import("./notificationSystem");
    const resultado = await enviarNotificacoesAgendadas();

    expect(resultado).toHaveProperty("enviadas");
    expect(resultado).toHaveProperty("total");
    expect(typeof resultado.enviadas).toBe("number");
  });
});

describe("Página de Missões", () => {
  it("deve listar todas as missões", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const missoes = await caller.missoes.list();
    expect(Array.isArray(missoes)).toBe(true);
  });

  it("deve criar uma missão com todos os campos", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const timestamp = Date.now();
    const missao = await caller.missoes.create({
      data: new Date("2025-12-10"),
      cliente: `Cliente Completo ${timestamp}`,
      servico: "Escolta Armada",
      origem: "São Paulo",
      destino: "Rio de Janeiro",
      motorista: "João Silva",
      veiculo: "Blindado X",
      veiculoPlaca: "ABC-1234",
      valor: 150000, // R$ 1.500,00
      status: "Agendada",
      horaInicio: "08:00",
      horaFim: "18:00",
      observacoes: "Missão de alta prioridade",
    });

    expect(missao).toHaveProperty("id");
    expect(missao.cliente).toContain("Cliente Completo");
    expect(missao.servico).toBe("Escolta Armada");
  });

  it("deve buscar missão por ID", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Criar missão
    const timestamp = Date.now();
    const novaMissao = await caller.missoes.create({
      data: new Date("2025-12-15"),
      cliente: `Cliente Busca ${timestamp}`,
      status: "Agendada",
    });

    // Buscar por ID
    const missaoEncontrada = await caller.missoes.getById({ id: novaMissao.id });
    expect(missaoEncontrada).toBeDefined();
    expect(missaoEncontrada?.cliente).toContain("Cliente Busca");
  });

  it("deve excluir uma missão", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Criar missão
    const timestamp = Date.now();
    const missao = await caller.missoes.create({
      data: new Date("2025-12-20"),
      cliente: `Cliente Delete ${timestamp}`,
      status: "Agendada",
    });

    // Excluir
    const resultado = await caller.missoes.delete({ id: missao.id });
    expect(resultado.success).toBe(true);
  });
});
