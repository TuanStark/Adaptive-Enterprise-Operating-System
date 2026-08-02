"use client";

import { Bell, Search, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
  const toggleLocalSidebar = useAppStore((state) => state.toggleLocalSidebar);
  const pathname = usePathname();

  // Show toggle only if we are in a route that has a local sidebar
  const hasLocalSidebar = pathname.startsWith("/tasks") || pathname.startsWith("/docs") || pathname.startsWith("/chat");

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200/60 sticky top-0 z-10">
      <div className="flex items-center gap-3 flex-1">
        {hasLocalSidebar && (
          <Button variant="ghost" size="icon" onClick={toggleLocalSidebar} className="text-gray-500 hover:text-gray-900 hidden md:flex h-8 w-8">
            <Menu className="w-4 h-4" />
          </Button>
        )}
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search across workspace (Cmd+K)" 
            className="pl-8 bg-gray-100/50 border-transparent hover:border-gray-200 focus-visible:ring-primary/20 focus-visible:bg-white h-8 rounded-md text-sm transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative text-gray-500 hover:text-gray-900">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border border-white"></span>
        </Button>
        <div className="h-8 w-px bg-gray-200 mx-2"></div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-900">Tony Stark</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>TS</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
