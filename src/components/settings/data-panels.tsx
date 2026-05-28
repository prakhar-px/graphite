"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { EXCEL_SOURCES } from "@/config/excel-sources";
import { getExcelMeta } from "@/lib/data-seed";
import { useAppStore } from "@/store/app-store";
import { useAuth } from "@/hooks/use-auth";
import { useSync } from "@/hooks/use-sync";
import { LeetCodePanel } from "@/components/settings/leetcode-panel";
import { PremiumCard } from "@/components/ui/premium-card";
import { Button } from "@/components/ui/button";

function SyncStatusSection() {
  const { user, signOut } = useAuth();
  const { syncStatus, lastSyncedAt } = useSync();
  const pushFullState = useAppStore((s) => s.pushFullState);
  const pullFromCloud = useAppStore((s) => s.pullFromCloud);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  if (!user) {
    return (
      <p className="text-sm text-zinc-400">
        Not signed in. Progress is stored locally only.
      </p>
    );
  }

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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${syncStatus === "syncing" ? "bg-blue-400 animate-pulse" : syncStatus === "error" ? "bg-red-500" : isOffline ? "bg-amber-500" : "bg-green-500"}`} />
        <span className={`text-sm ${statusColor}`}>{statusLabel}</span>
        {lastSyncedAt ? (
          <span className="text-xs text-zinc-500">· last synced {formatTimeAgo(lastSyncedAt)}</span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" title="Pull latest cloud data to this device" onClick={handleSyncNow}>
          Sync Now
        </Button>
        <Button type="button" size="sm" variant="outline" title="Upload this device's data to cloud backup" onClick={handlePushNow}>
          Push Local
        </Button>
        <Button type="button" size="sm" variant="outline" className="border-red-800/50 text-red-400 hover:border-red-500/80 hover:bg-red-950/30" title="Sign out from cloud sync (local data stays)" onClick={() => { signOut(); setStatusMsg("Signed out"); }}>
          Sign Out
        </Button>
      </div>
      {statusMsg ? <p className="text-sm text-zinc-400">{statusMsg}</p> : null}
      <p className="text-xs text-zinc-500">
        Signed in as {user.email}
      </p>
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

export function DataPanels() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const exportProgress = useAppStore((s) => s.exportProgress);
  const importProgress = useAppStore((s) => s.importProgress);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const seedMismatch = useAppStore((s) => s.seedMismatch);
  const acknowledgeSeed = useAppStore((s) => s.acknowledgeSeed);

  const meta = getExcelMeta();
  const activeKey = (meta.activeKey ?? "sample") as keyof typeof EXCEL_SOURCES;
  const active = EXCEL_SOURCES[activeKey] ?? EXCEL_SOURCES.sample;

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    const result = await importProgress(file);
    setMessage(result.message);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="max-w-2xl space-y-4">
      {seedMismatch ? (
        <PremiumCard className="border-amber-500/40 bg-amber-500/10">
          <p className="text-sm text-amber-100">
            Roadmap data changed (Excel re-parsed). Your saved progress may not
            match the new plan. Export a backup if needed, or reset progress.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 border-amber-500/40"
            onClick={() => acknowledgeSeed()}
          >
            Dismiss
          </Button>
        </PremiumCard>
      ) : null}

      <PremiumCard>
        <h3 className="font-semibold text-zinc-100">Sync Status</h3>
        <SyncStatusSection />
      </PremiumCard>

      <PremiumCard>
        <h3 className="font-semibold text-zinc-100">Progress backup (V1.2)</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Planner status, LeetCode problem log, tasks, and preferences are saved
          in your browser. Export before switching Excel files or clearing site
          data.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" title="Download a .json backup of all your data" onClick={() => exportProgress()}>
            Export progress
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            title="Restore data from a .json backup file"
            onClick={() => fileInputRef.current?.click()}
          >
            Import progress
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-red-800/50 text-red-400 hover:border-red-500/80 hover:bg-red-950/30"
            title="Wipe planner state back to the original roadmap"
            onClick={() => {
              if (
                window.confirm(
                  "Reset all progress to the current roadmap seed? This cannot be undone."
                )
              ) {
                resetProgress();
                setMessage("Progress reset to roadmap defaults.");
              }
            }}
          >
            Reset progress
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => handleImport(e.target.files?.[0])}
        />
        {message ? (
          <p className="mt-3 text-sm text-zinc-400">{message}</p>
        ) : null}
      </PremiumCard>

      <LeetCodePanel />

      <PremiumCard>
        <h3 className="font-semibold text-zinc-100">Excel sources</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Active:{" "}
          <span className="text-zinc-200">
            {active.label} ({meta.sourceFile})
          </span>
          {meta.parsedAt ? (
            <>
              <br />
              Last parsed:{" "}
              {format(new Date(meta.parsedAt), "yyyy-MM-dd HH:mm")}
            </>
          ) : null}
        </p>
        <ul className="mt-3 space-y-2 text-sm text-zinc-400">
          {Object.entries(EXCEL_SOURCES).map(([key, source]) => (
            <li key={key}>
              <code className="rounded bg-zinc-800 px-1 font-mono text-xs">
                npm run excel:{key}
              </code>{" "}
              — {source.label}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-zinc-500">
          After switching, restart{" "}
          <code className="rounded bg-zinc-800 px-1">npm run dev</code> and
          refresh. Config file:{" "}
          <code className="rounded bg-zinc-800 px-1">excel.config.json</code>
        </p>
      </PremiumCard>
    </div>
  );
}
