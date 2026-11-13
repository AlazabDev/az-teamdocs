# Auth

> **⚠️ Two rules that are shipped code, not suggestions:**
>
> - **SSO buttons:** render `<SocialAuthButtons>` from
>   `@/components/base/social-auth-buttons` (brand-compliant Google + Apple) on every
>   auth surface. Never hand-roll "Continue with Google/Apple" and never restyle it with
>   the theme color. OAuth goes through the Lovable managed broker inside that
>   component — a direct `supabase.auth.signInWithOAuth` fails with
>   "missing OAuth secret", because Google and Apple are secretless managed providers.
> - **Redirect:** always `redirect_uri: ${window.location.origin}/auth/callback` — never
>   a bare origin (which strands the user on the marketing landing) and never a
>   protected route (which races `ProtectedRoute` and bounces the user back to `/auth`).
>   The same goes for `emailRedirectTo`.

Real Supabase auth — Google, Apple, and email. Nothing here is simulated.

## The pieces

| File | Job |
|---|---|
| `src/integrations/lovable/index.ts` | Lovable-generated OAuth broker. **Never edit.** |
| `src/components/base/social-auth-buttons.tsx` | The ONE brand-compliant SSO button set. |
| `src/pages/auth/index.tsx` | `/auth` — the sign-in / sign-up card. |
| `src/pages/auth/callback.tsx` | `/auth/callback` — where every OAuth and email-confirmation link lands. |
| `src/lib/auth-routes.ts` | `DEFAULT_AUTHED_ROUTE` (`/overview`), `SIGNED_OUT_ROUTE` (`/auth`). |
| `src/lib/auth/auth-provider.tsx` | Session state + `signOut()`. |
| `src/components/protected-route.tsx` | Guards the authenticated route tree. |

## /auth/callback

`SocialAuthButtons` hardcodes `${origin}/auth/callback`, so the route must exist or SSO
dead-ends on a 404. The callback accepts the session in either shape the broker can
return — fragment tokens (`#access_token=…`) or a PKCE `?code=` — establishes it, and
only then navigates to `DEFAULT_AUTHED_ROUTE`.

## Where each link points

- **OAuth** (`redirect_uri`) → `/auth/callback`.
- **Sign-up confirmation** (`emailRedirectTo`) → `/auth/callback`.
- **Password reset** (`resetPasswordForEmail`'s `redirectTo`) → `/auth`. This one is
  deliberately *not* `/auth/callback`: a recovery link sent there would sign the user
  straight in and give them no chance to set a new password.

## The leave affordance — log out / exit demo

Route-aware, and `useIsDemo()` (`src/lib/demo.ts`) is the ONE thing that decides it.
Never re-branch on the pathname or a route prefix yourself.

- **Authenticated `/*`** → "Log out", which really signs the user out.
- **Public `/demo/*`** → "Exit demo" with a close icon, a plain navigation to
  `EXIT_DEMO_ROUTE` (`/`). The demo has no session, so signing out is meaningless — but
  hiding the item and leaving nothing in its place is also wrong: the visitor is stuck.

Layout is fixed: the leave affordance sits ABOVE the settings / account row, and the
account row is always last. The workspace shell is a hand-rolled `<aside>` in
`src/layouts/workspace-layout-03.tsx`, so it wires the primitives directly instead of
mounting a shared footer component.
