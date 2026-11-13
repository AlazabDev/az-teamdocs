import { cn } from "@/lib/utils";

interface QuoteCardProps {
  quote: string;
  title: string;
  company: string;
  backgroundImage: string;
  variant?: "light" | "dark";
}

export function QuoteCard({
  quote,
  title,
  company,
  backgroundImage,
  variant = "light",
}: QuoteCardProps) {
  return (
    <article
      className={cn(
        "relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl p-8",
        variant === "light" ? "text-white" : "text-foreground",
      )}
    >
      <div className="absolute inset-0 z-0">
        <img
          src={backgroundImage}
          alt=""
          draggable={false}
          className="pointer-events-none h-full w-full select-none object-cover"
        />
      </div>

      <p className="relative z-10 text-pretty text-lg">&ldquo;{quote}&rdquo;</p>

      <footer className="relative z-10">
        <p className="text-sm">
          <span className="text-white/60">{title}</span>
          <br />
          {company}
        </p>
      </footer>
    </article>
  );
}
