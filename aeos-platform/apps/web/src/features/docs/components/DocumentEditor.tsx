"use client";

import { useState, useTransition, useEffect } from "react";
import { uploadFileAction, publishDocumentVersionAction } from "../actions/document-actions";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Save, Check, Loader2, Eye, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentEditorProps {
  documentId: string;
  initialContent: string;
}

export function DocumentEditor({ documentId, initialContent }: DocumentEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (content !== initialContent) {
      setHasUnsavedChanges(true);
      setSaveStatus("idle");
    } else {
      setHasUnsavedChanges(false);
    }
  }, [content, initialContent]);

  const handleSave = () => {
    if (content === initialContent && !hasUnsavedChanges) return;

    setSaveStatus("saving");
    startTransition(async () => {
      try {
        const file = new File([content], `doc-${documentId}.md`, { type: "text/markdown" });
        const formData = new FormData();
        formData.append("file", file);

        const uploadResult = await uploadFileAction(formData);
        if (uploadResult?.id) {
          await publishDocumentVersionAction(documentId, uploadResult.id);
          setSaveStatus("saved");
          setHasUnsavedChanges(false);
          
          setTimeout(() => {
            setSaveStatus("idle");
          }, 3000);
        } else {
          setSaveStatus("idle");
        }
      } catch (error) {
        console.error("Failed to save document:", error);
        setSaveStatus("idle");
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center space-x-1 bg-gray-200/50 dark:bg-zinc-800/50 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("write")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === "write" 
                ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            )}
          >
            <Edit3 className="w-4 h-4" />
            Write
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all",
              activeTab === "preview" 
                ? "bg-white dark:bg-zinc-700 text-gray-900 dark:text-zinc-100 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            )}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-zinc-400 hidden sm:inline-flex items-center gap-1.5">
            {saveStatus === "saving" && (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            )}
            {saveStatus === "saved" && (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                Saved just now
              </>
            )}
            {saveStatus === "idle" && hasUnsavedChanges && "Unsaved changes"}
          </span>
          <Button 
            onClick={handleSave} 
            disabled={isPending || (!hasUnsavedChanges && saveStatus !== "saved")}
            size="sm"
            className="h-8 gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 relative min-h-[500px]">
        {activeTab === "write" ? (
          <textarea
            className="absolute inset-0 w-full h-full p-6 lg:p-8 bg-transparent text-gray-800 dark:text-zinc-200 font-mono text-[15px] leading-relaxed focus:ring-0 focus:outline-none resize-none placeholder:text-gray-300 dark:placeholder:text-zinc-700"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your document..."
            spellCheck={false}
          />
        ) : (
          <div className="absolute inset-0 w-full h-full p-6 lg:p-8 overflow-y-auto bg-gray-50/30 dark:bg-zinc-900/30">
            {content.trim() ? (
              <div className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 dark:text-zinc-600 italic">
                Nothing to preview
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
