import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { OutboxService } from '../../../../common/events/outbox.service';
import { TaskRepository, TaskFilters } from '../../domain/repositories/task.repository';
import { Task, TaskStatus, TaskPriority, TaskProps } from '../../domain/aggregates/task.aggregate';

@Injectable()
export class PrismaTaskRepository implements TaskRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async save(task: Task): Promise<void> {
    const domainEvents = task.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.task.upsert({
      where: { id: task.id },
      create: {
        id: task.id,
        tenantId: task.tenantId,
        projectId: task.projectId,
        sprintId: task.sprintId,
        parentTaskId: task.parentTaskId,
        title: task.title,
        description: task.description,
        creatorId: task.creatorId,
        assigneeId: task.assigneeId,
        status: task.status as any,
        priority: task.priority as any,
        dueDate: task.dueDate,
        version: task.version,
      },
      update: {
        sprintId: task.sprintId,
        parentTaskId: task.parentTaskId,
        title: task.title,
        description: task.description,
        assigneeId: task.assigneeId,
        status: task.status as any,
        priority: task.priority as any,
        dueDate: task.dueDate,
        deletedAt: task.deletedAt,
        version: { increment: 1 },
      },
    });

    for (const event of domainEvents) {
      await this.outboxService.saveEvent(tx, {
        tenantId: task.tenantId,
        aggregateType: 'Task',
        aggregateId: task.id,
        eventType: event.eventType,
        payload: event.toPayload(),
      });
    }
  });
}

  async findById(id: string): Promise<Task | null> {
    const record = await this.prisma.task.findUnique({ where: { id, deletedAt: null } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAll(filters: TaskFilters, page: number, limit: number): Promise<{ data: Task[]; total: number }> {
    const where: any = { deletedAt: null };
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.sprintId) where.sprintId = filters.sprintId;
    if (filters.status) where.status = filters.status;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.priority) where.priority = filters.priority;

    const [records, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { data: records.map((r) => this.toDomain(r)), total };
  }

  private toDomain(record: any): Task {
    return Task.fromPersistence({
      id: record.id,
      tenantId: record.tenantId ?? '',
      projectId: record.projectId ?? '',
      sprintId: record.sprintId,
      parentTaskId: record.parentTaskId,
      title: record.title ?? '',
      description: record.description,
      creatorId: record.creatorId ?? '',
      assigneeId: record.assigneeId,
      status: (record.status as TaskStatus) ?? TaskStatus.BACKLOG,
      priority: (record.priority as TaskPriority) ?? TaskPriority.MEDIUM,
      dueDate: record.dueDate,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    });
  }
}
