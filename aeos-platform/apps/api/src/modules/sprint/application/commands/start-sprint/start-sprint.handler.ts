import { Inject, Injectable } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { SprintRepository, SPRINT_REPOSITORY } from '../../../domain/repositories/sprint.repository';
import { SprintAlreadyActiveError } from '../../../domain/errors/sprint.errors';

export class StartSprintCommand {
  constructor(public readonly sprintId: string) {}
}

@Injectable()
export class StartSprintHandler {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: SprintRepository,
  ) {}

  async execute(command: StartSprintCommand): Promise<Result<void, DomainError>> {
    const sprint = await this.sprintRepository.findById(command.sprintId);
    if (!sprint) return Result.fail(new NotFoundError('Sprint', command.sprintId));

    const activeSprint = await this.sprintRepository.findActiveByProjectId(sprint.projectId);
    if (activeSprint && activeSprint.id !== sprint.id) {
      return Result.fail(new SprintAlreadyActiveError());
    }

    const startResult = sprint.start();
    if (startResult.isFail) return Result.fail(startResult.error);

    await this.sprintRepository.save(sprint);
    return Result.ok(undefined);
  }
}
