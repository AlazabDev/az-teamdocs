import { cn } from "@/lib/utils";

/* ── Icons ──────────────────────────────────────────────────────── */

function PauseIcon() {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0.895 12C0.595 12 0.37 11.916 0.22 11.747C0.073 11.579 0 11.326 0 10.988V1.005C0 0.672 0.075 0.422 0.225 0.253C0.376 0.084 0.599 0 0.895 0H2.366C2.658 0 2.88 0.082 3.03 0.246C3.184 0.41 3.261 0.663 3.261 1.005V10.988C3.261 11.326 3.184 11.579 3.03 11.747C2.88 11.916 2.658 12 2.366 12H0.895ZM5.64 12C5.34 12 5.114 11.916 4.964 11.747C4.814 11.579 4.739 11.326 4.739 10.988V1.005C4.739 0.672 4.814 0.422 4.964 0.253C5.114 0.084 5.34 0 5.64 0H7.099C7.399 0 7.624 0.082 7.775 0.246C7.925 0.41 8 0.663 8 1.005V10.988C8 11.326 7.925 11.579 7.775 11.747C7.624 11.916 7.399 12 7.099 12H5.64Z" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="11" viewBox="0 0 10 11" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M0 9.968V1.032C0 0.681 0.09 0.422 0.271 0.253C0.452 0.084 0.668 0 0.917 0C1.141 0 1.365 0.061 1.589 0.184L9.218 4.551C9.494 4.707 9.692 4.854 9.813 4.994C9.938 5.133 10 5.302 10 5.5C10 5.694 9.938 5.863 9.813 6.006C9.692 6.146 9.494 6.293 9.218 6.449L1.589 10.817C1.365 10.939 1.141 11 0.917 11C0.668 11 0.452 10.914 0.271 10.741C0.09 10.572 0 10.314 0 9.968Z" fill="currentColor" />
    </svg>
  );
}

/* ── AutoplayNav ────────────────────────────────────────────────── */

interface AutoplayNavProps {
  pageCount: number;
  currentPage: number;
  isPlaying: boolean;
  progress: number;
  onPageClick: (page: number) => void;
  onTogglePlay: () => void;
  label?: string;
}

export function AutoplayNav({
  pageCount,
  currentPage,
  isPlaying,
  progress,
  onPageClick,
  onTogglePlay,
  label = "Testimonials",
}: AutoplayNavProps) {
  return (
    <nav
      className="mt-16 flex items-center justify-center gap-4"
      aria-label={label}
    >
      {/* Dots pill — color-mix used because TW3 can't apply /opacity to custom OKLCH tokens */}
      <div
        className="inline-flex h-8 items-center gap-2 rounded-full px-4"
        style={{ backgroundColor: "color-mix(in oklch, var(--color-foreground) 5%, transparent)" }}
      >
        {Array.from({ length: pageCount }, (_, i) => {
          const isActive = i === currentPage;
          return (
            <button
              key={i}
              onClick={() => onPageClick(i)}
              aria-label={`Page ${i + 1}`}
              className={cn(
                "relative h-2.5 overflow-hidden rounded-full transition-[width,background-color] duration-400 ease-out",
                isActive ? "w-20" : "w-2.5",
              )}
              style={{
                backgroundColor: isActive
                  ? "color-mix(in oklch, var(--color-foreground) 10%, transparent)"
                  : "color-mix(in oklch, var(--color-foreground) 30%, transparent)",
              }}
            >
              {isActive && (
                <div
                  className={cn(
                    "absolute top-0 left-0 h-full rounded-full bg-foreground",
                    !isPlaying && "w-full transition-[width] duration-200 ease-out",
                  )}
                  style={isPlaying ? { width: `${progress * 100}%` } : undefined}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Play/pause — separate circle */}
      <button
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="flex size-8 items-center justify-center rounded-full text-foreground"
        style={{ backgroundColor: "color-mix(in oklch, var(--color-foreground) 5%, transparent)" }}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
    </nav>
  );
}
