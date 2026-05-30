"use client";

import { useAuth } from "@/hooks/use-auth";
import { useSync } from "@/hooks/use-sync";
import { cn } from "@/lib/utils";

export function SyncIndicator() {
  const { user } = useAuth();
  const { syncStatus, lastSyncedAt } = useSync();

  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  if (!user) return null;

  const dotColor =
    syncStatus === "syncing"
      ? "bg-blue-400 animate-pulse"
      : syncStatus === "error"
        ? "bg-red-500"
        : isOffline
          ? "bg-amber-500"
          : "bg-green-500";

  const label =
    syncStatus === "syncing"
      ? "Syncing..."
      : syncStatus === "error"
        ? "Sync error"
        : isOffline
          ? "Offline"
          : lastSyncedAt
            ? `Synced ${formatTimeAgo(lastSyncedAt)}`
            : "Signed in";

  return (
    <div
      className="flex items-center gap-1.5"
      title={label}
    >
      <span className={cn("h-2 w-2 rounded-full", dotColor)} />
      <span className="hidden text-[10px] text-[var(--gp-text-faint)] md:inline">{label}</span>
    </div>
  );
}

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
