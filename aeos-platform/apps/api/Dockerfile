# ========================================================
# Dockerfile cho NestJS API (Optimized for pnpm Monorepo)
# ========================================================

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache openssl libc6-compat tini

# --------------------------------------------------------
# 1. Deps Stage: Tối ưu Docker Layer Caching (pnpm fetch)
# --------------------------------------------------------
FROM base AS deps
WORKDIR /app
# Chỉ copy lockfile để fetch toàn bộ dependencies vào virtual store
# Bước này chỉ chạy lại khi pnpm-lock.yaml thay đổi -> Cực kỳ nhanh
COPY pnpm-lock.yaml ./
RUN pnpm fetch

# --------------------------------------------------------
# 2. Builder Stage: Build & Prune Rác (Siêu Tối Ưu)
# --------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY . .
# Cài đặt từ virtual store đã fetch (offline mode)
RUN pnpm install --offline --frozen-lockfile

# Generate Prisma Client
RUN pnpm --filter @aeos/database db:generate

# Build NestJS API
RUN pnpm --filter @aeos/api build

# Sử dụng pnpm deploy để cô lập API và cài đúng production deps
RUN pnpm --filter @aeos/api --prod deploy /app/pruned

# [Bí quyết tối ưu]: Xóa file .map và các binary Prisma Engines không cần thiết
RUN find /app/pruned/dist -name "*.map" -type f -delete \
    && rm -rf /app/pruned/node_modules/@prisma/engines \
    && rm -rf /app/pruned/node_modules/prisma \
    && find /app/pruned/node_modules -type f -name "*.o" -delete \
    && find /app/pruned/node_modules -type f -name "*.a" -delete \
    && find /app/pruned/node_modules -type f -name "*.mk" -delete

# --------------------------------------------------------
# 3. Runner Stage: Production (Bảo mật & Ổn định)
# --------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

LABEL maintainer="Tech Lead - AEOS" \
      version="1.0" \
      description="Production Docker Image for AEOS NestJS API"

# Tạo Non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nestjs -G nodejs \
    && mkdir -p /app/uploads \
    && chown -R nestjs:nodejs /app

# Copy thư mục đã được deploy & prune
COPY --from=builder --chown=nestjs:nodejs /app/pruned ./

USER nestjs

EXPOSE 3000

# Healthcheck để EKS/Docker tự động restart nếu app treo
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Dùng tini để xử lý các Linux Signals (SIGINT, SIGTERM) chuẩn xác
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
