# Graphite — FAANG DSA Mission Control

Premium developer productivity dashboard for structured FAANG / Microsoft DSA interview preparation. Tracks a 70-day study plan with per-day missions, problem logging (manual + LeetCode telemetry import), revision intelligence, confidence tracking, AI coaching, and multi-device cloud sync.

## Stack

- **Next.js 16** (App Router) + **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui** + **Framer Motion**
- **Zustand** (localStorage persistence) + **Recharts**
- **Google Gemini** (AI coach)
- **LeetCode GraphQL + Alfa API** (submission sync & full telemetry scan)
- **Supabase** (auth + cloud sync — pull-on-focus)
- **Google OAuth** (sign-in)

## Quick Start

```bash
npm install
npm run excel:updated   # Parse updated Excel → JSON
npm run dev             # http://localhost:4000
```

## Architecture

```
Excel  ──►  scripts/parse-excel.ts  ──►  src/data/*.json  (70-day plan, metrics)
                    │
                    ▼
         src/engines/*/selectors.ts   Business logic (telemetry, analytics, revision, topics)
                    │
         ┌──────────┼──────────┬──────────┐
         ▼          ▼          ▼          ▼
   Zustand      Components     AI Coach   Supabase
(localStorage)  (React 19)   (Gemini)   (cloud sync)
```

### Engines

All business logic lives in `src/engines/` — pure selectors driven by a `UserSnapshot`:

| Engine | Purpose |
|--------|---------|
| `planner` | Mission status, streak, completion rate, weekend detection |
| `telemetry` | Weekly solved trends, plan-sourced metrics (week/weekend distribution, estimated hours, session types, topic breakdown) |
| `problems` | Problem log filtering, difficulty distribution, confidence averages, revision load |
| `analytics` | Aggregates all engines into a unified analytics snapshot |
| `dashboard` | Dashboard stats, focus score, active topic, upcoming days |
| `revision` | Memory timeline, recall strength, reinforcement queue |
| `topics` | Topic progress, status derivation, chart distribution |
| `confidence` | Global / per-topic confidence percent |
| `ai` | Builds AI coach context from full analytics snapshot |

## Excel → Data Pipeline

The roadmap is authored in Excel and parsed to JSON:

| Command | Workbook |
|---------|----------|
| `npm run excel:updated` | `Graphite_FAANG_Roadmap_Updated.xlsx` (primary) |
| `npm run excel:full` | `FAANG_DSA_Master_Roadmap_v2.xlsx` |
| `npm run excel:sample` | `FAANG_DSA_Master_Roadmap_v2_sample.xlsx` |
| `npm run excel:use -- <key>` | Switch active source + re-parse |
| `npm run excel:list` | List all configured sources |

**Sheets parsed:** Dashboard, Master Plan, Daily DSA Plan (70 days), Revision Tracker, Company Prep, Mistake Log, Weekly Review.

> Export your progress from **Settings** before switching Excel files, then re-import after.

## Pages

| Route | Description |
|-------|-------------|
| `/dashboard` | Mission control — stats, streak, weekly chart, topic distribution, revision heatmap |
| `/planner` | 70-day sprint calendar (week-grouped) with per-day task card, confidence logging |
| `/topics` | Topic mastery matrix with progress, revision cycles, confidence |
| `/analytics` | Weekly solved trends, difficulty distribution, topic distribution, revision summary |
| `/revision` | Memory intelligence, topic retention analytics, reinforcement queue, problem memory timeline |
| `/mistakes` | Mistake log with category stats |
| `/companies` | Company-specific prep tracking |
| `/coach` | AI coach powered by Gemini (your telemetry as context) |
| `/settings` | Sync status, LeetCode telemetry import, backup export/import, Excel sources |

## Features

- **70-day structured sprint** — weekday (1 core problem) and weekend (3 problems, mixed session) missions with week-grouped calendar
- **Confidence logging** — rate per-problem confidence (Low/Med/High + slider) on mission completion
- **LeetCode telemetry import** — full accepted submission history scan via Alfa API; detects repeated solves (2×, 3× problems) and long-term revision gaps (90d+); imports as timestamped solve events that feed directly into memory strength and recall analytics
- **Revision intelligence** — recall strength score, spaced repetition signals, reinforcement queue sorted by revision priority
- **Cloud sync** — Supabase-backed (pull-on-focus, push-on-action); Google OAuth sign-in with guest mode fallback
- **AI coach** — Gemini-powered contextual advice based on full analytics snapshot and problem telemetry
- **Telemetry system** — plan-sourced metrics (weekend/weekday distribution, estimated hours, topic breakdown, session types) + user action-driven analytics
- **Progress backup** — full export/import (JSON) for switching data sources or devices
- **Excel-driven roadmap** — update the spreadsheet, re-parse, and the app reflects changes

## Data flow

```
Excel worksheets
      │
      ▼
scripts/parse-excel.ts  →  src/data/*.json  (static plan structure)
      │
      ▼
User actions (complete day, log problem, rate confidence)
      │
      ▼
Zustand store  →  localStorage  (persisted progress)
      │
      ├──────────────────────────────┐
      ▼                              ▼
Engines (UserSnapshot)         Supabase cloud sync
      │                    (pull on visibilitychange)
      ▼
Components
```

## Env

```env
# Required — Supabase cloud sync
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Optional — AI coach
GEMINI_API_KEY=your_key

# Optional — LeetCode sync
# Works without env, uses public GraphQL + Alfa API
```
