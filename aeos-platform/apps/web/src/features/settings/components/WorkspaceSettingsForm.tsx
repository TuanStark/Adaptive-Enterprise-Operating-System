"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaces, useWorkspaceMutations } from "@/features/workspace/hooks/useWorkspaces";
import { useSession } from "next-auth/react";

export function WorkspaceSettingsForm() {
  const { data: session, update: updateSession } = useSession();
  const { data: workspacesData, isLoading } = useWorkspaces();
  const { update } = useWorkspaceMutations();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  const currentWorkspaceId = session?.user?.workspaceId;
  const currentWorkspace = workspacesData?.find(w => w.id === currentWorkspaceId);

  useEffect(() => {
    if (currentWorkspace) {
      setName(currentWorkspace.name || "");
      setDescription(currentWorkspace.description || "");
    }
  }, [currentWorkspace]);

  const handleSave = async () => {
    if (!currentWorkspaceId) return;
    
    await update.mutateAsync({
      workspaceId: currentWorkspaceId,
      name,
      description,
    });
    
    // update session name if name changed
    if (name !== currentWorkspace?.name) {
      await updateSession({
        workspaceId: currentWorkspaceId,
        workspaceName: name,
      });
      window.location.reload(); // hard refresh to update context
    }
  };

  if (isLoading) return <div className="p-4 text-gray-500">Loading settings...</div>;
  if (!currentWorkspaceId) return <div className="p-4 text-gray-500">No workspace selected.</div>;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800">Workspace Details</CardTitle>
        <CardDescription>Update your workspace name and information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Workspace Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} className="max-w-md" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <Input value={description} onChange={e => setDescription(e.target.value)} className="max-w-md" />
        </div>
        <Button className="mt-4" onClick={handleSave} disabled={update.isPending || !name.trim()}>
          {update.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
}
