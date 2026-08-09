"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientApi } from "@/lib/api-client";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface CreateChannelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onChannelCreated: (newChannelId: string) => void;
}

export function CreateChannelDialog({ isOpen, onClose, onChannelCreated }: CreateChannelDialogProps) {
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const workspaceId = session?.user?.workspaceId;
    const tenantId = session?.user?.tenantId || "default";

    if (!workspaceId) {
      toast.error("No active workspace found");
      return;
    }

    setIsPending(true);
    try {
      const res = await clientApi.post<{ id: string }>("/channels", {
        tenantId,
        workspaceId,
        name: name.trim().toLowerCase().replace(/\s+/g, "-"),
        type,
        description: description.trim() || undefined,
      });

      toast.success("Channel created successfully!");
      setName("");
      setDescription("");
      setType("PUBLIC");
      onChannelCreated(res.id);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create channel");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a Channel</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Channel Name</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">#</span>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. project-aeos"
                className="pl-7"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Channel Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("PUBLIC")}
                className={`p-3 text-left rounded-lg border text-xs font-medium transition-all ${
                  type === "PUBLIC"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold mb-0.5">Public</div>
                <div className="text-[11px] text-gray-500">Anyone in the workspace can join</div>
              </button>

              <button
                type="button"
                onClick={() => setType("PRIVATE")}
                className={`p-3 text-left rounded-lg border text-xs font-medium transition-all ${
                  type === "PRIVATE"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold mb-0.5">Private</div>
                <div className="text-[11px] text-gray-500">Only invited members can view</div>
              </button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
