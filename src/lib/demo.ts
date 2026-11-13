import { useLocation } from "react-router-dom";

/**
 * The single source of truth for "are we in the public demo?".
 *
 * Every template ships two route trees over the same components: `/*` (Supabase-backed,
 * authenticated — the real product) and `/demo/*` (seeded data, no auth — a pre-populated
 * walkthrough for template marketing). Because they share components, the leave
 * affordance must behave differently in each: authenticated shows "Sign out"; demo shows
 * "Exit demo" (there is no session to end). Read demo-ness HERE — never re-derive it from
 * `pathname` in a component — so the behavior is decided in one place.
 *
 * See docs/design/auth.md.
 */

/** Where "Exit demo" sends the visitor — the marketing landing, never a demo or app route. */
export const EXIT_DEMO_ROUTE = "/";

/** True on `/demo` and any `/demo/*` route. Case-insensitive to match React Router. */
export function useIsDemo(): boolean {
  const path = useLocation().pathname.toLowerCase();
  return path === "/demo" || path.startsWith("/demo/");
}
