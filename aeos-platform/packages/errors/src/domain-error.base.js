'use strict';
// packages/errors/src/domain-error.base.ts
// Base class cho mọi Domain Error trong AEOS.
// Mỗi Bounded Context sẽ extend class này để tạo error catalogue riêng.
Object.defineProperty(exports, '__esModule', { value: true });
exports.ValidationError =
  exports.ForbiddenError =
  exports.ConflictError =
  exports.NotFoundError =
  exports.DomainError =
    void 0;
class DomainError {
  code;
  message;
  httpStatus;
  constructor(
    /** Mã lỗi duy nhất, ví dụ: WORKSPACE_NAME_CONFLICT */
    code,
    /** Thông điệp giải thích cho developer / user */
    message,
    /** HTTP status code tương ứng (để Global Exception Filter map) */
    httpStatus = 400,
  ) {
    this.code = code;
    this.message = message;
    this.httpStatus = httpStatus;
  }
  /** Serialize để log hoặc trả về client */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
    };
  }
}
exports.DomainError = DomainError;
// ── Common Errors (dùng chung cho mọi module) ──
class NotFoundError extends DomainError {
  constructor(entity, id) {
    super(`${entity.toUpperCase()}_NOT_FOUND`, `${entity} with id "${id}" not found.`, 404);
  }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends DomainError {
  constructor(message) {
    super('CONFLICT', message, 409);
  }
}
exports.ConflictError = ConflictError;
class ForbiddenError extends DomainError {
  constructor(action) {
    super(
      'INSUFFICIENT_PERMISSION',
      action ? `You do not have permission to: ${action}` : 'Access denied.',
      403,
    );
  }
}
exports.ForbiddenError = ForbiddenError;
class ValidationError extends DomainError {
  fieldErrors;
  constructor(message, fieldErrors) {
    super('VALIDATION_ERROR', message, 400);
    this.fieldErrors = fieldErrors;
  }
  toJSON() {
    return {
      ...super.toJSON(),
      ...(this.fieldErrors && { fields: this.fieldErrors }),
    };
  }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=domain-error.base.js.map
