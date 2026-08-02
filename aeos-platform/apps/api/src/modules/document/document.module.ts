import { Module } from '@nestjs/common';
import { PrismaService } from '@aeos/database';
import { DOCUMENT_REPOSITORY } from './domain/repositories/document.repository';
import { PrismaDocumentRepository } from './infrastructure/persistence/prisma-document.repository';
import { CreateDocumentHandler } from './application/commands/create-document/create-document.handler';
import { UpdateDocumentHandler } from './application/commands/update-document/update-document.handler';
import { PublishDocumentVersionHandler } from './application/commands/publish-document-version/publish-document-version.handler';
import { DocumentController } from './presentation/controllers/document.controller';

@Module({
  controllers: [DocumentController],
  providers: [
    PrismaService,
    { provide: DOCUMENT_REPOSITORY, useClass: PrismaDocumentRepository },
    CreateDocumentHandler,
    UpdateDocumentHandler,
    PublishDocumentVersionHandler,
  ],
  exports: [DOCUMENT_REPOSITORY],
})
export class DocumentModule {}
