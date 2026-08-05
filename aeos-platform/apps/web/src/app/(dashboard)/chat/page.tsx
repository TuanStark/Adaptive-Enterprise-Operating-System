import { ChatArea } from "@/features/chat/components/ChatArea";
import { getChannels, getMessages } from "@/features/chat/api/queries";
import { getTeamMembers } from "@/features/team/api/queries";
import type { User } from "@/features/chat/types";

export default async function ChatPage() {
  const [channels, members] = await Promise.all([
    getChannels(),
    getTeamMembers(),
  ]);

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
  const channelName = activeChannel?.name ?? "general";

  return (
    <div className="h-full w-full">
      <ChatArea channelName={channelName} messages={messages} users={users} />
    </div>
  );
}
