import { DomainError } from '@aeos/errors';

export class WorkspaceNotFoundError extends DomainError {
  constructor(id: string) {
    super('WORKSPACE_NOT_FOUND', `Workspace "${id}" not found.`, 404);
  }
}

export class WorkspaceNameRequiredError extends DomainError {
  constructor() {
    super('WORKSPACE_NAME_REQUIRED', 'Workspace name is required.', 400);
  }
}

export class WorkspaceAlreadyArchivedError extends DomainError {
  constructor() {
    super('WORKSPACE_ALREADY_ARCHIVED', 'Workspace is already archived.', 409);
  }
}

export class WorkspaceArchivedCannotAddMemberError extends DomainError {
  constructor() {
    super('WORKSPACE_ARCHIVED_CANNOT_ADD_MEMBER', 'Cannot add member to an archived workspace.', 400);
  }
}

export class WorkspaceMemberAlreadyExistsError extends DomainError {
  constructor(userId: string) {
    super('WORKSPACE_MEMBER_ALREADY_EXISTS', `User "${userId}" is already a member of this workspace.`, 409);
  }
}

export class WorkspaceMemberNotFoundError extends DomainError {
  constructor(userId: string) {
    super('WORKSPACE_MEMBER_NOT_FOUND', `Member "${userId}" not found in this workspace.`, 404);
  }
}
