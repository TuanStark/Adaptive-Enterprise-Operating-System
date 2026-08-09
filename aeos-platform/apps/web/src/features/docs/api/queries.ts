import { serverApi, getSessionContext } from '@/lib/api-server';
import { Document, DocumentDetail } from '../types';

interface PaginatedResponse<T> {
  data: T[];
}

export async function getDocuments() {
  try {
    const { workspaceId } = await getSessionContext();
    const response = await serverApi.get<PaginatedResponse<Document>>('/documents', {
      workspaceId,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return [];
  }
}

export const getDocument = async (
  id: string,
  workspaceId: string,
): Promise<DocumentDetail | null> => {
  try {
    const document = await serverApi.get<DocumentDetail>(
      `/documents/${id}?workspaceId=${workspaceId}`,
    );
    return document;
  } catch (error) {
    console.error(`Failed to fetch document ${id}:`, error);
    return null;
  }
};

export const getFileUrl = async (fileId: string): Promise<string | null> => {
  try {
    const result = await serverApi.get<{ url: string }>(`/files/${fileId}/url`);
    return result.url;
  } catch (error) {
    console.error(`Failed to fetch file url for ${fileId}:`, error);
    return null;
  }
};
