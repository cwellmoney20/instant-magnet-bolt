/*
  # Fix Events UPDATE RLS to Allow Soft Delete

  ## Problem
  The current UPDATE policy uses USING (auth.uid() = user_id AND deleted_at IS NULL).
  PostgREST evaluates USING on the existing row and WITH CHECK on the resulting row.
  When a user sets deleted_at = now(), the existing row has deleted_at IS NULL (passes),
  but in some Supabase/PostgREST versions the WITH CHECK re-evaluates the full condition
  including the USING predicate against the new row — causing a 403 because the new row
  has deleted_at IS NOT NULL.

  ## Fix
  Split the concern: USING only checks ownership (not deleted_at), so the row is
  accessible for update. WITH CHECK ensures the resulting row is still owned by the
  same user. This allows setting deleted_at while still blocking updates to already-
  deleted events via a separate guard in application logic.

  Note: A truly deleted event (deleted_at IS NOT NULL) is already invisible to SELECT,
  so a client cannot navigate to it to trigger an update anyway.
*/

DROP POLICY IF EXISTS "Users can update non-deleted own events" ON events;

CREATE POLICY "Users can update own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
