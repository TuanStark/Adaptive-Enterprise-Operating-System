"use client";

import { useState } from "react";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { clientApi } from "@/lib/api-client";

export function InviteMemberButton() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const workspaceId = useAuthStore((s) => s.user?.workspaceId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!workspaceId) {
      alert("No active workspace selected");
      return;
    }
    setIsPending(true);
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      await clientApi.post(`/workspaces/${workspaceId}/invites`, { email });
      setOpen(false);
      // Optional: add toast notification here
      alert("Invitation sent successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to send invitation. Check console for details.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button className="rounded-full bg-primary hover:bg-primary/90" />}
      >
        Invite Member
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>Send an invitation to join this workspace.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
            <Input id="email" name="email" type="email" placeholder="colleague@company.com" required autoFocus />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
