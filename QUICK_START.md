# ⚡ Quick Start - Mini-ERP Local

Comece em 5 minutos!

## 🪟 Windows

1. **Baixe e instale:**
   - [Node.js](https://nodejs.org/)
   - [Git](https://git-scm.com/)

2. **Clone o projeto:**
   ```bash
   git clone https://github.com/jfabiogarcez/-Transblindados-IA-v2-.git
   cd mini-erp-manus
   ```

3. **Execute o setup:**
   ```bash
   setup-windows.bat
   ```

4. **Configure o banco de dados:**
   - Copie `.env.example` para `.env.local`
   - Preencha `DATABASE_URL` com sua conexão MySQL

5. **Inicie:**
   ```bash
   pnpm run dev
   ```

6. **Acesse:**
   - http://localhost:3000

---

## 🍎 Mac/Linux

1. **Instale dependências:**
   ```bash
   # Mac com Homebrew
   brew install node git
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install nodejs git
   ```

2. **Clone o projeto:**
   ```bash
   git clone https://github.com/jfabiogarcez/-Transblindados-IA-v2-.git
   cd mini-erp-manus
   ```

3. **Execute o setup:**
   ```bash
   chmod +x setup-mac.sh
   ./setup-mac.sh
   ```

4. **Configure o banco de dados:**
   - Copie `.env.example` para `.env.local`
   - Preencha `DATABASE_URL` com sua conexão MySQL

5. **Inicie:**
   ```bash
   pnpm run dev
   ```

6. **Acesse:**
   - http://localhost:3000

---

## 🔄 Sincronização Automática

Seu banco de dados está na nuvem, então:

✅ **Dados criados localmente** → Aparecem na web automaticamente
✅ **Dados criados na web** → Aparecem localmente automaticamente
✅ **Alterações sincronizam em tempo real**
✅ **Funciona offline** → Sincroniza quando reconectar

---

## 📱 Testar Sincronização

1. Abra dois navegadores:
   - Um em `http://localhost:3000` (local)
   - Outro em seu site publicado (web)

2. Crie um registro localmente
3. Atualize a página web
4. O registro deve aparecer lá também!

---

## 🆘 Problemas?

**Porta 3000 já em uso:**
```bash
PORT=3001 pnpm run dev
```

**Erro de banco de dados:**
- Verifique `DATABASE_URL` em `.env.local`
- Confirme que tem acesso à internet
- Teste a conexão no seu cliente MySQL

**Dependências com erro:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## 📚 Mais Informações

Leia `SETUP_LOCAL.md` para guia completo com troubleshooting detalhado.

---

**Pronto! Você agora tem o Mini-ERP rodando localmente com sincronização automática! 🎉**
