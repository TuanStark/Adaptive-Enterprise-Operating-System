import { serverApi, getSessionContext } from "@/lib/api-server";
import type { Document } from "../types";

interface PaginatedResponse<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export async function getDocuments(): Promise<Document[]> {
  try {
    const { workspaceId } = await getSessionContext();
    const response = await serverApi.get<PaginatedResponse<Document>>("/documents", { workspaceId });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch documents:", error);
    return [];
  }
}
