import { Entity } from '@aeos/shared-kernel';
import { generateId } from '@aeos/common';

export interface CommentProps {
  id: string;
  tenantId: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export class Comment extends Entity<string> {
  private _tenantId: string;
  private _taskId: string;
  private _userId: string;
  private _content: string;

  private constructor(props: CommentProps) {
    super(props.id, props.createdAt);
    this._tenantId = props.tenantId;
    this._taskId = props.taskId;
    this._userId = props.userId;
    this._content = props.content;
  }

  get tenantId(): string { return this._tenantId; }
  get taskId(): string { return this._taskId; }
  get userId(): string { return this._userId; }
  get content(): string { return this._content; }

  static create(tenantId: string, taskId: string, userId: string, content: string): Comment {
    return new Comment({
      id: generateId(), tenantId, taskId, userId, content, createdAt: new Date(),
    });
  }

  static fromPersistence(props: CommentProps): Comment {
    return new Comment(props);
  }
}
