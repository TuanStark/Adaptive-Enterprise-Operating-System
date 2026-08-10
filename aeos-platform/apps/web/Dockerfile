# ========================================================
# Dockerfile cho Next.js Web (Extreme Zero-Fat with Distroless)
# ========================================================

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache openssl libc6-compat

# --------------------------------------------------------
# 1. Deps Stage: Tối ưu Docker Layer Caching
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
# Cài đặt an toàn (bỏ qua scripts để tránh lỗi ERR_PNPM_IGNORED_BUILDS)
RUN pnpm config set ignore-scripts true
RUN pnpm install --frozen-lockfile
RUN pnpm config set ignore-scripts false
# Rebuild các native modules (Sharp, v.v.)
RUN pnpm rebuild

ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js
RUN pnpm --filter @aeos/web build

# Chown trước các file cần thiết cho user 65532 (nonroot của Distroless)
# Next.js có thể cần ghi cache vào thư mục .next khi chạy Image Optimization
RUN chown -R 65532:65532 /app/apps/web/.next/standalone \
    && chown -R 65532:65532 /app/apps/web/.next/static \
    && chown -R 65532:65532 /app/apps/web/public

# --------------------------------------------------------
# 3. Runner Stage: Distroless
# --------------------------------------------------------
FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOST=0.0.0.0

LABEL maintainer="Tech Lead - AEOS" \
      version="2.0-distroless" \
      description="Zero-Fat Distroless Image for AEOS Next.js Web"

# Sử dụng nonroot user
USER 65532:65532

# Copy thư mục public
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy mã nguồn standalone (Rất nhẹ, không chứa node_modules rác)
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

CMD ["apps/web/server.js"]
