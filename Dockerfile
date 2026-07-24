# Multi-stage Dockerfile for FocusFlow AI (Node.js + Express + React + Vite)

# Stage 1: Dependencies & Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build Vite frontend and esbuild server backend
RUN npm run build

# Stage 2: Production Execution
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests & production node_modules
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled dist artifacts from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.cjs"]
