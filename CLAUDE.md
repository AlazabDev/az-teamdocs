# CLAUDE.md

Guardrails for this template. This is not a full style guide — it is the short list of
things that have regressed before and must not regress again. Read
[`docs/design/auth.md`](docs/design/auth.md) and
[`.claude/rules/ui-guidelines.md`](.claude/rules/ui-guidelines.md) before touching auth
or the workspace shell.

## Don'ts

1. Don't hand-roll "Continue with Google/Apple" buttons — the ONE brand-compliant set is
   `SocialAuthButtons` (`src/components/base/social-auth-buttons.tsx`). Never restyle it
   with the theme color, and render it on every auth surface (`/auth`).
2. Don't redirect OAuth or email confirmation to a bare `window.location.origin`, and
   don't point either straight at a protected route like `/overview` — always
   `${window.location.origin}/auth/callback`, which establishes the session first and
   then lands the user on `DEFAULT_AUTHED_ROUTE` (`src/lib/auth-routes.ts`).
   The one exception is the password-reset link, which goes to `/auth` so the visitor
   can actually set a new password.
3. Don't call `supabase.auth.signInWithOAuth` directly. Google and Apple are secretless
   managed providers; OAuth has to go through the Lovable broker
   (`src/integrations/lovable/`), which `SocialAuthButtons` already does. Never edit
   `src/integrations/lovable/` — it is generated.
4. Don't leave a demo shell with no way out. On `/demo/*` the leave affordance is
   "Exit demo" → `EXIT_DEMO_ROUTE`, decided by `useIsDemo()` (`src/lib/demo.ts`) and
   nothing else. It sits above the settings / account row, which stays last.
