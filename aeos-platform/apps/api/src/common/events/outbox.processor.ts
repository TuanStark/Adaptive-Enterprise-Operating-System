import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@aeos/database';
import { EventBus } from '@nestjs/cqrs';

export class DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly eventType: string,
    public readonly payload: any,
  ) { }
}

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) { }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async processOutboxEvents() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const pendingEvents = await this.prisma.outboxEvent.findMany({
        where: { status: 'PENDING' },
        take: 50,
        orderBy: { createdAt: 'asc' },
      });

      if (pendingEvents.length === 0) {
        this.isProcessing = false;
        return;
      }

      this.logger.debug(`Processing ${pendingEvents.length} outbox events...`);

      for (const event of pendingEvents) {
        try {
          const domainEvent = new DomainEvent(event.aggregateId ?? '', event.eventType ?? '', event.payload);

          this.eventBus.publish(domainEvent);

          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: { status: 'COMPLETED', processedAt: new Date() },
          });
        } catch (error) {
          this.logger.error(`Failed to process event ${event.id}:`, error);
          await this.prisma.outboxEvent.update({
            where: { id: event.id },
            data: {
              status: 'FAILED',
              retryCount: { increment: 1 },
            },
          });
        }
      }
    } catch (error) {
      this.logger.error('Error during outbox processing:', error);
    } finally {
      this.isProcessing = false;
    }
  }
}
