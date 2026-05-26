/**
 * Aligns Daily DSA Plan with weekday/weekend rules + mission columns.
 * Run: npx tsx scripts/sync-excel-roadmap.ts
 */
import { addDays, format, getDay, parseISO } from "date-fns";
import * as fs from "fs";
import * as path from "path";
import * as xlsx from "xlsx";

const ROOT = path.resolve(__dirname, "..");
const EXCEL_FILE = "Graphite_FAANG_Roadmap_Updated.xlsx";
const EXCEL_PATH = path.join(ROOT, EXCEL_FILE);
const ROADMAP_START = parseISO("2026-05-27");
const SHEET = "Daily DSA Plan";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function defaultConfidence(difficulty: string): number {
  const d = difficulty.toLowerCase();
  if (d.includes("hard")) return 5;
  if (d.includes("medium")) return 6;
  return 7;
}

function sessionFor(dayType: string, topic: string, subtopic: string): string {
  const text = `${topic} ${subtopic}`.toLowerCase();
  if (dayType === "weekend") {
    if (text.includes("contest") || text.includes("mock")) return "contest";
    if (text.includes("revision") || text.includes("re-solve")) return "revision";
    return "mixed";
  }
  return "concept";
}

function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`Missing ${EXCEL_PATH}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(EXCEL_PATH);
  const sheet = workbook.Sheets[SHEET];
  if (!sheet) {
    console.error(`Sheet not found: ${SHEET}`);
    process.exit(1);
  }

  const rows = xlsx.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  let updated = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const dayRaw = row.Day ?? row.day ?? row.Sequence ?? row.sequence;
    const sequence =
      typeof dayRaw === "number"
        ? dayRaw
        : parseInt(String(dayRaw).replace(/\D/g, ""), 10);
    if (!sequence || sequence < 1 || sequence > 70) continue;

    const date = addDays(ROADMAP_START, sequence - 1);
    const dayIndex = getDay(date);
    const dayType =
      dayIndex === 0 || dayIndex === 6 ? "weekend" : "weekday";
    const difficulty = String(
      row["Question Difficulty"] ?? row.Difficulty ?? "Easy"
    );
    const topic = String(row.Topic ?? "");
    const subtopic = String(row.Subtopic ?? row["Sub topic"] ?? "");
    const solveCount = dayType === "weekend" ? 3 : 1;

    row.Day = sequence;
    row.Date = format(date, "dd-MMM-yyyy");
    row["Day Name"] = DAY_NAMES[dayIndex];
    row["Day Type"] = dayType;
    row["Time Goal"] = dayType === "weekday" ? "1 Hour" : "2-4 Hours";
    row["Problems Target"] =
      dayType === "weekday"
        ? "1 Suggested"
        : `${solveCount} Suggested`;
    row["Recommended Solve Count"] = solveCount;
    row["Estimated Hours"] = dayType === "weekday" ? "1 Hour" : "2-4 Hours";
    row["Session Type"] = sessionFor(dayType, topic, subtopic);
    row["Default Confidence"] = defaultConfidence(difficulty);
    row["Question Difficulty"] = difficulty || "Easy";
    if (!row["Revision Focus"]) row["Revision Focus"] = "";

    updated++;
  }

  const newSheet = xlsx.utils.json_to_sheet(rows);
  workbook.Sheets[SHEET] = newSheet;
  xlsx.writeFile(workbook, EXCEL_PATH);

  console.log(`Updated ${updated} mission rows in ${EXCEL_FILE}`);
  console.log("Run: npm run parse-excel");
}

main();
