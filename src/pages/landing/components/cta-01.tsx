import { Button } from "@/components/base/button";

interface Cta01Props {
  heading: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function Cta01({ heading, primaryCta, secondaryCta }: Cta01Props) {
  return (
    <section className="landing py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <h2 className="max-w-2xl text-balance">{heading}</h2>
        <div className="mt-10 flex items-center gap-6">
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
