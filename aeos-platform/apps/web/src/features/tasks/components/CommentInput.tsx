"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface CommentInputProps {
  onSubmit: (content: string) => void;
  isSubmitting: boolean;
}

export function CommentInput({ onSubmit, isSubmitting }: CommentInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
      <Avatar className="h-7 w-7 mt-1 shrink-0">
        <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600 font-medium">U</AvatarFallback>
      </Avatar>
      <div className="flex-1 relative">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a comment... (Enter to send)"
          rows={2}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pr-10 resize-none bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-gray-400"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1.5 bottom-1.5 h-7 w-7 text-primary hover:text-primary/80 hover:bg-primary/10 disabled:opacity-30"
          onClick={handleSubmit}
          disabled={!value.trim() || isSubmitting}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
