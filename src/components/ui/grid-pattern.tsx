import { cn } from "@/lib/utils";

interface GridPatternProps {
  className?: string;
  squares?: [number, number][];
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: string;
}

export function GridPattern({
  className,
  squares,
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  ...props
}: GridPatternProps & React.SVGProps<SVGSVGElement>) {
  const id = "grid-pattern-" + Math.random().toString(36).slice(2, 8);

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-white/[0.03] stroke-white/[0.06]",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sqX, sqY]) => (
            <rect
              strokeWidth="0"
              key={`${sqX}-${sqY}`}
              width={width - 1}
              height={height - 1}
              x={sqX * width + 1}
              y={sqY * height + 1}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}

// Dot pattern variant
export function DotPattern({
  className,
  cx = 1,
  cy = 1,
  cr = 1,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  cx?: number;
  cy?: number;
  cr?: number;
}) {
  const id = "dot-" + Math.random().toString(36).slice(2, 8);
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-white/[0.04]",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
        >
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth="0" fill={`url(#${id})`} />
    </svg>
  );
}
