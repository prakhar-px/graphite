"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    const result = mode === "signin" ? await signIn(email, password) : await signUp(email, password);
    setLoading(false);
    if (result.error) {
      if (result.error.toLowerCase().includes("email not confirmed")) {
        setError("Please check your email for the confirmation link before signing in.");
      } else {
        setError(result.error);
      }
    } else if (mode === "signup" && (result as any).needsEmailConfirmation) {
      setSuccessMessage("Check your email for the confirmation link.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--gp-bg)" }}>
      <div
        className="w-full max-w-sm space-y-6 rounded-2xl border p-8 shadow-2xl"
        style={{
          backgroundColor: "var(--gp-surface-raised)",
          borderColor: "var(--gp-border)",
        }}
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-[var(--gp-text)]">Graphite</h1>
          <p className="text-sm text-[var(--gp-text-muted)]">Sign in to sync your progress</p>
        </div>

        {successMessage ? (
          <div className="rounded-lg border p-4" style={{ borderColor: "var(--gp-border)" }}>
            <p className="text-sm text-[var(--gp-text)] text-center">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border px-3 py-2 text-sm text-[var(--gp-text)] placeholder:text-[var(--gp-text-faint)] focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50"
              style={{ backgroundColor: "var(--gp-input-bg)", borderColor: "var(--gp-input-border)" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border px-3 py-2 text-sm text-[var(--gp-text)] placeholder:text-[var(--gp-text-faint)] focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50"
              style={{ backgroundColor: "var(--gp-input-bg)", borderColor: "var(--gp-input-border)" }}
            />
            {error ? <p className="text-xs text-red-500">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                mode === "signin" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "var(--gp-border)" }} />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 text-[var(--gp-text-faint)]" style={{ backgroundColor: "var(--gp-surface-raised)" }}>or</span>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={() => signInWithGoogle()}
          className="inline-flex w-full items-center justify-center gap-3 rounded-lg border px-3 py-2 text-sm font-medium text-[var(--gp-text-muted)] hover:bg-[var(--gp-surface)] transition-colors disabled:opacity-50"
          style={{ borderColor: "var(--gp-border)" }}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
          className="w-full text-center text-xs text-[var(--gp-text-faint)] hover:text-[var(--gp-text-muted)] disabled:opacity-50"
        >
          {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
        </button>

        <p className="text-center text-xs text-[var(--gp-text-faint)]">
          <a href="/" className="hover:text-[var(--gp-text-muted)]">Continue as guest</a>
        </p>
      </div>
    </div>
  );
}
