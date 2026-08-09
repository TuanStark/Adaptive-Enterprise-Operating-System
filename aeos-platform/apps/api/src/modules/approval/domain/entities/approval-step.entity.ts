import { Entity } from '@aeos/shared-kernel';
import { generateId } from '@aeos/common';

export interface ApprovalStepProps {
  id: string;
  approvalRequestId: string;
  reviewerId: string;
  status: string;
  comment: string | null;
  stepOrder: number;
  actedAt: Date | null;
  createdAt: Date;
}

export class ApprovalStep extends Entity<string> {
  private _approvalRequestId: string;
  private _reviewerId: string;
  private _status: string;
  private _comment: string | null;
  private _stepOrder: number;
  private _actedAt: Date | null;

  private constructor(props: ApprovalStepProps) {
    super(props.id, props.createdAt);
    this._approvalRequestId = props.approvalRequestId;
    this._reviewerId = props.reviewerId;
    this._status = props.status;
    this._comment = props.comment;
    this._stepOrder = props.stepOrder;
    this._actedAt = props.actedAt;
  }

  get approvalRequestId(): string {
    return this._approvalRequestId;
  }
  get reviewerId(): string {
    return this._reviewerId;
  }
  get status(): string {
    return this._status;
  }
  get comment(): string | null {
    return this._comment;
  }
  get stepOrder(): number {
    return this._stepOrder;
  }
  get actedAt(): Date | null {
    return this._actedAt;
  }

  static create(approvalRequestId: string, reviewerId: string, stepOrder: number): ApprovalStep {
    return new ApprovalStep({
      id: generateId(),
      approvalRequestId,
      reviewerId,
      status: 'PENDING',
      comment: null,
      stepOrder,
      actedAt: null,
      createdAt: new Date(),
    });
  }

  static fromPersistence(props: ApprovalStepProps): ApprovalStep {
    return new ApprovalStep(props);
  }

  approve(comment?: string): void {
    this._status = 'APPROVED';
    this._comment = comment ?? null;
    this._actedAt = new Date();
  }

  reject(comment?: string): void {
    this._status = 'REJECTED';
    this._comment = comment ?? null;
    this._actedAt = new Date();
  }
}
