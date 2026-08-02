import { ApprovalRequest } from '../aggregates/approval-request.aggregate';

export interface ApprovalRepository {
  save(approval: ApprovalRequest): Promise<void>;
  findById(id: string): Promise<ApprovalRequest | null>;
  findByWorkspaceId(workspaceId: string, page: number, limit: number): Promise<{ data: ApprovalRequest[]; total: number }>;
}

export const APPROVAL_REPOSITORY = Symbol('APPROVAL_REPOSITORY');
