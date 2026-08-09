import { AggregateRoot } from '@aeos/shared-kernel';
import { Result, DomainError } from '@aeos/errors';
import { generateId } from '@aeos/common';
import { FileCreationError } from '../errors/file.errors';

export interface FileProps {
  id: string;
  tenantId: string;
  storageProvider: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: Date;
}

export class File extends AggregateRoot<string> {
  private constructor(
    id: string,
    public readonly tenantId: string,
    public readonly storageProvider: string,
    public readonly storageKey: string,
    public readonly fileName: string,
    public readonly mimeType: string,
    public readonly size: number,
    public readonly uploadedBy: string,
    createdAt?: Date,
  ) {
    super(id, 0, createdAt);
  }

  static create(
    tenantId: string,
    storageProvider: string,
    storageKey: string,
    fileName: string,
    mimeType: string,
    size: number,
    uploadedBy: string,
  ): Result<File, DomainError> {
    if (!fileName) return Result.fail(new FileCreationError('File name is required'));
    const file = new File(
      generateId(),
      tenantId,
      storageProvider,
      storageKey,
      fileName,
      mimeType,
      size,
      uploadedBy,
    );
    return Result.ok(file);
  }

  static fromPersistence(props: FileProps): File {
    return new File(
      props.id,
      props.tenantId,
      props.storageProvider,
      props.storageKey,
      props.fileName,
      props.mimeType,
      props.size,
      props.uploadedBy,
      props.createdAt,
    );
  }
}
