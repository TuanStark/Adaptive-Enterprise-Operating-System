# AEOS – Backend Implementation Blueprint (Production-Grade)

> **"Tài liệu này là bản thiết kế cuối cùng trước khi viết dòng code đầu tiên. Bất kỳ Developer nào đọc xong tài liệu này đều phải biết chính xác: file nào nằm ở đâu, error xử lý ra sao, log ghi thế nào, và deploy lên production cần những gì."**

---

## 1. Monorepo Structure (pnpm Workspace)

AEOS sử dụng **pnpm workspace** thuần túy (không Turborepo, không Lerna).

### 1.1 Lý do chọn pnpm workspace thuần

- Đơn giản, ít magic, dễ debug.
- Native workspace protocol (`workspace:*`) đủ mạnh cho Modular Monolith.
- Không thêm build orchestration layer khi chưa cần.
- Khi scale lên 50+ packages, mới cân nhắc thêm Turborepo.

### 1.2 Cấu trúc Thư mục Tổng thể

```text
aeos-platform/
│
├── apps/
│   ├── api/                    # NestJS API Server (Main Backend)
│   └── worker/                 # Background Job Processor (Bull/BullMQ)
│
├── packages/
│   ├── shared-kernel/          # DDD Base Classes (AggregateRoot, Entity, ValueObject...)
│   ├── database/               # Prisma Schema, Migrations, Seed
│   ├── config/                 # Centralized Config + Validation (Zod schema)
│   ├── logger/                 # Structured Logging (Pino/Winston wrapper)
│   ├── errors/                 # Domain Error Catalogue + Result<T,E> Pattern
│   ├── event-bus/              # Internal Event Dispatcher (in-process + Outbox)
│   └── common/                 # Shared utilities, constants, types
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.api
│   │   ├── Dockerfile.worker
│   │   └── docker-compose.yml  # Local dev: Postgres, Redis, Kafka, MinIO, Mailhog
│   └── scripts/                # DB migration scripts, seed scripts, health check scripts
│
├── docs/                       # Architecture docs, ADRs
├── .env.example
├── .eslintrc.js
├── .prettierrc
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json          # Shared TypeScript config (path aliases)
└── README.md
```

### 1.3 pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 1.4 Package Dependency Graph (Hướng phụ thuộc)

```text
apps/api ──────► packages/shared-kernel
    │                    ▲
    ├──────► packages/database
    ├──────► packages/config
    ├──────► packages/logger
    ├──────► packages/errors
    ├──────► packages/event-bus
    └──────► packages/common

Quy tắc bất di bất dịch:
- packages/ KHÔNG BAO GIỜ import từ apps/
- shared-kernel KHÔNG import từ bất kỳ package nào khác (nó là gốc rễ)
- database KHÔNG import từ shared-kernel (Prisma schema độc lập với Domain)
```

---

## 2. Clean Architecture Layers (Chi tiết)

### 2.1 Dependency Rule (Luật Phụ thuộc)

```text
Presentation Layer (Controllers, DTOs)
        │
        ▼
Application Layer (Commands, Queries, Handlers, Use Cases)
        │
        ▼
Domain Layer (Aggregates, Entities, Value Objects, Events, Repository Interfaces)

─── RANH GIỚI KHÔNG BAO GIỜ ĐƯỢC VƯỢT QUA ───

Infrastructure Layer (Prisma Repos, Redis, Kafka, External APIs)
        │
        └──► Implements Domain Interfaces
```

**Quy tắc tuyệt đối:**
- Domain Layer **KHÔNG ĐƯỢC** import bất kỳ thư viện bên ngoài nào (NestJS, Prisma, Express, Axios...).
- Domain Layer chỉ chứa: TypeScript thuần, Business Rules, Interfaces.
- Nếu ngày mai đổi từ NestJS sang Fastify, hoặc từ Prisma sang TypeORM — **Domain Layer không thay đổi một dòng nào**.

### 2.2 Module Structure (Áp dụng cho MỌI Bounded Context)

```text
src/modules/workspace/
│
├── domain/
│   ├── aggregates/
│   │   └── workspace.aggregate.ts          # Aggregate Root
│   ├── entities/
│   │   ├── workspace-member.entity.ts
│   │   └── invitation.entity.ts
│   ├── value-objects/
│   │   ├── workspace-name.vo.ts
│   │   └── workspace-slug.vo.ts
│   ├── events/
│   │   ├── workspace-created.event.ts
│   │   └── member-invited.event.ts
│   ├── errors/
│   │   └── workspace.errors.ts             # Domain-specific errors
│   ├── repositories/
│   │   └── workspace.repository.interface.ts  # Interface ONLY
│   └── services/
│       └── workspace-policy.service.ts     # Domain Service (Business Rules spanning entities)
│
├── application/
│   ├── commands/
│   │   ├── create-workspace/
│   │   │   ├── create-workspace.command.ts
│   │   │   └── create-workspace.handler.ts
│   │   └── invite-member/
│   │       ├── invite-member.command.ts
│   │       └── invite-member.handler.ts
│   ├── queries/
│   │   ├── get-workspace/
│   │   │   ├── get-workspace.query.ts
│   │   │   └── get-workspace.handler.ts
│   │   └── list-workspaces/
│   │       ├── list-workspaces.query.ts
│   │       └── list-workspaces.handler.ts
│   ├── event-handlers/
│   │   └── on-workspace-created.handler.ts # React to Domain Events
│   └── mappers/
│       └── workspace.mapper.ts             # Domain <-> Persistence mapping
│
├── infrastructure/
│   ├── persistence/
│   │   └── prisma-workspace.repository.ts  # Implements WorkspaceRepository
│   ├── cache/
│   │   └── redis-workspace.cache.ts
│   └── external/
│       └── slack-notification.adapter.ts
│
├── presentation/
│   ├── controllers/
│   │   └── workspace.controller.ts
│   ├── dto/
│   │   ├── create-workspace.request.dto.ts
│   │   ├── create-workspace.response.dto.ts
│   │   └── workspace-list.response.dto.ts
│   └── decorators/
│       └── workspace-permission.decorator.ts
│
└── workspace.module.ts                     # NestJS Module (DI wiring)
```

---

## 3. Shared Kernel (DDD Base Classes)

### 3.1 Entity Base Class

```typescript
// packages/shared-kernel/src/domain/entity.base.ts

export abstract class Entity<TId> {
  private readonly _id: TId;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(id: TId) {
    this._id = id;
    this._createdAt = new Date();
    this._updatedAt = new Date();
  }

  get id(): TId { return this._id; }

  equals(other: Entity<TId>): boolean {
    return this._id === other._id;
  }

  protected touch(): void {
    this._updatedAt = new Date();
  }
}
```

### 3.2 Aggregate Root Base Class

```typescript
// packages/shared-kernel/src/domain/aggregate-root.base.ts

export abstract class AggregateRoot<TId> extends Entity<TId> {
  private _domainEvents: DomainEvent[] = [];
  private _version: number = 0;                // Optimistic Locking

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];
    return events;
  }

  get version(): number { return this._version; }

  public incrementVersion(): void { this._version++; }
}
```

### 3.3 Value Object Base Class

```typescript
// packages/shared-kernel/src/domain/value-object.base.ts

export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);       // Immutability
  }

  equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
```

### 3.4 Domain Event Base

```typescript
// packages/shared-kernel/src/domain/domain-event.base.ts

export abstract class DomainEvent {
  public readonly eventId: string;             // UUID
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventType: string;

  constructor(aggregateId: string) {
    this.eventId = generateUUID();
    this.occurredOn = new Date();
    this.aggregateId = aggregateId;
    this.eventType = this.constructor.name;    // "WorkspaceCreatedEvent"
  }
}
```

---

## 4. Production Error Architecture

> **Triết lý: Domain Layer KHÔNG BAO GIỜ throw exception. Nó trả về Result<T, E>.**

### 4.1 Result Pattern

```typescript
// packages/errors/src/result.ts

export class Result<T, E = DomainError> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  static ok<T>(value: T): Result<T, never> {
    return new Result(value, undefined);
  }

  static fail<E>(error: E): Result<never, E> {
    return new Result(undefined, error);
  }

  get isOk(): boolean { return this._error === undefined; }
  get isFail(): boolean { return !this.isOk; }
  get value(): T { return this._value!; }
  get error(): E { return this._error!; }
}
```

### 4.2 Domain Error Catalogue

```typescript
// packages/errors/src/domain-error.base.ts

export abstract class DomainError {
  constructor(
    public readonly code: string,        // "WORKSPACE_NAME_CONFLICT"
    public readonly message: string,     // Human-readable
    public readonly httpStatus: number,  // Mapped HTTP status
  ) {}
}

// Ví dụ từng Bounded Context:
// src/modules/workspace/domain/errors/workspace.errors.ts

export class WorkspaceNameConflict extends DomainError {
  constructor(name: string) {
    super(
      'WORKSPACE_NAME_CONFLICT',
      `Workspace "${name}" đã tồn tại trong Organization này.`,
      409,
    );
  }
}

export class WorkspaceNotFound extends DomainError {
  constructor(id: string) {
    super('WORKSPACE_NOT_FOUND', `Workspace ${id} không tồn tại.`, 404);
  }
}

export class InsufficientPermission extends DomainError {
  constructor(action: string) {
    super('INSUFFICIENT_PERMISSION', `Bạn không có quyền: ${action}`, 403);
  }
}
```

### 4.3 Global Exception Filter (Production)

```typescript
// apps/api/src/common/filters/global-exception.filter.ts

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const correlationId = request.headers['x-correlation-id'];

    // 1. Domain Error (từ Result.fail)
    if (exception instanceof DomainError) {
      this.logger.warn({
        correlationId,
        errorCode: exception.code,
        message: exception.message,
        path: request.url,
      });
      return response.status(exception.httpStatus).json({
        success: false,
        error: {
          code: exception.code,
          message: exception.message,
        },
        traceId: correlationId,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. NestJS HttpException (Validation, Auth...)
    if (exception instanceof HttpException) {
      // ... map to standard format
    }

    // 3. Unknown Error (Bug thực sự - Log ERROR level + alert)
    this.logger.error({
      correlationId,
      message: 'UNHANDLED_EXCEPTION',
      stack: exception instanceof Error ? exception.stack : String(exception),
      path: request.url,
    });
    return response.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.',
      },
      traceId: correlationId,
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## 5. Production Logging Architecture

> **Triết lý: Log phải là JSON có cấu trúc (structured), có Correlation ID, và có thể query được trên Grafana/Loki/ELK.**

### 5.1 Log Levels & Khi nào dùng

| Level | Khi nào sử dụng | Ví dụ |
|:---|:---|:---|
| `error` | Lỗi không mong muốn, cần can thiệp | Database connection lost, Unhandled exception |
| `warn` | Hành vi bất thường nhưng hệ thống vẫn chạy | Rate limit exceeded, Invalid token, Domain Error |
| `info` | Sự kiện nghiệp vụ quan trọng | User registered, Workspace created, Payment processed |
| `debug` | Chi tiết kỹ thuật cho developer | SQL query executed, Cache hit/miss, Event dispatched |

### 5.2 Structured Log Format (JSON)

Mỗi dòng log trên Production phải có dạng:

```json
{
  "level": "info",
  "timestamp": "2026-08-01T15:30:00.000Z",
  "correlationId": "req-550e8400-e29b-41d4",
  "service": "aeos-api",
  "context": "WorkspaceController",
  "message": "Workspace created successfully",
  "metadata": {
    "workspaceId": "ws-001",
    "userId": "usr-001",
    "duration": 45
  }
}
```

### 5.3 Correlation ID Middleware

Mọi request đến API phải được gắn một `correlationId` duy nhất. ID này sẽ đi theo suốt:

```text
HTTP Request (correlationId trong header)
    → Controller (log correlationId)
        → Application Service (log correlationId)
            → Repository (log correlationId vào SQL comment)
                → Domain Event payload (embed correlationId)
                    → Worker/Consumer (đọc correlationId từ Event)
```

```typescript
// apps/api/src/common/middleware/correlation-id.middleware.ts

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] || generateUUID();
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('x-correlation-id', correlationId);

    // Lưu vào AsyncLocalStorage để mọi layer đều truy cập được
    correlationStorage.run(correlationId, () => next());
  }
}
```

### 5.4 Request Logging Interceptor

Tự động ghi log cho MỌI request vào/ra:

```typescript
// apps/api/src/common/interceptors/request-logging.interceptor.ts

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    this.logger.info({
      message: 'Incoming request',
      method: request.method,
      path: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    });

    return next.handle().pipe(
      tap(() => {
        this.logger.info({
          message: 'Request completed',
          method: request.method,
          path: request.url,
          statusCode: context.switchToHttp().getResponse().statusCode,
          duration: Date.now() - startTime,
        });
      }),
    );
  }
}
```

---

## 6. Production Request Pipeline

Thứ tự xử lý của MỌI request đến AEOS API:

```text
HTTP Request
    │
    ▼
[1] Correlation ID Middleware         ← Gắn traceId
    │
    ▼
[2] Helmet Middleware                 ← Security headers (X-Frame-Options, CSP...)
    │
    ▼
[3] Rate Limiting Guard              ← Chống DDoS/Brute-force
    │
    ▼
[4] Authentication Guard (JWT)       ← Xác thực: "Bạn là ai?"
    │
    ▼
[5] Authorization Guard (RBAC)       ← Phân quyền: "Bạn được làm gì?"
    │
    ▼
[6] Validation Pipe (class-validator) ← Validate request body/params
    │
    ▼
[7] Request Logging Interceptor      ← Log request đến
    │
    ▼
[8] Controller → Application Service → Domain
    │
    ▼
[9] Response Transform Interceptor   ← Wrap response { success, data, meta }
    │
    ▼
[10] Request Logging Interceptor     ← Log response đi (duration, status)
    │
    ▼
[11] Global Exception Filter         ← Bắt MỌI lỗi, format chuẩn
    │
    ▼
HTTP Response
```

---

## 7. Production Health & Lifecycle

### 7.1 Health Check Endpoints

Kubernetes (hoặc bất kỳ orchestrator nào) cần biết ứng dụng có sống hay không.

```text
GET /health/liveness    → Ứng dụng có đang chạy không?     (200 OK / 503)
GET /health/readiness   → Ứng dụng có sẵn sàng nhận request không? (Check DB, Redis, Kafka)
```

```typescript
// Readiness check phải kiểm tra:
- PostgreSQL connection: SELECT 1
- Redis connection: PING
- Kafka broker: metadata request
- Disk space (nếu lưu file local)
```

### 7.2 Graceful Shutdown

Khi nhận SIGTERM (Kubernetes scale down, deploy mới):

```text
[1] Dừng nhận request mới
[2] Chờ các request đang xử lý hoàn tất (timeout: 30s)
[3] Đóng kết nối Database Connection Pool
[4] Đóng kết nối Redis
[5] Disconnect Kafka Consumer
[6] Flush log buffer
[7] Process exit(0)
```

```typescript
// apps/api/src/main.ts

app.enableShutdownHooks();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  await app.close();
  logger.info('Application shut down gracefully.');
  process.exit(0);
});
```

---

## 8. Configuration & Environment

### 8.1 Validation Schema (.env)

Không bao giờ để ứng dụng khởi động với config thiếu hoặc sai.

```typescript
// packages/config/src/env.schema.ts

import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
  PORT: z.coerce.number().default(3000),

  // Database
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.coerce.number().default(2),
  DATABASE_POOL_MAX: z.coerce.number().default(10),

  // Redis
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Khi app khởi động:
const result = envSchema.safeParse(process.env);
if (!result.success) {
  console.error('❌ Invalid environment variables:', result.error.format());
  process.exit(1);      // DỪNG NGAY, không chạy với config lỗi
}
```

---

## 9. Transaction & Outbox Pattern

### 9.1 Transaction Boundary

Một Transaction chỉ tồn tại trong MỘT Bounded Context:

```typescript
// Ví dụ: CreateWorkspaceHandler

async execute(command: CreateWorkspaceCommand): Promise<Result<WorkspaceId>> {
  return this.unitOfWork.execute(async (tx) => {
    // 1. Tạo Workspace Aggregate (Domain logic)
    const workspace = Workspace.create({
      name: WorkspaceName.create(command.name),
      organizationId: command.organizationId,
      ownerId: command.userId,
    });
    if (workspace.isFail) return Result.fail(workspace.error);

    // 2. Lưu Workspace (trong cùng transaction)
    await this.workspaceRepo.save(workspace.value, tx);

    // 3. Lưu Domain Events vào Outbox Table (trong cùng transaction)
    const events = workspace.value.pullDomainEvents();
    await this.outboxRepo.saveEvents(events, tx);

    // 4. COMMIT — Tất cả hoặc không gì cả
    return Result.ok(workspace.value.id);
  });
}

// SAU KHI COMMIT:
// - Outbox Processor (cron/polling) đọc outbox table
// - Publish events ra Internal Event Bus hoặc Kafka
// - Các Context khác (Notification, Audit, Search) react
```

### 9.2 Outbox Table

```sql
CREATE TABLE outbox_events (
    id              UUID PRIMARY KEY,
    aggregate_id    UUID NOT NULL,
    event_type      VARCHAR(255) NOT NULL,
    payload         JSONB NOT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    processed_at    TIMESTAMP,          -- NULL = chưa gửi
    retry_count     INT DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'PENDING'  -- PENDING, PROCESSED, FAILED
);

CREATE INDEX idx_outbox_pending ON outbox_events(status, created_at)
WHERE status = 'PENDING';
```

---

## 10. Testing Architecture

### 10.1 Test Pyramid

```text
           ▲
          /E2E\            ← Ít nhất, chậm nhất, test full API flow
         /─────\
        /Integra-\         ← Test Application Layer với real DB (Testcontainers)
       /──tion────\
      /   Unit     \       ← Nhiều nhất, nhanh nhất, test Domain Logic thuần
     /──────────────\
```

### 10.2 Convention

| Loại Test | Vị trí File | Mock gì? | Database |
|:---|:---|:---|:---|
| Unit (Domain) | `*.spec.ts` cạnh file gốc | Không mock gì cả | Không cần |
| Integration | `*.integration-spec.ts` | Mock external APIs | Real DB (Testcontainers) |
| E2E | `test/e2e/*.e2e-spec.ts` | Không mock | Real DB + Redis |

### 10.3 Ví dụ Unit Test Domain

```typescript
// src/modules/workspace/domain/aggregates/workspace.aggregate.spec.ts

describe('Workspace Aggregate', () => {
  it('should reject duplicate member', () => {
    const workspace = createTestWorkspace();
    workspace.addMember(userId);

    const result = workspace.addMember(userId); // Thêm lần 2

    expect(result.isFail).toBe(true);
    expect(result.error.code).toBe('MEMBER_ALREADY_EXISTS');
  });

  it('should emit WorkspaceCreatedEvent on creation', () => {
    const workspace = Workspace.create({ name: 'Engineering', ... });

    const events = workspace.value.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(WorkspaceCreatedEvent);
  });
});
```

---

## 11. Docker & Local Development

### 11.1 docker-compose.yml (Local Dev)

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: aeos_dev
      POSTGRES_USER: aeos
      POSTGRES_PASSWORD: aeos_secret
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U aeos"]
      interval: 5s

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    ports: ["9092:9092"]
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:29093
      CLUSTER_ID: MkU3OEVBNTcwNTJENDM2Qk
      # KRaft mode — không cần Zookeeper

  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    ports: ["9000:9000", "9001:9001"]

  mailhog:
    image: mailhog/mailhog
    ports: ["1025:1025", "8025:8025"]

volumes:
  pgdata:
```

### 11.2 Developer Onboarding (3 lệnh)

```bash
git clone git@github.com:org/aeos-platform.git
cd aeos-platform

pnpm install                  # Cài tất cả dependencies
docker compose up -d          # Khởi chạy Postgres, Redis, Kafka, MinIO, Mailhog
pnpm --filter @aeos/database db:migrate   # Chạy migrations
pnpm --filter @aeos/database db:seed      # Seed dữ liệu mẫu
pnpm --filter @aeos/api dev               # Khởi chạy API server (hot reload)
```

---

## 12. Module Implementation Order

Không triển khai ngẫu nhiên. Thứ tự này phản ánh dependency thực tế:

```text
[Phase 3.1] Foundation
    │   pnpm workspace, tsconfig, ESLint, Prettier, Husky
    │   Docker Compose, CI pipeline skeleton
    ▼
[Phase 3.2] Shared Packages
    │   shared-kernel, errors (Result Pattern), logger, config
    ▼
[Phase 3.3] Database Package
    │   Prisma schema (Identity + Workspace tables), migrations
    ▼
[Phase 3.4] Identity Context
    │   Register, Login, JWT, Refresh Token, Session, Email Verification
    │   Global Auth Guard
    ▼
[Phase 3.5] Organization Context
    │   Create Org, Invite Member, Manage Settings
    ▼
[Phase 3.6] Workspace Context
    │   Create Workspace, Invite, Manage Members
    │   RBAC: Roles, Permissions, Permission Guard
    ▼
[Phase 3.7] Project Context
    │   Project CRUD, State Machine (DRAFT→ACTIVE→COMPLETED→ARCHIVED)
    ▼
[Phase 3.8] Task Context
    │   Task CRUD, Assignment, State Machine (TODO→IN_PROGRESS→REVIEW→DONE)
    ▼
[Phase 3.9] Knowledge Context (Core Domain)
    │   Document Lifecycle, Versioning, Publish Flow
    ▼
[Phase 3.10] Notification Context
    │   In-App, Email (via event-driven)
    ▼
[Phase 3.11] Audit Context
    │   Immutable audit logs (append-only)
    ▼
[Phase 3.12] Search Context (Core Domain)
    │   OpenSearch integration, Permission-aware search
    ▼
[Phase 3.13] Workflow Context (Core Domain)
    │   Workflow Engine, Event-driven automation
    ▼
[Phase 3.14] AI Context (Core Domain)
    │   RAG, Vector DB, Permission-aware AI Assistant
```

---

## 13. Coding Standards & Git Convention

### 13.1 Code Quality Tools

- **ESLint**: `@typescript-eslint/recommended` + custom rules
- **Prettier**: 2 spaces, single quotes, trailing commas
- **Husky**: Pre-commit hook chạy lint + format
- **lint-staged**: Chỉ lint các file đã thay đổi

### 13.2 Git Commit Convention (Conventional Commits)

```text
feat(workspace): add invite member endpoint
fix(identity): handle expired refresh token edge case
refactor(shared-kernel): extract Result pattern to separate package
perf(task): add composite index for task listing query
test(workspace): add unit tests for workspace aggregate invariants
docs(api): update OpenAPI spec for knowledge endpoints
chore(deps): upgrade prisma to v6.x
```

### 13.3 Branch Strategy

```text
main              ← Production (protected, deploy on merge)
  └── develop     ← Integration branch
       ├── feat/workspace-invite
       ├── fix/jwt-refresh-bug
       └── refactor/error-handling
```

---

*Tài liệu này là "Single Source of Truth" cho toàn bộ Backend Architecture. Mọi Developer mới gia nhập đội ngũ phải đọc tài liệu này trước khi viết dòng code đầu tiên. Mọi Pull Request phải tuân thủ các quy tắc được mô tả ở đây.*
