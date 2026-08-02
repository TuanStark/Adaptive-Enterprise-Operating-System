import { DomainError } from '@aeos/errors';

export class ProjectNotFoundError extends DomainError {
  constructor(id: string) {
    super('PROJECT_NOT_FOUND', `Project "${id}" not found.`, 404);
  }
}

export class ProjectNameRequiredError extends DomainError {
  constructor() {
    super('PROJECT_NAME_REQUIRED', 'Project name is required.', 400);
  }
}

export class InvalidProjectStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super('INVALID_PROJECT_STATUS_TRANSITION', `Cannot transition from ${from} to ${to}.`, 400);
  }
}

export class ProjectMemberAlreadyExistsError extends DomainError {
  constructor(userId: string) {
    super('PROJECT_MEMBER_ALREADY_EXISTS', `User "${userId}" is already a project member.`, 409);
  }
}

export class ProjectMemberNotFoundError extends DomainError {
  constructor(userId: string) {
    super('PROJECT_MEMBER_NOT_FOUND', `Member "${userId}" not found in this project.`, 404);
  }
}
