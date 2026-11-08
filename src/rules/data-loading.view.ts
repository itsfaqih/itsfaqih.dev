import { button } from "../components/button.css";
import { buttonVariant } from "../components/button.view";
import { cx } from "../cx";
import { AXIS, type Fate, type Shown } from "./data-loading";
import { quiz, styles } from "./data-loading.css";

/** Where `ms` sits along a waterfall's axis, as a share of its width. */
export const pct = (ms: number) => `${(ms / AXIS) * 100}%`;

/** A paint line's tag, which turns to sit left of the line near the axis's end. */
const paintTag = (at: number) => cx(styles.paintTag, at > AXIS * 0.6 && styles.paintTagEnd);

export const slideView = {
  tag: (at: number) => cx(paintTag(at), quiz.slideTag),
  check: cx(button.base, buttonVariant["primary-hue"], button.sm, quiz.check),
};

/** Quiz 4's board: its load toggle's keys, and a suggestion row as the preview shows it. */
export const skeletonView = {
  key: (on: boolean) => cx(quiz.segKey, on && quiz.segOn),
  match: (shown: Shown, fresh = false) =>
    cx(
      quiz.skelMatch,
      shown === "skeleton" && styles.bone,
      shown === "typed" && styles.hidden,
      shown === "data" && fresh && quiz.skelFresh,
    ),
};

/** Quiz 5's verdict chips under the search box: red for the problem a fix leaves, green once it's fixed. */
export const fixView = {
  chip: (bad: boolean) => cx(styles.fate, quiz.fixChip, bad ? styles.fateStale : styles.fateShown),
};

export type Sweep = "still" | "armed" | "run";
export type Signal = "offline" | "connecting" | "online";

/** Classes the demos' first frame and their elements both set, so they have one source. */
export const view = {
  paintTag,
  ctlButton: cx(button.base, buttonVariant["primary-neutral"], button.sm, styles.ctlButton),
  spin: (small: boolean, inFigure = false) =>
    cx(styles.spin, small && styles.spinSmall, inFigure && styles.spinInFigure),
  paint: (sweep: Sweep) =>
    cx(styles.paint, sweep === "armed" && styles.paintArmed, sweep === "run" && styles.paintRun),
  cover: (sweep: Sweep) =>
    cx(styles.cover, sweep !== "still" && styles.coverShown, sweep === "run" && styles.coverRun),
  screen: (sweep: Sweep) =>
    cx(
      styles.card,
      styles.screen,
      sweep === "armed" && styles.screenArmed,
      sweep === "run" && styles.screenRun,
    ),
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
  frame: (blank: boolean) => cx(styles.frame, blank && styles.frameBlank),
  results: (wrong: boolean) => cx(styles.results, wrong && styles.resultsWrong),
  resultsFor: (wrong: boolean) => cx(styles.status, wrong && styles.offline),
  logQuery: (fate: Fate) => cx(fate === "canceled" && styles.logCanceled),
  fate: (fate: Fate, stale: boolean) =>
    cx(styles.fate, fate === "shown" && (stale ? styles.fateStale : styles.fateShown)),
};
