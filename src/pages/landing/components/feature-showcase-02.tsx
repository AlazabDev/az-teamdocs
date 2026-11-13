import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Feature {
  key: string;
  label: string;
  heading: string;
  mockup: ReactNode;
}

interface FeatureShowcase02Props {
  features: Feature[];
}

export function FeatureShowcase02({ features }: FeatureShowcase02Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleScroll = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    if (scrollable <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / scrollable));

    const N = features.length;
    const idx = Math.min(N - 1, Math.floor(progress * N));
    const itemProgress = (progress * N) % 1;

    if (idx !== activeIndexRef.current) {
      activeIndexRef.current = idx;
      setActiveIndex(idx);
    }

    barRefs.current.forEach((bar, i) => {
      if (!bar) return;
      if (i < idx) bar.style.width = "100%";
      else if (i === idx) bar.style.width = `${itemProgress * 100}%`;
      else bar.style.width = "0%";
    });
  }, [features.length]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToFeature = useCallback(
    (index: number) => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const targetScroll = (index / features.length) * scrollable;
      const sectionTop = rect.top + window.scrollY;
      window.scrollTo({ top: sectionTop + targetScroll, behavior: "smooth" });
    },
    [features.length],
  );

  return (
    <section
      ref={sectionRef}
      className="relative text-white"
      style={{ minHeight: `${features.length * 100}vh` }}
    >
      {/* Background — fullbleed, stays with the sticky container */}
      <div className="sticky top-0 h-screen">
        <div className="absolute inset-0 z-0 bg-primary" />
      </div>

      {/* Content — overlays the background */}
      <div className="sticky top-0 -mt-[100vh] flex h-screen items-center">
        <div className="relative z-10 mx-auto w-full max-w-page px-6 lg:px-8">
          {/* Desktop: LTR grid */}
          <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Left column — nav */}
            <div className="landing col-span-3 flex flex-col justify-center">
              {/* Progress bars */}
              <div className="mb-8 flex gap-2">
                {features.map((_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 overflow-hidden rounded-full bg-white/20"
                  >
                    <div
                      ref={(el) => {
                        barRefs.current[i] = el;
                      }}
                      className="h-full rounded-full bg-white"
                      style={{ width: "0%" }}
                    />
                  </div>
                ))}
              </div>

              {/* Text items */}
              <div className="flex flex-col gap-4">
                {features.map((feature, i) => {
                  const isActive = i === activeIndex;
                  return (
                    <button
                      key={feature.key}
                      onClick={() => scrollToFeature(i)}
                      className="text-left"
                    >
                      <h3
                        className={cn(
                          "text-balance transition-[color,opacity] duration-300",
                          isActive
                            ? "text-white opacity-100"
                            : "text-white opacity-40",
                        )}
                      >
                        {feature.label}
                      </h3>
                      <div
                        className={cn(
                          "overflow-hidden transition-[max-height,opacity] duration-500 ease-out",
                          isActive
                            ? "max-h-24 opacity-100"
                            : "max-h-0 opacity-0",
                        )}
                      >
                        <p className="text-pretty text-sm text-white opacity-60 pt-2">
                          {feature.heading}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right column — mockup */}
            <div
              className="col-span-9 flex items-center"
              style={{ filter: "drop-shadow(0px 9px 28px color-mix(in oklch, var(--color-primary) 10%, transparent))" }}
            >
              <figure className="relative w-full overflow-hidden rounded-xl ring-1 ring-border shadow-2xl">
                <img
                  src="/browser-chrome.svg"
                  alt=""
                  className="pointer-events-none relative z-[1] w-full"
                />
                <div
                  className="absolute z-[2] w-full overflow-hidden bg-card"
                  style={{ top: "4.75%", height: "95.25%" }}
                >
                  {features.map((feature, i) => (
                    <div
                      key={feature.key}
                      className={cn(
                        "absolute inset-0 transition-opacity duration-500 [&>*]:h-full",
                        i === activeIndex ? "opacity-100" : "opacity-0",
                      )}
                    >
                      {feature.mockup}
                    </div>
                  ))}
                </div>
              </figure>
            </div>
          </div>

          {/* Mobile: stacked */}
          <div className="flex flex-col gap-6 lg:hidden">
            {/* Progress bars */}
            <div className="flex gap-2">
              {features.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-white/20"
                >
                  <div
                    ref={(el) => {
                      // Mobile bars share refs with desktop — offset by features.length
                      // to avoid collision. On mobile the desktop bars aren't rendered,
                      // so we reuse the same indices.
                      if (!barRefs.current[i]) barRefs.current[i] = el;
                    }}
                    className="h-full rounded-full bg-white"
                    style={{ width: "0%" }}
                  />
                </div>
              ))}
            </div>

            {/* Active label only */}
            <div className="landing text-center">
              <h3 className="text-balance text-white opacity-100">
                {features[activeIndex].label}
              </h3>
            </div>

            {/* Mockup */}
            <div style={{ filter: "drop-shadow(0px 9px 28px color-mix(in oklch, var(--color-primary) 10%, transparent))" }}>
            <figure className="relative w-full overflow-hidden rounded-xl ring-1 ring-border shadow-2xl">
              <img
                src="/browser-chrome.svg"
                alt=""
                className="pointer-events-none relative z-[1] w-full"
              />
              <div
                className="absolute z-[2] w-full overflow-hidden bg-card"
                style={{ top: "4.75%", height: "95.25%" }}
              >
                {features.map((feature, i) => (
                  <div
                    key={feature.key}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500 [&>*]:h-full",
                      i === activeIndex ? "opacity-100" : "opacity-0",
                    )}
                  >
                    {feature.mockup}
                  </div>
                ))}
              </div>
            </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
