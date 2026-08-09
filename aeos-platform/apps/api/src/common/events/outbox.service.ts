import { Injectable } from '@nestjs/common';
import { PrismaService } from '@aeos/database';

export interface OutboxEventInput {
  tenantId: string;
  aggregateType: string;
  aggregateId: string;
  eventType: string;
  payload: any;
}

@Injectable()
export class OutboxService {
  constructor(private readonly prisma: PrismaService) {}

  async saveEvent(tx: any, event: OutboxEventInput): Promise<void> {
    await tx.outboxEvent.create({
      data: {
        tenantId: event.tenantId,
        aggregateType: event.aggregateType,
        aggregateId: event.aggregateId,
        eventType: event.eventType,
        payload: event.payload,
        status: 'PENDING',
      },
    });
  }
}
