import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { OutboxService } from '../../../../common/events/outbox.service';
import { TaskRepository, TaskFilters } from '../../domain/repositories/task.repository';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskProps,
} from '../../domain/aggregates/task.aggregate';

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
          workspaceId: task.workspaceId,
          projectId: task.projectId,
          key: task.key,
          sprintId: task.sprintId,
          parentTaskId: task.parentTaskId,
          title: task.title,
          description: task.description,
          type: task.type as any,
          creatorId: task.creatorId,
          reporterId: task.reporterId,
          assigneeId: task.assigneeId,
          status: task.status as any,
          priority: task.priority as any,
          resolution: task.resolution,
          labels: task.labels,
          storyPoints: task.storyPoints,
          originalEstimate: task.originalEstimate,
          remainingEstimate: task.remainingEstimate,
          timeSpent: task.timeSpent,
          boardPosition: task.boardPosition,
          startDate: task.startDate,
          dueDate: task.dueDate,
          environment: task.environment,
          fixVersionId: task.fixVersionId,
          version: task.version,
        },
        update: {
          workspaceId: task.workspaceId,
          sprintId: task.sprintId,
          parentTaskId: task.parentTaskId,
          title: task.title,
          description: task.description,
          type: task.type as any,
          reporterId: task.reporterId,
          assigneeId: task.assigneeId,
          status: task.status as any,
          priority: task.priority as any,
          resolution: task.resolution,
          labels: task.labels,
          storyPoints: task.storyPoints,
          originalEstimate: task.originalEstimate,
          remainingEstimate: task.remainingEstimate,
          timeSpent: task.timeSpent,
          boardPosition: task.boardPosition,
          startDate: task.startDate,
          dueDate: task.dueDate,
          environment: task.environment,
          fixVersionId: task.fixVersionId,
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
    const record = await this.prisma.task.findUnique({
      where: { id, deletedAt: null },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAll(
    filters: TaskFilters,
    page: number,
    limit: number,
  ): Promise<{ data: Task[]; total: number }> {
    const where: any = { deletedAt: null };
    if (filters.workspaceId) where.workspaceId = filters.workspaceId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.sprintId) where.sprintId = filters.sprintId;
    if (filters.status) where.status = filters.status;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.reporterId) where.reporterId = filters.reporterId;
    if (filters.priority) where.priority = filters.priority;
    if (filters.type) where.type = filters.type;
    if (filters.fixVersionId) where.fixVersionId = filters.fixVersionId;
    if (filters.labels && filters.labels.length > 0) {
      where.labels = { hasSome: filters.labels };
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { key: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [records, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { boardPosition: 'asc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { data: records.map((r) => this.toDomain(r)), total };
  }

  private toDomain(record: any): Task {
    return Task.fromPersistence({
      id: record.id,
      tenantId: record.tenantId ?? '',
      workspaceId: record.workspaceId ?? '',
      projectId: record.projectId ?? '',
      key: record.key ?? '',
      sprintId: record.sprintId,
      parentTaskId: record.parentTaskId,
      title: record.title ?? '',
      description: record.description,
      type: (record.type as TaskType) ?? TaskType.TASK,
      creatorId: record.creatorId ?? '',
      reporterId: record.reporterId,
      assigneeId: record.assigneeId,
      status: (record.status as TaskStatus) ?? TaskStatus.BACKLOG,
      priority: (record.priority as TaskPriority) ?? TaskPriority.MEDIUM,
      resolution: record.resolution,
      labels: record.labels ?? [],
      storyPoints: record.storyPoints ?? null,
      originalEstimate: record.originalEstimate,
      remainingEstimate: record.remainingEstimate,
      timeSpent: record.timeSpent ?? 0,
      boardPosition: record.boardPosition ?? 0,
      startDate: record.startDate,
      dueDate: record.dueDate,
      environment: record.environment,
      fixVersionId: record.fixVersionId,
      version: record.version,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    });
  }
}
