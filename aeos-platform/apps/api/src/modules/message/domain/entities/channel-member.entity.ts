import { Entity } from '@aeos/shared-kernel';
import { generateId } from '@aeos/common';

export interface ChannelMemberProps {
  id: string;
  channelId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: Date;
}

export class ChannelMember extends Entity<string> {
  private _channelId: string;
  private _userId: string;
  private _role: 'OWNER' | 'ADMIN' | 'MEMBER';

  private constructor(props: ChannelMemberProps) {
    super(props.id, props.joinedAt);
    this._channelId = props.channelId;
    this._userId = props.userId;
    this._role = props.role;
  }

  get channelId(): string { return this._channelId; }
  get userId(): string { return this._userId; }
  get role(): 'OWNER' | 'ADMIN' | 'MEMBER' { return this._role; }

  static create(channelId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER'): ChannelMember {
    return new ChannelMember({
      id: generateId(), channelId, userId, role, joinedAt: new Date(),
    });
  }

  static fromPersistence(props: ChannelMemberProps): ChannelMember {
    return new ChannelMember(props);
  }

  changeRole(role: 'OWNER' | 'ADMIN' | 'MEMBER'): void {
    this._role = role;
  }
}
