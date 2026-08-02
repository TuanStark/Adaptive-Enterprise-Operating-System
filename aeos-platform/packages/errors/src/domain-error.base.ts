// packages/errors/src/domain-error.base.ts
// Base class cho mọi Domain Error trong AEOS.
// Mỗi Bounded Context sẽ extend class này để tạo error catalogue riêng.

export abstract class DomainError {
  constructor(
    /** Mã lỗi duy nhất, ví dụ: WORKSPACE_NAME_CONFLICT */
    public readonly code: string,
    /** Thông điệp giải thích cho developer / user */
    public readonly message: string,
    /** HTTP status code tương ứng (để Global Exception Filter map) */
    public readonly httpStatus: number = 400,
  ) {}

  /** Serialize để log hoặc trả về client */
  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
    };
  }
}

// ── Common Errors (dùng chung cho mọi module) ──

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity.toUpperCase()}_NOT_FOUND`, `${entity} with id "${id}" not found.`, 404);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}

export class ForbiddenError extends DomainError {
  constructor(action?: string) {
    super(
      'INSUFFICIENT_PERMISSION',
      action ? `You do not have permission to: ${action}` : 'Access denied.',
      403,
    );
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super('VALIDATION_ERROR', message, 400);
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      ...(this.fieldErrors && { fields: this.fieldErrors }),
    };
  }
}
