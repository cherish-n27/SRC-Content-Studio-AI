/*
# SRC Content Studio — Create profiles and generations tables

## Overview
Creates the two tables needed by the SRC Content Studio app: `profiles` (stores which SRC role a user has selected) and `generations` (stores the last 5+ generations per user for the recent activity feed).

## New Tables

### profiles
- `user_id` (uuid, primary key, references auth.users) — the authenticated user
- `role` (text, not null) — one of: president, deputy_president, secretary, treasury, community_engagement, social_culture, internal_comms
- `brand_color` (text) — the user's chosen accent color hex
- `logo_url` (text) — optional logo URL for brand kit
- `created_at` (timestamptz) — row creation time
- `updated_at` (timestamptz) — last update time

### generations
- `id` (uuid, primary key) — generation ID
- `user_id` (uuid, not null, references auth.users, defaults to auth.uid()) — owner
- `role` (text, not null) — which role generated this
- `content_type` (text, not null) — what type of content (formal_email, agenda, minutes, etc.)
- `input_data` (jsonb) — the user's input form fields
- `output_data` (jsonb) — the structured AI output (subject/body or headline/subtext/CTA etc.)
- `created_at` (timestamptz) — when generated

## Security
- RLS enabled on both tables.
- profiles: users can read/update only their own profile. Insert is allowed for own profile.
- generations: users can CRUD only their own generations (owner-scoped via auth.uid()).
- All policies scoped TO authenticated.
*/

CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'president',
  brand_color text DEFAULT '#2563eb',
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content_type text NOT NULL,
  input_data jsonb DEFAULT '{}',
  output_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_generations" ON generations;
CREATE POLICY "select_own_generations" ON generations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_generations" ON generations;
CREATE POLICY "insert_own_generations" ON generations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_generations" ON generations;
CREATE POLICY "update_own_generations" ON generations FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_generations" ON generations;
CREATE POLICY "delete_own_generations" ON generations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);
