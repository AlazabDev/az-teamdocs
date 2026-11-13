import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Feature {
  key: string;
  label: string;
  heading: string;
  mockup: ReactNode;
}

interface FeatureShowcaseProps {
  features: Feature[];
  backgroundImage?: string;
  autoplayDuration?: number;
}

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

export function FeatureShowcase({
  features,
  backgroundImage,
  autoplayDuration = 7000,
}: FeatureShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const isPlayingRef = useRef(true);
  const elapsedRef = useRef(0);
  const startTimeRef = useRef(performance.now());
  const rafRef = useRef<number>();

  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const goToTab = useCallback((index: number) => {
    setActiveIndex(index);
    setProgress(0);
    elapsedRef.current = 0;
    startTimeRef.current = performance.now();
  }, []);

  const tick = useCallback((now: number) => {
    if (isPlayingRef.current) {
      const delta = now - startTimeRef.current;
      startTimeRef.current = now;
      elapsedRef.current += delta;

      let p = elapsedRef.current / autoplayDuration;
      if (p < 0) p = 0;
      if (p > 1) p = 1;
      setProgress(p);

      if (elapsedRef.current >= autoplayDuration) {
        const nextIndex = (activeIndexRef.current + 1) % features.length;
        goToTab(nextIndex);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [autoplayDuration, features.length, goToTab]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      isPlayingRef.current = next;
      if (next) {
        startTimeRef.current = performance.now();
      }
      return next;
    });
  }, []);

  const handleTabClick = useCallback((index: number) => {
    goToTab(index);
  }, [goToTab]);

  return (
    <section className="landing relative overflow-hidden text-white">
      {/* Background — fullbleed */}
      <div className="absolute inset-0 z-0 bg-black">
        {backgroundImage && (
          <img
            src={backgroundImage}
            alt=""
            className="h-full w-full object-cover opacity-60"
            style={{ objectPosition: "50% 0%" }}
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 py-10">
        <div className="mx-auto max-w-page px-6 lg:px-8">
          {/* Tab nav */}
          <nav
            className="flex flex-wrap items-center justify-center gap-2 mb-8"
            aria-label="Features"
          >
            {features.map((feature, i) => (
              <button
                key={feature.key}
                onClick={() => handleTabClick(i)}
                className={cn(
                  "relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  i === activeIndex
                    ? "text-white"
                    : "text-white/60 hover:bg-white/6 hover:text-white",
                )}
              >
                <span className="relative z-[2]">{feature.label}</span>
                {i === activeIndex && (
                  <div
                    className="absolute inset-y-0 left-0 z-[1] bg-white/10"
                    style={{ width: `${progress * 100}%` }}
                  />
                )}
              </button>
            ))}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause autoplay" : "Resume autoplay"}
              className="flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-full bg-white/6 text-white"
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
          </nav>

          {/* Tab panels — all in DOM, CSS show/hide */}
          <div className="mx-auto max-w-4xl">
            {features.map((feature, i) => (
              <div
                key={feature.key}
                className={cn(i === activeIndex ? "block" : "hidden")}
              >
                <h2 className="mb-6 text-center text-white">{feature.heading}</h2>
                <figure className="relative overflow-hidden rounded-lg">
                  <img
                    src="/browser-chrome.svg"
                    alt=""
                    className="relative z-[1] w-full pointer-events-none"
                  />
                  <div
                    className="absolute z-[2] w-full overflow-hidden bg-card [&>*]:h-full"
                    style={{ top: "4.75%", height: "95.25%" }}
                  >
                    {feature.mockup}
                  </div>
                </figure>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
