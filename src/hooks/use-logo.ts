"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { LogoType } from "@/components/brand/graphite-logo";

const STORAGE_KEY = "graphite-logo";

function getStored(): LogoType {
  if (typeof window === "undefined") return "hex-solid";
  return (localStorage.getItem(STORAGE_KEY) as LogoType) || "hex-solid";
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener("graphite-logo-change", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("graphite-logo-change", cb);
  };
}

export function useLogo() {
  const logo = useSyncExternalStore<LogoType>(subscribe, getStored, () => "hex-solid");

  const setLogo = useCallback((type: LogoType) => {
    localStorage.setItem(STORAGE_KEY, type);
    window.dispatchEvent(new Event("graphite-logo-change"));
  }, []);

  return [logo, setLogo] as const;
}
