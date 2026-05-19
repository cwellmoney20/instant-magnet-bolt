/*
  # Create event_guests table

  ## Summary
  Stores guest identity per event. Normalized separately from photos to prevent
  duplicate notification emails when a guest uploads multiple photos.

  ## New Tables
  - `event_guests`
    - `id` (uuid, primary key)
    - `event_id` (uuid, FK → events) - which event the guest attended
    - `name` (text) - guest's name as entered at upload time
    - `email` (text) - guest's email for magnet-ready notification
    - `created_at` (timestamptz)

  ## Constraints
  - UNIQUE(event_id, email) - one guest record per event per email address.
    If the same person uploads again at the same event, their existing guest
    record is reused via upsert.

  ## Security
  - RLS enabled
  - Public (anon) can INSERT — required for the guest upload page (no auth)
  - No public SELECT (guest data is private)
  - Authenticated users can read all guests for their events (admin dashboard)

  ## Notes
  - ON DELETE CASCADE from events ensures cleanup when an event is deleted
*/

CREATE TABLE IF NOT EXISTS event_guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(event_id, email)
);

ALTER TABLE event_guests ENABLE ROW LEVEL SECURITY;

-- Public guests can insert their own record (for the upload page)
CREATE POLICY "Public can insert event guests"
  ON event_guests FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users (admins) can view all guests
CREATE POLICY "Authenticated users can view event guests"
  ON event_guests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete event guests"
  ON event_guests FOR DELETE
  TO authenticated
  USING (true);
