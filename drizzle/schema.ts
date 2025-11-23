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
  data: timestamp("data").notNull(), // Data da missão
  cliente: text("cliente"),
  servico: varchar("servico", { length: 255 }), // Tipo de serviço
  origem: text("origem"), // Local de origem
  destino: text("destino"), // Local de destino
  motorista: text("motorista"),
  motoristaId: int("motorista_id"), // FK para membrosEquipe
  veiculo: varchar("veiculo", { length: 100 }), // Veículo utilizado
  veiculoPlaca: varchar("veiculo_placa", { length: 20 }),
  valor: int("valor").default(0), // Valor em centavos
  status: mysqlEnum("status", ["Agendada", "Em Andamento", "Concluída", "Cancelada"]).default("Agendada").notNull(),
  dataInicio: timestamp("dataInicio"),
  dataFim: timestamp("dataFim"),
  horaInicio: varchar("horaInicio", { length: 10 }), // HH:MM
  horaFim: varchar("horaFim", { length: 10 }), // HH:MM
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
 * Tabela de membros da equipe (Motoristas, Segurança, Receptivo)
 */
export const membrosEquipe = mysqlTable("membrosEquipe", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  fotoUrl: text("fotoUrl"), // URL da foto no S3
  email: varchar("email", { length: 320 }),
  telefone: varchar("telefone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  cpf: varchar("cpf", { length: 14 }),
  tipo: mysqlEnum("tipo", ["Motorista", "Segurança", "Receptivo"]).notNull(),
  // Dados bancários (JSON)
  dadosBancarios: text("dadosBancarios"), // { banco, agencia, conta, tipo_conta }
  chavePix: varchar("chavePix", { length: 255 }),
  // Endereço (JSON)
  endereco: text("endereco"), // { rua, numero, complemento, bairro, cidade, estado, cep }
  // Documentos (JSON)
  documentos: text("documentos"), // { rg, cnh, cnh_url, outros_docs }
  ativo: int("ativo").default(1).notNull(), // Boolean (0 = inativo, 1 = ativo)
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MembroEquipe = typeof membrosEquipe.$inferSelect;
export type InsertMembroEquipe = typeof membrosEquipe.$inferInsert;

/**
 * Tabela de multas de trânsito
 */
export const multas = mysqlTable("multas", {
  id: int("id").autoincrement().primaryKey(),
  numeroAuto: varchar("numero_auto", { length: 100 }),
  dataInfracao: timestamp("data_infracao"),
  horaInfracao: varchar("hora_infracao", { length: 10 }),
  localInfracao: text("local_infracao"),
  codigoInfracao: varchar("codigo_infracao", { length: 50 }),
  descricaoInfracao: text("descricao_infracao"),
  valor: int("valor").default(0),
  pontos: int("pontos").default(0),
  veiculoPlaca: varchar("veiculo_placa", { length: 20 }),
  motoristaId: int("motorista_id"),
  dataVencimento: timestamp("data_vencimento"),
  status: mysqlEnum("status", ["Pendente", "Pago", "Recorrido", "Cancelado"]).default("Pendente").notNull(),
  pdfUrl: text("pdf_url"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Multa = typeof multas.$inferSelect;
export type InsertMulta = typeof multas.$inferInsert;

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
/**
 * Tabela de serviços/produtos da empresa para cobrança
 */
export const servicos = mysqlTable("servicos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  preco: int("preco").notNull(), // Preço em centavos
  ativo: int("ativo").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Servico = typeof servicos.$inferSelect;
export type InsertServico = typeof servicos.$inferInsert;

/**
 * Tabela de links de pagamento gerados
 */
export const linksCobranca = mysqlTable("linksCobranca", {
  id: int("id").autoincrement().primaryKey(),
  stripeCheckoutSessionId: varchar("stripeCheckoutSessionId", { length: 255 }).unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  clienteNome: varchar("clienteNome", { length: 255 }),
  clienteEmail: varchar("clienteEmail", { length: 320 }),
  clienteTelefone: varchar("clienteTelefone", { length: 50 }),
  valorTotal: int("valorTotal").notNull(), // Valor em centavos
  desconto: int("desconto").default(0), // Desconto em porcentagem (0-100)
  status: mysqlEnum("status", ["Pendente", "Pago", "Cancelado", "Expirado"]).default("Pendente").notNull(),
  servicosIds: text("servicosIds"), // JSON array de IDs de serviços
  observacoes: text("observacoes"),
  linkCheckout: text("linkCheckout"),
  dataPagamento: timestamp("dataPagamento"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LinkCobranca = typeof linksCobranca.$inferSelect;
export type InsertLinkCobranca = typeof linksCobranca.$inferInsert;

/**
 * Tabela de aprendizados da IA
 * Armazena conhecimentos e padrões que a IA aprende automaticamente
 */
export const aprendizados = mysqlTable("aprendizados", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  descricao: text("descricao").notNull(),
  categoria: varchar("categoria", { length: 100 }), // Ex: "Multas", "Tarefas", "Registros"
  ordem: int("ordem").default(0), // Para ordenação customizada
  ativo: int("ativo").default(1).notNull(),
  aprendidoAutomaticamente: int("aprendidoAutomaticamente").default(0), // 1 se foi aprendido pela IA, 0 se foi manual
  confianca: int("confianca").default(100), // Nível de confiança 0-100
  vezesAplicado: int("vezesAplicado").default(0), // Contador de vezes que foi usado
  ultimaAplicacao: timestamp("ultimaAplicacao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Aprendizado = typeof aprendizados.$inferSelect;
export type InsertAprendizado = typeof aprendizados.$inferInsert;

/**
 * Tabela de modelos de documentos
 * Armazena templates de orçamentos, contratos, propostas, etc.
 */
export const modelos = mysqlTable("modelos", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  categoria: mysqlEnum("categoria", [
    "Orçamento",
    "Contrato",
    "Proposta",
    "Relatório",
    "Carta",
    "Outros"
  ]).default("Outros").notNull(),
  arquivoUrl: text("arquivoUrl").notNull(), // URL do arquivo no S3
  arquivoNome: varchar("arquivoNome", { length: 255 }),
  tipoArquivo: varchar("tipoArquivo", { length: 100 }), // DOCX, PDF, etc.
  camposVariaveis: text("camposVariaveis"), // JSON com campos que podem ser preenchidos
  ativo: int("ativo").default(1).notNull(),
  vezesUsado: int("vezesUsado").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Modelo = typeof modelos.$inferSelect;
export type InsertModelo = typeof modelos.$inferInsert;

/**
 * Tabela de documentos gerados a partir de modelos
 */
export const documentosGerados = mysqlTable("documentosGerados", {
  id: int("id").autoincrement().primaryKey(),
  modeloId: int("modeloId").references(() => modelos.id, { onDelete: "set null" }),
  nomeDocumento: varchar("nomeDocumento", { length: 255 }).notNull(),
  arquivoUrl: text("arquivoUrl").notNull(),
  destinatarioNome: varchar("destinatarioNome", { length: 255 }),
  destinatarioEmail: varchar("destinatarioEmail", { length: 320 }),
  destinatarioTelefone: varchar("destinatarioTelefone", { length: 50 }),
  dadosPreenchidos: text("dadosPreenchidos"), // JSON com os dados que foram preenchidos
  statusEnvio: mysqlEnum("statusEnvio", ["Não Enviado", "Enviado Email", "Enviado WhatsApp", "Ambos"]).default("Não Enviado"),
  dataEnvio: timestamp("dataEnvio"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentoGerado = typeof documentosGerados.$inferSelect;
export type InsertDocumentoGerado = typeof documentosGerados.$inferInsert;

/**
 * Tabela de relatórios gerados
 * Armazena histórico de relatórios mensais em PDF
 */
export const relatorios = mysqlTable("relatorios", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["Missões", "Multas", "Consolidado"]).notNull(),
  mes: int("mes").notNull(), // 1-12
  ano: int("ano").notNull(),
  arquivoUrl: text("arquivoUrl").notNull(), // URL do PDF no S3
  arquivoNome: varchar("arquivoNome", { length: 255 }).notNull(),
  // Dados agregados do relatório (JSON)
  dadosAgregados: text("dadosAgregados"),
  // Estatísticas resumidas
  totalMissoes: int("totalMissoes"),
  totalMultas: int("totalMultas"),
  receitaMissoes: int("receitaMissoes"), // em centavos
  valorMultas: int("valorMultas"), // em centavos
  geradoPor: int("geradoPor").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Relatorio = typeof relatorios.$inferSelect;
export type InsertRelatorio = typeof relatorios.$inferInsert;

/**
 * Tabela de notificações agendadas e enviadas
 * Armazena histórico de notificações automáticas
 */
export const notificacoes = mysqlTable("notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  tipo: mysqlEnum("tipo", ["Missão", "Multa"]).notNull(),
  referenciaId: int("referenciaId").notNull(), // ID da missão ou multa
  canal: mysqlEnum("canal", ["Email", "WhatsApp", "Ambos"]).notNull(),
  destinatario: varchar("destinatario", { length: 320 }).notNull(), // Email ou telefone
  assunto: varchar("assunto", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  dataAgendamento: timestamp("dataAgendamento").notNull(), // Quando deve ser enviada
  dataEnvio: timestamp("dataEnvio"), // Quando foi realmente enviada
  status: mysqlEnum("status", ["Agendada", "Enviada", "Erro", "Cancelada"]).default("Agendada").notNull(),
  erroMensagem: text("erroMensagem"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = typeof notificacoes.$inferInsert;

/**
 * Tabela de conversas do WhatsApp
 * Armazena histórico de conversas com clientes
 */
export const conversasWhatsapp = mysqlTable("conversasWhatsapp", {
  id: int("id").autoincrement().primaryKey(),
  numeroCliente: varchar("numeroCliente", { length: 20 }).notNull(),
  nomeCliente: varchar("nomeCliente", { length: 255 }),
  ultimaMensagem: text("ultimaMensagem"),
  dataUltimaMsg: timestamp("dataUltimaMsg"),
  statusConversa: mysqlEnum("statusConversa", ["Ativa", "Arquivada", "Bloqueada"]).default("Ativa").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConversaWhatsapp = typeof conversasWhatsapp.$inferSelect;
export type InsertConversaWhatsapp = typeof conversasWhatsapp.$inferInsert;

/**
 * Tabela de mensagens do WhatsApp
 * Armazena todas as mensagens trocadas com clientes
 */
export const mensagensWhatsapp = mysqlTable("mensagensWhatsapp", {
  id: int("id").autoincrement().primaryKey(),
  conversaId: int("conversaId").references(() => conversasWhatsapp.id, { onDelete: "cascade" }).notNull(),
  remetente: mysqlEnum("remetente", ["Cliente", "Sistema"]).notNull(),
  mensagem: text("mensagem").notNull(),
  tipo: mysqlEnum("tipo", ["Texto", "Imagem", "Documento", "Áudio", "Vídeo"]).default("Texto").notNull(),
  anexoUrl: text("anexoUrl"), // URL do arquivo anexado
  dataEnvio: timestamp("dataEnvio").notNull(),
  statusEnvio: mysqlEnum("statusEnvio", ["Pendente", "Processando", "Enviado", "Falhou"]).default("Pendente").notNull(),
  lida: int("lida").default(0).notNull(), // Boolean (0 ou 1)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MensagemWhatsapp = typeof mensagensWhatsapp.$inferSelect;
export type InsertMensagemWhatsapp = typeof mensagensWhatsapp.$inferInsert;

/**
 * Tabela de templates de respostas do WhatsApp
 * Armazena respostas pré-configuradas com variáveis dinâmicas
 */
export const templatesWhatsapp = mysqlTable("templatesWhatsapp", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  conteudo: text("conteudo").notNull(),
  variaveis: text("variaveis"), // JSON array com variáveis: ["{{nome}}", "{{email}}", "{{telefone}}"]
  categoria: varchar("categoria", { length: 100 }), // Ex: "Orçamento", "Agendamento", "Suporte"
  ativo: int("ativo").default(1).notNull(),
  vezesUsado: int("vezesUsado").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TemplateWhatsapp = typeof templatesWhatsapp.$inferSelect;
export type InsertTemplateWhatsapp = typeof templatesWhatsapp.$inferInsert;

/**
 * Tabela de documentos do WhatsApp
 * Armazena documentos que podem ser consultados pela IA para contexto
 */
export const documentosWhatsapp = mysqlTable("documentosWhatsapp", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  urlArquivo: text("urlArquivo").notNull(),
  tipoArquivo: varchar("tipoArquivo", { length: 100 }), // PDF, DOCX, TXT, etc.
  tamanhoBytes: int("tamanhoBytes"),
  descricao: text("descricao"),
  conteudoExtraido: text("conteudoExtraido"), // Texto extraído do documento para busca
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DocumentoWhatsapp = typeof documentosWhatsapp.$inferSelect;
export type InsertDocumentoWhatsapp = typeof documentosWhatsapp.$inferInsert;

/**
 * Tabela de abas personalizadas criadas pelo usuário
 */
export const abasPersonalizadas = mysqlTable("abasPersonalizadas", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  icone: varchar("icone", { length: 50 }), // Nome do ícone Lucide
  rota: varchar("rota", { length: 255 }).notNull().unique(), // Ex: /minha-aba
  ordem: int("ordem").default(0).notNull(), // Ordem de exibição no menu
  abaPaiId: int("abaPaiId"), // FK para criar sub-abas
  ativo: int("ativo").default(1).notNull(), // Boolean
  userId: int("userId").notNull(), // Usuário que criou
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AbaPersonalizada = typeof abasPersonalizadas.$inferSelect;
export type InsertAbaPersonalizada = typeof abasPersonalizadas.$inferInsert;

/**
 * Tabela de campos personalizados para cada aba
 */
export const camposPersonalizados = mysqlTable("camposPersonalizados", {
  id: int("id").autoincrement().primaryKey(),
  abaId: int("abaId").notNull(), // FK para abasPersonalizadas
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["texto", "numero", "data", "email", "telefone", "select", "checkbox", "textarea", "arquivo", "moeda"]).notNull(),
  opcoes: text("opcoes"), // JSON array para tipo "select"
  obrigatorio: int("obrigatorio").default(0).notNull(), // Boolean
  ordem: int("ordem").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampoPersonalizado = typeof camposPersonalizados.$inferSelect;
export type InsertCampoPersonalizado = typeof camposPersonalizados.$inferInsert;

/**
 * Tabela de dados das abas personalizadas
 */
export const dadosAbasPersonalizadas = mysqlTable("dadosAbasPersonalizadas", {
  id: int("id").autoincrement().primaryKey(),
  abaId: int("abaId").notNull(), // FK para abasPersonalizadas
  dados: text("dados").notNull(), // JSON com todos os valores dos campos
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DadoAbaPersonalizada = typeof dadosAbasPersonalizadas.$inferSelect;
export type InsertDadoAbaPersonalizada = typeof dadosAbasPersonalizadas.$inferInsert;

/**
 * Tabela de relacionamentos entre abas (conciliação)
 */
export const relacionamentosAbas = mysqlTable("relacionamentosAbas", {
  id: int("id").autoincrement().primaryKey(),
  abaOrigemId: int("abaOrigemId").notNull(), // FK para abasPersonalizadas
  abaDestinoId: int("abaDestinoId").notNull(), // FK para abasPersonalizadas
  campoOrigemId: int("campoOrigemId").notNull(), // FK para camposPersonalizados
  campoDestinoId: int("campoDestinoId").notNull(), // FK para camposPersonalizados
  tipoRelacionamento: mysqlEnum("tipoRelacionamento", ["um-para-um", "um-para-muitos", "muitos-para-muitos"]).notNull(),
  ativo: int("ativo").default(1).notNull(), // Boolean
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RelacionamentoAba = typeof relacionamentosAbas.$inferSelect;
export type InsertRelacionamentoAba = typeof relacionamentosAbas.$inferInsert;

/**
 * Tabela de customizações visuais por aba
 */
export const customizacoesVisuais = mysqlTable("customizacoesVisuais", {
  id: int("id").autoincrement().primaryKey(),
  abaId: int("abaId").notNull(), // FK para abasPersonalizadas (ou NULL para abas fixas)
  rotaPagina: varchar("rotaPagina", { length: 255 }), // Ex: /missoes, /caixa
  corPrimaria: varchar("corPrimaria", { length: 7 }).default("#3b82f6"), // Hex color
  corSecundaria: varchar("corSecundaria", { length: 7 }).default("#10b981"), // Hex color
  corFundo: varchar("corFundo", { length: 7 }).default("#f9fafb"), // Hex color
  fonteFamilia: varchar("fonteFamilia", { length: 100 }).default("Inter"), // Nome da fonte
  fonteTamanho: int("fonteTamanho").default(16), // Tamanho base em px
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomizacaoVisual = typeof customizacoesVisuais.$inferSelect;
export type InsertCustomizacaoVisual = typeof customizacoesVisuais.$inferInsert;

/**
 * Tabela de configurações de exportação por aba
 */
export const configuracoesExportacao = mysqlTable("configuracoesExportacao", {
  id: int("id").autoincrement().primaryKey(),
  abaId: int("abaId").notNull(), // FK para abasPersonalizadas
  pastaDestino: text("pastaDestino"), // Caminho da pasta ou URL
  modeloDocumentoId: int("modeloDocumentoId"), // FK para modelos (tabela existente)
  canalExportacao: mysqlEnum("canalExportacao", ["whatsapp", "email", "ambos"]).default("email").notNull(),
  destinatarioPadrao: text("destinatarioPadrao"), // Email ou telefone padrão
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConfiguracaoExportacao = typeof configuracoesExportacao.$inferSelect;
export type InsertConfiguracaoExportacao = typeof configuracoesExportacao.$inferInsert;

/**
 * Tabela de instruções de IA por aba
 */
export const instrucoesIA = mysqlTable("instrucoesIA", {
  id: int("id").autoincrement().primaryKey(),
  abaId: int("abaId").notNull(), // FK para abasPersonalizadas
  nomeInstrucao: varchar("nomeInstrucao", { length: 255 }).notNull(),
  instrucao: text("instrucao").notNull(), // Texto da instrução para a IA
  parametros: text("parametros"), // JSON com parâmetros dinâmicos
  ativo: int("ativo").default(1).notNull(), // Boolean
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InstrucaoIA = typeof instrucoesIA.$inferSelect;
export type InsertInstrucaoIA = typeof instrucoesIA.$inferInsert;
