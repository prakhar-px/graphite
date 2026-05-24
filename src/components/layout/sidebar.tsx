"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, Sparkles, Target, User } from "lucide-react";
import { mainNav } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const focusMode = useAppStore((state) => state.focusMode);
  const toggleFocusMode = useAppStore((state) => state.toggleFocusMode);

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col border-r border-zinc-800/80 bg-[#111113]",
        !className && "hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:max-h-screen",
        className?.includes("h-full") && "h-full max-h-full",
        className
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800/80 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600/20 text-violet-400">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-zinc-100">
            Graphite
          </p>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500">
            DSA Mission Control
          </p>
        </div>
      </div>

      <nav className="graphite-scrollbar-inset min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-4 pr-3">
        {mainNav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-violet-600/15 text-violet-300 shadow-[0_0_24px_rgba(124,58,237,0.15)]"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 space-y-1 border-t border-zinc-800/80 bg-[#111113] p-4">
        <button
          type="button"
          onClick={toggleFocusMode}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
            focusMode
              ? "bg-emerald-500/20 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.12)]"
              : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
          )}
        >
          <Target className="h-4 w-4 shrink-0" />
          {focusMode ? "Focus Mode On" : "Focus Mode"}
        </button>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200"
        >
          <Code2 className="h-4 w-4" />
          GitHub
        </a>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm text-zinc-200">Engineer</p>
            <p className="text-xs text-zinc-500">Elite Mode</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
