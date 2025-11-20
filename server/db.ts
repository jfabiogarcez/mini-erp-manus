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

// === Registros Queries ===

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
