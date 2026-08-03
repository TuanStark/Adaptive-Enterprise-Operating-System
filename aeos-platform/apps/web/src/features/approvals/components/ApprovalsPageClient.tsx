"use client";

import React, { useState } from "react";
import { Shield, Check, X, ChevronDown, ChevronRight, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import type { Approval, ApprovalStatus } from "../types";

// ── Mock Approvals ──
const mockApprovals: Approval[] = [
  {
    id: "approval-1",
    title: "Production Deploy v2.1",
    status: "PENDING",
    requesterId: "user-3",
    requesterName: "Bruce Banner",
    entityType: "DEPLOYMENT",
    entityId: "deploy-v2.1",
    steps: [
      { reviewerId: "user-1", reviewerName: "Tony Stark", status: "PENDING", comment: null },
      { reviewerId: "user-2", reviewerName: "Peter Parker", status: "PENDING", comment: null },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "approval-2",
    title: "New API Gateway Configuration",
    status: "PENDING",
    requesterId: "user-2",
    requesterName: "Peter Parker",
    entityType: "CONFIG_CHANGE",
    entityId: "config-api-gw",
    steps: [
      { reviewerId: "user-1", reviewerName: "Tony Stark", status: "PENDING", comment: null },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "approval-3",
    title: "Database Schema Migration v5",
    status: "APPROVED",
    requesterId: "user-1",
    requesterName: "Tony Stark",
    entityType: "MIGRATION",
    entityId: "migration-v5",
    steps: [
      { reviewerId: "user-3", reviewerName: "Bruce Banner", status: "APPROVED", comment: "LGTM — schema changes are safe." },
      { reviewerId: "user-2", reviewerName: "Peter Parker", status: "APPROVED", comment: "Verified backwards compatibility." },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "approval-4",
    title: "Access to Production Logs",
    status: "REJECTED",
    requesterId: "user-4",
    requesterName: "Natasha Romanoff",
    entityType: "ACCESS_REQUEST",
    entityId: "access-prod-logs",
    steps: [
      { reviewerId: "user-1", reviewerName: "Tony Stark", status: "REJECTED", comment: "Requires additional security clearance." },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const statusConfig: Record<ApprovalStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700 border-amber-200" },
  APPROVED: { label: "Approved", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" },
};

export function ApprovalsPageClient() {
  const [approvals, setApprovals] = useState<Approval[]>(mockApprovals);
  const [activeTab, setActiveTab] = useState<"all" | ApprovalStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = activeTab === "all" ? approvals : approvals.filter(a => a.status === activeTab);

  const handleProcess = (approvalId: string, action: "APPROVE" | "REJECT") => {
    setApprovals(prev => prev.map(a => {
      if (a.id !== approvalId) return a;
      return {
        ...a,
        status: action === "APPROVE" ? "APPROVED" as const : "REJECTED" as const,
        steps: a.steps.map(s =>
          s.reviewerId === "user-1"
            ? { ...s, status: (action === "APPROVE" ? "APPROVED" : "REJECTED") as ApprovalStatus, comment: action === "APPROVE" ? "Approved" : "Rejected" }
            : s
        ),
      };
    }));
  };

  const tabs = [
    { key: "all" as const, label: "All", count: approvals.length },
    { key: "PENDING" as const, label: "Pending", count: approvals.filter(a => a.status === "PENDING").length },
    { key: "APPROVED" as const, label: "Approved", count: approvals.filter(a => a.status === "APPROVED").length },
    { key: "REJECTED" as const, label: "Rejected", count: approvals.filter(a => a.status === "REJECTED").length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Approvals</h1>
        <p className="text-gray-500">Review and manage approval requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100/80 p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all cursor-pointer border-none ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "bg-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-gray-400">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Approval List */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No approvals found</h3>
            <p className="text-sm text-gray-500">There are no approval requests in this category.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((approval, i) => {
            const isExpanded = expandedId === approval.id;
            const config = statusConfig[approval.status];

            return (
              <motion.div
                key={approval.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    {/* Main row */}
                    <div className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <button 
                          onClick={() => setExpandedId(isExpanded ? null : approval.id)}
                          className="p-0 border-none bg-transparent cursor-pointer text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <div className={`p-2 rounded-lg ${
                          approval.status === "PENDING" ? "bg-amber-50" : 
                          approval.status === "APPROVED" ? "bg-emerald-50" : "bg-red-50"
                        }`}>
                          <Shield className={`w-4 h-4 ${
                            approval.status === "PENDING" ? "text-amber-500" : 
                            approval.status === "APPROVED" ? "text-emerald-500" : "text-red-500"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{approval.title}</h3>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                            <span>Requested by {approval.requesterName}</span>
                            <span>·</span>
                            <span>{timeAgo(approval.createdAt)}</span>
                            <span>·</span>
                            <span className="text-gray-400">{approval.entityType.replace("_", " ")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`${config.className} text-xs`}>{config.label}</Badge>
                        {approval.status === "PENDING" && (
                          <div className="flex gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                              onClick={() => handleProcess(approval.id, "APPROVE")}
                            >
                              <Check className="w-3 h-3 mr-1" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => handleProcess(approval.id, "REJECT")}
                            >
                              <X className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-5 pb-4 border-t border-gray-100">
                        <div className="pt-4 space-y-3">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Approval Steps</p>
                          {approval.steps.map((step, j) => {
                            const stepConfig = statusConfig[step.status];
                            return (
                              <div key={j} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <Avatar className="h-7 w-7 mt-0.5">
                                  <AvatarImage src={`https://i.pravatar.cc/150?u=${j + 1}`} />
                                  <AvatarFallback className="text-[10px]">{step.reviewerName.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">{step.reviewerName}</span>
                                    <Badge variant="outline" className={`${stepConfig.className} text-[10px] px-1.5 py-0`}>{stepConfig.label}</Badge>
                                  </div>
                                  {step.comment && (
                                    <p className="text-xs text-gray-600 mt-1 italic">&ldquo;{step.comment}&rdquo;</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
