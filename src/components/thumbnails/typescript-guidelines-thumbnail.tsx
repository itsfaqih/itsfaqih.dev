/**
 * TypeScript Guidelines Thumbnail
 * An animated blueprint showing the TypeScript logo with construction lines.
 * Animation sequence: lines → circles → rectangle → text characters
 */

export function TypeScriptGuidelinesThumbnail() {
  const duration = 7; // seconds (matching button-design-thumbnail)
  const durationStr = `${duration}s`;
  const lineStyle = {
    stroke: "var(--grid-color)",
    strokeDasharray: 3,
  };

  // Helper to create line animation style with staggered start
  // Using negative delay to offset start point within the animation cycle
  const lineAnim = (index: number) => {
    const stagger = 0.15; // 150ms between each line
    const delay = -(duration - index * stagger); // Negative delay to offset start
    return {
      ...lineStyle,
      animation: `thumb-line-draw ${durationStr} ease-in-out infinite`,
      animationDelay: `${delay}s`,
    };
  };

  // Helper for circle pop animation
  const circleAnim = (index: number) => {
    const baseDelay = 8 * 0.15; // After 8 lines
    const stagger = 0.1;
    const delay = -(duration - (baseDelay + index * stagger));
    return {
      animation: `thumb-circles-pop ${durationStr} ease-in-out infinite`,
      animationDelay: `${delay}s`,
    };
  };

  // Helper for staggered character animation
  const charAnim = (index: number) => {
    const baseDelay = 8 * 0.15 + 4 * 0.1 + 0.1; // After lines, circles, and rect
    const stagger = 0.08;
    const delay = -(duration - (baseDelay + index * stagger));
    return {
      animation: `thumb-char-fade ${durationStr} ease-out infinite`,
      animationDelay: `${delay}s`,
    };
  };

  const logoText = "TS";

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 160 100" strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
        {/* Construction lines - staggered animation in clockwise pattern */}
        {/* 1. Top horizontal line (left edge of logo) */}
        <line x1="50" x2="50" y1="0" y2="100" style={lineAnim(0)} />

        {/* 2. Right vertical line (right edge of logo) */}
        <line x1="110" x2="110" y1="0" y2="100" style={lineAnim(1)} />

        {/* 3. Bottom horizontal line */}
        <line x1="0" x2="160" y1="80" y2="80" style={lineAnim(2)} />

        {/* 4. Left vertical line */}
        <line x1="0" x2="160" y1="20" y2="20" style={lineAnim(3)} />

        {/* 5. Inner left vertical line (corner radius guide) */}
        <line x1="56" x2="56" y1="0" y2="100" style={lineAnim(4)} />

        {/* 6. Inner right vertical line */}
        <line x1="104" x2="104" y1="0" y2="100" style={lineAnim(5)} />

        {/* 7. Inner top horizontal line */}
        <line x1="0" x2="160" y1="26" y2="26" style={lineAnim(6)} />

        {/* 8. Inner bottom horizontal line */}
        <line x1="0" x2="160" y1="74" y2="74" style={lineAnim(7)} />

        <g transform="translate(50, 20)">
          {/* Corner circles - pop animation in clockwise order from top-left */}
          <g fill="transparent" stroke="rgba(0,0,0,0.2)" strokeDasharray="4">
            {/* Top left corner circle */}
            <circle
              cx="6"
              cy="6"
              r="6"
              style={{
                ...circleAnim(0),
                transformOrigin: "6px 6px",
              }}
            />
            {/* Top right corner circle */}
            <circle
              cx="54"
              cy="6"
              r="6"
              style={{
                ...circleAnim(1),
                transformOrigin: "54px 6px",
              }}
            />
            {/* Bottom right corner circle */}
            <circle
              cx="54"
              cy="54"
              r="6"
              style={{
                ...circleAnim(2),
                transformOrigin: "54px 54px",
              }}
            />
            {/* Bottom left corner circle */}
            <circle
              cx="6"
              cy="54"
              r="6"
              style={{
                ...circleAnim(3),
                transformOrigin: "6px 54px",
              }}
            />
          </g>

          {/* Logo rectangle - draw animation */}
          <rect
            x="0"
            y="0"
            width="60"
            height="60"
            rx="6"
            fill="transparent"
            strokeDasharray="240"
            className="stroke-(--text-primary)"
            style={{
              animation: `thumb-rect-draw ${durationStr} ease-in-out infinite`,
              animationDelay: `${-(duration - (8 * 0.15 + 4 * 0.1))}s`,
            }}
          />

          {/* TS text - staggered character animation */}
          <text
            x="37"
            y="46"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="transparent"
            stroke="var(--text-primary)"
            strokeWidth="0.8"
            fontFamily="Geist"
            fontWeight="700"
            fontSize="28"
          >
            {logoText.split("").map((char, index) => (
              <tspan
                key={index}
                style={{
                  opacity: 0,
                  ...charAnim(index),
                }}
              >
                {char}
              </tspan>
            ))}
          </text>
        </g>
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
