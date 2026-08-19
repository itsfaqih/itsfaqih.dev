import styles from "./table-design-thumbnail.module.css";

const duration = 5;
const durationStr = `${duration}s`;
const lineStyle = {
  stroke: "var(--grid-color)",
  strokeDasharray: 3,
};

function lineAnim(index: number) {
  const stagger = 0.04;
  const delay = -(duration - index * stagger);
  return {
    ...lineStyle,
    animationDuration: durationStr,
    animationDelay: `${delay}s`,
  };
}

export function TableDesignGridLines() {
  return (
    <>
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
    </>
  );
}
