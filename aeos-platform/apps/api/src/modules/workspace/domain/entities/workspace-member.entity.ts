import { Entity } from '@aeos/shared-kernel';

export interface WorkspaceMemberProps {
  id: string;
  tenantId: string;
  workspaceId: string;
  userId: string;
  roleId: string | null;
  joinedAt: Date;
}

export class WorkspaceMember extends Entity<string> {
  private _tenantId: string;
  private _workspaceId: string;
  private _userId: string;
  private _roleId: string | null;
  private _joinedAt: Date;

  private constructor(props: WorkspaceMemberProps) {
    super(props.id);
    this._tenantId = props.tenantId;
    this._workspaceId = props.workspaceId;
    this._userId = props.userId;
    this._roleId = props.roleId;
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
  get joinedAt(): Date {
    return this._joinedAt;
  }

  assignRole(roleId: string): void {
    this._roleId = roleId;
  }

  static create(props: WorkspaceMemberProps): WorkspaceMember {
    return new WorkspaceMember(props);
  }
}
