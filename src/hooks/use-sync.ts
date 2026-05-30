"use client";

import { useState, useEffect } from "react";
import type { SyncStatus } from "@/lib/sync/sync-engine";
import { onSyncStatusChange, getLastSyncedAt } from "@/lib/sync/sync-engine";

export function useSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(getLastSyncedAt());

  useEffect(() => {
    const unsub = onSyncStatusChange((status) => {
      setSyncStatus(status);
      if (status === "idle") {
        setLastSyncedAt(getLastSyncedAt());
      }
    });
    return () => unsub();
  }, []);

  return { syncStatus, lastSyncedAt };
}
