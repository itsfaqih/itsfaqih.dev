import {
  ArrowRightIcon,
  CheckIcon,
  CircleNotchIcon,
  GearSixIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { reducedMotion } from "../../hooks/use-media-query";
import { cursors, fonts, motion, palette } from "../../theme.stylex";
import { type Lesson, type Level, onceOnScreen, RuleLanding } from "./-components/rule-landing";

const TABLET = "@media (max-width: 820px)";
const PHONE = "@media (max-width: 640px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";

const roll = stylex.keyframes({ from: { opacity: 0, translate: "0 9px" } });
const spin = stylex.keyframes({ to: { rotate: "1turn" } });
const stepIn = stylex.keyframes({ from: { opacity: 0, translate: "0 4px" } });
const fade = stylex.keyframes({ from: { opacity: 0 } });

const styles = stylex.create({
  stage: {
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: "18px",
    minHeight: { default: "176px", [TABLET]: "200px" },
    paddingBlock: "8px",
    paddingInline: 0,
  },
  key: {
    // Declared on the key, not the page, so a red key's --c reaches its shadow and ink too.
    "--key": "color-mix(in oklab, var(--c) 60%, #000)",
    "--ink": `color-mix(in oklab, var(--c) ${palette["--ink-mix"]}, #000)`,
    "--face": "var(--c)",
    "--lit": "color-mix(in oklab, var(--c) 82%, #fff)",
    position: "relative",
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "center",
    height: "44px",
    paddingTop: 0,
    paddingRight: "var(--pr, 20px)",
    paddingBottom: 0,
    paddingLeft: "var(--pl, 20px)",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "12px",
    backgroundColor: "var(--face)",
    boxShadow: "0 4px 0 var(--key)",
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
    color: "var(--on-c)",
    cursor: cursors["--cursor"],
    transition: `transform 150ms ${motion["--out"]}, background-color 150ms ease, box-shadow 150ms ease`,
    outline: { default: null, ":focus-visible": `3px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-visible": "3px" },
  },
  live: {
    backgroundColor: { default: "var(--face)", ":hover": "var(--lit)" },
    transform: {
      default: null,
      ":active": { default: "translateY(2px) scale(0.97)", [REDUCE]: "none" },
    },
    boxShadow: { default: "0 4px 0 var(--key)", ":active": "0 2px 0 var(--key)" },
  },
  icon: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "16px",
    height: "16px",
  },
  sm: {
    "--pl": "16px",
    "--pr": "16px",
    height: "38px",
    borderRadius: "10px",
    fontSize: "12px",
  },
  red: {
    "--c": "var(--no)",
  },
  tint: {
    "--face": "color-mix(in srgb, var(--c) 18%, transparent)",
    "--lit": "color-mix(in srgb, var(--c) 28%, transparent)",
    boxShadow: "none",
    color: "var(--ink)",
  },
  text: {
    "--face": "transparent",
    "--lit": `color-mix(in srgb, ${palette["--text"]} 8%, transparent)`,
    boxShadow: "none",
    color: palette["--text"],
  },
  plain: {
    "--face": palette["--panel-2"],
    "--lit": palette["--soft-hover"],
    boxShadow: {
      default: `0 4px 0 ${palette["--drop-ink"]}`,
      ":active": `0 2px 0 ${palette["--drop-ink"]}`,
    },
    color: palette["--text"],
  },
  hover: {
    backgroundColor: "var(--lit)",
  },
  press: {
    transform: { default: "translateY(2px) scale(0.97)", [REDUCE]: "none" },
    boxShadow: "0 2px 0 var(--key)",
  },
  focus: {
    outline: `3px solid ${palette["--focus"]}`,
    outlineOffset: "3px",
  },
  flat: {
    transition: "none",
    outline: { default: null, ":hover": "none", ":active": "none", ":focus-visible": "none" },
  },
  flatForced: {
    backgroundColor: "var(--face)",
    boxShadow: "0 4px 0 var(--key)",
    transform: "none",
    outline: "none",
  },
  specimens: {
    display: "grid",
    gridTemplateColumns: "repeat(4, auto)",
    gap: { default: "14px", [PHONE]: "6px" },
    paddingTop: "14px",
    paddingRight: { default: "16px", [PHONE]: "8px" },
    paddingBottom: "10px",
    paddingLeft: { default: "16px", [PHONE]: "8px" },
    borderRadius: "12px",
    backgroundColor: `color-mix(in srgb, ${palette["--panel-2"]} 60%, transparent)`,
  },
  specimen: {
    display: "grid",
    gap: "10px",
    justifyItems: "center",
  },
  specimenKey: {
    "--pl": "12px",
    "--pr": "12px",
    height: "32px",
    borderRadius: "8px",
    fontSize: "11px",
    transition: "none",
  },
  small: {
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
  },
  measure: {
    display: "inline-grid",
    gap: "10px",
  },
  save: {
    display: "inline-grid",
  },
  waiting: {
    cursor: "wait",
  },
  label: {
    display: "inline-flex",
    gridRowStart: 1,
    gridColumnStart: 1,
    gap: "8px",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    translate: { default: "0 -8px", [REDUCE]: "none" },
    transition: `opacity 120ms ease, translate 160ms ${motion["--out"]}`,
  },
  labelOn: {
    opacity: 1,
    translate: "none",
    animationName: { default: roll, [REDUCE]: fade },
    animationDuration: { default: "220ms", [REDUCE]: "160ms" },
    animationTimingFunction: { default: "cubic-bezier(0.16, 1, 0.3, 1)", [REDUCE]: "ease" },
  },
  jumpy: {
    animationName: "none",
    animationDuration: "0s",
    animationTimingFunction: "ease",
  },
  jumpyOff: {
    display: "none",
  },
  spin: {
    animationName: { default: spin, [REDUCE]: "none" },
    animationDuration: { default: "700ms", [REDUCE]: "0s" },
    animationTimingFunction: { default: "linear", [REDUCE]: "ease" },
    animationIterationCount: { default: "infinite", [REDUCE]: 1 },
  },
  ruler: {
    position: "relative",
    height: "9px",
    borderLeftWidth: "1.5px",
    borderLeftStyle: "solid",
    borderLeftColor: palette["--mute"],
    borderRightWidth: "1.5px",
    borderRightStyle: "solid",
    borderRightColor: palette["--mute"],
    "::before": {
      content: '""',
      position: "absolute",
      top: "4px",
      right: 0,
      bottom: "auto",
      left: 0,
      height: "1.5px",
      backgroundColor: palette["--mute"],
    },
  },
  width: {
    position: "absolute",
    top: "14px",
    left: "50%",
    translate: "-50% 0",
    whiteSpace: "nowrap",
    color: palette["--text"],
  },
  saveNote: {
    marginTop: "14px",
  },
  form: {
    gridTemplateColumns: { default: "minmax(0, 1fr) auto", [PHONE]: "minmax(0, 1fr)" },
    alignItems: "end",
    justifyItems: "stretch",
    gap: "12px",
    width: "min(100%, 360px)",
    marginInline: "auto",
  },
  field: {
    display: "grid",
    gap: "6px",
    minWidth: 0,
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--dim"],
  },
  input: {
    height: "38px",
    minWidth: 0,
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "10px",
    backgroundColor: palette["--panel"],
    fontWeight: 500,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
    outline: { default: null, ":focus-visible": `3px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-visible": "1px" },
  },
  formKey: {
    "--pl": "16px",
    "--pr": "16px",
    height: "38px",
    borderRadius: "10px",
    fontSize: "12px",
  },
  formEnd: {
    justifySelf: { default: null, [PHONE]: "start" },
  },
  off: {
    "--face": palette["--panel-2"],
    boxShadow: `0 4px 0 ${palette["--drop-ink"]}`,
    color: palette["--dim"],
    cursor: "not-allowed",
  },
  faded: {
    opacity: 0.35,
    cursor: cursors["--cursor-point"],
  },
  tip: {
    position: "relative",
    display: "inline-grid",
  },
  tooltip: {
    position: "absolute",
    bottom: "calc(100% + 12px)",
    left: "50%",
    zIndex: 2,
    paddingBlock: "6px",
    paddingInline: "10px",
    borderRadius: "8px",
    backgroundColor: palette["--text"],
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    whiteSpace: "nowrap",
    color: palette["--bg"],
    pointerEvents: "none",
    opacity: { default: 0, [stylex.when.siblingBefore(":is(:hover, :focus-visible)")]: 1 },
    translate: {
      default: "-50% 4px",
      [REDUCE]: "-50% 0",
      [stylex.when.siblingBefore(":is(:hover, :focus-visible)")]: "-50% 0",
    },
    transition: `opacity 150ms ease, translate 200ms ${motion["--out"]}`,
    "::after": {
      content: '""',
      position: "absolute",
      top: "100%",
      left: "50%",
      translate: "-50% 0",
      borderWidth: "5px",
      borderStyle: "solid",
      borderColor: "transparent",
      borderTopColor: palette["--text"],
    },
  },
  tooltipOpen: {
    opacity: 1,
    translate: "-50% 0",
  },
  card: {
    display: "grid",
    gap: "4px",
    width: "min(100%, 380px)",
    paddingBlock: { default: "18px", [PHONE]: "14px" },
    paddingInline: { default: "18px", [PHONE]: "14px" },
    borderRadius: "14px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}`,
    transition: "filter 200ms ease",
    filter: {
      default: null,
      [stylex.when.ancestor(':has([data-toggle="squint"][aria-pressed="true"])')]: "blur(5px)",
    },
  },
  cardTitle: {
    fontWeight: 700,
    fontSize: "15px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    letterSpacing: "-0.02em",
    color: palette["--text"],
  },
  cardSub: {
    fontSize: "13px",
    color: palette["--mute"],
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    justifyContent: "flex-end",
  },
  cardRow: {
    marginTop: "16px",
    gap: { default: "8px", [PHONE]: "6px" },
  },
  cardRowKey: {
    "--pl": { default: "16px", [PHONE]: "12px" },
    "--pr": { default: "16px", [PHONE]: "12px" },
    flexGrow: { default: null, [PHONE]: 1 },
    flexShrink: { default: null, [PHONE]: 0 },
    flexBasis: { default: null, [PHONE]: "auto" },
  },
  toggle: {
    marginTop: "4px",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: palette["--mute"],
    borderRadius: "50%",
    transition: "background-color var(--t-fb) ease, border-color var(--t-fb) ease",
  },
  dotOn: {
    borderColor: "var(--c-ink)",
    backgroundColor: "var(--c)",
  },
  project: {
    display: "flex",
    flexWrap: "wrap",
    rowGap: "14px",
    columnGap: "20px",
    alignItems: "center",
    justifyContent: "space-between",
    width: "min(100%, 420px)",
    minHeight: "80px",
    paddingBlock: "16px",
    paddingInline: "18px",
    borderRadius: "14px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}`,
  },
  confirm: {
    boxShadow: "0 0 0 1.5px color-mix(in srgb, var(--no) 55%, transparent)",
  },
  deleted: {
    backgroundColor: "transparent",
    boxShadow: `0 0 0 1.5px ${palette["--hair"]} inset`,
  },
  stepIn: {
    animationName: { default: stepIn, [REDUCE]: fade },
    animationDuration: { default: "200ms", [REDUCE]: "160ms" },
    animationTimingFunction: { default: motion["--out"], [REDUCE]: "ease" },
  },
  projectRow: {
    marginLeft: "auto",
  },
  projectCopy: {
    display: "grid",
    gap: "2px",
  },
  projectName: {
    fontWeight: 700,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    letterSpacing: "-0.02em",
    color: palette["--text"],
  },
  projectGone: {
    color: "var(--no-ink)",
  },
  projectMeta: {
    fontSize: "13px",
    color: palette["--mute"],
  },
  icons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    justifyContent: "center",
    alignItems: "center",
  },
  lead: {
    "--pl": "12px",
  },
  trail: {
    "--pr": "12px",
  },
  even: {
    "--pl": "16px",
    "--pr": "16px",
    display: "inline-block",
    lineHeight: "38px",
  },
  evenIcon: {
    display: "inline",
    verticalAlign: "baseline",
  },
  evenLeadIcon: {
    marginRight: "8px",
  },
  evenTrailIcon: {
    marginLeft: "8px",
  },
  square: {
    "--pl": "0px",
    "--pr": "0px",
    width: "38px",
  },
  wide: {
    "--pl": "18px",
    "--pr": "18px",
  },
  pads: {
    "::before": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: "var(--pl)",
      borderTopLeftRadius: "10px",
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
      borderBottomLeftRadius: "10px",
      backgroundImage: `repeating-linear-gradient(-45deg, color-mix(in srgb, ${palette["--focus"]} 55%, transparent) 0 2px, transparent 2px 5px)`,
      opacity: {
        default: 0,
        [stylex.when.ancestor(':has([data-toggle="pads"][aria-pressed="true"])')]: 1,
      },
      transition: "opacity 150ms ease",
    },
    "::after": {
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      width: "var(--pr)",
      borderTopLeftRadius: 0,
      borderTopRightRadius: "10px",
      borderBottomRightRadius: "10px",
      borderBottomLeftRadius: 0,
      backgroundImage: `repeating-linear-gradient(-45deg, color-mix(in srgb, ${palette["--focus"]} 55%, transparent) 0 2px, transparent 2px 5px)`,
      opacity: {
        default: 0,
        [stylex.when.ancestor(':has([data-toggle="pads"][aria-pressed="true"])')]: 1,
      },
      transition: "opacity 150ms ease",
    },
  },
});

const STATES = ["idle", "hover", "press", "focus"] as const;

const FORCED = {
  idle: null,
  hover: styles.hover,
  press: styles.press,
  focus: styles.focus,
} as const;

function StatesDemo({ careful }: { careful: boolean }) {
  return (
    <div {...stylex.props(styles.stage)}>
      <button type="button" {...stylex.props(styles.key, careful ? styles.live : styles.flat)}>
        Save changes
      </button>
      <div {...stylex.props(styles.specimens)} aria-hidden="true">
        {STATES.map((state) => (
          <span key={state} {...stylex.props(styles.specimen)}>
            <span
              {...stylex.props(
                styles.key,
                styles.sm,
                styles.specimenKey,
                FORCED[state],
                !careful && styles.flatForced,
              )}
            >
              Save
            </span>
            <small {...stylex.props(styles.small)}>{state}</small>
          </span>
        ))}
      </div>
    </div>
  );
}

type Phase = "idle" | "pending" | "done";
type Save = { phase: Phase; sent: number };

const SAVE_MS = 1200;
const DONE_MS = 1400;

const LABELS: readonly { phase: Phase; text: string }[] = [
  { phase: "idle", text: "Save" },
  { phase: "pending", text: "Saving…" },
  { phase: "done", text: "Saved" },
];

function SaveDemo({ careful }: { careful: boolean }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [save, setSave] = useState<Save>({ phase: "idle", sent: 0 });
  const [pressing, setPressing] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const busy = careful && save.phase !== "idle";

  useEffect(() => {
    if (save.phase === "idle") return;
    const id = setTimeout(
      () => setSave((now) => ({ ...now, phase: now.phase === "pending" ? "done" : "idle" })),
      save.phase === "pending" ? SAVE_MS : DONE_MS,
    );
    return () => clearTimeout(id);
  }, [save]);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    const observer = new ResizeObserver(() => setWidth(Math.round(button.offsetWidth)));
    observer.observe(button);
    return () => observer.disconnect();
  }, []);

  function press() {
    setSave((now) =>
      careful && now.phase !== "idle"
        ? now
        : { phase: "pending", sent: now.phase === "pending" ? now.sent + 1 : 1 },
    );
  }

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reducedMotion()) return;
    const timers: number[] = [];
    const stop = onceOnScreen(stage, () => {
      timers.push(
        window.setTimeout(() => setPressing(true), 500),
        window.setTimeout(() => {
          setPressing(false);
          setSave((now) => (now.sent === 0 ? { phase: "pending", sent: 1 } : now));
        }, 660),
      );
    });
    return () => {
      stop();
      for (const timer of timers) clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={stageRef} {...stylex.props(styles.stage)}>
      <div {...stylex.props(styles.measure)}>
        <button
          ref={buttonRef}
          type="button"
          {...stylex.props(
            styles.key,
            !busy && styles.live,
            styles.save,
            busy && save.phase === "pending" && styles.waiting,
            pressing && styles.press,
          )}
          aria-disabled={busy || undefined}
          onClick={press}
        >
          {LABELS.map(({ phase, text }) => {
            const on = save.phase === phase;
            return (
              <span
                key={phase}
                {...stylex.props(
                  styles.label,
                  on && styles.labelOn,
                  !careful && styles.jumpy,
                  !careful && !on && styles.jumpyOff,
                )}
                aria-hidden={!on || undefined}
              >
                {phase === "pending" && (
                  <CircleNotchIcon weight="bold" {...stylex.props(styles.icon, styles.spin)} />
                )}
                {phase === "done" && <CheckIcon weight="bold" {...stylex.props(styles.icon)} />}
                {text}
              </span>
            );
          })}
        </button>
        <span {...stylex.props(styles.ruler)} aria-hidden="true">
          <b {...stylex.props(styles.small, styles.width)}>{width ?? "–"} px</b>
        </span>
      </div>
      <span {...stylex.props(styles.small, styles.saveNote)}>
        {save.sent === 1 ? "1 request sent" : `${save.sent} requests sent`}
      </span>
    </div>
  );
}

function DisabledDemo({ careful }: { careful: boolean }) {
  const [title, setTitle] = useState("");
  const [published, setPublished] = useState(false);
  const [nudged, setNudged] = useState(false);
  const tipId = useId();
  const ready = title.trim() !== "";

  useEffect(() => {
    if (!published) return;
    const id = setTimeout(() => setPublished(false), 1400);
    return () => clearTimeout(id);
  }, [published]);

  useEffect(() => {
    if (!nudged) return;
    const id = setTimeout(() => setNudged(false), 1600);
    return () => clearTimeout(id);
  }, [nudged]);

  const label = published ? (
    <>
      <CheckIcon weight="bold" {...stylex.props(styles.icon)} />
      Published
    </>
  ) : (
    "Publish"
  );

  return (
    <div {...stylex.props(styles.stage, styles.form)}>
      <label {...stylex.props(styles.field)}>
        <span>Title</span>
        <input
          value={title}
          placeholder="Untitled post"
          onChange={(event) => setTitle(event.target.value)}
          {...stylex.props(styles.input)}
        />
      </label>
      {careful ? (
        <span {...stylex.props(styles.tip, styles.formEnd)}>
          <button
            type="button"
            {...stylex.props(
              styles.key,
              ready && styles.live,
              styles.formKey,
              !ready && styles.off,
              stylex.defaultMarker(),
            )}
            aria-disabled={!ready || undefined}
            aria-describedby={ready ? undefined : tipId}
            onClick={() => (ready ? setPublished(true) : setNudged(true))}
          >
            {label}
          </button>
          {!ready && (
            <span
              role="tooltip"
              id={tipId}
              {...stylex.props(styles.tooltip, nudged && styles.tooltipOpen)}
            >
              Add a title first
            </span>
          )}
        </span>
      ) : (
        <button
          type="button"
          {...stylex.props(
            styles.key,
            ready && styles.live,
            styles.formKey,
            styles.formEnd,
            !ready && styles.faded,
          )}
          disabled={!ready}
          onClick={() => setPublished(true)}
        >
          {label}
        </button>
      )}
    </div>
  );
}

function HierarchyDemo({ careful }: { careful: boolean }) {
  const key = [styles.key, styles.sm, styles.live];
  const inRow = styles.cardRowKey;
  return (
    <div {...stylex.props(styles.stage)}>
      <div {...stylex.props(styles.card)}>
        <span {...stylex.props(styles.cardTitle)}>Spring launch notes</span>
        <span {...stylex.props(styles.cardSub)}>Draft · 1,240 words</span>
        <div {...stylex.props(styles.row, styles.cardRow)}>
          <button type="button" {...stylex.props(key, careful ? styles.text : styles.plain, inRow)}>
            Cancel
          </button>
          <button type="button" {...stylex.props(key, careful && styles.tint, inRow)}>
            Save draft
          </button>
          <button type="button" {...stylex.props(key, !careful && styles.red, inRow)}>
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

function LessonToggle({ label, name }: { label: string; name: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      type="button"
      className={`btn soft sm ${stylex.props(styles.toggle).className}`}
      data-toggle={name}
      aria-pressed={on}
      onClick={() => setOn((value) => !value)}
    >
      <span {...stylex.props(styles.dot, on && styles.dotOn)} aria-hidden="true" />
      {label}
    </button>
  );
}

type Step = "idle" | "confirm" | "deleted";

function DeleteDemo({ careful }: { careful: boolean }) {
  const [step, setStep] = useState<Step>("idle");
  const moved = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function go(next: Step) {
    moved.current = true;
    setStep(next);
  }

  useEffect(() => {
    if (!moved.current) return;
    rootRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [step]);

  const key = [styles.key, styles.sm, styles.live];
  const copy = stylex.props(styles.projectCopy, styles.stepIn);
  return (
    <div ref={rootRef} {...stylex.props(styles.stage)}>
      <div
        {...stylex.props(
          styles.project,
          step === "confirm" && styles.confirm,
          step === "deleted" && styles.deleted,
        )}
      >
        {step === "deleted" ? (
          <>
            <span {...copy}>
              <b {...stylex.props(styles.projectName, styles.projectGone)}>Moonbase is gone</b>
              <small {...stylex.props(styles.projectMeta)}>214 files deleted</small>
            </span>
            <button
              type="button"
              {...stylex.props(key, styles.text, styles.stepIn)}
              data-autofocus
              onClick={() => go("idle")}
            >
              Reset demo
            </button>
          </>
        ) : step === "confirm" ? (
          <>
            <span {...copy}>
              <b {...stylex.props(styles.projectName)}>Delete Moonbase?</b>
              <small {...stylex.props(styles.projectMeta)}>
                Its 214 files go too. This can't be undone.
              </small>
            </span>
            <span {...stylex.props(styles.row, styles.projectRow, styles.stepIn)}>
              <button
                type="button"
                {...stylex.props(key, styles.text)}
                data-autofocus
                onClick={() => go("idle")}
              >
                Cancel
              </button>
              <button
                type="button"
                {...stylex.props(key, styles.red)}
                onClick={() => go("deleted")}
              >
                Delete project
              </button>
            </span>
          </>
        ) : (
          <>
            <span {...copy}>
              <b {...stylex.props(styles.projectName)}>Moonbase</b>
              <small {...stylex.props(styles.projectMeta)}>214 files · edited 2h ago</small>
            </span>
            <button
              type="button"
              {...stylex.props(key, styles.red, careful && styles.tint, styles.stepIn)}
              data-autofocus
              onClick={() => go(careful ? "confirm" : "deleted")}
            >
              Delete project
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function IconsDemo({ careful }: { careful: boolean }) {
  const tipId = useId();
  const key = [styles.key, styles.sm, styles.live];
  const pad = [styles.pads, !careful && styles.even];
  const icon = [styles.icon, !careful && styles.evenIcon];
  return (
    <div {...stylex.props(styles.stage, styles.icons)}>
      <button type="button" {...stylex.props(key, styles.tint, styles.lead, pad)} data-pad="lead">
        <PlusIcon
          weight="bold"
          aria-hidden="true"
          {...stylex.props(icon, !careful && styles.evenLeadIcon)}
        />
        New project
      </button>
      <button type="button" {...stylex.props(key, styles.trail, pad)} data-pad="trail">
        Continue
        <ArrowRightIcon
          weight="bold"
          aria-hidden="true"
          {...stylex.props(icon, !careful && styles.evenTrailIcon)}
        />
      </button>
      {careful ? (
        <span {...stylex.props(styles.tip)}>
          <button
            type="button"
            {...stylex.props(key, styles.plain, styles.square, stylex.defaultMarker())}
            aria-label="Settings"
            aria-describedby={tipId}
          >
            <GearSixIcon weight="bold" aria-hidden="true" {...stylex.props(styles.icon)} />
          </button>
          <span role="tooltip" id={tipId} {...stylex.props(styles.tooltip)}>
            Settings
          </span>
        </span>
      ) : (
        <button
          type="button"
          {...stylex.props(key, styles.plain, styles.wide)}
          aria-label="Settings"
        >
          <GearSixIcon weight="bold" aria-hidden="true" {...stylex.props(styles.icon)} />
        </button>
      )}
    </div>
  );
}

const LESSONS: Lesson[] = [
  {
    title: "Give every state a look",
    body: (
      <>
        Hover, press and keyboard focus each need their own look. Without them a click feels like it
        missed, and a keyboard user can't see where they are. Hover both, press both, then{" "}
        <kbd>Tab</kbd> to them.
      </>
    ),
    bad: {
      label: "One look",
      costs: ["1 look for 4 states", "0px focus ring"],
      view: <StatesDemo careful={false} />,
    },
    good: {
      label: "Four looks",
      costs: ["4 looks", "3px focus ring", "150ms"],
      view: <StatesDemo careful />,
    },
  },
  {
    title: "Hold the width while it works",
    body: (
      <>
        Pending gets a state too. Stop taking clicks the moment it's pressed, say what it's doing,
        then say it worked. Stack the labels in one cell so the button keeps its size, and press the
        left one a few times.
      </>
    ),
    bad: {
      label: "Swaps the label",
      costs: ["width jumps 53px", "a request per click"],
      view: <SaveDemo careful={false} />,
    },
    good: {
      label: "Stacks the labels",
      costs: ["width holds", "1 request", "cursor: wait"],
      view: <SaveDemo careful />,
    },
  },
  {
    title: "Say why it's off",
    body: (
      <>
        A disabled button that only fades leaves people guessing. Show the no-entry cursor, keep the
        label readable, and put the reason in a tooltip. Type a title and both come on.
      </>
    ),
    bad: {
      label: "Just faded",
      costs: ["0 reasons", "1.6:1 contrast", "hand cursor"],
      view: <DisabledDemo careful={false} />,
    },
    good: {
      label: "Says why",
      costs: ["1 reason", "6.4:1 contrast", "cursor: not-allowed"],
      view: <DisabledDemo careful />,
    },
  },
  {
    title: "One filled button per screen",
    body: (
      <>
        Weight tells people where to go next. Fill the main action in the brand colour, tint the
        supporting one, and leave Cancel as text. Keep red for actions that destroy something.
      </>
    ),
    extra: <LessonToggle label="Squint" name="squint" />,
    bad: {
      label: "All filled",
      costs: ["3 filled", "red Publish"],
      view: <HierarchyDemo careful={false} />,
    },
    good: {
      label: "Filled, tinted, text",
      costs: ["1 filled", "1 next step"],
      view: <HierarchyDemo careful />,
    },
  },
  {
    title: "Guard the destructive action",
    body: (
      <>
        Delete should never be one stray click. Tint the trigger red, then confirm with a filled red
        button that names what goes. Focus lands on Cancel, the safe answer.
      </>
    ),
    bad: {
      label: "One click",
      costs: ["1 click", "0 warnings"],
      view: <DeleteDemo careful={false} />,
    },
    good: {
      label: "Confirm that names it",
      costs: ["2 clicks", "names 214 files"],
      view: <DeleteDemo careful />,
    },
  },
  {
    title: "Pad the icon side less",
    body: (
      <>
        An icon carries white space inside its own box, so equal padding looks lopsided. Take 4px
        off the icon's side and centre it on the text. An icon with no label is square, and needs an{" "}
        <code>aria-label</code> and a tooltip.
      </>
    ),
    extra: <LessonToggle label="Show padding" name="pads" />,
    bad: {
      label: "Even padding",
      costs: ["16 | 16px", "icon 4px up", "no tooltip"],
      view: <IconsDemo careful={false} />,
    },
    good: {
      label: "Optical padding",
      costs: ["12 | 16px", "centred", "38 × 38"],
      view: <IconsDemo careful />,
    },
  },
];

const CHEAT_SHEET = [
  ["Any button", "A look for hover, press and focus, in 100 to 200ms"],
  ["Waiting on a request", "Stop clicks, keep the width, say Saving… then Saved"],
  ["Not available yet", "cursor: not-allowed and a tooltip that says why"],
  ["Picking a variant", "One filled per screen, tinted to support, text to skip"],
  ["It deletes something", "Red, behind a confirm that names what goes"],
  ["An icon beside the label", "4px less padding on the icon's side"],
  ["An icon with no label", "Square, with an aria-label and a tooltip"],
] as const;

const LEVELS: Level[] = [
  {
    name: "The one next step",
    prompt: (
      <>
        A cart has three actions. <b>Continue shopping</b> is text and <b>Edit cart</b> is tinted.
        How should <b>Checkout</b> look?
      </>
    ),
    piece: "Checkout",
    answer: "brand",
    rows: [
      { depth: 0, text: "<CartFooter>", kind: "comp" },
      { depth: 1, text: "Continue shopping", tag: "text" },
      { depth: 1, text: "Edit cart", tag: "tinted" },
      {
        depth: 1,
        slot: {
          id: "tint",
          label: "+ tinted, like Edit cart",
          note: "Checkout now weighs the same as Edit cart, so nothing says which one finishes the order.",
          cost: ["2 equal buttons", "0 filled"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "red",
          label: "+ filled red",
          note: "Red reads as danger. People pause on the one button you want them to press.",
          cost: ["red = delete"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "brand",
          label: "+ filled, brand colour",
          note: "One filled button in the brand colour marks the step that finishes the job.",
          cost: ["1 filled", "1 next step"],
        },
      },
    ],
  },
  {
    name: "Remove a teammate",
    prompt: (
      <>
        Each member row on the team page can remove that person's access. You can invite them back
        later. Which button goes in the row?
      </>
    ),
    piece: "Remove access",
    answer: "tint",
    rows: [
      { depth: 0, text: "<MemberRow>", kind: "comp" },
      { depth: 1, text: "Dana Whitfield", tag: "editor" },
      {
        depth: 1,
        slot: {
          id: "filled",
          label: "+ filled red, then a confirm",
          note: "Filled red is for the one heavy delete, like Delete project. On every row it shouts over the whole page.",
          cost: ["red on 12 rows"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "grey",
          label: "+ grey text, one click",
          note: "It looks like Cancel. One stray click locks Dana out, and nothing warned you.",
          cost: ["1 click", "0 warnings"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "tint",
          label: "+ tinted red, then a confirm",
          note: "A moderate warning for an action you can undo: tinted red, and a confirm that names Dana.",
          cost: ["2 clicks", "names who"],
        },
      },
    ],
  },
  {
    name: "While it saves",
    prompt: (
      <>
        Saving takes 1.2 seconds, and impatient people click again at 300ms. When should the button
        stop taking clicks and say <b>Saving…</b>?
      </>
    ),
    piece: "disabled · Saving…",
    answer: "now",
    rows: [
      { depth: 0, text: "0 ms", tag: "click" },
      {
        depth: 1,
        slot: {
          id: "now",
          label: "+ right at the click",
          note: "The click lands and the button says so at once. The second click does nothing.",
          cost: ["1 request", "0ms silent"],
        },
      },
      { depth: 0, text: "300 ms", tag: "second click" },
      {
        depth: 1,
        slot: {
          id: "late",
          label: "+ at 400 ms",
          note: "For 400ms it looks idle, so the click at 300ms sends the form twice.",
          cost: ["2 requests", "400ms silent"],
        },
      },
      { depth: 0, text: "1200 ms", tag: "response" },
      {
        depth: 1,
        slot: {
          id: "after",
          label: "+ after the response",
          note: "The whole wait looks like nothing happened, then it jumps straight to Saved.",
          cost: ["2 requests", "1.2s silent"],
        },
      },
    ],
  },
  {
    name: "Less padding",
    prompt: (
      <>
        <code>pl-2 pr-3</code> puts 8px on the left and 12px on the right. Which button in the
        toolbar gets it?
      </>
    ),
    piece: "pl-2 pr-3",
    answer: "lead",
    rows: [
      { depth: 0, text: "<Toolbar>", kind: "comp" },
      {
        depth: 1,
        slot: {
          id: "trail",
          label: "Continue →",
          note: "Its icon is on the right. Trimming the left squeezes the text and leaves the arrow side loose.",
          cost: ["tight on the wrong side"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "lead",
          label: "＋ New project",
          note: "The icon leads, so its side gets less. Its own white space makes up the rest.",
          cost: ["8 | 12px", "looks even"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "only",
          label: "⚙ (icon only)",
          note: "An icon-only button is square, with the same padding on every side.",
          cost: ["not square"],
        },
      },
    ],
  },
  {
    name: "Can't be pressed",
    prompt: (
      <>
        Publish has three moments. Which one gets <code>cursor: not-allowed</code>?
      </>
    ),
    piece: "cursor: not-allowed",
    answer: "off",
    rows: [
      { depth: 0, text: "<PublishButton>", kind: "comp" },
      {
        depth: 1,
        slot: {
          id: "idle",
          label: "+ idle, title filled in",
          note: "It can be pressed, so it keeps the default arrow. The hand is for links.",
          cost: ["says no", "means yes"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "busy",
          label: "+ saving, aria-busy",
          note: "Saving is busy, not refused. cursor: wait says it's working.",
          cost: ["reads as refused"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "off",
          label: "+ disabled, no title yet",
          note: "The no-entry sign as you arrive, and a tooltip that says to add a title first.",
          cost: ["1 reason shown"],
        },
      },
    ],
  },
];

export function ButtonDesign() {
  return (
    <RuleLanding
      className="button-design"
      lead={
        <>
          Six buttons, each built the quick way and the careful way, side by side and live. Hover
          them, press them, tab to them. Then a mini quiz where you put each piece where it belongs.
        </>
      }
      learn={{
        title: "Every press gets an answer",
        intro: (
          <>
            A button promises that something will happen, and its states keep that promise. Each
            example builds the same button twice: on the left the way it often ships, on the right
            the way the rule builds it. They're real, so press them.
          </>
        ),
      }}
      lessons={LESSONS}
      tldr={CHEAT_SHEET}
      quiz={{
        intro: (
          <>
            Five buttons, five layouts. Drag each piece to where it belongs, or tap it and then tap
            a spot. A wrong spot tells you what it would cost.
          </>
        ),
        levels: LEVELS,
        board: "layout",
      }}
      take="build buttons the same way"
    />
  );
}
