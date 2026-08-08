import { Inject } from '@nestjs/common';
import { Result, DomainError, NotFoundError } from '@aeos/errors';
import { GetFileUrlQuery } from './get-file-url.query';
import { FileRepository, FILE_REPOSITORY } from '../../../domain/repositories/file.repository';
import { StoragePort, STORAGE_PORT } from '../../ports/storage.port';

export class GetFileUrlHandler {
  constructor(
    @Inject(FILE_REPOSITORY) private readonly fileRepo: FileRepository,
    @Inject(STORAGE_PORT) private readonly storagePort: StoragePort,
  ) {}

  async execute(query: GetFileUrlQuery): Promise<Result<string, DomainError>> {
    const file = await this.fileRepo.findById(query.fileId);
    if (!file) {
      return Result.fail(new NotFoundError('File', query.fileId));
    }

    const url = await this.storagePort.getFileUrl(file.storageKey);
    return Result.ok(url);
  }
}
