/*
  # Add anon RLS policies for events table

  ## Summary
  The app operates without authentication (admin-only, no login flow).
  The existing policies only allow the `authenticated` role, but the
  Supabase client is used as `anon`. This migration adds INSERT, UPDATE,
  and DELETE policies for the `anon` role so the dashboard can manage events.

  ## Changes
  - events: Add anon INSERT policy
  - events: Add anon UPDATE policy
  - events: Add anon DELETE policy

  ## Security Notes
  - This is appropriate for a single-admin app without user auth
  - The existing public SELECT policy for guests remains unchanged
*/

CREATE POLICY "Anon users can insert events"
  ON events FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon users can update events"
  ON events FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can delete events"
  ON events FOR DELETE
  TO anon
  USING (true);
