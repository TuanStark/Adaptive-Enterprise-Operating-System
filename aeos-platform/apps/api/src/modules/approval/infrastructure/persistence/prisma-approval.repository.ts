import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { ApprovalRepository } from '../../domain/repositories/approval.repository';
import { ApprovalRequest } from '../../domain/aggregates/approval-request.aggregate';
import { ApprovalStep } from '../../domain/entities/approval-step.entity';
import { OutboxService } from '../../../../common/events/outbox.service';

@Injectable()
export class PrismaApprovalRepository implements ApprovalRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async save(approval: ApprovalRequest): Promise<void> {
    const domainEvents = approval.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.approvalRequest.upsert({
        where: { id: approval.id },
        create: {
          id: approval.id,
          tenantId: approval.tenantId,
          workspaceId: approval.workspaceId,
          requesterId: approval.requesterId,
          title: approval.title,
          status: approval.status,
          entityType: approval.entityType,
          entityId: approval.entityId,
          metadata: (approval.metadata as any) ?? undefined,
        },
        update: {
          status: approval.status,
        },
      });

      for (const step of approval.steps) {
        await tx.approvalStep.upsert({
          where: { id: step.id },
          create: {
            id: step.id,
            approvalRequestId: approval.id,
            reviewerId: step.reviewerId,
            status: step.status,
            comment: step.comment,
            stepOrder: step.stepOrder,
            actedAt: step.actedAt,
          },
          update: {
            status: step.status,
            comment: step.comment,
            actedAt: step.actedAt,
          },
        });
      }

      for (const event of domainEvents) {
        await this.outboxService.saveEvent(tx, {
          tenantId: approval.tenantId,
          aggregateType: 'ApprovalRequest',
          aggregateId: approval.id,
          eventType: event.constructor.name,
          payload: typeof (event as any).toPayload === 'function' ? (event as any).toPayload() : {},
        });
      }
    });
  }

  async findById(id: string): Promise<ApprovalRequest | null> {
    const record = await this.prisma.approvalRequest.findUnique({
      where: { id },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByWorkspaceId(
    workspaceId: string,
    page: number,
    limit: number,
  ): Promise<{ data: ApprovalRequest[]; total: number }> {
    const [records, total] = await this.prisma.$transaction([
      this.prisma.approvalRequest.findMany({
        where: { workspaceId },
        include: { steps: { orderBy: { stepOrder: 'asc' } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.approvalRequest.count({ where: { workspaceId } }),
    ]);

    return { data: records.map(this.toDomain), total };
  }

  private toDomain(record: any): ApprovalRequest {
    const steps = (record.steps ?? []).map((s: any) =>
      ApprovalStep.fromPersistence({
        id: s.id,
        approvalRequestId: s.approvalRequestId ?? '',
        reviewerId: s.reviewerId ?? '',
        status: s.status ?? 'PENDING',
        comment: s.comment,
        stepOrder: s.stepOrder ?? 1,
        actedAt: s.actedAt,
        createdAt: s.createdAt,
      }),
    );

    return ApprovalRequest.fromPersistence({
      id: record.id,
      tenantId: record.tenantId ?? '',
      workspaceId: record.workspaceId ?? '',
      requesterId: record.requesterId ?? '',
      title: record.title ?? '',
      status: record.status ?? 'PENDING',
      entityType: record.entityType ?? '',
      entityId: record.entityId ?? '',
      metadata: record.metadata,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      steps,
    });
  }
}
