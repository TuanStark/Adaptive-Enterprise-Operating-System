import { Logger } from '@nestjs/common';
import { IEventHandler } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { IIntegrationEvent } from '@aeos/shared-kernel';

/**
 * Base class for Event Handlers to ensure Exactly-Once processing.
 * Checks the ProcessedMessage table before handling the event.
 */
export abstract class IdempotentEventHandler<
  TEvent extends IIntegrationEvent,
> implements IEventHandler<TEvent> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(protected readonly prisma: PrismaService) {}

  async handle(event: TEvent): Promise<void> {
    const consumerName = this.constructor.name;
    const eventId = event.eventId;

    if (!eventId) {
      this.logger.warn(`Event is missing eventId, processing without idempotency guarantee.`);
      return this.process(event);
    }

    try {
      // 1. Try to record the message as processed.
      // If it fails with UniqueConstraintViolation, it means another instance processed it.
      await this.prisma.processedMessage.create({
        data: {
          eventId: eventId,
          consumer: consumerName,
        },
      });

      this.logger.debug(`Processing event ${eventId} for the first time in ${consumerName}.`);

      // 2. Process the actual business logic
      await this.process(event);
    } catch (error: any) {
      // P2002 is Prisma's Unique Constraint Violation code
      if (error.code === 'P2002') {
        this.logger.log(
          `Idempotency Check: Event ${eventId} was already processed by ${consumerName}. Skipping.`,
        );
        return;
      }

      // If business logic failed, we should theoretically remove the ProcessedMessage
      // so it can be retried, or leave it if we want dead-letter queue behavior.
      // For this demo, we'll delete it to allow retry.
      try {
        await this.prisma.processedMessage.delete({
          where: {
            eventId_consumer: {
              eventId,
              consumer: consumerName,
            },
          },
        });
      } catch (e) {
        this.logger.error(`Failed to remove ProcessedMessage lock for ${eventId}`, e);
      }

      throw error;
    }
  }

  /**
   * The actual business logic to implement in the concrete consumer.
   */
  protected abstract process(event: TEvent): Promise<void>;
}
