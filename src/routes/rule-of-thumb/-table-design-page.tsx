import {
  ArrowClockwiseIcon,
  CaretLeftIcon,
  CaretRightIcon,
  MagnifyingGlassIcon,
  PauseIcon,
  PencilSimpleIcon,
  PlayIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { reducedMotion } from "../../hooks/use-media-query";
import { cursors, fonts, motion, palette } from "../../theme.stylex";
import { Code, type Lesson, RuleLanding } from "./-components/rule-landing";
import { row, tipped } from "./-table-design.stylex";
import { kit } from "./-components/rule-landing.stylex";
import { arcade } from "../../components/arcade";

const PHONE = "@media (max-width: 640px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const TOUCH = "@media (pointer: coarse)";

const flash = stylex.keyframes({
  to: { opacity: 0 },
});
const beat = stylex.keyframes({
  "50%": { opacity: 0.35 },
});
const turn = stylex.keyframes({
  to: { transform: "rotate(1turn)" },
});
const pulse = stylex.keyframes({
  to: { opacity: 0.45 },
});

const styles = stylex.create({
  costs: {
    alignSelf: "end",
  },
  card: {
    display: "grid",
    alignSelf: "start",
    alignContent: "start",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}, 0 3px 0 ${palette["--drop-ink"]}`,
    overflow: "hidden",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
    fontSize: "14px",
    lineHeight: "20px",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
  },
  th: {
    height: "36px",
    paddingBlock: 0,
    paddingInline: { default: "14px", [PHONE]: "10px" },
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
    backgroundColor: `color-mix(in srgb, ${palette["--panel-2"]} 55%, transparent)`,
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "16px",
    fontFamily: fonts["--sans"],
    color: palette["--mute"],
    textAlign: "left",
  },
  td: {
    position: "relative",
    isolation: "isolate",
    height: "40px",
    paddingBlock: 0,
    paddingInline: { default: "14px", [PHONE]: "10px" },
    borderTopWidth: { default: "1px", [stylex.when.ancestor(":first-child", row)]: 0 },
    borderTopStyle: { default: "solid", [stylex.when.ancestor(":first-child", row)]: "none" },
    borderTopColor: {
      default: `color-mix(in srgb, ${palette["--hair"]} 70%, transparent)`,
      [stylex.when.ancestor(":first-child", row)]: "currentcolor",
    },
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    backgroundColor: {
      default: null,
      [stylex.when.ancestor(":hover", row)]: {
        default: null,
        [HOVER]: `color-mix(in srgb, ${palette["--text"]} 3%, transparent)`,
      },
    },
    transition: `background-color ${kit["--t-fb"]} ease`,
  },
  still: {
    backgroundColor: {
      default: null,
      [stylex.when.ancestor(":hover", row)]: { default: null, [HOVER]: "transparent" },
    },
  },
  editing: {
    backgroundColor: {
      default: "color-mix(in srgb, var(--c) 10%, transparent)",
      [stylex.when.ancestor(":hover", row)]: {
        default: null,
        [HOVER]: `color-mix(in srgb, ${palette["--text"]} 3%, transparent)`,
      },
    },
  },
  num: {
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  ragged: {
    fontVariantNumeric: "proportional-nums",
  },
  dim: {
    color: palette["--dim"],
  },
  overflowing: {
    overflow: "visible",
  },
  colRole: {
    width: { default: "84px", [PHONE]: "70px" },
  },
  colActs: {
    width: "76px",
  },
  colMoney: {
    width: "52%",
  },
  flash: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: -1,
    backgroundColor: "color-mix(in srgb, var(--c) 22%, transparent)",
    pointerEvents: "none",
    animationName: flash,
    animationDuration: "1100ms",
    animationTimingFunction: motion["--out"],
    animationFillMode: "both",
  },
  reels: {
    display: "inline-flex",
    verticalAlign: "top",
  },
  reel: {
    display: "inline-block",
    height: "20px",
    overflow: "hidden",
  },
  strip: {
    display: "grid",
    transform: "translateY(calc(var(--n) * -20px))",
    transition: { default: `transform 320ms ${motion["--out"]}`, [REDUCE]: "none" },
  },
  digit: {
    height: "20px",
  },
  ring: {
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "2px" },
  },
  live: {
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
    minHeight: "34px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "9px",
    backgroundColor: {
      default: palette["--soft-key"],
      ":hover": { default: null, [HOVER]: palette["--soft-key-hover"] },
      ":active": palette["--soft-key-hover"],
    },
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--text"],
    cursor: cursors["--cursor-point"],
    transition: `background-color ${kit["--t-fb"]} ease`,
  },
  liveIcon: {
    width: "13px",
    height: "13px",
    color: palette["--dim"],
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: palette["--mute"],
  },
  dotOn: {
    backgroundColor: "var(--c)",
    animationName: { default: beat, [REDUCE]: "none" },
    animationDuration: { default: "1600ms", [REDUCE]: "0s" },
    animationTimingFunction: { default: "ease-in-out", [REDUCE]: "ease" },
    animationIterationCount: { default: "infinite", [REDUCE]: 1 },
  },
  seg: {
    display: { default: "inline-flex", [PHONE]: "grid" },
    flexWrap: "wrap",
    gridTemplateColumns: { default: null, [PHONE]: "repeat(3, minmax(0, 1fr))" },
    gap: "4px",
    paddingBlock: "4px",
    paddingInline: "4px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
  },
  segButton: {
    minHeight: "34px",
    paddingBlock: 0,
    paddingInline: { default: "12px", [PHONE]: "6px" },
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "9px",
    backgroundColor: "transparent",
    backgroundPosition: "0px 0px",
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: {
      default: palette["--dim"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
      ":active": palette["--text"],
    },
    whiteSpace: "nowrap",
    cursor: cursors["--cursor-point"],
    transition: `background-color ${kit["--t-fb"]} ease, color ${kit["--t-fb"]} ease, box-shadow ${kit["--t-fb"]} ease`,
  },
  segOn: {
    backgroundColor: "var(--c)",
    backgroundPosition: "initial",
    boxShadow: "0 3px 0 var(--key-c)",
    color: "var(--on-c)",
  },
  bar: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    paddingBlock: "10px",
    paddingInline: "10px",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: palette["--hair"],
  },
  search: {
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    gap: "8px",
    alignItems: "center",
    minWidth: 0,
    height: "34px",
    paddingBlock: 0,
    paddingInline: "10px",
    borderRadius: "8px",
    boxShadow: {
      default: `inset 0 0 0 1px ${palette["--hair"]}`,
      ":focus-within": "inset 0 0 0 2px var(--c)",
    },
    color: palette["--mute"],
    transition: `box-shadow ${kit["--t-fb"]} ease`,
  },
  searchIcon: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "14px",
    height: "14px",
  },
  searchInput: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: 0,
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    outlineWidth: 0,
    outlineStyle: "none",
    outlineColor: "currentcolor",
    backgroundColor: "transparent",
    backgroundPosition: "0px 0px",
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    fontSize: { default: "14px", [TOUCH]: "16px" },
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
    "::placeholder": {
      color: palette["--mute"],
    },
  },
  blank: {
    height: "56px",
    color: palette["--mute"],
    textAlign: "center",
    whiteSpace: "normal",
  },
  said: {
    display: "grid",
    gap: "4px",
    placeContent: "center",
    justifyItems: "center",
    minHeight: "calc(40px * 4)",
    paddingBlock: "8px",
    paddingInline: 0,
  },
  saidTitle: {
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: "20px",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
  },
  saidError: {
    color: kit["--no-ink"],
  },
  saidHint: {
    fontSize: "13px",
    lineHeight: "18px",
    color: palette["--dim"],
  },
  saidButton: {
    marginTop: "10px",
  },
  spin: {
    display: "inline-block",
    width: "18px",
    height: "18px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderTopColor: palette["--dim"],
    borderRadius: "50%",
    verticalAlign: "middle",
    animationName: { default: turn, [REDUCE]: "none" },
    animationDuration: { default: "800ms", [REDUCE]: "0s" },
    animationTimingFunction: { default: "linear", [REDUCE]: "ease" },
    animationIterationCount: { default: "infinite", [REDUCE]: 1 },
  },
  bone: {
    display: "block",
    width: "var(--w)",
    maxWidth: "100%",
    height: "10px",
    borderRadius: "5px",
    backgroundColor: palette["--panel-2"],
    animationName: { default: pulse, [REDUCE]: "none" },
    animationDuration: { default: "1200ms", [REDUCE]: "0s" },
    animationTimingFunction: { default: "ease-in-out", [REDUCE]: "ease" },
    animationIterationCount: { default: "infinite", [REDUCE]: 1 },
    animationDirection: { default: "alternate", [REDUCE]: "normal" },
  },
  btn: {
    display: "inline-flex",
    gap: "6px",
    alignItems: "center",
    height: "32px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "8px",
    backgroundColor: {
      default: palette["--soft-key"],
      ":hover": { default: null, [HOVER]: palette["--soft-key-hover"] },
    },
    boxShadow: {
      default: `0 3px 0 ${palette["--soft-key-drop"]}`,
      ":active": `0 1px 0 ${palette["--soft-key-drop"]}`,
    },
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--text"],
    cursor: cursors["--cursor-point"],
    transform: { default: null, ":active": "translateY(2px)" },
    transition: `transform 150ms ${motion["--out"]}, box-shadow 150ms ease, background-color ${kit["--t-fb"]} ease`,
  },
  go: {
    backgroundColor: "var(--c)",
    boxShadow: { default: "0 3px 0 var(--key-c)", ":active": "0 1px 0 var(--key-c)" },
    color: "var(--on-c)",
    filter: { default: null, ":hover": { default: null, [HOVER]: "brightness(1.06)" } },
  },
  btnIcon: {
    width: "14px",
    height: "14px",
  },
  icons: {
    display: "inline-flex",
    gap: "2px",
    verticalAlign: "middle",
  },
  tipped: {
    position: "relative",
    display: "inline-flex",
  },
  icon: {
    display: "grid",
    placeItems: "center",
    width: "30px",
    height: "30px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "8px",
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [HOVER]: "color-mix(in srgb, var(--c) 16%, transparent)" },
      ":active": "color-mix(in srgb, var(--c) 16%, transparent)",
    },
    backgroundPosition: {
      default: "0px 0px",
      ":hover": { default: null, [HOVER]: "initial" },
      ":active": "initial",
    },
    color: {
      default: palette["--dim"],
      ":hover": { default: null, [HOVER]: "var(--c-ink)" },
      ":active": "var(--c-ink)",
    },
    opacity: { default: null, ":disabled": 0.4 },
    cursor: { default: cursors["--cursor-point"], ":disabled": cursors["--cursor-forbid"] },
    transition: `background-color ${kit["--t-fb"]} ease, color ${kit["--t-fb"]} ease`,
  },
  iconPressed: {
    backgroundColor: "color-mix(in srgb, var(--c) 16%, transparent)",
    backgroundPosition: "initial",
    color: "var(--c-ink)",
  },
  iconDanger: {
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [HOVER]: `color-mix(in srgb, ${kit["--no"]} 14%, transparent)` },
      ":active": `color-mix(in srgb, ${kit["--no"]} 14%, transparent)`,
    },
    color: {
      default: palette["--dim"],
      ":hover": { default: null, [HOVER]: kit["--no-ink"] },
      ":active": kit["--no-ink"],
    },
  },
  iconGlyph: {
    width: "16px",
    height: "16px",
  },
  tip: {
    position: "absolute",
    top: "50%",
    right: "calc(100% + 6px)",
    zIndex: 2,
    paddingBlock: "3px",
    paddingInline: "8px",
    borderRadius: "6px",
    backgroundColor: palette["--text"],
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "16px",
    fontFamily: fonts["--sans"],
    fontVariantNumeric: "normal",
    color: palette["--bg"],
    whiteSpace: "nowrap",
    opacity: { default: 0, [stylex.when.ancestor(":is(:hover, :has(:focus-visible))", tipped)]: 1 },
    translate: {
      default: "4px -50%",
      [stylex.when.ancestor(":is(:hover, :has(:focus-visible))", tipped)]: "0 -50%",
      [REDUCE]: "0 -50%",
    },
    pointerEvents: "none",
    transition: `opacity 120ms ease, translate 160ms ${motion["--out"]}`,
  },
  inline: {
    display: "inline-flex",
    gap: "2px",
    marginLeft: "6px",
    verticalAlign: "middle",
    opacity: { default: 0, [stylex.when.ancestor(":is(:hover, :focus-within)", row)]: 1 },
    transition: "opacity 120ms ease",
  },
  inlineButton: {
    paddingBlock: "2px",
    paddingInline: "6px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "6px",
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [HOVER]: palette["--panel-2"] },
      ":active": palette["--panel-2"],
    },
    backgroundPosition: {
      default: "0px 0px",
      ":hover": { default: null, [HOVER]: "initial" },
      ":active": "initial",
    },
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "18px",
    fontFamily: fonts["--sans"],
    color: "var(--c-ink)",
    cursor: cursors["--cursor-point"],
  },
  inlineDelete: {
    color: kit["--no-ink"],
  },
  foot: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "40px",
    paddingTop: 0,
    paddingRight: "8px",
    paddingBottom: 0,
    paddingLeft: "14px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--mute"],
  },
  link: {
    paddingBlock: "4px",
    paddingInline: "8px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "6px",
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [HOVER]: palette["--panel-2"] },
      ":active": palette["--panel-2"],
    },
    backgroundPosition: {
      default: "0px 0px",
      ":hover": { default: null, [HOVER]: "initial" },
      ":active": "initial",
    },
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: "var(--c-ink)",
    cursor: cursors["--cursor-point"],
  },
  pager: {
    display: "flex",
    gap: "8px",
    justifyContent: "space-between",
    alignItems: "center",
    height: "48px",
    paddingTop: 0,
    paddingRight: "8px",
    paddingBottom: 0,
    paddingLeft: "14px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--mute"],
    whiteSpace: "nowrap",
  },
  pages: {
    display: "flex",
    gap: "2px",
  },
  page: {
    display: "grid",
    placeItems: "center",
    minWidth: "30px",
    height: "30px",
    paddingBlock: 0,
    paddingInline: "6px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "8px",
    backgroundColor: {
      default: "transparent",
      ":hover:enabled": { default: null, [HOVER]: palette["--panel-2"] },
      ":active:enabled": palette["--panel-2"],
    },
    backgroundPosition: {
      default: "0px 0px",
      ":hover:enabled": { default: null, [HOVER]: "initial" },
      ":active:enabled": "initial",
    },
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    fontVariantNumeric: "tabular-nums",
    color: {
      default: palette["--dim"],
      ":hover:enabled": { default: null, [HOVER]: palette["--text"] },
      ":active:enabled": palette["--text"],
    },
    opacity: { default: null, ":disabled": 0.35 },
    cursor: { default: cursors["--cursor-point"], ":disabled": cursors["--cursor-forbid"] },
    transition: `background-color ${kit["--t-fb"]} ease, color ${kit["--t-fb"]} ease`,
  },
  pageOn: {
    backgroundColor: {
      default: "var(--c)",
      ":hover:enabled": { default: null, [HOVER]: palette["--panel-2"] },
      ":active:enabled": palette["--panel-2"],
    },
    backgroundPosition: "initial",
    color: {
      default: "var(--on-c)",
      ":hover:enabled": { default: null, [HOVER]: palette["--text"] },
      ":active:enabled": palette["--text"],
    },
  },
  pageIcon: {
    width: "12px",
    height: "12px",
  },
  address: {
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    alignItems: "center",
    minWidth: 0,
    height: "30px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderRadius: "15px",
    backgroundColor: palette["--panel-2"],
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  host: {
    color: palette["--mute"],
  },
  query: {
    fontWeight: 600,
    color: "var(--c-ink)",
  },
  body: {
    transition: "opacity 120ms ease",
  },
  reloading: {
    opacity: 0.3,
  },
  note: {
    textWrap: "pretty",
    paddingTop: "10px",
    paddingRight: "14px",
    paddingBottom: "12px",
    paddingLeft: "14px",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: palette["--hair"],
    fontSize: "12px",
    lineHeight: "18px",
    fontFamily: fonts["--sans"],
    color: palette["--mute"],
  },
});

type Store<T> = {
  get: () => T;
  update: (next: (now: T) => T) => void;
  subscribe: (listener: () => void) => () => void;
};

function store<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    update(next) {
      value = next(value);
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

const useStore = <T,>(source: Store<T>) =>
  useSyncExternalStore(source.subscribe, source.get, source.get);

type Demos = { ticker: Store<Ticker>; roster: Store<Roster>; filter: Store<Filter> };

const DemosContext = createContext<Demos | null>(null);

function useDemos() {
  const demos = useContext(DemosContext);
  if (!demos) throw new Error("Table demos render inside <TableDesign>.");
  return demos;
}

type Person = { name: string; role: "Admin" | "Editor" | "Viewer" };

function Th({ children, style }: { children: ReactNode; style?: stylex.StyleXStyles }) {
  return (
    <th scope="col" {...stylex.props(styles.th, style)}>
      {children}
    </th>
  );
}

type Ticker = { values: number[]; step: number; hot: number | null };

const ACCOUNTS = ["Acme", "Globex", "Initech", "Umbrella", "Hooli"];
const MRR = [12500, 8750.5, 340, 95200, 1111.11];
const TICKS: readonly (readonly [row: number, value: number])[] = [
  [1, 8811.25],
  [3, 95320],
  [0, 12480.5],
  [1, 8790],
  [4, 1204.75],
  [2, 362.4],
  [0, 12500],
  [3, 95200],
  [1, 8750.5],
  [4, 1111.11],
  [2, 340],
];
const TICK_MS = 1600;

const money = (value: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const tick = (now: Ticker): Ticker => {
  const [row, value] = TICKS[now.step % TICKS.length] ?? [0, 0];
  return {
    values: now.values.map((old, at) => (at === row ? value : old)),
    step: now.step + 1,
    hot: row,
  };
};

function Reels({ text }: { text: string }) {
  const chars = [...text];
  return (
    <span {...stylex.props(styles.reels)} aria-hidden="true">
      {chars.map((char, at) => {
        const key = chars.length - at;
        if (!/\d/.test(char)) return <span key={key}>{char}</span>;
        return (
          <span key={key} {...stylex.props(styles.reel)}>
            <span {...stylex.props(styles.strip)} style={{ "--n": Number(char) }}>
              {DIGITS.map((digit) => (
                <span key={digit} {...stylex.props(styles.digit)}>
                  {digit}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function NumbersDemo({ careful }: { careful: boolean }) {
  const { ticker } = useDemos();
  const { values, step, hot } = useStore(ticker);
  return (
    <div {...stylex.props(styles.card)}>
      <table {...stylex.props(styles.table)}>
        <caption {...stylex.props(arcade.srOnly)}>Monthly revenue by account</caption>
        <colgroup>
          <col />
          <col {...stylex.props(styles.colMoney)} />
        </colgroup>
        <thead>
          <tr>
            <Th>Account</Th>
            <Th style={careful && styles.num}>MRR ($)</Th>
          </tr>
        </thead>
        <tbody {...stylex.props(styles.body)}>
          {ACCOUNTS.map((account, at) => {
            const value = values[at] ?? 0;
            return (
              <tr key={account} {...stylex.props(row)}>
                <td {...stylex.props(styles.td)}>{account}</td>
                <td {...stylex.props(styles.td, careful ? styles.num : styles.ragged)}>
                  {hot === at && (
                    <i key={step} {...stylex.props(styles.flash)} aria-hidden="true" />
                  )}
                  {careful ? (
                    <>
                      <span {...stylex.props(arcade.srOnly)}>{money(value)}</span>
                      <Reels text={money(value)} />
                    </>
                  ) : (
                    String(value)
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function LiveSwitch() {
  const { ticker } = useDemos();
  const ref = useRef<HTMLButtonElement>(null);
  const [playing, setPlaying] = useState(true);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    if (reducedMotion()) setPlaying(false);
    const lesson = ref.current?.closest(".lesson");
    if (!lesson) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSeen(entry?.isIntersecting ?? false),
      {
        threshold: 0.4,
      },
    );
    observer.observe(lesson);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !seen) return;
    const id = setInterval(() => ticker.update(tick), TICK_MS);
    return () => clearInterval(id);
  }, [playing, seen, ticker]);

  return (
    <button
      ref={ref}
      type="button"
      {...stylex.props(styles.live, styles.ring)}
      aria-pressed={!playing}
      onClick={() => setPlaying((value) => !value)}
    >
      <span {...stylex.props(styles.dot, playing && styles.dotOn)} aria-hidden="true" />
      {playing ? "Live" : "Paused"}
      {playing ? (
        <PauseIcon weight="bold" aria-hidden="true" {...stylex.props(styles.liveIcon)} />
      ) : (
        <PlayIcon weight="bold" aria-hidden="true" {...stylex.props(styles.liveIcon)} />
      )}
      <span {...stylex.props(arcade.srOnly)}>{playing ? ", pause updates" : ", play updates"}</span>
    </button>
  );
}

type Roster = {
  phase: "loading" | "error" | "ready";
  settles: boolean;
  users: readonly Person[];
  query: string;
};
type RosterView = "loading" | "empty" | "error" | "none" | "data";

const TEAM: readonly Person[] = [
  { name: "Alice Johnson", role: "Admin" },
  { name: "Bob Smith", role: "Editor" },
  { name: "Carol Williams", role: "Viewer" },
  { name: "David Brown", role: "Editor" },
];
const READY: Roster = { phase: "ready", settles: false, users: TEAM, query: "" };
const PRESETS: Record<RosterView, Roster> = {
  loading: { ...READY, phase: "loading" },
  empty: { ...READY, users: [] },
  error: { ...READY, phase: "error" },
  none: { ...READY, query: "zed" },
  data: READY,
};
const VIEW_NAMES: readonly (readonly [RosterView, string])[] = [
  ["loading", "Loading"],
  ["empty", "Empty"],
  ["error", "Error"],
  ["none", "No results"],
  ["data", "Data"],
];

const matches = (roster: Roster) =>
  roster.users.filter((user) =>
    user.name.toLowerCase().includes(roster.query.trim().toLowerCase()),
  );

function viewOf(roster: Roster): RosterView {
  if (roster.phase !== "ready") return roster.phase;
  if (roster.users.length === 0) return "empty";
  return matches(roster).length === 0 ? "none" : "data";
}

function StateSwitch() {
  const { roster } = useDemos();
  const now = useStore(roster);
  const view = viewOf(now);

  useEffect(() => {
    if (now.phase !== "loading" || !now.settles) return;
    const id = setTimeout(() => roster.update(() => READY), 1100);
    return () => clearTimeout(id);
  }, [now, roster]);

  return (
    <Segments
      label="Table state"
      options={VIEW_NAMES}
      value={view}
      onPick={(next) => roster.update(() => PRESETS[next])}
    />
  );
}

function Segments<T extends string>({
  label,
  options,
  value,
  onPick,
}: {
  label: string;
  options: readonly (readonly [T, string])[];
  value: T;
  onPick: (next: T) => void;
}) {
  return (
    <div {...stylex.props(styles.seg)} role="group" aria-label={label} data-hint>
      {options.map(([key, name]) => (
        <button
          key={key}
          type="button"
          aria-pressed={value === key}
          {...stylex.props(styles.segButton, value === key && styles.segOn, styles.ring)}
          onClick={() => onPick(key)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <label {...stylex.props(styles.search)}>
      <MagnifyingGlassIcon weight="bold" aria-hidden="true" {...stylex.props(styles.searchIcon)} />
      <input
        type="search"
        enterKeyHint="search"
        autoCapitalize="none"
        autoCorrect="off"
        {...stylex.props(styles.searchInput)}
        value={value}
        placeholder="Search users"
        aria-label="Search users"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function StatesDemo({ careful }: { careful: boolean }) {
  const { roster } = useDemos();
  const now = useStore(roster);
  const view = viewOf(now);
  const set = (next: Partial<Roster>) => roster.update((old) => ({ ...old, ...next }));

  let body: ReactNode;
  if (view === "data") {
    body = matches(now).map((user) => (
      <tr key={user.name} {...stylex.props(row)}>
        <td {...stylex.props(styles.td)}>{user.name}</td>
        <td {...stylex.props(styles.td, styles.dim)}>{user.role}</td>
      </tr>
    ));
  } else if (!careful) {
    body = (
      <tr {...stylex.props(row)}>
        <td colSpan={2} {...stylex.props(styles.td, styles.blank, styles.still)}>
          {view === "loading" ? (
            <span {...stylex.props(styles.spin)} role="img" aria-label="Loading" />
          ) : (
            "No data"
          )}
        </td>
      </tr>
    );
  } else if (view === "loading") {
    body = TEAM.map((user) => (
      <tr key={user.name} {...stylex.props(row)} aria-hidden="true">
        <td {...stylex.props(styles.td, styles.still)}>
          <span {...stylex.props(styles.bone)} style={{ "--w": `${user.name.length * 6}px` }} />
        </td>
        <td {...stylex.props(styles.td, styles.still)}>
          <span {...stylex.props(styles.bone)} style={{ "--w": "44px" }} />
        </td>
      </tr>
    ));
  } else {
    const say = {
      empty: {
        title: "No users yet",
        hint: "Add your first teammate.",
        act: "Add user",
        run: () => set({ users: [{ name: "Dana Whitfield", role: "Admin" }], query: "" }),
      },
      error: {
        title: "Couldn't load users",
        hint: "The server didn't answer.",
        act: "Retry",
        run: () => set({ phase: "loading", settles: true }),
      },
      none: {
        title: `No results for "${now.query.trim()}"`,
        hint: "Check the spelling, or clear the search.",
        act: "Clear search",
        run: () => set({ query: "" }),
      },
    }[view];
    body = (
      <tr {...stylex.props(row)}>
        <td colSpan={2} {...stylex.props(styles.td, styles.blank, styles.still)}>
          <div {...stylex.props(styles.said)}>
            <b {...stylex.props(styles.saidTitle, view === "error" && styles.saidError)}>
              {say.title}
            </b>
            <span {...stylex.props(styles.saidHint)}>{say.hint}</span>
            <button
              type="button"
              {...stylex.props(
                styles.btn,
                view !== "none" && styles.go,
                styles.saidButton,
                styles.ring,
              )}
              onClick={say.run}
            >
              {view === "error" && (
                <ArrowClockwiseIcon
                  weight="bold"
                  aria-hidden="true"
                  {...stylex.props(styles.btnIcon)}
                />
              )}
              {say.act}
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div {...stylex.props(styles.card)}>
      <div {...stylex.props(styles.bar)}>
        <SearchBox value={now.query} onChange={(query) => set({ query })} />
      </div>
      <table {...stylex.props(styles.table)} aria-busy={view === "loading" || undefined}>
        <caption {...stylex.props(arcade.srOnly)}>Team members</caption>
        <colgroup>
          <col />
          <col {...stylex.props(styles.colRole)} />
        </colgroup>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Role</Th>
          </tr>
        </thead>
        <tbody {...stylex.props(styles.body)}>{body}</tbody>
      </table>
    </div>
  );
}

const CREW: readonly Person[] = [
  { name: "Ana Li", role: "Admin" },
  { name: "Bob Smith", role: "Editor" },
  { name: "Carol Williams", role: "Viewer" },
  { name: "Ed Ng", role: "Editor" },
];

function ActionsDemo({ careful }: { careful: boolean }) {
  const [rows, setRows] = useState(CREW);
  const [editing, setEditing] = useState<string | null>(null);
  const remove = (name: string) => setRows((now) => now.filter((row) => row.name !== name));
  const edit = (name: string) => setEditing((now) => (now === name ? null : name));

  return (
    <div {...stylex.props(styles.card)}>
      <table {...stylex.props(styles.table)}>
        <caption {...stylex.props(arcade.srOnly)}>Team members with actions</caption>
        <colgroup>
          <col />
          <col {...stylex.props(styles.colRole)} />
          {careful && <col {...stylex.props(styles.colActs)} />}
        </colgroup>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Role</Th>
            {careful && (
              <Th style={styles.num}>
                <span {...stylex.props(arcade.srOnly)}>Actions</span>
              </Th>
            )}
          </tr>
        </thead>
        <tbody {...stylex.props(styles.body)}>
          {rows.map(({ name, role }, at) => (
            <tr key={name} {...stylex.props(row)}>
              <td {...stylex.props(styles.td, editing === name && styles.editing)}>
                <span data-hint={at === 0 || undefined}>{name}</span>
                {!careful && (
                  <span {...stylex.props(styles.inline)}>
                    <button
                      type="button"
                      aria-label={`Edit ${name}`}
                      aria-pressed={editing === name}
                      {...stylex.props(styles.inlineButton, styles.ring)}
                      onClick={() => edit(name)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${name}`}
                      {...stylex.props(styles.inlineButton, styles.inlineDelete, styles.ring)}
                      onClick={() => remove(name)}
                    >
                      Delete
                    </button>
                  </span>
                )}
              </td>
              <td {...stylex.props(styles.td, styles.dim, editing === name && styles.editing)}>
                {role}
              </td>
              {careful && (
                <td
                  {...stylex.props(
                    styles.td,
                    styles.num,
                    styles.overflowing,
                    editing === name && styles.editing,
                  )}
                >
                  <span {...stylex.props(styles.icons)}>
                    <IconButton
                      tip="Edit"
                      label={`Edit ${name}`}
                      pressed={editing === name}
                      onClick={() => edit(name)}
                    >
                      <PencilSimpleIcon weight="bold" {...stylex.props(styles.iconGlyph)} />
                    </IconButton>
                    <IconButton
                      tip="Delete"
                      label={`Delete ${name}`}
                      danger
                      onClick={() => remove(name)}
                    >
                      <TrashIcon weight="bold" {...stylex.props(styles.iconGlyph)} />
                    </IconButton>
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <div {...stylex.props(styles.foot)}>
        <span>
          {rows.length} of {CREW.length} users
        </span>
        {rows.length < CREW.length && (
          <button
            type="button"
            {...stylex.props(styles.link, styles.ring)}
            onClick={() => setRows(CREW)}
          >
            Restore
          </button>
        )}
      </div>
    </div>
  );
}

function IconButton({
  tip,
  label,
  danger = false,
  pressed,
  onClick,
  children,
}: {
  tip: string;
  label: string;
  danger?: boolean;
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <span {...stylex.props(styles.tipped, tipped)}>
      <button
        type="button"
        {...stylex.props(
          styles.icon,
          danger && styles.iconDanger,
          pressed && styles.iconPressed,
          styles.ring,
        )}
        aria-label={label}
        aria-pressed={pressed}
        onClick={onClick}
      >
        {children}
      </button>
      <span {...stylex.props(styles.tip)} aria-hidden="true">
        {tip}
      </span>
    </span>
  );
}

type Filter = "all" | "admin" | "owner";

const STAFF: readonly Person[] = [
  { name: "Alice Johnson", role: "Admin" },
  { name: "Bob Smith", role: "Editor" },
  { name: "Carol Williams", role: "Viewer" },
  { name: "David Brown", role: "Admin" },
  { name: "Erin Clark", role: "Editor" },
  { name: "Frank Moore", role: "Viewer" },
  { name: "Grace Hall", role: "Admin" },
  { name: "Hiro Tanaka", role: "Editor" },
  { name: "Ivy Chen", role: "Viewer" },
];
const PER_PAGE = 4;

const FILTERED: Record<Filter, readonly Person[]> = {
  all: STAFF,
  admin: STAFF.filter((person) => person.role === "Admin"),
  owner: [],
};
const FILTERS: readonly (readonly [Filter, string])[] = [
  ["all", `All ${FILTERED.all.length}`],
  ["admin", `Admins ${FILTERED.admin.length}`],
  ["owner", `Owners ${FILTERED.owner.length}`],
];

function FilterSwitch() {
  const { filter } = useDemos();
  const value = useStore(filter);
  return (
    <Segments
      label="Filter by role"
      options={FILTERS}
      value={value}
      onPick={(next) => filter.update(() => next)}
    />
  );
}

function PagerDemo({ careful }: { careful: boolean }) {
  const { filter } = useDemos();
  const value = useStore(filter);
  return <PagedTable key={value} people={FILTERED[value]} careful={careful} />;
}

function PagedTable({ people, careful }: { people: readonly Person[]; careful: boolean }) {
  const [page, setPage] = useState(1);
  const pages = Math.ceil(people.length / PER_PAGE);
  const shown = people.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  return (
    <div {...stylex.props(styles.card)}>
      <table {...stylex.props(styles.table)}>
        <caption {...stylex.props(arcade.srOnly)}>Users, page {page}</caption>
        <colgroup>
          <col />
          <col {...stylex.props(styles.colRole)} />
        </colgroup>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Role</Th>
          </tr>
        </thead>
        <tbody {...stylex.props(styles.body)}>
          {shown.length === 0 ? (
            <tr {...stylex.props(row)}>
              <td colSpan={2} {...stylex.props(styles.td, styles.blank, styles.still)}>
                <div {...stylex.props(styles.said)}>
                  <b {...stylex.props(styles.saidTitle)}>No owners</b>
                  <span {...stylex.props(styles.saidHint)}>Nobody has the Owner role yet.</span>
                </div>
              </td>
            </tr>
          ) : (
            shown.map((person) => (
              <tr key={person.name} {...stylex.props(row)}>
                <td {...stylex.props(styles.td)}>{person.name}</td>
                <td {...stylex.props(styles.td, styles.dim)}>{person.role}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {(!careful || pages > 1) && <Pager page={page} pages={pages} onPage={setPage} />}
    </div>
  );
}

function Pager({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (next: number) => void;
}) {
  return (
    <nav {...stylex.props(styles.pager)} aria-label="Pages">
      <span>
        Page {page} of {pages}
      </span>
      <span {...stylex.props(styles.pages)}>
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          {...stylex.props(styles.page, styles.ring)}
          onClick={() => onPage(page - 1)}
        >
          <CaretLeftIcon weight="bold" aria-hidden="true" {...stylex.props(styles.pageIcon)} />
        </button>
        {Array.from({ length: pages }, (_, at) => at + 1).map((n) => (
          <button
            key={n}
            type="button"
            aria-current={n === page ? "page" : undefined}
            {...stylex.props(styles.page, n === page && styles.pageOn, styles.ring)}
            onClick={() => onPage(n)}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= pages}
          {...stylex.props(styles.page, styles.ring)}
          onClick={() => onPage(page + 1)}
        >
          <CaretRightIcon weight="bold" aria-hidden="true" {...stylex.props(styles.pageIcon)} />
        </button>
      </span>
    </nav>
  );
}

const URL_PER_PAGE = 3;
const URL_PAGES = Math.ceil(STAFF.length / URL_PER_PAGE);

type Browse = { page: number; reloading: boolean; reloads: number };

function UrlDemo({ careful }: { careful: boolean }) {
  const [now, setNow] = useState<Browse>({ page: 2, reloading: false, reloads: 0 });
  const query = careful && now.page > 1 ? `?page=${now.page}` : "";

  useEffect(() => {
    if (!now.reloading) return;
    const id = setTimeout(
      () =>
        setNow((old) => ({
          page: careful ? old.page : 1,
          reloading: false,
          reloads: old.reloads + 1,
        })),
      420,
    );
    return () => clearTimeout(id);
  }, [now.reloading, careful]);

  const shown = STAFF.slice((now.page - 1) * URL_PER_PAGE, now.page * URL_PER_PAGE);
  return (
    <div {...stylex.props(styles.card)}>
      <div {...stylex.props(styles.bar)}>
        <button
          type="button"
          {...stylex.props(styles.icon, styles.ring)}
          aria-label="Reload"
          data-hint
          disabled={now.reloading}
          onClick={() => setNow((old) => ({ ...old, reloading: true }))}
        >
          <ArrowClockwiseIcon
            weight="bold"
            aria-hidden="true"
            {...stylex.props(styles.iconGlyph)}
          />
        </button>
        <span {...stylex.props(styles.address)}>
          <span {...stylex.props(styles.host)}>acme.app</span>/users
          {query && <b {...stylex.props(styles.query)}>{query}</b>}
        </span>
      </div>
      <table {...stylex.props(styles.table)}>
        <caption {...stylex.props(arcade.srOnly)}>Users, page {now.page}</caption>
        <colgroup>
          <col />
          <col {...stylex.props(styles.colRole)} />
        </colgroup>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Role</Th>
          </tr>
        </thead>
        <tbody {...stylex.props(styles.body, now.reloading && styles.reloading)}>
          {shown.map((person) => (
            <tr key={person.name} {...stylex.props(row)}>
              <td {...stylex.props(styles.td)}>{person.name}</td>
              <td {...stylex.props(styles.td, styles.dim)}>{person.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager
        page={now.page}
        pages={URL_PAGES}
        onPage={(page) => setNow((old) => ({ ...old, page }))}
      />
      <p {...stylex.props(styles.note)} aria-live="polite">
        {now.reloads === 0
          ? "Pick a page, then reload."
          : careful
            ? `Reloaded. Still on page ${now.page}.`
            : "Reloaded. Back on page 1."}
      </p>
    </div>
  );
}

export const LESSONS: Lesson[] = [
  {
    title: "Right-align numbers",
    body: (
      <>
        People compare numbers by their last digits. Use tabular figures so every digit is the same
        width, and add thousands separators. Watch the right edge.
      </>
    ),
    extra: <LiveSwitch />,
    bad: {
      label: "As typed",
      costs: ["edges 25px apart", "12500, no commas"],
      view: <NumbersDemo careful={false} />,
    },
    good: {
      label: "Align right, tabular",
      costs: ["1 edge", "tabular figures", "12,500.00"],
      view: <NumbersDemo careful />,
    },
    levels: [
      {
        name: "Scan for the biggest",
        prompt: (
          <>
            A revenue column holds <Code>9</Code>, <Code>120</Code> and <Code>12,500</Code>, and
            people scan it for the biggest. Place the numbers.
          </>
        ),
        piece: "9 · 120 · 12,500",
        answer: "right",
        rows: [
          { depth: 0, text: "Revenue column", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "left",
              label: "+ left-aligned",
              note: "9 sits under the 1 of 12,500, so the digits that matter never line up.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "center",
              label: "+ centred",
              note: "Each value sits by its own width, so no column of digits lines up at all.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "right",
              label: "+ right-aligned, even-width digits",
              note: "Ones sit under ones and thousands under thousands, so the longest number reads as the biggest.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Give every state a next step",
    body: (
      <>
        A table is often loading, empty, failed or showing no matches. Draw each one. Use skeleton
        rows to keep the shape while it loads, and say why and what to do next in every blank. Pick
        a state, search, then press the buttons.
      </>
    ),
    extra: <StateSwitch />,
    bad: {
      label: "Blank",
      costs: ["3 states, 1 message", "0 next steps"],
      view: <StatesDemo careful={false} />,
    },
    good: {
      label: "Say what's next",
      costs: ["1 next step each", "height holds"],
      view: <StatesDemo careful />,
    },
    levels: [
      {
        name: "Fill the blank",
        prompt: (
          <>
            The users table can show no rows for three reasons. Place the <b>Add user</b>
            button.
          </>
        ),
        piece: "Add user",
        answer: "empty",
        rows: [
          { depth: 0, text: "Users table", kind: "comp" },
          { depth: 1, text: '"Couldn\'t load users"', tag: "error" },
          {
            depth: 2,
            slot: {
              id: "error",
              label: "+ its button",
              note: "The list failed to load, so it isn't empty. Offer Retry, since Add user hides the failure.",
            },
          },
          { depth: 1, text: '"No users yet"', tag: "empty" },
          {
            depth: 2,
            slot: {
              id: "empty",
              label: "+ its button",
              note: "Nothing here yet, so offer adding the first user.",
            },
          },
          { depth: 1, text: '"No results for "zed""', tag: "search" },
          {
            depth: 2,
            slot: {
              id: "search",
              label: "+ its button",
              note: "The users exist and the search hid them. Offer Clear search to bring them back.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Put actions in a fixed last column",
    body: (
      <>
        Give the column a fixed width and right-align it, so Edit sits in the same place on every
        row. Use icon buttons to save room, and name each one with a tooltip. Hover the rows, then
        delete one.
      </>
    ),
    bad: {
      label: "Hover only",
      costs: ["hidden until hover", "Edit at 3 x-positions"],
      view: <ActionsDemo careful={false} />,
    },
    good: {
      label: "Last column",
      costs: ["always there", "1 column, 76px", "2 tooltips"],
      view: <ActionsDemo careful />,
    },
    levels: [
      {
        name: "Place the actions",
        prompt: (
          <>
            Each user row gets <b>Edit</b> and <b>Delete</b>. Names run from 6 to 22 characters.
            Place the buttons.
          </>
        ),
        piece: "Edit · Delete",
        answer: "last",
        rows: [
          { depth: 0, text: "A user row", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "first",
              label: "+ a column of their own, first",
              note: "The row now opens with buttons, which push every name one column right.",
            },
          },
          { depth: 1, text: "Alice Johnson" },
          {
            depth: 1,
            slot: {
              id: "name",
              label: "+ in the name cell, after the text",
              note: "Names differ in length, so Edit lands somewhere new on every row.",
            },
          },
          { depth: 1, text: "alice@acme.com" },
          { depth: 1, text: "Admin" },
          {
            depth: 1,
            slot: {
              id: "last",
              label: "+ a column of their own, last, fixed width",
              note: "Fix the width and right-align the column, so Edit sits in the same place on every row.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Skip the pager for one page",
    body: (
      <>
        With one page, a pager is a row of dead arrows. Under an empty table, it reads Page 1 of 0.
        Filter the list and watch both.
      </>
    ),
    extra: <FilterSwitch />,
    bad: {
      label: "Always there",
      costs: ["Page 1 of 1", "2 dead arrows"],
      view: <PagerDemo careful={false} />,
    },
    good: {
      label: "Show for 2+ pages",
      costs: ["0 dead controls"],
      view: <PagerDemo careful />,
    },
    levels: [
      {
        name: "Count the pages",
        prompt: (
          <>
            The table shows 25 rows per page. Three filters return 25, 31 and 0 users. Place the
            pager.
          </>
        ),
        piece: "pager",
        answer: "31",
        rows: [
          { depth: 0, text: "Users table, 25 rows a page", kind: "comp" },
          { depth: 1, text: "Admins", tag: "25 users" },
          {
            depth: 2,
            slot: {
              id: "25",
              label: "+ pager",
              note: "25 rows fill exactly one page. The pager would read Page 1 of 1 with two dead arrows.",
            },
          },
          { depth: 1, text: "Everyone", tag: "31 users" },
          {
            depth: 2,
            slot: {
              id: "31",
              label: "+ pager",
              note: "Add it here, since the last 6 rows go on page 2.",
            },
          },
          { depth: 1, text: "Owners", tag: "0 users" },
          {
            depth: 2,
            slot: {
              id: "0",
              label: "+ pager",
              note: "Nothing to page through. Under the empty state it would say Page 1 of 0.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Keep the page in the URL",
    body: (
      <>
        With <Code>?page=2</Code> in the address, a reload, the Back button and a shared link all
        land where you were. Reload each.
      </>
    ),
    bad: {
      label: "In state",
      costs: ["reload → page 1", "link says /users"],
      view: <UrlDemo careful={false} />,
    },
    good: {
      label: "Keep in the URL",
      costs: ["?page=2", "reload keeps it"],
      view: <UrlDemo careful />,
    },
    levels: [
      {
        name: "Share page 3",
        prompt: (
          <>
            You're on page 3 of the orders and send the link to a teammate. Place the page number.
          </>
        ),
        piece: "page 3",
        answer: "url",
        rows: [
          { depth: 0, text: "Orders page", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "state",
              label: "+ in memory",
              note: "If you reload or press Back, you're on page 1. The link you sent opens on page 1 too.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "url",
              label: "+ in the link",
              note: "Make the page part of the link, so a reload, Back and your teammate all land on page 3.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "storage",
              label: "+ in this browser's storage",
              note: "It survives your reload, but your teammate's browser has its own storage and opens page 1.",
            },
          },
        ],
      },
    ],
  },
];

export const TLDR = [
  ["A column of numbers", "Right-align it, with tabular figures and separators"],
  ["Money in a finance view", "Use a monospace face"],
  ["Rows still loading", "Draw skeleton rows at the real row height"],
  ["Empty, failed or no match", "Say which and give one next step: Add, Retry, Clear search"],
  ["Row actions", "Put icon buttons with tooltips in a fixed last column"],
  ["One page, or none", "Skip the pager"],
  ["The current page", "Put it in the URL as ?page=2"],
] as const;

export function TableDesign() {
  const [demos] = useState<Demos>(() => ({
    ticker: store<Ticker>({ values: MRR, step: 0, hot: null }),
    roster: store(PRESETS.empty),
    filter: store<Filter>("admin"),
  }));
  return (
    <DemosContext value={demos}>
      <RuleLanding
        costsStyle={styles.costs}
        lead={
          <>
            Right-align numbers, pin actions to a fixed last column, and give every blank a next
            step.
          </>
        }
        learn={{
          title: "Design tables for scanning",
          intro: <>Make each column easy to run an eye down, since people scan for one value.</>,
        }}
        lessons={LESSONS}
        tldr={TLDR}
        board="table"
        take="build tables the same way"
      />
    </DemosContext>
  );
}
