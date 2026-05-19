/*
  # Create Supabase Storage bucket for event photos

  ## Summary
  Sets up the storage infrastructure for all event-related photos.

  ## Changes
  - Creates `event-photos` storage bucket with public read access
  - Allows public uploads (for guest upload page)
  - Allows public reads (for displaying photos in admin dashboard)

  ## Notes
  - Bucket is public so photos can be displayed without auth tokens in img tags
  - Upload access is controlled at the application level via the guest upload flow
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'event-photos',
  'event-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public reads on the bucket
CREATE POLICY "Public can read event photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'event-photos');

-- Allow anyone to upload photos (guest upload page)
CREATE POLICY "Public can upload event photos"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'event-photos');

-- Allow authenticated users to manage photos
CREATE POLICY "Authenticated users can manage event photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-photos');
