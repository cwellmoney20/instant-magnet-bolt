/*
  # Fix Events SELECT RLS — Remove Unfiltered Policies

  ## Problem
  Two legacy SELECT policies with USING (true) allow all rows to be read,
  bypassing the soft-delete filter added in the previous migration.
  Multiple SELECT policies are OR-ed together, so any policy that passes
  returns the row — the filtered policy is effectively ignored.

  ## Changes
  - Drop "Anon can read all events" (USING true — no auth check, no delete filter)
  - Drop "Authenticated users can view all events" (USING true — no delete filter)
  - Drop "Authenticated users can read own events" (no delete filter)
  - The existing "Users can view non-deleted own events" policy
    (auth.uid() = user_id AND deleted_at IS NULL) remains as the sole SELECT policy.
  - A new anon SELECT policy is added for the guest upload page
    (reads events by slug without requiring auth, but still excludes deleted rows).
*/

DROP POLICY IF EXISTS "Anon can read all events" ON events;
DROP POLICY IF EXISTS "Authenticated users can view all events" ON events;
DROP POLICY IF EXISTS "Authenticated users can read own events" ON events;

-- Anon users need to read a single event by slug for the guest upload page,
-- but must never see deleted events.
CREATE POLICY "Anon can read non-deleted events"
  ON events FOR SELECT
  TO anon
  USING (deleted_at IS NULL);
