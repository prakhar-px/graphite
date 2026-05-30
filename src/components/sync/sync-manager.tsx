"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/store/app-store";
import { isOnline } from "@/lib/sync/sync-engine";
import { syncQueue } from "@/lib/sync/sync-queue";
import { getSupabaseClient } from "@/lib/supabase/client";

export function SyncManager() {
  const { user } = useAuth();
  const pullFromCloud = useAppStore((s) => s.pullFromCloud);
  const pushFullState = useAppStore((s) => s.pushFullState);
  const clearLocalState = useAppStore((s) => s.clearLocalState);
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
      clearLocalState();
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

  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      syncQueue.flushImmediate();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;

    const supabase = getSupabaseClient();
    const pull = () => { useAppStore.getState().pullFromCloud(); };

    const channel = supabase
      .channel("graphite-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "planner_day_status", filter: `user_id=eq.${user.id}` },
        pull
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "problem_log", filter: `user_id=eq.${user.id}` },
        pull
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
        pull
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  return null;
}
