ALTER TABLE `missoes` MODIFY COLUMN `status` enum('Agendada','Em Andamento','Concluída','Cancelada') NOT NULL DEFAULT 'Agendada';--> statement-breakpoint
ALTER TABLE `missoes` ADD `data` timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE `missoes` ADD `servico` varchar(255);--> statement-breakpoint
ALTER TABLE `missoes` ADD `origem` text;--> statement-breakpoint
ALTER TABLE `missoes` ADD `destino` text;--> statement-breakpoint
ALTER TABLE `missoes` ADD `motorista_id` int;--> statement-breakpoint
ALTER TABLE `missoes` ADD `veiculo` varchar(100);--> statement-breakpoint
ALTER TABLE `missoes` ADD `veiculo_placa` varchar(20);--> statement-breakpoint
ALTER TABLE `missoes` ADD `valor` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `missoes` ADD `horaInicio` varchar(10);--> statement-breakpoint
ALTER TABLE `missoes` ADD `horaFim` varchar(10);