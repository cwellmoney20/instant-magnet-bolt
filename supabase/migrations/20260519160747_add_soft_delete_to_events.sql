/*
  # Add Soft Delete to Events

  ## Summary
  Adds soft-delete support to the events table using a nullable `deleted_at` timestamp.
  Deleted events are preserved in the database with photos intact, but are hidden from
  all user-facing queries via updated RLS policies.

  ## Changes

  ### Modified Tables
  - `events`
    - Added `deleted_at` (timestamptz, nullable) — set to current timestamp when an event
      is soft-deleted; NULL means the event is active/visible

  ### Security Changes
  - Updated SELECT RLS policy on `events` to filter out rows where `deleted_at IS NOT NULL`
  - Updated UPDATE RLS policy on `events` to only allow updating non-deleted rows
    (so clients cannot accidentally update a deleted event)

  ## Notes
  1. Soft-delete: calling `UPDATE events SET deleted_at = now() WHERE id = ?` marks as deleted
  2. Restoration is possible by setting `deleted_at = NULL` (admin operation)
  3. Photos belonging to deleted events remain in the `photos` table untouched
  4. The dashboard query will automatically exclude deleted events via RLS
*/

-- Add the soft-delete column
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz DEFAULT NULL;

-- Drop and recreate the SELECT policy to filter out soft-deleted events
DROP POLICY IF EXISTS "Users can view their own events" ON events;
DROP POLICY IF EXISTS "Authenticated users can view own events" ON events;

CREATE POLICY "Users can view non-deleted own events"
  ON events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Drop and recreate the UPDATE policy to prevent updating deleted events
DROP POLICY IF EXISTS "Users can update their own events" ON events;
DROP POLICY IF EXISTS "Authenticated users can update own events" ON events;

CREATE POLICY "Users can update non-deleted own events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);
