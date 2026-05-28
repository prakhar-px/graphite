-- Graphite: Initial Schema (simplified)
-- Run this in the Supabase SQL Editor after creating the project.

-- 1. PROFILES
CREATE TABLE public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT,
  display_name        TEXT,
  leetcode_username   TEXT DEFAULT '',
  active_topic        TEXT DEFAULT '',
  focus_mode          BOOLEAN DEFAULT FALSE,
  planner_selected_day INT DEFAULT 1,
  last_data_seed_id   TEXT DEFAULT '',
  completed_tasks     JSONB DEFAULT '[]'::jsonb,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_self" ON public.profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. PLANNER DAY STATUS
CREATE TABLE public.planner_day_status (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day         INT NOT NULL CHECK (day BETWEEN 1 AND 70),
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, day)
);

CREATE INDEX idx_planner_day_status_user ON public.planner_day_status(user_id);

ALTER TABLE public.planner_day_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "planner_day_status_self" ON public.planner_day_status
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. PROBLEM LOG
CREATE TABLE public.problem_log (
  id                      TEXT PRIMARY KEY,
  user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title                   TEXT,
  title_slug              TEXT,
  question_id             TEXT,
  question_frontend_id    INT,
  url                     TEXT,
  platform                TEXT,
  difficulty              TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topics                  TEXT[] DEFAULT '{}',
  source                  TEXT,
  source_type             TEXT,
  logging_mode            TEXT DEFAULT 'detailed',
  solved_at               TIMESTAMPTZ NOT NULL,
  solved_count            INT DEFAULT 1,
  confidence              INT,
  time_spent_minutes      INT,
  notes                   TEXT,
  revision_needed         BOOLEAN DEFAULT FALSE,
  linked_planner_day      INT,
  submission_id           TEXT,
  lang                    TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  deleted_at              TIMESTAMPTZ
);

CREATE INDEX idx_problem_log_user ON public.problem_log(user_id);
CREATE INDEX idx_problem_log_user_solved ON public.problem_log(user_id, solved_at DESC);
CREATE INDEX idx_problem_log_title_slug ON public.problem_log(user_id, title_slug);

ALTER TABLE public.problem_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "problem_log_self" ON public.problem_log
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger for all tables
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_planner_day_status_updated_at
  BEFORE UPDATE ON public.planner_day_status
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_problem_log_updated_at
  BEFORE UPDATE ON public.problem_log
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
