import { marker } from "../when";
import { cx } from "../cx";
import { styles } from "./button-design.css";
/** A slug an older post already holds, so this one can't publish under it. */
export const TAKEN = "spring-launch";

export type Step = "idle" | "confirm" | "undo" | "deleted";

/** Classes the demos' elements switch between, shared by their markup and their clients. */
export const view = {
  dot: (on: boolean) => cx(styles.dot, on && styles.dotOn),
  publish: (careful: boolean, ready: boolean) =>
    careful
      ? cx(styles.key, ready && styles.live, styles.sm, !ready && styles.off, marker)
      : cx(styles.key, ready && styles.live, styles.sm, styles.formEnd, !ready && styles.faded),
  tooltip: (open: boolean) => cx(styles.tooltip, open && styles.tooltipOpen),
  guard: (on: boolean) => cx(styles.guard, on && styles.guardOn),
  project: (step: Step) =>
    cx(
      styles.project,
      step === "confirm" && styles.confirm,
      (step === "deleted" || step === "undo") && styles.deleted,
    ),
  projectName: (gone: boolean) => cx(styles.projectName, gone && styles.projectGone),
  /** The key after the project's name: Delete (or Hold to delete) while idle, then Undo or Reset. */
  action: (step: Step, held: boolean) =>
    step === "idle"
      ? cx(
          styles.key,
          styles.sm,
          styles.live,
          styles.red,
          styles.tint,
          held && styles.hold,
          styles.stepIn,
        )
      : cx(styles.key, styles.sm, styles.live, styles.text, styles.stepIn),
  holdFill: (holding: boolean) => cx(styles.holdFill, holding && styles.holdFillOn),
};
