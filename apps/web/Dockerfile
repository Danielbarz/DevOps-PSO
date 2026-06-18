FROM oven/bun:1.3.8
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build
# Copy hasil build ke root agar mudah diakses Elysia
RUN cp -r apps/web/dist/* apps/server/dist/
CMD ["bun", "run", "apps/server/dist/index.mjs"]