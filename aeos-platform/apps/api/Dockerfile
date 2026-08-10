# ========================================================
# Dockerfile cho NestJS API (Extreme Zero-Fat with Distroless)
# ========================================================

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache openssl libc6-compat

# --------------------------------------------------------
# 1. Deps Stage: Tối ưu Docker Layer Caching (pnpm fetch)
# --------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN pnpm fetch

# --------------------------------------------------------
# 2. Builder Stage: Build & Prune Rác (Siêu Tối Ưu)
# --------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY . .
# Cài đặt an toàn (bỏ qua scripts để tránh lỗi ERR_PNPM_IGNORED_BUILDS)
RUN pnpm config set ignore-scripts true
RUN pnpm install --frozen-lockfile
RUN pnpm config set ignore-scripts false
# Rebuild các native modules (Prisma, Argon2, v.v.)
RUN pnpm rebuild

# Generate Prisma Client
RUN pnpm --filter @aeos/database db:generate

# Build NestJS API
RUN pnpm --filter @aeos/api build

# Sử dụng pnpm deploy để cô lập API và cài đúng production deps
RUN pnpm --filter @aeos/api --prod deploy --legacy /app/pruned

# Khắc phục lỗi pnpm deploy không copy generated Prisma Client
RUN cp -r /app/node_modules/.pnpm/@prisma+client*/node_modules/.prisma /app/pruned/node_modules/

# [CRITICAL] Webpack bundler không copy file .so.node binary của Prisma.
# Prisma tìm kiếm engine tại nhiều vị trí, bao gồm cạnh bundle (dist/) và trong node_modules.
# Copy engine binary vào cả 2 vị trí để đảm bảo tìm thấy.
RUN cp /app/pruned/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node /app/pruned/dist/

# [Tối ưu]: Xóa file .map và các artifact không cần thiết (GIỮ LẠI .so.node)
RUN find /app/pruned/dist -name "*.map" -type f -delete \
    && rm -rf /app/pruned/node_modules/@prisma/engines \
    && rm -rf /app/pruned/node_modules/prisma \
    && find /app/pruned/node_modules -type f -name "*.o" -delete \
    && find /app/pruned/node_modules -type f -name "*.a" -delete \
    && find /app/pruned/node_modules -type f -name "*.mk" -delete

# Phân quyền cho nonroot user của Distroless (uid: 65532) từ bước builder
# Vì Distroless không có lệnh chown hay chmod ở Runner Stage
RUN chown -R 65532:65532 /app/pruned

# --------------------------------------------------------
# 3. Runner Stage: Distroless (Bảo mật tối đa, siêu nhẹ)
# --------------------------------------------------------
# Sử dụng Google Distroless (Chỉ có Node, không có OS, không có shell)
FROM gcr.io/distroless/nodejs22-debian12 AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-debian-openssl-3.0.x.so.node

LABEL maintainer="Tech Lead - AEOS" \
      version="2.0-distroless" \
      description="Zero-Fat Distroless Image for AEOS NestJS API"

# Sử dụng user "nonroot" (uid: 65532) mặc định của Distroless
USER 65532:65532

# Copy từ builder sang
COPY --from=builder /app/pruned ./

EXPOSE 3000

# Healthcheck chạy trực tiếp qua Node (bỏ qua shell) vì Distroless không có /bin/sh
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD ["node", "-e", "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"]

# Chạy ứng dụng trực tiếp bằng Node.js (không qua sh)
# Node.js trên Distroless xử lý PID 1 rất tốt, không cần Tini
CMD ["dist/main.js"]
