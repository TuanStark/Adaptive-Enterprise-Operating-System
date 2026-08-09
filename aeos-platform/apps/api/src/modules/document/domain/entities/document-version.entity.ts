import { Entity } from '@aeos/shared-kernel';
import { generateId } from '@aeos/common';

export interface DocumentVersionProps {
  id: string;
  documentId: string;
  versionNumber: number;
  fileId: string;
  createdAt: Date;
}

export class DocumentVersion extends Entity<string> {
  private _documentId: string;
  private _versionNumber: number;
  private _fileId: string;

  private constructor(props: DocumentVersionProps) {
    super(props.id, props.createdAt);
    this._documentId = props.documentId;
    this._versionNumber = props.versionNumber;
    this._fileId = props.fileId;
  }

  get documentId(): string {
    return this._documentId;
  }
  get versionNumber(): number {
    return this._versionNumber;
  }
  get fileId(): string {
    return this._fileId;
  }

  static create(documentId: string, versionNumber: number, fileId: string): DocumentVersion {
    return new DocumentVersion({
      id: generateId(),
      documentId,
      versionNumber,
      fileId,
      createdAt: new Date(),
    });
  }

  static fromPersistence(props: DocumentVersionProps): DocumentVersion {
    return new DocumentVersion(props);
  }
}
