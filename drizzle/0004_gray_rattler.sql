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
CREATE TABLE `configuracaoIA` (
	`id` int AUTO_INCREMENT NOT NULL,
	`iaLigada` int NOT NULL DEFAULT 0,
	`confiancaMinima` int NOT NULL DEFAULT 80,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `configuracaoIA_id` PRIMARY KEY(`id`)
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
