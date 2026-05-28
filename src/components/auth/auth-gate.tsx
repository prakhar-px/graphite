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
      <div className="flex min-h-screen items-center justify-center bg-[#09090B]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-200" />
      </div>
    );
  }

  if (!user && showOverlay && !dismissed) {
    return (
      <div className="relative min-h-screen bg-[#09090B]">
        {children}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B]/90 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-zinc-100">Graphite</h2>
              <p className="text-sm text-zinc-400">
                Sign in to sync your progress across devices
              </p>
            </div>
            <LoginForm />
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300"
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
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
      />
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
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
        className="w-full rounded-lg border border-zinc-800 px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition-colors"
      >
        Continue with Google
      </button>
      <button
        type="button"
        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
        className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300"
      >
        {mode === "signin" ? "No account? Create one" : "Already have an account? Sign in"}
      </button>
    </form>
  );
}
