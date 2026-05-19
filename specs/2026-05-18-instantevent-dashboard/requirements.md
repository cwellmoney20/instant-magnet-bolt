# Requirements: InstantEvent Dashboard
**Date:** 2026-05-18

---

## Scope

### In Scope

- Four-page admin application: Dashboard (events list), Create Event, Event Detail, and a public Guest Upload page
- Four-table Supabase schema: events, event_guests, photos, email_notifications
- Real-time photo streaming from guest uploads to the admin dashboard
- QR code generation per event linking to the public upload URL
- Four-stage photo status workflow: new → printing → printed → completed
- Automated email notification to guest when their photo is marked completed
- Square (1:1) crop tool on the guest upload page for consistent magnet output
- Guest name + email capture on upload, normalized to prevent duplicate notifications
- Supabase Storage for all photo and cover image files
- Mobile-first design for the guest upload page (primary QR scan target)

### Out of Scope (v1)

- Admin authentication / login system (no auth in v1)
- Multi-user admin accounts or team permissions
- Payment processing or pricing
- Print queue hardware integrations
- Photo editing beyond the square crop
- Guest-facing photo gallery to browse all event photos
- Bulk ZIP download of event photos
- Custom event branding (custom colors/logo on upload page)

---

## Key Decisions

### Why `event_guests` is its own table (not denormalized onto photos)

A guest uploading multiple photos should receive **one** notification email when their magnets are ready — not one per photo. Normalizing guest identity into `event_guests` (with a `unique(event_id, email)` constraint) lets the notification Edge Function look up the guest once and check whether a notification was already sent, preventing duplicate emails regardless of how many photos they uploaded.

### Why slug is the public-facing identifier (not UUID)

UUIDs in URLs are hostile to QR codes (long, unreadable, fragile if mistyped). A slug like `smith-jones-wed` keeps URLs short, brandable, and human-readable. The slug is auto-generated from the event title but is user-editable before creation.

### Why email sends on `completed` and not `printed`

`printed` means the admin has selected the photo for printing — the magnet is still being physically produced. `completed` means the magnet is done and in the customer's hands (or ready to pick up). Sending the email at `completed` ensures the customer is only notified when their product is actually ready.

### Crop locked to 1:1 square

All magnets are square format. Locking the crop tool to 1:1 ensures every uploaded photo produces consistent magnet output without any post-processing resizing or cropping by the admin.

### Edge Function for email (not client-side)

The Resend API key must never be exposed in client-side code. A Supabase Edge Function triggered by a database webhook handles the send server-side. The `email_notifications` table provides an audit trail and failure capture for any retry logic.

### No guest authentication

Guests have no account and should not be asked to create one. Identity is captured via name + email at upload time. The `event_guests` unique constraint on `(event_id, email)` handles deduplication. This keeps the upload flow under 60 seconds on mobile.

### Photo status workflow

| Status | Meaning | Triggered By |
|---|---|---|
| `new` | Just uploaded by guest | Automatic on insert |
| `printing` | Admin selected for print batch | Admin clicks "Print Selected" |
| `printed` | Physical print produced | Admin clicks "Mark Printed" |
| `completed` | Magnet finished, customer notified | Admin clicks "Complete" |

---

## Database Schema

### `events`
```sql
id            uuid        PK
title         text        NOT NULL
description   text
event_type    text        (wedding, market, birthday, corporate, other)
date          date        NOT NULL
time          time
location      text
cover_photo_path text
slug          text        UNIQUE NOT NULL
status        text        DEFAULT 'active' CHECK IN ('draft','active','archived')
created_at    timestamptz DEFAULT now()
updated_at    timestamptz DEFAULT now()
```

### `event_guests`
```sql
id            uuid        PK
event_id      uuid        FK → events(id) ON DELETE CASCADE
name          text        NOT NULL
email         text        NOT NULL
created_at    timestamptz DEFAULT now()
UNIQUE(event_id, email)
```

### `photos`
```sql
id                uuid        PK
event_id          uuid        FK → events(id) ON DELETE CASCADE
event_guest_id    uuid        FK → event_guests(id) ON DELETE CASCADE
storage_path      text        NOT NULL
status            text        DEFAULT 'new' CHECK IN ('new','printing','printed','completed')
uploaded_at       timestamptz DEFAULT now()
status_updated_at timestamptz DEFAULT now()
```

### `email_notifications`
```sql
id               uuid        PK
event_guest_id   uuid        FK → event_guests(id) ON DELETE CASCADE
photo_id         uuid        FK → photos(id) ON DELETE SET NULL (nullable)
email            text        NOT NULL (denormalized for audit log permanence)
type             text        DEFAULT 'magnet_ready'
status           text        DEFAULT 'pending' CHECK IN ('pending','sent','failed')
error_message    text
created_at       timestamptz DEFAULT now()
sent_at          timestamptz
```

### Indexes
```sql
-- Fastest filter tabs on event detail page
CREATE INDEX photos_event_id_status ON photos(event_id, status);

-- Fastest guest photo lookup for notifications
CREATE INDEX photos_event_guest_id ON photos(event_guest_id);

-- Duplicate send prevention check
CREATE INDEX email_notifications_event_guest_id ON email_notifications(event_guest_id);
```

---

## RLS Policy Summary

| Table | Public INSERT | Public SELECT | Auth UPDATE | Auth DELETE |
|---|---|---|---|---|
| events | No | No | Yes | Yes |
| event_guests | Yes (via slug lookup) | No | No | No |
| photos | Yes | No | Yes (status changes) | No |
| email_notifications | No | No | No | No |

Public upload page needs: SELECT on events (by slug, to show banner), INSERT on event_guests, INSERT on photos.
