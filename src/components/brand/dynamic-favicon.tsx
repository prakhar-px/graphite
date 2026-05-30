"use client";

import { useEffect } from "react";
import type { LogoType } from "@/components/brand/graphite-logo";

const faviconPaths: Record<string, string> = {
  "hex-solid": "/favicon.svg",
  g: "/favicon-g.svg",
};

export function DynamicFavicon() {
  useEffect(() => {
    function update() {
      const logo = localStorage.getItem("graphite-logo") || "hex-solid";
      const path = faviconPaths[logo] || "/favicon.svg";
      for (const link of document.querySelectorAll<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut"]')) {
        link.href = path;
      }
    }
    update();
    window.addEventListener("graphite-logo-change", update);
    return () => window.removeEventListener("graphite-logo-change", update);
  }, []);

  return null;
}
