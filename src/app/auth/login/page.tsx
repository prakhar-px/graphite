"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
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
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: "var(--gp-bg)" }}
    >
      {/* Decorative gradient orbs */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-[0.08] dark:opacity-[0.12]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,1) 0%, rgba(59,130,246,1) 50%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-[0.06] dark:opacity-[0.10]"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,1) 0%, rgba(124,58,237,1) 50%, transparent 70%)",
        }}
      />

      <div
        className="relative w-full max-w-sm space-y-7 rounded-3xl border p-8 shadow-2xl backdrop-blur-2xl"
        style={{
          backgroundColor: "color-mix(in srgb, var(--gp-surface-raised) 85%, transparent)",
          borderColor: "color-mix(in srgb, var(--gp-border) 70%, transparent)",
        }}
      >
        {/* Brand */}
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/20 text-violet-600 dark:text-violet-400 shadow-lg shadow-violet-600/10">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--gp-text)]">
              Graphite
            </h1>
            <p className="mt-1.5 text-sm text-[var(--gp-text-muted)]">
              Sign in to sync your progress across devices
            </p>
          </div>
        </div>

        {/* Google Sign-in */}
        <button
          type="button"
          disabled={loading}
          onClick={() => signInWithGoogle()}
          className="inline-flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-2.5 text-sm font-medium text-[var(--gp-text)] transition-all hover:bg-[var(--gp-surface)] disabled:opacity-50"
          style={{ borderColor: "var(--gp-border)" }}
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "var(--gp-border)" }} />
          </div>
          <div className="relative flex justify-center text-xs">
            <span
              className="px-3 text-[var(--gp-text-faint)]"
              style={{ backgroundColor: "color-mix(in srgb, var(--gp-surface-raised) 85%, transparent)" }}
            >
              or sign in with email
            </span>
          </div>
        </div>

        {/* Email form */}
        {successMessage ? (
          <div className="rounded-xl border p-4 text-center" style={{ borderColor: "var(--gp-border)" }}>
            <p className="text-sm text-[var(--gp-text)]">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border px-4 py-2.5 text-sm text-[var(--gp-text)] placeholder:text-[var(--gp-text-faint)] transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
              style={{ backgroundColor: "var(--gp-input-bg)", borderColor: "var(--gp-input-border)" }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border px-4 py-2.5 text-sm text-[var(--gp-text)] placeholder:text-[var(--gp-text-faint)] transition-all focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:opacity-50"
              style={{ backgroundColor: "var(--gp-input-bg)", borderColor: "var(--gp-input-border)" }}
            />
            {error ? (
              <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-600/25 transition-all hover:bg-violet-500 hover:shadow-violet-500/30 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                mode === "signin" ? "Sign In" : "Create Account"
              )}
            </button>
          </form>
        )}

        {/* Footer links */}
        <div className="space-y-3 text-center">
          <button
            type="button"
            disabled={loading}
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
            className="w-full text-center text-xs text-[var(--gp-text-faint)] transition-colors hover:text-[var(--gp-text-muted)] disabled:opacity-50"
          >
            {mode === "signin"
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
          <p className="text-xs text-[var(--gp-text-faint)]">
            <a
              href="/"
              className="font-medium text-violet-600 dark:text-violet-400 transition-colors hover:text-violet-500"
            >
              Continue as guest →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}