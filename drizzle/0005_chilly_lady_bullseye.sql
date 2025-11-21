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
