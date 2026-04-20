import React from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: React.ReactNode;
  duration?: number;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  fade?: boolean;
  fadeAmount?: number;
  className?: string;
}

export function Marquee({
  children,
  duration = 30,
  pauseOnHover = false,
  direction = "left",
  fade = true,
  fadeAmount = 15,
  className,
}: MarqueeProps) {
  const shouldReverse = direction === "right";

  return (
    <div
      className={cn("relative overflow-hidden w-full", className)}
      style={
        fade
          ? {
              maskImage: `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`,
              WebkitMaskImage: `linear-gradient(to right, transparent 0%, black ${fadeAmount}%, black ${100 - fadeAmount}%, transparent 100%)`,
            }
          : undefined
      }
    >
      <div
        className="flex w-max"
        style={{
          animation: `marquee-scroll ${duration}s linear infinite ${shouldReverse ? "reverse" : "normal"}`,
          animationPlayState: pauseOnHover ? undefined : "running",
        }}
        onMouseEnter={(e) => {
          if (pauseOnHover) {
            (e.currentTarget as HTMLDivElement).style.animationPlayState = "paused";
          }
        }}
        onMouseLeave={(e) => {
          if (pauseOnHover) {
            (e.currentTarget as HTMLDivElement).style.animationPlayState = "running";
          }
        }}
      >
        {/* Two copies for seamless loop */}
        <div className="flex items-center">{children}</div>
        <div className="flex items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
