# Validation: Subscription Upgrade

## Build & Types
- [ ] `npm run build` completes with 0 errors
- [ ] `npm run typecheck` passes

## Free Plan — Under Limit
- [ ] Sign up as a new user → `user_plans` row auto-created with `plan = free`
- [ ] Create 1, 2, and 3 events → all succeed
- [ ] Dashboard sidebar shows "FREE PLAN — X/3 events used"
- [ ] No UpgradeBanner shown with < 3 events
- [ ] "Create Event" button in TopNavBar/SideNavBar navigates to `/events/create`

## Free Plan — At Limit
- [ ] After creating 3rd event, sidebar shows "3/3 events used"
- [ ] UpgradeBanner appears on dashboard
- [ ] "Create Event" button navigates to `/upgrade` (not the form)
- [ ] Bottom nav fab navigates to `/upgrade`
- [ ] Directly visiting `/events/create` redirects to `/upgrade`
- [ ] Attempting a direct Supabase insert (bypass UI) raises DB trigger error

## Upgrade Flow
- [ ] `/upgrade` page loads with two cards (Free and Pro)
- [ ] Free card shows "CURRENT PLAN" badge for free users
- [ ] Clicking "UPGRADE NOW — $1/MO" calls `create-checkout-session` and redirects to Stripe-hosted checkout
- [ ] Completing checkout redirects to `/?upgraded=true`
- [ ] Success toast "Welcome to Pro!" appears on dashboard
- [ ] Query param `upgraded=true` is stripped from URL
- [ ] Plan context refreshes; sidebar now shows "PRO PLAN" badge
- [ ] UpgradeBanner is gone
- [ ] "Create Event" button works normally

## Pro Plan
- [ ] Pro user can create 4+ events without restriction
- [ ] `/upgrade` shows Pro card with "CURRENT PLAN" badge and "MANAGE SUBSCRIPTION" button
- [ ] "MANAGE SUBSCRIPTION" navigates to `/billing` (not Stripe portal directly)

## Billing Page
- [ ] `/billing` shows plan name, status, renewal date for Pro users
- [ ] "Manage subscription & payment method" calls `create-billing-portal-session` and redirects to Stripe portal
- [ ] `/billing` for free users shows upgrade prompt with link to `/upgrade`
- [ ] Billing nav link in SideNavBar and BottomNavBar navigates correctly

## Cancellation
- [ ] Cancel subscription via Stripe portal
- [ ] `customer.subscription.deleted` webhook fires
- [ ] `user_plans.plan` set to `free`, subscription fields cleared
- [ ] On next dashboard load, user is treated as free-tier

## Webhook Security
- [ ] `stripe-subscription-webhook` rejects requests with invalid/missing signature (returns 400)
- [ ] Per-photo webhook (`stripe-webhook`) continues to work independently

## Edge Cases
- [ ] Existing user with 0 events who has no `user_plans` row: auto-provisions on login
- [ ] Network error during checkout → error message shown, loading state cleared
- [ ] Network error during billing portal → error message shown
