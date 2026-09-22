# ---- Build Stage ----
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy package.json files for all packages
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source files
COPY apps/api/ ./apps/api/
COPY packages/shared/ ./packages/shared/

# Build shared package first
WORKDIR /app/packages/shared
RUN pnpm exec tsc --noEmit false --declaration --outDir dist || true

# Build api
WORKDIR /app/apps/api
RUN pnpm run build

# ---- Production Stage ----
FROM node:22-alpine AS runner

WORKDIR /app

RUN npm install -g pnpm

# Copy workspace config
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/

# Install production deps only
RUN pnpm install --frozen-lockfile --prod

# Copy built output
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/shared ./packages/shared

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/index.js"]
