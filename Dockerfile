# Stage 1: Base Image dengan Bun
FROM oven/bun:1.3.8 AS base
WORKDIR /app

# Stage 2: Install Dependencies
FROM base AS dependencies
# Salin file konfigurasi monorepo
COPY package.json bun.lock turbo.json ./
# Salin package.json dari setiap workspace aplikasi dan package
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/
COPY packages/env/package.json ./packages/env/
COPY packages/config/package.json ./packages/config/

# Install semua dependensi (termasuk devDependencies untuk build)
RUN bun install --frozen-lockfile

# Stage 3: Build Aplikasi
FROM dependencies AS builder
COPY . .
ENV NODE_ENV=production
# Menjalankan 'bun run build' melalui Turborepo
RUN bun run build

# Stage 4: Production Runner
FROM oven/bun:1.3.8-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Salin hasil build dan dependensi runtime dari stage sebelumnya
COPY --from=builder /app ./

# Azure App Service menggunakan port standar, kita ekspos port backend Elysia (3000)
EXPOSE 3000
ENV PORT=3000

CMD ["bun", "apps/server/src/index.ts"]
