"use client";

import React, { useState } from "react";
import { Video, Plus, Clock, Users, ExternalLink, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import type { Meeting } from "../types";
import { CreateMeetingDialog } from "./CreateMeetingDialog";

// ── Mock Meetings ──
const mockMeetings: Meeting[] = [
  {
    id: "meeting-1",
    title: "Sprint Planning — Sprint 2",
    description: "Plan work items for the upcoming sprint. Review backlog and assign tasks.",
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString(),
    organizerId: "user-1",
    organizerName: "Tony Stark",
    participants: ["user-1", "user-2", "user-3", "user-4"],
    meetingUrl: "https://meet.google.com/abc-defg-hij",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "meeting-2",
    title: "Daily Standup",
    description: "Quick sync on blockers and progress.",
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 + 1000 * 60 * 60 * 9).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 + 1000 * 60 * 60 * 9.25).toISOString(),
    organizerId: "user-1",
    organizerName: "Tony Stark",
    participants: ["user-1", "user-2", "user-3"],
    meetingUrl: "https://meet.google.com/xyz-uvwx-yz",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "meeting-3",
    title: "Architecture Review",
    description: "Review microservices architecture and discuss CQRS implementation approach.",
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 73.5).toISOString(),
    organizerId: "user-3",
    organizerName: "Bruce Banner",
    participants: ["user-1", "user-2", "user-3"],
    meetingUrl: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "meeting-4",
    title: "Sprint 1 Retrospective",
    description: "Retrospective for Sprint 1 — what went well, what to improve.",
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString(),
    organizerId: "user-1",
    organizerName: "Tony Stark",
    participants: ["user-1", "user-2", "user-3", "user-4"],
    meetingUrl: "https://meet.google.com/old-meet-link",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
  },
];

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) + 
    " at " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function isUpcoming(meeting: Meeting): boolean {
  if (!meeting.startTime) return true;
  return new Date(meeting.startTime).getTime() > Date.now();
}

export function MeetingsPageClient() {
  const [meetings, setMeetings] = useState<Meeting[]>(mockMeetings);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const upcoming = meetings.filter(isUpcoming);
  const past = meetings.filter(m => !isUpcoming(m));

  const handleCreateMeeting = (meeting: Meeting) => {
    setMeetings(prev => [meeting, ...prev]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Meetings</h1>
          <p className="text-gray-500">Schedule and manage your team meetings.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Schedule Meeting
        </Button>
      </div>

      {/* Upcoming Meetings */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Upcoming
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs ml-1">{upcoming.length}</Badge>
        </h2>
        {upcoming.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-cyan-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming meetings</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm">Schedule a meeting to sync with your team.</p>
              <Button onClick={() => setIsDialogOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" /> Schedule Meeting
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((meeting, i) => (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.08 }}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{meeting.title}</h3>
                        {meeting.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{meeting.description}</p>
                        )}
                      </div>
                      <div className="p-1.5 bg-cyan-50 rounded-lg shrink-0 ml-3">
                        <Video className="w-4 h-4 text-cyan-600" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDateTime(meeting.startTime)}</span>
                        {meeting.endTime && <span className="text-gray-400">— {formatTime(meeting.endTime)}</span>}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>{meeting.participants.length} participants</span>
                        <span className="text-gray-400">· Organized by {meeting.organizerName}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex -space-x-1.5">
                        {meeting.participants.slice(0, 4).map((p, j) => (
                          <Avatar key={j} className="w-6 h-6 border-2 border-white">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${j + 1}`} />
                            <AvatarFallback className="text-[9px] bg-gray-200">{p.slice(-1)}</AvatarFallback>
                          </Avatar>
                        ))}
                        {meeting.participants.length > 4 && (
                          <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-medium text-gray-500">
                            +{meeting.participants.length - 4}
                          </div>
                        )}
                      </div>
                      {meeting.meetingUrl && (
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => window.open(meeting.meetingUrl!, "_blank")}>
                          <ExternalLink className="w-3 h-3" /> Join
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Past Meetings */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-600 mb-4 flex items-center gap-2">
            Past Meetings
            <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-200 text-xs ml-1">{past.length}</Badge>
          </h2>
          <div className="space-y-2">
            {past.map((meeting) => (
              <div key={meeting.id} className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-gray-100 rounded-lg">
                    <Video className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{meeting.title}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(meeting.startTime)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{meeting.participants.length} participants</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-400 border-gray-200 text-[10px]">ENDED</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CreateMeetingDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onCreateMeeting={handleCreateMeeting}
      />
    </div>
  );
}
