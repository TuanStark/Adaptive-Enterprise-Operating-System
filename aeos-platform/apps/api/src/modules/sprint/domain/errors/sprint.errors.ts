import { DomainError } from '@aeos/errors';

export class SprintNotFoundError extends DomainError {
  constructor(id: string) {
    super('SPRINT_NOT_FOUND', `Sprint "${id}" not found.`, 404);
  }
}

export class SprintNameRequiredError extends DomainError {
  constructor() {
    super('SPRINT_NAME_REQUIRED', 'Sprint name is required.', 400);
  }
}

export class InvalidSprintStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(
      'INVALID_SPRINT_STATUS_TRANSITION',
      `Cannot transition sprint from ${from} to ${to}.`,
      400,
    );
  }
}

export class SprintAlreadyActiveError extends DomainError {
  constructor() {
    super('SPRINT_ALREADY_ACTIVE', 'There is already an active sprint in this project.', 409);
  }
}
