import { describe, expect, it, beforeAll } from "vitest";
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

describe("Registros CRUD", () => {
  const ctx = createTestContext();
  const caller = appRouter.createCaller(ctx);
  let createdId: number;

  it("deve criar um novo registro", async () => {
    const result = await caller.registros.create({
      assunto: "Teste de Registro",
      categoria: "Missão/Viagem",
      clienteFornecedor: "Cliente Teste",
      nDocumentoPedido: "DOC-001",
      valorTotal: 10000, // R$ 100,00
      status: "Pendente",
      observacoes: "Registro de teste",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    createdId = result.id;
  });

  it("deve listar registros", async () => {
    const registros = await caller.registros.list();
    expect(Array.isArray(registros)).toBe(true);
    expect(registros.length).toBeGreaterThan(0);
  });

  it("deve buscar um registro por ID", async () => {
    const registro = await caller.registros.getById({ id: createdId });
    expect(registro).toBeDefined();
    expect(registro?.assunto).toBe("Teste de Registro");
    expect(registro?.categoria).toBe("Missão/Viagem");
  });

  it("deve atualizar um registro", async () => {
    const result = await caller.registros.update({
      id: createdId,
      status: "Pago",
      observacoes: "Registro atualizado",
    });

    expect(result.success).toBe(true);

    const updated = await caller.registros.getById({ id: createdId });
    expect(updated?.status).toBe("Pago");
    expect(updated?.observacoes).toBe("Registro atualizado");
  });

  it("deve deletar um registro", async () => {
    const result = await caller.registros.delete({ id: createdId });
    expect(result.success).toBe(true);

    const deleted = await caller.registros.getById({ id: createdId });
    expect(deleted).toBeUndefined();
  });
});

describe("Tarefas CRUD", () => {
  const ctx = createTestContext();
  const caller = appRouter.createCaller(ctx);
  let createdId: number;

  it("deve criar uma nova tarefa", async () => {
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 7);

    const result = await caller.tarefas.create({
      titulo: "Tarefa de Teste",
      descricao: "Descrição da tarefa de teste",
      dataVencimento,
      status: "Pendente",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
    createdId = result.id;
  });

  it("deve listar tarefas", async () => {
    const tarefas = await caller.tarefas.list();
    expect(Array.isArray(tarefas)).toBe(true);
    expect(tarefas.length).toBeGreaterThan(0);
  });

  it("deve buscar uma tarefa por ID", async () => {
    const tarefa = await caller.tarefas.getById({ id: createdId });
    expect(tarefa).toBeDefined();
    expect(tarefa?.titulo).toBe("Tarefa de Teste");
  });

  it("deve atualizar uma tarefa", async () => {
    const result = await caller.tarefas.update({
      id: createdId,
      status: "Concluída",
    });

    expect(result.success).toBe(true);

    const updated = await caller.tarefas.getById({ id: createdId });
    expect(updated?.status).toBe("Concluída");
  });

  it("deve deletar uma tarefa", async () => {
    const result = await caller.tarefas.delete({ id: createdId });
    expect(result.success).toBe(true);

    const deleted = await caller.tarefas.getById({ id: createdId });
    expect(deleted).toBeUndefined();
  });
});
