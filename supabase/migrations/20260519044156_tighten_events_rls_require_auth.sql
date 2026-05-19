/*
  # Tighten Events RLS to Require Authentication for Admin Operations

  ## Summary
  Updates the Row Level Security policies on the `events` table so that
  all admin operations (SELECT, INSERT, UPDATE) require an authenticated
  Supabase user.

  ## Changes

  ### Modified Table: `events`
  - Drop all existing anonymous-permissive policies (safe — uses IF EXISTS)
  - Add public SELECT policy for the guest upload slug-lookup (anon read)
  - Add authenticated-only SELECT, INSERT, UPDATE policies for admin use

  ## Security Notes
  - Guest upload flow uses `photos` and `event_guests` tables which retain
    their existing public-insert policies (unchanged here).
  - The guest upload page needs to read an event by slug without auth,
    so a minimal anon SELECT policy is preserved.
  - All admin CRUD now requires auth.uid() IS NOT NULL.
*/

-- Drop existing permissive policies (any naming convention used in prior migrations)
DROP POLICY IF EXISTS "Allow anonymous select on events" ON events;
DROP POLICY IF EXISTS "Allow anonymous insert on events" ON events;
DROP POLICY IF EXISTS "Allow anonymous update on events" ON events;
DROP POLICY IF EXISTS "Allow anon select on events" ON events;
DROP POLICY IF EXISTS "Allow anon insert on events" ON events;
DROP POLICY IF EXISTS "Allow anon update on events" ON events;
DROP POLICY IF EXISTS "Anon can read events" ON events;
DROP POLICY IF EXISTS "Anon can insert events" ON events;
DROP POLICY IF EXISTS "Anon can update events" ON events;
DROP POLICY IF EXISTS "Public can read events by slug for guest upload" ON events;
DROP POLICY IF EXISTS "Authenticated users can read all events" ON events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON events;

-- Public read for guest upload page (slug lookup without auth)
CREATE POLICY "Public can read events by slug for guest upload"
  ON events
  FOR SELECT
  TO anon
  USING (slug IS NOT NULL);

-- Authenticated admin read
CREATE POLICY "Authenticated users can read all events"
  ON events
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Authenticated admin insert
CREATE POLICY "Authenticated users can insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated admin update
CREATE POLICY "Authenticated users can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
