import { TeamList } from "@/features/team/components/TeamList";
import { InviteMemberButton } from "@/features/team/components/InviteMemberButton";
import { TeamMember } from "@/features/team/types";

async function getTeamMembers(): Promise<TeamMember[]> {
  return [
    { id: "1", name: "Tony Stark", email: "[EMAIL_ADDRESS]", role: "Admin", avatarUrl: "https://i.pravatar.cc/150?u=1" },
    { id: "2", name: "Peter Parker", email: "[EMAIL_ADDRESS]", role: "Member", avatarUrl: "https://i.pravatar.cc/150?u=2" },
    { id: "3", name: "Bruce Banner", email: "[EMAIL_ADDRESS]", role: "Member", avatarUrl: "https://i.pravatar.cc/150?u=3" },
    { id: "4", name: "Natasha Romanoff", email: "[EMAIL_ADDRESS]", role: "Member", avatarUrl: "https://i.pravatar.cc/150?u=4" },
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
