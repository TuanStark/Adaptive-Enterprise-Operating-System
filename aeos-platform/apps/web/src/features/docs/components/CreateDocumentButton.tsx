"use client";

import { useState } from "react";
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
import { createDocumentAction } from "../actions/document-actions";

interface CreateDocumentButtonProps {
  children?: React.ReactNode;
  renderButton?: React.ReactElement;
}

export function CreateDocumentButton({ children, renderButton }: CreateDocumentButtonProps = {}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    try {
      await createDocumentAction({
        name: formData.get("name") as string,
        visibility: "PRIVATE",
      });
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={renderButton || <Button className="rounded-full bg-primary hover:bg-primary/90" />}
      >
        {children || "Create Document"}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Document</DialogTitle>
          <DialogDescription>Create a new document in this workspace.</DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
            <Input id="name" name="name" placeholder="e.g., Architecture Guide" required autoFocus />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
