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
