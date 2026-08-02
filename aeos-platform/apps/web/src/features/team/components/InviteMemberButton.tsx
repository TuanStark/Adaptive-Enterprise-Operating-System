"use client";

import { Button } from "@/components/ui/button";

export function InviteMemberButton() {
  return (
    <Button 
      className="rounded-full bg-primary hover:bg-primary/90"
      onClick={() => {
        console.log("Open Invite Modal");
      }}
    >
      Invite Member
    </Button>
  );
}
