/**
 * StylePack type + default pack for the base starter.
 *
 * The type is the contract between the Lovable platform (TDP, codegen,
 * designer tooling) and the template. Each starter exports one `stylePack`.
 *
 * Runtime values live in `style-pack.css` (color tokens, font families,
 * font weights) and `index.html` (font <link> URLs). This TS object is
 * the typed canonical reference — swap it when forking to a new starter.
 *
 * Font weights are NOT in this type — they flow through CSS vars
 * (--font-heading-weight, --font-body-weight) and are overridden at
 * runtime via the TDP postMessage listener (lovable-customization.js).
 */
export interface StylePack {
  label: string;
  /** Representative hex for swatch preview. */
  previewColor: string;
  /** 4-color preview row (used by pack-pickers in tooling). */
  colors: [string, string, string, string];
  /** Full shadcn-compatible token set. Values are complete color strings
   *  (oklch(...) or hex). Mapped to bare CSS vars (--background, --primary,
   *  etc.) which @theme inline resolves to --color-* for Tailwind. */
  colorTokens: {
    primary: string;
    primaryForeground: string;
    background: string;
    foreground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
    sidebar?: string;
    sidebarForeground?: string;
    sidebarPrimary?: string;
    sidebarPrimaryForeground?: string;
    sidebarAccent?: string;
    sidebarAccentForeground?: string;
    sidebarBorder?: string;
    sidebarRing?: string;
  };
  /** Heading + body font families. Loaded via index.html <link> tag. */
  font: {
    heading: { family: string; url: string };
    body: { family: string; url: string };
  };
}

const figtreeUrl =
  "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap";

/**
 * Neutral — base starter default.
 *
 * Slate gray palette, Figtree for both heading and body. Intentionally
 * plain so forks can define their own identity without fighting defaults.
 */
export const stylePack: StylePack = {
  label: "Neutral",
  previewColor: "#1a1a1a",
  colors: ["#1a1a1a", "#fafafa", "#f5f5f5", "#737373"],
  colorTokens: {
    primary: "oklch(0.205 0.029 264.7)",
    primaryForeground: "oklch(0.985 0 0)",
    background: "oklch(1 0 0)",
    foreground: "oklch(0.145 0 0)",
    secondary: "oklch(0.97 0 0)",
    secondaryForeground: "oklch(0.205 0.029 264.7)",
    accent: "oklch(0.97 0 0)",
    accentForeground: "oklch(0.205 0.029 264.7)",
    muted: "oklch(0.97 0 0)",
    mutedForeground: "oklch(0.556 0.016 264.7)",
    card: "oklch(1 0 0)",
    cardForeground: "oklch(0.145 0 0)",
    popover: "oklch(1 0 0)",
    popoverForeground: "oklch(0.145 0 0)",
    destructive: "oklch(0.577 0.245 27.325)",
    destructiveForeground: "oklch(0.985 0 0)",
    border: "oklch(0.922 0 0)",
    input: "oklch(0.922 0 0)",
    ring: "oklch(0.708 0.028 264.7)",
  },
  font: {
    heading: { family: "Figtree", url: figtreeUrl },
    body: { family: "Figtree", url: figtreeUrl },
  },
};

export default stylePack;
