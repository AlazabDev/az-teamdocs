import { Link } from "react-router-dom";
import { Button } from "@/components/base/button";
import { TextRotator } from "./text-rotator";
import { PartnerLogoGrid } from "./partner-logo-grid";
import { heroWords, partnerLogos } from "@/data/landing";

export function Hero01() {
  return (
    <section className="landing py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <hgroup>
            <h1 className="display mb-6">
              <TextRotator words={heroWords} speed={1200} />,{"\n"}
              done with&nbsp;AI
            </h1>
            <p className="text-lg text-muted-foreground">
              Accelerate work with AI agents that collaborate, automate,
              and think alongside your teams.
            </p>
          </hgroup>
          <div className="mt-6">
            <Button asChild>
              <Link to="/app">Get started</Link>
            </Button>
          </div>
        </div>
        <aside className="mx-auto mt-16 max-w-5xl" aria-label="Trusted by">
          <PartnerLogoGrid logos={partnerLogos} />
        </aside>
      </div>
    </section>
  );
}
