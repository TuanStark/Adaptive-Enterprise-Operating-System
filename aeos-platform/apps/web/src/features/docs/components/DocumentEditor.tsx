"use client";

import { useState, useTransition } from "react";
import { uploadFileAction, publishDocumentVersionAction } from "../actions/document-actions";
import { Button } from "@/components/ui/button";

interface DocumentEditorProps {
  documentId: string;
  initialContent: string;
}

export function DocumentEditor({ documentId, initialContent }: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const file = new File([content], `doc-${documentId}.md`, { type: "text/markdown" });
        const formData = new FormData();
        formData.append("file", file);

        const uploadResult = await uploadFileAction(formData);
        if (uploadResult?.id) {
          await publishDocumentVersionAction(documentId, uploadResult.id);
        }
      } catch (error) {
        console.error("Failed to save document:", error);
      }
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Editor</h2>
        <Button onClick={handleSave} disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      <textarea
        className="w-full flex-1 min-h-[400px] p-4 rounded-md border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing your markdown here..."
      />
    </div>
  );
}
