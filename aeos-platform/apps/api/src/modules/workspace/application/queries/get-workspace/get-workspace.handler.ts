import { Injectable, Inject } from '@nestjs/common';
import { Result, NotFoundError } from '@aeos/errors';
import { GetWorkspaceQuery } from './get-workspace.query';
import {
  WORKSPACE_REPOSITORY,
  WorkspaceRepository,
} from '../../../domain/repositories/workspace.repository';

export interface WorkspaceResponseDto {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  status: string;
}

@Injectable()
export class GetWorkspaceHandler {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async execute(query: GetWorkspaceQuery): Promise<Result<WorkspaceResponseDto, NotFoundError>> {
    const workspace = await this.workspaceRepository.findById(query.workspaceId);

    if (!workspace || workspace.deletedAt) {
      return Result.fail(new NotFoundError('Workspace', query.workspaceId));
    }

    return Result.ok({
      id: workspace.id,
      name: workspace.name ?? 'Unknown Workspace',
      description: workspace.description,
      organizationId: workspace.organizationId,
      status: workspace.status,
    });
  }
}
