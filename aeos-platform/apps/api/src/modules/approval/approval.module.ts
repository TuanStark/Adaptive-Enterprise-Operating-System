import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventsModule } from '../../common/events/events.module';
import { PrismaService } from '@aeos/database';
import { APPROVAL_REPOSITORY } from './domain/repositories/approval.repository';
import { PrismaApprovalRepository } from './infrastructure/persistence/prisma-approval.repository';
import { CreateApprovalHandler } from './application/commands/create-approval/create-approval.handler';
import { ProcessApprovalHandler } from './application/commands/process-approval/process-approval.handler';
import { ApprovalController } from './presentation/controllers/approval.controller';
import { GetApprovalAnalyticsInternalHandler } from './application/queries/get-approval-analytics-internal/get-approval-analytics-internal.handler';

@Module({
  imports: [CqrsModule, EventsModule],
  controllers: [ApprovalController],
  providers: [
    PrismaService,
    { provide: APPROVAL_REPOSITORY, useClass: PrismaApprovalRepository },
    CreateApprovalHandler,
    ProcessApprovalHandler,
    GetApprovalAnalyticsInternalHandler,
  ],
  exports: [APPROVAL_REPOSITORY],
})
export class ApprovalModule {}
