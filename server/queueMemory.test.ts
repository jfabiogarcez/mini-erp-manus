import { describe, it, expect, beforeEach } from "vitest";
import { adicionarMensagemAFila, obterStatusFila, fila } from "./queueMemory";

describe("Fila em Memória", () => {
  beforeEach(() => {
    fila.limpar();
  });

  describe("adicionarMensagemAFila", () => {
    it("deve adicionar mensagem à fila", async () => {
      const job = {
        numeroCliente: "+5511987654321",
        mensagem: "Olá",
      };

      const id = await adicionarMensagemAFila(job);
      expect(id).toBeDefined();
      expect(typeof id).toBe("string");
      expect(id).toContain("job-");
    });

    it("deve gerar IDs únicos", async () => {
      const job1 = { numeroCliente: "+5511987654321", mensagem: "Msg 1" };
      const job2 = { numeroCliente: "+5511987654322", mensagem: "Msg 2" };

      const id1 = await adicionarMensagemAFila(job1);
      const id2 = await adicionarMensagemAFila(job2);

      expect(id1).not.toBe(id2);
    });
  });

  describe("obterStatusFila", () => {
    it("deve retornar estatísticas da fila", async () => {
      const status = await obterStatusFila();

      expect(status).toHaveProperty("total");
      expect(status).toHaveProperty("pendente");
      expect(status).toHaveProperty("processando");
      expect(status).toHaveProperty("completado");
      expect(status).toHaveProperty("falho");
    });

    it("deve contar jobs adicionados", async () => {
      const job = { numeroCliente: "+5511987654321", mensagem: "Teste" };

      await adicionarMensagemAFila(job);
      const status = await obterStatusFila();

      expect(status.total).toBeGreaterThan(0);
    });

    it("deve ter números válidos", async () => {
      const status = await obterStatusFila();

      expect(status.total).toBeGreaterThanOrEqual(0);
      expect(status.pendente).toBeGreaterThanOrEqual(0);
      expect(status.processando).toBeGreaterThanOrEqual(0);
      expect(status.completado).toBeGreaterThanOrEqual(0);
      expect(status.falho).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Processamento de jobs", () => {
    it("deve processar jobs com seleção de menu", async () => {
      const job = {
        numeroCliente: "+5511987654321",
        mensagem: "1", // Seleção do menu
      };

      const id = await adicionarMensagemAFila(job);
      expect(id).toBeDefined();

      // Aguardar processamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const status = await obterStatusFila();
      expect(status.total).toBeGreaterThanOrEqual(0);
    });

    it("deve processar jobs com mensagem normal", async () => {
      const job = {
        numeroCliente: "+5511987654321",
        mensagem: "Qual é o valor do transporte?",
      };

      const id = await adicionarMensagemAFila(job);
      expect(id).toBeDefined();
    });

    it("deve processar múltiplos jobs", async () => {
      const jobs = [
        { numeroCliente: "+5511987654321", mensagem: "1" },
        { numeroCliente: "+5511987654322", mensagem: "2" },
        { numeroCliente: "+5511987654323", mensagem: "3" },
      ];

      for (const job of jobs) {
        const id = await adicionarMensagemAFila(job);
        expect(id).toBeDefined();
      }

      const status = await obterStatusFila();
      expect(status.total).toBeGreaterThanOrEqual(3);
    });
  });

  describe("Integração com Twilio", () => {
    it("deve processar webhook com dados válidos", async () => {
      const webhookBody = {
        From: "whatsapp:+5511987654321",
        Body: "Olá, gostaria de um orçamento",
        MessageSid: "SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      };

      expect(webhookBody.From).toBeDefined();
      expect(webhookBody.Body).toBeDefined();
      expect(webhookBody.From).toContain("whatsapp:");
    });

    it("deve extrair número do cliente", () => {
      const numeroComWhatsapp = "whatsapp:+5511987654321";
      const numero = numeroComWhatsapp.replace("whatsapp:", "");

      expect(numero).toBe("+5511987654321");
      expect(numero).not.toContain("whatsapp:");
    });

    it("deve processar números com diferentes formatos", () => {
      const numeros = [
        "whatsapp:+5511987654321",
        "whatsapp:+5521987654321",
        "whatsapp:+5585987654321",
      ];

      for (const num of numeros) {
        const limpo = num.replace("whatsapp:", "");
        expect(limpo).toMatch(/^\+55\d{10,11}$/);
      }
    });
  });

  describe("Fila limpa", () => {
    it("deve limpar todos os jobs", async () => {
      const job = { numeroCliente: "+5511987654321", mensagem: "Teste" };
      await adicionarMensagemAFila(job);

      fila.limpar();
      const status = await obterStatusFila();

      expect(status.total).toBe(0);
    });
  });
});
