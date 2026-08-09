import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";
import { InviteInfo, InviteStatus, UserWorkspaceDto } from "../types/invite.types";

interface UseAcceptInviteParams {
  token: string | null;
  inviteInfo: InviteInfo | null;
}

interface UseAcceptInviteResult {
  status: InviteStatus;
  actionError: string | null;
  handleAccept: () => Promise<void>;
}

export function useAcceptInvite({ token, inviteInfo }: UseAcceptInviteParams): UseAcceptInviteResult {
  const router = useRouter();
  const { update } = useSession();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<InviteStatus>("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!token) return;

    setStatus("loading");
    setActionError(null);

    try {
      await clientApi.post("/workspaces/invites/accept", { token });

      let workspaceName = inviteInfo?.workspaceName ?? "";
      let organizationId = "";
      let role = "USER";

      try {
        const myWorkspaces = await clientApi.get<UserWorkspaceDto[]>("/workspaces/me");
        const accepted = myWorkspaces.find((w) => w.id === inviteInfo?.workspaceId);
        if (accepted) {
          workspaceName = accepted.name ?? workspaceName;
          organizationId = accepted.organizationId ?? "";
          role = accepted.membership?.roleName ?? "USER";
        }
      } catch {
        throw new Error("Failed to fetch workspace details.");
      }

      if (inviteInfo?.workspaceId) {
        await update({
          workspaceId: inviteInfo.workspaceId,
          workspaceName,
          organizationId,
          role,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
      setStatus("success");

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: unknown) {
      console.error("[useAcceptInvite] Accept invitation error:", err);
      const msg = err instanceof Error ? err.message : "Failed to accept invitation. It may be invalid or expired.";
      setStatus("error");
      setActionError(msg);
    }
  };

  return {
    status,
    actionError,
    handleAccept,
  };
}
