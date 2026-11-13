import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TextRotatorProps {
  /** Comma-separated string or array of words */
  words: string | string[];
  /** Time each word is visible before swapping (ms) */
  speed?: number;
  /** Fade transition duration (ms) */
  fadeDuration?: number;
  /** Pause rotation on hover */
  hoverStop?: boolean;
  /** Advance to next word on click */
  clickChange?: boolean;
  className?: string;
}

export function TextRotator({
  words: wordsProp,
  speed = 1200,
  fadeDuration = 500,
  hoverStop = false,
  clickChange = false,
  className,
}: TextRotatorProps) {
  const words = typeof wordsProp === "string"
    ? wordsProp.split(",").map((w) => w.trim()).filter(Boolean)
    : wordsProp;

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const pausedRef = useRef(false);

  const advance = useCallback(() => {
    setVisible(false);
    timeoutRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % words.length);
      setVisible(true);
    }, fadeDuration);
  }, [words.length, fadeDuration]);

  const startInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!pausedRef.current) advance();
    }, speed + fadeDuration);
  }, [speed, fadeDuration, advance]);

  // Auto-rotate
  useEffect(() => {
    startInterval();
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, [startInterval]);

  const handleClick = useCallback(() => {
    if (!clickChange) return;
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
    advance();
    startInterval();
  }, [clickChange, advance, startInterval]);

  const handleMouseEnter = useCallback(() => {
    if (hoverStop) pausedRef.current = true;
  }, [hoverStop]);

  const handleMouseLeave = useCallback(() => {
    if (hoverStop) pausedRef.current = false;
  }, [hoverStop]);

  return (
    <span
      aria-live="polite"
      onClick={clickChange ? handleClick : undefined}
      onMouseEnter={hoverStop ? handleMouseEnter : undefined}
      onMouseLeave={hoverStop ? handleMouseLeave : undefined}
      className={cn(
        "inline-block transition-opacity",
        visible ? "opacity-100" : "opacity-0",
        clickChange && "cursor-pointer",
        className,
      )}
      style={{ transitionDuration: `${fadeDuration}ms` }}
    >
      {words[index]}
    </span>
  );
}
