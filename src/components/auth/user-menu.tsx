"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LogOut, User, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useSync } from "@/hooks/use-sync";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { syncStatus } = useSync();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, handleClickOutside]);

  if (!user) return null;

  const email = user.email ?? "User";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
        title={email}
      >
        {initials}
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
          <div className="border-b border-zinc-800 px-3 py-2">
            <p className="text-sm text-zinc-200 truncate">{email}</p>
            <p className="text-xs text-zinc-500">
              {syncStatus === "syncing"
                ? "Syncing..."
                : syncStatus === "error"
                  ? "Sync error"
                  : "Connected"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-zinc-900"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      ) : null}
    </div>
  );
}
