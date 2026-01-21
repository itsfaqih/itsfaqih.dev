/**
 * Data Loading Thumbnail
 * An animated blueprint showing data flow from server to client through cache.
 * Floating animation style similar to Proximity Principle.
 */

export function DataLoadingThumbnail() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 160 100" strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
        {/* ========== SERVER ICON (left) ========== */}
        <g
          style={{
            animation: "thumb-proximity-float 3s ease-in-out infinite",
          }}
        >
          {/* Cloud shape - centered at x=30 */}
          <path
            d="M18 52 C10 52 10 44 16 42 C15 37 22 34 27 37 C30 34 38 35 38 42 C44 42 44 52 36 52 Z"
            fill="transparent"
            stroke="var(--text-primary)"
            strokeWidth="1"
          />
          {/* Server lines inside cloud */}
          <line
            x1="19"
            x2="35"
            y1="45"
            y2="45"
            stroke="var(--text-secondary)"
            strokeWidth="0.6"
            opacity="0.5"
          />
          <line
            x1="19"
            x2="31"
            y1="48"
            y2="48"
            stroke="var(--text-secondary)"
            strokeWidth="0.6"
            opacity="0.5"
          />
        </g>

        {/* ========== CONNECTION 1: Server → Cache ========== */}
        <g>
          <line
            x1="48"
            x2="62"
            y1="47"
            y2="47"
            stroke="var(--text-secondary)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <polygon points="64,47 60,44.5 60,49.5" fill="var(--text-secondary)" opacity="0.7" />
        </g>

        {/* ========== CACHE ICON (center) ========== */}
        <g
          style={{
            animation: "thumb-proximity-float-alt 4s ease-in-out infinite",
            animationDelay: "0.5s",
          }}
        >
          {/* Database cylinder - centered at x=80 */}
          <ellipse
            cx="80"
            cy="38"
            rx="12"
            ry="4"
            fill="transparent"
            stroke="var(--text-primary)"
            strokeWidth="1"
          />
          <path
            d="M68 38 L68 54 C68 58 92 58 92 54 L92 38"
            fill="transparent"
            stroke="var(--text-primary)"
            strokeWidth="1"
          />
          {/* Cache data lines */}
          <line
            x1="72"
            x2="88"
            y1="45"
            y2="45"
            stroke="var(--text-secondary)"
            strokeWidth="0.6"
            opacity="0.5"
          />
          <line
            x1="72"
            x2="85"
            y1="50"
            y2="50"
            stroke="var(--text-secondary)"
            strokeWidth="0.6"
            opacity="0.5"
          />
        </g>

        {/* ========== CONNECTION 2: Cache → Client ========== */}
        <g>
          <line
            x1="96"
            x2="110"
            y1="47"
            y2="47"
            stroke="var(--text-secondary)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
          <polygon points="112,47 108,44.5 108,49.5" fill="var(--text-secondary)" opacity="0.7" />
        </g>

        {/* ========== CLIENT ICON (right) ========== */}
        <g
          style={{
            animation: "thumb-proximity-float 3.5s ease-in-out infinite",
            animationDelay: "1s",
          }}
        >
          {/* Browser window - centered at x=130 */}
          <rect
            x="116"
            y="35"
            width="28"
            height="24"
            rx="2"
            fill="transparent"
            stroke="var(--text-primary)"
            strokeWidth="1"
          />
          {/* Browser top bar */}
          <line x1="116" x2="144" y1="41" y2="41" stroke="var(--text-primary)" strokeWidth="0.8" />
          {/* Browser dots */}
          <circle cx="120" cy="38" r="1" fill="var(--text-secondary)" opacity="0.6" />
          <circle cx="124" cy="38" r="1" fill="var(--text-secondary)" opacity="0.6" />
          <circle cx="128" cy="38" r="1" fill="var(--text-secondary)" opacity="0.6" />
          {/* Content lines */}
          <line
            x1="120"
            x2="140"
            y1="46"
            y2="46"
            stroke="var(--text-secondary)"
            strokeWidth="0.6"
            opacity="0.5"
          />
          <line
            x1="120"
            x2="136"
            y1="50"
            y2="50"
            stroke="var(--text-secondary)"
            strokeWidth="0.6"
            opacity="0.5"
          />
          <line
            x1="120"
            x2="138"
            y1="54"
            y2="54"
            stroke="var(--text-secondary)"
            strokeWidth="0.6"
            opacity="0.5"
          />
        </g>

        {/* ========== LABELS ========== */}
        <text
          x="27"
          y="68"
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="6"
          fontFamily="Geist"
        >
          Server
        </text>
        <text
          x="80"
          y="68"
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="6"
          fontFamily="Geist"
        >
          Cache
        </text>
        <text
          x="130"
          y="68"
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="6"
          fontFamily="Geist"
        >
          Client
        </text>
      </svg>

      {/* Gradient fade overlays */}
      <div className="pointer-events-none absolute inset-0">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-linear-to-r from-(--bg-primary) to-transparent" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-linear-to-l from-(--bg-primary) to-transparent" />
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-1/4 bg-linear-to-b from-(--bg-primary) to-transparent" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-linear-to-t from-(--bg-primary) to-transparent" />
      </div>
    </div>
  );
}
