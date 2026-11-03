import { fluidHover } from "./fluid-hover.css";
import { cx } from "../cx";
import { styles } from "./command-palette.css";
export type Step = "in" | "out" | null;

/** The classes that change with the palette's state, for command-palette.astro and its client. */
export const view = {
  crumb: (open: boolean) => cx(styles.crumbFold, open && styles.crumbOpen),
  level: (step: Step) =>
    cx(
      fluidHover.group,
      step && styles.level,
      step === "in" && styles.fromRight,
      step === "out" && styles.fromLeft,
    ),
  leaving: (toward: "left" | "right") =>
    cx(fluidHover.group, toward === "left" ? styles.toLeft : styles.toRight),
  group: (later: boolean) => (later ? styles.laterGroup : undefined),
  item: (selected: boolean) => cx(styles.item, selected && styles.itemSelected),
  icon: (selected: boolean) => cx(styles.icon, selected && styles.iconSelected),
  glyph: (off: boolean) => cx(styles.glyph, off && styles.glyphOff),
};
// When the closing drop reaches the island (70% of T_OUT) and starts filling it out.
export const ISLAND_HOME_MS = 170;

// The list's own vertical padding, added to its level's height. Kept in step with styles.list.
export const LIST_PADDING = 12;
