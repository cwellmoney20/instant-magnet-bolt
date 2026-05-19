# Auth — Implementation Plan

## Task Groups

### 1. Specs
- [x] `specs/2026-05-19-auth/requirements.md`
- [x] `specs/2026-05-19-auth/plan.md`
- [x] `specs/2026-05-19-auth/validation.md`
- [x] Update `specs/roadmap.md` — Phase 10

### 2. Auth Context
- [x] `src/context/AuthContext.tsx` — user state, signIn, signUp, signOut, loading flag
- [x] `src/components/auth/ProtectedRoute.tsx` — redirects unauthenticated users to `/login`

### 3. Pages
- [x] `src/pages/LoginPage.tsx` — email/password form, link to sign up, error handling
- [x] `src/pages/SignUpPage.tsx` — email/password/confirm form, link to login, error handling

### 4. Routing
- [x] `src/App.tsx` — AuthProvider at root, `/login` + `/signup` routes, ProtectedRoute wrapping admin routes

### 5. Nav Cleanup
- [x] `TopNavBar` — keep Events link only; replace profile icon with sign-out button
- [x] `SideNavBar` — keep Collections and Events links only; add sign-out at bottom
- [x] `BottomNavBar` — keep Home and "+" create button only; remove Print and Profile

### 6. Database
- [x] Migration: tighten events RLS to require authenticated user for admin reads/writes
