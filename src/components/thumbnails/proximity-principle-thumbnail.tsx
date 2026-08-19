/**
 * Proximity Principle Thumbnail
 * Shows the principle of colocating related files.
 * Left: Scattered files (Bad) with X mark.
 * Right: Colocated files in folder (Good) with checkmark.
 */
import { cx } from "@/stylex";
import styles from "./proximity-principle-thumbnail.module.css";

export function ProximityPrincipleThumbnail() {
  return (
    <div className={cx("absolute inset-0 flex items-center justify-center overflow-hidden")}>
      <svg viewBox="0 0 160 100" strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
        {/* Center divider - dashed */}
        <line x1="80" y1="15" x2="80" y2="85" stroke="var(--border)" strokeDasharray="3 2" />

        {/* ============ LEFT SIDE: Scattered/Bad ============ */}
        <g transform="translate(18, 10)">
          {/* Main folder icon at top - floating */}
          <g className={styles.float} style={{ animationDuration: "3s" }}>
            <path
              d="M4,4 L4,18 L26,18 L26,7 L15,7 L13,4 Z"
              fill="var(--background)"
              stroke="var(--foreground)"
              strokeWidth="1"
            />
          </g>

          {/* Connection lines showing scattered relationship - dotted */}
          <g stroke="var(--foreground)" strokeWidth="0.6" strokeDasharray="2 2">
            <path d="M15,18 Q32,22 48,27" fill="none" />
            <path d="M15,18 Q8,32 12,45" fill="none" />
          </g>

          {/* Scattered file 1 - far right - floating independently */}
          <g
            className={styles.floatAlt}
            style={{ animationDuration: "2.5s", animationDelay: "0.3s" }}
          >
            <g transform="translate(42, 25)">
              <rect
                width="14"
                height="18"
                rx="2"
                fill="var(--background)"
                stroke="var(--foreground)"
                strokeWidth="0.8"
              />
              <line x1="3" y1="5" x2="11" y2="5" stroke="var(--foreground)" strokeWidth="0.5" />
              <line x1="3" y1="8" x2="9" y2="8" stroke="var(--foreground)" strokeWidth="0.5" />
              <line x1="3" y1="11" x2="10" y2="11" stroke="var(--foreground)" strokeWidth="0.5" />
            </g>
          </g>

          {/* Scattered file 2 - bottom left - floating independently */}
          <g className={styles.float} style={{ animationDuration: "2.8s", animationDelay: "0.6s" }}>
            <g transform="translate(5, 45)">
              <rect
                width="14"
                height="18"
                rx="2"
                fill="var(--background)"
                stroke="var(--foreground)"
                strokeWidth="0.8"
              />
              <line x1="3" y1="5" x2="11" y2="5" stroke="var(--foreground)" strokeWidth="0.5" />
              <line x1="3" y1="8" x2="9" y2="8" stroke="var(--foreground)" strokeWidth="0.5" />
            </g>
          </g>

          {/* X Mark - Bad indicator */}
          <g transform="translate(25, 75)">
            <line
              x1="-7"
              y1="-7"
              x2="7"
              y2="7"
              stroke="#f87171"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <line
              x1="7"
              y1="-7"
              x2="-7"
              y2="7"
              stroke="#f87171"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* ============ RIGHT SIDE: Colocated/Good ============ */}
        <g transform="translate(88, 10)">
          {/* Entire folder with files floats together as one unit */}
          <g className={styles.float} style={{ animationDuration: "3.5s" }}>
            {/* Large folder containing all files */}
            <path
              d="M2,4 L2,60 L56,60 L56,7 L22,7 L20,4 Z"
              fill="none"
              stroke="var(--foreground)"
              strokeWidth="1"
            />

            {/* File 1 */}
            <g transform="translate(6, 12)">
              <rect
                width="20"
                height="18"
                rx="2"
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="0.8"
              />
              <line x1="4" y1="6" x2="16" y2="6" stroke="var(--foreground)" strokeWidth="0.5" />
              <line x1="4" y1="9" x2="13" y2="9" stroke="var(--foreground)" strokeWidth="0.5" />
              <line x1="4" y1="12" x2="15" y2="12" stroke="var(--foreground)" strokeWidth="0.5" />
            </g>

            {/* File 2 */}
            <g transform="translate(30, 12)">
              <rect
                width="20"
                height="18"
                rx="2"
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="0.8"
              />
              <line x1="4" y1="6" x2="16" y2="6" stroke="var(--foreground)" strokeWidth="0.5" />
              <line x1="4" y1="9" x2="12" y2="9" stroke="var(--foreground)" strokeWidth="0.5" />
              <line x1="4" y1="12" x2="14" y2="12" stroke="var(--foreground)" strokeWidth="0.5" />
            </g>

            {/* File 3 */}
            <g transform="translate(6, 34)">
              <rect
                width="20"
                height="18"
                rx="2"
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="0.8"
              />
              <line x1="4" y1="6" x2="16" y2="6" stroke="var(--foreground)" strokeWidth="0.5" />
              <line x1="4" y1="9" x2="11" y2="9" stroke="var(--foreground)" strokeWidth="0.5" />
              <line x1="4" y1="12" x2="15" y2="12" stroke="var(--foreground)" strokeWidth="0.5" />
            </g>

            {/* File 4 */}
            <g transform="translate(30, 34)">
              <rect
                width="20"
                height="18"
                rx="2"
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="0.8"
              />
              <line x1="4" y1="6" x2="16" y2="6" stroke="var(--foreground)" strokeWidth="0.5" />
              <line x1="4" y1="9" x2="10" y2="9" stroke="var(--foreground)" strokeWidth="0.5" />
              <line x1="4" y1="12" x2="13" y2="12" stroke="var(--foreground)" strokeWidth="0.5" />
            </g>
          </g>

          {/* Check Mark - Good indicator (outside the floating group so it stays in place) */}
          <g transform="translate(29, 75)">
            <path
              d="M-8 0 L-3 6 L 9 -6"
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>

      {/* Gradient fade overlays */}
      <div className={cx("pointer-events-none absolute inset-0")}>
        <div className={cx("absolute left-0 t -0 bottom-0 w-1/5 bg-linear-to-r from-background to-transparent")} />
        <div className={cx("absolute right-0 top-0 bottom-0 w-1/5 bg-linear-to-l from-background to-transparent")} />
        <div className={cx("absolute top-0 left-0 right-0 h-1/5 bg-linear-to-b from-background to-transparent")} />
        <div className={cx("absolute bottom-0 left-0 right-0 h-1/5 bg-linear-to-t from-background to-transparent")} />
      </div>
    </div>
  );
}
