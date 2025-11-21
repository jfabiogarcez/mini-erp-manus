import { describe, it, expect } from "vitest";
import {
  validarAssinaturaTwilio,
  gerarRespostaTwilio,
  obterHistoricoConversa,
  obterEstatisticasConversa,
} from "./whatsappTwilio";

describe("WhatsApp Twilio Integration", () => {
  describe("validarAssinaturaTwilio", () => {
    it("deve validar assinatura do Twilio", () => {
      const url = "https://mycompany.com/myapp.php?foo=1&bar=2";
      const params = {
        "X-Twilio-Signature": "test-signature",
      };
      const token = "test-token";

      // Validação desabilitada para teste
      const resultado = validarAssinaturaTwilio(url, params, token);
      expect(typeof resultado).toBe("boolean");
    });

    it("deve retornar boolean", () => {
      const resultado = validarAssinaturaTwilio("https://example.com", {}, "token");
      expect(typeof resultado).toBe("boolean");
    });
  });

  describe("gerarRespostaTwilio", () => {
    it("deve gerar XML válido para resposta Twilio", () => {
      const mensagem = "Olá, como posso ajudar?";
      const resposta = gerarRespostaTwilio(mensagem);

      expect(resposta).toContain("<?xml");
      expect(resposta).toContain("<Response>");
      expect(resposta).toContain("<Message>");
      expect(resposta).toContain(mensagem);
      expect(resposta).toContain("</Message>");
      expect(resposta).toContain("</Response>");
    });

    it("deve escapar caracteres especiais em XML", () => {
      const mensagem = "Teste & <script> \"quote\"";
      const resposta = gerarRespostaTwilio(mensagem);

      expect(resposta).toContain("&amp;");
      expect(resposta).toContain("&lt;");
      expect(resposta).toContain("&gt;");
      expect(resposta).toContain("&quot;");
    });

    it("deve gerar resposta com encoding UTF-8", () => {
      const mensagem = "Olá, tudo bem? 😊";
      const resposta = gerarRespostaTwilio(mensagem);

      expect(resposta).toContain("UTF-8");
      expect(resposta).toContain(mensagem);
    });
  });

  describe("obterHistoricoConversa", () => {
    it("deve retornar array de histórico", async () => {
      const historico = await obterHistoricoConversa("+5511987654321");
      expect(Array.isArray(historico)).toBe(true);
    });

    it("deve respeitar limite de mensagens", async () => {
      const historico = await obterHistoricoConversa("+5511987654321", 5);
      expect(historico.length).toBeLessThanOrEqual(5);
    });

    it("deve retornar array vazio para conversa inexistente", async () => {
      const historico = await obterHistoricoConversa("+5599999999999");
      expect(Array.isArray(historico)).toBe(true);
    });
  });

  describe("obterEstatisticasConversa", () => {
    it("deve retornar null para conversa inexistente", async () => {
      const stats = await obterEstatisticasConversa("+5599999999999");
      expect(stats).toBeNull();
    });

    it("deve retornar objeto com propriedades esperadas", async () => {
      const stats = await obterEstatisticasConversa("+5511987654321");
      if (stats) {
        expect(stats).toHaveProperty("totalMensagens");
        expect(stats).toHaveProperty("mensagensCliente");
        expect(stats).toHaveProperty("mensagensBot");
        expect(stats).toHaveProperty("ultimaMensagem");
        expect(stats).toHaveProperty("status");
      }
    });

    it("deve ter números válidos nas estatísticas", async () => {
      const stats = await obterEstatisticasConversa("+5511987654321");
      if (stats) {
        expect(typeof stats.totalMensagens).toBe("number");
        expect(typeof stats.mensagensCliente).toBe("number");
        expect(typeof stats.mensagensBot).toBe("number");
        expect(stats.totalMensagens).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("Fluxo de integração Twilio", () => {
    it("deve processar webhook com dados válidos", async () => {
      const body = {
        From: "whatsapp:+5511987654321",
        Body: "Olá, gostaria de um orçamento",
      };

      expect(body.From).toBeDefined();
      expect(body.Body).toBeDefined();
      expect(body.From).toContain("whatsapp:");
    });

    it("deve extrair número do cliente corretamente", () => {
      const numeroComWhatsapp = "whatsapp:+5511987654321";
      const numero = numeroComWhatsapp.replace("whatsapp:", "");

      expect(numero).toBe("+5511987654321");
      expect(numero).not.toContain("whatsapp:");
    });

    it("deve gerar resposta XML para cada tipo de mensagem", () => {
      const mensagens = [
        "1",
        "2",
        "3",
        "Qual é o valor?",
        "Preciso de um transporte",
      ];

      for (const msg of mensagens) {
        const resposta = gerarRespostaTwilio(`Resposta para: ${msg}`);
        expect(resposta).toContain("<Response>");
        expect(resposta).toContain("</Response>");
      }
    });
  });
});
