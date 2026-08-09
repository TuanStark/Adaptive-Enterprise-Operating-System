import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result, DomainError } from '@aeos/errors';
import { GetFilesDetailsQuery } from './get-files-details.query';
import { FileRepository, FILE_REPOSITORY } from '../../../domain/repositories/file.repository';
import { StoragePort, STORAGE_PORT } from '../../ports/storage.port';

export interface FileDetailDto {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
}

@QueryHandler(GetFilesDetailsQuery)
export class GetFilesDetailsHandler implements IQueryHandler<GetFilesDetailsQuery> {
  constructor(
    @Inject(FILE_REPOSITORY) private readonly fileRepo: FileRepository,
    @Inject(STORAGE_PORT) private readonly storagePort: StoragePort,
  ) {}

  async execute(query: GetFilesDetailsQuery): Promise<Result<FileDetailDto[], DomainError>> {
    if (!query.fileIds || query.fileIds.length === 0) {
      return Result.ok([]);
    }

    const files = await this.fileRepo.findByIds(query.fileIds);

    const details = await Promise.all(
      files.map(async (file) => {
        const url = await this.storagePort.getFileUrl(file.storageKey, file.mimeType);
        return {
          id: file.id,
          url,
          name: file.fileName,
          type: file.mimeType,
          size: file.size,
        };
      }),
    );

    return Result.ok(details);
  }
}
