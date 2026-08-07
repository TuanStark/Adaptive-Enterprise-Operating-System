import { AggregateRoot } from '@aeos/shared-kernel';
import { Result } from '@aeos/errors';
import { generateId } from '@aeos/common';
import { ApprovalAlreadyCompletedError } from '../errors/approval.errors';
import { ApprovalStep } from '../entities/approval-step.entity';
import { ApprovalCreatedEvent } from '../events/approval.events';

export interface ApprovalRequestProps {
  id: string;
  tenantId: string;
  workspaceId: string;
  requesterId: string;
  title: string;
  status: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, any> | null;
  createdAt: Date;
  updatedAt: Date;
  steps: ApprovalStep[];
}

export class ApprovalRequest extends AggregateRoot<string> {
  private _tenantId: string;
  private _workspaceId: string;
  private _requesterId: string;
  private _title: string;
  private _status: string;
  private _entityType: string;
  private _entityId: string;
  private _metadata: Record<string, any> | null;
  private _steps: ApprovalStep[];

  private constructor(props: ApprovalRequestProps) {
    super(props.id, 1, props.createdAt, props.updatedAt);
    this._tenantId = props.tenantId;
    this._workspaceId = props.workspaceId;
    this._requesterId = props.requesterId;
    this._title = props.title;
    this._status = props.status;
    this._entityType = props.entityType;
    this._entityId = props.entityId;
    this._metadata = props.metadata;
    this._steps = props.steps;
  }

  get tenantId(): string { return this._tenantId; }
  get workspaceId(): string { return this._workspaceId; }
  get requesterId(): string { return this._requesterId; }
  get title(): string { return this._title; }
  get status(): string { return this._status; }
  get entityType(): string { return this._entityType; }
  get entityId(): string { return this._entityId; }
  get metadata(): Record<string, any> | null { return this._metadata; }
  get steps(): ReadonlyArray<ApprovalStep> { return this._steps; }

  static create(
    tenantId: string, workspaceId: string, requesterId: string, title: string,
    entityType: string, entityId: string, reviewerIds: string[], metadata: Record<string, any> | null = null,
  ): ApprovalRequest {
    const id = generateId();
    const steps = reviewerIds.map((reviewerId, index) => ApprovalStep.create(id, reviewerId, index + 1));

    const approval = new ApprovalRequest({
      id, tenantId, workspaceId, requesterId, title,
      status: 'PENDING', entityType, entityId, metadata,
      createdAt: new Date(), updatedAt: new Date(), steps,
    });
    approval.addDomainEvent(new ApprovalCreatedEvent(approval.id, approval.workspaceId));
    return approval;
  }

  static fromPersistence(props: ApprovalRequestProps): ApprovalRequest {
    return new ApprovalRequest(props);
  }

  approveStep(reviewerId: string, comment?: string): Result<void, ApprovalAlreadyCompletedError> {
    if (this._status !== 'PENDING') return Result.fail(new ApprovalAlreadyCompletedError());

    // Assume parallel or sequential. Let's just find the pending step for this reviewer.
    const step = this._steps.find(s => s.reviewerId === reviewerId && s.status === 'PENDING');
    if (step) {
      step.approve(comment);
      this.touch();

      // Check if all steps are approved
      if (this._steps.every(s => s.status === 'APPROVED')) {
        this._status = 'APPROVED';
      }
    }
    return Result.ok(undefined);
  }

  rejectStep(reviewerId: string, comment?: string): Result<void, ApprovalAlreadyCompletedError> {
    if (this._status !== 'PENDING') return Result.fail(new ApprovalAlreadyCompletedError());

    const step = this._steps.find(s => s.reviewerId === reviewerId && s.status === 'PENDING');
    if (step) {
      step.reject(comment);
      this._status = 'REJECTED'; // Any rejection rejects the whole request
      this.touch();
    }
    return Result.ok(undefined);
  }
}
