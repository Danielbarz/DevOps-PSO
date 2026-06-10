# Stage 1: Build
FROM oven/bun:1.3.8 AS builder
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

# Stage 2: Runner (Ringan, hanya untuk menjalankan)
FROM oven/bun:1.3.8-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy hasil build server & web dari stage builder
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/web/dist ./apps/web/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Jalankan server
CMD ["bun", "run", "apps/server/dist/index.mjs"]