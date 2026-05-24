import dailyPlan from "@/data/daily-plan.json";
import meta from "@/data/meta.json";

/** Changes when Excel is re-parsed — used to detect roadmap swaps */
export function getDataSeedId(): string {
  const source = meta.sourceFile ?? "unknown";
  const parsedAt = meta.parsedAt ?? "";
  const activeKey =
    "activeKey" in meta && typeof meta.activeKey === "string"
      ? meta.activeKey
      : "";
  return `${activeKey || source}::${dailyPlan.length}::${dailyPlan[0]?.day ?? 0}::${parsedAt}`;
}

export function getExcelMeta() {
  return {
    sourceFile: meta.sourceFile ?? "—",
    parsedAt: meta.parsedAt ?? null,
    activeKey:
      "activeKey" in meta && typeof meta.activeKey === "string"
        ? meta.activeKey
        : null,
    sheets: Array.isArray(meta.sheets) ? meta.sheets : [],
  };
}
