import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { Document } from '../../../domain/aggregates/document.aggregate';
import {
  DocumentRepository,
  DOCUMENT_REPOSITORY,
} from '../../../domain/repositories/document.repository';
import { CreateDocumentCommand } from './create-document.command';

export class CreateDocumentHandler {
  constructor(
    @Inject(DOCUMENT_REPOSITORY)
    private readonly documentRepository: DocumentRepository,
  ) {}

  async execute(command: CreateDocumentCommand): Promise<Result<string, DomainError>> {
    const createResult = Document.create(
      command.tenantId,
      command.workspaceId,
      command.name,
      command.ownerId,
      command.visibility,
    );
    if (createResult.isFail) return Result.fail(createResult.error);

    const document = createResult.value;
    await this.documentRepository.save(document);
    return Result.ok(document.id);
  }
}
