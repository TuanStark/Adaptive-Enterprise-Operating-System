'use strict';
// packages/logger/src/correlation-storage.ts
// AsyncLocalStorage cho Correlation ID.
// Cho phép mọi layer truy cập correlationId mà không cần truyền param.
Object.defineProperty(exports, '__esModule', { value: true });
exports.correlationStorage = void 0;
exports.getCorrelationId = getCorrelationId;
const async_hooks_1 = require('async_hooks');
exports.correlationStorage = new async_hooks_1.AsyncLocalStorage();
/** Lấy correlationId của request hiện tại (hoặc 'no-correlation-id' nếu không có) */
function getCorrelationId() {
  return exports.correlationStorage.getStore()?.correlationId ?? 'no-correlation-id';
}
//# sourceMappingURL=correlation-storage.js.map
