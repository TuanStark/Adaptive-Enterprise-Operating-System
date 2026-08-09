import { AggregateRoot } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';
import { generateId } from '@aeos/common';
import { SprintStartedEvent } from '../events/sprint-started.event';
import {
  SprintNameRequiredError,
  InvalidSprintStatusTransitionError,
} from '../errors/sprint.errors';

export enum SprintStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
}

export interface SprintProps {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  goal: string | null;
  status: SprintStatus;
  startDate: Date | null;
  endDate: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Sprint extends AggregateRoot<string> {
  private _tenantId: string;
  private _projectId: string;
  private _name: string;
  private _goal: string | null;
  private _status: SprintStatus;
  private _startDate: Date | null;
  private _endDate: Date | null;

  private constructor(
    id: string,
    tenantId: string,
    projectId: string,
    name: string,
    goal: string | null,
    status: SprintStatus,
    startDate: Date | null,
    endDate: Date | null,
    version: number,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, version, createdAt, updatedAt);
    this._tenantId = tenantId;
    this._projectId = projectId;
    this._name = name;
    this._goal = goal;
    this._status = status;
    this._startDate = startDate;
    this._endDate = endDate;
  }

  get tenantId(): string {
    return this._tenantId;
  }
  get projectId(): string {
    return this._projectId;
  }
  get name(): string {
    return this._name;
  }
  get goal(): string | null {
    return this._goal;
  }
  get status(): SprintStatus {
    return this._status;
  }
  get startDate(): Date | null {
    return this._startDate;
  }
  get endDate(): Date | null {
    return this._endDate;
  }

  static create(
    tenantId: string,
    projectId: string,
    name: string,
    goal: string | null,
    startDate: Date | null,
    endDate: Date | null,
  ): Result<Sprint, SprintNameRequiredError> {
    if (!name || name.trim().length === 0) {
      return Result.fail(new SprintNameRequiredError());
    }
    const id = generateId();
    return Result.ok(
      new Sprint(
        id,
        tenantId,
        projectId,
        name.trim(),
        goal,
        SprintStatus.PLANNING,
        startDate,
        endDate,
        0,
      ),
    );
  }

  static fromPersistence(props: SprintProps): Sprint {
    return new Sprint(
      props.id,
      props.tenantId,
      props.projectId,
      props.name,
      props.goal,
      props.status,
      props.startDate,
      props.endDate,
      props.version,
      props.createdAt,
      props.updatedAt,
    );
  }

  start(): Result<void, InvalidSprintStatusTransitionError> {
    if (this._status !== SprintStatus.PLANNING) {
      return Result.fail(new InvalidSprintStatusTransitionError(this._status, SprintStatus.ACTIVE));
    }
    this._status = SprintStatus.ACTIVE;
    this._startDate = this._startDate ?? new Date();
    this.touch();
    this.addDomainEvent(new SprintStartedEvent(this.id, this._projectId));
    return Result.ok(undefined);
  }

  complete(): Result<void, InvalidSprintStatusTransitionError> {
    if (this._status !== SprintStatus.ACTIVE) {
      return Result.fail(
        new InvalidSprintStatusTransitionError(this._status, SprintStatus.COMPLETED),
      );
    }
    this._status = SprintStatus.COMPLETED;
    this._endDate = this._endDate ?? new Date();
    this.touch();
    return Result.ok(undefined);
  }
}
