import { serverApi, getSessionContext } from "@/lib/api-server";
import type { Channel, Message } from "../types";

interface PaginatedResponse<T> {
  data: T[];
  meta: Record<string, unknown>;
}

export async function getChannels(): Promise<Channel[]> {
  try {
    const { workspaceId } = await getSessionContext();
    const response = await serverApi.get<PaginatedResponse<Channel>>("/channels", { workspaceId });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch channels:", error);
    return [];
  }
}

export async function getMessages(channelId: string): Promise<Message[]> {
  try {
    const response = await serverApi.get<PaginatedResponse<Message>>(`/channels/${channelId}/messages`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }
}
