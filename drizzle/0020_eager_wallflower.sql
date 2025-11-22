CREATE TABLE `acoesUsuario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipoAcao` varchar(50) NOT NULL,
	`contexto` text NOT NULL,
	`resultado` text,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `acoesUsuario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aprendizados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text NOT NULL,
	`categoria` varchar(100),
	`ordem` int DEFAULT 0,
	`ativo` int NOT NULL DEFAULT 1,
	`aprendidoAutomaticamente` int DEFAULT 0,
	`confianca` int DEFAULT 100,
	`vezesAplicado` int DEFAULT 0,
	`ultimaAplicacao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aprendizados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `arquivosMissao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`missaoId` int NOT NULL,
	`tipoArquivo` enum('Excel','Word','Imagem','PDF','Outro') NOT NULL,
	`nomeArquivo` text NOT NULL,
	`urlArquivo` text NOT NULL,
	`tamanhoBytes` int,
	`metadados` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `arquivosMissao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `configuracaoIA` (
	`id` int AUTO_INCREMENT NOT NULL,
	`iaLigada` int NOT NULL DEFAULT 0,
	`confiancaMinima` int NOT NULL DEFAULT 80,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracaoIA_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversasWhatsapp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numeroCliente` varchar(20) NOT NULL,
	`nomeCliente` varchar(255),
	`ultimaMensagem` text,
	`dataUltimaMsg` timestamp,
	`statusConversa` enum('Ativa','Arquivada','Bloqueada') NOT NULL DEFAULT 'Ativa',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversasWhatsapp_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documentosGerados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`modeloId` int,
	`nomeDocumento` varchar(255) NOT NULL,
	`arquivoUrl` text NOT NULL,
	`destinatarioNome` varchar(255),
	`destinatarioEmail` varchar(320),
	`destinatarioTelefone` varchar(50),
	`dadosPreenchidos` text,
	`statusEnvio` enum('Não Enviado','Enviado Email','Enviado WhatsApp','Ambos') DEFAULT 'Não Enviado',
	`dataEnvio` timestamp,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documentosGerados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `documentosWhatsapp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`urlArquivo` text NOT NULL,
	`tipoArquivo` varchar(100),
	`tamanhoBytes` int,
	`descricao` text,
	`conteudoExtraido` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documentosWhatsapp_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eventos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` text NOT NULL,
	`descricao` text,
	`dataInicio` timestamp NOT NULL,
	`dataFim` timestamp,
	`tipo` enum('Missão','Tarefa','Registro','Outro') NOT NULL,
	`cor` varchar(7) NOT NULL DEFAULT '#0433ff',
	`missaoId` int,
	`tarefaId` int,
	`registroId` int,
	`googleCalendarEventId` text,
	`alertaEnviado` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eventos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `linksCobranca` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stripeCheckoutSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`clienteNome` varchar(255),
	`clienteEmail` varchar(320),
	`clienteTelefone` varchar(50),
	`valorTotal` int NOT NULL,
	`desconto` int DEFAULT 0,
	`status` enum('Pendente','Pago','Cancelado','Expirado') NOT NULL DEFAULT 'Pendente',
	`servicosIds` text,
	`observacoes` text,
	`linkCheckout` text,
	`dataPagamento` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `linksCobranca_id` PRIMARY KEY(`id`),
	CONSTRAINT `linksCobranca_stripeCheckoutSessionId_unique` UNIQUE(`stripeCheckoutSessionId`)
);
--> statement-breakpoint
CREATE TABLE `membrosEquipe` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`fotoUrl` text,
	`email` varchar(320),
	`telefone` varchar(20),
	`whatsapp` varchar(20),
	`cpf` varchar(14),
	`tipo` enum('Motorista','Segurança','Receptivo') NOT NULL,
	`dadosBancarios` text,
	`chavePix` varchar(255),
	`endereco` text,
	`documentos` text,
	`ativo` int NOT NULL DEFAULT 1,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `membrosEquipe_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mensagensWhatsapp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversaId` int NOT NULL,
	`remetente` enum('Cliente','Sistema') NOT NULL,
	`mensagem` text NOT NULL,
	`tipo` enum('Texto','Imagem','Documento','Áudio','Vídeo') NOT NULL DEFAULT 'Texto',
	`anexoUrl` text,
	`dataEnvio` timestamp NOT NULL,
	`statusEnvio` enum('Pendente','Processando','Enviado','Falhou') NOT NULL DEFAULT 'Pendente',
	`lida` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mensagensWhatsapp_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `missoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigoMissao` varchar(50) NOT NULL,
	`data` timestamp NOT NULL,
	`cliente` text,
	`servico` varchar(255),
	`origem` text,
	`destino` text,
	`motorista` text,
	`motorista_id` int,
	`veiculo` varchar(100),
	`veiculo_placa` varchar(20),
	`valor` int DEFAULT 0,
	`status` enum('Agendada','Em Andamento','Concluída','Cancelada') NOT NULL DEFAULT 'Agendada',
	`dataInicio` timestamp,
	`dataFim` timestamp,
	`horaInicio` varchar(10),
	`horaFim` varchar(10),
	`observacoes` text,
	`linkGoogleDrive` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `missoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `missoes_codigoMissao_unique` UNIQUE(`codigoMissao`)
);
--> statement-breakpoint
CREATE TABLE `modelos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`categoria` enum('Orçamento','Contrato','Proposta','Relatório','Carta','Outros') NOT NULL DEFAULT 'Outros',
	`arquivoUrl` text NOT NULL,
	`arquivoNome` varchar(255),
	`tipoArquivo` varchar(100),
	`camposVariaveis` text,
	`ativo` int NOT NULL DEFAULT 1,
	`vezesUsado` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `modelos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `multas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero_auto` varchar(100),
	`data_infracao` timestamp,
	`hora_infracao` varchar(10),
	`local_infracao` text,
	`codigo_infracao` varchar(50),
	`descricao_infracao` text,
	`valor` int DEFAULT 0,
	`pontos` int DEFAULT 0,
	`veiculo_placa` varchar(20),
	`motorista_id` int,
	`data_vencimento` timestamp,
	`status` enum('Pendente','Pago','Recorrido','Cancelado') NOT NULL DEFAULT 'Pendente',
	`pdf_url` text,
	`observacoes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `multas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('Missão','Multa') NOT NULL,
	`referenciaId` int NOT NULL,
	`canal` enum('Email','WhatsApp','Ambos') NOT NULL,
	`destinatario` varchar(320) NOT NULL,
	`assunto` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`dataAgendamento` timestamp NOT NULL,
	`dataEnvio` timestamp,
	`status` enum('Agendada','Enviada','Erro','Cancelada') NOT NULL DEFAULT 'Agendada',
	`erroMensagem` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `padroesAprendidos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipoPadrao` varchar(50) NOT NULL,
	`condicao` text NOT NULL,
	`acao` text NOT NULL,
	`confianca` int NOT NULL DEFAULT 0,
	`vezesAplicado` int NOT NULL DEFAULT 0,
	`vezesCorreto` int NOT NULL DEFAULT 0,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `padroesAprendidos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `registros` (
	`id` int AUTO_INCREMENT NOT NULL,
	`assunto` text NOT NULL,
	`categoria` varchar(100) NOT NULL,
	`clienteFornecedor` text,
	`nDocumentoPedido` varchar(255),
	`dataDocumento` timestamp,
	`dataVencimento` timestamp,
	`valorTotal` int DEFAULT 0,
	`status` varchar(50) NOT NULL DEFAULT 'Pendente',
	`origemArquivo` text,
	`origemAba` text,
	`observacoes` text,
	`chaveAgrupamento` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `registros_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relatorios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('Missões','Multas','Consolidado') NOT NULL,
	`mes` int NOT NULL,
	`ano` int NOT NULL,
	`arquivoUrl` text NOT NULL,
	`arquivoNome` varchar(255) NOT NULL,
	`dadosAgregados` text,
	`totalMissoes` int,
	`totalMultas` int,
	`receitaMissoes` int,
	`valorMultas` int,
	`geradoPor` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `relatorios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `servicos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`preco` int NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `servicos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tarefas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` text NOT NULL,
	`descricao` text,
	`dataVencimento` timestamp NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'Pendente',
	`registroId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tarefas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `templatesWhatsapp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`variaveis` text,
	`categoria` varchar(100),
	`ativo` int NOT NULL DEFAULT 1,
	`vezesUsado` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `templatesWhatsapp_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `documentosGerados` ADD CONSTRAINT `documentosGerados_modeloId_modelos_id_fk` FOREIGN KEY (`modeloId`) REFERENCES `modelos`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mensagensWhatsapp` ADD CONSTRAINT `mensagensWhatsapp_conversaId_conversasWhatsapp_id_fk` FOREIGN KEY (`conversaId`) REFERENCES `conversasWhatsapp`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `relatorios` ADD CONSTRAINT `relatorios_geradoPor_users_id_fk` FOREIGN KEY (`geradoPor`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tarefas` ADD CONSTRAINT `tarefas_registroId_registros_id_fk` FOREIGN KEY (`registroId`) REFERENCES `registros`(`id`) ON DELETE cascade ON UPDATE no action;