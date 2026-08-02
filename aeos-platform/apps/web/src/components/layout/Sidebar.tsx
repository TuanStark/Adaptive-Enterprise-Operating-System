"use client";

import Link from "next/link";
import { LayoutDashboard, CheckSquare, Folder, FileText, Settings, Users } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Projects", href: "/projects", icon: Folder },
  { name: "Documents", href: "/docs", icon: FileText },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 240 : 80 }}
      className="h-screen bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col transition-all duration-300 relative z-20"
    >
      <div className="h-16 flex items-center justify-center border-b border-gray-200/50">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
            A
          </div>
          {isSidebarOpen && <span className="tracking-tight">AEOS</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-gray-600 hover:bg-gray-100/80 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-gray-500 group-hover:text-gray-900")} />
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>
    </motion.aside>
  );
}
