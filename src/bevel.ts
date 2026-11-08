/** A key's hard drop, `px` tall. It lies flat while its control is disabled (styles.css sets --bevel). */
export const drop = (px: number, color: string) => `0 calc(${px}px * var(--bevel, 1)) 0 ${color}`;
