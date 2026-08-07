import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { FormRepository } from '../../domain/repositories/form.repository';
import { DynamicForm } from '../../domain/aggregates/dynamic-form.aggregate';
import { FormSubmission } from '../../domain/entities/form-submission.entity';
import { OutboxService } from '../../../../common/events/outbox.service';

@Injectable()
export class PrismaFormRepository implements FormRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outboxService: OutboxService,
  ) {}

  async save(form: DynamicForm): Promise<void> {
    const domainEvents = form.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.dynamicForm.upsert({
        where: { id: form.id },
        create: {
          id: form.id,
          tenantId: form.tenantId,
          workspaceId: form.workspaceId,
          name: form.name,
          description: form.description,
          schema: form.schema as any,
          isActive: form.isActive,
        },
        update: {
          name: form.name,
          description: form.description,
          schema: form.schema as any,
          isActive: form.isActive,
        },
      });

      // Simple implementation: insert new submissions
      // In real scenario, we might need a way to track which submissions are new
      // For now, we just bulk create missing ones.
      const existing = await tx.formSubmission.findMany({ where: { formId: form.id } });
      const newSubmissions = form.submissions.filter(s => !existing.find(e => e.id === s.id));
      
      if (newSubmissions.length > 0) {
        await tx.formSubmission.createMany({
          data: newSubmissions.map(s => ({
            id: s.id,
            formId: form.id,
            submitterId: s.submitterId,
            data: s.data as any,
            createdAt: s.createdAt,
          })),
        });
      }

      for (const event of domainEvents) {
        await this.outboxService.saveEvent(tx, {
          tenantId: form.tenantId,
          aggregateType: 'DynamicForm',
          aggregateId: form.id,
          eventType: event.constructor.name,
          payload: typeof (event as any).toPayload === 'function' ? (event as any).toPayload() : {},
        });
      }
    });
  }

  async findById(id: string): Promise<DynamicForm | null> {
    const record = await this.prisma.dynamicForm.findUnique({
      where: { id },
      include: { submissions: true },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByWorkspaceId(workspaceId: string, page: number, limit: number): Promise<{ data: DynamicForm[]; total: number }> {
    const [records, total] = await this.prisma.$transaction([
      this.prisma.dynamicForm.findMany({
        where: { workspaceId },
        include: { submissions: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.dynamicForm.count({ where: { workspaceId } }),
    ]);

    return { data: records.map(this.toDomain), total };
  }

  private toDomain(record: any): DynamicForm {
    const submissions = (record.submissions ?? []).map((s: any) =>
      FormSubmission.fromPersistence({
        id: s.id,
        formId: s.formId ?? '',
        submitterId: s.submitterId ?? '',
        data: s.data ?? {},
        createdAt: s.createdAt,
      }),
    );

    return DynamicForm.fromPersistence({
      id: record.id,
      tenantId: record.tenantId ?? '',
      workspaceId: record.workspaceId ?? '',
      name: record.name ?? '',
      description: record.description,
      schema: record.schema ?? {},
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      submissions,
    });
  }
}
