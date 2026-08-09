import { AggregateRoot } from '@aeos/shared-kernel';
import { generateId } from '@aeos/common';
import { CommentCreatedEvent } from '../events/comment.events';

export interface CommentProps {
  id: string;
  tenantId: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export class Comment extends AggregateRoot<string> {
  private _tenantId: string;
  private _taskId: string;
  private _userId: string;
  private _content: string;

  private constructor(props: CommentProps) {
    super(props.id, 1, props.createdAt, props.createdAt);
    this._tenantId = props.tenantId;
    this._taskId = props.taskId;
    this._userId = props.userId;
    this._content = props.content;
  }

  get tenantId(): string {
    return this._tenantId;
  }
  get taskId(): string {
    return this._taskId;
  }
  get userId(): string {
    return this._userId;
  }
  get content(): string {
    return this._content;
  }

  static create(
    tenantId: string,
    taskId: string,
    userId: string,
    content: string,
    workspaceId?: string,
  ): Comment {
    const comment = new Comment({
      id: generateId(),
      tenantId,
      taskId,
      userId,
      content,
      createdAt: new Date(),
    });
    if (workspaceId) {
      comment.addDomainEvent(new CommentCreatedEvent(comment.id, workspaceId));
    }
    return comment;
  }

  static fromPersistence(props: CommentProps): Comment {
    return new Comment(props);
  }
}
