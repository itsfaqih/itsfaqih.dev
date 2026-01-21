/**
 * Dialog Design Thumbnail
 * An animated blueprint showing dialog construction with looping draw effect.
 */

export function DialogDesignThumbnail() {
  const duration = 5; // seconds
  const durationStr = `${duration}s`;
  const lineStyle = {
    stroke: "var(--grid-color)",
    strokeDasharray: 3,
  };

  // Helper to create line animation style with staggered start
  // Using negative delay to offset start point within the animation cycle
  const lineAnim = (index: number) => {
    const stagger = 0.04; // 40ms between each line
    const delay = -(duration - index * stagger); // Negative delay to offset start
    return {
      ...lineStyle,
      animation: `thumb-line-draw ${durationStr} ease-in-out infinite`,
      animationDelay: `${delay}s`,
    };
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 160 100" strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
        {/* Horizontal construction lines - dialog edges */}
        <line x1="0" x2="160" y1="20" y2="20" style={lineAnim(0)} />
        <line x1="0" x2="160" y1="28" y2="28" style={lineAnim(1)} />
        <line x1="0" x2="160" y1="80" y2="80" style={lineAnim(2)} />
        <line x1="0" x2="160" y1="72" y2="72" style={lineAnim(3)} />

        {/* Vertical construction lines - dialog sides */}
        <line x1="30" x2="30" y1="0%" y2="100%" style={lineAnim(4)} />
        <line x1="38" x2="38" y1="0%" y2="100%" style={lineAnim(5)} />
        <line x1="130" x2="130" y1="0%" y2="100%" style={lineAnim(6)} />
        <line x1="122" x2="122" y1="0%" y2="100%" style={lineAnim(7)} />

        {/* Diagonal lines - for close button area (top right) */}
        <line x1="110" x2="135" y1="0%" y2="50%" style={lineAnim(8)} />
        <line x1="25" x2="50" y1="50%" y2="100%" style={lineAnim(9)} />

        {/* Additional horizontal lines - for content sections */}
        <line x1="0" x2="160" y1="38" y2="38" style={lineAnim(10)} />
        <line x1="0" x2="160" y1="62" y2="62" style={lineAnim(11)} />

        {/* Dialog group - centered */}
        <g transform="translate(30,20)">
          {/* Corner circles - pop animation */}
          <g fill="transparent" stroke="rgba(0,0,0,0.2)" strokeDasharray="4">
            <circle
              cx="4"
              cy="4"
              r="4"
              style={{
                animation: `thumb-circles-pop ${durationStr} ease-in-out infinite`,
                animationDelay: `${-(duration - 0.8)}s`,
                transformOrigin: "4px 4px",
              }}
            />
            <circle
              cx="4"
              cy="56"
              r="4"
              style={{
                animation: `thumb-circles-pop ${durationStr} ease-in-out infinite`,
                animationDelay: `${-(duration - 0.9)}s`,
                transformOrigin: "4px 56px",
              }}
            />
            <circle
              cx="96"
              cy="4"
              r="4"
              style={{
                animation: `thumb-circles-pop ${durationStr} ease-in-out infinite`,
                animationDelay: `${-(duration - 1.0)}s`,
                transformOrigin: "96px 4px",
              }}
            />
            <circle
              cx="96"
              cy="56"
              r="4"
              style={{
                animation: `thumb-circles-pop ${durationStr} ease-in-out infinite`,
                animationDelay: `${-(duration - 1.1)}s`,
                transformOrigin: "96px 56px",
              }}
            />
          </g>

          {/* Dialog rectangle - draw animation */}
          <rect
            width="100"
            height="60"
            rx="4"
            fill="transparent"
            strokeDasharray="320"
            className="stroke-(--text-primary)"
            style={{
              animation: `thumb-dialog-draw ${durationStr} ease-in-out infinite`,
            }}
          />

          {/* Header separator line */}
          <line
            x1="8"
            x2="92"
            y1="18"
            y2="18"
            strokeDasharray="100"
            className="stroke-(--text-primary)"
            style={{
              animation: `thumb-dialog-line ${durationStr} ease-in-out infinite`,
            }}
          />

          {/* Dialog title text */}
          <text
            x="8"
            y="12"
            fill="transparent"
            className="stroke-(--text-primary)"
            strokeWidth="0.4"
            fontFamily="Geist"
            fontWeight="semibold"
            fontSize="7"
            strokeDasharray="100"
            style={{
              animation: `thumb-text-fade ${durationStr} ease-in-out infinite`,
            }}
          >
            Dialog
          </text>

          {/* Close button X */}
          <g
            className="stroke-(--text-primary)"
            strokeWidth="1.2"
            style={{
              animation: `thumb-dialog-x ${durationStr} ease-in-out infinite`,
            }}
          >
            <line x1="86" y1="6" x2="92" y2="12" strokeDasharray="10" />
            <line x1="92" y1="6" x2="86" y2="12" strokeDasharray="10" />
          </g>

          {/* Content placeholder lines */}
          <g className="stroke-(--text-secondary)" strokeWidth="0.5">
            <line
              x1="8"
              y1="28"
              x2="70"
              y2="28"
              strokeDasharray="80"
              style={{
                animation: `thumb-dialog-content ${durationStr} ease-in-out infinite`,
                animationDelay: `${-(duration - 1.5)}s`,
              }}
            />
            <line
              x1="8"
              y1="34"
              x2="55"
              y2="34"
              strokeDasharray="60"
              style={{
                animation: `thumb-dialog-content ${durationStr} ease-in-out infinite`,
                animationDelay: `${-(duration - 1.6)}s`,
              }}
            />
          </g>

          {/* Action buttons at bottom */}
          <g>
            {/* Cancel button outline */}
            <rect
              x="40"
              y="42"
              width="24"
              height="10"
              rx="2"
              fill="transparent"
              strokeDasharray="70"
              className="stroke-(--text-secondary)"
              style={{
                animation: `thumb-dialog-btn ${durationStr} ease-in-out infinite`,
                animationDelay: `${-(duration - 1.8)}s`,
              }}
            />
            {/* Confirm button (filled appearance) */}
            <rect
              x="68"
              y="42"
              width="24"
              height="10"
              rx="2"
              fill="transparent"
              strokeDasharray="70"
              className="stroke-(--text-primary)"
              strokeWidth="1"
              style={{
                animation: `thumb-dialog-btn ${durationStr} ease-in-out infinite`,
                animationDelay: `${-(duration - 1.9)}s`,
              }}
            />
          </g>
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
