import { Link } from "react-router-dom";
import { Button } from "@/components/base/button";
import { PartnerLogoGrid } from "./partner-logo-grid";
import { partnerLogos } from "@/data/landing";

export function Hero() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <hgroup>
        <h1 className="display mb-6">Team Docs</h1>
        <p className="text-lg text-muted-foreground">
          Simple docs for small teams
        </p>
      </hgroup>
      <div className="mt-6">
        <Button asChild>
          <Link to="/documents">Get started</Link>
        </Button>
      </div>
      <aside className="mt-12 w-full" aria-label="Trusted by">
        <PartnerLogoGrid logos={partnerLogos} />
      </aside>
    </div>
  );
}
