import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { WorkspaceRepository } from '../../domain/repositories/workspace.repository';
import { Workspace } from '../../domain/aggregates/workspace.aggregate';
import { WorkspacePersistenceMapper } from '../mappers/workspace-persistence.mapper';
import { OutboxService } from '../../../../common/events/outbox.service';

@Injectable()
export class PrismaWorkspaceRepository implements WorkspaceRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async save(ws: Workspace): Promise<void> {
    const data = WorkspacePersistenceMapper.toPersistence(ws);
    const domainEvents = ws.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.workspace.upsert({
        where: { id: ws.id },
        create: {
          id: data.id,
          tenantId: data.tenantId,
          organizationId: data.organizationId,
          name: data.name,
          description: data.description,
          ownerId: data.ownerId,
          status: data.status,
          version: data.version,
        },
        update: {
          name: data.name,
          description: data.description,
          ownerId: data.ownerId,
          status: data.status,
          deletedAt: data.deletedAt,
          version: { increment: 1 },
        },
      });

      await tx.workspaceMember.deleteMany({ where: { workspaceId: ws.id } });
      if (data.members.length > 0) {
        await tx.workspaceMember.createMany({ data: data.members });
      }

      for (const event of domainEvents) {
        await this.outboxService.saveEvent(tx, {
          tenantId: ws.tenantId,
          aggregateType: 'Workspace',
          aggregateId: ws.id,
          eventType: event.constructor.name,
          payload: typeof (event as any).toPayload === 'function' ? (event as any).toPayload() : {},
        });
      }
    });
  }

  async findById(id: string): Promise<Workspace | null> {
    const record = await this.prisma.workspace.findUnique({
      where: { id, deletedAt: null },
      include: { members: true },
    });
    if (!record) return null;
    return WorkspacePersistenceMapper.toDomain(record);
  }

  async findByOrganizationId(organizationId: string): Promise<Workspace[]> {
    const records = await this.prisma.workspace.findMany({
      where: { organizationId, deletedAt: null },
      include: { members: true },
    });
    return records.map(WorkspacePersistenceMapper.toDomain);
  }
}
