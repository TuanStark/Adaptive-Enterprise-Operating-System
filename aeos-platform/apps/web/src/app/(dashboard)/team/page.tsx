import { TeamList } from "@/features/team/components/TeamList";
import { InviteMemberButton } from "@/features/team/components/InviteMemberButton";
import { TeamMember } from "@/features/team/types";

async function getTeamMembers(): Promise<TeamMember[]> {
  return [
    { id: "m1", userId: "user-1", name: "Tony Stark", email: "tony@aeos.io", role: "ADMIN", avatarUrl: "https://i.pravatar.cc/150?u=1", joinedAt: "2026-07-01T00:00:00Z" },
    { id: "m2", userId: "user-2", name: "Peter Parker", email: "peter@aeos.io", role: "MEMBER", avatarUrl: "https://i.pravatar.cc/150?u=2", joinedAt: "2026-07-05T00:00:00Z" },
    { id: "m3", userId: "user-3", name: "Bruce Banner", email: "bruce@aeos.io", role: "MEMBER", avatarUrl: "https://i.pravatar.cc/150?u=3", joinedAt: "2026-07-10T00:00:00Z" },
    { id: "m4", userId: "user-4", name: "Natasha Romanoff", email: "natasha@aeos.io", role: "MEMBER", avatarUrl: "https://i.pravatar.cc/150?u=4", joinedAt: "2026-07-15T00:00:00Z" },
  ];
}

export default async function TeamPage() {
  const members = await getTeamMembers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Team</h1>
          <p className="text-gray-500">Manage members and permissions.</p>
        </div>
        <InviteMemberButton />
      </div>

      <TeamList members={members} />
    </div>
  );
}
