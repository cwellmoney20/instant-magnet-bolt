# Auth — Validation Checklist

## Sign Up
- [x] Navigating to `/signup` shows the sign-up form
- [x] Submitting valid email + password creates a Supabase Auth user and redirects to `/`
- [x] Mismatched passwords show an inline error before submitting
- [x] Duplicate email shows an error message from Supabase
- [x] "Already have an account?" link navigates to `/login`

## Log In
- [x] Navigating to `/login` shows the login form
- [x] Submitting correct credentials redirects to `/`
- [x] Wrong password shows an error message
- [x] Unknown email shows an error message
- [x] "Don't have an account?" link navigates to `/signup`

## Protected Routes
- [x] Visiting `/` while logged out redirects to `/login`
- [x] Visiting `/events/create` while logged out redirects to `/login`
- [x] Visiting `/events/:id` while logged out redirects to `/login`
- [x] After logging in, the admin is returned to `/` (or the originally requested page)

## Session Persistence
- [x] Hard-refreshing while logged in keeps the user on the admin page (no flicker redirect to login)
- [x] Closing and reopening the browser tab while logged in preserves the session

## Sign Out
- [x] Clicking sign out in the top nav clears the session and redirects to `/login`
- [x] After sign out, navigating to `/` redirects to `/login`

## Guest Upload (Unchanged)
- [x] `/upload/:slug` is accessible without logging in
- [x] Guest upload still works end-to-end after auth is added

## Nav Links
- [x] TopNavBar shows only Collections and Events links (no Gallery, Printers, Settings)
- [x] SideNavBar shows only Collections and Events links
- [x] BottomNavBar shows only Home and the "+" create button
