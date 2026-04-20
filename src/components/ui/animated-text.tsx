import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Word Pull Up animation
export function WordPullUp({
  text,
  className,
  delayOffset = 0,
}: {
  text: string;
  className?: string;
  delayOffset?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={cn("inline-flex flex-wrap gap-x-2 gap-y-1", className)}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden"
        >
          <span
            className="inline-block animate-word-pull-up"
            style={{ animationDelay: `${delayOffset + i * 0.08}s`, animationFillMode: "both" }}
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}

// Text Reveal — chars fade in one by one
export function TextReveal({
  text,
  className,
  delay = 0,
  speed = 0.03,
}: {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}) {
  return (
    <span className={className}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block animate-char-reveal"
          style={{
            animationDelay: `${delay + i * speed}s`,
            animationFillMode: "both",
            whiteSpace: char === " " ? "pre" : undefined,
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

// Shimmer text
export function ShimmerText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block bg-[length:250%_100%] animate-shimmer-text bg-clip-text text-transparent",
        "bg-gradient-to-r from-violet-400 via-white to-violet-400",
        className
      )}
    >
      {text}
    </span>
  );
}

// Gradient typing text
export function TypingText({
  words,
  className,
}: {
  words: string[];
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const currentWord = words[idx];

    if (isPaused) {
      timeoutRef.current = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 1800);
      return;
    }

    if (isDeleting) {
      if (displayed.length === 0) {
        setIsDeleting(false);
        setIdx((i) => (i + 1) % words.length);
        return;
      }
      timeoutRef.current = setTimeout(() => {
        setDisplayed((d) => d.slice(0, -1));
      }, 40);
    } else {
      if (displayed.length === currentWord.length) {
        setIsPaused(true);
        return;
      }
      timeoutRef.current = setTimeout(() => {
        setDisplayed(currentWord.slice(0, displayed.length + 1));
      }, 70);
    }

    return () => clearTimeout(timeoutRef.current);
  }, [displayed, isDeleting, isPaused, idx, words]);

  return (
    <span className={cn("inline-block gradient-text", className)}>
      {displayed}
      <span className="animate-pulse ml-0.5 opacity-70">|</span>
    </span>
  );
}
