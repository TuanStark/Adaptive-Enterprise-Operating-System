"use client";

import React, { useState } from "react";
import { X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Meeting } from "../types";

interface CreateMeetingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMeeting: (meeting: Meeting) => void;
}

export function CreateMeetingDialog({ isOpen, onClose, onCreateMeeting }: CreateMeetingDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || null,
      startTime: startTime || null,
      endTime: endTime || null,
      organizerId: "user-1",
      organizerName: "Tony Stark",
      participants: ["user-1"],
      meetingUrl: meetingUrl.trim() || null,
      createdAt: new Date().toISOString(),
    };

    onCreateMeeting(newMeeting);
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setMeetingUrl("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-50 rounded-lg">
              <Video className="w-4 h-4 text-cyan-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Schedule Meeting</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-pointer border-none bg-transparent">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Sprint Planning" className="h-9" required autoFocus />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda or notes for this meeting"
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Start time</label>
              <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-9" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">End time</label>
              <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-9" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Meeting URL</label>
            <Input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="https://meet.google.com/..." className="h-9" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90">Schedule Meeting</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
