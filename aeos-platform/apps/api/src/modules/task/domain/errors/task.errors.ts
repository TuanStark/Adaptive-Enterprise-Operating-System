import { DomainError } from '@aeos/errors';

export class TaskNotFoundError extends DomainError {
  constructor(id: string) {
    super('TASK_NOT_FOUND', `Task "${id}" not found.`, 404);
  }
}

export class TaskTitleRequiredError extends DomainError {
  constructor() {
    super('TASK_TITLE_REQUIRED', 'Task title is required.', 400);
  }
}

export class InvalidTaskStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super('INVALID_TASK_STATUS_TRANSITION', `Cannot transition task from ${from} to ${to}.`, 400);
  }
}

export class TaskAlreadyCancelledError extends DomainError {
  constructor() {
    super('TASK_ALREADY_CANCELLED', 'This task has been cancelled and cannot be modified.', 400);
  }
}

export class TaskAlreadyDoneError extends DomainError {
  constructor() {
    super('TASK_ALREADY_DONE', 'This task is already done. Reopen it first.', 400);
  }
}
