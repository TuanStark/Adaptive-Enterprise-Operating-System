export interface IAppLogger {
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, metadata?: Record<string, unknown>): void;
  debug(message: string, metadata?: Record<string, unknown>): void;
}
export declare const APP_LOGGER: unique symbol;
//# sourceMappingURL=logger.interface.d.ts.map
