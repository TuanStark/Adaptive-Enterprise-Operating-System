"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { InviteInfo, InviteStatus } from "../types/invite.types";

interface InviteCardProps {
  token: string;
  inviteInfo: InviteInfo | null;
  isValidating: boolean;
  validateError: string | null;
  status: InviteStatus;
  actionError: string | null;
  onAccept: () => void;
}

export function InviteCard({
  token,
  inviteInfo,
  isValidating,
  validateError,
  status,
  actionError,
  onAccept,
}: InviteCardProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const isEmailMatch = !!(
    user?.email &&
    inviteInfo?.email &&
    user.email.toLowerCase().trim() === inviteInfo.email.toLowerCase().trim()
  );

  const displayError = actionError || validateError;

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Workspace Invitation</CardTitle>
          <CardDescription className="pt-2">
            {inviteInfo?.workspaceName ? (
              <>
                You have been invited to join <strong className="text-gray-900">{inviteInfo.workspaceName}</strong>
              </>
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
          ) : validateError && !inviteInfo ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 flex flex-col items-center text-center">
              <XCircle className="w-8 h-8 mb-2" />
              <p className="font-medium">{validateError}</p>
            </div>
          ) : (
            <>
              {inviteInfo && (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm border border-blue-100 text-center mb-4 space-y-1">
                  <p>
                    You have been invited as <strong>{inviteInfo.email}</strong>
                  </p>
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

              {displayError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-start gap-2 border border-red-100">
                  <XCircle className="w-5 h-5 shrink-0" />
                  <span>{displayError}</span>
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
          {isValidating || (!inviteInfo && validateError) ? (
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
                onClick={onAccept}
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
