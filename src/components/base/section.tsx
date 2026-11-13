import { cn } from "@/lib/utils";

/* ── Section ──────────────────────────────────────────────────────────
 * Outer <section> wrapper. Full viewport width.
 * Carries background color, text color, overflow, and position context.
 */
interface SectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const Section = ({ children, id, className }: SectionProps) => (
  <section id={id} className={cn("w-full", className)}>
    {children}
  </section>
);

/* ── SectionBackground ────────────────────────────────────────────────
 * Renders fullbleed horizontal border lines at section edges.
 * Lives outside the container so the lines span the full viewport.
 * aria-hidden since it's purely decorative.
 */
interface SectionBackgroundProps {
  border?: Array<"top" | "bottom">;
  className?: string;
}

export const SectionBackground = ({
  border = [],
  className,
}: SectionBackgroundProps) => (
  <div aria-hidden="true" className={className}>
    {border.includes("top") && (
      <div className="h-px w-full bg-border" />
    )}
    {border.includes("bottom") && (
      <div className="h-px w-full bg-border" />
    )}
  </div>
);

/* ── SectionContainer ─────────────────────────────────────────────────
 * Inner constrained container. max-width + mx-auto + horizontal padding.
 * Renders the vertical border rails (border-inline-start/end) that
 * frame the content area.
 */
interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionContainer = ({
  children,
  className = "max-w-7xl mx-auto px-4 lg:px-8 py-20 lg:py-24",
}: SectionContainerProps) => (
  <div className={cn("border-x border-border/50", className)}>
    {children}
  </div>
);

/* ── SectionRow ───────────────────────────────────────────────────────
 * Vertical stack with responsive gap. Default gap tightens on mobile
 * (gap-8) and opens on desktop (gap-12), matching Stripe's pattern.
 */
interface SectionRowProps {
  children: React.ReactNode;
  gap?: string;
  className?: string;
}

export const SectionRow = ({
  children,
  gap = "gap-8 lg:gap-12",
  className,
}: SectionRowProps) => (
  <div className={cn("flex flex-col", gap, className)}>{children}</div>
);

/* ── SectionTitle ─────────────────────────────────────────────────────
 * Standardized heading block: h2 or h3 + optional subtitle.
 * Replaces ad-hoc h2+p patterns across section components.
 * `size` controls heading level and text size.
 * `align` controls text alignment (default: center).
 */
interface SectionTitleProps {
  title: string;
  subtitle?: string;
  size?: "md" | "lg";
  align?: "left" | "center";
  className?: string;
}

export const SectionTitle = ({
  title,
  subtitle,
  size = "lg",
  align = "center",
  className,
}: SectionTitleProps) => {
  return (
    <div
      className={cn(
        align === "center" && "text-center",
        align === "left" && "text-left",
        className,
      )}
    >
      {size === "lg" ? <h2>{title}</h2> : <h3>{title}</h3>}
      {subtitle && (
        <p
          className={cn(
            "text-muted-foreground mt-4",
            size === "lg" && "text-base lg:text-lg max-w-2xl",
            size === "md" && "text-sm lg:text-base max-w-xl",
            align === "center" && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

