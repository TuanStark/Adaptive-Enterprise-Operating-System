"use client";

import React, { useState } from "react";
import { X, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/useAppStore";
import { useCreateForm } from "../hooks/useForms";

interface CreateFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFormDialog({ isOpen, onClose }: CreateFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const workspaceId = useAppStore((s) => s.activeWorkspaceId);
  const createForm = useCreateForm();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createForm.mutate(
      {
        tenantId: "tenant-1", // TODO: get from session
        workspaceId: workspaceId ?? "workspace-1",
        name: name.trim(),
        description: description.trim() || undefined,
        schema: { type: "object", properties: {} }, // Placeholder schema
      },
      {
        onSuccess: () => {
          setName("");
          setDescription("");
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-50 rounded-lg">
              <ClipboardList className="w-4 h-4 text-violet-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Create Form</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer border-none bg-transparent">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Form name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Bug Report" className="h-9" required autoFocus />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this form for?"
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90" disabled={createForm.isPending}>
              {createForm.isPending ? "Creating..." : "Create Form"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
