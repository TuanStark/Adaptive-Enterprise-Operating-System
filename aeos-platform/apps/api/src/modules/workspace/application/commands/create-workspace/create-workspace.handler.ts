import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { Workspace } from '../../../domain/aggregates/workspace.aggregate';
import { WorkspaceRepository, WORKSPACE_REPOSITORY } from '../../../domain/repositories/workspace.repository';
import { CreateWorkspaceCommand } from './create-workspace.command';
import { WorkspaceResponseDto } from '../../dto/workspace-response.dto';
import { WorkspaceMapper } from '../../mappers/workspace.mapper';

export class CreateWorkspaceHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly wsRepository: WorkspaceRepository,
  ) {}

  async execute(command: CreateWorkspaceCommand): Promise<Result<WorkspaceResponseDto, DomainError>> {
    const createResult = Workspace.create(
      command.tenantId,
      command.organizationId,
      command.name,
      command.description,
      command.ownerId,
    );
    if (createResult.isFail) {
      return Result.fail(createResult.error);
    }

    const ws = createResult.value;
    await this.wsRepository.save(ws);

    return Result.ok(WorkspaceMapper.toDto(ws));
  }
}
