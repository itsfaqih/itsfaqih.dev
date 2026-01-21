/**
 * Null vs Undefined Thumbnail
 * Visualizing the difference: Undefined (Ghostly/Missing) vs Null (Explicit Empty).
 * Metaphor: Dashed empty box vs Solid box containing a "Null" token.
 */

export function NullVsUndefinedThumbnail() {
  const duration = 5;
  const durationStr = `${duration}s`;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 160 100" strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(35, 30)">
          {/* UNDEFINED: Ghostly/Optional Variable */}
          <g
            style={{
              animation: "thumb-proximity-float 3s ease-in-out infinite",
            }}
          >
            {/* Dashed outer box - representing "not initialized" */}
            <rect
              x="0"
              y="0"
              width="36"
              height="36"
              rx="4"
              fill="transparent"
              strokeDasharray="4 4"
              className="stroke-(--text-secondary)"
              style={{
                animation: `thumb-null-undefined-fade ${durationStr} ease-in-out infinite`,
                opacity: 0.5,
              }}
            />
            {/* Question Mark - representing "what is this?" */}
            <text
              x="18"
              y="24"
              textAnchor="middle"
              fontSize="18"
              className="fill-(--text-secondary) font-mono"
              style={{
                animation: `thumb-null-q ${durationStr} ease-in-out infinite`,
                transformOrigin: "18px 24px",
              }}
            >
              ?
            </text>
            {/* Label */}
            <text
              x="18"
              y="46"
              textAnchor="middle"
              fontSize="6"
              className="fill-(--text-secondary) font-mono uppercase tracking-wider opacity-60"
            >
              Undefined
            </text>
          </g>

          {/* NULL: Explicit Empty Value */}
          <g transform="translate(56, 0)">
            <g
              style={{
                animation: "thumb-proximity-float-alt 3.5s ease-in-out infinite",
                animationDelay: "0.5s",
              }}
            >
              {/* Solid outer box - representing "initialized container" */}
              <rect
                x="0"
                y="0"
                width="36"
                height="36"
                rx="4"
                fill="transparent"
                className="stroke-(--text-primary)"
              />
              {/* Inner "Void" Token - representing the explicit null value */}
              <g transform="translate(6, 12)">
                <rect
                  width="24"
                  height="12"
                  rx="2"
                  fill="transparent"
                  className="stroke-(--text-primary)"
                />
                <text
                  x="12"
                  y="8"
                  textAnchor="middle"
                  fontSize="6"
                  className="fill-(--text-primary) font-mono font-bold"
                >
                  NULL
                </text>
              </g>
              {/* Label */}
              <text
                x="18"
                y="46"
                textAnchor="middle"
                fontSize="6"
                className="fill-(--text-primary) font-mono uppercase tracking-wider"
              >
                Null
              </text>
            </g>
          </g>
        </g>
      </svg>
      {/* Gradient fade overlays */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-linear-to-r from-(--bg-primary) to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-linear-to-l from-(--bg-primary) to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-1/4 bg-linear-to-b from-(--bg-primary) to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-linear-to-t from-(--bg-primary) to-transparent" />
      </div>
    </div>
  );
}
