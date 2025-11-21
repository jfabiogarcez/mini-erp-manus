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
CREATE TABLE `missoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`codigoMissao` varchar(50) NOT NULL,
	`cliente` text,
	`motorista` text,
	`status` enum('Pendente','Em Andamento','Concluída','Cancelada') NOT NULL DEFAULT 'Pendente',
	`dataInicio` timestamp,
	`dataFim` timestamp,
	`observacoes` text,
	`linkGoogleDrive` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `missoes_id` PRIMARY KEY(`id`),
	CONSTRAINT `missoes_codigoMissao_unique` UNIQUE(`codigoMissao`)
);
