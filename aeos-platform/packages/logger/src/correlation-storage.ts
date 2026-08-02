// packages/logger/src/correlation-storage.ts
// AsyncLocalStorage cho Correlation ID.
// Cho phép mọi layer truy cập correlationId mà không cần truyền param.

import { AsyncLocalStorage } from 'async_hooks';

export interface CorrelationContext {
  correlationId: string;
}

export const correlationStorage = new AsyncLocalStorage<CorrelationContext>();

/** Lấy correlationId của request hiện tại (hoặc 'no-correlation-id' nếu không có) */
export function getCorrelationId(): string {
  return correlationStorage.getStore()?.correlationId ?? 'no-correlation-id';
}
