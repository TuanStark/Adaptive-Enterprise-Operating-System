import { DomainError } from '@aeos/errors';

export class FormNotFoundError extends DomainError {
  constructor(id: string) {
    super('FORM_NOT_FOUND', `Form "${id}" not found.`, 404);
  }
}

export class InvalidFormSchemaError extends DomainError {
  constructor() {
    super('INVALID_FORM_SCHEMA', 'The provided form schema is invalid.', 400);
  }
}

export class FormNotActiveError extends DomainError {
  constructor() {
    super('FORM_NOT_ACTIVE', 'Form is not active.', 400);
  }
}
