import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import {
  ProjectRepository,
  PROJECT_REPOSITORY,
} from '../../../domain/repositories/project.repository';
import { ChangeProjectStatusCommand } from './change-project-status.command';

export class ChangeProjectStatusHandler {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(command: ChangeProjectStatusCommand): Promise<Result<void, DomainError>> {
    const project = await this.projectRepository.findById(command.projectId);
    if (!project) return Result.fail(new NotFoundError('Project', command.projectId));

    let result: Result<void, DomainError>;
    switch (command.action) {
      case 'activate':
        result = project.activate();
        break;
      case 'complete':
        result = project.complete();
        break;
      case 'archive':
        result = project.archive();
        break;
    }

    if (result.isFail) return Result.fail(result.error);

    await this.projectRepository.save(project);
    return Result.ok(undefined);
  }
}
