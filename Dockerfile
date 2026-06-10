# Stage 1: Dependencies
FROM oven/bun:1.3.8 AS dependencies
WORKDIR /app

# Copy root config files
COPY package.json bun.lock turbo.json tsconfig.json ./

# Copy package.json of all workspaces to cache install layer
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/
COPY packages/env/package.json ./packages/env/
COPY packages/config/package.json ./packages/config/

RUN bun install --frozen-lockfile

# Copy semua file source code
COPY . .

# Stage 2: Builder
FROM dependencies AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1
# Ini akan membuat folder dist/ di server dan web
RUN bun run build

# Stage 3: Runner
FROM oven/bun:1.3.8-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy hasil build server
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json

# Copy hasil build web (dibutuhkan oleh index.ts milik Elysia untuk disajikan ke user)
COPY --from=builder /app/apps/web/dist ./apps/web/dist

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# JALANKAN LANGSUNG MENGGUNAKAN BUN (Tanpa start.sh)
CMD ["bun", "run", "apps/server/dist/index.mjs"]