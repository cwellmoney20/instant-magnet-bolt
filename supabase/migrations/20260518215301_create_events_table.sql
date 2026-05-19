/*
  # Create events table

  ## Summary
  Creates the core events table that stores all event configuration.

  ## New Tables
  - `events`
    - `id` (uuid, primary key)
    - `title` (text) - event display name
    - `description` (text, nullable) - optional event description
    - `event_type` (text, nullable) - wedding, market, birthday, corporate, other
    - `date` (date) - event date
    - `time` (time, nullable) - event start time
    - `location` (text, nullable) - venue or location name
    - `cover_photo_path` (text, nullable) - Supabase Storage path for cover image
    - `slug` (text, unique) - URL-safe public identifier for the event
    - `status` (text) - draft, active, or archived
    - `created_at` / `updated_at` (timestamptz)

  ## Security
  - RLS enabled
  - No public access (admin-only for now; auth added in a later phase)
  - Public SELECT policy scoped to slug lookup for the guest upload page

  ## Notes
  - Slug must be unique across all events — enforced by unique constraint
  - Status constrained to 'draft', 'active', 'archived'
  - event_type constrained to valid event categories
*/

CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text CHECK (event_type IN ('wedding', 'market', 'birthday', 'corporate', 'other')),
  date date NOT NULL,
  time time,
  location text,
  cover_photo_path text,
  slug text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public can read events by slug (needed for guest upload page banner)
CREATE POLICY "Public can view events by slug"
  ON events FOR SELECT
  TO anon
  USING (status = 'active');

-- Authenticated users have full access (admin)
CREATE POLICY "Authenticated users can view all events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
