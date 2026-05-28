"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

const SHOW_AUTH_EVENT = "graphite:show-auth";

export function triggerAuthOverlay() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SHOW_AUTH_EVENT));
  }
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    setMounted(true);
    setShowOverlay(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const handler = () => {
      setDismissed(false);
      setShowOverlay(true);
    };
    window.addEventListener(SHOW_AUTH_EVENT, handler);
    return () => window.removeEventListener(SHOW_AUTH_EVENT, handler);
  }, [mounted]);

  if (!mounted || loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: "var(--gp-bg)" }}
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--gp-border)] border-t-[var(--gp-text-muted)]" />
      </div>
    );
  }

  if (!user && showOverlay && !dismissed) {
    return (
      <div className="relative min-h-screen" style={{ backgroundColor: "var(--gp-bg)" }}>
        {children}
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: "color-mix(in srgb, var(--gp-bg) 88%, transparent)" }}
        >
          <div
            className="w-full max-w-sm space-y-6 rounded-2xl border p-8 shadow-2xl"
            style={{
              backgroundColor: "var(--gp-surface-raised)",
              borderColor: "var(--gp-border)",
            }}
          >
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-[var(--gp-text)]">Graphite</h2>
              <p className="text-sm text-[var(--gp-text-muted)]">
                Sign in to sync your progress across devices
              </p>
            </div>
            <LoginForm />
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="w-full text-center text-xs text-[var(--gp-text-faint)] hover:text-[var(--gp-text-muted)]"
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function LoginForm() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    const result = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
    if (result.error) setError(result.error);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm text-[var(--gp-text)] placeholder:text-[var(--gp-text-faint)] focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
        style={{
          backgroundColor: "var(--gp-input-bg)",
          borderColor: "var(--gp-input-border)",
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm text-[var(--gp-text)] placeholder:text-[var(--gp-text-faint)] focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
        style={{
          backgroundColor: "var(--gp-input-bg)",
          borderColor: "var(--gp-input-border)",
        }}
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      <button
        type="submit"
        className="w-full rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
      >
        {mode === "signin" ? "Sign In" : "Create Account"}
      </button>
      <button
        type="button"
        onClick={async () => {
          setError(null);
          const result = await signInWithGoogle();
          if (result.error) setError(result.error);
        }}
        className="w-full rounded-lg border px-3 py-2 text-sm font-medium text-[var(--gp-text-muted)] hover:bg-[var(--gp-surface)] transition-colors"
        style={{ borderColor: "var(--gp-border)" }}
      >
        Continue with Google
      </button>
      <button
        type="button"
        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
        className="w-full text-center text-xs text-[var(--gp-text-faint)] hover:text-[var(--gp-text-muted)]"
      >
        {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
