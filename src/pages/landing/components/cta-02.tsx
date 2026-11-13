import { Button } from "@/components/base/button";

interface Cta02Props {
  heading: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function Cta02({ heading, subtitle, primaryCta, secondaryCta }: Cta02Props) {
  return (
    <section className="landing py-24">
      <div className="mx-auto max-w-2xl px-6 text-center lg:px-8">
        <h2 className="text-balance">{heading}</h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
          {subtitle}
        </p>
        <div className="mt-10 flex items-center justify-center gap-6">
          <Button asChild>
            <a href={primaryCta.href}>{primaryCta.label}</a>
          </Button>
          {secondaryCta && (
            <a
              href={secondaryCta.href}
              className="text-sm font-semibold text-foreground transition-colors hover:text-muted-foreground"
            >
              {secondaryCta.label} <span aria-hidden="true">&rarr;</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
