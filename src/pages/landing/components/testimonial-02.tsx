import { useRef } from "react";
import { cn } from "@/lib/utils";
import { AutoplayNav } from "./autoplay-nav";
import { useAutoplay } from "./use-autoplay";
import type { Testimonial } from "@/data/landing";

interface Testimonial02Props {
  testimonials: Testimonial[];
}

export function Testimonial02({ testimonials }: Testimonial02Props) {
  const sectionRef = useRef<HTMLElement>(null);

  const { currentPage, isPlaying, progress, goToPage, togglePlay } =
    useAutoplay(testimonials.length, sectionRef);

  return (
    <section ref={sectionRef} className="py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        {/* Quote area — fixed height, crossfade */}
        <div className="relative mx-auto min-h-[320px] max-w-4xl">
          {testimonials.map((t, i) => (
            <blockquote
              key={t.name}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-500",
                i === currentPage ? "opacity-100" : "opacity-0 pointer-events-none",
              )}
            >
              <p className="text-balance font-heading text-3xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer className="mt-8">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t.title} &middot; {t.company}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>

        <AutoplayNav
          pageCount={testimonials.length}
          currentPage={currentPage}
          isPlaying={isPlaying}
          progress={progress}
          onPageClick={goToPage}
          onTogglePlay={togglePlay}
        />
      </div>
    </section>
  );
}
