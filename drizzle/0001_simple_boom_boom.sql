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
ALTER TABLE `tarefas` ADD CONSTRAINT `tarefas_registroId_registros_id_fk` FOREIGN KEY (`registroId`) REFERENCES `registros`(`id`) ON DELETE cascade ON UPDATE no action;