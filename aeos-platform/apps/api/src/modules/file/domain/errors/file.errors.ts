import { DomainError } from '@aeos/errors';

export class FileCreationError extends DomainError {
  constructor(message: string) {
    super('FILE_CREATION_FAILED', message, 400);
  }
}
