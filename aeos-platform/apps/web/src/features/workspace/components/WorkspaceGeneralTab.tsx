"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceMutations } from "../hooks/useWorkspaces";
import { UserWorkspace } from "../hooks/useWorkspaces";

export function WorkspaceGeneralTab({ workspace, onClose }: { workspace: UserWorkspace; onClose: () => void }) {
  const [name, setName] = useState(workspace.name || "");
  const [description, setDescription] = useState(workspace.description || "");
  const { update, archive } = useWorkspaceMutations();

  const handleSave = async () => {
    await update.mutateAsync({ workspaceId: workspace.id, name, description });
  };

  const handleArchive = async () => {
    if (confirm("Are you sure you want to delete this workspace? This action cannot be undone.")) {
      await archive.mutateAsync(workspace.id);
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Workspace Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Description</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
        </div>
        <Button onClick={handleSave} disabled={update.isPending}>
          {update.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
      <div className="pt-6 border-t border-red-100 mt-6">
        <h3 className="text-red-600 font-medium mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">Deleting this workspace will remove all channels, messages, and members permanently.</p>
        <Button variant="destructive" onClick={handleArchive} disabled={archive.isPending}>
          {archive.isPending ? "Deleting..." : "Delete Workspace"}
        </Button>
      </div>
    </div>
  );
}
