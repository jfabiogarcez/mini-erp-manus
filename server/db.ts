import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, InsertRegistro, InsertTarefa } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ========== MISSÕES ==========

import { missoes, arquivosMissao, InsertMissao, InsertArquivoMissao } from "../drizzle/schema";
import { desc } from "drizzle-orm";

/**
 * Gera um código único de missão no formato MISS-YYYY-NNN
 */
export async function gerarCodigoMissao(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const ano = new Date().getFullYear();
  const prefixo = `MISS-${ano}-`;

  // Buscar a última missão do ano
  const ultimaMissao = await db
    .select()
    .from(missoes)
    .where(eq(missoes.codigoMissao, prefixo))
    .orderBy(desc(missoes.id))
    .limit(1);

  let numero = 1;
  if (ultimaMissao.length > 0) {
    const ultimoCodigo = ultimaMissao[0]!.codigoMissao;
    const match = ultimoCodigo.match(/-([0-9]+)$/);
    if (match) {
      numero = parseInt(match[1]!) + 1;
    }
  }

  return `${prefixo}${numero.toString().padStart(3, "0")}`;
}

export async function createMissao(missao: Omit<InsertMissao, "codigoMissao">): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const codigoMissao = await gerarCodigoMissao();
  const result = await db.insert(missoes).values({ ...missao, codigoMissao });
  return Number((result as any).insertId);
}

export async function getAllMissoes() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(missoes).orderBy(desc(missoes.createdAt));
}

export async function getMissaoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(missoes).where(eq(missoes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMissaoByCodigo(codigoMissao: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(missoes).where(eq(missoes.codigoMissao, codigoMissao)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateMissao(id: number, missao: Partial<InsertMissao>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(missoes).set(missao).where(eq(missoes.id, id));
}

export async function deleteMissao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(missoes).where(eq(missoes.id, id));
}

// ========== ARQUIVOS DE MISSÃO ==========

export async function createArquivoMissao(arquivo: InsertArquivoMissao): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(arquivosMissao).values(arquivo);
  return Number((result as any).insertId);
}

export async function getArquivosByMissaoId(missaoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(arquivosMissao).where(eq(arquivosMissao.missaoId, missaoId));
}

// ========== EVENTOS DO CALENDÁRIO ==========

import { eventos, InsertEvento } from "../drizzle/schema";
import { and, gte, lte } from "drizzle-orm";

export async function createEvento(evento: InsertEvento): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(eventos).values(evento);
  return Number((result as any).insertId);
}

export async function getAllEventos() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventos).orderBy(eventos.dataInicio);
}

export async function getEventoById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(eventos).where(eq(eventos.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEventosByPeriodo(dataInicio: Date, dataFim: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventos).where(
    and(
      gte(eventos.dataInicio, dataInicio),
      lte(eventos.dataInicio, dataFim)
    )
  );
}

export async function getEventosByMissaoId(missaoId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(eventos).where(eq(eventos.missaoId, missaoId));
}

export async function updateEvento(id: number, evento: Partial<InsertEvento>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(eventos).set(evento).where(eq(eventos.id, id));
}

export async function deleteEvento(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(eventos).where(eq(eventos.id, id));
}

/**
 * Retorna eventos urgentes (próximos 3 dias) que ainda não tiveram alerta enviado
 */
export async function getEventosUrgentes() {
  const db = await getDb();
  if (!db) return [];
  
  const hoje = new Date();
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + 3);
  
  return db.select().from(eventos).where(
    and(
      gte(eventos.dataInicio, hoje),
      lte(eventos.dataInicio, dataLimite),
      eq(eventos.alertaEnviado, 0)
    )
  );
}

// ========== REGISTROS ==========

export async function getAllRegistros() {
  const db = await getDb();
  if (!db) return [];
  const { registros } = await import("../drizzle/schema");
  return db.select().from(registros).orderBy(registros.createdAt);
}

export async function getRegistroById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { registros } = await import("../drizzle/schema");
  const result = await db.select().from(registros).where(eq(registros.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createRegistro(data: InsertRegistro) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { registros } = await import("../drizzle/schema");
  const result = await db.insert(registros).values(data);
  return Number(result[0].insertId);
}

export async function updateRegistro(id: number, data: Partial<InsertRegistro>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { registros } = await import("../drizzle/schema");
  await db.update(registros).set(data).where(eq(registros.id, id));
}

export async function deleteRegistro(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { registros } = await import("../drizzle/schema");
  await db.delete(registros).where(eq(registros.id, id));
}

export async function getRegistroByChaveAgrupamento(chave: string) {
  const db = await getDb();
  if (!db) return undefined;
  const { registros } = await import("../drizzle/schema");
  const result = await db.select().from(registros).where(eq(registros.chaveAgrupamento, chave)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// === Tarefas Queries ===

export async function getAllTarefas() {
  const db = await getDb();
  if (!db) return [];
  const { tarefas } = await import("../drizzle/schema");
  return db.select().from(tarefas).orderBy(tarefas.dataVencimento);
}

export async function getTarefaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { tarefas } = await import("../drizzle/schema");
  const result = await db.select().from(tarefas).where(eq(tarefas.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTarefa(data: InsertTarefa) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { tarefas } = await import("../drizzle/schema");
  const result = await db.insert(tarefas).values(data);
  return Number(result[0].insertId);
}

export async function updateTarefa(id: number, data: Partial<InsertTarefa>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { tarefas } = await import("../drizzle/schema");
  await db.update(tarefas).set(data).where(eq(tarefas.id, id));
}

export async function deleteTarefa(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { tarefas } = await import("../drizzle/schema");
  await db.delete(tarefas).where(eq(tarefas.id, id));
}
