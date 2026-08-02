// packages/logger/src/logger.interface.ts
// Interface cho Logger — Dependency Inversion (SOLID "D").
// Application code chỉ biết interface này, không biết Pino hay Winston.

export interface IAppLogger {
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
}

export const APP_LOGGER = Symbol('APP_LOGGER');
