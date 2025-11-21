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

### 7. Correções
- [ ] Adicionar botão visível de "Upload PDFs" na página de Multas
- [ ] Verificar se o upload múltiplo está funcionando corretamente

### 8. Aba de Missões
- [ ] Criar tabela de missões no banco de dados
- [ ] Implementar CRUD de missões (criar, editar, excluir, listar)
- [ ] Criar página de Missões com tabela baseada no modelo fornecido
- [ ] Adicionar campos: data, cliente, serviço, motorista, veículo, valor, status, etc.
- [ ] Implementar filtros e busca na tabela de missões
- [ ] Adicionar link no menu lateral para Missões

### 9. Calendário Integrado no Dashboard
- [ ] Instalar biblioteca de calendário (FullCalendar ou similar)
- [ ] Criar componente de calendário no Dashboard
- [ ] Integrar missões no calendário
- [ ] Integrar multas com data de vencimento no calendário
- [ ] Criar sincronização automática: upload de multas → calendário
- [ ] Adicionar cores diferentes para missões e multas
- [ ] Implementar visualização mensal/semanal/diária
- [ ] Adicionar tooltips com detalhes ao passar mouse nos eventos

### 10. Padronização de Visualização
- [x] Converter página de Multas para visualização em tabela (linhas)
- [ ] Converter página de Equipe para visualização em tabela (linhas)
- [ ] Converter página de Aprendizados para visualização em tabela (linhas)
- [ ] Converter página de Modelos para visualização em tabela (linhas)
- [ ] Garantir que todas as páginas usem tabelas ao invés de cards

### 11. Upload de Arquivos (Excel e PDF com OCR)
- [x] Adicionar botão de upload em Missões
- [x] Implementar processamento de Excel para Missões
- [x] Implementar extração de PDF com OCR para Missões
- [ ] Adicionar botão de upload em Equipe
- [ ] Implementar processamento de Excel para Equipe
- [ ] Adicionar botão de upload em Registros
- [ ] Implementar processamento de Excel/PDF para Registros
- [ ] Criar endpoint genérico de processamento de arquivos
- [ ] Adicionar validação e feedback de progresso

### 12. Sistema de Relatórios em PDF
- [x] Instalar biblioteca de geração de PDF (jsPDF ou similar)
- [x] Criar tabela de relatórios no banco de dados
- [x] Implementar função de agregação de dados mensais de missões
- [x] Implementar função de agregação de dados mensais de multas
- [x] Criar template de relatório de missões em PDF
- [x] Criar template de relatório de multas em PDF
- [x] Criar template de relatório consolidado em PDF
- [x] Implementar interface de geração de relatórios no Dashboard
- [x] Adicionar seletor de mês/ano para relatórios
- [x] Implementar download de PDF
- [ ] Adicionar opção de envio de relatório por e-mail
- [x] Criar histórico de relatórios gerados

### 13. Calendário Visual Interativo
- [x] Instalar biblioteca de calendário (react-big-calendar ou similar)
- [x] Criar componente de calendário base
- [x] Integrar dados de missões no calendário
- [x] Integrar dados de multas no calendário
- [x] Adicionar cores diferentes para missões (azul) e multas (vermelho)
- [x] Implementar modal de detalhes ao clicar em evento
- [x] Adicionar navegação entre meses (anterior/próximo)
- [x] Implementar filtros para mostrar/ocultar missões ou multas
- [x] Adicionar visualização de mês e semana
- [x] Testar interatividade e responsividade

### 14. Arrastar e Soltar no Calendário
- [x] Adicionar funcionalidade de drag-and-drop no calendário
- [x] Criar endpoint para atualizar data de missão
- [x] Implementar confirmação visual ao arrastar evento
- [x] Atualizar banco de dados automaticamente ao soltar
- [x] Adicionar feedback de sucesso/erro

### 15. Sistema de Notificações Automáticas
- [x] Criar tabela de notificações agendadas no banco
- [x] Implementar verificação diária de missões e multas
- [x] Criar templates de notificação para missões (24h antes)
- [x] Criar templates de notificação para multas (3 dias antes)
- [x] Implementar envio de notificações por e-mail
- [ ] Implementar envio de notificações por WhatsApp
- [ ] Adicionar configuração de horários preferenciais
- [x] Criar histórico de notificações enviadas

### 16. Página Completa de Missões
- [x] Criar interface dedicada para Missões
- [x] Implementar tabela de missões com todas as colunas
- [x] Adicionar formulário de criação de missão
- [x] Adicionar formulário de edição de missão
- [x] Implementar exclusão de missões
- [x] Adicionar filtros avançados (status, motorista, data)
- [x] Integrar botão de upload de arquivos existente
- [x] Adicionar busca por texto
- [ ] Implementar paginação
- [ ] Adicionar exportação para Excel

### 17. Integração Real de Notificações
- [x] Configurar serviço de envio de e-mail (SMTP ou API)
- [x] Implementar função de envio de e-mail real
- [x] Configurar WhatsApp Business API ou Twilio
- [x] Implementar função de envio de WhatsApp real
- [x] Atualizar sistema de notificações para usar envio real
- [ ] Adicionar configuração de credenciais via secrets
- [ ] Testar envio de e-mail
- [ ] Testar envio de WhatsApp
- [x] Criar logs de envio com sucesso/erro

### 18. Dashboard de Métricas e KPIs
- [x] Criar página de Dashboard de Métricas
- [x] Implementar gráfico de receita mensal
- [x] Implementar gráfico de missões por status
- [x] Criar ranking de motoristas mais ativos
- [x] Implementar gráfico de evolução de multas
- [x] Adicionar KPIs principais (total missões, receita total, taxa de conclusão)
- [x] Implementar filtros por período (mês, trimestre, ano)
- [ ] Adicionar exportação de gráficos
- [ ] Criar visualização de comparação mês a mês


## Integração Completa de WhatsApp (Conversas, Templates, Documentos)

### Fase 1: Banco de Dados de WhatsApp
- [x] Criar tabela `conversasWhatsapp` (id, numeroCliente, nomeCliente, ultimaMensagem, dataUltimaMsg, statusConversa, createdAt, updatedAt)
- [x] Criar tabela `mensagensWhatsapp` (id, conversaId, remetente, mensagem, tipo, anexoUrl, dataEnvio, lida, createdAt)
- [x] Criar tabela `templatesWhatsapp` (id, titulo, conteudo, variaveis, categoria, ativo, createdAt, updatedAt)
- [x] Criar tabela `documentosWhatsapp` (id, nome, urlArquivo, tipoArquivo, tamanhoBytes, descricao, createdAt)

### Fase 2: Backend tRPC
- [x] Implementar CRUD de conversas WhatsApp
- [x] Implementar CRUD de mensagens WhatsApp
- [x] Implementar CRUD de templates WhatsApp
- [x] Implementar CRUD de documentos WhatsApp
- [x] Criar endpoints para buscar conversas, templates e documentos

### Fase 3: Conectar Página WhatsApp.tsx
- [x] Conectar aba Conversas aos dados do banco
- [x] Conectar aba Templates aos dados do banco
- [x] Conectar aba Documentos aos dados do banco
- [x] Implementar criação/edição/exclusão de templates
- [x] Implementar upload de documentos

### Fase 4: Webhook e Integração Twilio
- [ ] Registrar webhook com Twilio
- [ ] Implementar recebimento de mensagens
- [ ] Salvar mensagens no banco de dados
- [ ] Integrar com ChatGPT para respostas automáticas

### Fase 5: Testes e Checkpoint
- [x] Testar exibição de conversas
- [x] Testar CRUD de templates
- [x] Testar upload de documentos
- [ ] Testar recebimento de mensagens
- [ ] Criar checkpoint final
