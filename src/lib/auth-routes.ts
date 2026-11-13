/**
 * The single source of truth for post-auth navigation.
 *
 * After sign-in, sign-up confirmation, or an OAuth callback the user lands HERE — the
 * app's first authenticated screen — never `/` (the marketing landing).
 * See docs/design/auth.md.
 */
export const DEFAULT_AUTHED_ROUTE = "/overview";

/** Where the user lands after signing OUT — the auth screen, never a dead protected route. */
export const SIGNED_OUT_ROUTE = "/auth";
