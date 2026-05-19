# Plan: Subscription Upgrade

## Task Groups

### Group 1 — Database
- [x] Migration `add_user_plans_table`: create `user_plans` table, RLS (read-own), auto-provision trigger on `auth.users`, `check_event_limit` Postgres trigger on `events`
- [x] Migration `scope_events_rls_to_user_id`: add `user_id` column to `events`, update RLS policies to scope by ownership

### Group 2 — Edge Functions
- [x] `create-checkout-session`: verify JWT → create/retrieve Stripe Customer → create Checkout Session → return URL
- [x] `create-billing-portal-session`: verify JWT → lookup stripe_customer_id → create Billing Portal session → return URL
- [x] `stripe-subscription-webhook`: verify signature → handle `checkout.session.completed` / `customer.subscription.updated` / `customer.subscription.deleted`

### Group 3 — Plan Context
- [x] `src/context/PlanContext.tsx`: `PlanProvider` + `usePlan()` hook; fetches `user_plans` row + event count on mount; exposes `plan`, `eventCount`, `canCreateEvent`, `refreshPlan`
- [x] `src/App.tsx`: wrap all routes with `PlanProvider` (inside `AuthProvider`); add `/upgrade` and `/billing` protected routes

### Group 4 — Event Creation Gating
- [x] `CreateEventPage`: add `usePlan()` guard that redirects to `/upgrade` if `!canCreateEvent`; pass `user_id` on event insert; catch DB trigger error
- [x] `TopNavBar`: "Create Event" button routes to `/upgrade` if `!canCreateEvent`
- [x] `SideNavBar`: same gate on Create button; add Billing nav link; add plan badge with event count
- [x] `BottomNavBar`: fab routes to `/upgrade` if `!canCreateEvent`; add Billing tab

### Group 5 — Upgrade UI
- [x] `src/components/dashboard/UpgradeBanner.tsx`: shown on dashboard when free plan + 3+ events
- [x] `src/pages/UpgradePage.tsx` (`/upgrade`): two-card Free/Pro layout, upgrade CTA calls `create-checkout-session`
- [x] `src/pages/BillingPage.tsx` (`/billing`): shows plan, renewal date, status; "Manage subscription" calls `create-billing-portal-session`

### Group 6 — Return Flow
- [x] `DashboardPage`: detect `?upgraded=true` param, show success toast, strip param, call `refreshPlan()`

### Group 7 — Types
- [x] `src/types/database.ts`: add `UserPlan` interface; add `user_id` to `Event`; extend `Database` type
