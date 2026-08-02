export interface AuditLogger {
  log(params: {
    tenantId: string | null;
    actorId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    oldData?: Record<string, unknown> | null;
    newData?: Record<string, unknown> | null;
    ipAddress?: string | null;
  }): Promise<void>;
}

export const AUDIT_LOGGER = Symbol('AUDIT_LOGGER');
