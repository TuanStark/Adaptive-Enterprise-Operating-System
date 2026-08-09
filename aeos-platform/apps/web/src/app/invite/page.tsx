"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import { clientApi } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { AuthProvider } from "@/features/auth/components/AuthProvider";

interface InviteInfo {
  email: string;
  workspaceId: string;
  workspaceName?: string;
  inviterName?: string;
}

interface UserWorkspaceDto {
  id: string;
  name: string | null;
  organizationId: string | null;
  membership?: {
    roleName?: string | null;
  };
}

function InviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { update } = useSession();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      return;
    }
    const validateToken = async () => {
      try {
        const res = await clientApi.get<InviteInfo>(`/workspaces/invites/validate?token=${token}`);
        setInviteInfo(res);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "The invitation link is invalid or has expired.";
        setErrorMessage(msg);
        setStatus("error");
      } finally {
        setIsValidating(false);
      }
    };
    validateToken();
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    setStatus("loading");
    try {
      await clientApi.post("/workspaces/invites/accept", { token });
      
      // Refetch user workspaces to obtain workspace context details
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
        // Non-critical fallback to inviteInfo
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
      console.error("[InvitePage] Accept invitation error:", err);
      const msg = err instanceof Error ? err.message : "Failed to accept invitation. It may be invalid or expired.";
      setStatus("error");
      setErrorMessage(msg);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Invalid Link
            </CardTitle>
            <CardDescription>
              The invitation link is missing a token.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/")}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isEmailMatch = !!(
    user?.email &&
    inviteInfo?.email &&
    user.email.toLowerCase().trim() === inviteInfo.email.toLowerCase().trim()
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Workspace Invitation</CardTitle>
          <CardDescription className="pt-2">
            {inviteInfo?.workspaceName ? (
              <>You have been invited to join <strong className="text-gray-900">{inviteInfo.workspaceName}</strong></>
            ) : (
              "You have been invited to join a Workspace on AEOS."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isValidating ? (
            <div className="flex flex-col items-center justify-center py-6 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
              <p>Validating invitation...</p>
            </div>
          ) : status === "error" && !inviteInfo ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 flex flex-col items-center text-center">
              <XCircle className="w-8 h-8 mb-2" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          ) : (
            <>
              {inviteInfo && (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100 text-center mb-4 space-y-1">
                  <p>You have been invited as <strong>{inviteInfo.email}</strong></p>
                  {inviteInfo.inviterName && (
                    <p className="text-xs text-blue-600">Invited by: {inviteInfo.inviterName}</p>
                  )}
                </div>
              )}
              {user ? (
                <div className="bg-gray-50 p-4 rounded-lg text-sm border border-gray-100">
                  <p className="text-gray-500 mb-1">You will join this workspace as:</p>
                  <p className="font-medium text-gray-900">{user.email}</p>
                </div>
              ) : (
                <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm border border-amber-100">
                  <p className="font-medium mb-1">Authentication Required</p>
                  <p>You must be logged in to accept this invitation.</p>
                </div>
              )}

              {status === "error" && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2 border border-red-100">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {status === "success" && (
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-md text-sm flex items-start gap-2 border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Invitation accepted successfully! Redirecting...</span>
                </div>
              )}
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          {isValidating || (!inviteInfo && status === "error") ? (
            <Button className="w-full" onClick={() => router.push("/")}>
              Return to Home
            </Button>
          ) : !user ? (
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(`/invite?token=${token}`)}`)}
            >
              Log In / Sign Up to Accept
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="w-full sm:w-1/3 border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => router.push("/")}
                disabled={status === "loading" || status === "success"}
              >
                Decline
              </Button>
              <Button
                className="w-full sm:w-2/3 bg-primary hover:bg-primary/90 text-white font-semibold shadow-sm"
                onClick={handleAccept}
                disabled={status === "loading" || status === "success" || !isEmailMatch}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : !isEmailMatch ? (
                  "Email Mismatch"
                ) : (
                  "Accept Invitation"
                )}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function InvitePage() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center p-4 bg-gray-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
        <InviteContent />
      </Suspense>
    </AuthProvider>
  );
}
