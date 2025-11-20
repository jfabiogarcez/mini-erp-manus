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