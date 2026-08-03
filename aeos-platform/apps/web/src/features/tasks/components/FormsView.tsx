"use client";

import React, { useState } from "react";
import { ClipboardList, Plus, FileText, BarChart2, ToggleLeft, ToggleRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useForms } from "../hooks/useForms";
import { CreateFormDialog } from "./CreateFormDialog";
import type { DynamicForm } from "../types/form";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

interface FormCardProps {
  form: DynamicForm;
}

function FormCard({ form }: FormCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:shadow-md transition-shadow border-gray-200 cursor-pointer group">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-violet-50 rounded-lg group-hover:bg-violet-100 transition-colors">
                <FileText className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{form.name}</h3>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-400">
                  <Clock className="w-3 h-3" /> {timeAgo(form.createdAt)}
                </div>
              </div>
            </div>
            {form.isActive ? (
              <ToggleRight className="w-5 h-5 text-emerald-500 shrink-0 mt-1" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-gray-300 shrink-0 mt-1" />
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <BarChart2 className="w-3.5 h-3.5" /> {form.submissionsCount} submissions
            </div>
            <Badge className={`text-[10px] px-1.5 py-0 ${form.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
              {form.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function FormsView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const workspaceId = useAppStore((s) => s.activeWorkspaceId);
  const { data, isLoading, error } = useForms(workspaceId);

  const forms = data?.data ?? [];

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-50 rounded-xl">
            <ClipboardList className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Forms</h1>
            <p className="text-sm text-gray-500">{forms.length} form{forms.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Create Form
        </Button>
      </div>

      <div className="flex-1 px-8 py-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading forms...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">Failed to load forms</div>
        ) : forms.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ClipboardList className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">No forms yet</p>
            <p className="text-xs text-gray-400 mt-1">Create a form to start collecting data</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
            {forms.map((form) => (
              <FormCard key={form.id} form={form} />
            ))}
          </div>
        )}
      </div>

      <CreateFormDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
