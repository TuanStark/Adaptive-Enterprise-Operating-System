import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { UpdateWorkspaceMemberProfileCommand } from './update-workspace-member-profile.command';
import {
  WorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../../../domain/repositories/workspace.repository';
import {
  WorkspaceNotFoundError,
  WorkspaceMemberNotFoundError,
} from '../../../domain/errors/workspace.errors';

@CommandHandler(UpdateWorkspaceMemberProfileCommand)
export class UpdateWorkspaceMemberProfileHandler implements ICommandHandler<UpdateWorkspaceMemberProfileCommand> {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute(command: UpdateWorkspaceMemberProfileCommand): Promise<Result<void, DomainError>> {
    const workspace = await this.workspaceRepository.findById(command.workspaceId);
    if (!workspace) {
      return Result.fail(new WorkspaceNotFoundError(command.workspaceId));
    }

    const updateResult = workspace.updateMemberProfile(
      command.userId,
      command.nickname,
      command.avatarUrl,
      command.title,
      command.department,
      command.statusMessage,
    );

    if (updateResult.isFail) {
      return Result.fail(updateResult.error);
    }

    await this.workspaceRepository.save(workspace);

    return Result.ok(undefined);
  }
}
