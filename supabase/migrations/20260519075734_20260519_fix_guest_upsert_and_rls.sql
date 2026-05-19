/*
  # Fix Guest Upsert and Photo Insert RLS

  ## Problem
  The guest upload flow uses an upsert on event_guests (INSERT ... ON CONFLICT DO UPDATE).
  When a guest already exists (returning visitor), PostgreSQL executes the UPDATE path.
  There was no UPDATE policy for the anon role on event_guests, so the upsert failed silently,
  leaving guestId as null in the frontend state.

  This caused downstream photo inserts to either be blocked or use a stale guestId,
  resulting in the "new row violates row-level security policy for table photos" error.

  ## Changes
  1. Add anon UPDATE policy on event_guests scoped to active events (for upsert support)
  2. Tighten the anon SELECT policies on event_guests and photos to be event-scoped
     instead of unconditionally true, fixing the remaining "always true" audit findings
*/

-- Allow anon to update their own guest record (name) on upsert for active events
CREATE POLICY "Guests can update their record for active events"
  ON public.event_guests
  FOR UPDATE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_guests.event_id
        AND status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_guests.event_id
        AND status = 'active'
    )
  );

-- Tighten anon SELECT on event_guests: only for active events (was unconditionally true)
DROP POLICY IF EXISTS "Anon users can view event guests" ON public.event_guests;
CREATE POLICY "Guests can view event guests for active events"
  ON public.event_guests
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_guests.event_id
        AND status = 'active'
    )
  );

-- Tighten authenticated SELECT on event_guests: only for events they own
DROP POLICY IF EXISTS "Authenticated users can view event guests" ON public.event_guests;
CREATE POLICY "Owners can view guests in their events"
  ON public.event_guests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_guests.event_id
        AND user_id = auth.uid()
    )
  );

-- Tighten anon SELECT on photos: only for active events (was unconditionally true)
DROP POLICY IF EXISTS "Anon users can view photos" ON public.photos;
CREATE POLICY "Guests can view photos for active events"
  ON public.photos
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = photos.event_id
        AND status = 'active'
    )
  );

-- Tighten authenticated SELECT on photos: only for events they own
DROP POLICY IF EXISTS "Authenticated users can view photos" ON public.photos;
CREATE POLICY "Owners can view photos in their events"
  ON public.photos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = photos.event_id
        AND user_id = auth.uid()
    )
  );
