import { AsyncLocalStorage } from 'async_hooks';
export interface CorrelationContext {
    correlationId: string;
}
export declare const correlationStorage: AsyncLocalStorage<CorrelationContext>;
/** Lấy correlationId của request hiện tại (hoặc 'no-correlation-id' nếu không có) */
export declare function getCorrelationId(): string;
//# sourceMappingURL=correlation-storage.d.ts.map