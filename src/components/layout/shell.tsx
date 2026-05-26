"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { GlobalLogAction } from "@/components/problems/global-log-action";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface ShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

function FocusModeFromQuery() {
  const searchParams = useSearchParams();
  const setFocusMode = useAppStore((state) => state.setFocusMode);

  useEffect(() => {
    if (searchParams.get("focus") === "true") {
      setFocusMode(true);
    }
  }, [searchParams, setFocusMode]);

  return null;
}

export function Shell({ children, title, subtitle }: ShellProps) {
  const focusMode = useAppStore((state) => state.focusMode);

  return (
    <div
      className={cn(
        "flex min-h-screen bg-[#09090B] text-zinc-100",
        focusMode && "[&_main>div]:transition-opacity [&_main>div]:duration-200"
      )}
    >
      <Sidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Suspense fallback={null}>
          <FocusModeFromQuery />
        </Suspense>
        <Navbar title={title} subtitle={subtitle} />
        <main className="graphite-scrollbar-inset flex-1 overflow-y-auto">{children}</main>
        <GlobalLogAction />
      </div>
    </div>
  );
}
