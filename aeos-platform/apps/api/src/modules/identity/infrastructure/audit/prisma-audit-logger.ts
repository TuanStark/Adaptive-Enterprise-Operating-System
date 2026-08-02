import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { generateId } from '@aeos/common';
import { AuditLogger } from '../../domain/services/audit-logger.interface';

@Injectable()
export class PrismaAuditLogger implements AuditLogger {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    tenantId: string | null;
    actorId: string | null;
    action: string;
    entityType: string;
    entityId: string;
    oldData?: Record<string, unknown> | null;
    newData?: Record<string, unknown> | null;
    ipAddress?: string | null;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        id: generateId(),
        tenantId: params.tenantId,
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        oldData: (params.oldData ?? undefined) as any,
        newData: (params.newData ?? undefined) as any,
        ipAddress: params.ipAddress,
      },
    });
  }
}
