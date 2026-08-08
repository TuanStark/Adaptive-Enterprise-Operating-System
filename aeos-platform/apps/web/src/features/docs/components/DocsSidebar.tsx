"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Plus, BookOpen } from "lucide-react";
import { clientApi } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Document } from "../types";
import { CreateDocumentButton } from "./CreateDocumentButton";
import { cn } from "@/lib/utils";

export function DocsSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const workspaceId = user?.workspaceId;

  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const response = await clientApi.get(`/documents?workspaceId=${workspaceId}`) as any;
      return (response.data || []) as Document[];
    },
    enabled: !!workspaceId,
  });

  return (
    <div className="flex flex-col h-full bg-[#F7F7F8] dark:bg-zinc-900/40">
      <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          Workspace Docs
        </h2>
        <CreateDocumentButton renderButton={<Button variant="ghost" size="icon" className="h-6 w-6" />}>
          <Plus className="w-4 h-4" />
        </CreateDocumentButton>
      </div>

      <div className="p-3 overflow-y-auto flex-1">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
            All Documents
          </p>

          {isLoading ? (
            <div className="flex flex-col gap-2 px-2 py-4">
              <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
              <div className="h-6 w-5/6 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="flex flex-col gap-0.5">
              {documents.map((doc) => {
                const isActive = pathname === `/docs/${doc.id}`;
                return (
                  <Link
                    key={doc.id}
                    href={`/docs/${doc.id}`}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md font-medium transition-colors cursor-pointer",
                      isActive
                        ? "bg-emerald-100/50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                        : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-200"
                    )}
                  >
                    <FileText className={cn("w-4 h-4 shrink-0", isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-zinc-500")} />
                    <span className="truncate">{doc.name}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="px-2 py-6 text-center">
              <p className="text-sm text-gray-500 dark:text-zinc-500 italic">No documents yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
