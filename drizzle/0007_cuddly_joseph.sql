CREATE TABLE `linksCobranca` (
	`id` int AUTO_INCREMENT NOT NULL,
	`stripeCheckoutSessionId` varchar(255),
	`stripePaymentIntentId` varchar(255),
	`clienteNome` varchar(255),
	`clienteEmail` varchar(320),
	`clienteTelefone` varchar(50),
	`valorTotal` int NOT NULL,
	`desconto` int DEFAULT 0,
	`status` enum('Pendente','Pago','Cancelado','Expirado') NOT NULL DEFAULT 'Pendente',
	`servicosIds` text,
	`observacoes` text,
	`linkCheckout` text,
	`dataPagamento` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `linksCobranca_id` PRIMARY KEY(`id`),
	CONSTRAINT `linksCobranca_stripeCheckoutSessionId_unique` UNIQUE(`stripeCheckoutSessionId`)
);
--> statement-breakpoint
CREATE TABLE `servicos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`descricao` text,
	`preco` int NOT NULL,
	`ativo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `servicos_id` PRIMARY KEY(`id`)
);
