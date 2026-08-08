import { ChatArea } from "@/features/chat/components/ChatArea";
import { getChannels, getMessages } from "@/features/chat/api/queries";
import { getTeamMembers } from "@/features/team/api/queries";
import { getSessionContext } from "@/lib/api-server";
import type { User } from "@/features/chat/types";

export default async function ChatPage() {
  const [channels, members] = await Promise.all([
    getChannels(),
    getTeamMembers(),
  ]);

  const session = await getSessionContext();
  const currentUserId = session.userId;

  const users: Record<string, User> = {};
  for (const m of members) {
    users[m.userId] = {
      id: m.userId,
      name: m.name,
      avatarUrl: m.avatarUrl ?? undefined,
      isOnline: false,
    };
  }

  const activeChannel = channels[0] ?? null;
  const messages = activeChannel ? await getMessages(activeChannel.id) : [];
  const channelId = activeChannel?.id ?? "";
  const channelName = activeChannel?.name ?? "general";

  return (
    <div className="h-full w-full">
      <ChatArea channelId={channelId} channelName={channelName} messages={messages} users={users} currentUserId={currentUserId} />

    </div>
  );
}
