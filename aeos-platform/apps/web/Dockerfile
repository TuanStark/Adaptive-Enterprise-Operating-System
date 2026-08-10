# ========================================================
# Dockerfile cho Next.js Web (Standalone & Optimized)
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
COPY pnpm-lock.yaml ./
RUN pnpm fetch

# --------------------------------------------------------
# 2. Builder Stage: Build Next.js
# --------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY . .
# Cài đặt từ virtual store đã fetch (offline mode)
RUN pnpm install --offline --frozen-lockfile

ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js
# Cấu hình output: 'standalone' sẽ tự động tối ưu hóa và gom file cần thiết
RUN pnpm --filter @aeos/web build

# --------------------------------------------------------
# 3. Runner Stage: Production Image
# --------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOST=0.0.0.0

LABEL maintainer="Tech Lead - AEOS" \
      version="1.0" \
      description="Production Docker Image for AEOS Next.js Web"

# Tạo Non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs -G nodejs \
    && chown -R nextjs:nodejs /app

# Copy thư mục public
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy mã nguồn standalone (Rất nhẹ, không chứa node_modules rác)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000

# ENTRYPOINT bằng tini chống treo zombie process
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/web/server.js"]
