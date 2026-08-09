import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import {
  ApprovalRepository,
  APPROVAL_REPOSITORY,
} from '../../../domain/repositories/approval.repository';

export class ProcessApprovalCommand {
  constructor(
    public readonly approvalId: string,
    public readonly reviewerId: string,
    public readonly action: 'APPROVE' | 'REJECT',
    public readonly comment?: string,
  ) {}
}

export class ProcessApprovalHandler {
  constructor(
    @Inject(APPROVAL_REPOSITORY)
    private readonly approvalRepository: ApprovalRepository,
  ) {}

  async execute(command: ProcessApprovalCommand): Promise<Result<void, DomainError>> {
    const approval = await this.approvalRepository.findById(command.approvalId);
    if (!approval) return Result.fail(new NotFoundError('ApprovalRequest', command.approvalId));

    if (command.action === 'APPROVE') {
      const result = approval.approveStep(command.reviewerId, command.comment);
      if (result.isFail) return Result.fail(result.error);
    } else {
      const result = approval.rejectStep(command.reviewerId, command.comment);
      if (result.isFail) return Result.fail(result.error);
    }

    await this.approvalRepository.save(approval);
    return Result.ok(undefined);
  }
}
