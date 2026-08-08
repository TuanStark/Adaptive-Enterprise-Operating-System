"use server";

import { revalidatePath } from "next/cache";
import { serverApi, getSessionContext } from "@/lib/api-server";

interface CreateDocumentInput {
  name: string;
  visibility?: string;
}

export async function createDocumentAction(data: CreateDocumentInput): Promise<{ id: string }> {
  const { tenantId, workspaceId } = await getSessionContext();

  const result = await serverApi.post<{ id: string; message: string }>("/documents", {
    tenantId,
    workspaceId,
    name: data.name,
    visibility: data.visibility ?? "PRIVATE",
  });

  revalidatePath("/docs");
  return { id: result.id };
}

export async function uploadFileAction(formData: FormData): Promise<{ id: string } | null> {
  try {
    const response = await serverApi.upload<{ id: string; message: string }>("/files/upload", formData);
    return { id: response.id };
  } catch (error) {
    console.error("Upload file failed:", error);
    return null;
  }
}

export async function publishDocumentVersionAction(documentId: string, fileId: string): Promise<void> {
  await serverApi.post(`/documents/${documentId}/versions`, { fileId });
  revalidatePath(`/docs/${documentId}`);
}
