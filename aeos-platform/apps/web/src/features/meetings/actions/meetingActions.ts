'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api-server';
import type { CreateMeetingInput } from '../types';

export async function createMeeting(input: CreateMeetingInput) {
  const result = await serverApi.post<{ id: string; message: string }>('/meetings', input);
  revalidatePath('/meetings');
  return result;
}
