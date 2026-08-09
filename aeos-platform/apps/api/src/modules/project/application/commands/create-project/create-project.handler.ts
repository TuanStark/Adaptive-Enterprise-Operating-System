import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { Project, Priority } from '../../../domain/aggregates/project.aggregate';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from '../../../domain/repositories/project.repository';
import { CreateProjectCommand } from './create-project.command';
import { ProjectResponseDto } from '../../dto/project-response.dto';
import { ProjectMapper } from '../../mappers/project.mapper';

export class CreateProjectHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(command: CreateProjectCommand): Promise<Result<ProjectResponseDto, DomainError>> {
    const priority = (command.priority as Priority) || Priority.MEDIUM;
    const createResult = Project.create(
      command.tenantId,
      command.workspaceId,
      command.name,
      command.description,
      command.ownerId,
      priority,
    );
    if (createResult.isFail) return Result.fail(createResult.error);

    const project = createResult.value;
    await this.projectRepository.save(project);
    return Result.ok(ProjectMapper.toDto(project));
  }
}
