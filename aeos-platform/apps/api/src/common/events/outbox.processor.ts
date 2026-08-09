import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@aeos/database';
import {
  IIntegrationEventBus,
  INTEGRATION_EVENT_BUS,
  IIntegrationEvent,
} from '@aeos/shared-kernel';

// A simple registry to map eventType strings from DB to actual Typescript classes.
export class EventRegistry {
  private static readonly eventMap = new Map<string, any>();

  static register(eventType: string, eventClass: any) {
    this.eventMap.set(eventType, eventClass);
  }

  static createEvent(eventType: string, payload: any): IIntegrationEvent | null {
    const EventClass = this.eventMap.get(eventType);
    if (!EventClass) return null;
    return new EventClass(payload);
  }
}

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(INTEGRATION_EVENT_BUS)
    private readonly integrationEventBus: IIntegrationEventBus,
  ) {}

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
          let integrationEvent = EventRegistry.createEvent(event.eventType ?? '', event.payload);

          if (!integrationEvent) {
            // Fallback for events not registered (or create a generic one if needed)
            this.logger.warn(
              `No registered event class for type ${event.eventType}. Skipping or using fallback.`,
            );
            // You can optionally create a generic integration event here if desired
            const safePayload =
              typeof event.payload === 'object' && event.payload !== null
                ? (event.payload as Record<string, unknown>)
                : {};
            integrationEvent = {
              eventId: event.id,
              occurredOn: event.createdAt,
              ...safePayload,
            } as IIntegrationEvent;
          }

          if (integrationEvent) {
            await this.integrationEventBus.publish(integrationEvent);
          }

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
