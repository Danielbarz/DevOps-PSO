# Stage 1: Dependencies
FROM oven/bun:1.3.8 AS dependencies
WORKDIR /app
COPY package.json bun.lock turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/
COPY packages/ui/package.json ./packages/ui/
COPY packages/env/package.json ./packages/env/
COPY packages/config/package.json ./packages/config/
RUN bun install --frozen-lockfile

# Stage 2: Builder
FROM dependencies AS builder
COPY . .
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=1
RUN bun run build

# Stage 3: Runner
FROM oven/bun:1.3.8-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["bun", "run", "apps/server/dist/index.mjs"]
