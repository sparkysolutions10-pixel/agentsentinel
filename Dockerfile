# AgentSentinel Hosted Cloud MCP Server Dockerfile
# Zero-dependency, lightweight, sub-second boot container

FROM node:22-alpine AS builder

WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
COPY --from=builder /app/dist ./dist
COPY docs ./docs
COPY data ./data

EXPOSE 3000

# Health check to ensure 99.99% uptime
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/cli/index.js", "serve"]
