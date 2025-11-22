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
