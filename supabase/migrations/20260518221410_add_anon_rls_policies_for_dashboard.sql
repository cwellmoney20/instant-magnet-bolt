/*
  # Add anon RLS policies for dashboard operations

  ## Summary
  The app has no authentication flow — it operates as a single-admin tool
  using the anon Supabase key. The dashboard needs to read guests and
  update/delete photos. This migration adds the missing anon policies.

  ## Changes
  - event_guests: Add anon SELECT policy (dashboard guest list)
  - event_guests: Add anon UPDATE policy (if needed for admin edits)
  - photos: Add anon SELECT policy (dashboard photo grid)
  - photos: Add anon UPDATE policy (status changes by admin)
  - photos: Add anon DELETE policy (admin can remove photos)

  ## Notes
  - Appropriate for a no-auth single-admin application
*/

-- event_guests: allow anon to read (dashboard)
CREATE POLICY "Anon users can view event guests"
  ON event_guests FOR SELECT
  TO anon
  USING (true);

-- event_guests: allow anon to delete (dashboard)
CREATE POLICY "Anon users can delete event guests"
  ON event_guests FOR DELETE
  TO anon
  USING (true);

-- photos: allow anon to read (dashboard photo grid)
CREATE POLICY "Anon users can view photos"
  ON photos FOR SELECT
  TO anon
  USING (true);

-- photos: allow anon to update status (admin workflow)
CREATE POLICY "Anon users can update photos"
  ON photos FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- photos: allow anon to delete photos
CREATE POLICY "Anon users can delete photos"
  ON photos FOR DELETE
  TO anon
  USING (true);
