import { AggregateRoot } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';
import { generateId } from '@aeos/common';
import { OrganizationMember } from '../entities/organization-member.entity';
import { OrganizationCreatedEvent } from '../events/organization-created.event';
import { MemberAddedEvent } from '../events/member-added.event';
import {
  OrganizationNameRequiredError,
  MemberAlreadyExistsError,
  MemberNotFoundError,
} from '../errors/organization.errors';

export interface OrganizationProps {
  id: string;
  tenantId: string;
  name: string;
  ownerId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  members: OrganizationMember[];
}

export class Organization extends AggregateRoot<string> {
  private _tenantId: string;
  private _name: string;
  private _ownerId: string;
  private _deletedAt: Date | null;
  private _members: OrganizationMember[];

  private constructor(
    id: string,
    tenantId: string,
    name: string,
    ownerId: string,
    version: number,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date | null,
    members?: OrganizationMember[],
  ) {
    super(id, version, createdAt, updatedAt);
    this._tenantId = tenantId;
    this._name = name;
    this._ownerId = ownerId;
    this._deletedAt = deletedAt ?? null;
    this._members = members ?? [];
  }

  get tenantId(): string {
    return this._tenantId;
  }
  get name(): string {
    return this._name;
  }
  get ownerId(): string {
    return this._ownerId;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }
  get members(): ReadonlyArray<OrganizationMember> {
    return this._members;
  }

  // ── Factory Methods ──

  static create(tenantId: string, name: string, ownerId: string): Result<Organization, OrganizationNameRequiredError> {
    if (!name || name.trim().length === 0) {
      return Result.fail(new OrganizationNameRequiredError());
    }

    const id = generateId();
    const org = new Organization(id, tenantId, name.trim(), ownerId, 0);

    // Owner tự động trở thành ADMIN
    const ownerMember = OrganizationMember.create({
      id: generateId(),
      tenantId,
      organizationId: id,
      userId: ownerId,
      role: 'ADMIN',
      joinedAt: new Date(),
    });
    org._members.push(ownerMember);

    org.addDomainEvent(new OrganizationCreatedEvent(id, tenantId, name.trim(), ownerId));
    return Result.ok(org);
  }

  static fromPersistence(props: OrganizationProps): Organization {
    return new Organization(
      props.id,
      props.tenantId,
      props.name,
      props.ownerId,
      props.version,
      props.createdAt,
      props.updatedAt,
      props.deletedAt,
      props.members,
    );
  }

  // ── Behaviors ──

  rename(newName: string): Result<void, OrganizationNameRequiredError> {
    if (!newName || newName.trim().length === 0) {
      return Result.fail(new OrganizationNameRequiredError());
    }
    this._name = newName.trim();
    this.touch();
    return Result.ok(undefined);
  }

  addMember(tenantId: string, userId: string, role: string): Result<void, MemberAlreadyExistsError> {
    const existing = this._members.find((m) => m.userId === userId);
    if (existing) {
      return Result.fail(new MemberAlreadyExistsError(userId));
    }

    const member = OrganizationMember.create({
      id: generateId(),
      tenantId,
      organizationId: this.id,
      userId,
      role,
      joinedAt: new Date(),
    });
    this._members.push(member);
    this.touch();

    this.addDomainEvent(new MemberAddedEvent(this.id, userId, role));
    return Result.ok(undefined);
  }

  removeMember(userId: string): Result<void, MemberNotFoundError> {
    const index = this._members.findIndex((m) => m.userId === userId);
    if (index === -1) {
      return Result.fail(new MemberNotFoundError(userId));
    }
    this._members.splice(index, 1);
    this.touch();
    return Result.ok(undefined);
  }

  changeMemberRole(userId: string, newRole: string): Result<void, MemberNotFoundError> {
    const member = this._members.find((m) => m.userId === userId);
    if (!member) {
      return Result.fail(new MemberNotFoundError(userId));
    }
    member.changeRole(newRole);
    this.touch();
    return Result.ok(undefined);
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.touch();
  }
}
