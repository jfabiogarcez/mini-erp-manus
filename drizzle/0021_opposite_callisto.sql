CREATE TABLE `abasPersonalizadas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`icone` varchar(50),
	`rota` varchar(255) NOT NULL,
	`ordem` int NOT NULL DEFAULT 0,
	`abaPaiId` int,
	`ativo` int NOT NULL DEFAULT 1,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `abasPersonalizadas_id` PRIMARY KEY(`id`),
	CONSTRAINT `abasPersonalizadas_rota_unique` UNIQUE(`rota`)
);
--> statement-breakpoint
CREATE TABLE `camposPersonalizados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`abaId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` enum('texto','numero','data','email','telefone','select','checkbox','textarea','arquivo','moeda') NOT NULL,
	`opcoes` text,
	`obrigatorio` int NOT NULL DEFAULT 0,
	`ordem` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `camposPersonalizados_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `configuracoesExportacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`abaId` int NOT NULL,
	`pastaDestino` text,
	`modeloDocumentoId` int,
	`canalExportacao` enum('whatsapp','email','ambos') NOT NULL DEFAULT 'email',
	`destinatarioPadrao` text,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracoesExportacao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customizacoesVisuais` (
	`id` int AUTO_INCREMENT NOT NULL,
	`abaId` int NOT NULL,
	`rotaPagina` varchar(255),
	`corPrimaria` varchar(7) DEFAULT '#3b82f6',
	`corSecundaria` varchar(7) DEFAULT '#10b981',
	`corFundo` varchar(7) DEFAULT '#f9fafb',
	`fonteFamilia` varchar(100) DEFAULT 'Inter',
	`fonteTamanho` int DEFAULT 16,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customizacoesVisuais_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dadosAbasPersonalizadas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`abaId` int NOT NULL,
	`dados` text NOT NULL,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dadosAbasPersonalizadas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `instrucoesIA` (
	`id` int AUTO_INCREMENT NOT NULL,
	`abaId` int NOT NULL,
	`nomeInstrucao` varchar(255) NOT NULL,
	`instrucao` text NOT NULL,
	`parametros` text,
	`ativo` int NOT NULL DEFAULT 1,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `instrucoesIA_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relacionamentosAbas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`abaOrigemId` int NOT NULL,
	`abaDestinoId` int NOT NULL,
	`campoOrigemId` int NOT NULL,
	`campoDestinoId` int NOT NULL,
	`tipoRelacionamento` enum('um-para-um','um-para-muitos','muitos-para-muitos') NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `relacionamentosAbas_id` PRIMARY KEY(`id`)
);
