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

## Sistema de IA Adaptativa

### Fase 1: Banco de Dados de Aprendizado
- [x] Criar tabela `acoes_usuario` para registrar todas as ações
- [x] Criar tabela `padroes_aprendidos` para armazenar regras identificadas
- [x] Criar tabela `configuracao_ia` para armazenar estado (ligada/desligada)
- [x] Implementar CRUD de ações e padrões

### Fase 2: Sistema de Captura e Aprendizado
- [x] Implementar middleware para capturar ações do usuário
- [x] Criar algoritmo de identificação de padrões
- [x] Implementar sistema de análise de frequência de ações
- [x] Criar gerador de regras automáticas baseado em padrões

### Fase 3: Interface de Controle da IA
- [x] Criar botão de toggle (Liga/Desliga) no dashboard
- [x] Adicionar indicador visual do modo atual (🔴/🟫)
- [x] Criar painel de estatísticas da IA
- [x] Implementar painel de confiança (% de certeza)
- [ ] Adicionar histórico de ações automáticas

### Fase 4: Motor de Execução Automática
- [ ] Implementar executor de ações baseado em padrões
- [ ] Criar sistema de validação de confiança antes de executar
- [ ] Implementar possibilidade de reverter ações automáticas
- [ ] Criar notificações de ações executadas automaticamente

### Fase 5: Testes e Checkpoint
- [ ] Testar modo de aprendizado
- [ ] Testar modo automático
- [ ] Validar reversão de ações
- [ ] Criar checkpoint final

## Módulos de WhatsApp, E-mail e Equipe

### Fase 1: Banco de Dados
- [x] Criar tabela `membros_equipe` (id, nome, foto_url, email, telefone, cpf, tipo, dados_bancarios, chave_pix, endereco, documentos, ativo, created_at, updated_at)
- [ ] Criar tabela `mensagens_whatsapp` (id, numero_origem, mensagem, anexos, data_recebimento, processado)
- [ ] Criar tabela `emails_recebidos` (id, remetente, assunto, corpo, anexos, data_recebimento, processado)

### Fase 2: Backend
- [x] Implementar CRUD de membros da equipe
- [ ] Implementar upload de fotos e documentos
- [ ] Criar endpoints para WhatsApp e E-mail
- [x] Implementar filtros por tipo de membro (Motorista, Segurança, Receptivo)

### Fase 3: Interface de Equipe
- [ ] Criar página de listagem de membros da equipe
- [ ] Criar formulário de cadastro completo de membros
- [ ] Implementar upload de foto e documentos
- [ ] Adicionar filtros por tipo (Motorista, Segurança, Receptivo)

### Fase 4: Módulos de Comunicação
- [x] Adicionar item "WhatsApp" no menu lateral
- [x] Adicionar item "E-mail" no menu lateral
- [x] Adicionar item "Equipe" no menu lateral com submenus
- [ ] Criar páginas de WhatsApp e E-mail

### Fase 5: Testes e Checkpoint
- [ ] Testar cadastro de membros
- [ ] Testar upload de arquivos
- [ ] Criar checkpoint final

## Implementação Completa: Equipe, WhatsApp, E-mail, Calendário e Multas

### Fase 1: Banco de Dados de Multas
- [x] Criar tabela `multas` (id, numero_auto, data_infracao, hora_infracao, local_infracao, codigo_infracao, descricao_infracao, valor, pontos, veiculo_placa, motorista_id, data_vencimento, status, pdf_url, observacoes, created_at, updated_at)
- [x] Atualizar esquema do banco de dados

### Fase 2: Página de Gestão de Equipe
- [x] Criar página de listagem de membros com cards visuais
- [x] Criar formulário de cadastro completo com upload de foto
- [ ] Implementar upload de documentos (RG, CNH, etc.)
- [ ] Adicionar funcionalidade de upload de Excel para cadastro em massa
- [x] Implementar filtros por tipo (Motorista/Segurança/Receptivo)

### Fase 3: Páginas de WhatsApp e E-mail
- [ ] Criar página de WhatsApp com histórico de mensagens
- [ ] Criar página de E-mail com histórico de mensagens recebidas
- [ ] Implementar processamento automático de anexos
- [ ] Adicionar vinculação com missões existentes

### Fase 4: Calendário Visual Interativo
- [ ] Instalar e configurar FullCalendar
- [ ] Criar componente de calendário com visualizações (mensal/semanal/diária)
- [ ] Implementar eventos coloridos por urgência
- [ ] Adicionar drag-and-drop para reagendar eventos
- [ ] Sincronizar automaticamente com missões e tarefas
- [ ] Adicionar botão "Adicionar ao Calendário" em missões, tarefas e registros

### Fase 5: Módulo de Multas
- [ ] Criar página de listagem de multas
- [ ] Implementar upload de PDF de multas (individual)
- [ ] Implementar upload em lote de múltiplos PDFs
- [ ] Criar extração automática de dados do PDF usando IA
- [ ] Adicionar formulário de cadastro manual de multas
- [ ] Implementar vinculação com veículos e motoristas
- [ ] Adicionar item "Multas" no menu lateral

### Fase 6: Testes e Checkpoint
- [ ] Testar cadastro de membros da equipe
- [ ] Testar upload de Excel para cadastro em massa
- [ ] Testar páginas de WhatsApp e E-mail
- [ ] Testar calendário visual e sincronização
- [ ] Testar upload de PDFs de multas e extração de dados
- [ ] Criar checkpoint final

## Implementação das 3 Sugestões

### 1. Upload de Excel para Cadastro em Massa
- [ ] Criar endpoint tRPC para processar Excel de membros da equipe
- [ ] Implementar leitura e validação de planilha Excel
- [ ] Adicionar lógica de cadastro em massa com tratamento de erros
- [ ] Atualizar interface da página de Equipe com funcionalidade completa

### 2. Módulo de Multas Completo
- [x] Criar funções de database para Multas
- [ ] Implementar endpoint para upload de PDFs
- [ ] Criar extração automática de dados de PDF usando IA
- [ ] Implementar upload em lote de múltiplos PDFs
- [x] Criar página de Multas com listagem e formulários
- [x] Adicionar vinculação com motoristas e veículos
- [x] Adicionar item "Multas" no menu lateral

### 3. Calendário Visual Interativo
- [ ] Instalar biblioteca FullCalendar
- [ ] Criar componente de calendário com visualizações (mensal/semanal/diária)
- [ ] Implementar eventos coloridos por urgência
- [ ] Adicionar drag-and-drop para reagendar
- [ ] Sincronizar com missões, tarefas e multas
- [ ] Adicionar botão "Adicionar ao Calendário" em todas as entidades
- [ ] Implementar alertas visuais e por e-mail

## Implementação das 4 Novas Funcionalidades

### 1. Extração Automática de PDFs de Multas
- [x] Implementar endpoint para processar PDF de multa
- [x] Usar IA (LLM + OCR) para extrair dados do PDF
- [x] Extrair: número do auto, valor, data, local, código da infração, pontos
- [ ] Preencher automaticamente o formulário de multa
- [ ] Adicionar feedback visual do progresso de extração

### 2. Upload de Excel para Cadastro em Massa
- [ ] Criar endpoint para processar Excel de membros da equipe
- [ ] Criar endpoint para processar Excel de multas
- [ ] Validar dados da planilha antes de importar
- [ ] Implementar importação em lote com tratamento de erros
- [ ] Adicionar interface de upload com preview dos dados

### 3. Exportação de Missões em Excel
- [ ] Criar endpoint para exportar missões em Excel
- [ ] Adicionar seletor de quantidade de linhas
- [ ] Implementar filtros para exportação (data, cliente, status)
- [ ] Gerar planilha formatada com todas as colunas relevantes
- [ ] Adicionar botão de exportação na página de missões

### 4. Calendário Visual Interativo
- [ ] Instalar biblioteca FullCalendar
- [ ] Criar componente de calendário com visualizações (mensal/semanal/diária)
- [ ] Sincronizar eventos com missões, tarefas e multas
- [ ] Implementar cores por urgência (vermelho/amarelo/verde)
- [ ] Adicionar drag-and-drop para reagendar eventos
- [ ] Criar página dedicada ao calendário

### 5. Integração Automática de Multas no Calendário
- [ ] Ao importar multa, criar evento no calendário automaticamente
- [ ] Vincular evento com missão correspondente (se houver)
- [ ] Vincular evento com motorista e veículo
- [ ] Permitir visualização de multas passadas no calendário
- [ ] Adicionar alertas de vencimento de multas

## Sistema de Upload de PDFs e Cobrança por Link

### 1. Upload de PDFs de Multas com Extração Automática
- [x] Adicionar botão "Upload PDFs" na página de Multas
- [x] Implementar upload múltiplo de PDFs para S3
- [x] Conectar upload com endpoint de extração automática
- [x] Exibir progresso de extração para cada PDF
- [x] Criar multas automaticamente com dados extraídos
- [ ] Adicionar botão de download de PDFs nas multas cadastradas

### 2. Integração com Stripe
- [x] Configurar Stripe no projeto (webdev_add_feature stripe)
- [x] Criar banco de dados de serviços/produtos da empresa
- [x] Implementar CRUD de serviços (nome, descrição, preço)
- [x] Criar endpoint para gerar link de pagamento Stripe

### 3. Página de Cobrança por Link
- [x] Criar nova aba "Cobrança" no menu lateral
- [x] Implementar seletor de serviços da empresa
- [x] Criar calculadora interativa de valores
- [x] Adicionar campo de desconto (porcentagem)
- [x] Implementar checkout com Stripe
- [x] Gerar link único de pagamento

### 4. Compartilhamento de Link de Pagamento
- [x] Adicionar botão de compartilhamento via WhatsApp
- [x] Adicionar botão de compartilhamento via E-mail
- [x] Implementar cópia de link para área de transferência
- [ ] Criar página pública de checkout para o cliente

### 5. Sistema de Aprendizados da IA
- [x] Corrigir botão de ativar/desativar IA (toggle não está funcionando)
- [x] Criar tabela de aprendizados no banco de dados
- [x] Implementar aba "Aprendizados da IA" no dashboard
- [x] Criar lista numerada e editável de aprendizados
- [x] Implementar CRUD de aprendizados (criar, editar, excluir)
- [x] Adicionar campo de descrição para cada aprendizado
- [x] Implementar registro automático de aprendizados pela IA
- [x] Criar endpoint para IA consultar aprendizados antes de agir

### 6. Biblioteca de Modelos de Documentos
- [x] Criar tabela de modelos no banco de dados
- [x] Implementar aba "Modelos" no dashboard
- [x] Adicionar upload de arquivos de modelo (DOCX, PDF)
- [x] Criar categorias de modelos (Orçamento, Contrato, Proposta, etc.)
- [x] Implementar visualização de modelos cadastrados
- [x] Criar sistema de preenchimento automático via IA
- [x] Implementar seleção de destinatário para envio
- [x] Adicionar envio automático por e-mail/WhatsApp
- [x] Criar histórico de documentos gerados
