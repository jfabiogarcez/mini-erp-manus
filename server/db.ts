import { eq, gte, lte, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, InsertMembroEquipe, InsertRegistro, InsertTarefa } from "../drizzle/schema";
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
  const insertId = (result as any)[0]?.insertId || (result as any).insertId;
  if (!insertId || isNaN(Number(insertId))) {
    throw new Error("Failed to get insertId from database");
  }
  return Number(insertId);
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

// ========== MEMBROS DA EQUIPE ==========

export async function getAllMembrosEquipe() {
  const db = await getDb();
  if (!db) return [];
  const { membrosEquipe } = await import("../drizzle/schema");
  return db.select().from(membrosEquipe).where(eq(membrosEquipe.ativo, 1));
}

export async function getMembrosByTipo(tipo: "Motorista" | "Segurança" | "Receptivo") {
  const db = await getDb();
  if (!db) return [];
  const { membrosEquipe } = await import("../drizzle/schema");
  return db.select().from(membrosEquipe).where(
    and(
      eq(membrosEquipe.tipo, tipo),
      eq(membrosEquipe.ativo, 1)
    )
  );
}

export async function createMembroEquipe(membro: InsertMembroEquipe) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { membrosEquipe } = await import("../drizzle/schema");
  const result = await db.insert(membrosEquipe).values(membro);
  return Number(result[0].insertId);
}

export async function updateMembroEquipe(id: number, membro: Partial<InsertMembroEquipe>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { membrosEquipe } = await import("../drizzle/schema");
  await db.update(membrosEquipe).set(membro).where(eq(membrosEquipe.id, id));
}

export async function deleteMembroEquipe(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { membrosEquipe } = await import("../drizzle/schema");
  // Soft delete
  await db.update(membrosEquipe).set({ ativo: 0 }).where(eq(membrosEquipe.id, id));
}


// ===== Multas =====

export async function getAllMultas() {
  const db = await getDb();
  if (!db) return [];
  
  const { multas } = await import("../drizzle/schema");
  return db.select().from(multas).orderBy(multas.createdAt);
}

export async function getMultaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const { multas } = await import("../drizzle/schema");
  const result = await db.select().from(multas).where(eq(multas.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createMulta(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { multas } = await import("../drizzle/schema");
  const result = await db.insert(multas).values(data);
  return Number((result as any).insertId || 0);
}

export async function updateMulta(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { multas } = await import("../drizzle/schema");
  await db.update(multas).set(data).where(eq(multas.id, id));
}

export async function deleteMulta(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { multas } = await import("../drizzle/schema");
  await db.delete(multas).where(eq(multas.id, id));
}

// ===== Funções de Serviços =====

export async function getAllServicos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { servicos } = await import("../drizzle/schema");
  return db.select().from(servicos).orderBy(servicos.nome);
}

export async function getServicosAtivos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { servicos } = await import("../drizzle/schema");
  return db.select().from(servicos).where(eq(servicos.ativo, 1)).orderBy(servicos.nome);
}

export async function getServicoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { servicos } = await import("../drizzle/schema");
  const result = await db.select().from(servicos).where(eq(servicos.id, id)).limit(1);
  return result[0];
}

export async function createServico(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { servicos } = await import("../drizzle/schema");
  const result = await db.insert(servicos).values(data);
  return Number((result as any).insertId);
}

export async function updateServico(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { servicos } = await import("../drizzle/schema");
  await db.update(servicos).set(data).where(eq(servicos.id, id));
}

export async function deleteServico(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { servicos } = await import("../drizzle/schema");
  await db.delete(servicos).where(eq(servicos.id, id));
}

// ===== Funções de Links de Cobrança =====

export async function getAllLinksCobranca() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { linksCobranca } = await import("../drizzle/schema");
  return db.select().from(linksCobranca).orderBy(desc(linksCobranca.createdAt));
}

export async function getLinkCobrancaById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { linksCobranca } = await import("../drizzle/schema");
  const result = await db.select().from(linksCobranca).where(eq(linksCobranca.id, id)).limit(1);
  return result[0];
}

export async function getLinkCobrancaBySessionId(sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { linksCobranca } = await import("../drizzle/schema");
  const result = await db.select().from(linksCobranca).where(eq(linksCobranca.stripeCheckoutSessionId, sessionId)).limit(1);
  return result[0];
}

export async function createLinkCobranca(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { linksCobranca } = await import("../drizzle/schema");
  const result = await db.insert(linksCobranca).values(data);
  return Number((result as any).insertId);
}

export async function updateLinkCobranca(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { linksCobranca } = await import("../drizzle/schema");
  await db.update(linksCobranca).set(data).where(eq(linksCobranca.id, id));
}

export async function updateLinkCobrancaBySessionId(sessionId: string, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { linksCobranca } = await import("../drizzle/schema");
  await db.update(linksCobranca).set(data).where(eq(linksCobranca.stripeCheckoutSessionId, sessionId));
}

// ===== Funções de Aprendizados da IA =====

export async function getAllAprendizados() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { aprendizados } = await import("../drizzle/schema");
  return db.select().from(aprendizados).orderBy(aprendizados.ordem, aprendizados.id);
}

export async function getAprendizadosAtivos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { aprendizados } = await import("../drizzle/schema");
  return db.select().from(aprendizados).where(eq(aprendizados.ativo, 1)).orderBy(aprendizados.ordem, aprendizados.id);
}

export async function getAprendizadoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { aprendizados } = await import("../drizzle/schema");
  const result = await db.select().from(aprendizados).where(eq(aprendizados.id, id)).limit(1);
  return result[0];
}

export async function createAprendizado(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { aprendizados } = await import("../drizzle/schema");
  const result = await db.insert(aprendizados).values(data);
  return Number((result as any).insertId);
}

export async function updateAprendizado(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { aprendizados } = await import("../drizzle/schema");
  await db.update(aprendizados).set(data).where(eq(aprendizados.id, id));
}

export async function deleteAprendizado(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { aprendizados } = await import("../drizzle/schema");
  await db.delete(aprendizados).where(eq(aprendizados.id, id));
}

export async function incrementarUsoAprendizado(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { aprendizados } = await import("../drizzle/schema");
  const aprendizado = await getAprendizadoById(id);
  if (aprendizado) {
    await db.update(aprendizados)
      .set({ 
        vezesAplicado: (aprendizado.vezesAplicado || 0) + 1,
        ultimaAplicacao: new Date(),
      })
      .where(eq(aprendizados.id, id));
  }
}

// ===== Funções de Modelos de Documentos =====

export async function getAllModelos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { modelos } = await import("../drizzle/schema");
  return db.select().from(modelos).orderBy(modelos.categoria, modelos.nome);
}

export async function getModelosAtivos() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { modelos } = await import("../drizzle/schema");
  return db.select().from(modelos).where(eq(modelos.ativo, 1)).orderBy(modelos.categoria, modelos.nome);
}

export async function getModelosByCategoria(categoria: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { modelos } = await import("../drizzle/schema");
  return db.select().from(modelos)
    .where(eq(modelos.categoria, categoria as any))
    .orderBy(modelos.nome);
}

export async function getModeloById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { modelos } = await import("../drizzle/schema");
  const result = await db.select().from(modelos).where(eq(modelos.id, id)).limit(1);
  return result[0];
}

export async function createModelo(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { modelos } = await import("../drizzle/schema");
  const result = await db.insert(modelos).values(data);
  return Number((result as any).insertId);
}

export async function updateModelo(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { modelos } = await import("../drizzle/schema");
  await db.update(modelos).set(data).where(eq(modelos.id, id));
}

export async function deleteModelo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { modelos } = await import("../drizzle/schema");
  await db.delete(modelos).where(eq(modelos.id, id));
}

export async function incrementarUsoModelo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { modelos } = await import("../drizzle/schema");
  const modelo = await getModeloById(id);
  if (modelo) {
    await db.update(modelos)
      .set({ vezesUsado: (modelo.vezesUsado || 0) + 1 })
      .where(eq(modelos.id, id));
  }
}

// ===== Funções de Documentos Gerados =====

export async function getAllDocumentosGerados() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { documentosGerados } = await import("../drizzle/schema");
  return db.select().from(documentosGerados).orderBy(desc(documentosGerados.createdAt));
}

export async function getDocumentoGeradoById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { documentosGerados } = await import("../drizzle/schema");
  const result = await db.select().from(documentosGerados).where(eq(documentosGerados.id, id)).limit(1);
  return result[0];
}

export async function createDocumentoGerado(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { documentosGerados } = await import("../drizzle/schema");
  const result = await db.insert(documentosGerados).values(data);
  return Number((result as any).insertId);
}

export async function updateDocumentoGerado(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { documentosGerados } = await import("../drizzle/schema");
  await db.update(documentosGerados).set(data).where(eq(documentosGerados.id, id));
}

// ===== Funções Adicionais de Missões =====

export async function getMissoesByStatus(status: "Agendada" | "Em Andamento" | "Concluída" | "Cancelada") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { missoes } = await import("../drizzle/schema");
  return db.select().from(missoes).where(eq(missoes.status, status)).orderBy(desc(missoes.data));
}

export async function getMissoesByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { missoes } = await import("../drizzle/schema");
  const { and, gte, lte } = await import("drizzle-orm");
  
  return db.select().from(missoes)
    .where(and(
      gte(missoes.data, startDate),
      lte(missoes.data, endDate)
    ))
    .orderBy(missoes.data);
}

// ===== Funções de Relatórios =====

/**
 * Agrega dados de missões para um mês específico
 */
export async function agregarDadosMissoesMensal(mes: number, ano: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { missoes } = await import("../drizzle/schema");
  const { and, gte, lte, sql } = await import("drizzle-orm");
  
  // Calcular primeiro e último dia do mês
  const primeiroDia = new Date(ano, mes - 1, 1);
  const ultimoDia = new Date(ano, mes, 0, 23, 59, 59);
  
  // Buscar todas as missões do mês
  const missoesMes = await db.select().from(missoes)
    .where(and(
      gte(missoes.data, primeiroDia),
      lte(missoes.data, ultimoDia)
    ));
  
  // Calcular estatísticas
  const total = missoesMes.length;
  const porStatus = {
    Agendada: missoesMes.filter(m => m.status === "Agendada").length,
    "Em Andamento": missoesMes.filter(m => m.status === "Em Andamento").length,
    Concluída: missoesMes.filter(m => m.status === "Concluída").length,
    Cancelada: missoesMes.filter(m => m.status === "Cancelada").length,
  };
  
  const receitaTotal = missoesMes.reduce((sum, m) => sum + (m.valor || 0), 0);
  
  // Ranking de motoristas
  const missoesPorMotorista: Record<string, number> = {};
  missoesMes.forEach(m => {
    if (m.motorista) {
      missoesPorMotorista[m.motorista] = (missoesPorMotorista[m.motorista] || 0) + 1;
    }
  });
  
  const rankingMotoristas = Object.entries(missoesPorMotorista)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([motorista, total]) => ({ motorista, total }));
  
  // Serviços mais solicitados
  const missoesPorServico: Record<string, number> = {};
  missoesMes.forEach(m => {
    if (m.servico) {
      missoesPorServico[m.servico] = (missoesPorServico[m.servico] || 0) + 1;
    }
  });
  
  const servicosMaisSolicitados = Object.entries(missoesPorServico)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([servico, total]) => ({ servico, total }));
  
  return {
    periodo: { mes, ano },
    total,
    porStatus,
    receitaTotal,
    receitaMedia: total > 0 ? Math.round(receitaTotal / total) : 0,
    rankingMotoristas,
    servicosMaisSolicitados,
    missoes: missoesMes,
  };
}

/**
 * Agrega dados de multas para um mês específico
 */
export async function agregarDadosMultasMensal(mes: number, ano: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { multas } = await import("../drizzle/schema");
  const { and, gte, lte } = await import("drizzle-orm");
  
  // Calcular primeiro e último dia do mês
  const primeiroDia = new Date(ano, mes - 1, 1);
  const ultimoDia = new Date(ano, mes, 0, 23, 59, 59);
  
  // Buscar todas as multas do mês (pela data da infração)
  const multasMes = await db.select().from(multas)
    .where(and(
      gte(multas.dataInfracao, primeiroDia),
      lte(multas.dataInfracao, ultimoDia)
    ));
  
  // Calcular estatísticas
  const total = multasMes.length;
  const porStatus = {
    Pendente: multasMes.filter(m => m.status === "Pendente").length,
    Pago: multasMes.filter(m => m.status === "Pago").length,
    Recorrido: multasMes.filter(m => m.status === "Recorrido").length,
    Cancelado: multasMes.filter(m => m.status === "Cancelado").length,
  };
  
  const valorTotal = multasMes.reduce((sum, m) => sum + (m.valor || 0), 0);
  const valorPago = multasMes
    .filter(m => m.status === "Pago")
    .reduce((sum, m) => sum + (m.valor || 0), 0);
  const valorPendente = multasMes
    .filter(m => m.status === "Pendente")
    .reduce((sum, m) => sum + (m.valor || 0), 0);
  
  // Multas por veículo
  const multasPorVeiculo: Record<string, { total: number; valor: number }> = {};
  multasMes.forEach(m => {
    if (m.veiculoPlaca) {
      if (!multasPorVeiculo[m.veiculoPlaca]) {
        multasPorVeiculo[m.veiculoPlaca] = { total: 0, valor: 0 };
      }
      multasPorVeiculo[m.veiculoPlaca].total++;
      multasPorVeiculo[m.veiculoPlaca].valor += m.valor || 0;
    }
  });
  
  const rankingVeiculos = Object.entries(multasPorVeiculo)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10)
    .map(([veiculo, dados]) => ({ veiculo, ...dados }));
  
  // Tipos de infração mais comuns (baseado na descrição)
  const multasPorTipo: Record<string, number> = {};
  multasMes.forEach(m => {
    if (m.descricaoInfracao) {
      multasPorTipo[m.descricaoInfracao] = (multasPorTipo[m.descricaoInfracao] || 0) + 1;
    }
  });
  
  const tiposMaisComuns = Object.entries(multasPorTipo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tipo, total]) => ({ tipo, total }));
  
  return {
    periodo: { mes, ano },
    total,
    porStatus,
    valorTotal,
    valorPago,
    valorPendente,
    valorMedio: total > 0 ? Math.round(valorTotal / total) : 0,
    rankingVeiculos,
    tiposMaisComuns,
    multas: multasMes,
  };
}

/**
 * Cria um novo relatório no banco de dados
 */
export async function createRelatorio(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { relatorios } = await import("../drizzle/schema");
  const result = await db.insert(relatorios).values(data);
  const insertId = (result as any).insertId;
  return Number(insertId);
}

/**
 * Busca todos os relatórios
 */
export async function getAllRelatorios() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { relatorios } = await import("../drizzle/schema");
  return db.select().from(relatorios).orderBy(desc(relatorios.createdAt));
}

/**
 * Busca relatórios por tipo
 */
export async function getRelatoriosByTipo(tipo: "Missões" | "Multas" | "Consolidado") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { relatorios } = await import("../drizzle/schema");
  return db.select().from(relatorios)
    .where(eq(relatorios.tipo, tipo))
    .orderBy(desc(relatorios.ano), desc(relatorios.mes));
}

/**
 * Busca relatório por mês/ano/tipo
 */
export async function getRelatorioByPeriodo(mes: number, ano: number, tipo: "Missões" | "Multas" | "Consolidado") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { relatorios } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  
  const result = await db.select().from(relatorios)
    .where(and(
      eq(relatorios.mes, mes),
      eq(relatorios.ano, ano),
      eq(relatorios.tipo, tipo)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}
