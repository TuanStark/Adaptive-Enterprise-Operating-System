import { DomainEvent } from '@aeos/shared-kernel';
export class CommentCreatedEvent extends DomainEvent {
  constructor(public readonly commentId: string, public readonly workspaceId: string) { super(commentId); }
  toPayload(): Record<string, unknown> { return { commentId: this.commentId, workspaceId: this.workspaceId }; }
}
export class CommentDeletedEvent extends DomainEvent {
  constructor(public readonly commentId: string, public readonly workspaceId: string) { super(commentId); }
  toPayload(): Record<string, unknown> { return { commentId: this.commentId, workspaceId: this.workspaceId }; }
}
