import { useEffect } from "react";
import type { UserWorkspace } from "@/features/workspace/hooks/useWorkspaces";

export function useWorkspaceFormInit(
  workspace: UserWorkspace | undefined,
  setMounted: (val: boolean) => void,
  setName: (val: string) => void,
  setDescription: (val: string) => void
) {
  useEffect(() => {
    setMounted(true);
    if (workspace) {
      setName(workspace.name ?? "");
      setDescription(workspace.description ?? "");
    }
  }, [workspace, setMounted, setName, setDescription]);
}
