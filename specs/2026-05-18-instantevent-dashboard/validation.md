# Validation: InstantEvent Dashboard
**Date:** 2026-05-18

---

## How to Know It Works

Each section below describes what to check and what success looks like.

---

## Phase 0 — Foundation

| Check | Expected Result |
|---|---|
| App loads at localhost | No blank screen, no console errors |
| Tailwind primary color renders | A button or element shows `#735c00` (golden brown), not default blue |
| Plus Jakarta Sans loads | Headings render in the correct rounded-geometric sans-serif |
| Space Mono loads | DYMO label tags render in monospace |
| Supabase client import | No "missing env var" errors in console |
| Routes render | `/`, `/events/create`, `/events/:id`, `/upload/:slug` all load without 404 |

---

## Phase 1 — Database

| Check | Expected Result |
|---|---|
| All 4 tables visible in Supabase Studio | events, event_guests, photos, email_notifications present |
| Insert a test event via SQL | Row appears in events table |
| Insert a test photo via SQL | Row appears in photos table with status = 'new' |
| Invalid status value rejected | INSERT with status = 'invalid' fails with check constraint error |
| RLS blocks anon read on events | `supabase.from('events').select()` without auth returns empty or error |
| Public INSERT on event_guests works | Insert row without auth token — succeeds |
| Public INSERT on photos works | Insert row without auth token — succeeds |
| Unique constraint on event_guests | Inserting same email for same event twice returns unique violation |
| Photos bucket exists | Supabase Storage shows `event-photos` bucket with public policy |

---

## Phase 2 — Layout

| Check | Expected Result |
|---|---|
| TopNavBar renders on all admin pages | InstantEvent brand, nav links, and Create Event button visible |
| SideNavBar hidden on mobile | Not visible at < 768px viewport |
| BottomNavBar hidden on desktop | Not visible at >= 768px viewport |
| DymoLabel black variant | Black background, white Space Mono text |
| DymoLabel red variant | `#bb1615` background, white text |
| ExtrudedButton active state | Slight downward press animation on click |

---

## Phase 3 — Dashboard

| Check | Expected Result |
|---|---|
| Empty state shows with no events | Illustration + "Create your first event" prompt visible |
| Event card renders after insert | Card shows title, date, location, cover photo, photo count |
| Photo count is accurate | Count matches number of rows in photos table for that event_id |
| Status tag matches event status | Active event shows "LIVE" tag, archived shows "ARCHIVED" |
| Create Event button navigates | Clicking goes to `/events/create` |

---

## Phase 4 — Create Event

| Check | Expected Result |
|---|---|
| Title → slug auto-generation | Typing "Smith Jones Wedding" produces slug "smith-jones-wedding" |
| Slug is editable | User can manually override the generated slug |
| Public URL preview updates | URL preview shows correct slug as user types |
| QR code preview renders | QR code image appears in sidebar and encodes the correct URL |
| Cover photo uploads to Storage | After submit, file appears in Supabase Storage `event-photos` bucket |
| Form submit creates event row | New row visible in events table in Supabase Studio |
| Redirect after submit | User lands on `/events/[new-id]` after successful creation |
| Validation blocks empty title | Submit without title shows inline error |
| Duplicate slug rejected | Trying to create two events with same slug shows error |

---

## Phase 5 — Event Detail

| Check | Expected Result |
|---|---|
| Photos render as polaroid cards | White border, slight random tilt, status DYMO tag in corner |
| Uploader name shown | Guest name from event_guests visible below each photo |
| Filter tabs work | Clicking "New" shows only photos with status = 'new' |
| Photo counts in sidebar accurate | Total, Printed, Pending counts match actual table data |
| QR code displays | QR panel in sidebar shows scannable code for event slug |
| Real-time: insert photo in Studio | New photo appears in grid within 2 seconds without page refresh |
| Select checkbox | Clicking checkbox marks photo as selected (visual highlight) |
| Print Selected button | Selected photos move to status 'printing', count updates |
| Complete button | Selected printed photos move to status 'completed' |

---

## Phase 6 — Guest Upload

| Check | Expected Result |
|---|---|
| `/upload/[slug]` loads on mobile | Event banner, title, and form render without horizontal scroll |
| Invalid slug shows 404 | `/upload/does-not-exist` shows "Event not found" message |
| Guest info form creates row | Submitting name + email inserts row in event_guests (or finds existing) |
| Crop tool locks to 1:1 | Cannot drag the crop selection to a non-square ratio |
| Upload writes to Storage | Photo file appears in Supabase Storage after upload |
| Upload writes photos row | New row in photos table with status = 'new' |
| Photo appears in admin dashboard | After guest upload, card appears in `/events/:id` grid in real time |
| Confirmation screen shows | Thank-you message with email notification promise displays after upload |

---

## Phase 7 — Email Notifications

| Check | Expected Result |
|---|---|
| Edge Function deployed | Function visible in Supabase Edge Functions list |
| Webhook fires on status = completed | Updating a photo status to 'completed' triggers the Edge Function |
| Guest receives email | Email arrives at the address entered at upload time |
| Email subject/body correct | Subject mentions event name; body says magnet is ready |
| email_notifications row created | Row in email_notifications with status = 'sent' and sent_at timestamp |
| No duplicate email on second photo | Marking a second photo 'completed' for same guest does NOT send another email |
| Failed send logs error | If Resend call fails, email_notifications row shows status = 'failed' with error_message |

---

## Overall Smoke Test (End-to-End)

1. Admin creates an event called "Test Market" → slug `test-market`
2. Admin sees event card on dashboard
3. Guest visits `/upload/test-market` on mobile
4. Guest enters name "Jane Doe" and email `jane@example.com`
5. Guest picks a photo, crops to square, uploads
6. Admin sees Jane's photo appear live in the Event Detail grid with status "NEW"
7. Admin selects the photo and clicks "Print Selected" → status changes to "PRINTING"
8. Admin clicks "Mark Printed" → status changes to "PRINTED"
9. Admin clicks "Complete" → status changes to "COMPLETED"
10. Jane receives an email at `jane@example.com` saying her magnet is ready
11. `email_notifications` table has one row with status = 'sent'
