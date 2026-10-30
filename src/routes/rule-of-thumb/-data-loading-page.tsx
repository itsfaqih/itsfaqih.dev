import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { reducedMotion } from "../../hooks/use-media-query";
import { cursors, fonts, motion, palette } from "../../theme.stylex";
import {
  Code,
  type Lesson,
  LessonText,
  type Level,
  onceOnScreen,
  RuleLanding,
  Tip,
} from "./-components/rule-landing";
import { kit } from "./-components/rule-landing.stylex";
import { button } from "../../components/button";
import { arcade } from "../../components/arcade";

const PHONE = "@media (max-width: 640px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";

const turn = stylex.keyframes({
  to: { transform: "rotate(1turn)" },
});
const fresh = stylex.keyframes({
  from: { opacity: 0.25, transform: "translateY(4px)" },
});
const sweep = stylex.keyframes({
  to: { transform: "translate(calc(100% + 12px))" },
});
const mark = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
});
const pulse = stylex.keyframes({
  to: { opacity: 0.45 },
});
const toast = stylex.keyframes({
  "0%": { opacity: 0, transform: "translateY(10px)" },
  "8%, 86%": { opacity: 1, transform: "none" },
  "100%": { opacity: 0, transform: "none" },
});
const fade = stylex.keyframes({
  from: { opacity: 0 },
});
const jump = stylex.keyframes({
  "from, 40%": { color: kit["--no-ink"] },
});
const toastFade = stylex.keyframes({
  "0%, 100%": { opacity: 0 },
  "8%, 86%": { opacity: 1 },
});

const styles = stylex.create({
  stores: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  store: {
    paddingBlock: "4px",
    paddingInline: "8px",
    fontSize: "13px",
    color: "var(--c-ink)",
  },
  view: {
    display: "grid",
    gridTemplateRows: "1fr auto",
    gap: "14px",
    minWidth: 0,
  },
  ctl: {
    display: "flex",
    flexWrap: "wrap",
    rowGap: "8px",
    columnGap: "10px",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: "12px",
    borderTopWidth: "1.5px",
    borderTopStyle: "dashed",
    borderTopColor: palette["--hair"],
  },
  ctlButton: {
    opacity: { default: null, ":disabled": 0.55 },
    cursor: { default: null, ":disabled": cursors["--cursor-forbid"] },
  },
  note: {
    display: "inline-flex",
    flexWrap: "wrap",
    rowGap: "4px",
    columnGap: "6px",
    alignItems: "center",
    fontSize: "13px",
    color: palette["--mute"],
  },
  pair: {
    display: "flex",
    gap: "8px",
  },
  card: {
    position: "relative",
    display: "grid",
    gap: "12px",
    alignContent: "start",
    paddingTop: { default: "14px", [PHONE]: "12px" },
    paddingInline: { default: "16px", [PHONE]: "12px" },
    paddingBottom: { default: "16px", [PHONE]: "14px" },
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: `${palette["--raise"]}, 0 3px 0 ${palette["--drop-ink"]}`,
    overflow: "hidden",
  },
  head: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "22px",
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--text"],
  },
  status: {
    display: "inline-flex",
    gap: "6px",
    alignItems: "center",
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
    whiteSpace: "nowrap",
  },
  offline: {
    color: kit["--no-ink"],
  },
  online: {
    color: kit["--yes-ink"],
  },
  spin: {
    display: "inline-block",
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "24px",
    height: "24px",
    borderWidth: "3px",
    borderStyle: "solid",
    borderColor: palette["--panel-2"],
    borderTopColor: "var(--c)",
    borderRadius: "50%",
    animationName: { default: turn, [REDUCE]: pulse },
    animationDuration: "700ms",
    animationTimingFunction: { default: "linear", [REDUCE]: "ease-in-out" },
    animationIterationCount: "infinite",
    animationDirection: { default: null, [REDUCE]: "alternate" },
  },
  spinSmall: {
    width: "12px",
    height: "12px",
    borderWidth: "2px",
  },
  spinInFigure: {
    justifySelf: "start",
    marginBlock: "6px",
    marginInline: 0,
  },
  wf: {
    display: "grid",
    gridTemplateColumns: { default: "92px minmax(0, 1fr)", [PHONE]: "82px minmax(0, 1fr)" },
    rowGap: "6px",
    columnGap: { default: "10px", [PHONE]: "8px" },
    alignContent: "start",
  },
  lanes: {
    display: "grid",
    gridAutoRows: "26px",
    gap: "4px",
    minHeight: "116px",
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: 0,
    paddingInline: 0,
    listStyle: "none",
  },
  label: {
    textWrap: "pretty",
    display: "flex",
    alignItems: "center",
    fontWeight: 600,
    fontSize: { default: "11.5px", [PHONE]: "10.5px" },
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--dim"],
    whiteSpace: "nowrap",
  },
  plot: {
    position: "relative",
    paddingBottom: "30px",
    borderRadius: "6px",
    overflow: "hidden",
  },
  lane: {
    textWrap: "pretty",
    position: "relative",
  },
  bar: {
    position: "absolute",
    top: "7px",
    minWidth: "4px",
    height: "12px",
    borderRadius: "4px",
  },
  code: {
    backgroundColor: palette["--hair"],
  },
  render: {
    backgroundColor: palette["--dim"],
  },
  req: {
    backgroundColor: {
      default: "var(--c)",
      [stylex.when.ancestor('[data-side="bad"]')]: kit["--no"],
    },
    boxShadow: {
      default: "0 2px 0 var(--key-c)",
      [stylex.when.ancestor('[data-side="bad"]')]: `0 2px 0 ${palette["--no-shadow"]}`,
    },
  },
  defer: {
    backgroundImage:
      "repeating-linear-gradient(135deg, color-mix(in srgb, var(--c) 50%, transparent) 0 4px, transparent 4px 8px)",
    boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--c) 75%, transparent)",
  },
  paint: {
    position: "absolute",
    top: 0,
    bottom: "4px",
    zIndex: 4,
    width: "2px",
    marginLeft: "-1px",
    borderRadius: "1px",
    backgroundColor: palette["--text"],
  },
  paintArmed: {
    opacity: 0,
  },
  paintRun: {
    animationName: { default: mark, [REDUCE]: "none" },
    animationDuration: { default: "260ms", [REDUCE]: "0s" },
    animationTimingFunction: { default: motion["--snap"], [REDUCE]: "ease" },
    animationDelay: { default: "var(--at)", [REDUCE]: "0s" },
    animationFillMode: { default: "backwards", [REDUCE]: "none" },
  },
  paintTag: {
    position: "absolute",
    bottom: 0,
    left: "6px",
    paddingBlock: "3px",
    paddingInline: "7px",
    borderRadius: "6px",
    backgroundColor: palette["--text"],
    fontWeight: 700,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--bg"],
    whiteSpace: "nowrap",
  },
  paintTagEnd: {
    right: "6px",
    left: "auto",
  },
  long: {
    display: { default: null, [PHONE]: "none" },
  },
  grid: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: "30px",
    left: 0,
    zIndex: 3,
    pointerEvents: "none",
    backgroundImage: `linear-gradient(90deg, ${kit["--grid"]} 1px, transparent 1px)`,
    backgroundSize: "25% 100%",
  },
  cover: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    display: "none",
    backgroundColor: kit["--code-bg"],
    "::before": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: "30px",
      left: 0,
      width: "2px",
      backgroundColor: "var(--c)",
      boxShadow: "0 0 10px var(--c)",
    },
  },
  coverShown: {
    display: { default: "block", [REDUCE]: "none" },
  },
  coverRun: {
    animationName: sweep,
    animationDuration: "var(--sweep)",
    animationTimingFunction: "linear",
    animationFillMode: "forwards",
  },
  axis: {
    position: "relative",
    gridColumn: 2,
    height: "14px",
    fontWeight: 500,
    fontSize: "10.5px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
  },
  tick: {
    position: "absolute",
    fontStyle: "normal",
    transform: {
      default: "translateX(-50%)",
      ":first-child": "none",
      ":last-child": "translateX(-100%)",
    },
  },
  key: {
    display: "inline-block",
    width: "14px",
    height: "8px",
    marginLeft: { default: "4px", ":first-child": 0 },
    borderRadius: "3px",
  },
  keyReq: {
    backgroundColor: {
      default: "var(--c)",
      [stylex.when.ancestor('[data-side="bad"]')]: kit["--no"],
    },
  },
  keyCode: {
    backgroundColor: palette["--hair"],
  },
  keyDefer: {
    backgroundColor: "color-mix(in srgb, var(--c) 45%, transparent)",
    boxShadow: "inset 0 0 0 1.5px var(--c)",
  },
  figure: {
    display: "grid",
    gap: "4px",
    alignContent: "center",
    minHeight: "82px",
  },
  amount: {
    fontWeight: 900,
    fontSize: { default: "34px", [PHONE]: "28px" },
    lineHeight: 1.1,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    color: palette["--text"],
    fontVariantNumeric: "tabular-nums",
    animationName: { default: null, [REDUCE]: fade },
  },
  amountFresh: {
    animationName: { default: fresh, [REDUCE]: fade },
    animationDuration: "320ms",
    animationTimingFunction: motion["--out"],
  },
  sub: {
    fontSize: "13px",
    color: kit["--yes-ink"],
  },
  hidden: {
    visibility: "hidden",
  },
  mail: {
    display: "grid",
    gap: "10px",
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: 0,
    paddingInline: 0,
    listStyle: "none",
  },
  mailRow: {
    textWrap: "pretty",
    display: "grid",
    gridTemplateColumns: "28px minmax(0, 1fr)",
    gap: "10px",
    alignItems: "center",
    animationName: { default: fresh, [REDUCE]: fade },
    animationDuration: "260ms",
    animationTimingFunction: motion["--out"],
  },
  mailRowStill: {
    animationName: "none",
    animationDuration: "0s",
    animationTimingFunction: "ease",
  },
  avatar: {
    display: "grid",
    placeItems: "center",
    width: "28px",
    height: "28px",
    borderRadius: "9px",
    backgroundColor: palette["--panel-2"],
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    fontStyle: "normal",
    color: palette["--dim"],
  },
  mailText: {
    display: "grid",
    justifyItems: "start",
    gap: "2px",
    minWidth: 0,
    fontSize: "13px",
    lineHeight: 1.35,
  },
  mailLine: {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  mailFrom: {
    fontWeight: 600,
    color: palette["--text"],
  },
  mailSubject: {
    fontStyle: "normal",
    color: palette["--dim"],
  },
  bone: {
    borderRadius: "6px",
    backgroundColor: palette["--panel-2"],
    color: "transparent",
    animationName: pulse,
    animationDuration: "900ms",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
    animationDirection: "alternate",
  },
  said: {
    textWrap: "pretty",
    minHeight: "2.9em",
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: 1.45,
    fontFamily: fonts["--mono"],
    color: palette["--dim"],
  },
  body: {
    display: "grid",
    placeItems: "center",
    minHeight: "132px",
  },
  people: {
    display: "grid",
    gap: "10px",
    justifySelf: "stretch",
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: 0,
    paddingInline: 0,
    listStyle: "none",
    animationName: { default: fresh, [REDUCE]: fade },
    animationDuration: "260ms",
    animationTimingFunction: motion["--out"],
  },
  person: {
    textWrap: "pretty",
    display: "grid",
    gridTemplateColumns: "28px auto minmax(0, 1fr)",
    gap: "10px",
    alignItems: "center",
    fontSize: "14px",
  },
  personName: {
    fontWeight: 600,
    color: palette["--text"],
  },
  personRole: {
    justifySelf: "end",
    fontSize: "13px",
    color: palette["--mute"],
  },
  error: {
    display: "grid",
    gap: "6px",
    justifyItems: "center",
    maxWidth: "30ch",
    textAlign: "center",
    animationName: { default: fresh, [REDUCE]: fade },
    animationDuration: "260ms",
    animationTimingFunction: motion["--out"],
  },
  errorTitle: {
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: kit["--no-ink"],
  },
  errorText: {
    fontSize: "13px",
    lineHeight: 1.45,
    color: palette["--dim"],
  },
  errorButton: {
    marginTop: "4px",
  },
  errorCode: {
    fontSize: "11px",
    color: palette["--mute"],
  },
  empty: {
    textWrap: "pretty",
    fontSize: "14px",
    color: palette["--mute"],
  },
  toast: {
    textWrap: "pretty",
    position: "absolute",
    bottom: "12px",
    left: "50%",
    paddingBlock: "8px",
    paddingInline: "14px",
    borderRadius: "10px",
    backgroundColor: palette["--text"],
    boxShadow: `0 8px 20px ${palette["--lift"]}`,
    fontSize: "13px",
    fontWeight: 600,
    color: palette["--bg"],
    whiteSpace: "nowrap",
    translate: "-50% 0",
    opacity: 0,
    animationName: { default: toast, [REDUCE]: toastFade },
    animationDuration: "3s",
    animationTimingFunction: motion["--out"],
    animationFillMode: "forwards",
  },
  source: {
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: "12px",
    paddingInline: "14px",
    borderRadius: "10px",
    backgroundColor: palette["--panel"],
    boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
    fontWeight: 500,
    fontSize: "12px",
    lineHeight: 1.65,
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  comment: {
    color: palette["--mute"],
  },
  mark: {
    paddingBlock: 0,
    paddingInline: "3px",
    borderRadius: "4px",
    backgroundColor: "color-mix(in srgb, var(--c) 26%, transparent)",
    color: "inherit",
  },
  result: {
    placeItems: "center",
    minHeight: "96px",
  },
  profile: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    justifySelf: "start",
    animationName: { default: fresh, [REDUCE]: fade },
    animationDuration: "260ms",
    animationTimingFunction: motion["--out"],
  },
  profileAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "11px",
    backgroundColor: "var(--c)",
    color: "var(--on-c)",
  },
  profileName: {
    fontWeight: 700,
    fontSize: "16px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--text"],
  },
  city: {
    paddingBlock: "2px",
    paddingInline: "8px",
    borderRadius: "6px",
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: kit["--yes-ink"],
  },
  crash: {
    display: "grid",
    gap: "6px",
    justifySelf: "stretch",
    paddingBlock: "12px",
    paddingInline: "14px",
    borderRadius: "10px",
    backgroundColor: `color-mix(in srgb, ${kit["--no"]} 12%, transparent)`,
    boxShadow: `inset 3px 0 0 ${kit["--no"]}`,
    animationName: fade,
    animationDuration: "200ms",
    animationTimingFunction: "ease-out",
  },
  crashTitle: {
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: kit["--no-ink"],
  },
  crashCode: {
    fontSize: "12px",
    lineHeight: 1.5,
    color: kit["--no-ink"],
    overflowWrap: "anywhere",
  },
  balance: {
    display: "grid",
    gap: "2px",
    minHeight: "62px",
    alignContent: "center",
  },
  balanceLabel: {
    fontSize: "12px",
    color: palette["--dim"],
  },
  balanceValue: {
    fontWeight: 900,
    fontSize: "30px",
    lineHeight: 1.15,
    fontFamily: fonts["--display"],
    letterSpacing: "-0.03em",
    color: palette["--text"],
    fontVariantNumeric: "tabular-nums",
    animationName: { default: fresh, [REDUCE]: fade },
    animationDuration: "320ms",
    animationTimingFunction: motion["--out"],
  },
  balanceJump: {
    animationName: { default: `${fresh}, ${jump}`, [REDUCE]: `${fade}, ${jump}` },
    animationDuration: "320ms, 1400ms",
    animationTimingFunction: {
      default: `${motion["--out"]}, ease-out`,
      [REDUCE]: "ease-out, ease-out",
    },
  },
  balanceWait: {
    fontWeight: 600,
    fontSize: "15px",
    lineHeight: 1.5,
    fontFamily: fonts["--sans"],
    fontVariantNumeric: "normal",
    letterSpacing: 0,
    color: palette["--mute"],
    animationName: "none",
    animationDuration: "0s",
    animationTimingFunction: "ease",
  },
  hist: {
    display: "grid",
    gap: "8px",
    paddingTop: "10px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
  },
  histHead: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "22px",
    fontSize: "12px",
    color: palette["--dim"],
  },
  stamp: {
    paddingBlock: "2px",
    paddingInline: "7px",
    borderRadius: "6px",
    backgroundColor: "color-mix(in srgb, var(--c) 18%, transparent)",
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: "var(--c-ink)",
    whiteSpace: "nowrap",
  },
  histList: {
    display: "grid",
    gap: "6px",
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: 0,
    paddingInline: 0,
    listStyle: "none",
  },
  histRow: {
    textWrap: "pretty",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "13px",
    color: palette["--dim"],
    animationName: { default: null, [REDUCE]: fade },
  },
  histRowNew: {
    animationName: { default: fresh, [REDUCE]: fade },
    animationDuration: "320ms",
    animationTimingFunction: motion["--out"],
  },
  histAmount: {
    fontWeight: 600,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
  },
  time: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    minWidth: { default: "54px", [PHONE]: "46px" },
    fontWeight: 700,
    color: "var(--c-ink)",
  },
});

type Step = readonly [at: number, run: () => void];

function useScript() {
  const timers = useRef<number[]>([]);
  const stop = () => {
    for (const timer of timers.current) clearTimeout(timer);
    timers.current = [];
  };
  useEffect(() => stop, []);
  return (steps: readonly Step[]) => {
    stop();
    for (const [at, run] of steps) timers.current.push(window.setTimeout(run, at));
  };
}

function Spinner({ small = false, style }: { small?: boolean; style?: stylex.StyleXStyles }) {
  return (
    <span {...stylex.props(styles.spin, small && styles.spinSmall, style)} aria-hidden="true" />
  );
}

function Controls({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.ctl)}>{children}</div>;
}

const CTL_BUTTON = stylex.props(button.base, button.soft, button.sm, styles.ctlButton).className;

const money = (value: number) => `$${value.toLocaleString("en-US")}`;

type Bar = { label: string; from: number; to: number; kind: "code" | "render" | "req" | "defer" };
type Waterfall = { bars: Bar[]; paint: number };

const AXIS = 1000;
const SWEEP = 1600;

const LATE: Waterfall = {
  bars: [
    { label: "app.js", from: 0, to: 300, kind: "code" },
    { label: "<Orders>", from: 300, to: 330, kind: "render" },
    { label: "GET /orders", from: 330, to: 820, kind: "req" },
  ],
  paint: 840,
};

const EARLY: Waterfall = {
  bars: [
    { label: "app.js", from: 0, to: 300, kind: "code" },
    { label: "GET /orders", from: 0, to: 500, kind: "req" },
    { label: "<Orders>", from: 500, to: 520, kind: "render" },
    { label: "GET /reviews", from: 0, to: 880, kind: "defer" },
  ],
  paint: 520,
};

type Sweep = { state: "still" } | { state: "armed" } | { state: "run"; n: number };

function WaterfallView({ bars, paint }: Waterfall) {
  const ref = useRef<HTMLDivElement>(null);
  const [sweep, setSweep] = useState<Sweep>({ state: "still" });

  useLayoutEffect(() => {
    const chart = ref.current;
    if (!chart || reducedMotion()) return;
    setSweep({ state: "armed" });
    return onceOnScreen(chart, () => setSweep({ state: "run", n: 1 }));
  }, []);

  const pct = (ms: number) => `${(ms / AXIS) * 100}%`;
  const run = sweep.state === "run" ? sweep.n : 0;

  return (
    <div ref={ref} {...stylex.props(styles.view)}>
      <div {...stylex.props(styles.wf)} style={{ "--sweep": `${SWEEP}ms` }}>
        <ul {...stylex.props(styles.lanes)} aria-hidden="true">
          {bars.map((bar) => (
            <li key={bar.label} {...stylex.props(styles.label)}>
              {bar.label}
            </li>
          ))}
        </ul>
        <div key={run} {...stylex.props(styles.plot)}>
          <ul {...stylex.props(styles.lanes)}>
            {bars.map((bar) => (
              <li key={bar.label} {...stylex.props(styles.lane)}>
                <span
                  {...stylex.props(styles.bar, styles[bar.kind])}
                  style={{ left: pct(bar.from), width: pct(bar.to - bar.from) }}
                />
                <span {...stylex.props(arcade.srOnly)}>
                  {bar.label}: {bar.from} to {bar.to}ms
                  {bar.kind === "defer" ? ", deferred" : ""}
                </span>
              </li>
            ))}
          </ul>
          <span
            {...stylex.props(
              styles.paint,
              sweep.state === "armed" && styles.paintArmed,
              sweep.state === "run" && styles.paintRun,
            )}
            style={{ left: pct(paint), "--at": `${(paint / AXIS) * SWEEP}ms` }}
          >
            <b {...stylex.props(styles.paintTag, paint > AXIS * 0.6 && styles.paintTagEnd)}>
              <span {...stylex.props(styles.long)}>on screen </span>
              {paint}ms
            </b>
          </span>
          <span
            {...stylex.props(
              styles.cover,
              sweep.state !== "still" && styles.coverShown,
              sweep.state === "run" && styles.coverRun,
            )}
            aria-hidden="true"
          />
          <span {...stylex.props(styles.grid)} aria-hidden="true" />
        </div>
        <span {...stylex.props(styles.axis)} aria-hidden="true">
          {[0, 250, 500, 750, 1000].map((ms) => (
            <i key={ms} {...stylex.props(styles.tick)} style={{ left: pct(ms) }}>
              {ms}
            </i>
          ))}
        </span>
      </div>
      <Controls>
        <span {...stylex.props(styles.note)}>
          <i {...stylex.props(styles.key, styles.keyReq)} /> request{" "}
          <i {...stylex.props(styles.key, styles.keyCode)} /> code
          {bars.some((bar) => bar.kind === "defer") && (
            <>
              <i {...stylex.props(styles.key, styles.keyDefer)} /> deferred
            </>
          )}
        </span>
        <button
          type="button"
          className={CTL_BUTTON}
          onClick={() => setSweep({ state: "run", n: run + 1 })}
        >
          Replay
        </button>
      </Controls>
    </div>
  );
}

const REVENUE = [48210, 49875, 47930, 51402];

type Refetch = { at: number; fetching: boolean; fresh: boolean };

function RevenueCard({ swr }: { swr: boolean }) {
  const [card, setCard] = useState<Refetch>({ at: 0, fetching: false, fresh: false });
  const play = useScript();
  const value = REVENUE[card.at % REVENUE.length] ?? 0;
  const blank = card.fetching && !swr;

  function refetch() {
    setCard((now) => ({ ...now, fetching: true }));
    play([[900, () => setCard((now) => ({ at: now.at + 1, fetching: false, fresh: true }))]]);
  }

  return (
    <div {...stylex.props(styles.view)}>
      <div {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.head)}>
          <span>Revenue, this week</span>
          <span {...stylex.props(styles.status)} aria-live="polite">
            {swr && card.fetching ? (
              <>
                <Spinner small /> Updating
              </>
            ) : card.fresh ? (
              "Updated just now"
            ) : (
              "Updated 5 min ago"
            )}
          </span>
        </div>
        <div {...stylex.props(styles.figure)}>
          {blank ? (
            <Spinner style={styles.spinInFigure} />
          ) : (
            <b key={card.at} {...stylex.props(styles.amount, card.fresh && styles.amountFresh)}>
              {money(value)}
            </b>
          )}
          <span {...stylex.props(styles.sub, blank && styles.hidden)}>12% over last week</span>
        </div>
      </div>
      <Controls>
        <span {...stylex.props(styles.note)}>Refetch takes 900ms</span>
        <button type="button" className={CTL_BUTTON} disabled={card.fetching} onClick={refetch}>
          Refetch
        </button>
      </Controls>
    </div>
  );
}

const MAIL = [
  ["Rina", "Invoice #2041 is paid"],
  ["Deploy bot", "main is green again"],
  ["Sam", "Notes from Tuesday"],
  ["Ops", "Disk at 81% on db-2"],
  ["Maya", "Can we move standup?"],
] as const;

const SPIN_DELAY = 200;

type Inbox =
  | { phase: "rest"; top: number; said: string | null }
  | { phase: "wait"; top: number; skeleton: boolean; said: string | null };

function InboxView({ delay }: { delay: boolean }) {
  const [inbox, setInbox] = useState<Inbox>({ phase: "rest", top: 0, said: null });
  const play = useScript();
  const skeleton = inbox.phase === "wait" && inbox.skeleton;

  function load(ms: number) {
    const shownFor = delay ? Math.max(0, ms - SPIN_DELAY) : ms;
    const reply = ms < 1000 ? `${ms}ms` : `${ms / 1000}s`;
    const said =
      shownFor === 0
        ? `Reply in ${reply}. No skeleton.`
        : delay
          ? `Reply in ${reply}. Skeleton from 200ms, for ${shownFor}ms.`
          : `Reply in ${reply}. Skeleton flashed for ${shownFor}ms.`;
    setInbox((now) => ({ phase: "wait", top: now.top, skeleton: !delay, said: now.said }));
    play([
      ...(delay
        ? [
            [
              SPIN_DELAY,
              () => setInbox((now) => (now.phase === "wait" ? { ...now, skeleton: true } : now)),
            ] as const,
          ]
        : []),
      [ms, () => setInbox((now) => ({ phase: "rest", top: now.top + 1, said }))],
    ]);
  }

  const rows = [0, 1, 2].map((offset) => MAIL[(inbox.top + offset) % MAIL.length] ?? MAIL[0]);

  return (
    <div {...stylex.props(styles.view)}>
      <div {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.head)}>
          <span>Inbox</span>
          <span {...stylex.props(styles.status)}>{inbox.top + 3} unread</span>
        </div>
        <ul {...stylex.props(styles.mail)}>
          {rows.map(([from, subject], index) => (
            <li
              key={`${inbox.top}-${index}`}
              {...stylex.props(styles.mailRow, skeleton && styles.mailRowStill)}
            >
              <i aria-hidden="true" {...stylex.props(styles.avatar, skeleton && styles.bone)}>
                {from.charAt(0)}
              </i>
              <span {...stylex.props(styles.mailText)}>
                <b {...stylex.props(styles.mailLine, styles.mailFrom, skeleton && styles.bone)}>
                  {from}
                </b>
                <em {...stylex.props(styles.mailLine, styles.mailSubject, skeleton && styles.bone)}>
                  {subject}
                </em>
              </span>
            </li>
          ))}
        </ul>
        <p {...stylex.props(styles.said)} aria-live="polite">
          {inbox.said ?? "Pick how fast the server replies."}
        </p>
      </div>
      <Controls>
        <span {...stylex.props(styles.note)}>Server replies in</span>
        <span {...stylex.props(styles.pair)}>
          <button
            type="button"
            className={CTL_BUTTON}
            disabled={inbox.phase === "wait"}
            onClick={() => load(80)}
          >
            80ms
          </button>
          <button
            type="button"
            className={CTL_BUTTON}
            disabled={inbox.phase === "wait"}
            onClick={() => load(1200)}
          >
            1.2s
          </button>
        </span>
      </Controls>
    </div>
  );
}

const TEAM = [
  ["Ana", "Design"],
  ["Budi", "Engineering"],
  ["Citra", "Product"],
] as const;

type TeamLoad = "ok" | "loading" | "failed";

function TeamView({ inline }: { inline: boolean }) {
  const [team, setTeam] = useState<TeamLoad>("ok");
  const [toast, setToast] = useState(0);
  const play = useScript();

  function fail() {
    setTeam("loading");
    play([
      [
        500,
        () => {
          setTeam("failed");
          if (!inline) setToast((n) => n + 1);
        },
      ],
    ]);
  }

  function retry() {
    setTeam("loading");
    play([[600, () => setTeam("ok")]]);
  }

  return (
    <div {...stylex.props(styles.view)}>
      <div {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.head)}>
          <span>Team</span>
          <span {...stylex.props(styles.status)}>3 members</span>
        </div>
        <div {...stylex.props(styles.body)}>
          {team === "loading" ? (
            <Spinner />
          ) : team === "ok" ? (
            <ul {...stylex.props(styles.people)}>
              {TEAM.map(([name, role]) => (
                <li key={name} {...stylex.props(styles.person)}>
                  <i aria-hidden="true" {...stylex.props(styles.avatar)}>
                    {name.charAt(0)}
                  </i>
                  <b {...stylex.props(styles.personName)}>{name}</b>
                  <span {...stylex.props(styles.personRole)}>{role}</span>
                </li>
              ))}
            </ul>
          ) : inline ? (
            <div {...stylex.props(styles.error)} role="alert">
              <b {...stylex.props(styles.errorTitle)}>Couldn't load the team.</b>
              <span {...stylex.props(styles.errorText)}>
                The server didn't answer. Your other cards are fine.
              </span>
              <button
                type="button"
                {...stylex.props(button.base, button.go, button.sm, styles.errorButton)}
                onClick={retry}
              >
                Retry
              </button>
              <code {...stylex.props(styles.errorCode)}>logged · req 7f3a</code>
            </div>
          ) : (
            <p {...stylex.props(styles.empty)}>No members yet</p>
          )}
        </div>
        {toast > 0 && (
          <p key={toast} {...stylex.props(styles.toast)} role="status">
            Something went wrong
          </p>
        )}
      </div>
      <Controls>
        <span {...stylex.props(styles.note)}>The next request fails</span>
        <button type="button" className={CTL_BUTTON} disabled={team === "loading"} onClick={fail}>
          Fail a request
        </button>
      </Controls>
    </div>
  );
}

const RESPONSE = '{ "id": 1, "name": "Alice" }';

type Profile = { id: number; name: string; city: string };
type Outcome = { ok: true; user: Profile } | { ok: false; error: string };

const describe = (cause: unknown) =>
  cause instanceof Error ? `${cause.name}: ${cause.message}` : "Error: unknown";

function trustJson(body: string): Outcome {
  try {
    const user: Profile = JSON.parse(body);
    return { ok: true, user: { ...user, city: user.city.toUpperCase() } };
  } catch (cause) {
    return { ok: false, error: describe(cause) };
  }
}

type ProfileResponse = { id: number; name: string; city?: string };

const parseProfile = (response: ProfileResponse): Profile => ({
  ...response,
  city: response.city ?? "Unknown",
});

function parseJson(body: string): Outcome {
  const user = parseProfile(JSON.parse(body));
  return { ok: true, user: { ...user, city: user.city.toUpperCase() } };
}

function ParseView({ parse }: { parse: boolean }) {
  const [fetching, setFetching] = useState(false);
  const [runs, setRuns] = useState(0);
  const play = useScript();
  const outcome = parse ? parseJson(RESPONSE) : trustJson(RESPONSE);

  function fetchUser() {
    setFetching(true);
    play([
      [
        450,
        () => {
          setFetching(false);
          setRuns((n) => n + 1);
        },
      ],
    ]);
  }

  return (
    <div {...stylex.props(styles.view)}>
      <pre {...stylex.props(styles.source)}>
        <span {...stylex.props(styles.comment)}>{"// GET /users/1 → "}</span>
        {RESPONSE}
        {"\n"}
        {parse ? (
          <>
            {"const user = "}
            <mark {...stylex.props(styles.mark)}>User.parse</mark>
            {"(await res.json());\n"}
            <span {...stylex.props(styles.comment)}>{'// city: z.string().catch("Unknown")'}</span>
          </>
        ) : (
          <>
            {"const user = await res.json(); "}
            <span {...stylex.props(styles.comment)}>{"// any"}</span>
          </>
        )}
        {"\n"}
        {"render(user.city.toUpperCase());"}
      </pre>
      <div {...stylex.props(styles.card, styles.result)} aria-live="polite">
        {fetching ? (
          <Spinner />
        ) : outcome.ok ? (
          <div key={runs} {...stylex.props(styles.profile)}>
            <i aria-hidden="true" {...stylex.props(styles.avatar, styles.profileAvatar)}>
              {outcome.user.name.charAt(0)}
            </i>
            <b {...stylex.props(styles.profileName)}>{outcome.user.name}</b>
            <span {...stylex.props(styles.city)}>{outcome.user.city}</span>
          </div>
        ) : (
          <div key={runs} {...stylex.props(styles.crash)} role="alert">
            <b {...stylex.props(styles.crashTitle)}>Uncaught {outcome.error.split(":")[0]}</b>
            <code {...stylex.props(styles.crashCode)}>{outcome.error}</code>
          </div>
        )}
      </div>
      <Controls>
        <span {...stylex.props(styles.note)}>The API left out city</span>
        <button type="button" className={CTL_BUTTON} disabled={fetching} onClick={fetchUser}>
          Fetch /users/1
        </button>
      </Controls>
    </div>
  );
}

const SPENT = { label: "Laptop", amount: -1830 };
const HISTORY = [
  { label: "Salary", amount: 2400 },
  { label: "Groceries", amount: -62 },
  { label: "Coffee", amount: -4 },
];

type Signal = "offline" | "connecting" | "online";

function WalletView({ careful }: { careful: boolean }) {
  const [signal, setSignal] = useState<Signal>("offline");
  const play = useScript();
  const online = signal === "online";
  const rows = online ? [SPENT, ...HISTORY].slice(0, 3) : HISTORY;

  function connect() {
    setSignal("connecting");
    play([[700, () => setSignal("online")]]);
  }

  return (
    <div {...stylex.props(styles.view)}>
      <div {...stylex.props(styles.card)}>
        <div {...stylex.props(styles.head)}>
          <span>Wallet</span>
          <span
            {...stylex.props(
              styles.status,
              signal === "offline" && styles.offline,
              online && styles.online,
            )}
          >
            {signal === "connecting" ? (
              <>
                <Spinner small /> Connecting
              </>
            ) : online ? (
              "Online"
            ) : (
              "No signal, day 3"
            )}
          </span>
        </div>
        <div {...stylex.props(styles.balance)}>
          <span {...stylex.props(styles.balanceLabel)}>Balance</span>
          {online ? (
            <b key="live" {...stylex.props(styles.balanceValue, !careful && styles.balanceJump)}>
              {money(310)}
            </b>
          ) : careful ? (
            <b {...stylex.props(styles.balanceValue, styles.balanceWait)}>Needs a connection</b>
          ) : (
            <b {...stylex.props(styles.balanceValue)}>{money(2140)}</b>
          )}
        </div>
        <div {...stylex.props(styles.hist)}>
          <div {...stylex.props(styles.histHead)}>
            <span>Recent</span>
            {careful && (
              <span {...stylex.props(styles.stamp)}>
                {online ? "Updated just now" : "Updated 2 days ago"}
              </span>
            )}
          </div>
          <ul {...stylex.props(styles.histList)}>
            {rows.map((row) => (
              <li
                key={row.label}
                {...stylex.props(styles.histRow, online && row === SPENT && styles.histRowNew)}
              >
                <span>{row.label}</span>
                <b {...stylex.props(styles.histAmount)}>
                  {row.amount < 0 ? "−" : "+"}
                  {money(Math.abs(row.amount))}
                </b>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Controls>
        <span {...stylex.props(styles.note)}>Opened from cache</span>
        <button
          type="button"
          className={CTL_BUTTON}
          disabled={signal === "connecting"}
          onClick={online ? () => setSignal("offline") : connect}
        >
          {online ? "Reopen offline" : "Get signal"}
        </button>
      </Controls>
    </div>
  );
}

const LESSONS: Lesson[] = [
  {
    title: "Start fetching early",
    body: (
      <>
        Fetch in the route loader, not in a component. A fetch in <Code>useEffect</Code> waits until
        the page's code loads and renders. A loader starts it with the navigation, so it runs while
        the code loads. Await what the page needs and stream the rest.
      </>
    ),
    bad: {
      label: "In useEffect",
      costs: ["data at 840ms", "1 waterfall"],
      view: <WaterfallView {...LATE} />,
    },
    good: {
      label: "Fetch in the loader",
      costs: ["data at 520ms", "0 waterfalls"],
      view: <WaterfallView {...EARLY} />,
    },
  },
  {
    title: "Keep stale data on screen",
    body: (
      <>
        When you refetch data you already have, show a small spinner beside it and swap the new
        value in place. Press Refetch on both.
      </>
    ),
    bad: {
      label: "Blank",
      costs: ["blank 900ms"],
      view: <RevenueCard swr={false} />,
    },
    good: {
      label: "Keep it, then swap",
      costs: ["0ms blank", "1 quiet update"],
      view: <RevenueCard swr />,
    },
  },
  {
    title: "Wait before the skeleton",
    body: (
      <>
        Most replies are quick. Show loading UI only after 200ms, so a fast reply appears without a
        skeleton flash.
      </>
    ),
    bad: {
      label: "At once",
      costs: ["flashes 80ms"],
      view: <InboxView delay={false} />,
    },
    good: {
      label: "Wait 200ms",
      costs: ["0 flashes"],
      view: <InboxView delay />,
    },
  },
  {
    title: "Errors where the data was",
    body: (
      <>
        Show the error where the data would go, with a Retry button. A toast fades before anyone
        reads it and leaves an empty card. Log every failure so you hear about it before your users
        do.
      </>
    ),
    bad: {
      label: "A toast",
      costs: ["0 retries", "gone in 3s"],
      view: <TeamView inline={false} />,
    },
    good: {
      label: "Show it inline, with Retry",
      costs: ["1 tap to recover", "logged"],
      view: <TeamView inline />,
    },
  },
  {
    title: "Parse at the boundary",
    body: (
      <>
        API data is a guess until you check it. Parse it right after <Code>fetch()</Code> and give
        optional fields a fallback, so the rest of your code gets real types. If you skip it, a
        missing field crashes far from where it came in.
      </>
    ),
    extra: (
      <Tip>
        When a required field fails, show a plain message and log the details. Update the schema
        when the API changes. It documents the API too.
      </Tip>
    ),
    bad: {
      label: "Trust it",
      costs: ["1 crash", "blank card"],
      view: <ParseView parse={false} />,
    },
    good: {
      label: "Parse it",
      costs: ["0 crashes", "1 fallback"],
      view: <ParseView parse />,
    },
  },
  {
    title: "Persist what can't mislead",
    body: (
      <>
        A disk cache is already old when the app next opens. Persist history, settings and static
        content, and show when it was updated. Never persist balances, prices or stock counts. A
        stale number there leads to a wrong decision.
      </>
    ),
    extra: (
      <LessonText style={styles.stores}>
        <Code style={styles.store}>localStorage · ~5MB, sync</Code>
        <Code style={styles.store}>IndexedDB · large, async</Code>
        <Code style={styles.store}>PGlite · SQL + sync</Code>
      </LessonText>
    ),
    bad: {
      label: "Persist all",
      costs: ["$1,830 off", "no date"],
      view: <WalletView careful={false} />,
    },
    good: {
      label: "Persist history only",
      costs: ["balance always live", "history dated"],
      view: <WalletView careful />,
    },
  },
];

const TLDR = [
  ["SEO or first paint matters", "Render it on the server. Behind a login, an SPA is fine"],
  ["Data a route needs", "Start it in the loader, batch it, stream the rest"],
  ["Refetching data you have", "Keep it on screen with a small spinner"],
  ["A reply that may be quick", "Show loading UI only after 200ms"],
  ["A request that fails", "Show the error in place, with Retry. Log it"],
  ["Updates within a second", "Use a WebSocket. At 30s or slower, poll"],
  ["Anything from an API", "Parse it where it arrives"],
] as const;

const at = (ms: string, text: string) => (
  <>
    <time {...stylex.props(styles.time)}>{ms}</time>
    {text}
  </>
);

const LEVELS: Level[] = [
  {
    name: "A quick reply",
    prompt: (
      <>
        Most replies to this list land in 80ms. A few take 2s. Place the{" "}
        <Code>&lt;Spinner /&gt;</Code>.
      </>
    ),
    piece: "<Spinner />",
    answer: "delay",
    rows: [
      { depth: 0, text: at("0ms", "You press Refresh") },
      {
        depth: 1,
        slot: {
          id: "now",
          label: "show it at once",
          note: "Most replies land at 80ms, so the spinner flashes on almost every click.",
          cost: ["flashes 80ms", "most clicks"],
        },
      },
      { depth: 0, text: at("80ms", "Most replies land") },
      {
        depth: 1,
        slot: {
          id: "delay",
          label: "show it at 200ms, if still waiting",
          note: "Wait 200ms. Quick replies never show it. Slow ones get it when the wait is real.",
          cost: ["0 flashes"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "late",
          label: "show it at 1s, if still waiting",
          note: "A slow reply sits for a full second with no sign the click worked.",
          cost: ["1s of nothing"],
        },
      },
      { depth: 0, text: at("2000ms", "A slow reply lands") },
    ],
  },
  {
    name: "Back to the tab",
    prompt: (
      <>
        You return to a tab of prices loaded 5 minutes ago. They refetch on focus. Place the cached
        prices.
      </>
    ),
    piece: "cached prices",
    answer: "stay",
    rows: [
      { depth: 0, text: at("0ms", "The tab gets focus, refetch starts") },
      {
        depth: 1,
        slot: {
          id: "blank",
          label: "make way for a full spinner",
          note: "Prices you could have read vanish for 600ms, then come back a little different.",
          cost: ["blank 600ms"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "stay",
          label: "stay, with a small spinner beside them",
          note: "Keep them readable. Fresh numbers swap in place when they land.",
          cost: ["0ms blank", "1 quiet update"],
        },
      },
      { depth: 0, text: at("600ms", "Fresh prices arrive") },
      {
        depth: 1,
        slot: {
          id: "keep",
          label: "stay until the next page load",
          note: "The fresh prices arrive and nobody sees them. The cache never revalidates.",
          cost: ["stale until reload"],
        },
      },
    ],
  },
  {
    name: "Twenty orders",
    prompt: (
      <>
        The orders page lists 20 orders, one <Code>&lt;OrderRow&gt;</Code> each. Place the fetch.
      </>
    ),
    piece: "fetch(orders)",
    answer: "loader",
    rows: [
      { depth: 0, text: at("0ms", "You click Orders") },
      {
        depth: 1,
        slot: {
          id: "loader",
          label: "in the route loader",
          note: "Start it with the navigation, while the page's code loads. One request covers the list.",
          cost: ["data at 500ms", "1 request"],
        },
      },
      { depth: 0, text: at("300ms", "Code loaded, <Orders> renders") },
      {
        depth: 1,
        slot: {
          id: "effect",
          label: "in useEffect in <Orders>",
          note: "It waits for the code and the first render, so the data shows 300ms later than it could.",
          cost: ["+300ms", "1 waterfall"],
        },
      },
      { depth: 0, text: at("320ms", "Each <OrderRow> renders") },
      {
        depth: 1,
        slot: {
          id: "rows",
          label: "in useEffect in each <OrderRow>",
          note: "Twenty requests where one would do, each after its row renders.",
          cost: ["20 requests", "+320ms"],
        },
      },
    ],
  },
  {
    name: "One card fails",
    prompt: (
      <>
        A dashboard loads five cards. <Code>GET /revenue</Code> fails with a 500. Place what the
        user sees.
      </>
    ),
    piece: "error + Retry",
    answer: "inline",
    rows: [
      { depth: 0, text: at("0ms", "The dashboard opens") },
      { depth: 0, text: at("400ms", "Four cards load") },
      { depth: 0, text: at("420ms", "GET /revenue → 500") },
      {
        depth: 1,
        slot: {
          id: "page",
          label: "an error page instead of the dashboard",
          note: "One bad card throws away four good ones, and nothing retries in place.",
          cost: ["4 cards lost"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "inline",
          label: "inside the revenue card",
          note: "Put it where the chart would be. The other four stay, and one tap retries. Log it too.",
          cost: ["1 tap to recover", "4 cards kept"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "toast",
          label: "a toast: Something went wrong",
          note: "It fades in 3s, doesn't say which card, and the revenue card stays empty.",
          cost: ["gone in 3s", "0 retries"],
        },
      },
    ],
  },
  {
    name: "Offline on day 3",
    prompt: (
      <>
        A banking app persists its cache. On day 3 you open it with no signal. Place what it may
        show from the cache.
      </>
    ),
    piece: "from cache",
    answer: "history",
    rows: [
      { depth: 0, text: at("Day 1", "The app loads and saves its cache") },
      { depth: 0, text: at("Day 2", "You spend $1,830 on a laptop") },
      { depth: 0, text: at("Day 3", "You open the app, no signal") },
      {
        depth: 1,
        slot: {
          id: "balance",
          label: "Balance: $2,140",
          note: "It's $310 now. You'd plan with $1,830 you no longer have.",
          cost: ["$1,830 off"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "history",
          label: "Last week's payments, updated 2 days ago",
          note: "Persist it with the date. Past payments don't change.",
          cost: ["safe to persist", "dated"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "rate",
          label: "1 USD = 16,240 IDR",
          note: "Rates move by the minute. A two-day-old rate prices every transfer wrong.",
          cost: ["2 days stale"],
        },
      },
    ],
  },
];

export function DataLoading() {
  return (
    <RuleLanding
      lead={
        <>
          Start requests in the loader and keep stale data on screen. Show a skeleton only after
          200ms.
        </>
      }
      learn={{
        title: "Fast first paint, smooth updates",
        intro: <>Design the wait, because people judge loading by what they see while it lasts.</>,
      }}
      lessons={LESSONS}
      tldr={TLDR}
      quiz={{
        intro: <>Place each piece. A wrong spot shows what it costs.</>,
        levels: LEVELS,
        board: "timeline",
      }}
      take="load data the same way"
    />
  );
}
