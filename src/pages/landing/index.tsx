import { Link } from "react-router-dom";
import { Button } from "@/components/base/button";
import {
  EditorTabMockup,
  PresenceTabMockup,
  CommentsTabMockup,
} from "./components/editor-mockup";
import { Hero } from "./components/hero";
import { FeatureShowcase as FeatureShowcase01 } from "./components/feature-showcase-01";

import { Testimonial02 } from "./components/testimonial-02";
import { testimonials } from "@/data/landing";
import { LandingFooter } from "./components/landing-footer";

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="mx-auto flex h-14 max-w-page items-center justify-between px-6 lg:px-8">
        <Link
          to="/"
          className="font-heading text-[21px] font-semibold leading-6 tracking-tight text-foreground"
        >
          Team Docs
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild>
            <Link to="/auth?tab=signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

const features = [
  {
    key: "editor",
    label: "Rich text editor",
    heading: "A writing surface that keeps up with your team.",
    mockup: <EditorTabMockup />,
  },
  {
    key: "presence",
    label: "Live presence",
    heading: "See who is in the doc and where they are working.",
    mockup: <PresenceTabMockup />,
  },
  {
    key: "comments",
    label: "Comments",
    heading: "Threaded comments alongside the text they reference.",
    mockup: <CommentsTabMockup />,
  },
];

export default function Landing() {
  return (
    <>
      <Header />

      <section className="landing py-12 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-page px-6 lg:px-8">
          <Hero />
        </div>
      </section>

      <FeatureShowcase01 features={features} />
      
      <Testimonial02 testimonials={testimonials} />
      <section className="py-24">
        <div className="mx-auto max-w-page px-6 lg:px-8">
          <div className="rounded-3xl bg-primary px-6 py-20 text-center text-primary-foreground sm:px-12 sm:py-24">
            <h2 className="text-balance text-primary-foreground">Your team&apos;s docs, finally under control.</h2>
            <div className="mt-8">
              <Button asChild variant="secondary">
                <Link to="/auth?tab=signup">Get started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <LandingFooter />
    </>
  );
}
