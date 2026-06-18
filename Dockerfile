# Base stage for shared dependencies
FROM oven/bun:1.1.20-alpine AS base
WORKDIR /app

# Install git for packages that are installed from a git repository
RUN apk add --no-cache git

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
FROM oven/bun:1.1.20-alpine AS server
WORKDIR /app
COPY --from=server-builder /app/apps/server/dist ./dist
COPY --from=server-builder /app/apps/server/package.json ./
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000
CMD ["bun", "run", "dist/index.mjs"]

# --- WEB RUNTIME ---
FROM oven/bun:1.1.20-alpine AS web
WORKDIR /app
COPY --from=web-builder /app/apps/web/dist ./dist
COPY --from=web-builder /app/apps/web/package.json ./
COPY --from=web-builder /app/apps/web/serve.ts ./
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001
CMD ["bun", "run", "serve.ts"]
