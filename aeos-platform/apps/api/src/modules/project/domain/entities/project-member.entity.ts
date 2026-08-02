import { Entity } from '@aeos/shared-kernel';

export interface ProjectMemberProps {
  id: string;
  tenantId: string;
  projectId: string;
  userId: string;
  role: string;
  joinedAt: Date;
}

export class ProjectMember extends Entity<string> {
  private _tenantId: string;
  private _projectId: string;
  private _userId: string;
  private _role: string;
  private _joinedAt: Date;

  private constructor(props: ProjectMemberProps) {
    super(props.id);
    this._tenantId = props.tenantId;
    this._projectId = props.projectId;
    this._userId = props.userId;
    this._role = props.role;
    this._joinedAt = props.joinedAt;
  }

  get tenantId(): string { return this._tenantId; }
  get projectId(): string { return this._projectId; }
  get userId(): string { return this._userId; }
  get role(): string { return this._role; }
  get joinedAt(): Date { return this._joinedAt; }

  changeRole(newRole: string): void {
    this._role = newRole;
  }

  static create(props: ProjectMemberProps): ProjectMember {
    return new ProjectMember(props);
  }
}
