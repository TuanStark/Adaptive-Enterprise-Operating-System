import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { ApprovalRequest } from '../../../domain/aggregates/approval-request.aggregate';
import {
  ApprovalRepository,
  APPROVAL_REPOSITORY,
} from '../../../domain/repositories/approval.repository';
import { CreateApprovalCommand } from './create-approval.command';

export class CreateApprovalHandler {
  constructor(
    @Inject(APPROVAL_REPOSITORY)
    private readonly approvalRepository: ApprovalRepository,
  ) {}

  async execute(command: CreateApprovalCommand): Promise<Result<string, DomainError>> {
    const approval = ApprovalRequest.create(
      command.tenantId,
      command.workspaceId,
      command.requesterId,
      command.title,
      command.entityType,
      command.entityId,
      command.reviewerIds,
      command.metadata,
    );

    await this.approvalRepository.save(approval);
    return Result.ok(approval.id);
  }
}
