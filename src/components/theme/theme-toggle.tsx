"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        "text-[var(--gp-text-muted)] hover:text-[var(--gp-text)]",
        "hover:bg-[var(--gp-surface-raised)]",
        className
      )}
      aria-label="Toggle theme"
    >
      <Sun
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          theme === "dark"
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 rotate-90 opacity-0"
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all duration-300",
          theme === "light"
            ? "scale-100 rotate-0 opacity-100"
            : "scale-50 -rotate-90 opacity-0"
        )}
      />
    </button>
  );
}
