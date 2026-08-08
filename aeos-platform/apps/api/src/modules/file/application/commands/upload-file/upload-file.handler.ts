import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { UploadFileCommand } from './upload-file.command';
import { FileRepository, FILE_REPOSITORY } from '../../../domain/repositories/file.repository';
import { StoragePort, STORAGE_PORT } from '../../ports/storage.port';
import { File } from '../../../domain/aggregates/file.aggregate';

export class UploadFileHandler {
  constructor(
    @Inject(FILE_REPOSITORY) private readonly fileRepo: FileRepository,
    @Inject(STORAGE_PORT) private readonly storagePort: StoragePort,
  ) {}

  async execute(command: UploadFileCommand): Promise<Result<string, DomainError>> {
    const uploadResult = await this.storagePort.uploadFile(command.buffer, command.fileName, command.mimeType);

    const fileOrError = File.create(
      command.tenantId,
      uploadResult.provider,
      uploadResult.storageKey,
      command.fileName,
      command.mimeType,
      command.size,
      command.uploadedBy,
    );

    if (fileOrError.isFail) return Result.fail(fileOrError.error as DomainError);

    const file = fileOrError.value;
    await this.fileRepo.save(file);

    return Result.ok(file.id);
  }
}
