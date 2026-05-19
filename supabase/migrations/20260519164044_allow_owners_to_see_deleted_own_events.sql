/*
  # Allow owners to see their own deleted events (fixes soft-delete RLS)

  ## Problem
  PostgreSQL evaluates SELECT policies against the post-update row after an UPDATE.
  The existing SELECT policy for authenticated users requires `deleted_at IS NULL`,
  so soft-deleting an event (setting deleted_at) causes a 42501 RLS violation because
  the updated row no longer passes the SELECT visibility check.

  ## Fix
  Drop the restrictive authenticated SELECT policy and replace it with one that allows
  owners to see ALL their own events (including deleted ones). The dashboard query
  already filters `deleted_at IS NULL` in the application layer, so this does not
  expose deleted events in the UI.

  Anon SELECT policy is unchanged — guests still only see non-deleted events.
*/

DROP POLICY IF EXISTS "Users can view non-deleted own events" ON events;

CREATE POLICY "Users can view own events"
  ON events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
