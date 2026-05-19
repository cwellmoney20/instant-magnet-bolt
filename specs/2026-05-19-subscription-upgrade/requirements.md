# Requirements: Subscription Upgrade (Free/Pro Plans)

## Scope

Add a $1/month Pro subscription plan with a hard 3-event cap on the free tier.
Users who hit the free limit must upgrade to create more events.

## Business Rules

- **Free tier:** Up to 3 events maximum. Cap is enforced both in the UI and at the database level (Postgres trigger on events INSERT).
- **Pro tier:** Unlimited events at $1/month via Stripe Subscriptions.
- **Grandfathering:** Users who already have more than 3 events at ship time are capped — they cannot create new events until they upgrade. Existing events are not deleted.
- **Cancellation:** User retains Pro access until `current_period_end`; then webhook sets plan back to `free`.

## Stripe Configuration

- Product: `prod_UXmv7xS9hoWuKh` (InstantEvent Pro)
- Price: `price_1TYhLWJp2xMZehlhSFEhSBqJ` ($1.00 USD/month recurring)
- Webhook endpoint: `/functions/v1/stripe-subscription-webhook`
- Webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Webhook secret env var: `STRIPE_SUBSCRIPTION_WEBHOOK_SECRET`
- This is entirely separate from the existing per-photo payment webhook (`stripe-webhook`)

## User Flows

### Free user, under limit (< 3 events)
- Dashboard: no banner shown
- "Create Event" button works normally
- Sidebar shows "FREE PLAN — X/3 events used"

### Free user, at limit (>= 3 events)
- Dashboard: `UpgradeBanner` shown above event grid
- "Create Event" button/fab redirects to `/upgrade`
- `CreateEventPage` guard redirects to `/upgrade` if accessed directly
- DB trigger rejects insert with an error message

### Upgrade flow
1. User visits `/upgrade`, clicks "Upgrade Now — $1/mo"
2. `create-checkout-session` edge function creates Stripe Checkout Session
3. User is redirected to Stripe-hosted checkout
4. On success: redirected to `/?upgraded=true`
5. Dashboard shows success toast, strips query param, refreshes plan state
6. `stripe-subscription-webhook` fires `checkout.session.completed`, sets `plan = pro`

### Pro user
- No event creation restrictions
- Sidebar shows "PRO PLAN" badge
- `/upgrade` shows "Manage Subscription" button instead of upgrade CTA
- `/billing` shows renewal date, subscription status, "Manage subscription" link to Stripe portal

### Cancellation
1. User clicks "Manage subscription & payment method" on `/billing`
2. `create-billing-portal-session` edge function returns Stripe Billing Portal URL
3. User cancels via Stripe portal
4. `customer.subscription.deleted` webhook fires, plan set to `free`

## Decisions

- Plan state lives in `user_plans` table (one row per user, auto-created on sign-up via trigger)
- `events` table gets a `user_id` column to support per-user event count queries and scoped RLS
- RLS on `events` now scopes to `user_id = auth.uid()` for all admin operations
- `PlanContext` / `usePlan()` hook exposes `plan`, `eventCount`, `canCreateEvent`, and `refreshPlan` to all components
- Success/cancel URLs use `window.location.origin` for environment portability
