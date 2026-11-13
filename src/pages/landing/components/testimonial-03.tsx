import { TestimonialSlider } from "./testimonial-slider";
import type { Testimonial } from "@/data/landing";

interface Testimonial03Props {
  testimonials: Testimonial[];
}

export function Testimonial03({ testimonials }: Testimonial03Props) {
  return (
    <TestimonialSlider
      items={testimonials}
      keyExtractor={(t) => t.name}
      renderCard={(t) => (
        <figure className="flex h-full flex-col justify-between rounded-2xl bg-card p-8 ring-1 ring-border">
          <blockquote>
            <p className="text-pretty text-foreground">
              &ldquo;{t.quote}&rdquo;
            </p>
          </blockquote>
          <figcaption className="mt-6 flex items-center gap-3">
            {t.avatar ? (
              <img src={t.avatar} alt={t.name} className="size-10 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                {t.initials}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-sm text-muted-foreground">
                {t.title} &middot; {t.company}
              </p>
            </div>
          </figcaption>
        </figure>
      )}
    />
  );
}
