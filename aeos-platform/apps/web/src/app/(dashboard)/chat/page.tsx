import { ChatArea } from "@/features/chat/components/ChatArea";
import { Message, User } from "@/features/chat/types";

// Mock Data — aligned with BE message module
const MOCK_USERS: Record<string, User> = {
  "u1": { id: "u1", name: "Tony Stark", avatarUrl: "https://i.pravatar.cc/150?u=1", isOnline: true },
  "u2": { id: "u2", name: "Peter Parker", avatarUrl: "https://i.pravatar.cc/150?u=2", isOnline: false },
  "u3": { id: "u3", name: "Bruce Banner", avatarUrl: "https://i.pravatar.cc/150?u=3", isOnline: true },
};

const MOCK_MESSAGES: Message[] = [
  { id: "m1", content: "Hey team, the new deployment is live on production.", createdAt: new Date().toISOString(), senderId: "u1", channelId: "general", parentMessageId: null, isPinned: false, isEdited: false, reactions: [], editedAt: null, deletedAt: null },
  { id: "m2", content: "Awesome! I'll run the E2E tests to verify.", createdAt: new Date().toISOString(), senderId: "u2", channelId: "general", parentMessageId: null, isPinned: false, isEdited: false, reactions: [], editedAt: null, deletedAt: null },
  { id: "m3", content: "Great job everyone.", createdAt: new Date().toISOString(), senderId: "u3", channelId: "general", parentMessageId: null, isPinned: false, isEdited: false, reactions: [{ userId: "u1", emoji: "👍" }], editedAt: null, deletedAt: null },
  { id: "m4", content: "Wait, the auth service is returning 500.", createdAt: new Date().toISOString(), senderId: "u1", channelId: "general", parentMessageId: null, isPinned: false, isEdited: false, reactions: [], editedAt: null, deletedAt: null },
  { id: "m5", content: "Checking the logs now.", createdAt: new Date().toISOString(), senderId: "u1", channelId: "general", parentMessageId: null, isPinned: false, isEdited: false, reactions: [], editedAt: null, deletedAt: null },
  { id: "m6", content: "It seems like a Redis connection timeout. I'll patch it.", createdAt: new Date().toISOString(), senderId: "u2", channelId: "general", parentMessageId: null, isPinned: false, isEdited: false, reactions: [], editedAt: null, deletedAt: null },
];

export default function ChatPage() {
  return (
    <div className="h-full w-full">
      <ChatArea channelName="general" messages={MOCK_MESSAGES} users={MOCK_USERS} />
    </div>
  );
}
