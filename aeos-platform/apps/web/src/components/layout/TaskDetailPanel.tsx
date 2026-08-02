"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Paperclip, CheckSquare, X } from "lucide-react";

interface TaskDetailPanelProps {
  taskId: string | null;
  onClose: () => void;
}

export function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  if (!taskId) return null;

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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
