"use client";

import React, { useState } from "react";
import { Video, Plus, Clock, Users, ExternalLink, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { useMeetings } from "../hooks/useMeetings";
import { CreateMeetingDialog } from "./CreateMeetingDialog";
import type { Meeting } from "../types";

function formatMeetingTime(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isFuture(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() > Date.now();
}

interface MeetingCardProps {
  meeting: Meeting;
}

function MeetingCard({ meeting }: MeetingCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="hover:shadow-md transition-shadow border-gray-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{meeting.title}</h3>
            </div>
            {isFuture(meeting.startTime) && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] px-1.5 py-0 shrink-0 ml-2">
                UPCOMING
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-sm text-gray-500">
            {meeting.startTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>{formatMeetingTime(meeting.startTime)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>{meeting.participants} participant{meeting.participants !== 1 ? "s" : ""}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex -space-x-1">
              <Avatar className="w-6 h-6 border-2 border-white">
                <AvatarFallback className="text-[9px] bg-gray-200 font-medium">
                  {meeting.organizerId.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            {isFuture(meeting.startTime) && (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-7 text-xs gap-1"
                disabled={!meeting.meetingUrl}
                onClick={() => {
                  if (meeting.meetingUrl) {
                    window.open(meeting.meetingUrl, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <Video className="w-3 h-3" /> Join
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function MeetingsPageClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const workspaceId = useAppStore((s) => s.activeWorkspaceId);
  const { data, isLoading, error } = useMeetings(workspaceId);

  const meetings = data?.data ?? [];

  const upcoming = meetings.filter((m) => isFuture(m.startTime));
  const past = meetings.filter((m) => !isFuture(m.startTime));

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-50 rounded-xl">
            <Calendar className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Meetings</h1>
            <p className="text-sm text-gray-500">
              {meetings.length} meeting{meetings.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Schedule Meeting
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-6 space-y-8">
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading meetings...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">Failed to load meetings</div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">No meetings scheduled</p>
            <p className="text-xs text-gray-400 mt-1">Schedule a meeting to get started</p>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" /> Upcoming ({upcoming.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcoming.map((m) => <MeetingCard key={m.id} meeting={m} />)}
                </div>
              </section>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 mb-4">Past ({past.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                  {past.map((m) => <MeetingCard key={m.id} meeting={m} />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      <CreateMeetingDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
