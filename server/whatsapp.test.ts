import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";

describe("WhatsApp Integration", () => {
  describe("Conversas", () => {
    it("should list all conversas", async () => {
      const caller = appRouter.createCaller({} as any);
      const conversas = await caller.whatsapp.conversas.list();
      expect(Array.isArray(conversas)).toBe(true);
    });

    it("should create a new conversa", async () => {
      const caller = appRouter.createCaller({} as any);
      const result = await caller.whatsapp.conversas.create({
        numeroCliente: "+5511987654321",
        nomeCliente: "Test Client",
        statusConversa: "Ativa",
      });
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should get conversa by numero", async () => {
      const caller = appRouter.createCaller({} as any);
      // First create a conversa
      const created = await caller.whatsapp.conversas.create({
        numeroCliente: "+5511987654322",
        nomeCliente: "Test Client 2",
        statusConversa: "Ativa",
      });

      // Then retrieve it
      const conversa = await caller.whatsapp.conversas.getByNumero({
        numeroCliente: "+5511987654322",
      });
      expect(conversa?.numeroCliente).toBe("+5511987654322");
    });

    it("should update a conversa", async () => {
      const caller = appRouter.createCaller({} as any);
      const created = await caller.whatsapp.conversas.create({
        numeroCliente: "+5511987654323",
        nomeCliente: "Test Client 3",
        statusConversa: "Ativa",
      });

      const updated = await caller.whatsapp.conversas.update({
        id: created.id,
        statusConversa: "Arquivada",
      });
      expect(updated.success).toBe(true);
    });

    it("should delete a conversa", async () => {
      const caller = appRouter.createCaller({} as any);
      const created = await caller.whatsapp.conversas.create({
        numeroCliente: "+5511987654324",
        nomeCliente: "Test Client 4",
        statusConversa: "Ativa",
      });

      const deleted = await caller.whatsapp.conversas.delete({
        id: created.id,
      });
      expect(deleted.success).toBe(true);
    });
  });

  describe("Templates", () => {
    it("should list all templates", async () => {
      const caller = appRouter.createCaller({} as any);
      const templates = await caller.whatsapp.templates.list();
      expect(Array.isArray(templates)).toBe(true);
    });

    it("should create a new template", async () => {
      const caller = appRouter.createCaller({} as any);
      const result = await caller.whatsapp.templates.create({
        titulo: "Test Template",
        conteudo: "This is a test template",
        categoria: "test",
      });
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should get template by id", async () => {
      const caller = appRouter.createCaller({} as any);
      const created = await caller.whatsapp.templates.create({
        titulo: "Test Template 2",
        conteudo: "This is another test template",
        categoria: "test",
      });

      const template = await caller.whatsapp.templates.getById({
        id: created.id,
      });
      expect(template?.titulo).toBe("Test Template 2");
    });

    it("should update a template", async () => {
      const caller = appRouter.createCaller({} as any);
      const created = await caller.whatsapp.templates.create({
        titulo: "Test Template 3",
        conteudo: "Original content",
        categoria: "test",
      });

      const updated = await caller.whatsapp.templates.update({
        id: created.id,
        conteudo: "Updated content",
      });
      expect(updated.success).toBe(true);
    });

    it("should delete a template", async () => {
      const caller = appRouter.createCaller({} as any);
      const created = await caller.whatsapp.templates.create({
        titulo: "Test Template 4",
        conteudo: "Content to delete",
        categoria: "test",
      });

      const deleted = await caller.whatsapp.templates.delete({
        id: created.id,
      });
      expect(deleted.success).toBe(true);
    });

    it("should increment template usage", async () => {
      const caller = appRouter.createCaller({} as any);
      const created = await caller.whatsapp.templates.create({
        titulo: "Test Template 5",
        conteudo: "Content for usage test",
        categoria: "test",
        vezesUsado: 0,
      });

      const incremented = await caller.whatsapp.templates.incrementUsage({
        id: created.id,
      });
      expect(incremented.success).toBe(true);
    });
  });

  describe("Documentos", () => {
    it("should list all documentos", async () => {
      const caller = appRouter.createCaller({} as any);
      const documentos = await caller.whatsapp.documentos.list();
      expect(Array.isArray(documentos)).toBe(true);
    });

    it("should create a new documento", async () => {
      const caller = appRouter.createCaller({} as any);
      const result = await caller.whatsapp.documentos.create({
        nome: "Test Document.pdf",
        urlArquivo: "https://example.com/test.pdf",
        tipoArquivo: "PDF",
        tamanhoBytes: 1024,
      });
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should get documento by id", async () => {
      const caller = appRouter.createCaller({} as any);
      const created = await caller.whatsapp.documentos.create({
        nome: "Test Document 2.pdf",
        urlArquivo: "https://example.com/test2.pdf",
        tipoArquivo: "PDF",
        tamanhoBytes: 2048,
      });

      const documento = await caller.whatsapp.documentos.getById({
        id: created.id,
      });
      expect(documento?.nome).toBe("Test Document 2.pdf");
    });

    it("should update a documento", async () => {
      const caller = appRouter.createCaller({} as any);
      const created = await caller.whatsapp.documentos.create({
        nome: "Test Document 3.pdf",
        urlArquivo: "https://example.com/test3.pdf",
        tipoArquivo: "PDF",
      });

      const updated = await caller.whatsapp.documentos.update({
        id: created.id,
        descricao: "Updated description",
      });
      expect(updated.success).toBe(true);
    });

    it("should delete a documento", async () => {
      const caller = appRouter.createCaller({} as any);
      const created = await caller.whatsapp.documentos.create({
        nome: "Test Document 4.pdf",
        urlArquivo: "https://example.com/test4.pdf",
        tipoArquivo: "PDF",
      });

      const deleted = await caller.whatsapp.documentos.delete({
        id: created.id,
      });
      expect(deleted.success).toBe(true);
    });
  });

  describe("Mensagens", () => {
    it("should list all mensagens", async () => {
      const caller = appRouter.createCaller({} as any);
      const mensagens = await caller.whatsapp.mensagens.list();
      expect(Array.isArray(mensagens)).toBe(true);
    });

    it("should create a new mensagem", async () => {
      const caller = appRouter.createCaller({} as any);
      
      // First create a conversa
      const conversa = await caller.whatsapp.conversas.create({
        numeroCliente: "+5511987654325",
        nomeCliente: "Test Client 5",
        statusConversa: "Ativa",
      });

      // Then create a mensagem
      const result = await caller.whatsapp.mensagens.create({
        conversaId: conversa.id,
        remetente: "Cliente",
        mensagem: "Test message",
        dataEnvio: new Date(),
      });
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should get mensagens by conversa", async () => {
      const caller = appRouter.createCaller({} as any);
      
      // Create a conversa
      const conversa = await caller.whatsapp.conversas.create({
        numeroCliente: "+5511987654326",
        nomeCliente: "Test Client 6",
        statusConversa: "Ativa",
      });

      // Create a mensagem
      await caller.whatsapp.mensagens.create({
        conversaId: conversa.id,
        remetente: "Cliente",
        mensagem: "Test message 2",
        dataEnvio: new Date(),
      });

      // Retrieve mensagens
      const mensagens = await caller.whatsapp.mensagens.getByConversa({
        conversaId: conversa.id,
      });
      expect(Array.isArray(mensagens)).toBe(true);
      expect(mensagens.length).toBeGreaterThan(0);
    });

    it("should update a mensagem", async () => {
      const caller = appRouter.createCaller({} as any);
      
      // Create a conversa
      const conversa = await caller.whatsapp.conversas.create({
        numeroCliente: "+5511987654327",
        nomeCliente: "Test Client 7",
        statusConversa: "Ativa",
      });

      // Create a mensagem
      const created = await caller.whatsapp.mensagens.create({
        conversaId: conversa.id,
        remetente: "Cliente",
        mensagem: "Test message 3",
        dataEnvio: new Date(),
      });

      // Update it
      const updated = await caller.whatsapp.mensagens.update({
        id: created.id,
        lida: 1,
      });
      expect(updated.success).toBe(true);
    });

    it("should delete a mensagem", async () => {
      const caller = appRouter.createCaller({} as any);
      
      // Create a conversa
      const conversa = await caller.whatsapp.conversas.create({
        numeroCliente: "+5511987654328",
        nomeCliente: "Test Client 8",
        statusConversa: "Ativa",
      });

      // Create a mensagem
      const created = await caller.whatsapp.mensagens.create({
        conversaId: conversa.id,
        remetente: "Cliente",
        mensagem: "Test message 4",
        dataEnvio: new Date(),
      });

      // Delete it
      const deleted = await caller.whatsapp.mensagens.delete({
        id: created.id,
      });
      expect(deleted.success).toBe(true);
    });
  });
});
