import { Inject } from '@nestjs/common';
import { Result, DomainError } from '@aeos/errors';
import { ConfirmUploadCommand } from './confirm-upload.command';
import { FileRepository, FILE_REPOSITORY } from '../../../domain/repositories/file.repository';
import { File } from '../../../domain/aggregates/file.aggregate';

export class ConfirmUploadHandler {
  constructor(
    @Inject(FILE_REPOSITORY) private readonly fileRepo: FileRepository,
  ) {}

  async execute(command: ConfirmUploadCommand): Promise<Result<string, DomainError>> {
    const fileOrError = File.create(
      command.tenantId,
      command.provider,
      command.storageKey,
      command.fileName,
      command.mimeType,
      command.size,
      command.userId,
    );

    if (fileOrError.isFail) return Result.fail(fileOrError.error as DomainError);

    const file = fileOrError.value;
    await this.fileRepo.save(file);

    return Result.ok(file.id);
  }
}
