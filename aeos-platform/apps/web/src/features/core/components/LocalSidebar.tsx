"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Search, Plus, ListTodo, Columns, Calendar, FileText, Folder, Hash, Check, Timeline } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DocsSidebar } from "@/features/docs/components/DocsSidebar";
import { ChatSidebar } from "@/features/chat/components/ChatSidebar";

function TasksSidebar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentView = searchParams.get("view") || "sprint";
  const currentFilter = searchParams.get("filter");

  const handleFilter = (filterName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("filter") === filterName) {
      params.delete("filter");
    } else {
      params.set("filter", filterName);
    }
    router.push(`?${params.toString()}`);
  };

  const isActiveSprint = currentView === "sprint";
  const isBacklog = currentView === "backlog";
  const isRoadmap = currentView === "roadmap";

  const isAssignedToMe = currentFilter === "me";
  const isUrgent = currentFilter === "urgent";

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Task Board</h2>
        <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="w-4 h-4" /></Button>
      </div>
      <div className="p-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Views</p>
          <Link href="/tasks" className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer ${isActiveSprint ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Columns className={`w-4 h-4 ${isActiveSprint ? 'text-primary' : ''}`} /> Board
          </Link>
          <Link href="/tasks?view=backlog" className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer ${isBacklog ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            <ListTodo className={`w-4 h-4 ${isBacklog ? 'text-primary' : ''}`} /> Backlog
          </Link>
          <Link href="/tasks?view=calendar" className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer ${isRoadmap ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Calendar className={`w-4 h-4 ${isRoadmap ? 'text-primary' : ''}`} /> Calendar
          </Link>
          <Link href="/tasks?view=timeline" className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer ${isRoadmap ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Timeline className={`w-4 h-4 ${isRoadmap ? 'text-primary' : ''}`} /> Timeline
          </Link>
        </div>
        <div className="mt-6 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Filters</p>
          <div onClick={() => handleFilter("me")} className={`flex items-center justify-between px-2 py-1.5 text-sm rounded-md cursor-pointer ${isAssignedToMe ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            <span>Assigned to me</span>
            {isAssignedToMe && <Check className="w-4 h-4" />}
          </div>
          <div onClick={() => handleFilter("urgent")} className={`flex items-center justify-between px-2 py-1.5 text-sm rounded-md cursor-pointer ${isUrgent ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
            <span>Urgent Priority</span>
            {isUrgent && <Check className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </div>
  );
}



export function LocalSidebar() {
  const pathname = usePathname();
  const isLocalSidebarOpen = useAppStore((state) => state.isLocalSidebarOpen);

  let SidebarContent = null;
  if (pathname.startsWith("/tasks")) SidebarContent = <Suspense fallback={null}><TasksSidebar /></Suspense>;
  else if (pathname.startsWith("/docs")) SidebarContent = <DocsSidebar />;
  else if (pathname.startsWith("/chat")) SidebarContent = <Suspense fallback={null}><ChatSidebar /></Suspense>;

  // Nếu không có nội dung Local Sidebar cho route này, ẩn nó đi
  if (!SidebarContent) return null;

  return (
    <AnimatePresence initial={false}>
      {isLocalSidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-screen bg-[#F7F7F8] border-r border-gray-200/60 overflow-hidden shrink-0"
        >
          <div className="w-[260px] h-full">
            {SidebarContent}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
