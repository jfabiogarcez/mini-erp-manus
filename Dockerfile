FROM node:22-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm
RUN npm install -g pnpm@10.4.1

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Build
RUN pnpm run build

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["pnpm", "start"]
