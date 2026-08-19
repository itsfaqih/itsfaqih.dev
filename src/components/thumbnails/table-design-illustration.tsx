import { cx } from "@/stylex";
import styles from "./table-design-thumbnail.module.css";

const duration = 5;
const durationStr = `${duration}s`;

export function TableDesignIllustration() {
  return (
    <>
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
            className={cx(`stroke-foreground ${styles.tableDraw}`)}
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
            className={cx(`stroke-foreground ${styles.tableHeader}`)}
            style={{
              animationDuration: durationStr,
            }}
          />

          {/* Column dividers */}
          <g className={cx("stroke-muted-foreground")} strokeWidth="0.5">
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
          <g className={cx("stroke-foreground")} strokeWidth="0.5">
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
          <g className={cx("stroke-muted-foreground")} strokeWidth="0.5">
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
          <g className={cx("stroke-muted-foreground")} strokeWidth="0.5">
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
          <g className={cx("stroke-muted-foreground")} strokeWidth="0.5">
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
    </>
  );
}
