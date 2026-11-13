import { Button } from "@/components/base/button";

interface Cta03Props {
  heading: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export function Cta03({ heading, subtitle, primaryCta, secondaryCta }: Cta03Props) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-page px-6 sm:px-6 lg:px-8">
        <div className="landing relative isolate overflow-hidden bg-primary px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="text-balance text-white">{heading}</h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-white/60">
            {subtitle}
          </p>
          <div className="mt-10 flex items-center justify-center gap-6">
            <Button variant="secondary" asChild>
              <a href={primaryCta.href}>{primaryCta.label}</a>
            </Button>
            {secondaryCta && (
              <a
                href={secondaryCta.href}
                className="text-sm font-semibold text-white transition-colors hover:text-white/80"
              >
                {secondaryCta.label} <span aria-hidden="true">&rarr;</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
