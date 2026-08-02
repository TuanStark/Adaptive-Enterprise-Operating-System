// ── Document types aligned with BE Document module ──

export type DocumentVisibility = 'PRIVATE' | 'INTERNAL' | 'PUBLIC';

export type DocumentVersion = {
  id: string;
  versionNumber: number;
  fileId: string;
  createdAt: string;
};

export type Document = {
  id: string;
  name: string;
  ownerId: string;
  visibility: DocumentVisibility;
  versionCount: number;
  createdAt: string;
};

export type DocumentDetail = Document & {
  workspaceId: string;
  tenantId: string;
  versions: DocumentVersion[];
};
