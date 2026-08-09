import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import {
  WorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../../../domain/repositories/workspace.repository';
import { InviteMemberCommand } from './invite-member.command';

export class InviteMemberHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute(command: InviteMemberCommand): Promise<Result<void, DomainError>> {
    const workspace = await this.workspaceRepository.findById(command.workspaceId);
    if (!workspace) {
      return Result.fail({
        code: 'WORKSPACE_NOT_FOUND',
        message: 'Workspace not found',
        httpStatus: 404,
        toJSON: () => ({ code: 'WORKSPACE_NOT_FOUND', message: 'Workspace not found' }),
      });
    }

    if (workspace.tenantId !== command.tenantId) {
      return Result.fail({
        code: 'WORKSPACE_NOT_BELONG_TO_TENANT',
        message: 'Workspace does not belong to this tenant',
        httpStatus: 403,
        toJSON: () => ({
          code: 'WORKSPACE_NOT_BELONG_TO_TENANT',
          message: 'Workspace does not belong to this tenant',
        }),
      });
    }

    const result = workspace.inviteMember(command.email, command.inviterId);
    if (result.isFail) {
      return Result.fail({
        code: 'INVITE_MEMBER_FAILED',
        message: result.error.message,
        httpStatus: 400,
        toJSON: () => ({ code: 'INVITE_MEMBER_FAILED', message: result.error.message }),
      });
    }

    await this.workspaceRepository.save(workspace);
    return Result.ok(undefined);
  }
}
