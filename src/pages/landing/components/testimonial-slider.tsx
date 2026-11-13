import { type ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { AutoplayNav } from "./autoplay-nav";
import { useAutoplay } from "./use-autoplay";

/* ── Responsive visible-count ──────────────────────────────────── */

function useVisibleCount() {
  const [count, setCount] = useState(() => {
    if (typeof window === "undefined") return 4;
    if (window.innerWidth <= 950) return 1;
    if (window.innerWidth <= 1400) return 3;
    return 4;
  });

  useEffect(() => {
    const mqMobile = window.matchMedia("(max-width: 950px)");
    const mqTablet = window.matchMedia("(max-width: 1400px)");

    function update() {
      if (mqMobile.matches) setCount(1);
      else if (mqTablet.matches) setCount(3);
      else setCount(4);
    }

    mqMobile.addEventListener("change", update);
    mqTablet.addEventListener("change", update);
    return () => {
      mqMobile.removeEventListener("change", update);
      mqTablet.removeEventListener("change", update);
    };
  }, []);

  return count;
}

/* ── Container width measurement ───────────────────────────────── */

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return width;
}

/* ── TestimonialSlider ─────────────────────────────────────────── */

const GAP = 24;
const DRAG_THRESHOLD = 40;

interface TestimonialSliderProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
}

export function TestimonialSlider<T>({
  items,
  renderCard,
  keyExtractor,
}: TestimonialSliderProps<T>) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleCount = useVisibleCount();
  const containerWidth = useContainerWidth(containerRef);

  const pageCount = Math.ceil(items.length / visibleCount);
  const cardWidth =
    containerWidth > 0
      ? visibleCount === 1
        ? containerWidth * 0.85
        : (containerWidth - GAP * (visibleCount - 1)) / visibleCount
      : 0;
  const trackWidth =
    items.length * cardWidth + (items.length - 1) * GAP;

  const { currentPage, isPlaying, progress, goToPage, togglePlay } =
    useAutoplay(pageCount, sectionRef);

  /* --- drag state ------------------------------------------------- */
  const [isDragging, setIsDragging] = useState(false);
  const [dragDelta, setDragDelta] = useState(0);
  const dragStartX = useRef(0);

  const getOffset = useCallback(
    (page: number) => {
      if (containerWidth === 0) return 0;
      const pageOffset = page * visibleCount * (cardWidth + GAP);
      const maxOffset = Math.max(0, trackWidth - containerWidth);
      return Math.min(pageOffset, maxOffset);
    },
    [containerWidth, visibleCount, cardWidth, trackWidth],
  );

  useEffect(() => {
    goToPage(0);
  }, [visibleCount, goToPage]);

  /* --- drag handlers ---------------------------------------------- */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      dragStartX.current = e.clientX;
      setIsDragging(true);
      setDragDelta(0);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      setDragDelta(e.clientX - dragStartX.current);
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragDelta) > DRAG_THRESHOLD) {
      const direction = dragDelta < 0 ? 1 : -1;
      const nextPage = Math.max(0, Math.min(pageCount - 1, currentPage + direction));
      goToPage(nextPage);
    }

    setDragDelta(0);
  }, [isDragging, dragDelta, pageCount, currentPage, goToPage]);

  const baseOffset = getOffset(currentPage);
  const offset = baseOffset - dragDelta;

  return (
    <section ref={sectionRef} className="overflow-hidden py-10">
      <div className="mx-auto max-w-page px-6 lg:px-8">
        <div
          ref={containerRef}
          className={cn(
            "overflow-visible select-none",
            isDragging ? "cursor-grabbing" : "cursor-grab",
          )}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className={cn(
              "flex items-end",
              !isDragging && "transition-transform duration-500 ease-out",
            )}
            style={{
              gap: `${GAP}px`,
              transform: `translateX(-${offset}px)`,
            }}
          >
            {items.map((item, i) => (
              <div
                key={keyExtractor(item, i)}
                className="shrink-0"
                style={{ width: cardWidth > 0 ? `${cardWidth}px` : undefined }}
              >
                {renderCard(item, i)}
              </div>
            ))}
          </div>
        </div>

        <AutoplayNav
          pageCount={pageCount}
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
