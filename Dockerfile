# Base stage for shared dependencies
FROM oven/bun:alpine AS base
WORKDIR /app

# Copy root config files
COPY package.json bun.lock tsconfig.json turbo.json ./
COPY packages packages
COPY apps apps

# Install dependencies for the whole workspace
RUN bun install --frozen-lockfile

# --- SERVER BUILDER ---
FROM base AS server-builder
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1
RUN bun run build --filter=@scholar-seek/server

# --- WEB BUILDER ---
FROM base AS web-builder
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1
RUN bun run build --filter=@scholar-seek/web

# --- SERVER RUNTIME ---
FROM server-builder AS server

# Copy migrations directly into the server app directory so migrate.mjs finds it
COPY --from=server-builder /app/packages/db/src/migrations /app/apps/server/migrations

WORKDIR /app/apps/server
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "bun run dist/migrate.mjs && bun run dist/index.mjs"]

# --- WEB RUNTIME ---
FROM web-builder AS web
WORKDIR /app/apps/web
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001
CMD ["bun", "run", "serve.ts"]
