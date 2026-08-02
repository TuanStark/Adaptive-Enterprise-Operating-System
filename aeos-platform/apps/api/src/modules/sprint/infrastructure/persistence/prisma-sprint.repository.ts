import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { SprintRepository } from '../../domain/repositories/sprint.repository';
import { Sprint, SprintStatus, SprintProps } from '../../domain/aggregates/sprint.aggregate';

@Injectable()
export class PrismaSprintRepository implements SprintRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(sprint: Sprint): Promise<void> {
    await this.prisma.sprint.upsert({
      where: { id: sprint.id },
      create: {
        id: sprint.id,
        tenantId: sprint.tenantId,
        projectId: sprint.projectId,
        name: sprint.name,
        goal: sprint.goal,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        version: sprint.version,
      },
      update: {
        name: sprint.name,
        goal: sprint.goal,
        status: sprint.status,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        version: { increment: 1 },
      },
    });
  }

  async findById(id: string): Promise<Sprint | null> {
    const record = await this.prisma.sprint.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByProjectId(projectId: string): Promise<Sprint[]> {
    const records = await this.prisma.sprint.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.toDomain(r));
  }

  async findActiveByProjectId(projectId: string): Promise<Sprint | null> {
    const record = await this.prisma.sprint.findFirst({
      where: { projectId, status: 'ACTIVE' },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  private toDomain(record: any): Sprint {
    return Sprint.fromPersistence({
      id: record.id,
      tenantId: record.tenantId ?? '',
      projectId: record.projectId ?? '',
      name: record.name ?? '',
      goal: record.goal,
      status: (record.status as SprintStatus) ?? SprintStatus.PLANNING,
      startDate: record.startDate,
      endDate: record.endDate,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
