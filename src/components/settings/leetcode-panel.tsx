"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Trophy, Target, Brain, RefreshCw, BarChart3, Clock } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImportPreviewModal } from "@/components/settings/import-preview-modal";

type ProfileData = {
  username: string;
  ranking: number | null;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  topics?: Array<{ tag: string; count: number }>;
  activeDays?: number;
};

type TelemetryData = {
  username: string;
  totalAccepted: number;
  totalSubmissions: number;
  allProblems: Array<{ titleSlug: string; title: string; solveCount: number; timestamps: number[]; languages: string[] }>;
  repeated: Array<{ titleSlug: string; title: string; solveCount: number; timestamps: number[]; maxGapDays: number; languages: string[] }>;
  repeatedCount: number;
  revisionTimeGaps: number;
  activeDays: number;
  topics: Array<{ tag: string; count: number }>;
  difficultyBreakdown: { easy: number; medium: number; hard: number; total: number };
  ranking: number | null;
};

export function LeetCodePanel() {
  const leetcodeUsername = useAppStore((s) => s.leetcodeUsername);
  const setLeetcodeUsername = useAppStore((s) => s.setLeetcodeUsername);
  const syncLeetCodeSubmissions = useAppStore((s) => s.syncLeetCodeSubmissions);
  const problemLog = useAppStore((s) => s.problemLog);

  const [draft, setDraft] = useState(leetcodeUsername);
  const [message, setMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);

  const fetchProfile = async (username: string) => {
    if (!username) return;
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/leetcode/profile?username=${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch { /* ignore */ }
    setLoadingProfile(false);
  };

  useEffect(() => {
    if (leetcodeUsername) fetchProfile(leetcodeUsername);
  }, [leetcodeUsername]);

  const handleSaveUsername = () => {
    setLeetcodeUsername(draft);
    setMessage("Username saved.");
    if (draft.trim()) fetchProfile(draft.trim());
  };

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    if (draft.trim() !== leetcodeUsername) {
      setLeetcodeUsername(draft);
    }
    const result = await syncLeetCodeSubmissions(20);
    setMessage(result.message);
    setSyncing(false);
  };

  const handleFetchTelemetry = async () => {
    const user = draft.trim() || leetcodeUsername;
    if (!user) return;
    setLoadingTelemetry(true);
    setTelemetry(null);
    try {
      const res = await fetch(`/api/leetcode/import-preview?username=${encodeURIComponent(user)}`);
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      } else {
        setMessage("Could not fetch LeetCode telemetry. The Alfa API may be unavailable.");
      }
    } catch {
      setMessage("Could not reach LeetCode telemetry service.");
    }
    setLoadingTelemetry(false);
  };

  return (
    <>
      <PremiumCard>
        <h3 className="font-semibold text-zinc-100">LeetCode telemetry</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Fetches your full accepted submission history, detects repeated solves,
          and imports them as solve events for memory intelligence.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            placeholder="leetcode-username"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="max-w-xs border-zinc-700 bg-zinc-900/50"
          />
          <Button type="button" size="sm" variant="outline" title="Save LeetCode username to your preferences" onClick={handleSaveUsername}>
            Save username
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!draft.trim() || syncing}
            title="Grab your latest 20 accepted submissions"
            onClick={() => void handleSync()}
          >
            {syncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing…
              </>
            ) : (
              "Sync recent"
            )}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!draft.trim() || loadingTelemetry}
            title="Scan full LeetCode history for repeated solves and revision gaps"
            onClick={handleFetchTelemetry}
          >
            {loadingTelemetry ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching…
              </>
            ) : (
              <>
                <Brain className="mr-1.5 h-4 w-4" />
                Fetch telemetry
              </>
            )}
          </Button>
        </div>

        {loadingProfile ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading profile...
          </div>
        ) : profile ? (
          <div className="mt-4 space-y-3 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-violet-400" />
                <span className="text-sm font-medium text-zinc-200">{profile.username}</span>
              </div>
              <a
                href={`https://leetcode.com/u/${profile.username}/`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
              >
                profile <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-xs text-zinc-500" title="Total problems accepted">Solved</p>
                <p className="font-mono text-lg font-bold text-zinc-100">{profile.totalSolved}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500" title="Easy problems solved">Easy</p>
                <p className="font-mono text-lg font-bold text-green-400">{profile.easySolved}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500" title="Medium problems solved">Medium</p>
                <p className="font-mono text-lg font-bold text-amber-400">{profile.mediumSolved}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500" title="Hard problems solved">Hard</p>
                <p className="font-mono text-lg font-bold text-red-400">{profile.hardSolved}</p>
              </div>
            </div>
            {profile.ranking ? (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                Rank #{profile.ranking.toLocaleString()}
              </div>
            ) : null}
          </div>
        ) : leetcodeUsername ? (
          <p className="mt-3 text-xs text-zinc-500">
            Could not load profile for &quot;{leetcodeUsername}&quot;
          </p>
        ) : null}

        <p className="mt-3 text-xs text-zinc-500">
          {problemLog.length} problem{problemLog.length === 1 ? "" : "s"} in your
          log. Duplicates are skipped automatically.
        </p>
        {message ? <p className="mt-2 text-sm text-violet-300">{message}</p> : null}
      </PremiumCard>

      {telemetry ? (
        <ImportPreviewModal data={telemetry} onClose={() => setTelemetry(null)} />
      ) : null}
    </>
  );
}
