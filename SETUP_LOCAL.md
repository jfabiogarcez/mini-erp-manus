# 🚀 Guia de Configuração Local - Mini-ERP com Sincronização Web

Este guia permite você executar o Mini-ERP localmente no seu PC ou Mac, sincronizando dados automaticamente com a versão publicada na web através de um banco de dados MySQL centralizado na nuvem.

## 📋 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js 18+**: [Download aqui](https://nodejs.org/)
- **Git**: [Download aqui](https://git-scm.com/)
- **pnpm** (gerenciador de pacotes): Execute `npm install -g pnpm`

Verifique se está tudo instalado:

```bash
node --version
npm --version
git --version
```

## 🔧 Passo 1: Clonar o Repositório

Clone o projeto do GitHub para sua máquina:

```bash
git clone https://github.com/jfabiogarcez/-Transblindados-IA-v2-.git
cd mini-erp-manus
```

## 📦 Passo 2: Instalar Dependências

Instale todas as dependências do projeto:

```bash
pnpm install
```

Este comando pode levar alguns minutos na primeira execução.

## 🔐 Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Banco de Dados (MySQL na Nuvem)
DATABASE_URL="mysql://usuario:senha@host:3306/mini_erp_db"

# Autenticação Manus OAuth
VITE_APP_ID="seu_app_id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://oauth.manus.im"

# JWT Secret para Sessões
JWT_SECRET="sua_chave_secreta_aqui"

# Informações do Proprietário
OWNER_NAME="Seu Nome"
OWNER_OPEN_ID="seu_open_id"

# APIs Manus
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="sua_chave_api"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="sua_chave_frontend"

# Configurações da Aplicação
VITE_APP_TITLE="Mini-ERP com Automação Manus"
VITE_APP_LOGO="/logo.svg"
```

**Onde encontrar essas credenciais:**
- Acesse o painel de gerenciamento do seu projeto Manus
- Vá para **Settings → Secrets**
- Copie as variáveis necessárias

## 🗄️ Passo 4: Sincronizar Banco de Dados

Execute as migrações do banco de dados:

```bash
pnpm db:push
```

Este comando sincroniza o schema local com o banco de dados na nuvem.

## 🚀 Passo 5: Executar Localmente

Inicie o servidor de desenvolvimento:

```bash
pnpm run dev
```

Você verá uma saída similar a:

```
> mini-erp-manus@1.0.0 dev
> NODE_ENV=development tsx watch server/_core/index.ts

[OAuth] Initialized with baseURL: https://api.manus.im
Server running on http://localhost:3000/
```

Acesse seu projeto em: **http://localhost:3000**

## 🔄 Sincronização Web + Local

### Como Funciona

O Mini-ERP usa um **banco de dados MySQL centralizado na nuvem**. Tanto a versão local quanto a versão publicada na web acessam o mesmo banco:

```
┌─────────────────┐         ┌──────────────────┐
│   PC/Mac Local  │         │  Web (Publicada) │
│  localhost:3000 │────────▶│  seu-site.com    │
└─────────────────┘         └──────────────────┘
         │                          │
         └──────────┬───────────────┘
                    ▼
         ┌──────────────────────┐
         │  MySQL na Nuvem      │
         │  (Banco Centralizado)│
         └──────────────────────┘
```

### Sincronização Automática

- **Dados criados localmente** → Aparecem na web automaticamente
- **Dados criados na web** → Aparecem localmente automaticamente
- **Atualizações** → Sincronizam em tempo real
- **Deletions** → Sincronizam em tempo real

### Exemplo Prático

1. **No seu PC local**, você cria um novo cliente
2. **Salva no banco de dados** (mesmo banco da web)
3. **Acessa a web** → O cliente aparece lá também
4. **Edita o cliente na web** → A mudança aparece no PC local

## 📱 Trabalhar Offline

Se perder a conexão com internet:

1. O aplicativo continua funcionando localmente
2. As alterações são **armazenadas localmente**
3. Quando reconectar, tudo sincroniza automaticamente

```bash
# Sincronizar manualmente após reconectar
pnpm db:push
```

## 🔄 Atualizar o Código

Se o código foi atualizado na web, puxe as mudanças:

```bash
git pull origin main
pnpm install
pnpm db:push
```

Depois reinicie o servidor:

```bash
pnpm run dev
```

## 🧪 Testar Sincronização

1. **Abra dois navegadores:**
   - Um em `http://localhost:3000` (local)
   - Outro em `seu-site.com` (web)

2. **Crie um registro localmente**
   - Vá para o formulário de criação
   - Preencha os dados
   - Clique em "Salvar"

3. **Verifique na web**
   - Atualize a página web
   - O registro deve aparecer lá também

4. **Edite na web**
   - Faça uma alteração no registro
   - Volte para o local
   - Atualize a página
   - A mudança deve estar lá

## 🐛 Troubleshooting

### Erro: "DATABASE_URL não configurada"
- Verifique se o arquivo `.env.local` existe
- Confirme que a variável `DATABASE_URL` está preenchida corretamente

### Erro: "Conexão recusada ao banco de dados"
- Verifique se a URL do banco está correta
- Confirme que tem acesso à internet
- Teste a conexão: `mysql -u usuario -p -h host -D mini_erp_db`

### Dados não sincronizam
- Verifique a conexão de internet
- Reinicie o servidor: `pnpm run dev`
- Verifique os logs no console para erros

### Porta 3000 já está em uso
```bash
# Use uma porta diferente
PORT=3001 pnpm run dev
```

## 📚 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm run dev` | Inicia servidor de desenvolvimento |
| `pnpm run build` | Compila para produção |
| `pnpm db:push` | Sincroniza schema com banco de dados |
| `pnpm test` | Executa testes unitários |
| `pnpm lint` | Verifica código |
| `git pull` | Atualiza código do repositório |

## 🚀 Deploy para Produção

Quando estiver pronto para publicar:

1. **Commit suas mudanças:**
```bash
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

2. **Acesse o painel Manus**
3. **Clique em "Publish"**
4. **Seu site estará disponível publicamente**

## 📞 Suporte

Se encontrar problemas:

1. Verifique este guia novamente
2. Consulte a seção Troubleshooting
3. Abra uma issue no GitHub
4. Entre em contato com o suporte Manus

## ✅ Checklist Final

- [ ] Node.js instalado
- [ ] Git instalado
- [ ] Repositório clonado
- [ ] Dependências instaladas (`pnpm install`)
- [ ] `.env.local` configurado
- [ ] Banco de dados sincronizado (`pnpm db:push`)
- [ ] Servidor rodando (`pnpm run dev`)
- [ ] Acesso em http://localhost:3000
- [ ] Sincronização testada com a web

Parabéns! Você agora tem o Mini-ERP rodando localmente com sincronização automática com a web! 🎉
