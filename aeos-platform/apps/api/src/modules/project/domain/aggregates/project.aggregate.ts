import { AggregateRoot } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';
import { generateId } from '@aeos/common';
import { ProjectMember } from '../entities/project-member.entity';
import { ProjectCreatedEvent } from '../events/project-created.event';
import {
  ProjectNameRequiredError,
  InvalidProjectStatusTransitionError,
  ProjectMemberAlreadyExistsError,
  ProjectMemberNotFoundError,
} from '../errors/project.errors';

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface ProjectProps {
  id: string;
  tenantId: string;
  workspaceId: string;
  name: string;
  description: string | null;
  ownerId: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: Date | null;
  endDate: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  members: ProjectMember[];
}

const VALID_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.DRAFT]: [ProjectStatus.ACTIVE, ProjectStatus.ARCHIVED],
  [ProjectStatus.ACTIVE]: [ProjectStatus.COMPLETED, ProjectStatus.ARCHIVED],
  [ProjectStatus.COMPLETED]: [ProjectStatus.ARCHIVED],
  [ProjectStatus.ARCHIVED]: [ProjectStatus.ACTIVE],
};

export class Project extends AggregateRoot<string> {
  private _tenantId: string;
  private _workspaceId: string;
  private _name: string;
  private _description: string | null;
  private _ownerId: string;
  private _status: ProjectStatus;
  private _priority: Priority;
  private _startDate: Date | null;
  private _endDate: Date | null;
  private _deletedAt: Date | null;
  private _members: ProjectMember[];

  private constructor(
    id: string, tenantId: string, workspaceId: string, name: string,
    description: string | null, ownerId: string, status: ProjectStatus,
    priority: Priority, startDate: Date | null, endDate: Date | null,
    version: number, createdAt?: Date, updatedAt?: Date,
    deletedAt?: Date | null, members?: ProjectMember[],
  ) {
    super(id, version, createdAt, updatedAt);
    this._tenantId = tenantId;
    this._workspaceId = workspaceId;
    this._name = name;
    this._description = description;
    this._ownerId = ownerId;
    this._status = status;
    this._priority = priority;
    this._startDate = startDate;
    this._endDate = endDate;
    this._deletedAt = deletedAt ?? null;
    this._members = members ?? [];
  }

  get tenantId(): string { return this._tenantId; }
  get workspaceId(): string { return this._workspaceId; }
  get name(): string { return this._name; }
  get description(): string | null { return this._description; }
  get ownerId(): string { return this._ownerId; }
  get status(): ProjectStatus { return this._status; }
  get priority(): Priority { return this._priority; }
  get startDate(): Date | null { return this._startDate; }
  get endDate(): Date | null { return this._endDate; }
  get deletedAt(): Date | null { return this._deletedAt; }
  get members(): ReadonlyArray<ProjectMember> { return this._members; }

  static create(
    tenantId: string, workspaceId: string, name: string,
    description: string | null, ownerId: string, priority: Priority = Priority.MEDIUM,
  ): Result<Project, ProjectNameRequiredError> {
    if (!name || name.trim().length === 0) {
      return Result.fail(new ProjectNameRequiredError());
    }

    const id = generateId();
    const project = new Project(
      id, tenantId, workspaceId, name.trim(), description, ownerId,
      ProjectStatus.DRAFT, priority, null, null, 0,
    );

    project.addDomainEvent(new ProjectCreatedEvent(id, tenantId, workspaceId, name.trim()));
    return Result.ok(project);
  }

  static fromPersistence(props: ProjectProps): Project {
    return new Project(
      props.id, props.tenantId, props.workspaceId, props.name,
      props.description, props.ownerId, props.status, props.priority,
      props.startDate, props.endDate, props.version, props.createdAt,
      props.updatedAt, props.deletedAt, props.members,
    );
  }

  private transitionTo(newStatus: ProjectStatus): Result<void, InvalidProjectStatusTransitionError> {
    const allowed = VALID_TRANSITIONS[this._status];
    if (!allowed.includes(newStatus)) {
      return Result.fail(new InvalidProjectStatusTransitionError(this._status, newStatus));
    }
    this._status = newStatus;
    this.touch();
    return Result.ok(undefined);
  }

  activate(): Result<void, InvalidProjectStatusTransitionError> {
    return this.transitionTo(ProjectStatus.ACTIVE);
  }

  complete(): Result<void, InvalidProjectStatusTransitionError> {
    return this.transitionTo(ProjectStatus.COMPLETED);
  }

  archive(): Result<void, InvalidProjectStatusTransitionError> {
    return this.transitionTo(ProjectStatus.ARCHIVED);
  }

  rename(newName: string): Result<void, ProjectNameRequiredError> {
    if (!newName || newName.trim().length === 0) {
      return Result.fail(new ProjectNameRequiredError());
    }
    this._name = newName.trim();
    this.touch();
    return Result.ok(undefined);
  }

  updateDates(startDate: Date | null, endDate: Date | null): void {
    this._startDate = startDate;
    this._endDate = endDate;
    this.touch();
  }

  changePriority(priority: Priority): void {
    this._priority = priority;
    this.touch();
  }

  addMember(tenantId: string, userId: string, role: string): Result<void, ProjectMemberAlreadyExistsError> {
    if (this._members.find((m) => m.userId === userId)) {
      return Result.fail(new ProjectMemberAlreadyExistsError(userId));
    }
    this._members.push(ProjectMember.create({
      id: generateId(), tenantId, projectId: this.id, userId, role, joinedAt: new Date(),
    }));
    this.touch();
    return Result.ok(undefined);
  }

  removeMember(userId: string): Result<void, ProjectMemberNotFoundError> {
    const idx = this._members.findIndex((m) => m.userId === userId);
    if (idx === -1) return Result.fail(new ProjectMemberNotFoundError(userId));
    this._members.splice(idx, 1);
    this.touch();
    return Result.ok(undefined);
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.touch();
  }
}
