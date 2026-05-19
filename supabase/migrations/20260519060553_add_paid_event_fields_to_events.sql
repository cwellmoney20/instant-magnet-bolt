/*
  # Add paid event fields to events table

  ## Summary
  Adds two new columns to the `events` table to support per-event paid photo uploads.

  ## New Columns

  ### `events` table
  - `is_paid_event` (boolean, default false) — toggles whether guests must pay to upload a photo
  - `photo_price_cents` (integer, nullable) — fixed price in USD cents (e.g., 500 = $5.00); only relevant when `is_paid_event = true`

  ## Notes
  - Existing events are unaffected (they get `is_paid_event = false` by default)
  - No RLS changes needed — existing policies already cover these columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'is_paid_event'
  ) THEN
    ALTER TABLE events ADD COLUMN is_paid_event boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'photo_price_cents'
  ) THEN
    ALTER TABLE events ADD COLUMN photo_price_cents integer DEFAULT NULL;
  END IF;
END $$;
