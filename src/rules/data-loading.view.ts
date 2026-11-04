import { button } from "../components/button.css";
import { buttonVariant } from "../components/button";
import { cx } from "../cx";
import { styles } from "./data-loading.css";
export type Sweep = "still" | "armed" | "run";
export type Signal = "offline" | "connecting" | "online";

/** Classes the demos' first frame and their elements both set, so they have one source. */
export const view = {
  ctlButton: cx(button.base, buttonVariant["primary-neutral"], button.sm, styles.ctlButton),
  spin: (small: boolean, inFigure = false) =>
    cx(styles.spin, small && styles.spinSmall, inFigure && styles.spinInFigure),
  paint: (sweep: Sweep) =>
    cx(styles.paint, sweep === "armed" && styles.paintArmed, sweep === "run" && styles.paintRun),
  cover: (sweep: Sweep) =>
    cx(styles.cover, sweep !== "still" && styles.coverShown, sweep === "run" && styles.coverRun),
  amount: (fresh: boolean) => cx(styles.amount, fresh && styles.amountFresh),
  sub: (blank: boolean) => cx(styles.sub, blank && styles.hidden),
  mailRow: (skeleton: boolean) => cx(styles.mailRow, skeleton && styles.mailRowStill),
  avatar: (skeleton: boolean) => cx(styles.avatar, skeleton && styles.bone),
  mailFrom: (skeleton: boolean) => cx(styles.mailLine, styles.mailFrom, skeleton && styles.bone),
  mailSubject: (skeleton: boolean) =>
    cx(styles.mailLine, styles.mailSubject, skeleton && styles.bone),
  signal: (signal: Signal) =>
    cx(styles.status, signal === "offline" && styles.offline, signal === "online" && styles.online),
  balance: (online: boolean, careful: boolean) =>
    cx(
      styles.balanceValue,
      online && !careful && styles.balanceJump,
      !online && careful && styles.balanceWait,
    ),
  histRow: (fresh: boolean) => cx(styles.histRow, fresh && styles.histRowNew),
};
