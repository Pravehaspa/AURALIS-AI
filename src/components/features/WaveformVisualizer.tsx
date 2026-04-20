import { cn } from "@/lib/utils";

interface WaveformVisualizerProps {
  isActive: boolean;
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const SIZES = {
  sm: { bar: "w-0.5 h-4", gap: "gap-0.5" },
  md: { bar: "w-1 h-8", gap: "gap-1" },
  lg: { bar: "w-1.5 h-16", gap: "gap-1.5" },
};

const BAR_ANIMATIONS = [
  "animate-wave-1",
  "animate-wave-2",
  "animate-wave-3",
  "animate-wave-4",
  "animate-wave-5",
  "animate-wave-4",
  "animate-wave-3",
  "animate-wave-2",
  "animate-wave-1",
];

export function WaveformVisualizer({
  isActive,
  size = "md",
  className,
}: WaveformVisualizerProps) {
  const { bar, gap } = SIZES[size];

  return (
    <div className={cn("flex items-center", gap, className)}>
      {BAR_ANIMATIONS.map((anim, i) => (
        <div
          key={i}
          className={cn(
            bar,
            "rounded-full transition-all duration-300",
            isActive
              ? cn("bg-brand-400", anim)
              : "bg-brand-500/30 scale-y-[0.3]"
          )}
          style={isActive ? { animationDelay: `${i * 0.08}s` } : undefined}
        />
      ))}
    </div>
  );
}
