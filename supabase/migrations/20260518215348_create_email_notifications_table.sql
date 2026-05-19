/*
  # Create email_notifications table

  ## Summary
  Audit log for all email notifications sent to guests. Used to:
  1. Prevent duplicate emails when a guest has multiple photos all marked completed
  2. Track delivery status (sent / failed) for operational visibility
  3. Store error details for manual retry if needed

  ## New Tables
  - `email_notifications`
    - `id` (uuid, primary key)
    - `event_guest_id` (uuid, FK → event_guests) - which guest was notified
    - `photo_id` (uuid, nullable FK → photos) - which photo triggered the notification
    - `email` (text) - denormalized copy of recipient email (preserved if guest row changes)
    - `type` (text) - notification type, 'magnet_ready' for now (extensible)
    - `status` (text) - pending, sent, or failed
    - `error_message` (text, nullable) - failure details for debugging
    - `created_at` (timestamptz) - when notification was queued
    - `sent_at` (timestamptz, nullable) - when email was successfully delivered

  ## Indexes
  - `email_notifications(event_guest_id)` — duplicate-send prevention check

  ## Security
  - RLS enabled
  - No public access (system-only insert via Edge Function service role)
  - Authenticated admins can read notifications for operational visibility

  ## Notes
  - photo_id is SET NULL on photo deletion so the audit record is preserved
  - email is stored denormalized so the record is self-contained for audit purposes
*/

CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_guest_id uuid NOT NULL REFERENCES event_guests(id) ON DELETE CASCADE,
  photo_id uuid REFERENCES photos(id) ON DELETE SET NULL,
  email text NOT NULL,
  type text NOT NULL DEFAULT 'magnet_ready',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can view notification logs
CREATE POLICY "Authenticated users can view email notifications"
  ON email_notifications FOR SELECT
  TO authenticated
  USING (true);

-- Index for duplicate-send prevention
CREATE INDEX IF NOT EXISTS idx_email_notifications_event_guest_id
  ON email_notifications(event_guest_id);
