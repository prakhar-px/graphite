# Graphite — FAANG DSA Mission Control

Premium developer productivity dashboard for FAANG / Microsoft DSA interview preparation.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (localStorage) + Recharts + Framer Motion

## Quick Start

```bash
npm install
npm run excel:sample   # Parse sample Excel → JSON (first time)
npm run dev            # http://localhost:4000
```

## Data flow (V1.1)

```text
Excel  →  npm run excel:*  →  src/data/*.json  (roadmap structure)
UI     →  Zustand          →  localStorage     (your progress)
Charts →  seed + progress merged in lib/computed-data.ts
```

**Export / import** your progress from **Settings** before switching Excel files.

## Switch Excel workbooks

Configured in `excel.config.json`:

| Command | Workbook |
|---------|----------|
| `npm run excel:sample` | `FAANG_DSA_Master_Roadmap_v2_sample.xlsx` |
| `npm run excel:full` | `FAANG_DSA_Master_Roadmap_v2.xlsx` |
| `npm run excel:use -- sample` | Set active + parse |
| `npm run excel:list` | Show all sources |

After switching: **export progress** → run excel command → restart `npm run dev` → refresh → **import** if needed.

Legacy override:

```bash
$env:EXCEL_FILE="your-file.xlsx"; npm run parse-excel
```

## Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Mission control |
| `/planner` | 70-day calendar |
| `/topics` | Topic mastery |
| `/settings` | Backup & Excel info |
