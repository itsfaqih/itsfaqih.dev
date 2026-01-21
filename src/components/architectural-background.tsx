import { cn } from "../cn";

export default function ArchitecturalBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <svg
        className="absolute inset-0 w-full h-full opacity-80"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="arch-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            {/* Main grid lines - Dashed */}
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="var(--grid-color)"
              strokeWidth="0.5"
              strokeDasharray="4 2"
              className="opacity-40"
            />
          </pattern>

          <pattern
            id="arch-major-grid"
            width="200"
            height="200"
            patternUnits="userSpaceOnUse"
            overflow="visible"
          >
            <rect width="200" height="200" fill="url(#arch-grid)" />

            {/* Major grid lines - Solid but thin */}
            <path
              d="M 200 0 L 0 0 0 200"
              fill="none"
              stroke="var(--grid-color)"
              strokeWidth="1"
              className="opacity-60"
            />

            {/* Intersections - Crosses */}
            <g className="text-(--text-secondary) opacity-100">
              <path
                d="M -5 0 L 5 0 M 0 -5 L 0 5"
                stroke="currentColor"
                strokeWidth="1"
                transform="translate(0,0)"
              />
              <path
                d="M 195 0 L 205 0 M 200 -5 L 200 5"
                stroke="currentColor"
                strokeWidth="1"
                transform="translate(0,0)"
              />
              <path
                d="M -5 200 L 5 200 M 0 195 L 0 205"
                stroke="currentColor"
                strokeWidth="1"
                transform="translate(0,0)"
              />
            </g>
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#arch-major-grid)" />
      </svg>

      {/* Radial fade for edges */}
      <div
        className={cn(
          "absolute inset-0 h-full w-full z-10",
          "bg-[radial-gradient(transparent_0%,var(--bg-primary)_100%)]",
          "opacity-80",
        )}
      />

      {/* Linear gradient wash for center text readability */}
      <div
        className={cn(
          "absolute inset-0 h-full w-full z-10",
          "bg-linear-to-r from-transparent via-(--bg-primary) to-transparent",
          "opacity-60",
        )}
      />
    </div>
  );
}
