import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { APPROVAL_REPOSITORY } from './domain/repositories/approval.repository';
import { PrismaApprovalRepository } from './infrastructure/persistence/prisma-approval.repository';
import { CreateApprovalHandler } from './application/commands/create-approval/create-approval.handler';
import { ProcessApprovalHandler } from './application/commands/process-approval/process-approval.handler';
import { ApprovalController } from './presentation/controllers/approval.controller';

@Module({
  controllers: [ApprovalController],
  providers: [
    PrismaService,
    { provide: APPROVAL_REPOSITORY, useClass: PrismaApprovalRepository },
    CreateApprovalHandler,
    ProcessApprovalHandler,
  ],
  exports: [APPROVAL_REPOSITORY],
})
export class ApprovalModule {}
