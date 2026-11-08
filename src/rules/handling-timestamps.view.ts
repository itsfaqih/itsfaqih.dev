import type { Fate } from "./handling-timestamps";
import { marker } from "../when";
import { cx } from "../cx";
import { styles } from "./handling-timestamps.css";

/** Class names for what the custom elements draw and redraw. */
export const tsView = {
  // The marker lets a quoted string ask whether its line is a note.
  line: (note: boolean, hot: boolean) =>
    cx(styles.line, note && styles.note, hot && styles.hot, marker),
  ghost: cx(styles.hand, styles.ghost),
  minute: `timestamps-min ${cx(styles.hand, styles.minuteHand)}`,
  hour: (off: boolean) => `timestamps-hour ${cx(styles.hand, off && styles.hourOff)}`,
  time: (off: boolean) => cx(styles.time, off && styles.off),
  order: (fate: Fate) =>
    cx(
      styles.order,
      fate === "out" && styles.orderOut,
      fate === "shown" && styles.orderShown,
      (fate === "missed" || fate === "extra") && styles.orderWrong,
    ),
  when: (fate: Fate) => cx(styles.when, fate === "missed" && styles.whenMissed),
  fate: (fate: Fate) =>
    cx(
      styles.fate,
      fate === "shown" && styles.fateShown,
      (fate === "missed" || fate === "extra") && styles.fateWrong,
    ),
};
