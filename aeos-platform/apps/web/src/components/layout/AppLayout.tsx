"use client";

import { GlobalSidebar } from "./GlobalSidebar";
import { LocalSidebar } from "./LocalSidebar";
import { Header } from "./Header";
import { CommandPalette } from "./CommandPalette";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-white overflow-hidden text-slate-900 font-sans">
      <GlobalSidebar />
      <LocalSidebar />
      <div className="flex flex-col flex-1 min-w-0 bg-white relative">
        <Header />
        <main className="flex-1 overflow-auto p-6 scroll-smooth">
          <div className="mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
