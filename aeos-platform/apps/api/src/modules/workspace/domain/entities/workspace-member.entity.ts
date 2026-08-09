import { Entity } from '@aeos/shared-kernel';

export interface WorkspaceMemberProps {
  id: string;
  tenantId: string;
  workspaceId: string;
  userId: string;
  roleId: string | null;
  nickname: string | null;
  avatarUrl: string | null;
  title: string | null;
  department: string | null;
  statusMessage: string | null;
  joinedAt: Date;
}

export class WorkspaceMember extends Entity<string> {
  private _tenantId: string;
  private _workspaceId: string;
  private _userId: string;
  private _roleId: string | null;
  private _nickname: string | null;
  private _avatarUrl: string | null;
  private _title: string | null;
  private _department: string | null;
  private _statusMessage: string | null;
  private _joinedAt: Date;

  private constructor(props: WorkspaceMemberProps) {
    super(props.id);
    this._tenantId = props.tenantId;
    this._workspaceId = props.workspaceId;
    this._userId = props.userId;
    this._roleId = props.roleId;
    this._nickname = props.nickname;
    this._avatarUrl = props.avatarUrl;
    this._title = props.title;
    this._department = props.department;
    this._statusMessage = props.statusMessage;
    this._joinedAt = props.joinedAt;
  }

  get tenantId(): string {
    return this._tenantId;
  }
  get workspaceId(): string {
    return this._workspaceId;
  }
  get userId(): string {
    return this._userId;
  }
  get roleId(): string | null {
    return this._roleId;
  }
  get nickname(): string | null {
    return this._nickname;
  }
  get avatarUrl(): string | null {
    return this._avatarUrl;
  }
  get title(): string | null {
    return this._title;
  }
  get department(): string | null {
    return this._department;
  }
  get statusMessage(): string | null {
    return this._statusMessage;
  }
  get joinedAt(): Date {
    return this._joinedAt;
  }

  updateProfile(
    nickname: string | null,
    avatarUrl: string | null,
    title: string | null,
    department: string | null,
    statusMessage: string | null,
  ): void {
    this._nickname = nickname;
    this._avatarUrl = avatarUrl;
    this._title = title;
    this._department = department;
    this._statusMessage = statusMessage;
  }

  assignRole(roleId: string): void {
    this._roleId = roleId;
  }

  static create(props: WorkspaceMemberProps): WorkspaceMember {
    return new WorkspaceMember(props);
  }
}
