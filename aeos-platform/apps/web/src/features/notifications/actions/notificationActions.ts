'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api-server';

export async function markNotificationAsRead(id: string) {
  await serverApi.patch<{ message: string }>(`/notifications/${id}/read`);
  revalidatePath('/');
}

export async function markAllNotificationsAsRead() {
  await serverApi.patch<{ message: string }>('/notifications/read-all');
  revalidatePath('/');
}
