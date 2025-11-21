CREATE TABLE `conversasWhatsapp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`telefoneContato` varchar(20) NOT NULL,
	`nomeContato` varchar(255),
	`tipoContato` enum('Cliente','Motorista','Fornecedor') NOT NULL,
	`contatoId` int,
	`ultimaMensagem` text,
	`dataUltimaMensagem` timestamp,
	`contextoConversas` text,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversasWhatsapp_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mensagensWhatsapp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversaId` int NOT NULL,
	`telefoneOrigem` varchar(20) NOT NULL,
	`telefoneDestino` varchar(20) NOT NULL,
	`conteudo` text NOT NULL,
	`tipo` enum('Entrada','Saída') NOT NULL,
	`statusEntrega` enum('Enviada','Entregue','Lida','Erro') NOT NULL DEFAULT 'Enviada',
	`idTwilio` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mensagensWhatsapp_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `mensagensWhatsapp` ADD CONSTRAINT `mensagensWhatsapp_conversaId_conversasWhatsapp_id_fk` FOREIGN KEY (`conversaId`) REFERENCES `conversasWhatsapp`(`id`) ON DELETE cascade ON UPDATE no action;