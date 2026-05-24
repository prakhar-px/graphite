import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "excel.config.json");

type ExcelConfig = {
  active: string;
  sources: Record<string, { file: string; label: string }>;
};

function loadConfig(): ExcelConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error("excel.config.json not found");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8")) as ExcelConfig;
}

function saveConfig(config: ExcelConfig) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

const key = process.argv[2];

if (!key || key === "--help" || key === "-h") {
  const config = loadConfig();
  console.log("\nGraphite Excel sources:\n");
  for (const [id, source] of Object.entries(config.sources)) {
    const active = id === config.active ? " (active)" : "";
    console.log(`  ${id}${active}`);
    console.log(`    ${source.label}`);
    console.log(`    ${source.file}\n`);
  }
  console.log("Usage:");
  console.log("  npm run excel:use -- <sample|full>");
  console.log("  npm run excel:sample");
  console.log("  npm run excel:full\n");
  process.exit(0);
}

const config = loadConfig();

if (!config.sources[key]) {
  console.error(`Unknown source "${key}". Available: ${Object.keys(config.sources).join(", ")}`);
  process.exit(1);
}

config.active = key;
saveConfig(config);

const file = config.sources[key].file;
console.log(`\nActive Excel: ${key} → ${file}`);
console.log("Parsing into src/data/...\n");

execSync("npm run parse-excel", {
  cwd: ROOT,
  stdio: "inherit",
  env: { ...process.env },
});

console.log("\nDone. Restart dev server (npm run dev) and refresh the app.");
console.log("Tip: export progress from Settings before switching if you want a backup.\n");
