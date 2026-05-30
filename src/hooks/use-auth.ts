"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
      setUser(user);
      setLoading(false);
    }).catch(() => {
      // Stale/expired refresh token — sign out silently
      supabase.auth.signOut().then(() => {
        setUser(null);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { ok: !error, error: error?.message };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    return {
      ok: !error,
      error: error?.message,
      needsEmailConfirmation: !error && !data.session,
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { ok: !error, error: error?.message };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return { user, loading, signIn, signUp, signInWithGoogle, signOut };
}
