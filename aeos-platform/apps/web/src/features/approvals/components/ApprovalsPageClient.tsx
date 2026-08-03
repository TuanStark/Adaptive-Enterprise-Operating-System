"use client";

import { useState } from "react";
import { Shield, Check, X, ChevronDown, ChevronRight, Clock, User } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useApprovals, useProcessApproval } from "../hooks/useApprovals";
import type { Approval, ApprovalStatus } from "../types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
};

interface ApprovalCardProps {
  approval: Approval;
  onProcess: (approvalId: string, action: "APPROVE" | "REJECT") => void;
  isProcessing: boolean;
}

function ApprovalCard({ approval, onProcess, isProcessing }: ApprovalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = STATUS_CONFIG[approval.status];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm">{approval.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <User className="w-3 h-3" />
                <span>{approval.requesterId}</span>
                <span>·</span>
                <Clock className="w-3 h-3" />
                <span>{timeAgo(approval.createdAt)}</span>
              </div>
            </div>
            <Badge className={`${config.className} text-[10px] px-1.5 py-0 shrink-0 ml-2`}>
              {config.label}
            </Badge>
          </div>

          {/* Expandable steps */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-3 cursor-pointer bg-transparent border-none p-0"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {approval.steps.length} reviewer{approval.steps.length !== 1 ? "s" : ""}
          </button>

          {expanded && (
            <div className="space-y-2 mb-3 pl-2 border-l-2 border-gray-100">
              {approval.steps.map((step, i) => {
                const stepConfig = STATUS_CONFIG[step.status];
                return (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-[8px] bg-gray-200 font-medium">
                          {step.reviewerId.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-gray-700">{step.reviewerId}</span>
                    </div>
                    <Badge className={`${stepConfig.className} text-[9px] px-1 py-0`}>{stepConfig.label}</Badge>
                  </div>
                );
              })}
            </div>
          )}

          {/* Actions */}
          {approval.status === "PENDING" && (
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <Button
                size="sm"
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 flex-1"
                onClick={() => onProcess(approval.id, "APPROVE")}
                disabled={isProcessing}
              >
                <Check className="w-3 h-3 mr-1" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 flex-1"
                onClick={() => onProcess(approval.id, "REJECT")}
                disabled={isProcessing}
              >
                <X className="w-3 h-3 mr-1" /> Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ApprovalsPageClient() {
  const [activeFilter, setActiveFilter] = useState<"ALL" | ApprovalStatus>("ALL");
  const workspaceId = useAppStore((s) => s.activeWorkspaceId);
  const { data, isLoading, error } = useApprovals(workspaceId);
  const processApproval = useProcessApproval();

  const approvals = data?.data ?? [];

  const filtered = activeFilter === "ALL"
    ? approvals
    : approvals.filter((a) => a.status === activeFilter);

  const handleProcess = (approvalId: string, action: "APPROVE" | "REJECT") => {
    processApproval.mutate({ approvalId, action });
  };

  const tabs: { key: "ALL" | ApprovalStatus; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "Pending" },
    { key: "APPROVED", label: "Approved" },
    { key: "REJECTED", label: "Rejected" },
  ];

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-50 rounded-xl">
            <Shield className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Approvals</h1>
            <p className="text-sm text-gray-500">
              {approvals.filter((a) => a.status === "PENDING").length} pending review
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-8 py-3 border-b border-gray-100 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer border-none ${activeFilter === tab.key
              ? "bg-gray-900 text-white"
              : "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading approvals...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">Failed to load approvals</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">No approvals found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
            {filtered.map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onProcess={handleProcess}
                isProcessing={processApproval.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
