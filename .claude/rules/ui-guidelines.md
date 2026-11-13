# UI guidelines

Only the rules that have been broken before and cost a re-fix. Everything else follows
the existing components.

## Sidebar / rail footer

- **The footer holds the leave affordance, then the account row.** Order is fixed: the
  leave affordance sits ABOVE the settings / account row, and the account row is always
  last.
- **Which affordance you render is decided by `useIsDemo()` (`src/lib/demo.ts`) and
  nothing else.** Never re-derive demo-ness from `pathname` or a route prefix in a
  component:
  - authenticated `/*` → "Log out", which really signs the user out;
  - public `/demo/*` → "Exit demo" with a close icon (`IconX`), a plain navigation to
    `EXIT_DEMO_ROUTE` (`/`). The demo has no session, so signing out is meaningless —
    but hiding the item and putting nothing in its place is also wrong: the visitor is
    stuck inside the demo.
- This app's workspace shell is a hand-rolled `<aside>`
  (`src/layouts/workspace-layout-03.tsx`), not a shadcn `Sidebar`, so it wires the
  primitives directly rather than mounting a shared footer component. Keep it that way;
  don't hand-roll a logout in a demo shell.

## Auth surfaces

- SSO buttons are always `<SocialAuthButtons>` from
  `@/components/base/social-auth-buttons`. Never hand-roll "Continue with
  Google/Apple", never swap in a monochrome Tabler glyph, and never restyle the buttons
  with the theme color. See [`docs/design/auth.md`](../../docs/design/auth.md).
