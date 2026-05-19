# Feature Plan: InstantEvent Dashboard
**Date:** 2026-05-18
**Status:** In Progress

---

## Group A — Setup & Config

- [x] Install react-router-dom, qrcode.react, react-image-crop
- [x] Configure Tailwind with design tokens from DESIGN_SYSTEM.md
- [x] Add Google Fonts to index.html
- [x] Create `src/lib/supabase.ts` with singleton client
- [x] Create `src/types/database.ts` with TypeScript types for all tables
- [x] Set up React Router routes in App.tsx

---

## Group B — Database & Storage

- [x] Migration: events table
- [x] Migration: event_guests table
- [x] Migration: photos table
- [x] Migration: email_notifications table
- [x] Migration: indexes and constraints
- [x] Migration: RLS policies
- [x] Supabase Storage bucket for event photos

---

## Group C — Layout Shell

- [x] `src/components/layout/TopNavBar.tsx`
- [x] `src/components/layout/SideNavBar.tsx`
- [x] `src/components/layout/BottomNavBar.tsx`
- [x] `src/components/layout/AppLayout.tsx`

---

## Group D — Primitive Components

- [x] `src/components/ui/DymoLabel.tsx`
- [x] `src/components/ui/ExtrudedButton.tsx`
- [x] `src/components/ui/StatusBadge.tsx`
- [x] `src/components/ui/QRCodeDisplay.tsx`
- [x] `src/components/ui/LoadingSkeleton.tsx`

---

## Group E — Dashboard (Events List)

- [x] `src/pages/DashboardPage.tsx`
- [x] `src/components/dashboard/DashboardHeader.tsx`
- [x] `src/components/dashboard/EventCard.tsx`
- [x] `src/components/dashboard/EventList.tsx`
- [x] `src/components/dashboard/EmptyState.tsx`

---

## Group F — Create Event

- [x] `src/pages/CreateEventPage.tsx`
- [x] `src/components/events/EventFormFields.tsx`
- [x] `src/components/events/CoverPhotoUploader.tsx`
- [x] `src/components/events/SlugField.tsx`

---

## Group G — Event Detail

- [x] `src/pages/EventDetailPage.tsx`
- [x] `src/components/events/EventHeader.tsx`
- [x] `src/components/events/EventSidebar.tsx`
- [x] `src/components/events/PolaroidCard.tsx`
- [x] `src/components/events/PhotoGrid.tsx`
- [x] `src/components/events/FilterTabs.tsx`

---

## Group H — Guest Upload

- [x] `src/pages/GuestUploadPage.tsx`
- [x] `src/components/upload/EventBanner.tsx`
- [x] `src/components/upload/GuestInfoForm.tsx`
- [x] `src/components/upload/PhotoDropzone.tsx`
- [x] `src/components/upload/CropTool.tsx`
- [x] `src/components/upload/UploadConfirmation.tsx`

---

## Group I — Email Notifications

- [x] `supabase/functions/notify-magnet-ready/index.ts` Edge Function
- [x] Database webhook configured for photos status change
- [x] Resend API integration with duplicate-send guard
