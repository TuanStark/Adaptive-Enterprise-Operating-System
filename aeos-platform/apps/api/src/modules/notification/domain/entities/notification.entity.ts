import { Entity } from '@aeos/shared-kernel';
import { generateId } from '@aeos/common';

export interface NotificationProps {
  id: string;
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  content: string | null;
  read: boolean;
  metadata: Record<string, any> | null;
  createdAt: Date;
}

export class Notification extends Entity<string> {
  private _tenantId: string;
  private _userId: string;
  private _type: string;
  private _title: string;
  private _content: string | null;
  private _read: boolean;
  private _metadata: Record<string, any> | null;

  private constructor(props: NotificationProps) {
    super(props.id, props.createdAt);
    this._tenantId = props.tenantId;
    this._userId = props.userId;
    this._type = props.type;
    this._title = props.title;
    this._content = props.content;
    this._read = props.read;
    this._metadata = props.metadata;
  }

  get tenantId(): string {
    return this._tenantId;
  }
  get userId(): string {
    return this._userId;
  }
  get type(): string {
    return this._type;
  }
  get title(): string {
    return this._title;
  }
  get content(): string | null {
    return this._content;
  }
  get read(): boolean {
    return this._read;
  }
  get metadata(): Record<string, any> | null {
    return this._metadata;
  }

  static create(
    tenantId: string,
    userId: string,
    type: string,
    title: string,
    content: string | null = null,
    metadata: Record<string, any> | null = null,
  ): Notification {
    return new Notification({
      id: generateId(),
      tenantId,
      userId,
      type,
      title,
      content,
      read: false,
      metadata,
      createdAt: new Date(),
    });
  }

  static fromPersistence(props: NotificationProps): Notification {
    return new Notification(props);
  }

  markAsRead(): void {
    this._read = true;
  }
}
