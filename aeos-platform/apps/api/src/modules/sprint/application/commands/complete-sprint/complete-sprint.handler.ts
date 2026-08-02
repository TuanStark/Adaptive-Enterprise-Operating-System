import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { SprintRepository, SPRINT_REPOSITORY } from '../../../domain/repositories/sprint.repository';

export class CompleteSprintCommand {
  constructor(public readonly sprintId: string) {}
}

export class CompleteSprintHandler {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: SprintRepository,
  ) {}

  async execute(command: CompleteSprintCommand): Promise<Result<void, DomainError>> {
    const sprint = await this.sprintRepository.findById(command.sprintId);
    if (!sprint) return Result.fail(new NotFoundError('Sprint', command.sprintId));

    const completeResult = sprint.complete();
    if (completeResult.isFail) return Result.fail(completeResult.error);

    await this.sprintRepository.save(sprint);
    return Result.ok(undefined);
  }
}
