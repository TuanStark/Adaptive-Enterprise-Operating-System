export declare abstract class DomainError {
  /** Mã lỗi duy nhất, ví dụ: WORKSPACE_NAME_CONFLICT */
  readonly code: string;
  /** Thông điệp giải thích cho developer / user */
  readonly message: string;
  /** HTTP status code tương ứng (để Global Exception Filter map) */
  readonly httpStatus: number;
  constructor(
    /** Mã lỗi duy nhất, ví dụ: WORKSPACE_NAME_CONFLICT */
    code: string,
    /** Thông điệp giải thích cho developer / user */
    message: string,
    /** HTTP status code tương ứng (để Global Exception Filter map) */
    httpStatus?: number,
  );
  /** Serialize để log hoặc trả về client */
  toJSON(): Record<string, unknown>;
}
export declare class NotFoundError extends DomainError {
  constructor(entity: string, id: string);
}
export declare class ConflictError extends DomainError {
  constructor(message: string);
}
export declare class ForbiddenError extends DomainError {
  constructor(action?: string);
}
export declare class ValidationError extends DomainError {
  readonly fieldErrors?: Record<string, string> | undefined;
  constructor(message: string, fieldErrors?: Record<string, string> | undefined);
  toJSON(): Record<string, unknown>;
}
//# sourceMappingURL=domain-error.base.d.ts.map
