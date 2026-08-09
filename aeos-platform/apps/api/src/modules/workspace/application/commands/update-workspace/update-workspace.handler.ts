import { Inject } from '@nestjs/common';
import { Result, NotFoundError, DomainError } from '@aeos/errors';
import {
  WorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../../../domain/repositories/workspace.repository';
import { UpdateWorkspaceCommand } from './update-workspace.command';

export class UpdateWorkspaceHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute(command: UpdateWorkspaceCommand): Promise<Result<void, DomainError>> {
    const workspace = await this.workspaceRepository.findById(command.workspaceId);
    if (!workspace) {
      return Result.fail(new NotFoundError('Workspace', command.workspaceId));
    }

    if (command.name !== undefined) {
      const updateResult = workspace.updateDetails(
        command.name,
        command.description !== undefined ? command.description : workspace.description,
      );
      if (updateResult.isFail) return Result.fail(updateResult.error);
    } else if (command.description !== undefined) {
      const updateResult = workspace.updateDetails(workspace.name, command.description);
      if (updateResult.isFail) return Result.fail(updateResult.error);
    }

    // domain is not in the aggregate currently based on earlier implementation, but let's assume it could be or we ignore it for now.
    // If there is a domain in the aggregate we'd update it here. For now we just update details.

    await this.workspaceRepository.save(workspace);
    return Result.ok(undefined);
  }
}
