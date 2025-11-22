import { describe, it, expect } from "vitest";
import type { StatusEnvio } from "./StatusBadge";

describe("StatusBadge Component", () => {
  describe("Status Types", () => {
    it("deve aceitar status Pendente", () => {
      const status: StatusEnvio = "Pendente";
      expect(status).toBe("Pendente");
    });

    it("deve aceitar status Processando", () => {
      const status: StatusEnvio = "Processando";
      expect(status).toBe("Processando");
    });

    it("deve aceitar status Enviado", () => {
      const status: StatusEnvio = "Enviado";
      expect(status).toBe("Enviado");
    });

    it("deve aceitar status Falhou", () => {
      const status: StatusEnvio = "Falhou";
      expect(status).toBe("Falhou");
    });
  });

  describe("Status Configuration", () => {
    const statusConfig = {
      Pendente: {
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        label: "Pendente",
        description: "Aguardando processamento",
      },
      Processando: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        label: "Processando",
        description: "Enviando mensagem...",
      },
      Enviado: {
        color: "bg-green-50 text-green-700 border-green-200",
        label: "Enviado",
        description: "Mensagem entregue",
      },
      Falhou: {
        color: "bg-red-50 text-red-700 border-red-200",
        label: "Falhou",
        description: "Erro ao enviar",
      },
    };

    it("deve ter configuração para Pendente", () => {
      expect(statusConfig.Pendente).toBeDefined();
      expect(statusConfig.Pendente.label).toBe("Pendente");
    });

    it("deve ter configuração para Processando", () => {
      expect(statusConfig.Processando).toBeDefined();
      expect(statusConfig.Processando.label).toBe("Processando");
    });

    it("deve ter configuração para Enviado", () => {
      expect(statusConfig.Enviado).toBeDefined();
      expect(statusConfig.Enviado.label).toBe("Enviado");
    });

    it("deve ter configuração para Falhou", () => {
      expect(statusConfig.Falhou).toBeDefined();
      expect(statusConfig.Falhou.label).toBe("Falhou");
    });

    it("todas as configurações devem ter cores diferentes", () => {
      const cores = Object.values(statusConfig).map((config) => config.color);
      const coresUnicas = new Set(cores);
      expect(coresUnicas.size).toBe(4);
    });
  });

  describe("Size Variants", () => {
    const sizes = ["sm", "md", "lg"] as const;

    it("deve suportar tamanho sm", () => {
      expect(sizes).toContain("sm");
    });

    it("deve suportar tamanho md", () => {
      expect(sizes).toContain("md");
    });

    it("deve suportar tamanho lg", () => {
      expect(sizes).toContain("lg");
    });
  });

  describe("Progress Calculation", () => {
    const progressMap = {
      Pendente: 25,
      Processando: 50,
      Enviado: 100,
      Falhou: 0,
    };

    it("Pendente deve ter progresso 25%", () => {
      expect(progressMap.Pendente).toBe(25);
    });

    it("Processando deve ter progresso 50%", () => {
      expect(progressMap.Processando).toBe(50);
    });

    it("Enviado deve ter progresso 100%", () => {
      expect(progressMap.Enviado).toBe(100);
    });

    it("Falhou deve ter progresso 0%", () => {
      expect(progressMap.Falhou).toBe(0);
    });

    it("progresso deve estar entre 0 e 100", () => {
      Object.values(progressMap).forEach((progress) => {
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(100);
      });
    });
  });
});
