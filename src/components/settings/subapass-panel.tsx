"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSync } from "@/hooks/use-sync";
import { useAppStore } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";
import { Button } from "@/components/ui/button";

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function SubapassPanel() {
  const { user, signOut, signInWithGoogle } = useAuth();
  const { syncStatus, lastSyncedAt } = useSync();
  const pushFullState = useAppStore((s) => s.pushFullState);
  const pullFromCloud = useAppStore((s) => s.pullFromCloud);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  const statusColor =
    syncStatus === "syncing" ? "text-blue-400" :
    syncStatus === "error" ? "text-red-400" :
    isOffline ? "text-amber-400" :
    "text-green-400";

  const statusLabel =
    syncStatus === "syncing" ? "Syncing..." :
    syncStatus === "error" ? "Error" :
    isOffline ? "Offline" :
    "Connected";

  const handleSyncNow = async () => {
    setStatusMsg("Pulling latest from cloud...");
    await pullFromCloud();
    setStatusMsg("Synced!");
    setTimeout(() => setStatusMsg(null), 2000);
  };

  const handlePushNow = async () => {
    setStatusMsg("Pushing local data to cloud...");
    await pushFullState();
    setStatusMsg("Uploaded!");
    setTimeout(() => setStatusMsg(null), 2000);
  };

  if (!user) {
    return (
      <PremiumCard>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-zinc-100">Subapass Database</h3>
            <p className="text-sm text-zinc-400">
              Sign in to sync your planner, problem log, and preferences across
              devices via Supabase cloud storage.
            </p>
          </div>
          <Button type="button" size="sm" onClick={signInWithGoogle}>
            Sign in with Google
          </Button>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-zinc-100">Subapass Database</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Signed in as {user.email}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                syncStatus === "syncing"
                  ? "bg-blue-400 animate-pulse"
                  : syncStatus === "error"
                    ? "bg-red-500"
                    : isOffline
                      ? "bg-amber-500"
                      : "bg-green-500"
              }`}
            />
            <span className={`text-sm ${statusColor}`}>{statusLabel}</span>
            {lastSyncedAt ? (
              <span className="text-xs text-zinc-500">
                · last synced {formatTimeAgo(lastSyncedAt)}
              </span>
            ) : null}
          </div>
        </div>

        <p className="text-sm text-zinc-400">
          Your data is stored in a Supabase PostgreSQL database. Any changes you
          make on this device are automatically synced to the cloud.
        </p>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            title="Pull latest cloud data to this device"
            onClick={handleSyncNow}
          >
            Sync Now
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            title="Upload this device's data to cloud backup"
            onClick={handlePushNow}
          >
            Push Local
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-red-800/50 text-red-400 hover:border-red-500/80 hover:bg-red-950/30"
            title="Sign out from cloud sync (local data stays)"
            onClick={() => {
              signOut();
              setStatusMsg("Signed out");
            }}
          >
            Sign Out
          </Button>
        </div>

        {statusMsg ? (
          <p className="text-sm text-zinc-400">{statusMsg}</p>
        ) : null}
      </div>
    </PremiumCard>
  );
}
