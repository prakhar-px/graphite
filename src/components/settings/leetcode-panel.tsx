"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { PremiumCard } from "@/components/ui/premium-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LeetCodePanel() {
  const leetcodeUsername = useAppStore((s) => s.leetcodeUsername);
  const setLeetcodeUsername = useAppStore((s) => s.setLeetcodeUsername);
  const syncLeetCodeSubmissions = useAppStore((s) => s.syncLeetCodeSubmissions);
  const problemLog = useAppStore((s) => s.problemLog);

  const [draft, setDraft] = useState(leetcodeUsername);
  const [message, setMessage] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const handleSaveUsername = () => {
    setLeetcodeUsername(draft);
    setMessage("Username saved.");
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

  return (
    <PremiumCard>
      <h3 className="font-semibold text-zinc-100">LeetCode sync (V1.2)</h3>
      <p className="mt-2 text-sm text-zinc-400">
        Imports your last 20 submissions (accepted only), keyed by submission
        ID so re-solving the same problem still syncs. Uses LeetCode GraphQL
        with Alfa API fallback.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Input
          placeholder="leetcode-username"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="max-w-xs border-zinc-700 bg-zinc-900/50"
        />
        <Button type="button" size="sm" variant="outline" onClick={handleSaveUsername}>
          Save username
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!draft.trim() || syncing}
          onClick={() => void handleSync()}
        >
          {syncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing…
            </>
          ) : (
            "Sync recent solves"
          )}
        </Button>
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        {problemLog.length} problem{problemLog.length === 1 ? "" : "s"} in your
        log. Duplicates are skipped automatically.
      </p>
      {message ? <p className="mt-2 text-sm text-violet-300">{message}</p> : null}
    </PremiumCard>
  );
}
