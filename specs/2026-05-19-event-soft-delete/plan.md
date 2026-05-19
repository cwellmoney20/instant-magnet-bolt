# Event Soft Delete — Plan

## Task Groups

### 1. Database
- [x] Migration: add `deleted_at timestamptz DEFAULT NULL` to `events`
- [x] Update SELECT RLS policy to add `deleted_at IS NULL` filter
- [x] Update UPDATE RLS policy to add `deleted_at IS NULL` filter

### 2. Types
- [x] Add `deleted_at: string | null` to `Event` interface in `src/types/database.ts`

### 3. UI — Confirmation Modal
- [x] Create `src/components/events/DeleteEventModal.tsx`
  - Modal pattern matching `EditEventModal` (fixed backdrop, centered panel)
  - Displays event title in confirmation text
  - Error/destructive styling on confirm button
  - Calls `supabase.from('events').update({ deleted_at: now })` on confirm
  - `onDeleted` callback navigates back to dashboard

### 4. UI — Delete Trigger
- [x] Update `EventHeader` to accept `onDelete` prop
- [x] Add DELETE button to top-right of header row (beside back navigation)
- [x] Wire `showDeleteModal` state in `EventDetailPage`
- [x] Render `DeleteEventModal` when `showDeleteModal` is true

### 5. Docs
- [x] Create `specs/2026-05-19-event-soft-delete/` with plan, requirements, validation
- [x] Update `roadmap.md` with Phase 14
