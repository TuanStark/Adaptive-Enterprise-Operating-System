"use client";

import Link from "next/link";
import { LayoutDashboard, CheckSquare, Folder, FileText, Settings, Users, MessageSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const globalNavItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Docs", href: "/docs", icon: FileText },
  { name: "Projects", href: "/projects", icon: Folder },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function GlobalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-16 h-screen bg-[#1E1F22] flex flex-col items-center py-4 border-r border-[#1E1F22] z-30 shrink-0">
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg mb-6 shadow-md shadow-primary/20">
        A
      </div>

      <div className="flex-1 flex flex-col gap-3 w-full px-2">
        {globalNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative group flex justify-center"
            >
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-[14px] transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-gray-400 hover:bg-[#2B2D31] hover:text-gray-100 hover:rounded-[10px]"
                )}
              >
                <item.icon className="w-5 h-5" />
              </div>
              
              {/* Tooltip */}
              <div className="absolute left-14 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.name}
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-md"></div>
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="mt-auto px-2 w-full flex justify-center pb-2">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-gray-800 cursor-pointer hover:opacity-90 transition-opacity"></div>
      </div>
    </aside>
  );
}
