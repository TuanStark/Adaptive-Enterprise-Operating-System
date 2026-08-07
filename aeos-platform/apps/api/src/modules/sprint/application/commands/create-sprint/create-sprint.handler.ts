import { Inject, Injectable } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { Sprint } from '../../../domain/aggregates/sprint.aggregate';
import { SprintRepository, SPRINT_REPOSITORY } from '../../../domain/repositories/sprint.repository';
import { CreateSprintCommand } from './create-sprint.command';

@Injectable()
export class CreateSprintHandler {
  constructor(
    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: SprintRepository,
  ) {}

  async execute(command: CreateSprintCommand): Promise<Result<{ id: string; name: string; status: string }, DomainError>> {
    const startDate = command.startDate ? new Date(command.startDate) : null;
    const endDate = command.endDate ? new Date(command.endDate) : null;

    const createResult = Sprint.create(
      command.tenantId, command.projectId, command.name,
      command.goal, startDate, endDate,
    );
    if (createResult.isFail) return Result.fail(createResult.error);

    const sprint = createResult.value;
    await this.sprintRepository.save(sprint);

    return Result.ok({ id: sprint.id, name: sprint.name, status: sprint.status });
  }
}
