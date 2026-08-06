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
  TESTING = 'TESTING',
  QA = 'QA',
  READY_FOR_RELEASE = 'READY_FOR_RELEASE',
  DEPLOYED = 'DEPLOYED',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD',
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

const ALL_STATUSES = [
  TaskStatus.BACKLOG, TaskStatus.TODO, TaskStatus.IN_PROGRESS, 
  TaskStatus.BLOCKED, TaskStatus.REVIEW, TaskStatus.TESTING,
  TaskStatus.QA, TaskStatus.READY_FOR_RELEASE, TaskStatus.DEPLOYED,
  TaskStatus.DONE, TaskStatus.CANCELLED, TaskStatus.ON_HOLD
];

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.BACKLOG]: ALL_STATUSES,
  [TaskStatus.TODO]: ALL_STATUSES,
  [TaskStatus.IN_PROGRESS]: ALL_STATUSES,
  [TaskStatus.BLOCKED]: ALL_STATUSES,
  [TaskStatus.REVIEW]: ALL_STATUSES,
  [TaskStatus.TESTING]: ALL_STATUSES,
  [TaskStatus.QA]: ALL_STATUSES,
  [TaskStatus.READY_FOR_RELEASE]: ALL_STATUSES,
  [TaskStatus.DEPLOYED]: ALL_STATUSES,
  [TaskStatus.DONE]: ALL_STATUSES,
  [TaskStatus.CANCELLED]: ALL_STATUSES,
  [TaskStatus.ON_HOLD]: ALL_STATUSES,
};

export interface TaskProps {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  key: string;
  sprintId: string | null;
  parentTaskId: string | null;
  title: string;
  description: string | null;
  type: TaskType;
  creatorId: string;
  reporterId: string | null;
  assigneeId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  resolution: string | null;
  labels: string[];
  storyPoints: number | null;
  originalEstimate: number | null;
  remainingEstimate: number | null;
  timeSpent: number;
  boardPosition: number;
  startDate: Date | null;
  dueDate: Date | null;
  environment: string | null;
  fixVersionId: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export class Task extends AggregateRoot<string> {
  private _tenantId: string;
  private _workspaceId: string;
  private _projectId: string;
  private _key: string;
  private _sprintId: string | null;
  private _parentTaskId: string | null;
  private _title: string;
  private _description: string | null;
  private _type: TaskType;
  private _creatorId: string;
  private _reporterId: string | null;
  private _assigneeId: string | null;
  private _status: TaskStatus;
  private _priority: TaskPriority;
  private _resolution: string | null;
  private _labels: string[];
  private _storyPoints: number | null;
  private _originalEstimate: number | null;
  private _remainingEstimate: number | null;
  private _timeSpent: number;
  private _boardPosition: number;
  private _startDate: Date | null;
  private _dueDate: Date | null;
  private _environment: string | null;
  private _fixVersionId: string | null;
  private _deletedAt: Date | null;

  private constructor(props: TaskProps) {
    super(props.id, props.version, props.createdAt, props.updatedAt);
    this._tenantId = props.tenantId;
    this._workspaceId = props.workspaceId;
    this._projectId = props.projectId;
    this._key = props.key;
    this._sprintId = props.sprintId;
    this._parentTaskId = props.parentTaskId;
    this._title = props.title;
    this._description = props.description;
    this._type = props.type;
    this._creatorId = props.creatorId;
    this._reporterId = props.reporterId;
    this._assigneeId = props.assigneeId;
    this._status = props.status;
    this._priority = props.priority;
    this._resolution = props.resolution;
    this._labels = props.labels;
    this._storyPoints = props.storyPoints;
    this._originalEstimate = props.originalEstimate;
    this._remainingEstimate = props.remainingEstimate;
    this._timeSpent = props.timeSpent;
    this._boardPosition = props.boardPosition;
    this._startDate = props.startDate;
    this._dueDate = props.dueDate;
    this._environment = props.environment;
    this._fixVersionId = props.fixVersionId;
    this._deletedAt = props.deletedAt ?? null;
  }

  // ── Getters ──

  get tenantId(): string { return this._tenantId; }
  get workspaceId(): string { return this._workspaceId; }
  get projectId(): string { return this._projectId; }
  get key(): string { return this._key; }
  get sprintId(): string | null { return this._sprintId; }
  get parentTaskId(): string | null { return this._parentTaskId; }
  get title(): string { return this._title; }
  get description(): string | null { return this._description; }
  get type(): TaskType { return this._type; }
  get creatorId(): string { return this._creatorId; }
  get reporterId(): string | null { return this._reporterId; }
  get assigneeId(): string | null { return this._assigneeId; }
  get status(): TaskStatus { return this._status; }
  get priority(): TaskPriority { return this._priority; }
  get resolution(): string | null { return this._resolution; }
  get labels(): string[] { return [...this._labels]; }
  get storyPoints(): number | null { return this._storyPoints; }
  get originalEstimate(): number | null { return this._originalEstimate; }
  get remainingEstimate(): number | null { return this._remainingEstimate; }
  get timeSpent(): number { return this._timeSpent; }
  get boardPosition(): number { return this._boardPosition; }
  get startDate(): Date | null { return this._startDate; }
  get dueDate(): Date | null { return this._dueDate; }
  get environment(): string | null { return this._environment; }
  get fixVersionId(): string | null { return this._fixVersionId; }
  get deletedAt(): Date | null { return this._deletedAt; }

  // ── Factory Methods ──

  static create(
    tenantId: string, workspaceId: string, projectId: string, key: string, title: string,
    description: string | null, creatorId: string,
    type: TaskType = TaskType.TASK,
    priority: TaskPriority = TaskPriority.MEDIUM,
  ): Result<Task, TaskTitleRequiredError> {
    if (!title || title.trim().length === 0) {
      return Result.fail(new TaskTitleRequiredError());
    }
    const id = generateId();
    const task = new Task({
      id, tenantId, workspaceId, projectId, key,
      sprintId: null, parentTaskId: null, title: title.trim(), description,
      type, creatorId, reporterId: creatorId, assigneeId: null,
      status: TaskStatus.BACKLOG, priority, resolution: null,
      labels: [], storyPoints: null, originalEstimate: null,
      remainingEstimate: null, timeSpent: 0, boardPosition: Date.now(),
      startDate: null, dueDate: null, environment: null, fixVersionId: null,
      version: 0, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
    });
    task.addDomainEvent(new TaskCreatedEvent(id, projectId, title.trim()));
    return Result.ok(task);
  }

  static fromPersistence(props: TaskProps): Task {
    return new Task(props);
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

  setReporter(reporterId: string | null): void {
    this._reporterId = reporterId;
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

  setStartDate(startDate: Date | null): void {
    this._startDate = startDate;
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

  // ── Time Tracking ──

  setEstimate(originalMinutes: number): void {
    this._originalEstimate = originalMinutes;
    this._remainingEstimate = originalMinutes;
    this.touch();
  }

  logWork(minutes: number): void {
    this._timeSpent += minutes;
    this._remainingEstimate = Math.max(0, (this._remainingEstimate ?? 0) - minutes);
    this.touch();
  }

  // ── Resolution ──

  resolve(resolution: string): void {
    this._resolution = resolution;
    this.touch();
  }

  clearResolution(): void {
    this._resolution = null;
    this.touch();
  }

  // ── Board Positioning ──

  reposition(newPosition: number): void {
    this._boardPosition = newPosition;
    this.touch();
  }

  // ── Labels ──

  addLabel(label: string): void {
    const normalized = label.trim().toLowerCase();
    if (normalized && !this._labels.includes(normalized)) {
      this._labels.push(normalized);
      this.touch();
    }
  }

  removeLabel(label: string): void {
    const normalized = label.trim().toLowerCase();
    this._labels = this._labels.filter(l => l !== normalized);
    this.touch();
  }

  setLabels(labels: string[]): void {
    this._labels = labels.map(l => l.trim().toLowerCase()).filter(Boolean);
    this.touch();
  }

  // ── Environment & Version ──

  setEnvironment(environment: string | null): void {
    this._environment = environment;
    this.touch();
  }

  setFixVersion(fixVersionId: string | null): void {
    this._fixVersionId = fixVersionId;
    this.touch();
  }
}
