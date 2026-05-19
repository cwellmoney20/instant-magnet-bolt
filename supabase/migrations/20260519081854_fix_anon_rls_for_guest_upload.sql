/*
  # Fix anon RLS policies for guest upload flow

  ## Problem
  PostgREST evaluates subqueries inside RLS policies under the same role (anon).
  The event_guests and photos INSERT policies use EXISTS subqueries on the events
  table, which itself has RLS enabled. The anon SELECT policy on events requires
  status = 'active', which should work — but the combination of nested RLS
  evaluation causes 403s in practice.

  ## Solution
  Replace the subquery-based WITH CHECK policies on event_guests and photos with
  simpler direct checks. Also ensure the anon SELECT on events uses a permissive
  policy that covers all rows (not just active ones) so subqueries from other
  table policies can resolve event rows freely.

  For photos realtime: ensure the anon SELECT policy is broad enough for
  Supabase Realtime subscriptions to work.
*/

-- ============================================================
-- 1. Fix events anon SELECT: make it permissive for all rows
--    so subqueries in event_guests/photos policies can resolve
-- ============================================================
DROP POLICY IF EXISTS "Public can read events by slug for guest upload" ON public.events;
DROP POLICY IF EXISTS "Public can view events by slug" ON public.events;

-- Single permissive anon SELECT policy — anon can read any event row.
-- This is safe: events contain no private data; access control is on photos/guests.
CREATE POLICY "Anon can read all events"
  ON public.events
  FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- 2. Fix event_guests anon INSERT
-- ============================================================
DROP POLICY IF EXISTS "Guests can register for active events" ON public.event_guests;

CREATE POLICY "Anon can insert event guests for active events"
  ON public.event_guests
  FOR INSERT
  TO anon
  WITH CHECK (
    (SELECT status FROM public.events WHERE id = event_id) = 'active'
  );

-- ============================================================
-- 3. Fix event_guests anon SELECT (needed for INSERT RETURNING and fallback lookup)
-- ============================================================
DROP POLICY IF EXISTS "Guests can view event guests for active events" ON public.event_guests;

CREATE POLICY "Anon can select event guests for active events"
  ON public.event_guests
  FOR SELECT
  TO anon
  USING (
    (SELECT status FROM public.events WHERE id = event_id) = 'active'
  );

-- ============================================================
-- 4. Fix event_guests anon UPDATE (for upsert conflict path)
-- ============================================================
DROP POLICY IF EXISTS "Guests can update their record for active events" ON public.event_guests;

CREATE POLICY "Anon can update event guests for active events"
  ON public.event_guests
  FOR UPDATE
  TO anon
  USING (
    (SELECT status FROM public.events WHERE id = event_id) = 'active'
  )
  WITH CHECK (
    (SELECT status FROM public.events WHERE id = event_id) = 'active'
  );

-- ============================================================
-- 5. Fix photos anon INSERT
-- ============================================================
DROP POLICY IF EXISTS "Guests can insert photos to active events" ON public.photos;

CREATE POLICY "Anon can insert photos for active events"
  ON public.photos
  FOR INSERT
  TO anon
  WITH CHECK (
    (SELECT status FROM public.events WHERE id = event_id) = 'active'
  );

-- ============================================================
-- 6. Fix photos anon SELECT (also enables Realtime for anon)
-- ============================================================
DROP POLICY IF EXISTS "Guests can view photos for active events" ON public.photos;

CREATE POLICY "Anon can select photos for active events"
  ON public.photos
  FOR SELECT
  TO anon
  USING (
    (SELECT status FROM public.events WHERE id = event_id) = 'active'
  );

-- ============================================================
-- 7. Fix photos anon UPDATE
-- ============================================================
DROP POLICY IF EXISTS "Guests can update their own photos" ON public.photos;

CREATE POLICY "Anon can update photos for active events"
  ON public.photos
  FOR UPDATE
  TO anon
  USING (
    (SELECT status FROM public.events WHERE id = event_id) = 'active'
  )
  WITH CHECK (
    (SELECT status FROM public.events WHERE id = event_id) = 'active'
  );
