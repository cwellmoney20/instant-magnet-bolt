/*
  # Fix events UPDATE policy to allow soft-delete

  ## Problem
  When a user soft-deletes an event (sets deleted_at), PostgreSQL's RLS re-evaluates
  the SELECT policy against the post-update row. The authenticated SELECT policy requires
  `deleted_at IS NULL`, so after setting deleted_at the row fails the visibility check,
  producing a 42501 "new row violates row-level security policy" error.

  ## Fix
  Replace the UPDATE policy's WITH CHECK with one that does NOT require deleted_at IS NULL,
  so the soft-delete write is allowed. The USING clause still ensures only the owner can
  update their own event.
*/

DROP POLICY IF EXISTS "Users can update own events" ON events;

CREATE POLICY "Users can update own events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
