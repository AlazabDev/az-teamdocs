import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface Logo {
  key: string;
  src: string;
  alt: string;
}

interface PartnerLogoGridProps {
  logos: Logo[];
  initialKeys?: string[];
  swapInterval?: number;
  fadeDuration?: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const MOBILE_MAX = 949;

function getVisibleCount() {
  return typeof window !== "undefined" && window.innerWidth <= MOBILE_MAX ? 3 : 7;
}

function initSlots(logos: Logo[], initialKeys: string[] | undefined, count: number): Logo[] {
  if (!initialKeys) return logos.slice(0, count);
  const byKey = new Map(logos.map((l) => [l.key, l]));
  const result: Logo[] = [];
  for (let i = 0; i < count; i++) {
    const logo = byKey.get(initialKeys[i]) ?? logos[i];
    if (logo) result.push(logo);
  }
  return result;
}

export function PartnerLogoGrid({
  logos,
  initialKeys,
  swapInterval = 2000,
  fadeDuration = 1000,
}: PartnerLogoGridProps) {
  const [slots, setSlots] = useState<Logo[]>(
    () => initSlots(logos, initialKeys, getVisibleCount()),
  );
  const [hiddenSlot, setHiddenSlot] = useState<number | null>(null);

  const slotsRef = useRef(slots);
  const poolRef = useRef<Logo[]>([]);
  const slotPoolRef = useRef<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const lastCountRef = useRef(getVisibleCount());

  useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  const resetPools = useCallback((currentSlots: Logo[], count: number) => {
    const shownKeys = new Set(currentSlots.map((s) => s.key));
    poolRef.current = shuffle(logos.filter((l) => !shownKeys.has(l.key)));
    slotPoolRef.current = shuffle(Array.from({ length: count }, (_, i) => i));
  }, [logos]);

  const tick = useCallback(() => {
    const count = getVisibleCount();
    if (count <= 0) return;

    if (slotPoolRef.current.length === 0) {
      slotPoolRef.current = shuffle(Array.from({ length: count }, (_, i) => i));
    }
    if (poolRef.current.length === 0) {
      const shownKeys = new Set(slotsRef.current.map((s) => s.key));
      poolRef.current = shuffle(logos.filter((l) => !shownKeys.has(l.key)));
    }
    if (poolRef.current.length === 0) return;

    const slotIdx = slotPoolRef.current.pop()!;
    const newLogo = poolRef.current.pop()!;

    setHiddenSlot(slotIdx);

    timeoutRef.current = setTimeout(() => {
      setSlots((prev) => {
        const next = [...prev];
        const old = next[slotIdx];
        if (old) poolRef.current.push(old);
        next[slotIdx] = newLogo;
        return next;
      });
      setHiddenSlot(null);
    }, fadeDuration);
  }, [logos, fadeDuration]);

  const start = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, swapInterval);
  }, [tick, swapInterval]);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
  }, []);

  // Init + start
  useEffect(() => {
    resetPools(slotsRef.current, getVisibleCount());
    start();
    return stop;
  }, [resetPools, start, stop]);

  // Visibility: pause on hidden, resume on visible
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [start, stop]);

  // Resize: stop, reinit, restart
  useEffect(() => {
    const onResize = () => {
      const count = getVisibleCount();
      if (count === lastCountRef.current) return;
      lastCountRef.current = count;

      stop();
      const newSlots = initSlots(logos, initialKeys, count);
      setSlots(newSlots);
      slotsRef.current = newSlots;
      resetPools(newSlots, count);
      start();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [logos, initialKeys, resetPools, start, stop]);

  return (
    <ul
      className="grid w-full grid-cols-3 place-items-center gap-x-6 lg:grid-cols-7 lg:gap-x-10"
      role="list"
      aria-label="Partners"
    >
      {slots.map((logo, i) => (
        <li
          key={i}
          className={cn(
            "relative flex h-10 w-full items-center justify-center transition-opacity ease-out",
            i >= 3 && "hidden lg:flex",
            hiddenSlot === i ? "opacity-0" : "opacity-60",
          )}
          style={{ transitionDuration: `${fadeDuration}ms` }}
        >
          <img
            src={logo.src}
            alt={logo.alt}
            loading="lazy"
            className="max-h-4 max-w-[7.5rem] grayscale"
          />
        </li>
      ))}
    </ul>
  );
}
