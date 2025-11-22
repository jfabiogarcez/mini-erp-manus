import { describe, it, expect } from "vitest";
import {
  gerarMenuNumerado,
  processarSelecaoMenu,
  ehSelecaoMenu,
} from "./whatsappWebhook";

describe("WhatsApp Webhook - Menu Numerado", () => {
  describe("gerarMenuNumerado", () => {
    it("deve gerar menu com 5 opcoes", () => {
      const menu = gerarMenuNumerado();
      expect(menu).toContain("1");
      expect(menu).toContain("2");
      expect(menu).toContain("3");
      expect(menu).toContain("4");
      expect(menu).toContain("5");
      expect(menu).toContain("Transporte Executivo");
      expect(menu).toContain("Segurança Pessoal");
      expect(menu).toContain("Receptivo de Aeroporto");
    });

    it("deve conter saudacao inicial", () => {
      const menu = gerarMenuNumerado();
      expect(menu).toContain("Bem-vindo") || expect(menu).toContain("Olá");
    });
  });

  describe("ehSelecaoMenu", () => {
    it("deve validar numeros de 1 a 5", () => {
      expect(ehSelecaoMenu("1")).toBe(true);
      expect(ehSelecaoMenu("2")).toBe(true);
      expect(ehSelecaoMenu("3")).toBe(true);
      expect(ehSelecaoMenu("4")).toBe(true);
      expect(ehSelecaoMenu("5")).toBe(true);
    });

    it("deve rejeitar numeros fora do intervalo", () => {
      expect(ehSelecaoMenu("0")).toBe(false);
      expect(ehSelecaoMenu("6")).toBe(false);
      expect(ehSelecaoMenu("10")).toBe(false);
      expect(ehSelecaoMenu("-1")).toBe(false);
    });

    it("deve rejeitar texto nao numerico", () => {
      expect(ehSelecaoMenu("abc")).toBe(false);
      expect(ehSelecaoMenu("")).toBe(false);
    });

    it("deve aceitar numeros com espacos", () => {
      expect(ehSelecaoMenu(" 1 ")).toBe(true);
      expect(ehSelecaoMenu("  3  ")).toBe(true);
      expect(ehSelecaoMenu("\t2\t")).toBe(true);
    });
  });

  describe("processarSelecaoMenu", () => {
    it("deve retornar resposta para opcao 1", async () => {
      const resposta = await processarSelecaoMenu("1");
      expect(resposta.length).toBeGreaterThan(0);
      expect(resposta).toContain("Transporte");
    });

    it("deve retornar resposta para opcao 2", async () => {
      const resposta = await processarSelecaoMenu("2");
      expect(resposta.length).toBeGreaterThan(0);
      expect(resposta).toContain("Segurança");
    });

    it("deve retornar resposta para opcao 3", async () => {
      const resposta = await processarSelecaoMenu("3");
      expect(resposta.length).toBeGreaterThan(0);
      expect(resposta).toContain("Aeroporto");
    });

    it("deve retornar resposta para opcao 4", async () => {
      const resposta = await processarSelecaoMenu("4");
      expect(resposta.length).toBeGreaterThan(0);
      expect(resposta).toContain("Transblindados");
    });

    it("deve retornar resposta para opcao 5", async () => {
      const resposta = await processarSelecaoMenu("5");
      expect(resposta.length).toBeGreaterThan(0);
      expect(resposta).toContain("Agente");
    });

    it("deve retornar erro para opcao invalida", async () => {
      const resposta = await processarSelecaoMenu("6");
      expect(resposta.length).toBeGreaterThan(0);
      expect(resposta).toContain("Digite");
    });

    it("deve retornar erro para texto nao numerico", async () => {
      const resposta = await processarSelecaoMenu("abc");
      expect(resposta.length).toBeGreaterThan(0);
      expect(resposta).toContain("Digite");
    });

    it("cada resposta deve ter conteudo valido", async () => {
      for (let i = 1; i <= 5; i++) {
        const resposta = await processarSelecaoMenu(i.toString());
        expect(resposta.length).toBeGreaterThan(0);
        expect(typeof resposta).toBe("string");
      }
    });
  });

  describe("Fluxo de conversa", () => {
    it("deve iniciar com menu e processar selecoes", async () => {
      const menu = gerarMenuNumerado();
      expect(menu).toBeTruthy();
      expect(menu.length).toBeGreaterThan(0);

      // Simular selecao do usuario
      const opcao = "1";
      const ehValido = ehSelecaoMenu(opcao);
      expect(ehValido).toBe(true);

      if (ehValido) {
        const resposta = await processarSelecaoMenu(opcao);
        expect(resposta.length).toBeGreaterThan(0);
      }
    });

    it("deve lidar com multiplas selecoes", async () => {
      const opcoes = ["1", "2", "3", "4", "5"];
      for (const opcao of opcoes) {
        const valido = ehSelecaoMenu(opcao);
        expect(valido).toBe(true);

        const resposta = await processarSelecaoMenu(opcao);
        expect(resposta.length).toBeGreaterThan(0);
        expect(resposta).not.toContain("undefined");
      }
    });
  });
});
