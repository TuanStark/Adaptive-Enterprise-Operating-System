'use strict';
// packages/errors/src/result.ts
// Result Pattern — Domain Layer KHÔNG BAO GIỜ throw exception.
// Mọi operation trả về Result<T, E> để caller xử lý tường minh.
Object.defineProperty(exports, '__esModule', { value: true });
exports.Result = void 0;
class Result {
  _value;
  _error;
  constructor(_value, _error) {
    this._value = _value;
    this._error = _error;
  }
  /** Tạo kết quả thành công */
  static ok(value) {
    return new Result(value, undefined);
  }
  /** Tạo kết quả thất bại */
  static fail(error) {
    return new Result(undefined, error);
  }
  get isOk() {
    return this._error === undefined;
  }
  get isFail() {
    return !this.isOk;
  }
  /** Lấy giá trị — CHỈ gọi khi isOk === true */
  get value() {
    if (this.isFail) {
      throw new Error('Cannot get value of a failed Result. Check isOk first.');
    }
    return this._value;
  }
  /** Lấy lỗi — CHỈ gọi khi isFail === true */
  get error() {
    if (this.isOk) {
      throw new Error('Cannot get error of a successful Result. Check isFail first.');
    }
    return this._error;
  }
  /** Map giá trị thành công sang kiểu khác */
  map(fn) {
    if (this.isOk) {
      return Result.ok(fn(this.value));
    }
    return Result.fail(this.error);
  }
}
exports.Result = Result;
//# sourceMappingURL=result.js.map
