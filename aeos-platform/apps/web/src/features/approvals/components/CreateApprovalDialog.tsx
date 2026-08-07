import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateApproval } from "../hooks/useApprovals";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/features/auth/store/useAuthStore";

interface CreateApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateApprovalDialog({ open, onOpenChange }: CreateApprovalDialogProps) {
  const [title, setTitle] = useState("");
  const [entityType, setEntityType] = useState("GENERAL");
  const [reviewerId, setReviewerId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workspaceId = useAppStore((s) => s.activeWorkspaceId);
  const tenantId = useAuthStore((s) => s.user?.tenantId);

  const createApproval = useCreateApproval();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !reviewerId || !workspaceId || !tenantId) return;

    setIsSubmitting(true);
    try {
      await createApproval.mutateAsync({
        tenantId,
        workspaceId,
        title,
        entityType,
        entityId: crypto.randomUUID(), // Mock entity ID for manual creation
        reviewerIds: [reviewerId],
      });
      onOpenChange(false);
      setTitle("");
      setReviewerId("");
    } catch (error) {
      console.error("Failed to create approval", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Approval Request</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Request Title</label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Approve Q3 Budget..."
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="entityType" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Request Type</label>
              <Input
                id="entityType"
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                placeholder="e.g. DOCUMENT, GENERAL"
                required
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="reviewerId" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Reviewer User ID</label>
              <Input
                id="reviewerId"
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
                placeholder="Enter the UUID of the reviewer..."
                required
              />
              <p className="text-xs text-gray-500">
                You can copy a User ID from the Members page to test this workflow.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title || !reviewerId}>
              {isSubmitting ? "Creating..." : "Create Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
