# Paid Photo Uploads — Requirements

## Overview

Add a per-event toggle that marks an event as "paid." When enabled, guests must complete a Stripe payment before their photo upload is considered complete.

---

## Scope

### In Scope

- A toggle on each event (in Event Settings and Create Event form) to enable paid uploads
- A fixed USD price field that appears when the toggle is on
- Payment-first flow: the photo is saved to storage as `unpaid`, Stripe payment is collected, then the photo status is confirmed as `paid`
- Stripe Elements card UI on the guest upload page
- Admin dashboard visibility: unpaid badge on photos, "Pending Payment" count in sidebar, "Unpaid" filter tab for paid events
- Unpaid photos are blocked from batch selection/printing
- Stripe test mode during development

### Out of Scope

- Multiple price tiers per event
- Non-USD currencies
- Refund flows
- Subscription or recurring billing
- Guest-facing payment history

---

## Decisions & Context

### Payment Model

- Single fixed price per event, set by the admin in cents (USD)
- Displayed to guests in dollars (e.g., `$5.00`)
- Free events (`is_paid_event = false`) bypass all payment logic entirely — no code path change for them

### Payment-First Flow

1. Guest completes crop step
2. Photo is uploaded to Supabase Storage
3. Photo record is inserted with `payment_status = 'unpaid'` and `stripe_payment_intent_id = null`
4. `create-payment-intent` Edge Function is called; returns `client_secret` + `payment_intent_id`
5. The `payment_intent_id` is stored on the photo record immediately
6. Guest sees payment step (Stripe card input)
7. On `stripe.confirmCardPayment()` success, advance to done step
8. Stripe webhook (`payment_intent.succeeded`) updates photo `payment_status` to `paid`

This means no photo ever reaches the admin queue without a corresponding Stripe PaymentIntent, even if payment hasn't yet been confirmed by webhook.

### Stripe Key Strategy

- Secret key (`STRIPE_SECRET_KEY`) lives only in Supabase Edge Function secrets — never exposed to the client
- Publishable key (`STRIPE_PUBLISHABLE_KEY`) is stored as a Supabase Edge Function secret and returned by the `create-payment-intent` function alongside the `client_secret`, so the guest client can initialize Stripe.js without hardcoding any key in the frontend bundle
- Webhook signing secret (`STRIPE_WEBHOOK_SECRET`) lives in Edge Function secrets for signature verification

### Unpaid Photo Handling

- Unpaid photos are visible to admins but cannot be selected for batch printing
- They show an "UNPAID" overlay badge on the polaroid card
- They appear in an "Unpaid" filter tab (only shown for paid events)
- Admins can see the count in the event sidebar

### Stripe Test Mode

- Use `pk_test_` / `sk_test_` keys during development
- Test card: `4242 4242 4242 4242`, any future date, any CVC

---

## New Database Columns

### `events` table

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `is_paid_event` | boolean | false | Whether guests must pay to upload |
| `photo_price_cents` | integer | null | Price per photo in USD cents (only relevant when `is_paid_event = true`) |

### `photos` table

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `payment_status` | text | 'free' | One of: `free`, `unpaid`, `paid` |
| `stripe_payment_intent_id` | text | null | Stripe PaymentIntent ID for tracking |

---

## New Edge Functions

### `create-payment-intent`
- **Auth:** Called with Supabase anon key (public, no auth required)
- **Input:** `{ event_id: string, guest_id: string, photo_id: string }`
- **Behavior:** Looks up `photo_price_cents` from event, creates Stripe PaymentIntent, stores `payment_intent_id` on the photo record, returns `{ client_secret, payment_intent_id, publishable_key }`

### `stripe-webhook`
- **Auth:** No JWT verification (Stripe calls this externally); verifies via `STRIPE_WEBHOOK_SECRET`
- **Input:** Raw Stripe webhook event body
- **Behavior:** On `payment_intent.succeeded`, finds the photo by `stripe_payment_intent_id`, updates `payment_status` to `paid`
