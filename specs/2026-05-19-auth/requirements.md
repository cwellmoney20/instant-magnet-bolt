# Auth — Requirements

## Scope

Add email/password authentication to protect the admin dashboard. Unauthenticated users must be redirected to a login page. The guest upload page at `/upload/:slug` remains fully public.

## Authentication Provider

Supabase Auth (email/password). No magic links, no social providers. Email confirmation is disabled.

## Routes

| Route | Access |
|---|---|
| `/login` | Public |
| `/signup` | Public |
| `/upload/:slug` | Public (unchanged) |
| `/` | Protected — requires auth |
| `/events/create` | Protected — requires auth |
| `/events/:id` | Protected — requires auth |

## Decisions

- **Single admin user model** — no roles, no teams. Any authenticated Supabase user is treated as an admin.
- **Session persistence** — Supabase handles token refresh automatically. On hard reload, the app waits for the session to resolve before deciding to redirect.
- **Sign out** — available in the top nav (profile area) and side nav.
- **RLS tightening** — `events` table admin operations (SELECT by admin, INSERT, UPDATE) move from anonymous-permissive to `auth.uid() IS NOT NULL`. Guest-facing tables (`photos`, `event_guests`) keep their public insert policies.
- **No email confirmation** — sign-up immediately creates a usable session.

## Out of Scope

- Password reset flow (future)
- Multi-user / team management (future)
- Social OAuth providers (future)
- Role-based access control (future)
