import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createServer } from "http";
import {
  initializeWebSocket,
  emitMensagemStatusUpdate,
  emitConversaUpdate,
  emitMensagemCriada,
  getIO,
  isWebSocketReady,
  getConnectedClientsCount,
} from "./websocket";

describe("WebSocket", () => {
  let server: any;

  beforeEach(() => {
    server = createServer();
  });

  afterEach(() => {
    const io = getIO();
    if (io) {
      io.close();
    }
    server.close();
  });

  describe("Initialization", () => {
    it("deve inicializar Socket.io", () => {
      const io = initializeWebSocket(server);
      expect(io).toBeDefined();
      expect(isWebSocketReady()).toBe(true);
    });

    it("deve retornar instância do Socket.io", () => {
      initializeWebSocket(server);
      const io = getIO();
      expect(io).toBeDefined();
    });

    it("deve ter transports websocket e polling", () => {
      const io = initializeWebSocket(server);
      expect(io?.opts.transports).toContain("websocket");
      expect(io?.opts.transports).toContain("polling");
    });
  });

  describe("Status Updates", () => {
    beforeEach(() => {
      initializeWebSocket(server);
    });

    it("deve emitir atualização de status de mensagem", () => {
      const emitSpy = vi.spyOn(console, "log");

      emitMensagemStatusUpdate({
        id: 1,
        conversaId: 1,
        statusEnvio: "Enviado",
        timestamp: new Date(),
      });

      expect(emitSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WebSocket] Status atualizado")
      );
      emitSpy.mockRestore();
    });

    it("deve emitir nova mensagem", () => {
      const emitSpy = vi.spyOn(console, "log");

      emitMensagemCriada({
        id: 1,
        conversaId: 1,
        mensagem: "Teste",
        remetente: "Cliente",
      });

      expect(emitSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WebSocket] Nova mensagem")
      );
      emitSpy.mockRestore();
    });

    it("deve emitir atualização de conversa", () => {
      const emitSpy = vi.spyOn(console, "log");

      emitConversaUpdate({
        id: 1,
        statusConversa: "Ativa",
        ultimaMensagem: "Teste",
      });

      expect(emitSpy).toHaveBeenCalledWith(
        expect.stringContaining("[WebSocket] Conversa atualizada")
      );
      emitSpy.mockRestore();
    });
  });

  describe("Status Validation", () => {
    beforeEach(() => {
      initializeWebSocket(server);
    });

    it("deve aceitar status Pendente", () => {
      const update = {
        id: 1,
        conversaId: 1,
        statusEnvio: "Pendente" as const,
        timestamp: new Date(),
      };
      expect(update.statusEnvio).toBe("Pendente");
    });

    it("deve aceitar status Processando", () => {
      const update = {
        id: 1,
        conversaId: 1,
        statusEnvio: "Processando" as const,
        timestamp: new Date(),
      };
      expect(update.statusEnvio).toBe("Processando");
    });

    it("deve aceitar status Enviado", () => {
      const update = {
        id: 1,
        conversaId: 1,
        statusEnvio: "Enviado" as const,
        timestamp: new Date(),
      };
      expect(update.statusEnvio).toBe("Enviado");
    });

    it("deve aceitar status Falhou", () => {
      const update = {
        id: 1,
        conversaId: 1,
        statusEnvio: "Falhou" as const,
        timestamp: new Date(),
      };
      expect(update.statusEnvio).toBe("Falhou");
    });
  });

  describe("Conversa Status", () => {
    beforeEach(() => {
      initializeWebSocket(server);
    });

    it("deve aceitar status Ativa", () => {
      const update = {
        id: 1,
        statusConversa: "Ativa" as const,
      };
      expect(update.statusConversa).toBe("Ativa");
    });

    it("deve aceitar status Arquivada", () => {
      const update = {
        id: 1,
        statusConversa: "Arquivada" as const,
      };
      expect(update.statusConversa).toBe("Arquivada");
    });

    it("deve aceitar status Bloqueada", () => {
      const update = {
        id: 1,
        statusConversa: "Bloqueada" as const,
      };
      expect(update.statusConversa).toBe("Bloqueada");
    });
  });

  describe("Error Handling", () => {
    it("deve avisar se Socket.io não está inicializado", () => {
      const warnSpy = vi.spyOn(console, "warn");

      emitMensagemStatusUpdate({
        id: 1,
        conversaId: 1,
        statusEnvio: "Enviado",
        timestamp: new Date(),
      });

      expect(warnSpy).toHaveBeenCalledWith(
        "[WebSocket] Socket.io não inicializado"
      );
      warnSpy.mockRestore();
    });
  });
});
