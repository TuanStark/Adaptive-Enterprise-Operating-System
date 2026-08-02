import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { WorkspaceRepository, WORKSPACE_REPOSITORY } from '../../../domain/repositories/workspace.repository';
import { ArchiveWorkspaceCommand } from './archive-workspace.command';

export class ArchiveWorkspaceHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly wsRepository: WorkspaceRepository,
  ) {}

  async execute(command: ArchiveWorkspaceCommand): Promise<Result<void, DomainError>> {
    const ws = await this.wsRepository.findById(command.workspaceId);
    if (!ws) {
      return Result.fail(new NotFoundError('Workspace', command.workspaceId));
    }

    const archiveResult = ws.archive();
    if (archiveResult.isFail) {
      return Result.fail(archiveResult.error);
    }

    await this.wsRepository.save(ws);
    return Result.ok(undefined);
  }
}
