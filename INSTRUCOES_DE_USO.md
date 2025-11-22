# Mini-ERP com Automação Manus - Instruções de Uso

## Visão Geral

O **Mini-ERP com Automação Manus** é um sistema web full-stack que consolida dados de planilhas enviadas por e-mail e WhatsApp, gerencia registros financeiros e operacionais, e agenda tarefas automaticamente.

---

## Funcionalidades Principais

### 1. Dashboard de Registros Consolidados

Acesse o dashboard em `/dashboard` para visualizar, criar, editar e deletar registros consolidados.

**Campos de um Registro:**
- **Assunto:** Descrição do registro
- **Categoria:** Missão/Viagem, Contas a Pagar, Controle de Caixa/Aporte
- **Cliente/Fornecedor:** Nome do cliente ou fornecedor
- **Nº Documento/Pedido:** Número de identificação do documento
- **Valor Total:** Valor em reais (armazenado em centavos no banco)
- **Status:** Pendente, Pago, Realizado
- **Observações:** Notas adicionais

### 2. Webhook de Integração

O sistema possui um endpoint público para receber dados do Manus via automação de e-mail/WhatsApp.

**Endpoint:** `POST /api/webhook/consolidar`

**Formato do Body (JSON):**
```json
{
  "registros": [
    {
      "assunto": "Missão SP - João Silva - ABC-1234",
      "categoria": "Missão/Viagem",
      "clienteFornecedor": "João Silva",
      "nDocumentoPedido": "ABC-1234",
      "dataDocumento": "2025-11-20T00:00:00.000Z",
      "dataVencimento": "2025-11-27T00:00:00.000Z",
      "valorTotal": 15000,
      "status": "Pendente",
      "origemArquivo": "MISSOESSP2025.xlsx",
      "origemAba": "CR",
      "observacoes": "Dados de custos detalhados de missão/viagem."
    }
  ]
}
```

**Lógica de Deduplicação:**
- O sistema gera uma **chave de agrupamento** usando `Cliente/Fornecedor + Nº Documento/Pedido`.
- Se já existir um registro com a mesma chave, ele será **atualizado**.
- Caso contrário, um **novo registro** será criado.

**Criação Automática de Tarefas:**
- Se o registro tiver uma `dataVencimento`, o sistema cria automaticamente uma tarefa com:
  - **Título:** `[Categoria] – [Nº Documento] – [Cliente/Fornecedor]`
  - **Descrição:** Resumo do registro (Assunto, Valor, Status)
  - **Data de Vencimento:** Mesma do registro
  - **Status:** Pendente

---

## Como Configurar o Manus para Enviar Dados ao Webhook

### Passo 1: Obter a URL do Webhook

Após publicar o projeto, a URL do webhook será:

```
https://seu-dominio.manus.space/api/webhook/consolidar
```

(Substitua `seu-dominio` pelo domínio real do seu projeto)

### Passo 2: Configurar o Workflow de E-mail no Manus

1. Acesse o Manus e crie um novo **Workflow de E-mail**.
2. No campo **"Instruções"**, cole o seguinte prompt:

```
Leia todo o conteúdo do email e de TODOS os anexos (PDF, DOC, imagens e principalmente planilhas).

Para cada planilha anexada (Excel, CSV, Google Sheets):
1. Extraia as linhas relevantes de dados operacionais (pedidos, faturas, lançamentos financeiros, estoque, cadastro, etc.).
2. Para cada linha, crie um objeto JSON com os seguintes campos:
   - assunto: string (descrição do registro)
   - categoria: string (Missão/Viagem, Contas a Pagar, Controle de Caixa/Aporte)
   - clienteFornecedor: string (nome do cliente ou fornecedor)
   - nDocumentoPedido: string (número do documento ou pedido)
   - dataDocumento: string ISO 8601 (data do documento)
   - dataVencimento: string ISO 8601 (data de vencimento)
   - valorTotal: number (valor em centavos, ex: 10000 para R$ 100,00)
   - status: string (Pendente, Pago, Realizado)
   - origemArquivo: string (nome do arquivo de origem)
   - origemAba: string (nome da aba da planilha)
   - observacoes: string (observações adicionais)

3. Envie os dados para o webhook usando o seguinte formato:
   POST https://seu-dominio.manus.space/api/webhook/consolidar
   Body: { "registros": [array de objetos JSON] }

Ao final, responda ao email com um resumo executivo em 1 parágrafo e uma lista dos registros processados.
```

3. Salve o Workflow.

### Passo 3: Testar o Workflow

1. Envie um e-mail de teste com uma planilha anexada para o endereço configurado no Workflow.
2. O Manus processará a planilha e enviará os dados para o webhook.
3. Acesse o dashboard do Mini-ERP para verificar se os registros foram criados.

---

## Estrutura do Banco de Dados

### Tabela: `registros`

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | int | ID único (auto-incremento) |
| `assunto` | text | Descrição do registro |
| `categoria` | varchar(100) | Categoria do registro |
| `clienteFornecedor` | text | Nome do cliente ou fornecedor |
| `nDocumentoPedido` | varchar(255) | Número do documento ou pedido |
| `dataDocumento` | timestamp | Data do documento |
| `dataVencimento` | timestamp | Data de vencimento |
| `valorTotal` | int | Valor em centavos |
| `status` | varchar(50) | Status do registro |
| `origemArquivo` | text | Nome do arquivo de origem |
| `origemAba` | text | Nome da aba da planilha |
| `observacoes` | text | Observações adicionais |
| `chaveAgrupamento` | varchar(512) | Chave de deduplicação |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

### Tabela: `tarefas`

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | int | ID único (auto-incremento) |
| `titulo` | text | Título da tarefa |
| `descricao` | text | Descrição da tarefa |
| `dataVencimento` | timestamp | Data de vencimento |
| `status` | varchar(50) | Status da tarefa |
| `registroId` | int | ID do registro relacionado |
| `createdAt` | timestamp | Data de criação |
| `updatedAt` | timestamp | Data de atualização |

---

## Próximos Passos

1. **Publicar o Projeto:** Clique no botão **"Publish"** na interface do Manus para obter um domínio público.
2. **Configurar o Workflow de E-mail:** Siga as instruções acima para conectar o Manus ao webhook.
3. **Testar a Integração:** Envie planilhas por e-mail e verifique se os dados são consolidados no dashboard.

---

## Suporte

Para dúvidas ou problemas, acesse [https://help.manus.im](https://help.manus.im).
