-- Profitability Settings table for storing driver cost calculations
-- Run this SQL in the Supabase SQL editor
-- This script is idempotent and safe to run multiple times

CREATE TABLE IF NOT EXISTS profitability_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_profitability_settings_user_id ON profitability_settings(user_id);

-- Enable Row Level Security
ALTER TABLE profitability_settings ENABLE ROW LEVEL SECURITY;

-- Create policies (idempotent - safe to run multiple times)
DO $$
BEGIN
  -- Policy for SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profitability_settings'
      AND policyname = 'Users can view their own profitability settings'
  ) THEN
    CREATE POLICY "Users can view their own profitability settings"
      ON profitability_settings FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- Policy for INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profitability_settings'
      AND policyname = 'Users can insert their own profitability settings'
  ) THEN
    CREATE POLICY "Users can insert their own profitability settings"
      ON profitability_settings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profitability_settings'
      AND policyname = 'Users can update their own profitability settings'
  ) THEN
    CREATE POLICY "Users can update their own profitability settings"
      ON profitability_settings FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  -- Policy for DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profitability_settings'
      AND policyname = 'Users can delete their own profitability settings'
  ) THEN
    CREATE POLICY "Users can delete their own profitability settings"
      ON profitability_settings FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END$$;
