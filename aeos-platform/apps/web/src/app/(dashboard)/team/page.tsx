import { TeamList } from "@/features/team/components/TeamList";
import { InviteMemberButton } from "@/features/team/components/InviteMemberButton";
import { getTeamMembers } from "@/features/team/api/queries";

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
