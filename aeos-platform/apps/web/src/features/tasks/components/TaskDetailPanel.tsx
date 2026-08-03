"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Paperclip, CheckSquare, X } from "lucide-react";
import { CommentSection } from "./CommentSection";

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "activity" | "history">("comments");

  if (!taskId) return null;

  const tabs = [
    { key: "comments" as const, label: "Comments" },
    { key: "activity" as const, label: "Activity" },
    { key: "history" as const, label: "History" },
  ];

  return (
    <Sheet open={!!taskId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl w-full p-0 overflow-y-auto">
        <div className="flex flex-col h-full bg-white">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <CheckSquare className="w-4 h-4 text-primary" />
              <span>{taskId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MessageSquare className="w-4 h-4" /></Button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-50 p-1 -ml-1 rounded transition-colors">
                Implement CQRS Pattern
              </h2>
              <div className="flex gap-2 pt-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">IN PROGRESS</Badge>
                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">HIGH PRIORITY</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Assignee</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6"><AvatarImage src="https://i.pravatar.cc/150?u=2" /></Avatar>
                  <span className="text-sm font-medium text-gray-900">Peter Parker</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Reporter</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6"><AvatarImage src="https://github.com/shadcn.png" /></Avatar>
                  <span className="text-sm font-medium text-gray-900">Tony Stark</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-900 mb-2">Description</p>
              <div className="text-sm text-gray-700 space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p>We need to separate the read and write models to improve scalability.</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Implement Command Bus</li>
                  <li>Implement Query Bus</li>
                  <li>Setup Event Sourcing for audit logs</li>
                </ul>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex gap-1 mb-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer border-none ${
                      activeTab === tab.key
                        ? "bg-gray-900 text-white"
                        : "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "comments" && <CommentSection taskId={taskId} />}
              {activeTab === "activity" && (
                <div className="space-y-3">
                  {[
                    { action: "moved task to IN PROGRESS", user: "Peter Parker", time: "2h ago" },
                    { action: "assigned task to Peter Parker", user: "Tony Stark", time: "3h ago" },
                    { action: "created this task", user: "Tony Stark", time: "5h ago" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-1.5 h-1.5 mt-2 rounded-full bg-gray-300 shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900">{activity.user}</span>{" "}
                        <span className="text-gray-500">{activity.action}</span>
                        <p className="text-[11px] text-gray-400 mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "history" && (
                <div className="py-6 text-center text-sm text-gray-400">
                  No history available yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
