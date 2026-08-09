import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FileController } from './presentation/controllers/file.controller';
import { PrismaFileRepository } from './infrastructure/persistence/prisma-file.repository';
import { CloudinaryService } from './infrastructure/services/cloudinary.service';
import { FILE_REPOSITORY } from './domain/repositories/file.repository';
import { STORAGE_PORT } from './application/ports/storage.port';
import { PrismaService } from '@aeos/database';
import { GetFileUrlHandler } from './application/queries/get-file-url/get-file-url.handler';
import { GenerateSignatureHandler } from './application/queries/generate-signature/generate-signature.handler';
import { ConfirmUploadHandler } from './application/commands/confirm-upload/confirm-upload.handler';
import { GetFilesDetailsHandler } from './application/queries/get-files-details/get-files-details.handler';

const commandHandlers = [ConfirmUploadHandler];
const queryHandlers = [GetFileUrlHandler, GenerateSignatureHandler, GetFilesDetailsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [FileController],
  providers: [
    PrismaService,
    ...commandHandlers,
    ...queryHandlers,
    { provide: FILE_REPOSITORY, useClass: PrismaFileRepository },
    { provide: STORAGE_PORT, useClass: CloudinaryService },
  ],
  exports: [STORAGE_PORT],
})
export class FileModule {}
