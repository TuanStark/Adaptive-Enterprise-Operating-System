// packages/common/src/utils/generate-id.ts
import { randomUUID } from 'node:crypto';

/** Sinh UUID v4 — dùng làm ID cho mọi Entity/Aggregate trong AEOS */
export function generateId(): string {
  return randomUUID();
}
