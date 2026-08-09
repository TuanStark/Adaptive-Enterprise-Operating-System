export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export interface ApprovalStep {
  reviewerId: string;
  status: ApprovalStatus;
  comment: string | null;
}

export interface Approval {
  id: string;
  title: string;
  status: ApprovalStatus;
  requesterId: string;
  steps: ApprovalStep[];
  createdAt: string;
}
