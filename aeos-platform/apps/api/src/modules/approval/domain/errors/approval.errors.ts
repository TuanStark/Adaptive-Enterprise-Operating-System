import { DomainError } from '@aeos/errors';

export class ApprovalNotFoundError extends DomainError {
  constructor(id: string) {
    super('APPROVAL_NOT_FOUND', `Approval request "${id}" not found.`, 404);
  }
}

export class ApprovalAlreadyCompletedError extends DomainError {
  constructor() {
    super('APPROVAL_ALREADY_COMPLETED', 'Approval request is already completed or rejected.', 400);
  }
}
