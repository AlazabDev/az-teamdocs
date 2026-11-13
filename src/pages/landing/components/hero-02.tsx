import { type ReactNode } from "react";
import { Button } from "@/components/base/button";

import { PartnerLogoGrid, type Logo } from "./partner-logo-grid";

interface Hero02Props {
  eyebrow?: string;
  heading: ReactNode;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  logos?: Logo[];
}

export function Hero02({
  eyebrow,
  heading,
  primaryCta,
  secondaryCta,
  logos,
}: Hero02Props) {
  return (
    <section className="landing py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div className="flex flex-col justify-center max-w-2xl">
          {eyebrow && (
            <p className="text-sm text-muted-foreground">{eyebrow}</p>
          )}
          <h1 className="mt-4 text-balance">{heading}</h1>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild>
              <a href={primaryCta.href}>{primaryCta.label}</a>
            </Button>
            {secondaryCta && (
              <Button variant="outline" asChild>
                <a href={secondaryCta.href}>{secondaryCta.label}</a>
              </Button>
            )}
          </div>
        </div>

        {/* Logo strip */}
        {logos && logos.length > 0 && (
          <div className="mt-16 border-t border-border pt-8">
            <PartnerLogoGrid logos={logos} />
          </div>
        )}
      </div>
    </section>
  );
}
