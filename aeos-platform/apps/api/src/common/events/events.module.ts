import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from '@aeos/database';
import { OutboxService } from './outbox.service';
import { OutboxProcessor } from './outbox.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CqrsModule,
  ],
  providers: [
    PrismaService,
    OutboxService,
    OutboxProcessor,
  ],
  exports: [OutboxService],
})
export class EventsModule {}
