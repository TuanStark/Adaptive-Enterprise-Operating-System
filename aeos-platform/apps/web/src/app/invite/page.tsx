"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { useValidateInviteToken } from "@/features/team/hooks/useValidateInviteToken";
import { useAcceptInvite } from "@/features/team/hooks/useAcceptInvite";
import { InviteCard } from "@/features/team/components/InviteCard";
import { InvalidInviteCard } from "@/features/team/components/InvalidInviteCard";

function InviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { inviteInfo, isValidating, validateError } = useValidateInviteToken(token);
  const { status, actionError, handleAccept } = useAcceptInvite({ token, inviteInfo });

  if (!token) {
    return <InvalidInviteCard message="The invitation link is missing a token." />;
  }

  return (
    <InviteCard
      token={token}
      inviteInfo={inviteInfo}
      isValidating={isValidating}
      validateError={validateError}
      status={status}
      actionError={actionError}
      onAccept={handleAccept}
    />
  );
}

export default function InvitePage() {
  return (
    <AuthProvider>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <InviteContent />
      </Suspense>
    </AuthProvider>
  );
}
