import { AggregateRoot } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';
import { generateId } from '@aeos/common';
import {
  TaskTitleRequiredError,
  InvalidTaskStatusTransitionError,
  TaskAlreadyCancelledError,
  TaskAlreadyDoneError,
} from '../errors/task.errors';
import { TaskCreatedEvent, TaskStatusChangedEvent, TaskAssignedEvent } from '../events/task.events';

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskType {
  EPIC = 'EPIC',
  STORY = 'STORY',
  TASK = 'TASK',
  BUG = 'BUG',
  SUBTASK = 'SUBTASK',
}

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.BACKLOG]: [TaskStatus.TODO, TaskStatus.CANCELLED],
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.BACKLOG, TaskStatus.CANCELLED],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW, TaskStatus.BLOCKED, TaskStatus.TODO, TaskStatus.CANCELLED],
  [TaskStatus.BLOCKED]: [TaskStatus.IN_PROGRESS, TaskStatus.TODO, TaskStatus.CANCELLED],
  [TaskStatus.REVIEW]: [TaskStatus.DONE, TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
  [TaskStatus.DONE]: [TaskStatus.TODO],
  [TaskStatus.CANCELLED]: [TaskStatus.BACKLOG],
};

export interface TaskProps {
  id: string;
  tenantId: string;
  projectId: string;
  key: string;
  sprintId: string | null;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  type: TaskType;
  creatorId: string;
  assigneeId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  storyPoints: number | null;
  dueDate: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Task extends AggregateRoot<string> {
  private _tenantId: string;
  private _projectId: string;
  private _key: string;
  private _sprintId: string | null;
  private _parentTaskId: string | null;
  private _title: string;
  private _description: string | null;
  private _type: TaskType;
  private _creatorId: string;
  private _assigneeId: string | null;
  private _status: TaskStatus;
  private _priority: TaskPriority;
  private _storyPoints: number | null;
  private _dueDate: Date | null;
  private _deletedAt: Date | null;

  private constructor(
    id: string, tenantId: string, projectId: string, key: string,
    sprintId: string | null, parentTaskId: string | null, title: string,
    description: string | null, type: TaskType, creatorId: string,
    assigneeId: string | null, status: TaskStatus, priority: TaskPriority,
    storyPoints: number | null, dueDate: Date | null, version: number,
    createdAt?: Date, updatedAt?: Date, deletedAt?: Date | null,
  ) {
    super(id, version, createdAt, updatedAt);
    this._tenantId = tenantId;
    this._projectId = projectId;
    this._key = key;
    this._sprintId = sprintId;
    this._parentTaskId = parentTaskId;
    this._title = title;
    this._description = description;
    this._type = type;
    this._creatorId = creatorId;
    this._assigneeId = assigneeId;
    this._status = status;
    this._priority = priority;
    this._storyPoints = storyPoints;
    this._dueDate = dueDate;
    this._deletedAt = deletedAt ?? null;
  }

  get tenantId(): string { return this._tenantId; }
  get projectId(): string { return this._projectId; }
  get key(): string { return this._key; }
  get sprintId(): string | null { return this._sprintId; }
  get parentTaskId(): string | null { return this._parentTaskId; }
  get title(): string { return this._title; }
  get description(): string | null { return this._description; }
  get type(): TaskType { return this._type; }
  get creatorId(): string { return this._creatorId; }
  get assigneeId(): string | null { return this._assigneeId; }
  get status(): TaskStatus { return this._status; }
  get priority(): TaskPriority { return this._priority; }
  get storyPoints(): number | null { return this._storyPoints; }
  get dueDate(): Date | null { return this._dueDate; }
  get deletedAt(): Date | null { return this._deletedAt; }

  static create(
    tenantId: string, projectId: string, key: string, title: string,
    description: string | null, creatorId: string,
    type: TaskType = TaskType.TASK,
    priority: TaskPriority = TaskPriority.MEDIUM,
  ): Result<Task, TaskTitleRequiredError> {
    if (!title || title.trim().length === 0) {
      return Result.fail(new TaskTitleRequiredError());
    }
    const id = generateId();
    const task = new Task(
      id, tenantId, projectId, key, null, null, title.trim(), description,
      type, creatorId, null, TaskStatus.BACKLOG, priority, null, null, 0,
    );
    task.addDomainEvent(new TaskCreatedEvent(id, projectId, title.trim()));
    return Result.ok(task);
  }

  static fromPersistence(props: TaskProps): Task {
    return new Task(
      props.id, props.tenantId, props.projectId, props.key,
      props.sprintId, props.parentTaskId, props.title, props.description,
      props.type, props.creatorId, props.assigneeId, props.status, props.priority,
      props.storyPoints, props.dueDate, props.version, props.createdAt,
      props.updatedAt, props.deletedAt,
    );
  }

  // ── Status Transitions (State Machine) ──

  changeStatus(newStatus: TaskStatus): Result<void, InvalidTaskStatusTransitionError> {
    const allowed = VALID_TRANSITIONS[this._status];
    if (!allowed || !allowed.includes(newStatus)) {
      return Result.fail(new InvalidTaskStatusTransitionError(this._status, newStatus));
    }
    const oldStatus = this._status;
    this._status = newStatus;
    this.touch();
    this.addDomainEvent(new TaskStatusChangedEvent(this.id, oldStatus, newStatus));
    return Result.ok(undefined);
  }

  // ── Assignment ──

  assign(assigneeId: string): Result<void, TaskAlreadyCancelledError> {
    if (this._status === TaskStatus.CANCELLED) {
      return Result.fail(new TaskAlreadyCancelledError());
    }
    this._assigneeId = assigneeId;
    this.touch();
    this.addDomainEvent(new TaskAssignedEvent(this.id, assigneeId));
    return Result.ok(undefined);
  }

  assignTo(userId: string): void {
    if (this._assigneeId !== userId) {
      this._assigneeId = userId;
      this.touch();
      this.addDomainEvent(new TaskAssignedEvent(this.id, userId));
    }
  }

  unassign(): void {
    this._assigneeId = null;
    this.touch();
  }

  // ── Sprint ──

  moveToSprint(sprintId: string): void {
    this._sprintId = sprintId;
    this.touch();
  }

  removeFromSprint(): void {
    this._sprintId = null;
    this.touch();
  }

  // ── Details ──

  updateDetails(title: string, description: string | null): Result<void, TaskTitleRequiredError> {
    if (!title || title.trim().length === 0) {
      return Result.fail(new TaskTitleRequiredError());
    }
    this._title = title.trim();
    this._description = description;
    this.touch();
    return Result.ok(undefined);
  }

  changePriority(priority: TaskPriority): void {
    this._priority = priority;
    this.touch();
  }

  setDueDate(dueDate: Date | null): void {
    this._dueDate = dueDate;
    this.touch();
  }

  setParentTask(parentTaskId: string): void {
    this._parentTaskId = parentTaskId;
    this.touch();
  }

  removeParentTask(): void {
    this._parentTaskId = null;
    this.touch();
  }

  softDelete(): void {
    this._deletedAt = new Date();
    this.touch();
  }

  changeType(type: TaskType): void {
    this._type = type;
    this.touch();
  }

  setStoryPoints(points: number | null): void {
    this._storyPoints = points;
    this.touch();
  }
}
