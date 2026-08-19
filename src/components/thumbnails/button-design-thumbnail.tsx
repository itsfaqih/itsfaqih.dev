/**
 * Button Design Thumbnail
 * An animated blueprint showing button construction with looping draw effect.
 */
import { cx } from "@/stylex";
import styles from "./button-design-thumbnail.module.css";

export function ButtonDesignThumbnail() {
  const duration = 7; // seconds
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
      animationDuration: durationStr,
      animationDelay: `${delay}s`,
    };
  };

  // Helper for circle pop animation
  const circleAnim = (index: number) => {
    const baseDelay = 8 * 0.15; // After 8 lines
    const stagger = 0.1;
    const delay = -(duration - (baseDelay + index * stagger));
    return {
      animationDuration: durationStr,
      animationDelay: `${delay}s`,
    };
  };

  // Helper for staggered character animation
  const charAnim = (index: number) => {
    const baseDelay = 8 * 0.15 + 4 * 0.1 + 0.1; // After lines, circles, and rect (reduced from 0.3 to 0.1)
    const stagger = 0.08;
    const delay = -(duration - (baseDelay + index * stagger));
    return {
      animationDuration: durationStr,
      animationDelay: `${delay}s`,
    };
  };

  const buttonText = "Button";

  return (
    <div className={cx("absolute inset-0 flex items-center justify-center overflow-hidden")}>
      <svg viewBox="0 0 160 100" strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
        {/* 1. Most top horizontal line (left-to-right) - y=35 */}
        <line x1="0" x2="160" y1="35" y2="35" className={styles.lineDraw} style={lineAnim(0)} />

        {/* 2. Most right vertical line (top-to-bottom) - x=115 */}
        <line x1="115" x2="115" y1="0" y2="100" className={styles.lineDraw} style={lineAnim(1)} />

        {/* 3. Most bottom horizontal line (right-to-left) - y=65 */}
        <line x1="160" x2="0" y1="65" y2="65" className={styles.lineDraw} style={lineAnim(2)} />

        {/* 4. Most left vertical line (bottom-to-top) - x=45 */}
        <line x1="45" x2="45" y1="100" y2="0" className={styles.lineDraw} style={lineAnim(3)} />

        {/* 5. 2nd top horizontal line (left-to-right) - y=43 */}
        <line x1="0" x2="160" y1="43" y2="43" className={styles.lineDraw} style={lineAnim(4)} />

        {/* 6. 2nd right vertical line (top-to-bottom) - x=107 */}
        <line x1="107" x2="107" y1="0" y2="100" className={styles.lineDraw} style={lineAnim(5)} />

        {/* 7. 2nd bottom horizontal line (right-to-left) - y=57 */}
        <line x1="160" x2="0" y1="57" y2="57" className={styles.lineDraw} style={lineAnim(6)} />

        {/* 8. 2nd left vertical line (bottom-to-top) - x=53 */}
        <line x1="53" x2="53" y1="100" y2="0" className={styles.lineDraw} style={lineAnim(7)} />

        <g transform="translate(45,35)">
          {/* Corner circles - pop animation in clockwise order from top-left */}
          <g fill="transparent" stroke="rgba(0,0,0,0.2)" strokeDasharray="4">
            {/* 9. Top left corner circle */}
            <circle
              cx="4"
              cy="4"
              r="4"
              className={styles.circlesPop}
              style={{
                ...circleAnim(0),
                transformOrigin: "4px 4px",
              }}
            />
            {/* 10. Top right corner circle */}
            <circle
              cx="66"
              cy="4"
              r="4"
              className={styles.circlesPop}
              style={{
                ...circleAnim(1),
                transformOrigin: "66px 4px",
              }}
            />
            {/* 11. Bottom right corner circle */}
            <circle
              cx="66"
              cy="26"
              r="4"
              className={styles.circlesPop}
              style={{
                ...circleAnim(2),
                transformOrigin: "66px 26px",
              }}
            />
            {/* 12. Bottom left corner circle */}
            <circle
              cx="4"
              cy="26"
              r="4"
              className={styles.circlesPop}
              style={{
                ...circleAnim(3),
                transformOrigin: "4px 26px",
              }}
            />
          </g>

          {/* 13. Button rectangle - draw animation */}
          <rect
            width="70"
            height="30"
            rx="4"
            fill="transparent"
            strokeDasharray="200"
            className={cx(`stroke-foreground ${styles.rectDraw}`)}
            style={{
              animationDuration: durationStr,
              animationDelay: `${-(duration - (8 * 0.15 + 4 * 0.1))}s`,
            }}
          />

          {/* 14. Button text - staggered character animation */}
          <text
            x="35"
            y="16"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="transparent"
            stroke="var(--foreground)"
            strokeWidth="0.4"
            fontFamily="Geist"
            fontWeight="500"
            fontSize="12"
          >
            {buttonText.split("").map((char, index) => (
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
        {/* Left fade */}
        <div className={cx("absolute left-0 top-0 bottom-0 w-1/4 bg-linear-to-r from-background to-transparent")} />
        {/* Right fade */}
        <div className={cx("absolute right-0 top-0 bottom-0 w-1/4 bg-linear-to-l from-background to-transparent")} />
        {/* Top fade */}
        <div className={cx("absolute top-0 left-0 right-0 h-1/4 bg-linear-to-b from-background to-transparent")} />
        {/* Bottom fade */}
        <div className={cx("absolute bottom-0 left-0 right-0 h-1/4 bg-linear-to-t from-background to-transparent")} />
      </div>
    </div>
  );
}
