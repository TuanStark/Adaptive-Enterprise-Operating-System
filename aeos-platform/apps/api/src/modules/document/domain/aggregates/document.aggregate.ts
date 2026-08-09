import { AggregateRoot } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';
import { generateId } from '@aeos/common';
import { DocumentNameRequiredError } from '../errors/document.errors';
import { DocumentVersion } from '../entities/document-version.entity';
import { DocumentCreatedEvent, DocumentDeletedEvent } from '../events/document.events';

export interface DocumentProps {
  id: string;
  tenantId: string;
  workspaceId: string;
  name: string;
  ownerId: string;
  visibility: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  versions: DocumentVersion[];
}

export class Document extends AggregateRoot<string> {
  private _tenantId: string;
  private _workspaceId: string;
  private _name: string;
  private _ownerId: string;
  private _visibility: string;
  private _deletedAt: Date | null;
  private _versions: DocumentVersion[];

  private constructor(
    id: string,
    tenantId: string,
    workspaceId: string,
    name: string,
    ownerId: string,
    visibility: string,
    version: number,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date | null,
    versions?: DocumentVersion[],
  ) {
    super(id, version, createdAt, updatedAt);
    this._tenantId = tenantId;
    this._workspaceId = workspaceId;
    this._name = name;
    this._ownerId = ownerId;
    this._visibility = visibility;
    this._deletedAt = deletedAt ?? null;
    this._versions = versions ?? [];
  }

  get tenantId(): string {
    return this._tenantId;
  }
  get workspaceId(): string {
    return this._workspaceId;
  }
  get name(): string {
    return this._name;
  }
  get ownerId(): string {
    return this._ownerId;
  }
  get visibility(): string {
    return this._visibility;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }
  get versions(): ReadonlyArray<DocumentVersion> {
    return this._versions;
  }

  static create(
    tenantId: string,
    workspaceId: string,
    name: string,
    ownerId: string,
    visibility: string = 'PRIVATE',
  ): Result<Document, DocumentNameRequiredError> {
    if (!name || name.trim().length === 0) {
      return Result.fail(new DocumentNameRequiredError());
    }
    const id = generateId();
    const document = new Document(id, tenantId, workspaceId, name.trim(), ownerId, visibility, 0);
    document.addDomainEvent(new DocumentCreatedEvent(document.id, document.workspaceId));
    return Result.ok(document);
  }

  static fromPersistence(props: DocumentProps): Document {
    return new Document(
      props.id,
      props.tenantId,
      props.workspaceId,
      props.name,
      props.ownerId,
      props.visibility,
      props.version,
      props.createdAt,
      props.updatedAt,
      props.deletedAt,
      props.versions,
    );
  }

  rename(newName: string): Result<void, DocumentNameRequiredError> {
    if (!newName || newName.trim().length === 0) {
      return Result.fail(new DocumentNameRequiredError());
    }
    this._name = newName.trim();
    this.touch();
    return Result.ok(undefined);
  }

  addVersion(fileId: string): void {
    const nextVersionNumber = this.version + 1;
    this._versions.push(DocumentVersion.create(this.id, nextVersionNumber, fileId));
    this.touch();
  }

  changeVisibility(visibility: string): void {
    this._visibility = visibility;
    this.touch();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.addDomainEvent(new DocumentDeletedEvent(this.id, this.workspaceId));
    this.touch();
  }
}
