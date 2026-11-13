interface TestimonialCardProps {
  quote: string;
  name: string;
  title: string;
  company: string;
}

function TestimonialCard({ quote, name, title, company }: TestimonialCardProps) {
  return (
    <blockquote className="flex flex-col justify-between rounded-lg border border-border p-6">
      <p className="text-sm text-foreground">&ldquo;{quote}&rdquo;</p>
      <footer className="mt-6">
        <p className="text-sm font-semibold text-foreground">{name}</p>
        <p className="text-sm text-muted-foreground">
          {title}, {company}
        </p>
      </footer>
    </blockquote>
  );
}

const testimonials = [
  {
    quote: "Finally a docs tool that gets out of the way.",
    name: "Maya T",
    title: "Head of Content",
    company: "Bloom",
  },
  {
    quote: "We killed our Notion account after one week.",
    name: "Dan L",
    title: "CTO",
    company: "Stackform",
  },
  {
    quote: "Comments + live presence made async writing actually work.",
    name: "Priya N",
    title: "Eng",
    company: "Loopcast",
  },
];

export function TestimonialCards() {
  return (
    <section className="landing py-24">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <h2 className="text-balance">What teams say</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}
