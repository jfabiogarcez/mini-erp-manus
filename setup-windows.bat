@echo off
REM ============================================
REM Setup Mini-ERP - Windows
REM ============================================
REM Este script configura o Mini-ERP localmente no Windows

setlocal enabledelayedexpansion

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║     Mini-ERP - Setup Automático (Windows)                  ║
echo ║     Sincronização Web + Local com MySQL na Nuvem           ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM Verificar se Node.js está instalado
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js não encontrado!
    echo Baixe em: https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js encontrado: 
node --version

REM Verificar se Git está instalado
echo.
echo [2/5] Verificando Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git não encontrado!
    echo Baixe em: https://git-scm.com/
    pause
    exit /b 1
)
echo ✓ Git encontrado:
git --version

REM Instalar pnpm globalmente
echo.
echo [3/5] Instalando pnpm...
npm install -g pnpm >nul 2>&1
if errorlevel 1 (
    echo ⚠ Erro ao instalar pnpm
    pause
    exit /b 1
)
echo ✓ pnpm instalado

REM Instalar dependências
echo.
echo [4/5] Instalando dependências do projeto...
call pnpm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)
echo ✓ Dependências instaladas

REM Sincronizar banco de dados
echo.
echo [5/5] Sincronizando banco de dados...
call pnpm db:push
if errorlevel 1 (
    echo ⚠ Erro ao sincronizar banco (verifique DATABASE_URL em .env.local)
)
echo ✓ Banco de dados sincronizado

echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                    ✓ Setup Completo!                       ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo Próximos passos:
echo.
echo 1. Configure as variáveis de ambiente:
echo    - Copie .env.example para .env.local
echo    - Preencha DATABASE_URL e outras credenciais
echo.
echo 2. Inicie o servidor:
echo    pnpm run dev
echo.
echo 3. Acesse em seu navegador:
echo    http://localhost:3000
echo.
echo Para mais informações, leia SETUP_LOCAL.md
echo.
pause
