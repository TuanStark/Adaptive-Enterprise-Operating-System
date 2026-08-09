import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { ProjectRepository } from '../../domain/repositories/project.repository';
import {
  Project,
  ProjectStatus,
  Priority,
  ProjectProps,
} from '../../domain/aggregates/project.aggregate';
import { ProjectMember } from '../../domain/entities/project-member.entity';
import { OutboxService } from '../../../../common/events/outbox.service';

@Injectable()
export class PrismaProjectRepository implements ProjectRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async save(project: Project): Promise<void> {
    const domainEvents = project.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.project.upsert({
        where: { id: project.id },
        create: {
          id: project.id,
          tenantId: project.tenantId,
          workspaceId: project.workspaceId,
          name: project.name,
          description: project.description,
          ownerId: project.ownerId,
          status: project.status as any,
          priority: project.priority as any,
          startDate: project.startDate,
          endDate: project.endDate,
          version: project.version,
        },
        update: {
          name: project.name,
          description: project.description,
          ownerId: project.ownerId,
          status: project.status as any,
          priority: project.priority as any,
          startDate: project.startDate,
          endDate: project.endDate,
          deletedAt: project.deletedAt,
          version: { increment: 1 },
        },
      });

      await tx.projectMember.deleteMany({ where: { projectId: project.id } });
      if (project.members.length > 0) {
        await tx.projectMember.createMany({
          data: project.members.map((m) => ({
            id: m.id,
            tenantId: m.tenantId,
            projectId: m.projectId,
            userId: m.userId,
            role: m.role,
            joinedAt: m.joinedAt,
          })),
        });
      }

      for (const event of domainEvents) {
        await this.outboxService.saveEvent(tx, {
          tenantId: project.tenantId,
          aggregateType: 'Project',
          aggregateId: project.id,
          eventType: event.constructor.name,
          payload: typeof (event as any).toPayload === 'function' ? (event as any).toPayload() : {},
        });
      }
    });
  }

  async findById(id: string): Promise<Project | null> {
    const record = await this.prisma.project.findUnique({
      where: { id, deletedAt: null },
      include: { members: true },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByWorkspaceId(
    workspaceId: string,
    page: number,
    limit: number,
  ): Promise<{ data: Project[]; total: number }> {
    const [records, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where: { workspaceId, deletedAt: null },
        include: { members: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.project.count({ where: { workspaceId, deletedAt: null } }),
    ]);

    return { data: records.map((r) => this.toDomain(r)), total };
  }

  private toDomain(record: any): Project {
    const members = (record.members ?? []).map((m: any) =>
      ProjectMember.create({
        id: m.id,
        tenantId: m.tenantId ?? '',
        projectId: m.projectId ?? '',
        userId: m.userId ?? '',
        role: m.role ?? 'MEMBER',
        joinedAt: m.joinedAt ?? new Date(),
      }),
    );

    return Project.fromPersistence({
      id: record.id,
      tenantId: record.tenantId ?? '',
      workspaceId: record.workspaceId ?? '',
      name: record.name ?? '',
      description: record.description,
      ownerId: record.ownerId ?? '',
      status: (record.status as ProjectStatus) ?? ProjectStatus.DRAFT,
      priority: (record.priority as Priority) ?? Priority.MEDIUM,
      startDate: record.startDate,
      endDate: record.endDate,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
      members,
    });
  }
}
