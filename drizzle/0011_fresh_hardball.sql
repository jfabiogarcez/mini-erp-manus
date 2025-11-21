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
ALTER TABLE `relatorios` ADD CONSTRAINT `relatorios_geradoPor_users_id_fk` FOREIGN KEY (`geradoPor`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;