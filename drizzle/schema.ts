import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de missões para rastreamento de operações
 */
export const missoes = mysqlTable("missoes", {
  id: int("id").autoincrement().primaryKey(),
  codigoMissao: varchar("codigoMissao", { length: 50 }).notNull().unique(),
  cliente: text("cliente"),
  motorista: text("motorista"),
  status: mysqlEnum("status", ["Pendente", "Em Andamento", "Concluída", "Cancelada"]).default("Pendente").notNull(),
  dataInicio: timestamp("dataInicio"),
  dataFim: timestamp("dataFim"),
  observacoes: text("observacoes"),
  linkGoogleDrive: text("linkGoogleDrive"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Missao = typeof missoes.$inferSelect;
export type InsertMissao = typeof missoes.$inferInsert;

/**
 * Tabela de arquivos vinculados a missões
 */
export const arquivosMissao = mysqlTable("arquivosMissao", {
  id: int("id").autoincrement().primaryKey(),
  missaoId: int("missaoId").notNull(),
  tipoArquivo: mysqlEnum("tipoArquivo", ["Excel", "Word", "Imagem", "PDF", "Outro"]).notNull(),
  nomeArquivo: text("nomeArquivo").notNull(),
  urlArquivo: text("urlArquivo").notNull(),
  tamanhoBytes: int("tamanhoBytes"),
  metadados: text("metadados"), // JSON string com informações extras
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ArquivoMissao = typeof arquivosMissao.$inferSelect;
export type InsertArquivoMissao = typeof arquivosMissao.$inferInsert;

/**
 * Tabela de eventos do calendário
 */
export const eventos = mysqlTable("eventos", {
  id: int("id").autoincrement().primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  dataInicio: timestamp("dataInicio").notNull(),
  dataFim: timestamp("dataFim"),
  tipo: mysqlEnum("tipo", ["Missão", "Tarefa", "Registro", "Outro"]).notNull(),
  cor: varchar("cor", { length: 7 }).default("#0433ff").notNull(), // Hex color
  missaoId: int("missaoId"),
  tarefaId: int("tarefaId"),
  registroId: int("registroId"),
  googleCalendarEventId: text("googleCalendarEventId"), // ID do evento no Google Calendar
  alertaEnviado: int("alertaEnviado").default(0).notNull(), // Boolean (0 ou 1)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Evento = typeof eventos.$inferSelect;
export type InsertEvento = typeof eventos.$inferInsert;

/**
 * Tabela de configuração da IA
 */
export const configuracaoIA = mysqlTable("configuracaoIA", {
  id: int("id").autoincrement().primaryKey(),
  iaLigada: int("iaLigada").default(0).notNull(), // Boolean (0 = desligada/aprendendo, 1 = ligada/executando)
  confiancaMinima: int("confiancaMinima").default(80).notNull(), // % de confiança mínima para executar ações
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConfiguracaoIA = typeof configuracaoIA.$inferSelect;
export type InsertConfiguracaoIA = typeof configuracaoIA.$inferInsert;

/**
 * Tabela de ações do usuário (para aprendizado)
 */
export const acoesUsuario = mysqlTable("acoesUsuario", {
  id: int("id").autoincrement().primaryKey(),
  tipoAcao: varchar("tipoAcao", { length: 50 }).notNull(), // criar_missao, criar_tarefa, categorizar_registro, etc.
  contexto: text("contexto").notNull(), // JSON com dados da ação
  resultado: text("resultado"), // JSON com resultado da ação
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AcaoUsuario = typeof acoesUsuario.$inferSelect;
export type InsertAcaoUsuario = typeof acoesUsuario.$inferInsert;

/**
 * Tabela de padrões aprendidos pela IA
 */
export const padroesAprendidos = mysqlTable("padroesAprendidos", {
  id: int("id").autoincrement().primaryKey(),
  tipoPadrao: varchar("tipoPadrao", { length: 50 }).notNull(), // regra_categorizacao, regra_agendamento, etc.
  condicao: text("condicao").notNull(), // JSON com condições para aplicar o padrão
  acao: text("acao").notNull(), // JSON com ação a ser executada
  confianca: int("confianca").default(0).notNull(), // % de confiança (0-100)
  vezesAplicado: int("vezesAplicado").default(0).notNull(), // Contador de vezes que foi aplicado
  vezesCorreto: int("vezesCorreto").default(0).notNull(), // Contador de vezes que foi correto
  ativo: int("ativo").default(1).notNull(), // Boolean (0 = inativo, 1 = ativo)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PadraoAprendido = typeof padroesAprendidos.$inferSelect;
export type InsertPadraoAprendido = typeof padroesAprendidos.$inferInsert;

/**
 * Tabela de registros consolidados do mini-ERP.
 * Armazena dados extraídos de planilhas enviadas por e-mail/WhatsApp.
 */
export const registros = mysqlTable("registros", {
  id: int("id").autoincrement().primaryKey(),
  assunto: text("assunto").notNull(),
  categoria: varchar("categoria", { length: 100 }).notNull(),
  clienteFornecedor: text("clienteFornecedor"),
  nDocumentoPedido: varchar("nDocumentoPedido", { length: 255 }),
  dataDocumento: timestamp("dataDocumento"),
  dataVencimento: timestamp("dataVencimento"),
  valorTotal: int("valorTotal").default(0), // Armazenado em centavos para evitar problemas de precisão
  status: varchar("status", { length: 50 }).default("Pendente").notNull(),
  origemArquivo: text("origemArquivo"),
  origemAba: text("origemAba"),
  observacoes: text("observacoes"),
  chaveAgrupamento: varchar("chaveAgrupamento", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Registro = typeof registros.$inferSelect;
export type InsertRegistro = typeof registros.$inferInsert;

/**
 * Tabela de tarefas agendadas.
 * Criadas automaticamente com base nos registros consolidados.
 */
export const tarefas = mysqlTable("tarefas", {
  id: int("id").autoincrement().primaryKey(),
  titulo: text("titulo").notNull(),
  descricao: text("descricao"),
  dataVencimento: timestamp("dataVencimento").notNull(),
  status: varchar("status", { length: 50 }).default("Pendente").notNull(),
  registroId: int("registroId").references(() => registros.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tarefa = typeof tarefas.$inferSelect;
export type InsertTarefa = typeof tarefas.$inferInsert;