/**
 * Dialog Design Thumbnail
 * An animated blueprint showing dialog construction with looping draw effect.
 */
import styles from "./dialog-design-thumbnail.module.css";

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
      animationDuration: durationStr,
      animationDelay: `${delay}s`,
    };
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 160 100" strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
        {/* Horizontal construction lines - dialog edges */}
        <line x1="0" x2="160" y1="20" y2="20" className={styles.lineDraw} style={lineAnim(0)} />
        <line x1="0" x2="160" y1="28" y2="28" className={styles.lineDraw} style={lineAnim(1)} />
        <line x1="0" x2="160" y1="80" y2="80" className={styles.lineDraw} style={lineAnim(2)} />
        <line x1="0" x2="160" y1="72" y2="72" className={styles.lineDraw} style={lineAnim(3)} />

        {/* Vertical construction lines - dialog sides */}
        <line x1="30" x2="30" y1="0%" y2="100%" className={styles.lineDraw} style={lineAnim(4)} />
        <line x1="38" x2="38" y1="0%" y2="100%" className={styles.lineDraw} style={lineAnim(5)} />
        <line x1="130" x2="130" y1="0%" y2="100%" className={styles.lineDraw} style={lineAnim(6)} />
        <line x1="122" x2="122" y1="0%" y2="100%" className={styles.lineDraw} style={lineAnim(7)} />

        {/* Diagonal lines - for close button area (top right) */}
        <line x1="110" x2="135" y1="0%" y2="50%" className={styles.lineDraw} style={lineAnim(8)} />
        <line x1="25" x2="50" y1="50%" y2="100%" className={styles.lineDraw} style={lineAnim(9)} />

        {/* Additional horizontal lines - for content sections */}
        <line x1="0" x2="160" y1="38" y2="38" className={styles.lineDraw} style={lineAnim(10)} />
        <line x1="0" x2="160" y1="62" y2="62" className={styles.lineDraw} style={lineAnim(11)} />

        {/* Dialog group - centered */}
        <g transform="translate(30,20)">
          {/* Corner circles - pop animation */}
          <g fill="transparent" stroke="rgba(0,0,0,0.2)" strokeDasharray="4">
            <circle
              cx="4"
              cy="4"
              r="4"
              className={styles.circlesPop}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 0.8)}s`,
                transformOrigin: "4px 4px",
              }}
            />
            <circle
              cx="4"
              cy="56"
              r="4"
              className={styles.circlesPop}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 0.9)}s`,
                transformOrigin: "4px 56px",
              }}
            />
            <circle
              cx="96"
              cy="4"
              r="4"
              className={styles.circlesPop}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.0)}s`,
                transformOrigin: "96px 4px",
              }}
            />
            <circle
              cx="96"
              cy="56"
              r="4"
              className={styles.circlesPop}
              style={{
                animationDuration: durationStr,
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
            className={`stroke-foreground ${styles.dialogDraw}`}
            style={{
              animationDuration: durationStr,
            }}
          />

          {/* Header separator line */}
          <line
            x1="8"
            x2="92"
            y1="18"
            y2="18"
            strokeDasharray="100"
            className={`stroke-foreground ${styles.dialogLine}`}
            style={{
              animationDuration: durationStr,
            }}
          />

          {/* Dialog title text */}
          <text
            x="8"
            y="12"
            fill="transparent"
            className={`stroke-foreground ${styles.textFade}`}
            strokeWidth="0.4"
            fontFamily="Geist"
            fontWeight="semibold"
            fontSize="7"
            strokeDasharray="100"
            style={{
              animationDuration: durationStr,
            }}
          >
            Dialog
          </text>

          {/* Close button X */}
          <g
            className={`stroke-foreground ${styles.dialogX}`}
            strokeWidth="1.2"
            style={{
              animationDuration: durationStr,
            }}
          >
            <line x1="86" y1="6" x2="92" y2="12" strokeDasharray="10" />
            <line x1="92" y1="6" x2="86" y2="12" strokeDasharray="10" />
          </g>

          {/* Content placeholder lines */}
          <g className="stroke-muted-foreground" strokeWidth="0.5">
            <line
              x1="8"
              y1="28"
              x2="70"
              y2="28"
              strokeDasharray="80"
              className={styles.dialogContent}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.5)}s`,
              }}
            />
            <line
              x1="8"
              y1="34"
              x2="55"
              y2="34"
              strokeDasharray="60"
              className={styles.dialogContent}
              style={{
                animationDuration: durationStr,
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
              className={`stroke-muted-foreground ${styles.dialogBtn}`}
              style={{
                animationDuration: durationStr,
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
              className={`stroke-foreground ${styles.dialogBtn}`}
              strokeWidth="1"
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.9)}s`,
              }}
            />
          </g>
        </g>
      </svg>

      {/* Gradient fade overlays */}
      <div className="pointer-events-none absolute inset-0">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-1/4 bg-linear-to-r from-background to-transparent" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-linear-to-l from-background to-transparent" />
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-1/4 bg-linear-to-b from-background to-transparent" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-linear-to-t from-background to-transparent" />
      </div>
    </div>
  );
}
