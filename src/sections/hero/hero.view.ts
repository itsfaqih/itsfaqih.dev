import { cx } from "../../cx";
import { styles } from "./hero.css";
export const phraseClass = (on: boolean, slashing: boolean) =>
  cx(styles.phrase, on && styles.phraseOn, on && slashing && styles.slash);
export const barClass = (on: boolean, held: boolean) =>
  cx(styles.bar, on && styles.barOn, on && held && styles.barHeld);
export const glyphClass = (off: boolean) => cx(styles.glyph, off && styles.glyphOff);
