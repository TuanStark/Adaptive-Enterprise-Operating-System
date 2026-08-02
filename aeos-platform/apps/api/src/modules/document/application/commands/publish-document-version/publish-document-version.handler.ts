import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { DocumentRepository, DOCUMENT_REPOSITORY } from '../../../domain/repositories/document.repository';

export class PublishDocumentVersionCommand {
  constructor(
    public readonly documentId: string,
    public readonly fileId: string,
  ) {}
}

export class PublishDocumentVersionHandler {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(command: PublishDocumentVersionCommand): Promise<Result<void, DomainError>> {
    const document = await this.documentRepository.findById(command.documentId);
    if (!document) return Result.fail(new NotFoundError('Document', command.documentId));

    document.addVersion(command.fileId);

    await this.documentRepository.save(document);
    return Result.ok(undefined);
  }
}
