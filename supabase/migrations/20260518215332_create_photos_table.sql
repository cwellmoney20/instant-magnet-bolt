/*
  # Create photos table

  ## Summary
  Stores every uploaded photo with its fulfillment status. Each photo belongs
  to both an event and a specific guest.

  ## New Tables
  - `photos`
    - `id` (uuid, primary key)
    - `event_id` (uuid, FK → events) - denormalized for fast per-event queries
    - `event_guest_id` (uuid, FK → event_guests) - which guest uploaded this
    - `storage_path` (text) - Supabase Storage file path for the cropped image
    - `status` (text) - new → printing → printed → completed
    - `uploaded_at` (timestamptz) - when the photo was uploaded
    - `status_updated_at` (timestamptz) - when the status last changed

  ## Status Workflow
    new       → Guest just uploaded
    printing  → Admin selected for print batch
    printed   → Physical print produced
    completed → Magnet finished; triggers email notification to guest

  ## Indexes
  - `photos(event_id, status)` — powers filter tabs on event detail page
  - `photos(event_guest_id)` — fast guest photo lookup for notifications

  ## Security
  - RLS enabled
  - Public (anon) can INSERT — required for the guest upload page
  - No public SELECT
  - Authenticated users can read and update (status changes by admin)

  ## Notes
  - ON DELETE CASCADE from events and event_guests for clean data removal
  - status_updated_at is updated via trigger whenever status changes
*/

CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  event_guest_id uuid NOT NULL REFERENCES event_guests(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'printing', 'printed', 'completed')),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  status_updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Public guests can insert photos (upload page — no auth)
CREATE POLICY "Public can insert photos"
  ON photos FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated admins can view all photos
CREATE POLICY "Authenticated users can view photos"
  ON photos FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated admins can update photo status
CREATE POLICY "Authenticated users can update photos"
  ON photos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete photos"
  ON photos FOR DELETE
  TO authenticated
  USING (true);

-- Update status_updated_at when status changes
CREATE OR REPLACE FUNCTION update_photo_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.status_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER photos_status_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_status_timestamp();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_photos_event_id_status ON photos(event_id, status);
CREATE INDEX IF NOT EXISTS idx_photos_event_guest_id ON photos(event_guest_id);
CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);
