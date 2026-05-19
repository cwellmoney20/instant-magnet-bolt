/*
  # Add payment fields to photos table

  ## Summary
  Adds two new columns to the `photos` table to support Stripe payment tracking per photo.

  ## New Columns

  ### `photos` table
  - `payment_status` (text, default 'free') — tracks payment state; one of: `free`, `unpaid`, `paid`
    - `free`: photo belongs to a free event, no payment required
    - `unpaid`: photo belongs to a paid event but payment has not yet been confirmed
    - `paid`: Stripe PaymentIntent succeeded for this photo
  - `stripe_payment_intent_id` (text, nullable) — the Stripe PaymentIntent ID (set after the intent is created)

  ## Security
  - No RLS changes needed — existing policies already cover these columns
  - The webhook edge function uses the service role key to update payment_status

  ## Notes
  - All existing photos are set to `payment_status = 'free'` since they predate paid events
  - An index is added on `stripe_payment_intent_id` for fast webhook lookups
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE photos ADD COLUMN payment_status text NOT NULL DEFAULT 'free';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'photos' AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE photos ADD COLUMN stripe_payment_intent_id text DEFAULT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_photos_stripe_payment_intent_id
  ON photos (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;
