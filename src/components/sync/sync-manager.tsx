"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/store/app-store";
import { isOnline } from "@/lib/sync/sync-engine";

export function SyncManager() {
  const { user } = useAuth();
  const pullFromCloud = useAppStore((s) => s.pullFromCloud);
  const pushFullState = useAppStore((s) => s.pushFullState);
  const lastSyncedAt = useAppStore((s) => s.lastSyncedAt);
  const initialized = useRef(false);

  useEffect(() => {
    if (!user) {
      initialized.current = false;
      return;
    }
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      if (!isOnline()) return;
      const hasCloudData = await pullFromCloud();
      if (!hasCloudData) {
        await pushFullState();
      }
    };
    init();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    const handleVisibility = () => {
      if (document.visibilityState === "visible" && isOnline()) {
        pullFromCloud();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [user?.id]);

  return null;
}
