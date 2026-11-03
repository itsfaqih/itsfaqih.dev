import { styles } from "./typescript-code-writing.css";
/** How far apart, in ms, tsc reaches each line. */
export const STEP = 110;

export const view = {
  /** Hides a line's squiggle and output until tsc first reaches it. */
  unrun: styles.unrun,
};
