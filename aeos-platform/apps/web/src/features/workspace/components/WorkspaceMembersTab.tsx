"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceMembers, useWorkspaceMemberMutations } from "../hooks/useWorkspaces";
import { Trash2, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";

export function WorkspaceMembersTab({ workspaceId }: { workspaceId: string }) {
  const { data: session } = useSession();
  const { data: membersData, isLoading } = useWorkspaceMembers(workspaceId);
  const { invite, remove } = useWorkspaceMemberMutations(workspaceId);
  const [inviteEmail, setInviteEmail] = useState("");

  const members = membersData?.data || [];

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    try {
      await invite.mutateAsync(inviteEmail);
      setInviteEmail("");
      alert("Invitation sent!");
    } catch (e) {
      alert("Failed to send invitation.");
    }
  };

  const handleRemove = async (userId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      await remove.mutateAsync(userId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input 
          placeholder="Email address to invite..." 
          value={inviteEmail} 
          onChange={(e) => setInviteEmail(e.target.value)} 
          className="flex-1"
        />
        <Button onClick={handleInvite} disabled={invite.isPending || !inviteEmail.trim()}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite
        </Button>
      </div>
      
      <div className="border rounded-md divide-y">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No members found.</div>
        ) : (
          members.map((member) => (
            <div key={member.userId} className="flex items-center justify-between p-3 hover:bg-gray-50">
              <div>
                <p className="font-medium text-sm text-gray-900">{member.name || "Unknown User"}</p>
                <p className="text-xs text-gray-500">{member.email || "No email"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                  {member.roleName || "Member"}
                </span>
                {member.userId !== session?.user?.id && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleRemove(member.userId)}
                    disabled={remove.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
