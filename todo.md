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
- [ ] Testar webhook de integração com dados simulados
- [ ] Criar checkpoint final do projeto

### Fase 6: Entrega
- [ ] Documentar instruções de uso do sistema
- [ ] Documentar como configurar o Manus para enviar dados ao webhook
- [ ] Entregar ao usuário com exemplos de uso
