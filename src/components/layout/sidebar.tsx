"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2, LogOut, Target, User } from "lucide-react";
import { GraphiteLogo } from "@/components/brand/graphite-logo";
import { useLogo } from "@/hooks/use-logo";
import { mainNav } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useAuth } from "@/hooks/use-auth";
import { useSync } from "@/hooks/use-sync";
import { triggerAuthOverlay } from "@/components/auth/auth-gate";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const focusMode = useAppStore((state) => state.focusMode);
  const [logo] = useLogo();
  const toggleFocusMode = useAppStore((state) => state.toggleFocusMode);
  const { user, signOut } = useAuth();
  const { syncStatus } = useSync();

  const userName = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? null;
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col border-r",
        "bg-[var(--gp-surface)] border-[var(--gp-border)]",
        !className &&
          "hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:max-h-screen",
        className?.includes("h-full") && "h-full max-h-full",
        className,
      )}
    >
      <Link
        href="/"
        className="flex h-16 shrink-0 items-center gap-3 border-b px-5 transition-colors hover:bg-[var(--gp-surface-raised)]"
        style={{ borderColor: "var(--gp-border)" }}
      >
        <span className="mt-[-2px] flex shrink-0 items-center justify-center"><GraphiteLogo size={26} type={logo} /></span>
        <div>
          <p className="text-sm font-semibold tracking-tight text-[var(--gp-text)]">
            Graphite
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[var(--gp-text-faint)]">
            DSA Mission Control
          </p>
        </div>
      </Link>

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
                  ? "bg-violet-600/15 text-violet-600 dark:text-violet-300 shadow-[0_0_24px_rgba(124,58,237,0.12)]"
                  : "text-[var(--gp-text-muted)] hover:text-[var(--gp-text)] hover:bg-[var(--gp-surface-raised)]",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div
        className="mt-auto shrink-0 space-y-1 border-t p-4"
        style={{
          borderColor: "var(--gp-border)",
          backgroundColor: "var(--gp-surface)",
        }}
      >
        <button
          type="button"
          onClick={toggleFocusMode}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
            focusMode
              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.12)]"
              : "text-[var(--gp-text-muted)] hover:bg-[var(--gp-surface-raised)] hover:text-[var(--gp-text)]",
          )}
        >
          <Target className="h-4 w-4 shrink-0" />
          {focusMode ? "Focus Mode On" : "Focus Mode"}
        </button>
        <a
          href="https://github.com/prakhar-px/graphite"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--gp-text-muted)] transition-colors hover:bg-[var(--gp-surface-raised)] hover:text-[var(--gp-text)]"
        >
          <Code2 className="h-4 w-4" />
          GitHub
        </a>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--gp-surface-raised)]">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--gp-text-muted)] shrink-0 overflow-hidden"
                style={{ backgroundColor: "var(--gp-surface-raised)" }}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium">
                    {userName?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm text-[var(--gp-text)] truncate">
                  {userName}
                </p>
                <p className="text-xs text-[var(--gp-text-faint)]">
                  {syncStatus === "syncing"
                    ? "Syncing..."
                    : syncStatus === "error"
                      ? "Sync error"
                      : "Synced"}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              side="top"
              className="w-48"
              style={{
                backgroundColor: "var(--gp-surface-raised)",
                borderColor: "var(--gp-border)",
              }}
            >
              <DropdownMenuLabel style={{ color: "var(--gp-text-faint)" }}>
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator
                style={{ backgroundColor: "var(--gp-border)" }}
              />
              <DropdownMenuItem
                className="cursor-pointer text-[var(--gp-text-muted)] hover:!text-red-400 focus:!text-red-400"
                onClick={() => signOut()}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            type="button"
            onClick={() => triggerAuthOverlay()}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--gp-text-muted)] hover:bg-[var(--gp-surface-raised)] hover:text-[var(--gp-text)] transition-colors"
          >
            <User className="h-4 w-4 shrink-0" />
            Sign in to sync
          </button>
        )}
      </div>
    </aside>
  );
}
