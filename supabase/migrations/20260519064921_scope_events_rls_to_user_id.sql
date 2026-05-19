/*
  # Scope events RLS to user_id ownership

  ## Summary
  Updates the `events` table RLS policies to enforce per-user ownership via the
  new `user_id` column added in the previous migration. Also ensures the event
  count trigger works correctly by relying on `user_id` rather than a session-
  level auth context inside a trigger (which is more reliable).

  ## Changes

  ### Modified Table: `events`
  - Drop and recreate authenticated admin policies to scope to `user_id = auth.uid()`
  - INSERT policy requires `user_id = auth.uid()` so the column is always set
  - SELECT/UPDATE scoped to owned events only

  ## Security Notes
  - Anon SELECT for guest upload slug-lookup is preserved unchanged
  - All admin operations now strictly scoped to the event owner
*/

-- Drop existing authenticated policies
DROP POLICY IF EXISTS "Authenticated users can read all events" ON events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;
DROP POLICY IF EXISTS "Authenticated users can update events" ON events;

-- Authenticated admin read — own events only
CREATE POLICY "Authenticated users can read own events"
  ON events
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated admin insert — must set user_id to own uid
CREATE POLICY "Authenticated users can insert own events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Authenticated admin update — own events only
CREATE POLICY "Authenticated users can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
