/*
  # Add user_plans table for subscription management

  ## Summary
  Creates a subscription plan tracking system for InstantEvent's free/pro tiers.

  ## New Tables
  - `user_plans`
    - `user_id` (uuid, PK, references auth.users) — one row per authenticated user
    - `plan` (text) — either 'free' or 'pro', defaults to 'free'
    - `stripe_customer_id` (text, nullable) — Stripe Customer ID, set when user initiates checkout
    - `stripe_subscription_id` (text, nullable) — Stripe Subscription ID, set after successful checkout
    - `subscription_status` (text, nullable) — Stripe subscription status (active, canceled, past_due, etc.)
    - `current_period_end` (timestamptz, nullable) — when the current billing period ends; access granted until this date
    - `created_at` / `updated_at` (timestamptz) — auto-managed

  ## Auto-provisioning
  - A trigger on auth.users automatically inserts a free-tier row for every new sign-up
  - Existing authenticated users who don't have a row get one on first read (handled by upsert in app)

  ## Security
  - RLS enabled; users can only read their own row
  - Only service role can write (all writes go through edge functions)

  ## Event creation guard
  - A Postgres function `check_event_limit` is called via trigger before each events INSERT
  - If user is on free plan AND already has 3 or more events, the insert is rejected
  - Existing events above 3 (from grandfathered data) are not deleted — user is simply capped

  ## Notes
  1. The free tier allows up to 3 events. Pro allows unlimited.
  2. Stripe Product: prod_UXmv7xS9hoWuKh | Price: price_1TYhLWJp2xMZehlhSFEhSBqJ ($1/month)
  3. Subscription cancellation: user retains pro access until current_period_end, then plan is set to 'free'
*/

-- 1. Create user_plans table
CREATE TABLE IF NOT EXISTS user_plans (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_user_plans_updated_at ON user_plans;
CREATE TRIGGER set_user_plans_updated_at
  BEFORE UPDATE ON user_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_user_plans_updated_at();

-- 3. Auto-create free plan row on new sign-up
CREATE OR REPLACE FUNCTION handle_new_user_plan()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_plans (user_id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_plan ON auth.users;
CREATE TRIGGER on_auth_user_created_plan
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_plan();

-- 4. Enable RLS
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- Users can read their own plan row
CREATE POLICY "Users can read own plan"
  ON user_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Server-side event count guard function
CREATE OR REPLACE FUNCTION check_event_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan text;
  event_count integer;
BEGIN
  -- Look up the current user's plan
  SELECT plan INTO user_plan
  FROM user_plans
  WHERE user_id = auth.uid();

  -- Default to free if no row exists yet
  IF user_plan IS NULL THEN
    user_plan := 'free';
  END IF;

  -- Only enforce limit for free users
  IF user_plan = 'free' THEN
    SELECT COUNT(*) INTO event_count
    FROM events
    WHERE events.user_id = auth.uid();

    IF event_count >= 3 THEN
      RAISE EXCEPTION 'Free plan limit reached. Upgrade to Pro to create more events.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Add user_id column to events table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE events ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Backfill user_id for existing events from RLS context is not possible server-side,
-- but new events will always have user_id set via the application insert.

-- 7. Attach the event limit trigger
DROP TRIGGER IF EXISTS enforce_event_limit ON events;
CREATE TRIGGER enforce_event_limit
  BEFORE INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION check_event_limit();
