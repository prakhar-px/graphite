import { cn } from "@/lib/utils";

type ToneBadgeProps = {
  children: React.ReactNode;
  tone?: "violet" | "blue" | "green" | "amber" | "red" | "zinc";
  className?: string;
};

const tones = {
  violet: "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-200",
  blue: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-200",
  green: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200",
  amber: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200",
  red: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-200",
  zinc: "border-[var(--gp-border)] bg-[var(--gp-surface)] text-[var(--gp-text-muted)]",
};

export function ToneBadge({ children, tone = "zinc", className }: ToneBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl border px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
