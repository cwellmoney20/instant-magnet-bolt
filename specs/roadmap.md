# InstantEvent — Roadmap

> Living document. Check off tasks as they complete. Add dates when phases ship.

---

## Phase 0 — Foundation
*Project infrastructure and design system*

- [x] Install dependencies (react-router-dom, qrcode.react, react-image-crop)
- [x] Configure Tailwind with full design token set (colors, fonts, spacing, radii)
- [x] Add Google Fonts (Plus Jakarta Sans, Space Mono) to index.html
- [x] Initialize Supabase client (`src/lib/supabase.ts`)
- [x] Save DESIGN_SYSTEM.md to project root
- [x] Set up React Router with route scaffold in App.tsx
- [x] Add global CSS (polaroid-shadow, btn-extruded, dymo-label styles)

**Shipped:** 2026-05-18

---

## Phase 1 — Database & Storage
*All Supabase infrastructure*

- [x] Migration: `events` table with slug, status, cover_photo_path
- [x] Migration: `event_guests` table with unique(event_id, email) constraint
- [x] Migration: `photos` table with status enum and status_updated_at
- [x] Migration: `email_notifications` audit log table
- [x] Performance indexes on photos(event_id, status) and photos(event_guest_id)
- [x] RLS policies for all four tables
- [x] Supabase Storage bucket `event-photos` with public read
- [x] Supabase Realtime enabled on photos table

**Shipped:** 2026-05-18

---

## Phase 2 — Shared Layout
*Navigation and primitive components used across all pages*

- [x] `TopNavBar` component
- [x] `SideNavBar` component (desktop)
- [x] `BottomNavBar` component (mobile)
- [x] `AppLayout` wrapper (composes all three nav components)
- [x] `DymoLabel` primitive (black, blue, red, gray variants)
- [x] `ExtrudedButton` primitive (yellow primary, blue secondary)
- [x] `StatusBadge` component mapping photo status → DymoLabel variant

**Shipped:** 2026-05-18

---

## Phase 3 — Dashboard Page
*Events list and overview*

- [x] `DashboardHeader` with stats and Create Event CTA
- [x] `EventCard` component (cover photo, title, date, location, counts, status)
- [x] `EventList` grid with Supabase data wiring
- [x] Empty state with prompt to create first event
- [x] Loading skeleton state

**Shipped:** 2026-05-18

---

## Phase 4 — Create Event Page
*Event setup form*

- [x] `EventFormFields` (title, type, date, time, description, location)
- [x] `CoverPhotoUploader` (upload to Supabase Storage)
- [x] Slug auto-generator from title (editable)
- [x] Live QR code preview in sidebar
- [x] Public URL preview
- [x] Form submission → Supabase insert → redirect to event detail

**Shipped:** 2026-05-18

---

## Phase 5 — Event Detail Page
*Live photo management dashboard*

- [x] `EventHeader` (DYMO tag, headline, date/location, action buttons)
- [x] `EventSidebar` (stats panel + QR code panel)
- [x] `PolaroidCard` (white border, random tilt, checkbox, status tag, uploader name)
- [x] `FilterTabs` (All / New / Printing / Printed / Completed)
- [x] `PhotoGrid` with polaroid layout
- [x] Supabase Realtime subscription for live photo arrivals
- [x] Select/deselect logic for batch actions
- [x] Status update: new → printing → printed (Print Selected button)
- [x] Status update: printed → completed (Complete button, triggers email)

**Shipped:** 2026-05-18

---

## Phase 6 — Guest Upload Page
*Public mobile-first upload experience*

- [x] `EventBanner` (cover photo, title, welcoming message)
- [x] `GuestInfoForm` (name + email, upsert event_guest row)
- [x] `PhotoDropzone` (camera roll / file picker)
- [x] `CropTool` (1:1 locked square crop using react-image-crop)
- [x] `UploadConfirmation` (thank-you + email notification promise)
- [x] Full Supabase write flow (Storage + photos table insert)
- [x] Mobile-first responsive design

**Shipped:** 2026-05-18

---

## Phase 7 — Email Notifications
*Automated magnet-ready notification*

- [x] Supabase Edge Function `notify-magnet-ready`
- [x] Database webhook on photos status → completed
- [x] Duplicate-send guard (check email_notifications before sending)
- [x] Email send via Resend API
- [x] Write result back to email_notifications (sent / failed)

**Shipped:** 2026-05-18

---

## Phase 8 — Polish & QA
*Production readiness*

- [ ] Mobile responsiveness audit across all pages
- [ ] Loading skeletons for all async data
- [ ] Error boundary components
- [ ] Toast notifications for user actions
- [ ] RLS policy security review
- [ ] Accessibility pass (focus states, aria labels, contrast check)
- [x] Build verification (npm run build, 0 errors)

**Target:** TBD

---

## Phase 9 — Photo Batch Status Management
*Workflow tools for moving photos through the print lifecycle*

- [x] `src/lib/photos.ts` — `updatePhotoStatuses`, `getTransitions`, `triggerResendNotification` utilities
- [x] `BatchActionBar` — sticky floating bar with forward/backward CTAs and selection count
- [x] `BatchConfirmModal` — thumbnail review modal with per-photo remove before confirming
- [x] `CompletedPhotoMenu` — dropdown on completed cards: Reprint + Resend Notification
- [x] `PolaroidCard` — selectable on new/printing/printed; completed shows action menu
- [x] `PhotoGrid` — Select All toggle, clears selection on filter change, renders BatchActionBar
- [x] `EventHeader` — simplified to pure display component (no action buttons)
- [x] `EventDetailPage` — unified `handleBatchStatusChange`, toast notifications, modal state

**Shipped:** 2026-05-18

---

## Phase 10 — Admin Authentication
*Protect the admin dashboard with Supabase Auth email/password*

- [x] `src/context/AuthContext.tsx` — user state, signIn, signUp, signOut, loading flag
- [x] `src/components/auth/ProtectedRoute.tsx` — redirects unauthenticated users to `/login`
- [x] `src/pages/LoginPage.tsx` — email/password login form
- [x] `src/pages/SignUpPage.tsx` — email/password/confirm signup form
- [x] `src/App.tsx` — AuthProvider at root, `/login` + `/signup` routes, ProtectedRoute wrapping admin routes
- [x] `TopNavBar` — Collections + Events links only; sign-out button replaces profile icon
- [x] `SideNavBar` — Collections + Events links only; sign-out button added at bottom
- [x] `BottomNavBar` — Home + create button only; Print and Profile removed
- [x] Migration: events RLS tightened to require authenticated user for admin operations

**Shipped:** 2026-05-19

---

## Phase 11 — Paid Photo Uploads (Stripe)
*Per-event payment gate using Stripe*

- [x] Migration: `is_paid_event` (bool) and `photo_price_cents` (int) added to `events`
- [x] Migration: `payment_status` (free/unpaid/paid) and `stripe_payment_intent_id` added to `photos`
- [x] `EventFormFields` — "Paid Photo Upload" toggle + USD price input
- [x] `EditEventModal` — save `is_paid_event` and `photo_price_cents`
- [x] `CreateEventPage` — create paid events from the start
- [x] Edge Function `create-payment-intent` — creates Stripe PaymentIntent server-side, stores ID on photo
- [x] Edge Function `stripe-webhook` — verifies signature, updates `payment_status` to `paid` on success
- [x] `PaymentStep` component — Stripe.js card input, confirm payment, retry on failure
- [x] `GuestUploadPage` — payment-first flow: upload as `unpaid` → payment step → done
- [x] `PolaroidCard` — "UNPAID" badge overlay, blocked from selection
- [x] `FilterTabs` — optional "Unpaid" tab for paid events
- [x] `PhotoGrid` — wire unpaid filter, pass `isPaidEvent` prop
- [x] `EventSidebar` — "Pending Payment" stat and "PAID EVENT" indicator
- [x] Specs: `requirements.md`, `plan.md`, `validation.md`

**Shipped:** 2026-05-19

---

## Phase 12 — Subscription Plans (Free / Pro)
*$1/month Pro plan with 3-event free tier cap*

- [x] Migration: `user_plans` table (plan, stripe fields, auto-provision trigger on auth.users)
- [x] Migration: `user_id` column on `events`; per-user RLS policies; `check_event_limit` DB trigger
- [x] Edge Function `create-checkout-session` — JWT-verified, creates Stripe Checkout Session
- [x] Edge Function `create-billing-portal-session` — JWT-verified, creates Stripe Billing Portal session
- [x] Edge Function `stripe-subscription-webhook` — handles checkout.session.completed, subscription.updated, subscription.deleted
- [x] `src/context/PlanContext.tsx` — `usePlan()` hook with plan, eventCount, canCreateEvent, refreshPlan
- [x] `CreateEventPage` — passes `user_id` on insert; guard redirects to `/upgrade` when limit reached
- [x] `TopNavBar` / `SideNavBar` / `BottomNavBar` — gated Create Event button; Billing nav link; plan badge
- [x] `UpgradeBanner` — shown on dashboard when free plan + 3+ events
- [x] `UpgradePage` (`/upgrade`) — two-card Free/Pro layout with upgrade CTA
- [x] `BillingPage` (`/billing`) — plan details, renewal date, Stripe portal link
- [x] `DashboardPage` — `?upgraded=true` success toast + plan refresh
- [x] Specs: `requirements.md`, `plan.md`, `validation.md`

**Shipped:** 2026-05-19

---

## Phase 13 — Print Preview Modal
*Review and print photos before marking them as Printed*

- [x] `PrintPreviewModal` component — 3×3 photo grid preview with per-photo exclusion, page navigation, and browser print dialogue trigger
- [x] Print CSS — `@media print` rules that render a clean paginated polaroid grid, hiding all other UI
- [x] `EventDetailPage` — intercept `new → printed` transition to show print preview; "PRINT & MARK PRINTED" and "SKIP PRINT" paths both advance status correctly
- [x] Specs: `requirements.md`, `plan.md`, `validation.md`

**Shipped:** 2026-05-19

---

## Phase 14 — Event Soft Delete
*Safely remove events from the dashboard while preserving all data*

- [x] Migration: `deleted_at` (timestamptz, nullable) column on `events`; RLS SELECT/UPDATE policies updated to filter out deleted rows
- [x] `DeleteEventModal` — confirmation modal with event name, cancel and delete buttons (destructive red styling)
- [x] `EventHeader` — DELETE button added to the right of the back navigation row
- [x] `EventDetailPage` — `showDeleteModal` state; confirm navigates back to dashboard
- [x] `src/types/database.ts` — `deleted_at` field added to `Event` interface
- [x] Specs: `requirements.md`, `plan.md`, `validation.md`

**Shipped:** 2026-05-19

---

## Backlog (Future Phases)

- Multi-event gallery view for guests
- Bulk download of all event photos as ZIP
- Custom event branding (colors, logo on upload page)
- Print queue hardware integration
- Analytics dashboard (upload rate over time, completion rate)
- Guest-facing photo gallery to see all event photos
