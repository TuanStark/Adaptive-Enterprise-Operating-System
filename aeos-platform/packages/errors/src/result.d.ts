export declare class Result<T, E = DomainError> {
    private readonly _value?;
    private readonly _error?;
    private constructor();
    /** Tạo kết quả thành công */
    static ok<T>(value: T): Result<T, never>;
    /** Tạo kết quả thất bại */
    static fail<E>(error: E): Result<never, E>;
    get isOk(): boolean;
    get isFail(): boolean;
    /** Lấy giá trị — CHỈ gọi khi isOk === true */
    get value(): T;
    /** Lấy lỗi — CHỈ gọi khi isFail === true */
    get error(): E;
    /** Map giá trị thành công sang kiểu khác */
    map<U>(fn: (val: T) => U): Result<U, E>;
}
import { DomainError } from './domain-error.base';
//# sourceMappingURL=result.d.ts.map