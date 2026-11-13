import { IconChevronRight } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/base/button";

interface Hero03Props {
  heading: string;
  subtitle: string;
  badge?: { label: string; announcement: string; href: string };
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function Hero03({
  heading,
  subtitle,
  badge,
  primaryCta,
  secondaryCta,
}: Hero03Props) {
  return (
    <section className="landing overflow-hidden">
      <div className="mx-auto max-w-page px-6 pt-10 pb-24 sm:pb-32 lg:px-8 lg:py-40">
        {badge && (
          <div className="mb-8">
            <Link to={badge.href} className="inline-flex items-center gap-6">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary ring-1 ring-primary/25 ring-inset">
                {badge.label}
              </span>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span>{badge.announcement}</span>
                <IconChevronRight className="size-4 text-muted-foreground" />
              </span>
            </Link>
          </div>
        )}

        <h1 className="max-w-3xl text-pretty">{heading}</h1>

        {/* 3-col row: CTAs | spacer | subtitle */}
        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex items-end gap-4">
            <Button asChild>
              <Link to={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
            {secondaryCta && (
              <Button variant="outline" asChild>
                <Link to={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            )}
          </div>
          <div className="hidden lg:block" />
          <p className="text-pretty text-muted-foreground lg:text-right">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
