import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import {
  WorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../../../domain/repositories/workspace.repository';
import { RemoveWorkspaceMemberCommand } from './remove-workspace-member.command';

export class RemoveWorkspaceMemberHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute(command: RemoveWorkspaceMemberCommand): Promise<Result<void, DomainError>> {
    const workspace = await this.workspaceRepository.findById(command.workspaceId);
    if (!workspace) {
      return Result.fail(new NotFoundError('Workspace', command.workspaceId));
    }

    // Additional check: requester must be owner or admin. For now, we assume owner or basic permission check.
    // Assuming simple owner logic for demonstration
    if (workspace.ownerId !== command.requesterUserId) {
      return Result.fail({
        code: 'FORBIDDEN',
        message: 'Only workspace owner can remove members',
        httpStatus: 403,
        toJSON: () => ({ code: 'FORBIDDEN', message: 'Only workspace owner can remove members' }),
      });
    }

    const removeResult = workspace.removeMember(command.memberUserId);
    if (removeResult.isFail) {
      return Result.fail(removeResult.error);
    }

    await this.workspaceRepository.save(workspace);
    return Result.ok(undefined);
  }
}
