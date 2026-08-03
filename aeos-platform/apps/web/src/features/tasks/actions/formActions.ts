"use server";

import { revalidatePath } from "next/cache";
import { serverApi } from "@/lib/api-server";
import type { CreateFormInput } from "../types/form";

export async function createForm(input: CreateFormInput) {
  const result = await serverApi.post<{ id: string; message: string }>("/forms", input);
  revalidatePath("/tasks");
  return result;
}

export async function submitForm(formId: string, data: Record<string, unknown>) {
  const result = await serverApi.post<{ message: string }>(`/forms/${formId}/submissions`, { data });
  revalidatePath("/tasks");
  return result;
}
