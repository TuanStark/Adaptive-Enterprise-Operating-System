import { AggregateRoot } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';
import { generateId } from '@aeos/common';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { WorkspaceCreatedEvent } from '../events/workspace-created.event';
import { WorkspaceMemberAddedEvent, WorkspaceMemberRemovedEvent } from '../events/workspace-member.events';
import { WorkspaceMemberInvitedEvent } from '../events/workspace-member-invited.event';
import {
  WorkspaceNameRequiredError,
  WorkspaceAlreadyArchivedError,
  WorkspaceArchivedCannotAddMemberError,
  WorkspaceMemberAlreadyExistsError,
  WorkspaceMemberNotFoundError,
} from '../errors/workspace.errors';

export enum WorkspaceStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  SUSPENDED = 'SUSPENDED',
}

export interface WorkspaceProps {
  id: string;
  tenantId: string;
  organizationId: string;
  name: string;
  description: string | null;
  ownerId: string;
  status: WorkspaceStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  members: WorkspaceMember[];
}

export class Workspace extends AggregateRoot<string> {
  private _tenantId: string;
  private _organizationId: string;
  private _name: string;
  private _description: string | null;
  private _ownerId: string;
  private _status: WorkspaceStatus;
  private _deletedAt: Date | null;
  private _members: WorkspaceMember[];

  private constructor(
    id: string,
    tenantId: string,
    organizationId: string,
    name: string,
    description: string | null,
    ownerId: string,
    status: WorkspaceStatus,
    version: number,
    createdAt?: Date,
    updatedAt?: Date,
    deletedAt?: Date | null,
    members?: WorkspaceMember[],
  ) {
    super(id, version, createdAt, updatedAt);
    this._tenantId = tenantId;
    this._organizationId = organizationId;
    this._name = name;
    this._description = description;
    this._ownerId = ownerId;
    this._status = status;
    this._deletedAt = deletedAt ?? null;
    this._members = members ?? [];
  }

  get tenantId(): string {
    return this._tenantId;
  }
  get organizationId(): string {
    return this._organizationId;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get ownerId(): string {
    return this._ownerId;
  }
  get status(): WorkspaceStatus {
    return this._status;
  }
  get deletedAt(): Date | null {
    return this._deletedAt;
  }
  get members(): ReadonlyArray<WorkspaceMember> {
    return this._members;
  }

  // ── Factory ──

  static create(
    tenantId: string,
    organizationId: string,
    name: string,
    description: string | null,
    ownerId: string,
  ): Result<Workspace, WorkspaceNameRequiredError> {
    if (!name || name.trim().length === 0) {
      return Result.fail(new WorkspaceNameRequiredError());
    }

    const id = generateId();
    const ws = new Workspace(
      id,
      tenantId,
      organizationId,
      name.trim(),
      description,
      ownerId,
      WorkspaceStatus.ACTIVE,
      0,
    );

    // Chuẩn DDD: Khi tạo Workspace, owner mặc định phải là một member.
    ws.addMember(tenantId, ownerId, null);

    ws.addDomainEvent(new WorkspaceCreatedEvent(id, tenantId, organizationId, name.trim(), ownerId));
    return Result.ok(ws);
  }

  static fromPersistence(props: WorkspaceProps): Workspace {
    return new Workspace(
      props.id,
      props.tenantId,
      props.organizationId,
      props.name,
      props.description,
      props.ownerId,
      props.status,
      props.version,
      props.createdAt,
      props.updatedAt,
      props.deletedAt,
      props.members,
    );
  }

  // ── Behaviors ──

  rename(newName: string): Result<void, WorkspaceNameRequiredError> {
    if (!newName || newName.trim().length === 0) {
      return Result.fail(new WorkspaceNameRequiredError());
    }
    this._name = newName.trim();
    this.touch();
    return Result.ok(undefined);
  }

  updateDetails(name: string, description: string | null): Result<void, WorkspaceNameRequiredError> {
    if (!name || name.trim().length === 0) {
      return Result.fail(new WorkspaceNameRequiredError());
    }
    this._name = name.trim();
    this._description = description;
    this.touch();
    return Result.ok(undefined);
  }

  archive(): Result<void, WorkspaceAlreadyArchivedError> {
    if (this._status === WorkspaceStatus.ARCHIVED) {
      return Result.fail(new WorkspaceAlreadyArchivedError());
    }
    this._status = WorkspaceStatus.ARCHIVED;
    this.touch();
    return Result.ok(undefined);
  }

  activate(): void {
    this._status = WorkspaceStatus.ACTIVE;
    this.touch();
  }

  inviteMember(email: string, inviterId: string): Result<void, Error> {
    if (this._status === WorkspaceStatus.ARCHIVED) {
      return Result.fail(new Error('Cannot invite to an archived workspace'));
    }
    
    // In a real application, we would create an Invitation entity inside the Organization
    // For this example, we just emit the domain event which triggers the Outbox to send an email.
    this.addDomainEvent(new WorkspaceMemberInvitedEvent(email, this.id, inviterId));
    this.touch();
    return Result.ok(undefined);
  }

  addMember(
    tenantId: string,
    userId: string,
    roleId: string | null,
  ): Result<void, WorkspaceArchivedCannotAddMemberError | WorkspaceMemberAlreadyExistsError> {
    if (this._status === WorkspaceStatus.ARCHIVED) {
      return Result.fail(new WorkspaceArchivedCannotAddMemberError());
    }

    const existing = this._members.find((m) => m.userId === userId);
    if (existing) {
      return Result.fail(new WorkspaceMemberAlreadyExistsError(userId));
    }

    const member = WorkspaceMember.create({
      id: generateId(),
      tenantId,
      workspaceId: this.id,
      userId,
      roleId,
      joinedAt: new Date(),
    });
    this._members.push(member);
    this.addDomainEvent(new WorkspaceMemberAddedEvent(userId, this.id));
    this.touch();
    return Result.ok(undefined);
  }

  removeMember(userId: string): Result<void, WorkspaceMemberNotFoundError> {
    const index = this._members.findIndex((m) => m.userId === userId);
    if (index === -1) {
      return Result.fail(new WorkspaceMemberNotFoundError(userId));
    }
    this._members.splice(index, 1);
    this.addDomainEvent(new WorkspaceMemberRemovedEvent(userId, this.id));
    this.touch();
    return Result.ok(undefined);
  }

  changeMemberRole(userId: string, roleId: string): Result<void, WorkspaceMemberNotFoundError> {
    const member = this._members.find((m) => m.userId === userId);
    if (!member) {
      return Result.fail(new WorkspaceMemberNotFoundError(userId));
    }
    member.assignRole(roleId);
    this.touch();
    return Result.ok(undefined);
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.touch();
  }
}
