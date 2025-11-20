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
