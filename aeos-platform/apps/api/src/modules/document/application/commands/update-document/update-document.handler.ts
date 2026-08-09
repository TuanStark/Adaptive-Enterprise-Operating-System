import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { DocumentRepository, DOCUMENT_REPOSITORY } from '../../../domain/repositories/document.repository';
import { UpdateDocumentCommand } from './update-document.command';

export class UpdateDocumentHandler {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
  ) { }

  async execute(command: UpdateDocumentCommand): Promise<Result<void, DomainError>> {
    const document = await this.documentRepository.findById(command.documentId);
    if (!document) return Result.fail(new NotFoundError('Document', command.documentId));

    if (command.name) {
      const renameResult = document.rename(command.name);
      if (renameResult.isFail) return Result.fail(renameResult.error);
    }

    if (command.visibility) {
      document.changeVisibility(command.visibility);
    }

    await this.documentRepository.save(document);
    return Result.ok(undefined);
  }
}
