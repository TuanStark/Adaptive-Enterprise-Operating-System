"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaces, useWorkspaceMutations } from "../hooks/useWorkspaces";
import { WorkspaceGeneralTab } from "./WorkspaceGeneralTab";
import { WorkspaceMembersTab } from "./WorkspaceMembersTab";


interface WorkspaceSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function WorkspaceSettingsDialog({ isOpen, onClose, workspaceId }: WorkspaceSettingsDialogProps) {
  const { data: workspaces } = useWorkspaces();
  const workspace = workspaces?.find((w) => w.id === workspaceId);

  if (!workspace) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Workspace Settings</DialogTitle>
          <DialogDescription>
            Manage settings and members for {workspace.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="flex-1 overflow-auto mt-4">
            <WorkspaceGeneralTab workspace={workspace} onClose={onClose} />
          </TabsContent>

          <TabsContent value="members" className="flex-1 overflow-auto mt-4">
            <WorkspaceMembersTab workspaceId={workspaceId} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
