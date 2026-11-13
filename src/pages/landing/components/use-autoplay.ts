import { useState, useEffect, useRef, useCallback } from "react";

const AUTOPLAY_DURATION = 5000;

/**
 * Shared autoplay hook for rotating sections.
 * Drives a rAF progress bar and auto-advances through pages.
 * Starts when `sectionRef` scrolls into view (IntersectionObserver).
 */
export function useAutoplay(
  pageCount: number,
  sectionRef: React.RefObject<HTMLElement | null>,
) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const isPlayingRef = useRef(false);
  const elapsedRef = useRef(0);
  const startTimeRef = useRef(performance.now());
  const rafRef = useRef<number>();
  const currentPageRef = useRef(currentPage);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
    setProgress(0);
    elapsedRef.current = 0;
    startTimeRef.current = performance.now();
  }, []);

  const tick = useCallback(
    (now: number) => {
      if (isPlayingRef.current) {
        const delta = now - startTimeRef.current;
        startTimeRef.current = now;
        elapsedRef.current += delta;

        let p = elapsedRef.current / AUTOPLAY_DURATION;
        if (p < 0) p = 0;
        if (p > 1) p = 1;
        setProgress(p);

        if (elapsedRef.current >= AUTOPLAY_DURATION) {
          const nextPage = (currentPageRef.current + 1) % pageCount;
          goToPage(nextPage);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [pageCount, goToPage],
  );

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [tick]);

  // Auto-start when section scrolls into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsPlaying(true);
        isPlayingRef.current = true;
        startTimeRef.current = performance.now();
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionRef]);

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

  return { currentPage, isPlaying, progress, goToPage, togglePlay };
}
