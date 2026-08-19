/**
 * TypeScript Guidelines Thumbnail
 * An animated blueprint showing the TypeScript logo with construction lines.
 * Animation sequence: lines → circles → rectangle → text characters
 */
import { cx } from "@/stylex";
import styles from "./typescript-guidelines-thumbnail.module.css";

export function TypeScriptGuidelinesThumbnail() {
  const duration = 7; // seconds (matching button-design-thumbnail)
  const durationStr = `${duration}s`;
  const lineStyle = {
    stroke: "var(--grid-color)",
    strokeDasharray: 3,
  };

  // Helper to create line animation style with staggered start
  const lineAnim = (index: number) => {
    const stagger = 0.15;
    const delay = -(duration - index * stagger);
    return {
      ...lineStyle,
      animationDuration: durationStr,
      animationDelay: `${delay}s`,
    };
  };

  // Helper for circle pop animation
  const circleAnim = (index: number) => {
    const baseDelay = 8 * 0.15;
    const stagger = 0.1;
    const delay = -(duration - (baseDelay + index * stagger));
    return {
      animationDuration: durationStr,
      animationDelay: `${delay}s`,
    };
  };

  // Helper for staggered character animation
  const charAnim = (index: number) => {
    const baseDelay = 8 * 0.15 + 4 * 0.1 + 0.1;
    const stagger = 0.08;
    const delay = -(duration - (baseDelay + index * stagger));
    return {
      animationDuration: durationStr,
      animationDelay: `${delay}s`,
    };
  };

  const logoText = "TS";

  return (
    <div className={cx("absolute inset-0 flex items-center justify-center overflow-hidden")}>
      <svg viewBox="0 0 160 100" strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
        {/* Construction lines - staggered animation in clockwise pattern */}
        <line x1="50" x2="50" y1="0" y2="100" className={styles.lineDraw} style={lineAnim(0)} />
        <line x1="110" x2="110" y1="0" y2="100" className={styles.lineDraw} style={lineAnim(1)} />
        <line x1="0" x2="160" y1="80" y2="80" className={styles.lineDraw} style={lineAnim(2)} />
        <line x1="0" x2="160" y1="20" y2="20" className={styles.lineDraw} style={lineAnim(3)} />
        <line x1="56" x2="56" y1="0" y2="100" className={styles.lineDraw} style={lineAnim(4)} />
        <line x1="104" x2="104" y1="0" y2="100" className={styles.lineDraw} style={lineAnim(5)} />
        <line x1="0" x2="160" y1="26" y2="26" className={styles.lineDraw} style={lineAnim(6)} />
        <line x1="0" x2="160" y1="74" y2="74" className={styles.lineDraw} style={lineAnim(7)} />

        <g transform="translate(50, 20)">
          {/* Corner circles - pop animation in clockwise order from top-left */}
          <g fill="transparent" stroke="rgba(0,0,0,0.2)" strokeDasharray="4">
            <circle
              cx="6"
              cy="6"
              r="6"
              className={styles.circlesPop}
              style={{
                ...circleAnim(0),
                transformOrigin: "6px 6px",
              }}
            />
            <circle
              cx="54"
              cy="6"
              r="6"
              className={styles.circlesPop}
              style={{
                ...circleAnim(1),
                transformOrigin: "54px 6px",
              }}
            />
            <circle
              cx="54"
              cy="54"
              r="6"
              className={styles.circlesPop}
              style={{
                ...circleAnim(2),
                transformOrigin: "54px 54px",
              }}
            />
            <circle
              cx="6"
              cy="54"
              r="6"
              className={styles.circlesPop}
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
            className={cx(`stroke-foreground ${styles.rectDraw}`)}
            style={{
              animationDuration: durationStr,
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
            stroke="var(--foreground)"
            strokeWidth="0.8"
            fontFamily="Geist"
            fontWeight="700"
            fontSize="28"
          >
            {logoText.split("").map((char, index) => (
              <tspan
                key={index}
                className={styles.charFade}
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
      <div className={cx("pointer-events-none absolute inset-0")}>
        <div className={cx("absolute left-0 top-0 bottom-0 w-1/4 bg-linear-to-r from-background to-transparent")} />
        <div className={cx("absolute right-0 top-0 bottom-0 w-1/4 bg-linear-to-l from-background to-transparent")} />
        <div className={cx("absolute top-0 left-0 right-0 h-1/4 bg-linear-to-b from-background to-transparent")} />
        <div className={cx("absolute bottom-0 left-0 right-0 h-1/4 bg-linear-to-t from-background to-transparent")} />
      </div>
    </div>
  );
}
