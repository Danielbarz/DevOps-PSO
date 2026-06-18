# Build stage
FROM oven/bun:1-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json bun.lock tsconfig.json turbo.json ./

# Copy workspace packages
COPY packages packages
COPY apps apps

# Install dependencies
RUN bun install

# Build the server
RUN cd apps/server && bun run build

# Runtime stage
FROM oven/bun:1-alpine

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./

# Copy migrations folder for production migrations
COPY --from=builder /app/packages/db/src/migrations ./migrations

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the server, running migrations first
CMD ["sh", "-c", "bun run dist/migrate.mjs && bun run dist/index.mjs"]
