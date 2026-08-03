// ── Approval types aligned with BE Approval Entity ──

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ApprovalStep = {
  reviewerId: string;
  reviewerName: string;
  status: ApprovalStatus;
  comment: string | null;
};

export type Approval = {
  id: string;
  title: string;
  status: ApprovalStatus;
  requesterId: string;
  requesterName: string;
  entityType: string;
  entityId: string;
  steps: ApprovalStep[];
  createdAt: string;
};
