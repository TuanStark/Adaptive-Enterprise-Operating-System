import { DomainError } from '@aeos/errors';

export class DocumentNotFoundError extends DomainError {
  constructor(id: string) {
    super('DOCUMENT_NOT_FOUND', `Document "${id}" not found.`, 404);
  }
}

export class DocumentNameRequiredError extends DomainError {
  constructor() {
    super('DOCUMENT_NAME_REQUIRED', 'Document name is required.', 400);
  }
}
