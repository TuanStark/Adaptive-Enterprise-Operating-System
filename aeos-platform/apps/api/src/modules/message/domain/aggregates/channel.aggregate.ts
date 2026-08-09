import { AggregateRoot } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';
import { generateId } from '@aeos/common';
import { ChannelMember } from '../entities/channel-member.entity';
import {
  ChannelCreatedEvent,
  MemberJoinedChannelEvent,
  MemberLeftChannelEvent,
} from '../events/message.events';
import {
  ChannelNameRequiredError,
  ChannelMemberAlreadyExistsError,
  ChannelMemberNotFoundError,
  ChannelArchivedError,
} from '../errors/message.errors';

export enum ChannelType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  DIRECT = 'DIRECT',
}

export interface ChannelProps {
  id: string;
  tenantId: string;
  workspaceId: string;
  name: string;
  description: string | null;
  type: ChannelType;
  creatorId: string;
  isArchived: boolean;
  topic: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  members: ChannelMember[];
}

export class Channel extends AggregateRoot<string> {
  private _tenantId: string;
  private _workspaceId: string;
  private _name: string;
  private _description: string | null;
  private _type: ChannelType;
  private _creatorId: string;
  private _isArchived: boolean;
  private _topic: string | null;
  private _members: ChannelMember[];

  private constructor(props: ChannelProps) {
    super(props.id, props.version, props.createdAt, props.updatedAt);
    this._tenantId = props.tenantId;
    this._workspaceId = props.workspaceId;
    this._name = props.name;
    this._description = props.description;
    this._type = props.type;
    this._creatorId = props.creatorId;
    this._isArchived = props.isArchived;
    this._topic = props.topic;
    this._members = props.members;
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
  get description(): string | null {
    return this._description;
  }
  get type(): ChannelType {
    return this._type;
  }
  get creatorId(): string {
    return this._creatorId;
  }
  get isArchived(): boolean {
    return this._isArchived;
  }
  get topic(): string | null {
    return this._topic;
  }
  get members(): ReadonlyArray<ChannelMember> {
    return this._members;
  }

  static create(
    tenantId: string,
    workspaceId: string,
    name: string,
    creatorId: string,
    type: ChannelType = ChannelType.PUBLIC,
    description: string | null = null,
  ): Result<Channel, ChannelNameRequiredError> {
    if (!name || name.trim().length === 0) {
      return Result.fail(new ChannelNameRequiredError());
    }

    const id = generateId();
    const channel = new Channel({
      id,
      tenantId,
      workspaceId,
      name: name.trim().toLowerCase().replace(/\s+/g, '-'), // Slack-style: lowercase, hyphens
      description,
      type,
      creatorId,
      isArchived: false,
      topic: null,
      version: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      members: [ChannelMember.create(id, creatorId, 'OWNER')],
    });

    channel.addDomainEvent(new ChannelCreatedEvent(id, workspaceId, name.trim()));
    return Result.ok(channel);
  }

  static fromPersistence(props: ChannelProps): Channel {
    return new Channel(props);
  }

  // ── Channel Settings ──

  rename(newName: string): Result<void, ChannelNameRequiredError> {
    if (!newName || newName.trim().length === 0) {
      return Result.fail(new ChannelNameRequiredError());
    }
    this._name = newName.trim().toLowerCase().replace(/\s+/g, '-');
    this.touch();
    return Result.ok(undefined);
  }

  setTopic(topic: string | null): void {
    this._topic = topic;
    this.touch();
  }

  setDescription(description: string | null): void {
    this._description = description;
    this.touch();
  }

  archive(): void {
    this._isArchived = true;
    this.touch();
  }

  unarchive(): void {
    this._isArchived = false;
    this.touch();
  }

  // ── Membership ──

  addMember(
    userId: string,
    role: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER',
  ): Result<void, ChannelMemberAlreadyExistsError | ChannelArchivedError> {
    if (this._isArchived) {
      return Result.fail(new ChannelArchivedError());
    }
    if (this._members.find((m) => m.userId === userId)) {
      return Result.fail(new ChannelMemberAlreadyExistsError(userId));
    }
    this._members.push(ChannelMember.create(this.id, userId, role));
    this.touch();
    this.addDomainEvent(new MemberJoinedChannelEvent(this.id, userId));
    return Result.ok(undefined);
  }

  removeMember(userId: string): Result<void, ChannelMemberNotFoundError> {
    const idx = this._members.findIndex((m) => m.userId === userId);
    if (idx === -1) {
      return Result.fail(new ChannelMemberNotFoundError(userId));
    }
    this._members.splice(idx, 1);
    this.touch();
    this.addDomainEvent(new MemberLeftChannelEvent(this.id, userId));
    return Result.ok(undefined);
  }

  isMember(userId: string): boolean {
    return this._members.some((m) => m.userId === userId);
  }

  updateReadCursor(
    userId: string,
    lastReadMessageId: string,
  ): Result<void, ChannelMemberNotFoundError> {
    const member = this._members.find((m) => m.userId === userId);
    if (!member) {
      return Result.fail(new ChannelMemberNotFoundError(userId));
    }
    member.updateReadCursor(lastReadMessageId);
    this.touch();
    return Result.ok(undefined);
  }
}
