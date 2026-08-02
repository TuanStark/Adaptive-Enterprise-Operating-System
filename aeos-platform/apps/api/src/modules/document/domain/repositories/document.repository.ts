import { Document } from '../aggregates/document.aggregate';

export interface DocumentRepository {
  save(document: Document): Promise<void>;
  findById(id: string): Promise<Document | null>;
  findByWorkspaceId(workspaceId: string, page: number, limit: number): Promise<{ data: Document[]; total: number }>;
}

export const DOCUMENT_REPOSITORY = Symbol('DOCUMENT_REPOSITORY');
