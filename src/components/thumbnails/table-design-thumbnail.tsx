/**
 * Table Design Thumbnail
 * An animated blueprint showing table construction with looping draw effect.
 */
import styles from "./table-design-thumbnail.module.css";

export function TableDesignThumbnail() {
  const duration = 5; // seconds
  const durationStr = `${duration}s`;
  const lineStyle = {
    stroke: "var(--grid-color)",
    strokeDasharray: 3,
  };

  // Helper to create line animation style with staggered start
  const lineAnim = (index: number) => {
    const stagger = 0.04;
    const delay = -(duration - index * stagger);
    return {
      ...lineStyle,
      animationDuration: durationStr,
      animationDelay: `${delay}s`,
    };
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg viewBox="0 0 160 100" strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
        {/* Horizontal construction lines - table edges */}
        <line x1="0" x2="160" y1="18" y2="18" className={styles.lineDraw} style={lineAnim(0)} />
        <line x1="0" x2="160" y1="26" y2="26" className={styles.lineDraw} style={lineAnim(1)} />
        <line x1="0" x2="160" y1="82" y2="82" className={styles.lineDraw} style={lineAnim(2)} />
        <line x1="0" x2="160" y1="74" y2="74" className={styles.lineDraw} style={lineAnim(3)} />

        {/* Vertical construction lines - table columns */}
        <line x1="25" x2="25" y1="0%" y2="100%" className={styles.lineDraw} style={lineAnim(4)} />
        <line x1="33" x2="33" y1="0%" y2="100%" className={styles.lineDraw} style={lineAnim(5)} />
        <line x1="135" x2="135" y1="0%" y2="100%" className={styles.lineDraw} style={lineAnim(6)} />
        <line x1="127" x2="127" y1="0%" y2="100%" className={styles.lineDraw} style={lineAnim(7)} />

        {/* Column divider lines */}
        <line x1="60" x2="60" y1="0%" y2="100%" className={styles.lineDraw} style={lineAnim(8)} />
        <line x1="100" x2="100" y1="0%" y2="100%" className={styles.lineDraw} style={lineAnim(9)} />

        {/* Row divider lines */}
        <line x1="0" x2="160" y1="42" y2="42" className={styles.lineDraw} style={lineAnim(10)} />
        <line x1="0" x2="160" y1="58" y2="58" className={styles.lineDraw} style={lineAnim(11)} />

        {/* Table group - centered */}
        <g transform="translate(25,18)">
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
              cy="60"
              r="4"
              className={styles.circlesPop}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 0.9)}s`,
                transformOrigin: "4px 60px",
              }}
            />
            <circle
              cx="106"
              cy="4"
              r="4"
              className={styles.circlesPop}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.0)}s`,
                transformOrigin: "106px 4px",
              }}
            />
            <circle
              cx="106"
              cy="60"
              r="4"
              className={styles.circlesPop}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.1)}s`,
                transformOrigin: "106px 60px",
              }}
            />
          </g>

          {/* Table outer rectangle - draw animation */}
          <rect
            width="110"
            height="64"
            rx="3"
            fill="transparent"
            strokeDasharray="350"
            className={`stroke-(--text-primary) ${styles.tableDraw}`}
            style={{
              animationDuration: durationStr,
            }}
          />

          {/* Header separator line */}
          <line
            x1="0"
            x2="110"
            y1="16"
            y2="16"
            strokeDasharray="120"
            className={`stroke-(--text-primary) ${styles.tableHeader}`}
            style={{
              animationDuration: durationStr,
            }}
          />

          {/* Column dividers */}
          <g className="stroke-(--text-secondary)" strokeWidth="0.5">
            <line
              x1="36"
              y1="4"
              x2="36"
              y2="60"
              strokeDasharray="60"
              className={styles.tableCol}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.4)}s`,
              }}
            />
            <line
              x1="73"
              y1="4"
              x2="73"
              y2="60"
              strokeDasharray="60"
              className={styles.tableCol}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.5)}s`,
              }}
            />
          </g>

          {/* Header text placeholders */}
          <g className="stroke-(--text-primary)" strokeWidth="0.5">
            <line
              x1="6"
              y1="10"
              x2="28"
              y2="10"
              strokeDasharray="30"
              className={styles.tableCell}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.6)}s`,
              }}
            />
            <line
              x1="42"
              y1="10"
              x2="66"
              y2="10"
              strokeDasharray="30"
              className={styles.tableCell}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.65)}s`,
              }}
            />
            <line
              x1="79"
              y1="10"
              x2="103"
              y2="10"
              strokeDasharray="30"
              className={styles.tableCell}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.7)}s`,
              }}
            />
          </g>

          {/* Row 1 content */}
          <g className="stroke-(--text-secondary)" strokeWidth="0.5">
            <line
              x1="6"
              y1="28"
              x2="24"
              y2="28"
              strokeDasharray="25"
              className={styles.tableCell}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.75)}s`,
              }}
            />
            <line
              x1="42"
              y1="28"
              x2="62"
              y2="28"
              strokeDasharray="25"
              className={styles.tableCell}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.8)}s`,
              }}
            />
            <line
              x1="79"
              y1="28"
              x2="99"
              y2="28"
              strokeDasharray="25"
              className={styles.tableCell}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.85)}s`,
              }}
            />
          </g>

          {/* Row 2 content */}
          <g className="stroke-(--text-secondary)" strokeWidth="0.5">
            <line
              x1="6"
              y1="42"
              x2="26"
              y2="42"
              strokeDasharray="25"
              className={styles.tableCell}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.9)}s`,
              }}
            />
            <line
              x1="42"
              y1="42"
              x2="60"
              y2="42"
              strokeDasharray="25"
              className={styles.tableCell}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 1.95)}s`,
              }}
            />
            <line
              x1="79"
              y1="42"
              x2="97"
              y2="42"
              strokeDasharray="25"
              className={styles.tableCell}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 2.0)}s`,
              }}
            />
          </g>

          {/* Row 3 content */}
          <g className="stroke-(--text-secondary)" strokeWidth="0.5">
            <line
              x1="6"
              y1="54"
              x2="22"
              y2="54"
              strokeDasharray="25"
              className={styles.tableCell}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 2.05)}s`,
              }}
            />
            <line
              x1="42"
              y1="54"
              x2="64"
              y2="54"
              strokeDasharray="25"
              className={styles.tableCell}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 2.1)}s`,
              }}
            />
            <line
              x1="79"
              y1="54"
              x2="101"
              y2="54"
              strokeDasharray="25"
              className={styles.tableCell}
              style={{
                animationDuration: durationStr,
                animationDelay: `${-(duration - 2.15)}s`,
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
