import { QuoteCard } from "./quote-card";
import { TestimonialSlider } from "./testimonial-slider";
import type { QuoteTestimonial } from "@/data/landing";

interface Testimonial01Props {
  testimonials: QuoteTestimonial[];
}

export function Testimonial01({ testimonials }: Testimonial01Props) {
  return (
    <TestimonialSlider
      items={testimonials}
      keyExtractor={(_, i) => String(i)}
      renderCard={(t) => (
        <QuoteCard
          quote={t.quote}
          title={t.title}
          company={t.company}
          backgroundImage={t.backgroundImage}
          variant={t.variant}
        />
      )}
    />
  );
}
