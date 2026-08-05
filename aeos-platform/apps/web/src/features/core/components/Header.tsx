"use client";

import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NotificationPanel } from "@/features/notifications/components/NotificationPanel";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";

export function Header() {
  const toggleLocalSidebar = useAppStore((state) => state.toggleLocalSidebar);
  const setCommandPaletteOpen = useAppStore((state) => state.setCommandPaletteOpen);
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = session?.user?.name || "User";
  const userRole = session?.user?.role || "USER";
  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const hasLocalSidebar = pathname.startsWith("/tasks") || pathname.startsWith("/docs") || pathname.startsWith("/chat");

  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white border-b border-gray-200/60 sticky top-0 z-10">
      <div className="flex items-center gap-3 flex-1">
        {hasLocalSidebar && (
          <Button variant="ghost" size="icon" onClick={toggleLocalSidebar} className="text-gray-500 hover:text-gray-900 hidden md:flex h-8 w-8">
            <Menu className="w-4 h-4" />
          </Button>
        )}
        <div className="relative max-w-md w-full hidden md:block" onClick={() => setCommandPaletteOpen(true)}>
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search across workspace (Cmd+K)"
            readOnly
            className="pl-8 bg-gray-100/50 border-transparent hover:border-gray-200 focus-visible:ring-primary/20 focus-visible:bg-white h-8 rounded-md text-sm transition-all cursor-pointer"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NotificationPanel />

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 pr-2 rounded-md transition-colors border-none bg-transparent focus:outline-none text-left">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
              <Avatar className="h-9 w-9 border border-gray-200 shadow-sm">
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </button>
          } />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings/profile" />}>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings" />}>Workspace Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => signOut({ callbackUrl: "/login" })}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
