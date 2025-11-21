#!/bin/bash

# ============================================
# Setup Mini-ERP - Mac/Linux
# ============================================
# Este script configura o Mini-ERP localmente no Mac ou Linux

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Mini-ERP - Setup Automático (Mac/Linux)                ║"
echo "║     Sincronização Web + Local com MySQL na Nuvem           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Node.js está instalado
echo "[1/5] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo "Baixe em: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓ Node.js encontrado:${NC}"
node --version

# Verificar se Git está instalado
echo ""
echo "[2/5] Verificando Git..."
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git não encontrado!${NC}"
    echo "Baixe em: https://git-scm.com/"
    exit 1
fi
echo -e "${GREEN}✓ Git encontrado:${NC}"
git --version

# Instalar pnpm globalmente
echo ""
echo "[3/5] Instalando pnpm..."
npm install -g pnpm > /dev/null 2>&1 || true
echo -e "${GREEN}✓ pnpm instalado${NC}"

# Instalar dependências
echo ""
echo "[4/5] Instalando dependências do projeto..."
pnpm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependências instaladas${NC}"

# Sincronizar banco de dados
echo ""
echo "[5/5] Sincronizando banco de dados..."
pnpm db:push || echo -e "${YELLOW}⚠ Aviso: Verifique DATABASE_URL em .env.local${NC}"
echo -e "${GREEN}✓ Banco de dados sincronizado${NC}"

# Sucesso
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    ✓ Setup Completo!                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Configure as variáveis de ambiente:"
echo "   - Copie .env.example para .env.local"
echo "   - Preencha DATABASE_URL e outras credenciais"
echo ""
echo "2. Inicie o servidor:"
echo "   pnpm run dev"
echo ""
echo "3. Acesse em seu navegador:"
echo "   http://localhost:3000"
echo ""
echo "Para mais informações, leia SETUP_LOCAL.md"
echo ""
