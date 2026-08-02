// packages/errors/src/result.ts
// Result Pattern — Domain Layer KHÔNG BAO GIỜ throw exception.
// Mọi operation trả về Result<T, E> để caller xử lý tường minh.

export class Result<T, E = DomainError> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  /** Tạo kết quả thành công */
  static ok<T>(value: T): Result<T, never> {
    return new Result<T, never>(value, undefined);
  }

  /** Tạo kết quả thất bại */
  static fail<E>(error: E): Result<never, E> {
    return new Result<never, E>(undefined, error);
  }

  get isOk(): boolean {
    return this._error === undefined;
  }

  get isFail(): boolean {
    return !this.isOk;
  }

  /** Lấy giá trị — CHỈ gọi khi isOk === true */
  get value(): T {
    if (this.isFail) {
      throw new Error('Cannot get value of a failed Result. Check isOk first.');
    }
    return this._value as T;
  }

  /** Lấy lỗi — CHỈ gọi khi isFail === true */
  get error(): E {
    if (this.isOk) {
      throw new Error('Cannot get error of a successful Result. Check isFail first.');
    }
    return this._error as E;
  }

  /** Map giá trị thành công sang kiểu khác */
  map<U>(fn: (val: T) => U): Result<U, E> {
    if (this.isOk) {
      return Result.ok(fn(this.value));
    }
    return Result.fail(this.error);
  }
}

import { DomainError } from './domain-error.base';
