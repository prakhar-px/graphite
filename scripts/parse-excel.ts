import { addDays, format, getDay, parseISO } from "date-fns";
import * as fs from "fs";
import * as path from "path";
import * as xlsx from "xlsx";

const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "excel.config.json");
const DATA_DIR = path.join(ROOT, "src", "data");
const ROADMAP_START = parseISO("2026-05-27");
const DATE_FORMAT = "dd-MMM-yyyy";
const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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
    file: "Graphite_FAANG_Roadmap_Updated.xlsx",
    activeKey: "updated",
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

function parseQuestionList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map(String).map((s) => s.trim()).filter(Boolean);
  }
  const s = String(raw ?? "").trim();
  if (!s) return [];
  return s
    .split(/[,;|\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseDifficulty(raw: unknown): "easy" | "medium" | "hard" {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("hard")) return "hard";
  if (s.includes("medium") || s.includes("med")) return "medium";
  return "easy";
}

function defaultConfidenceForDifficulty(
  difficulty: "easy" | "medium" | "hard"
): number {
  if (difficulty === "easy") return 7;
  if (difficulty === "medium") return 6;
  return 5;
}

function parseRecommendedSolveCount(
  raw: unknown,
  dayType: "weekday" | "weekend"
): number {
  if (typeof raw === "number" && raw > 0 && raw <= 20) return Math.round(raw);

  const s = String(raw ?? "").toLowerCase();
  const range = s.match(/(\d+)\s*-\s*(\d+)/);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    return dayType === "weekend"
      ? Math.max(a, Math.round((a + b) / 2))
      : Math.min(a, 1);
  }

  const nums = s.match(/\d+/g)?.map(Number) ?? [];
  if (nums.length > 0) {
    if (dayType === "weekend") {
      return Math.max(2, Math.min(4, nums[nums.length - 1]));
    }
    return Math.min(1, nums[0]);
  }

  return dayType === "weekend" ? 3 : 1;
}

function parseSessionType(
  raw: unknown,
  dayType: "weekday" | "weekend",
  topic: string
): string {
  const explicit = String(raw ?? "").toLowerCase();
  if (explicit.includes("contest")) return "contest";
  if (explicit.includes("revision")) return "revision";
  if (explicit.includes("mixed")) return "mixed";
  if (explicit.includes("practice")) return "practice";
  if (explicit.includes("concept")) return "concept";
  if (dayType === "weekend") {
    const t = topic.toLowerCase();
    if (t.includes("contest") || t.includes("mock")) return "contest";
    if (t.includes("revision") || t.includes("re-solve")) return "revision";
    return "mixed";
  }
  return "concept";
}

function parseStatus(raw: unknown): "pending" | "in-progress" | "completed" {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("complete") || s.includes("done")) return "completed";
  if (s.includes("progress") || s.includes("partial") || s.includes("active"))
    return "in-progress";
  return "pending";
}

function parseDayType(raw: unknown): "weekday" | "weekend" | null {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("weekend") || s === "sat" || s === "sun") return "weekend";
  if (s.includes("weekday") || s.includes("week day")) return "weekday";
  return null;
}

function calendarForSequence(sequence: number, rowDayType?: "weekday" | "weekend" | null) {
  const date = addDays(ROADMAP_START, Math.max(0, sequence - 1));
  const dayIndex = getDay(date);
  const computed: "weekday" | "weekend" =
    dayIndex === 0 || dayIndex === 6 ? "weekend" : "weekday";
  const dayType = rowDayType ?? computed;

  return {
    actualDate: format(date, DATE_FORMAT),
    dayName: DAY_NAMES[dayIndex],
    dayType,
  };
}

function normalizeDailyPlan(rows: Record<string, unknown>[]) {
  return rows
    .filter((row) => {
      const seq = getField(row, "sequence", "day");
      const topic = getField(row, "topic");
      return seq !== "" || topic !== "";
    })
    .slice(0, 70)
    .map((row, index) => {
      const seqRaw = getField(row, "sequence", "day");
      const sequence =
        typeof seqRaw === "number"
          ? seqRaw
          : parseInt(String(seqRaw).replace(/\D/g, ""), 10) || index + 1;

      const rowDayType = parseDayType(
        getField(row, "daytype", "day type", "day_type")
      );
      const calendar = calendarForSequence(sequence, rowDayType);
      const dayNameFromRow = String(
        getField(row, "dayname", "day name") || calendar.dayName
      );
      const topic = String(getField(row, "topic") || "General");
      const subtopic = String(
        getField(row, "subtopic", "sub topic", "session focus") || topic
      );
      const difficulty = parseDifficulty(
        getField(row, "difficulty", "question difficulty")
      );
      const suggestedQuestions = parseQuestionList(
        getField(
          row,
          "suggestedquestions",
          "suggested questions",
          "suggested"
        )
      );
      const optionalQuestions = parseQuestionList(
        getField(row, "optionalquestions", "optional questions", "optional")
      );
      const estimatedHours = String(
        getField(row, "estimatedhours", "estimated hours", "time goal", "time") ||
          (calendar.dayType === "weekday" ? "1 Hour" : "2-4 Hours")
      );
      const solveRaw = getField(
        row,
        "recommendedsolvecount",
        "recommended solve count",
        "problems target",
        "problem target",
        "problems"
      );
      const recommendedSolveCount =
        typeof solveRaw === "number" && solveRaw > 0
          ? Math.round(solveRaw)
          : parseRecommendedSolveCount(solveRaw, calendar.dayType);
      const sessionType = parseSessionType(
        getField(row, "sessiontype", "session type"),
        calendar.dayType,
        topic
      );
      const defaultConfidenceRaw = getField(
        row,
        "defaultconfidence",
        "default confidence"
      );
      const defaultConfidence =
        typeof defaultConfidenceRaw === "number" && defaultConfidenceRaw > 0
          ? Math.round(defaultConfidenceRaw)
          : defaultConfidenceForDifficulty(difficulty);
      const learningGoal = String(
        getField(row, "learninggoal", "learning goal") ||
          `Master ${subtopic} for ${topic}`
      );
      const resourceFocus = String(
        getField(
          row,
          "resourcefocus",
          "resource focus",
          "recommended resource focus"
        ) || topic
      );
      const revisionFocus = String(
        getField(row, "revisionfocus", "revision focus", "notes", "note") || ""
      );
      const tasks =
        suggestedQuestions.length > 0
          ? suggestedQuestions
          : parseQuestionList(getField(row, "tasks", "task"));

      return {
        sequence,
        day: sequence,
        actualDate: calendar.actualDate,
        dayName: dayNameFromRow,
        dayType: calendar.dayType,
        topic,
        subtopic,
        suggestedQuestions,
        optionalQuestions,
        difficulty,
        learningGoal,
        resourceFocus,
        estimatedHours,
        recommendedSolveCount,
        sessionType,
        defaultConfidence,
        revisionFocus,
        status: parseStatus(getField(row, "status")),
        notes: revisionFocus,
        date: calendar.actualDate,
        tasks,
        problemTarget: recommendedSolveCount,
        timeGoal: estimatedHours,
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
  console.log(`Roadmap start: ${format(ROADMAP_START, DATE_FORMAT)}`);
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
    roadmapStartDate: format(ROADMAP_START, DATE_FORMAT),
    foundationSprintDays: 70,
    sheets: workbook.SheetNames,
  });
}

main();
