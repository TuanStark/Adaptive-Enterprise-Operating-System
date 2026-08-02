"use client";

import { GlobalSidebar } from "./GlobalSidebar";
import { LocalSidebar } from "./LocalSidebar";
import { Header } from "./Header";
import { CommandPalette } from "./CommandPalette";
import { usePathname } from "next/navigation";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isChatRoute = pathname.startsWith("/chat");

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-slate-900 font-sans">
      <GlobalSidebar />
      <LocalSidebar />
      <div className="flex flex-col flex-1 min-w-0 bg-white relative">
        <Header />
        <main className={`flex-1 overflow-auto scroll-smooth ${isChatRoute ? "p-0" : "p-6"}`}>
          <div className="mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
