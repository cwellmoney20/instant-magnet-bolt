/*
  # Add authenticated INSERT policies for guest upload flow

  ## Problem
  When a logged-in user (e.g. the event owner) visits the guest upload page,
  their requests use the `authenticated` role. There are no INSERT policies
  for `authenticated` on event_guests or photos, causing 403 errors.

  ## Changes
  - Add INSERT policy on event_guests for authenticated users (active events)
  - Add INSERT policy on photos for authenticated users (active events)
*/

CREATE POLICY "Authenticated can insert event guests for active events"
  ON public.event_guests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT status FROM public.events WHERE id = event_id) = 'active'
  );

CREATE POLICY "Authenticated can insert photos for active events"
  ON public.photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT status FROM public.events WHERE id = event_id) = 'active'
  );
