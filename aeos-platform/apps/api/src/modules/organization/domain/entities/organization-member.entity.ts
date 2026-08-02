import { Entity } from '@aeos/shared-kernel';

export interface OrganizationMemberProps {
  id: string;
  tenantId: string;
  organizationId: string;
  userId: string;
  role: string;
  joinedAt: Date;
}

export class OrganizationMember extends Entity<string> {
  private _tenantId: string;
  private _organizationId: string;
  private _userId: string;
  private _role: string;
  private _joinedAt: Date;

  private constructor(props: OrganizationMemberProps) {
    super(props.id);
    this._tenantId = props.tenantId;
    this._organizationId = props.organizationId;
    this._userId = props.userId;
    this._role = props.role;
    this._joinedAt = props.joinedAt;
  }

  get tenantId(): string {
    return this._tenantId;
  }
  get organizationId(): string {
    return this._organizationId;
  }
  get userId(): string {
    return this._userId;
  }
  get role(): string {
    return this._role;
  }
  get joinedAt(): Date {
    return this._joinedAt;
  }

  changeRole(newRole: string): void {
    this._role = newRole;
  }

  static create(props: OrganizationMemberProps): OrganizationMember {
    return new OrganizationMember(props);
  }
}
