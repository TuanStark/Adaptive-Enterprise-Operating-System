"use client";

import { Bold, Italic, Link2, List, Code, Paperclip, Smile, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessageInput() {
  return (
    <div className="px-4 pb-6 pt-2 shrink-0 bg-white">
      <div className="border border-gray-300 rounded-lg shadow-sm focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-all bg-white overflow-hidden">
        <div className="flex items-center gap-1 bg-gray-50/80 px-2 py-1.5 border-b border-gray-200">
          <button className="p-1 text-gray-500 hover:bg-gray-200 rounded"><Bold className="w-4 h-4" /></button>
          <button className="p-1 text-gray-500 hover:bg-gray-200 rounded"><Italic className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-gray-300 mx-1"></div>
          <button className="p-1 text-gray-500 hover:bg-gray-200 rounded"><Link2 className="w-4 h-4" /></button>
          <button className="p-1 text-gray-500 hover:bg-gray-200 rounded"><List className="w-4 h-4" /></button>
          <button className="p-1 text-gray-500 hover:bg-gray-200 rounded"><Code className="w-4 h-4" /></button>
        </div>

        <div className="p-2 min-h-[60px]">
          <textarea
            placeholder="Message #general"
            className="w-full h-full min-h-[40px] resize-none outline-none text-[15px] bg-transparent placeholder:text-gray-500"
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = "auto";
              target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
            }}
          />
        </div>

        <div className="flex items-center justify-between px-2 py-1.5 bg-white">
          <div className="flex items-center gap-1">
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"><Plus className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"><Paperclip className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full"><Smile className="w-4 h-4" /></button>
          </div>
          <div className="flex items-center">
            <Button size="icon" className="h-7 w-7 rounded bg-emerald-600 hover:bg-emerald-700 text-white">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Plus icon since it wasn't imported at top
function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
