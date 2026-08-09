import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { GetDocumentQuery } from './get-document.query';
import {
  DocumentRepository,
  DOCUMENT_REPOSITORY,
} from '../../../domain/repositories/document.repository';

export interface DocumentDetailDto {
  id: string;
  name: string;
  ownerId: string;
  visibility: string;
  versionCount: number;
  createdAt: Date;
  versions: {
    id: string;
    versionNumber: number;
    fileId: string;
    createdAt: Date;
  }[];
}

@QueryHandler(GetDocumentQuery)
export class GetDocumentHandler implements IQueryHandler<GetDocumentQuery> {
  constructor(@Inject(DOCUMENT_REPOSITORY) private readonly documentRepo: DocumentRepository) {}

  async execute(query: GetDocumentQuery): Promise<Result<DocumentDetailDto, DomainError>> {
    const document = await this.documentRepo.findById(query.documentId);

    if (!document) {
      return Result.fail(new NotFoundError('Document', query.documentId));
    }

    if (document.workspaceId !== query.workspaceId) {
      return Result.fail(new NotFoundError('Document', query.documentId));
    }

    const dto: DocumentDetailDto = {
      id: document.id,
      name: document.name,
      ownerId: document.ownerId,
      visibility: document.visibility,
      versionCount: document.versions.length,
      createdAt: document.createdAt,
      versions: document.versions.map((v) => ({
        id: v.id,
        versionNumber: v.versionNumber,
        fileId: v.fileId,
        createdAt: v.createdAt,
      })),
    };

    return Result.ok(dto);
  }
}
