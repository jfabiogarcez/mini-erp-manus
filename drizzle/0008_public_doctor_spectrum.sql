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
CREATE TABLE `modelos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`categoria` enum('Orçamento','Contrato','Proposta','Relatório','Carta','Outros') NOT NULL DEFAULT 'Outros',
	`arquivoUrl` text NOT NULL,
	`arquivoNome` varchar(255),
	`tipoArquivo` varchar(50),
	`camposVariaveis` text,
	`ativo` int NOT NULL DEFAULT 1,
	`vezesUsado` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `modelos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `documentosGerados` ADD CONSTRAINT `documentosGerados_modeloId_modelos_id_fk` FOREIGN KEY (`modeloId`) REFERENCES `modelos`(`id`) ON DELETE set null ON UPDATE no action;