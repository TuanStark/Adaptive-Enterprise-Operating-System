"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceMutations } from "../hooks/useWorkspaces";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CreateWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceDialog({ isOpen, onClose }: CreateWorkspaceDialogProps) {
  const { data: session, update } = useSession();
  const { create } = useWorkspaceMutations();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim() || !session?.user?.tenantId) return;

    try {
      const result = await create.mutateAsync({
        tenantId: session.user.tenantId,
        organizationId: session.user.organizationId,
        name,
        description,
      });

      // Update session with new workspace
      await update({
        workspaceId: result.id,
        workspaceName: name,
      });

      setName("");
      setDescription("");
      onClose();
      
      // Hard refresh to update Server Components with new workspace data
      router.refresh();
      // Hoặc window.location.reload();
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Marketing Team" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description (Optional)</label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this workspace for?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!name.trim() || create.isPending}>
            {create.isPending ? "Creating..." : "Create Workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
