# TODO - Mini-ERP com Automação Manus

## Funcionalidades Planejadas

### Fase 1: Banco de Dados e Estrutura
- [x] Criar tabela `registros` para armazenar dados consolidados
- [x] Criar tabela `tarefas` para agendamento
- [x] Definir esquema com colunas: Assunto, Categoria, Cliente/Fornecedor, Nº Documento, Datas, Valor, Status, Origem

### Fase 2: Backend (tRPC Procedures)
- [x] Implementar procedure para listar registros consolidados
- [x] Implementar procedure para criar novo registro
- [x] Implementar procedure para atualizar registro existente
- [x] Implementar procedure para deletar registro
- [x] Implementar procedure para listar tarefas agendadas
- [x] Implementar procedure para criar tarefa
- [x] Implementar lógica de agrupamento por chave (Cliente/Fornecedor + Nº Documento)

### Fase 3: Frontend (Interface)
- [x] Criar página de dashboard com lista de registros
- [x] Criar formulário para adicionar/editar registros manualmente
- [ ] Criar visualização de tarefas agendadas
- [ ] Implementar filtros e busca por categoria, status, cliente
- [x] Adicionar indicadores visuais para status (Pendente, Pago, Realizado)

### Fase 4: API de Integração
- [x] Criar endpoint público para receber dados do Manus (webhook)
- [x] Implementar parser de dados recebidos (JSON)
- [x] Aplicar lógica de deduplicação usando chave de agrupamento
- [x] Criar tarefa automaticamente com base na data de vencimento

### Fase 5: Testes e Checkpoint
- [x] Testar CRUD de registros via interface
- [x] Testar criação de tarefas automáticas
- [x] Testar webhook de integração com dados simulados
- [x] Criar checkpoint final do projeto

### Fase 6: Entrega
- [x] Documentar instruções de uso do sistema
- [x] Documentar como configurar o Manus para enviar dados ao webhook
- [x] Entregar ao usuário com exemplos de uso

## Nova Funcionalidade: Sistema de Notificações por E-mail

### Implementação
- [x] Criar função para verificar tarefas próximas do vencimento (3 dias)
- [x] Implementar envio de e-mail usando API do Manus
- [x] Criar endpoint de agendamento para verificação periódica
- [ ] Adicionar testes para o sistema de notificações
- [ ] Documentar o uso do sistema de notificações

## Melhoria de Layout: Dashboard Intuitivo

### Implementação
- [x] Adicionar navegação lateral com seções (Registros, Tarefas, Notificações)
- [x] Criar cards de resumo com estatísticas (total de registros, tarefas pendentes, etc.)
- [x] Adicionar filtros visuais por categoria e status
- [x] Criar visualização dedicada para tarefas com indicadores de urgência
- [x] Garantir design responsivo para dispositivos móveis

## Sistema de Gestão de Missões com WhatsApp

### Fase 1: Banco de Dados e Códigos de Missão
- [x] Criar tabela `missoes` com código único, cliente, status, data
- [x] Criar tabela `arquivos_missao` para armazenar arquivos vinculados
- [x] Implementar gerador automático de códigos de missão (MISS-YYYY-NNN)
- [x] Criar CRUD de missões no backend

### Fase 2: Processador de Arquivos
- [x] Implementar parser de arquivos Excel
- [x] Implementar extração de texto de arquivos Word
- [x] Implementar processamento e armazenamento de imagens
- [x] Criar sistema de vinculação de arquivos à missão via código

### Fase 3: Gerador de Relatórios
- [ ] Criar gerador de planilha Excel consolidada
- [ ] Implementar gerador de relatório PDF com imagens
- [ ] Adicionar formatação profissional aos relatórios
- [ ] Criar sistema de download de relatórios compilados

### Fase 4: Gerador de Relatórios
- [ ] Criar gerador de planilha Excel consolidada
- [ ] Implementar gerador de relatório PDF com imagens
- [ ] Adicionar formatação profissional aos relatórios

### Fase 5: Webhook e Automação
- [ ] Criar webhook para receber dados do WhatsApp
- [ ] Implementar identificação automática de código de missão
- [ ] Criar sistema de resposta automática ao cliente
- [ ] Implementar envio de relatório compilado via WhatsApp

### Fase 6: Testes e Documentação
- [ ] Testar fluxo completo de ponta a ponta
- [ ] Criar documentação de uso para motoristas
- [ ] Criar checkpoint final

## Sistema de Calendário Integrado

### Fase 1: Banco de Dados de Eventos
- [ ] Criar tabela `eventos` com título, data, tipo, cor, missãoId, tarefaId
- [ ] Implementar CRUD de eventos no backend
- [ ] Criar sistema de categorização por cores

### Fase 2: Componente de Calendário
- [ ] Instalar e configurar FullCalendar
- [ ] Criar componente de calendário interativo
- [ ] Implementar visualizações (mensal, semanal, diária)
- [ ] Adicionar drag-and-drop para reagendar eventos

### Fase 3: Sistema de Alertas
- [ ] Criar lógica de alertas por cor (vermelho, amarelo, verde, azul)
- [ ] Implementar notificações por e-mail automáticas
- [ ] Criar badge de contador de eventos urgentes
- [ ] Implementar resumo diário por e-mail

### Fase 4: Integração Google Calendar
- [ ] Configurar Google Calendar API
- [ ] Implementar importação de eventos do Google Calendar
- [ ] Implementar exportação para Google Calendar
- [ ] Criar exportação em formato .ics

### Fase 5: Botões de Calendário
- [ ] Adicionar botão "Adicionar ao Calendário" em missões
- [ ] Adicionar botão "Adicionar ao Calendário" em tarefas
- [ ] Adicionar botão "Adicionar ao Calendário" em registros
- [ ] Criar sincronização automática ao criar novos itens

### Fase 6: Webhook e Testes
- [ ] Finalizar webhook do WhatsApp para processar arquivos
- [ ] Testar fluxo completo de ponta a ponta
- [ ] Criar documentação de uso
