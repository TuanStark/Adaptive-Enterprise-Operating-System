export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string; // ISO string
  senderId: string;
  channelId: string;
  threadCount?: number;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
}
