import * as fs from "fs";
import * as path from "path";
import * as xlsx from "xlsx";

const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "excel.config.json");
const DATA_DIR = path.join(ROOT, "src", "data");

type ExcelConfig = {
  active: string;
  sources: Record<string, { file: string; label: string }>;
};

function loadConfig(): ExcelConfig | null {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8")) as ExcelConfig;
}

function resolveExcelFile(): { file: string; activeKey: string | null } {
  const fromEnv = process.env.EXCEL_FILE;
  if (fromEnv) {
    return { file: fromEnv, activeKey: null };
  }

  const config = loadConfig();
  if (config?.sources[config.active]) {
    return {
      file: config.sources[config.active].file,
      activeKey: config.active,
    };
  }

  return {
    file: "FAANG_DSA_Master_Roadmap_v2_sample.xlsx",
    activeKey: "sample",
  };
}

const { file: EXCEL_FILE, activeKey } = resolveExcelFile();
const EXCEL_PATH = path.join(ROOT, EXCEL_FILE);

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filename: string, data: unknown) {
  fs.writeFileSync(
    path.join(DATA_DIR, filename),
    JSON.stringify(data, null, 2),
    "utf-8"
  );
}

function parseProblemTarget(raw: unknown): number {
  if (typeof raw === "number" && raw > 0 && raw <= 50) return raw;
  const s = String(raw ?? "").trim();
  const range = s.match(/(\d+)\s*-\s*(\d+)/);
  if (range) {
    return Math.round((Number(range[1]) + Number(range[2])) / 2);
  }
  const n = parseInt(s.replace(/\D/g, ""), 10);
  if (n > 0 && n <= 50) return n;
  return 10;
}

function parseStatus(raw: unknown): "pending" | "in-progress" | "completed" {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("complete") || s.includes("done")) return "completed";
  if (s.includes("progress") || s.includes("partial") || s.includes("active"))
    return "in-progress";
  return "pending";
}

function parseTasks(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/[,;|\n]/)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return ["Study concepts", "Solve problems", "Revise notes"];
}

function getField(row: Record<string, unknown>, ...names: string[]): unknown {
  for (const name of names) {
    const exact = row[name];
    if (exact !== "" && exact !== undefined && exact !== null) return exact;
  }
  for (const key of Object.keys(row)) {
    const lower = key.toLowerCase().trim();
    if (
      names.some(
        (n) => lower === n.toLowerCase() || lower.includes(n.toLowerCase())
      )
    ) {
      const val = row[key];
      if (val !== "" && val !== undefined && val !== null) return val;
    }
  }
  return "";
}

function normalizeDailyPlan(rows: Record<string, unknown>[]) {
  return rows
    .filter((row) => {
      const day = getField(row, "day");
      const topic = getField(row, "topic");
      return day !== "" || topic !== "";
    })
    .map((row, index) => {
      const dayRaw = getField(row, "day");
      const day =
        typeof dayRaw === "number"
          ? dayRaw
          : parseInt(String(dayRaw).replace(/\D/g, ""), 10) || index + 1;

      return {
        day,
        date: String(getField(row, "date") || ""),
        topic: String(getField(row, "topic") || "General"),
        subtopic: String(getField(row, "subtopic", "sub topic") || ""),
        tasks: parseTasks(getField(row, "tasks", "task")),
        problemTarget: parseProblemTarget(
          getField(row, "problems target", "problem target", "problems")
        ),
        timeGoal: String(getField(row, "time goal", "time") || "8h"),
        notes: String(getField(row, "notes", "note") || ""),
        status: parseStatus(getField(row, "status")),
      };
    });
}

function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`Excel file not found: ${EXCEL_PATH}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(EXCEL_PATH);
  console.log(`Parsing: ${EXCEL_FILE}`);
  if (activeKey) console.log(`Source key: ${activeKey}`);
  console.log("Sheets:", workbook.SheetNames);

  ensureDir(DATA_DIR);

  const sheetMap: Record<string, string> = {
    Dashboard: "dashboard.json",
    "Master Plan": "master-plan.json",
    "Daily DSA Plan": "daily-plan.json",
    "Revision Tracker": "revision-tracker.json",
    "Company Prep": "company-prep.json",
    "Mistake Log": "mistake-log.json",
    "Weekly Review": "weekly-review.json",
  };

  let dailyPlanLength = 0;

  for (const [sheetName, filename] of Object.entries(sheetMap)) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      console.warn(`Sheet not found: ${sheetName}`);
      continue;
    }
    const data = xlsx.utils.sheet_to_json(sheet, { defval: "" }) as Record<
      string,
      unknown
    >[];
    if (sheetName === "Daily DSA Plan") {
      const normalized = normalizeDailyPlan(data);
      dailyPlanLength = normalized.length;
      writeJson(filename, normalized);
    } else {
      writeJson(filename, data);
    }
    console.log(`Wrote ${filename} (${data.length} rows)`);
  }

  writeJson("meta.json", {
    parsedAt: new Date().toISOString(),
    sourceFile: EXCEL_FILE,
    activeKey,
    dayCount: dailyPlanLength,
    sheets: workbook.SheetNames,
  });
}

main();
