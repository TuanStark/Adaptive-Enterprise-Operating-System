import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EventsModule } from '../../common/events/events.module';
import { PrismaService } from '@aeos/database';
import { DOCUMENT_REPOSITORY } from './domain/repositories/document.repository';
import { PrismaDocumentRepository } from './infrastructure/persistence/prisma-document.repository';
import { CreateDocumentHandler } from './application/commands/create-document/create-document.handler';
import { UpdateDocumentHandler } from './application/commands/update-document/update-document.handler';
import { PublishDocumentVersionHandler } from './application/commands/publish-document-version/publish-document-version.handler';
import { DocumentController } from './presentation/controllers/document.controller';
import { GetDocumentAnalyticsInternalHandler } from './application/queries/get-document-analytics-internal/get-document-analytics-internal.handler';
import { GetDocumentHandler } from './application/queries/get-document/get-document.handler';

@Module({
  imports: [CqrsModule, EventsModule],
  controllers: [DocumentController],
  providers: [
    PrismaService,
    { provide: DOCUMENT_REPOSITORY, useClass: PrismaDocumentRepository },
    CreateDocumentHandler,
    UpdateDocumentHandler,
    PublishDocumentVersionHandler,
    GetDocumentAnalyticsInternalHandler,
    GetDocumentHandler,
  ],
  exports: [DOCUMENT_REPOSITORY],
})
export class DocumentModule {}
