// ── Chat types aligned with BE Message module ──

export type ChannelType = 'PUBLIC' | 'PRIVATE' | 'DIRECT';

export type ChannelMemberRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export interface ChannelMember {
  userId: string;
  role: ChannelMemberRole;
  joinedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  description: string | null;
  topic: string | null;
  isArchived: boolean;
  memberCount: number;
  createdAt: string;
}

export interface ChannelDetail extends Channel {
  members: ChannelMember[];
}

export interface MessageReaction {
  userId: string;
  emoji: string;
}

export interface Message {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  parentMessageId: string | null;
  isPinned: boolean;
  isEdited: boolean;
  reactions: MessageReaction[];
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
}

// Legacy compat — UI components still use this for rendering
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
}
