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
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Sistema de Notificações e Métricas", () => {
  describe("Métricas de Missões", () => {
    it("deve agregar dados de missões mensais", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const resultado = await caller.relatorios.agregarMissoes({
        mes: 11,
        ano: 2025,
      });

      expect(resultado).toHaveProperty("periodo");
      expect(resultado.periodo).toEqual({ mes: 11, ano: 2025 });
      expect(resultado).toHaveProperty("total");
      expect(resultado).toHaveProperty("porStatus");
      expect(resultado.porStatus).toHaveProperty("Agendada");
      expect(resultado.porStatus).toHaveProperty("Em Andamento");
      expect(resultado.porStatus).toHaveProperty("Concluída");
      expect(resultado.porStatus).toHaveProperty("Cancelada");
      expect(resultado).toHaveProperty("receitaTotal");
      expect(resultado).toHaveProperty("receitaMedia");
      expect(resultado).toHaveProperty("rankingMotoristas");
      expect(Array.isArray(resultado.rankingMotoristas)).toBe(true);
    });

    it("deve calcular receita média corretamente", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const resultado = await caller.relatorios.agregarMissoes({
        mes: 11,
        ano: 2025,
      });

      if (resultado.total > 0) {
        const mediaEsperada = Math.round(resultado.receitaTotal / resultado.total);
        expect(resultado.receitaMedia).toBe(mediaEsperada);
      } else {
        expect(resultado.receitaMedia).toBe(0);
      }
    });
  });

  describe("Métricas de Multas", () => {
    it("deve agregar dados de multas mensais", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const resultado = await caller.relatorios.agregarMultas({
        mes: 11,
        ano: 2025,
      });

      expect(resultado).toHaveProperty("periodo");
      expect(resultado.periodo).toEqual({ mes: 11, ano: 2025 });
      expect(resultado).toHaveProperty("total");
      expect(resultado).toHaveProperty("porStatus");
      expect(resultado.porStatus).toHaveProperty("Pendente");
      expect(resultado.porStatus).toHaveProperty("Pago");
      expect(resultado.porStatus).toHaveProperty("Recorrido");
      expect(resultado.porStatus).toHaveProperty("Cancelado");
      expect(resultado).toHaveProperty("valorTotal");
      expect(resultado).toHaveProperty("valorPago");
      expect(resultado).toHaveProperty("valorPendente");
      expect(resultado).toHaveProperty("valorMedio");
    });

    it("deve calcular valor médio corretamente", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const resultado = await caller.relatorios.agregarMultas({
        mes: 11,
        ano: 2025,
      });

      if (resultado.total > 0) {
        const mediaEsperada = Math.round(resultado.valorTotal / resultado.total);
        expect(resultado.valorMedio).toBe(mediaEsperada);
      } else {
        expect(resultado.valorMedio).toBe(0);
      }
    });

    it("deve somar valores pendentes e pagos corretamente", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const resultado = await caller.relatorios.agregarMultas({
        mes: 11,
        ano: 2025,
      });

      // A soma de pendente + pago deve ser menor ou igual ao total
      // (porque pode haver multas recorridas ou canceladas)
      expect(resultado.valorPendente + resultado.valorPago).toBeLessThanOrEqual(
        resultado.valorTotal
      );
    });
  });

  describe("Validações de Entrada", () => {
    it("deve validar mês entre 1 e 12", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.relatorios.agregarMissoes({ mes: 0, ano: 2025 })
      ).rejects.toThrow();

      await expect(
        caller.relatorios.agregarMissoes({ mes: 13, ano: 2025 })
      ).rejects.toThrow();
    });

    it("deve aceitar anos válidos", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Não deve lançar erro
      await expect(
        caller.relatorios.agregarMissoes({ mes: 1, ano: 2024 })
      ).resolves.toBeDefined();

      await expect(
        caller.relatorios.agregarMissoes({ mes: 1, ano: 2025 })
      ).resolves.toBeDefined();
    });
  });
});
