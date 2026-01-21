/**
 * Handling Timestamps Thumbnail
 * An animated visual showing UTC storage -> Local display.
 * Logic: Database (UTC) -> Network -> Client (Local Time).
 */
import styles from "./handling-timestamps-thumbnail.module.css";

export function HandlingTimestampsThumbnail() {
  const duration = 5;
  const durationStr = `${duration}s`;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 160 100" strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
        {/* Centered Group: Width ~116, Height ~36. Centered in 160x100 */}
        <g transform="translate(14, 22)">
          {/* Database Group (Left) */}
          <g className="stroke-(--text-primary)" strokeWidth={1} fill="transparent">
            {/* Cylinder Top */}
            <ellipse cx="20" cy="15" rx="12" ry="5" />
            {/* Cylinder Body lines (left & right) + Bottom Curve */}
            <path d="M8 15 L8 35 A12 5 0 0 0 32 35 L32 15" />
            {/* Middle Curve for stack effect */}
            <path d="M8 25 A12 5 0 0 0 32 25" />
            {/* "UTC" Text Label */}
            <text
              x="12"
              y="28"
              fontSize="8"
              fontWeight="bold"
              className="fill-(--text-primary) stroke-none font-mono"
            >
              UTC
            </text>
          </g>

          {/* Connection Arrow */}
          <g className="stroke-(--text-secondary)" strokeWidth={1}>
            <line x1="36" y1="25" x2="75" y2="25" />
            {/* Arrowhead */}
            <path d="M72 22 L75 25 L72 28" />
          </g>

          {/* Client Device/Screen (Right) */}
          <g transform="translate(80, 10)" strokeWidth={1}>
            {/* Monitor Outline */}
            <rect
              x="0"
              y="0"
              width="44"
              height="32"
              rx="2"
              fill="transparent"
              className="stroke-(--text-primary)"
            />
            {/* Stand */}
            <path
              d="M12 32 L12 36 L32 36 L32 32"
              fill="transparent"
              className="stroke-(--text-primary)"
            />

            {/* Clock Face Inside Screen */}
            <circle cx="22" cy="16" r="10" fill="transparent" className="stroke-(--text-primary)" />

            {/* Clock Hands - Keeping subtle rotation for life, but no drawing/fading */}
            <g strokeLinecap="round" className="stroke-(--text-primary)">
              {/* Hour Hand */}
              <line
                x1="22"
                y1="16"
                x2="22"
                y2="10"
                strokeWidth="1"
                className={styles.handHour}
                style={{
                  transformOrigin: "22px 16px",
                  animationDuration: durationStr,
                }}
              />
              {/* Minute Hand */}
              <line
                x1="22"
                y1="16"
                x2="28"
                y2="16"
                strokeWidth="0.8"
                className={styles.handMinute}
                style={{
                  transformOrigin: "22px 16px",
                  animationDuration: durationStr,
                }}
              />
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
