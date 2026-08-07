import { DomainEvent } from '@aeos/shared-kernel';
export class DocumentCreatedEvent extends DomainEvent {
  constructor(public readonly documentId: string, public readonly workspaceId: string) { super(documentId); }
  toPayload(): Record<string, unknown> { return { documentId: this.documentId, workspaceId: this.workspaceId }; }
}
export class DocumentDeletedEvent extends DomainEvent {
  constructor(public readonly documentId: string, public readonly workspaceId: string) { super(documentId); }
  toPayload(): Record<string, unknown> { return { documentId: this.documentId, workspaceId: this.workspaceId }; }
}
