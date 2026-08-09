import { ChatLayout } from "@/features/chat/components/ChatLayout";
import { getChannels, getMessages } from "@/features/chat/api/queries";
import { getTeamMembers } from "@/features/team/api/queries";
import { getSessionContext } from "@/lib/api-server";
import type { User } from "@/features/chat/types";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const [channels, members] = await Promise.all([
    getChannels(),
    getTeamMembers(),
  ]);

  const session = await getSessionContext();
  const currentUserId = session.userId;

  const users: Record<string, User> = {};
  for (const m of members) {
    if (m.userId) {
      users[m.userId] = {
        id: m.userId,
        name: m.name || m.email || "Member",
        avatarUrl: m.avatarUrl ?? undefined,
        isOnline: false,
      };
    }
    if (m.id) {
      users[m.id] = {
        id: m.id,
        name: m.name || m.email || "Member",
        avatarUrl: m.avatarUrl ?? undefined,
        isOnline: false,
      };
    }
  }

  if (currentUserId && !users[currentUserId]) {
    users[currentUserId] = {
      id: currentUserId,
      name: "You",
      avatarUrl: undefined,
      isOnline: true,
    };
  }

  const activeChannel = channels[0] ?? null;
  const initialMessages = activeChannel ? await getMessages(activeChannel.id) : [];

  return (
    <div className="h-full w-full">
      <ChatLayout
        initialChannels={channels}
        initialMessages={initialMessages}
        users={users}
        currentUserId={currentUserId}
      />
    </div>
  );
}
