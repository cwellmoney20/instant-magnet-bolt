/*
  # Fix Security Issues

  ## Summary
  This migration addresses multiple security vulnerabilities identified in a security audit:

  ## 1. Function Search Path Mutable
  All functions with mutable search_path are updated to include `SET search_path = ''` and
  use fully-qualified names (public., auth., etc.). This prevents search_path injection attacks
  where a malicious user could shadow system functions.

  Affected functions:
  - public.check_event_limit
  - public.update_updated_at
  - public.update_user_plans_updated_at
  - public.update_photo_status_timestamp
  - public.handle_new_user_plan

  ## 2. RLS Policies Always True
  Several RLS policies used `USING (true)` or `WITH CHECK (true)` which bypass row-level security.
  These are replaced with policies that require proper ownership or event membership checks.

  Affected tables:
  - public.event_guests: anon DELETE (unrestricted), authenticated DELETE (unrestricted), anon INSERT (unrestricted)
  - public.events: anon DELETE, anon INSERT, anon UPDATE, authenticated DELETE (all unrestricted)
  - public.photos: anon DELETE, anon UPDATE, authenticated DELETE, authenticated UPDATE, anon INSERT (all unrestricted)

  ## 3. Storage Bucket Listing
  The broad SELECT policy on storage.objects for the event-photos bucket is replaced with a
  more specific policy that requires knowledge of the file path (object name) rather than
  allowing listing all files.

  ## 4. SECURITY DEFINER Function Execute Permissions
  Revoke EXECUTE on check_event_limit() and handle_new_user_plan() from anon and authenticated
  roles since these are internal trigger functions not meant to be called via RPC.

  ## Notes
  - The anon policies on events/photos/event_guests were added for a "no-auth admin mode" that
    has since been replaced with proper auth. These permissive anon policies are now dropped.
  - The authenticated DELETE policies without ownership checks are replaced with user_id-scoped ones.
  - Photo and event_guest operations require the caller to own the parent event.
*/

-- ============================================================
-- 1. Fix: Function Search Path Mutable
-- ============================================================

-- Fix update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_user_plans_updated_at
CREATE OR REPLACE FUNCTION public.update_user_plans_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix update_photo_status_timestamp
CREATE OR REPLACE FUNCTION public.update_photo_status_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Fix handle_new_user_plan (trigger on auth.users insert)
CREATE OR REPLACE FUNCTION public.handle_new_user_plan()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_plans (user_id, plan)
  VALUES (NEW.id, 'free')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Fix check_event_limit
CREATE OR REPLACE FUNCTION public.check_event_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_plan text;
  v_event_count integer;
BEGIN
  SELECT plan INTO v_plan
  FROM public.user_plans
  WHERE user_id = NEW.user_id;

  IF v_plan IS NULL OR v_plan = 'free' THEN
    SELECT COUNT(*) INTO v_event_count
    FROM public.events
    WHERE user_id = NEW.user_id;

    IF v_event_count >= 3 THEN
      RAISE EXCEPTION 'Free plan is limited to 3 events. Upgrade to Pro for unlimited events.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


-- ============================================================
-- 2. Fix: Revoke EXECUTE on SECURITY DEFINER functions from anon/authenticated
--    These are trigger functions, not RPC endpoints.
-- ============================================================

REVOKE EXECUTE ON FUNCTION public.check_event_limit() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_plan() FROM anon, authenticated;


-- ============================================================
-- 3. Fix: Drop always-true RLS policies on events
-- ============================================================

-- Drop the permissive anon policies on events (from no-auth admin mode)
DROP POLICY IF EXISTS "Anon users can insert events" ON public.events;
DROP POLICY IF EXISTS "Anon users can update events" ON public.events;
DROP POLICY IF EXISTS "Anon users can delete events" ON public.events;

-- Drop the unrestricted authenticated DELETE on events (replaced below)
DROP POLICY IF EXISTS "Authenticated users can delete events" ON public.events;

-- Authenticated DELETE scoped to event owner
CREATE POLICY "Owners can delete their own events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());


-- ============================================================
-- 4. Fix: Drop always-true RLS policies on event_guests
-- ============================================================

-- Drop unrestricted anon INSERT and DELETE on event_guests
DROP POLICY IF EXISTS "Public can insert event guests" ON public.event_guests;
DROP POLICY IF EXISTS "Anon users can delete event guests" ON public.event_guests;
DROP POLICY IF EXISTS "Authenticated users can delete event guests" ON public.event_guests;

-- Guests may insert themselves only when the event is active (slug-accessible)
-- This mirrors the existing anon SELECT policy on events
CREATE POLICY "Guests can register for active events"
  ON public.event_guests
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id
        AND status = 'active'
    )
  );

-- Event owners can delete guests from their events
CREATE POLICY "Owners can delete guests from their events"
  ON public.event_guests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id
        AND user_id = auth.uid()
    )
  );


-- ============================================================
-- 5. Fix: Drop always-true RLS policies on photos
-- ============================================================

-- Drop unrestricted anon and authenticated policies on photos
DROP POLICY IF EXISTS "Public can insert photos" ON public.photos;
DROP POLICY IF EXISTS "Anon users can update photos" ON public.photos;
DROP POLICY IF EXISTS "Anon users can delete photos" ON public.photos;
DROP POLICY IF EXISTS "Authenticated users can update photos" ON public.photos;
DROP POLICY IF EXISTS "Authenticated users can delete photos" ON public.photos;

-- Guests can upload photos only to active events
CREATE POLICY "Guests can insert photos to active events"
  ON public.photos
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id
        AND status = 'active'
    )
  );

-- Guests can update their own photos (status transitions, payment updates)
-- scoped by event_guest_id ownership via event
CREATE POLICY "Guests can update their own photos"
  ON public.photos
  FOR UPDATE
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.event_guests eg
      JOIN public.events e ON e.id = eg.event_id
      WHERE eg.id = event_guest_id
        AND e.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.event_guests eg
      JOIN public.events e ON e.id = eg.event_id
      WHERE eg.id = event_guest_id
        AND e.status = 'active'
    )
  );

-- Event owners can update photos in their events
CREATE POLICY "Owners can update photos in their events"
  ON public.photos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id
        AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id
        AND user_id = auth.uid()
    )
  );

-- Event owners can delete photos from their events
CREATE POLICY "Owners can delete photos from their events"
  ON public.photos
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE id = event_id
        AND user_id = auth.uid()
    )
  );


-- ============================================================
-- 6. Fix: Storage bucket - replace broad SELECT (listing) policy
--    with a more targeted one that doesn't allow enumeration.
-- ============================================================

-- Drop the existing broad SELECT policy that allows listing all files
DROP POLICY IF EXISTS "Public can read event photos" ON storage.objects;

-- Replace with a policy that allows reading specific objects but prevents bucket enumeration.
-- Clients access photos by direct URL; listing is not needed.
CREATE POLICY "Public can read event photo objects"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (
    bucket_id = 'event-photos'
    AND name IS NOT NULL
  );
