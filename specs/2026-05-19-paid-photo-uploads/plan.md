# Paid Photo Uploads — Implementation Plan

## Task Group 1: Database Schema

- [ ] Migration: add `is_paid_event` (bool, default false) and `photo_price_cents` (int, nullable) to `events`
- [ ] Migration: add `payment_status` (text, default 'free') and `stripe_payment_intent_id` (text, nullable) to `photos`
- [ ] Update TypeScript types in `src/types/database.ts`

## Task Group 2: Event Settings UI

- [ ] Add "Pricing" section to `EventFormFields` with toggle + price input
- [ ] Update `EditEventModal` form state and save logic for new fields
- [ ] Update `CreateEventPage` form state and insert logic for new fields

## Task Group 3: Stripe Edge Functions

- [ ] Deploy `create-payment-intent` Edge Function
- [ ] Deploy `stripe-webhook` Edge Function (JWT verify = false)
- [ ] Add `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` to Supabase secrets

## Task Group 4: Guest Upload Payment Flow

- [ ] Add `PaymentStep` component (`src/components/upload/PaymentStep.tsx`)
- [ ] Update `GuestUploadPage` to insert photo as `unpaid`, call edge function, show payment step
- [ ] Handle payment success → advance to done step
- [ ] Handle payment failure → show error with retry

## Task Group 5: Admin Dashboard Payment Visibility

- [ ] `PolaroidCard`: add "UNPAID" badge overlay for `payment_status === 'unpaid'`
- [ ] `PolaroidCard`: block selection for unpaid photos
- [ ] `FilterTabs`: add "Unpaid" tab (only shown for paid events)
- [ ] `PhotoGrid`: wire up unpaid filter
- [ ] `EventSidebar`: add "Pending Payment" stat for paid events

## Task Group 6: Documentation

- [ ] `specs/2026-05-19-paid-photo-uploads/requirements.md`
- [ ] `specs/2026-05-19-paid-photo-uploads/plan.md`
- [ ] `specs/2026-05-19-paid-photo-uploads/validation.md`
- [ ] Update `specs/roadmap.md`
