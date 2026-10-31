import { ArrowRightIcon, CheckIcon, BellIcon, GearSixIcon, PlusIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import {
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cursors, fonts, motion, palette } from "../../theme.stylex";
import { Kbd, type Lesson, RuleLanding } from "./-components/rule-landing";
import { kit } from "./-components/rule-landing.stylex";
import { button, buttonVariant } from "../../components/button";

const TABLET = "@media (max-width: 820px)";
const PHONE = "@media (max-width: 640px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const TOUCH = "@media (pointer: coarse)";

const stepIn = stylex.keyframes({ from: { opacity: 0, translate: "0 4px" } });
const fade = stylex.keyframes({ from: { opacity: 0 } });
const drain = stylex.keyframes({ to: { transform: "scaleX(0)" } });

const HOLD_MS = 1200;
const UNDO_MS = 5000;

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
    backgroundColor: { default: "var(--face)", ":hover": { default: null, [HOVER]: "var(--lit)" } },
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
    "--c": palette["--no"],
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
    "--face": palette["--soft-key"],
    "--lit": palette["--soft-key-hover"],
    boxShadow: {
      default: `0 4px 0 ${palette["--soft-key-drop"]}`,
      ":active": `0 2px 0 ${palette["--soft-key-drop"]}`,
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
    // Pictures of buttons, so their labels select no more than a real button's do.
    userSelect: "none",
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
  fullRow: {
    gridColumn: "1 / -1",
  },
  slug: {
    display: "flex",
    alignItems: "center",
    outline: { default: null, ":focus-within": `3px solid ${palette["--focus"]}` },
    outlineOffset: { default: null, ":focus-within": "1px" },
  },
  slugBase: {
    color: palette["--mute"],
  },
  slugInput: {
    flex: 1,
    minWidth: 0,
    height: "100%",
    padding: 0,
    borderWidth: 0,
    backgroundColor: "transparent",
    fontWeight: "inherit",
    fontSize: "inherit",
    fontFamily: "inherit",
    color: "inherit",
    outline: "none",
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
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    fontSize: { default: "14px", [TOUCH]: "16px" },
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
  steps: {
    display: "flex",
    gap: "10px",
  },
  formEnd: {
    justifySelf: { default: null, [PHONE]: "start" },
  },
  off: {
    "--face": palette["--soft-key"],
    boxShadow: `0 4px 0 ${palette["--soft-key-drop"]}`,
    color: palette["--dim"],
    cursor: cursors["--cursor-forbid"],
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
    transition: `background-color ${kit["--t-fb"]} ease, border-color ${kit["--t-fb"]} ease`,
  },
  dotOn: {
    borderColor: "var(--c-ink)",
    backgroundColor: "var(--c)",
  },
  project: {
    position: "relative",
    overflow: "hidden",
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
    boxShadow: `0 0 0 1.5px color-mix(in srgb, ${palette["--no"]} 55%, transparent)`,
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
  guards: {
    display: "inline-flex",
    gap: "2px",
    padding: "3px",
    borderRadius: "10px",
    backgroundColor: palette["--panel-2"],
  },
  guard: {
    height: "28px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: 0,
    borderRadius: "7px",
    backgroundColor: "transparent",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--dim"],
    cursor: cursors["--cursor"],
    outline: { default: null, ":focus-visible": `3px solid ${palette["--focus"]}` },
  },
  guardOn: {
    backgroundColor: palette["--panel"],
    boxShadow: `0 1px 0 ${palette["--hair"]}, 0 0 0 1px ${palette["--hair"]}`,
    color: palette["--text"],
  },
  hold: {
    overflow: "hidden",
    isolation: "isolate",
    touchAction: "none",
    userSelect: "none",
    WebkitTouchCallout: "none",
  },
  holdFill: {
    position: "absolute",
    inset: 0,
    zIndex: -1,
    backgroundColor: `color-mix(in srgb, ${palette["--no"]} 34%, transparent)`,
    transformOrigin: "left center",
    transform: "scaleX(0)",
    transition: `transform 200ms ${motion["--out"]}`,
  },
  holdFillOn: {
    transform: "scaleX(1)",
    transition: `transform ${HOLD_MS}ms linear`,
  },
  drain: {
    position: "absolute",
    insetInline: 0,
    bottom: 0,
    height: "3px",
    backgroundColor: palette["--no"],
    transformOrigin: "left center",
    animationName: drain,
    animationDuration: `${UNDO_MS}ms`,
    animationTimingFunction: "linear",
    animationFillMode: "forwards",
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
    color: palette["--no-ink"],
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
    // Room for the rulers under the keys.
    paddingBottom: "26px",
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
  },
  square: {
    "--pl": "0px",
    "--pr": "0px",
    width: "38px",
  },
  // Padding alone sizes the key, the same on every side, so its size follows the icon.
  padded: {
    "--pl": "14px",
    "--pr": "14px",
    height: "auto",
    paddingTop: "14px",
    paddingBottom: "14px",
  },
  dims: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    left: 0,
    fontWeight: 500,
    fontSize: "10px",
    lineHeight: 1,
    fontFamily: fonts["--mono"],
    color: palette["--focus"],
    pointerEvents: "none",
    userSelect: "none",
  },
  // A dimension line: a tick at each end joined by a rule, with its length under it.
  dim: {
    position: "absolute",
    top: 0,
    display: "flex",
    justifyContent: "center",
    paddingTop: "11px",
    whiteSpace: "nowrap",
    backgroundImage:
      "linear-gradient(currentcolor, currentcolor), linear-gradient(currentcolor, currentcolor), linear-gradient(currentcolor, currentcolor)",
    backgroundPosition: "left top, right top, 0 3px",
    backgroundRepeat: "no-repeat",
    backgroundSize: "1px 7px, 1px 7px, 100% 1px",
  },
  dimLeft: {
    left: 0,
    width: "var(--pl)",
  },
  dimRight: {
    right: 0,
    width: "var(--pr)",
  },
  dimAll: {
    right: 0,
    left: 0,
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
};

function StatesDemo({ careful }: { careful: boolean }) {
  return (
    <div {...stylex.props(styles.stage)}>
      <button
        data-hint
        type="button"
        {...stylex.props(styles.key, careful ? styles.live : styles.flat)}
      >
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

/** A slug an older post already holds, so this one can't publish under it. */
const TAKEN = "spring-launch";

function DisabledDemo({ careful }: { careful: boolean }) {
  const [slug, setSlug] = useState(TAKEN);
  const [published, setPublished] = useState(false);
  const [nudged, setNudged] = useState(false);
  const tipId = useId();
  const reason =
    slug.trim() === "" ? "Add a URL first" : slug.trim() === TAKEN ? "That URL is taken" : null;
  const ready = reason === null;

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
      <label {...stylex.props(styles.field, styles.fullRow)}>
        <span>Title</span>
        <input defaultValue="Spring launch" {...stylex.props(styles.input)} />
      </label>
      <label {...stylex.props(styles.field)}>
        <span>URL</span>
        <span {...stylex.props(styles.input, styles.slug)}>
          <span aria-hidden="true" {...stylex.props(styles.slugBase)}>
            /blog/
          </span>
          <input
            value={slug}
            aria-label="URL after /blog/"
            spellCheck={false}
            onChange={(event) => setSlug(event.target.value)}
            {...stylex.props(styles.slugInput)}
          />
        </span>
      </label>
      {careful ? (
        <span {...stylex.props(styles.tip, styles.formEnd)}>
          <button
            data-hint
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
          {reason && (
            <span
              role="tooltip"
              id={tipId}
              {...stylex.props(styles.tooltip, nudged && styles.tooltipOpen)}
            >
              {reason}
            </span>
          )}
        </span>
      ) : (
        <button
          data-hint
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

function StillDemo({ careful }: { careful: boolean }) {
  const tipId = useId();
  return (
    <div {...stylex.props(styles.stage)}>
      <div {...stylex.props(styles.steps)}>
        <span {...stylex.props(styles.tip)}>
          <button
            data-hint
            type="button"
            {...stylex.props(
              styles.key,
              styles.formKey,
              styles.plain,
              !careful && styles.live,
              styles.off,
              stylex.defaultMarker(),
            )}
            aria-disabled="true"
            aria-describedby={tipId}
          >
            Back
          </button>
          <span role="tooltip" id={tipId} {...stylex.props(styles.tooltip)}>
            This is the first step
          </span>
        </span>
        <button type="button" {...stylex.props(styles.key, styles.formKey, styles.live)}>
          Next
        </button>
      </div>
      <small {...stylex.props(styles.small)}>Step 1 of 3</small>
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
      data-hint
      type="button"
      {...stylex.props(button.base, buttonVariant["primary-neutral"], button.sm, styles.toggle)}
      data-toggle={name}
      aria-pressed={on}
      onClick={() => setOn((value) => !value)}
    >
      <span {...stylex.props(styles.dot, on && styles.dotOn)} aria-hidden="true" />
      {label}
    </button>
  );
}

type Step = "idle" | "confirm" | "undo" | "deleted";
type Guard = "confirm" | "hold" | "undo";

const GUARDS: readonly { id: Guard; label: string }[] = [
  { id: "confirm", label: "Confirm" },
  { id: "hold", label: "Hold" },
  { id: "undo", label: "Undo" },
];
const HOLD_KEYS = new Set([" ", "Enter"]);

function DeleteDemo({ careful }: { careful: boolean }) {
  const [step, setStep] = useState<Step>("idle");
  const [guard, setGuard] = useState<Guard>("confirm");
  const [holding, setHolding] = useState(false);
  const moved = useRef(false);
  // The press that finished a hold is still down, and its release would click Reset demo.
  const spent = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);

  function go(next: Step) {
    moved.current = true;
    setStep(next);
  }

  useEffect(() => {
    if (!moved.current) return;
    rootRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [step]);

  useEffect(() => {
    if (!holding) return;
    const id = setTimeout(() => {
      spent.current = true;
      setHolding(false);
      go("deleted");
    }, HOLD_MS);
    return () => clearTimeout(id);
  }, [holding]);

  useEffect(() => {
    if (step !== "undo") return;
    const id = setTimeout(() => go("deleted"), UNDO_MS);
    return () => clearTimeout(id);
  }, [step]);

  const held = careful && guard === "hold";
  const press = held
    ? {
        onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setHolding(true);
        },
        onPointerUp: () => setHolding(false),
        onPointerCancel: () => setHolding(false),
        onContextMenu: (event: MouseEvent) => event.preventDefault(),
        onKeyDown: (event: KeyboardEvent) => {
          if (!HOLD_KEYS.has(event.key)) return;
          event.preventDefault();
          if (!event.repeat) setHolding(true);
        },
        onKeyUp: (event: KeyboardEvent) => HOLD_KEYS.has(event.key) && setHolding(false),
        onBlur: () => setHolding(false),
      }
    : { onClick: () => go(!careful ? "deleted" : guard === "confirm" ? "confirm" : "undo") };

  const release = () => {
    if (spent.current) setTimeout(() => (spent.current = false));
  };

  const key = [styles.key, styles.sm, styles.live];
  const copy = stylex.props(styles.projectCopy, styles.stepIn);
  return (
    <div
      ref={rootRef}
      onClickCapture={(event) => {
        if (!spent.current) return;
        event.preventDefault();
        event.stopPropagation();
      }}
      onPointerUpCapture={release}
      onKeyUpCapture={release}
      {...stylex.props(styles.stage)}
    >
      {careful && (
        <div role="group" aria-label="Guard" {...stylex.props(styles.guards)}>
          {GUARDS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={guard === id}
              onClick={() => {
                moved.current = false;
                setGuard(id);
                setHolding(false);
                setStep("idle");
              }}
              {...stylex.props(styles.guard, guard === id && styles.guardOn)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <div
        {...stylex.props(
          styles.project,
          step === "confirm" && styles.confirm,
          (step === "deleted" || step === "undo") && styles.deleted,
        )}
      >
        {step === "deleted" ? (
          <>
            <span {...copy}>
              <b {...stylex.props(styles.projectName, styles.projectGone)}>Moonbase deleted</b>
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
        ) : step === "undo" ? (
          <>
            <span {...copy}>
              <b {...stylex.props(styles.projectName, styles.projectGone)}>Moonbase deleted</b>
              <small {...stylex.props(styles.projectMeta)}>Undo within 5 seconds</small>
            </span>
            <button
              type="button"
              {...stylex.props(key, styles.text, styles.stepIn)}
              data-autofocus
              onClick={() => go("idle")}
            >
              Undo
            </button>
            <span aria-hidden="true" {...stylex.props(styles.drain)} />
          </>
        ) : step === "confirm" ? (
          <>
            <span {...copy}>
              <b {...stylex.props(styles.projectName)}>Delete Moonbase?</b>
              <small {...stylex.props(styles.projectMeta)}>
                Its 214 files go too. You can't undo this.
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
              data-hint
              type="button"
              {...stylex.props(key, styles.red, styles.tint, held && styles.hold, styles.stepIn)}
              data-autofocus
              {...press}
            >
              {held && (
                <span
                  aria-hidden="true"
                  {...stylex.props(styles.holdFill, holding && styles.holdFillOn)}
                />
              )}
              {held ? "Hold to delete" : "Delete project"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** Dimension lines under a key: its two paddings, or its whole width. */
function Ruler({ pads, width }: { pads?: [left: number, right: number]; width?: number }) {
  return (
    <span aria-hidden="true" {...stylex.props(styles.dims)}>
      {pads ? (
        <>
          <span {...stylex.props(styles.dim, styles.dimLeft)}>{pads[0]}</span>
          <span {...stylex.props(styles.dim, styles.dimRight)}>{pads[1]}</span>
        </>
      ) : (
        <span {...stylex.props(styles.dim, styles.dimAll)}>{width}</span>
      )}
    </span>
  );
}

function IconsDemo({ careful }: { careful: boolean }) {
  const key = [styles.key, styles.sm, styles.live];
  const pad = [styles.pads, !careful && styles.even];
  const near = careful ? 12 : 16;
  return (
    <div {...stylex.props(styles.stage, styles.icons)}>
      <button type="button" {...stylex.props(key, styles.tint, styles.lead, pad)} data-pad="lead">
        <PlusIcon weight="bold" aria-hidden="true" {...stylex.props(styles.icon)} />
        New project
        <Ruler pads={[near, 16]} />
      </button>
      <button type="button" {...stylex.props(key, styles.trail, pad)} data-pad="trail">
        Continue
        <ArrowRightIcon weight="bold" aria-hidden="true" {...stylex.props(styles.icon)} />
        <Ruler pads={[16, near]} />
      </button>
    </div>
  );
}

const TOOLS = [
  { label: "Settings", Icon: GearSixIcon },
  { label: "Notifications", Icon: BellIcon },
];

function IconKeysDemo({ careful }: { careful: boolean }) {
  const tipId = useId();
  const key = [styles.key, styles.sm, styles.live, styles.plain];
  return (
    <div {...stylex.props(styles.stage, styles.icons)}>
      {TOOLS.map(({ label, Icon }, at) =>
        careful ? (
          <span key={label} {...stylex.props(styles.tip)}>
            <button
              type="button"
              {...stylex.props(key, styles.square, stylex.defaultMarker())}
              data-hint={at === 0 || undefined}
              aria-label={label}
              aria-describedby={`${tipId}-${label}`}
            >
              <Icon weight="bold" aria-hidden="true" {...stylex.props(styles.icon)} />
              <Ruler width={38} />
            </button>
            <span role="tooltip" id={`${tipId}-${label}`} {...stylex.props(styles.tooltip)}>
              {label}
            </span>
          </span>
        ) : (
          <button
            key={label}
            type="button"
            data-hint={at === 0 || undefined}
            {...stylex.props(key, styles.padded)}
            aria-label={label}
          >
            <Icon weight="bold" aria-hidden="true" {...stylex.props(styles.icon)} />
            <Ruler pads={[14, 14]} />
          </button>
        ),
      )}
    </div>
  );
}

export const LESSONS: Lesson[] = [
  {
    title: "Give every state a look",
    body: (
      <>
        Give hover, press and focus a look. If nothing changes, a click feels like it missed and a
        keyboard user can't see where they are. Hover both, press both, then <Kbd>Tab</Kbd> to them.
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
    levels: [
      {
        name: "Where am I?",
        prompt: (
          <>
            Mia uses only the keyboard. She presses <Kbd>Tab</Kbd> to reach <b>Save</b>. Place the
            look she needs to see where she is.
          </>
        ),
        piece: "a visible change",
        answer: "focus",
        rows: [
          { depth: 0, text: "Save button", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "hover",
              label: "+ on hover",
              note: "Hover needs a mouse. Mia never hovers, so she still can't tell where she is.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "press",
              label: "+ on press",
              note: "Press comes after she has found the button. She needs to see where she is before she presses Enter.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "focus",
              label: "+ on focus",
              note: "Focus is where the keyboard is. Give it a look, and every Tab lands somewhere she can see.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Say why it's off",
    body: (
      <>
        A disabled button that only fades leaves people guessing, most of all when the form looks
        done. Show the no-entry cursor, keep the label readable, and put the reason in a tooltip.
        Find out why Publish is off in both, then fix it.
      </>
    ),
    bad: {
      label: "Just faded",
      costs: ["0 reasons", "1.6:1 contrast", "hand cursor"],
      view: <DisabledDemo careful={false} />,
    },
    good: {
      label: "Say why",
      costs: ["1 reason", "6.4:1 contrast", "cursor: not-allowed"],
      view: <DisabledDemo careful />,
    },
    levels: [
      {
        name: "Can't be pressed",
        prompt: (
          <>
            Publish stays off because an older post already uses this URL. Nothing else on screen
            says so. Pick how Publish looks when someone hovers it.
          </>
        ),
        piece: "disabled Publish",
        answer: "say",
        rows: [
          { depth: 0, text: "Post editor", kind: "comp" },
          { depth: 1, text: "Title", tag: "filled" },
          { depth: 1, text: "URL", tag: "taken" },
          {
            depth: 1,
            slot: {
              id: "fade",
              label: "+ faded to 40%, nothing else",
              note: "Fading says no, but not why. The form looks done, so they're left guessing.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "hide",
              label: "+ hidden until it works",
              note: "They can't find Publish at all, let alone learn the URL is taken.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "say",
              label: "+ readable, tooltip: That URL is taken",
              note: "Keep the label readable and say why on hover, so they know to change the URL.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Keep a disabled button still on hover",
    body: (
      <>
        A disabled button that lights up on hover says yes while its cursor says no, so people click
        and nothing happens. Keep its colour and its drop still on hover and press, and let the
        tooltip do the talking. Hover Back in both.
      </>
    ),
    bad: {
      label: "Lights up",
      costs: ["lights on hover", "dips on press"],
      view: <StillDemo careful={false} />,
    },
    good: {
      label: "Stays still",
      costs: ["0 changes on hover", "tooltip only"],
      view: <StillDemo careful />,
    },
    levels: [
      {
        name: "Page 1 of 5",
        prompt: (
          <>
            A pager sits on page 1 of 5, so <b>Previous</b> is disabled. Place the hover look on the
            control a click can act on.
          </>
        ),
        piece: "lights up on hover",
        answer: "next",
        rows: [
          { depth: 0, text: "Pager", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "prev",
              label: "+ Previous, disabled",
              note: "There's no page before 1. Lighting it up invites a click that does nothing.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "current",
              label: "+ 1, the current page",
              note: "They're already on page 1, so a click there goes nowhere either.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "next",
              label: "+ Next",
              note: "Next can act, so it lights up. The disabled one stays still, and the difference shows which works.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Fill one button per screen",
    body: (
      <>
        Visual weight shows people the next step. Fill the main action in the brand colour, tint the
        supporting one, and leave Cancel as text. Keep red for destructive actions.
      </>
    ),
    extra: <LessonToggle label="Squint" name="squint" />,
    bad: {
      label: "All filled",
      costs: ["3 filled", "red Publish"],
      view: <HierarchyDemo careful={false} />,
    },
    good: {
      label: "Fill, tint, text",
      costs: ["1 filled", "1 next step"],
      view: <HierarchyDemo careful />,
    },
    levels: [
      {
        name: "The one next step",
        prompt: (
          <>
            A cart has three actions. <b>Continue shopping</b> is text and <b>Edit cart</b> is
            tinted. Style <b>Checkout</b>.
          </>
        ),
        piece: "Checkout",
        answer: "brand",
        rows: [
          { depth: 0, text: "Cart footer", kind: "comp" },
          { depth: 1, text: "Continue shopping", tag: "text" },
          { depth: 1, text: "Edit cart", tag: "tinted" },
          {
            depth: 1,
            slot: {
              id: "tint",
              label: "+ tinted, like Edit cart",
              note: "Checkout now weighs the same as Edit cart, so nothing says which one finishes the order.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "red",
              label: "+ filled red",
              note: "Red reads as danger. People pause on the one button you want them to press.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "brand",
              label: "+ filled, brand colour",
              note: "Fill one button in the brand colour to mark the step that finishes the job.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Guard the destructive action",
    body: (
      <>
        Never let one stray click delete anything. Confirm with a red button that names what goes,
        ask people to hold the button down, or delete at once and offer Undo. Try all three.
      </>
    ),
    bad: {
      label: "One click",
      costs: ["1 click", "0 warnings"],
      view: <DeleteDemo careful={false} />,
    },
    good: {
      label: "Guard it",
      costs: ["3 guards", "0 stray deletes"],
      view: <DeleteDemo careful />,
    },
    levels: [
      {
        name: "Worth a confirm",
        prompt: (
          <>
            A project page has three actions. Place the confirm on the one a stray click would make
            you regret.
          </>
        ),
        piece: "Are you sure?",
        answer: "delete",
        rows: [
          { depth: 0, text: "Project page", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "rename",
              label: "+ Rename",
              note: "A rename loses nothing, and you can rename it back. A confirm only slows people down.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "archive",
              label: "+ Archive, undo any time",
              note: "Archive comes back in one click. Offer Undo after, rather than asking first.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "delete",
              label: "+ Delete, 214 files for good",
              note: "Nothing brings these back. Ask first, name what goes, and land focus on Cancel.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Pad the icon side less",
    body: (
      <>
        Take 4px off the icon's side. An icon has white space inside its own box, so equal padding
        makes that side look wider.
      </>
    ),
    extra: <LessonToggle label="Show padding" name="pads" />,
    bad: {
      label: "Even padding",
      costs: ["16 | 16px", "icon side looks wider"],
      view: <IconsDemo careful={false} />,
    },
    good: {
      label: "Optical padding",
      costs: ["12 | 16px", "looks even"],
      view: <IconsDemo careful />,
    },
    levels: [
      {
        name: "Less padding",
        prompt: (
          <>
            Every button in this toolbar has the same padding on both sides. Place the trim on the
            one that will look lopsided.
          </>
        ),
        piece: "trim the icon side",
        answer: "lead",
        rows: [
          { depth: 0, text: "Toolbar", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "text",
              label: "Save (text only)",
              note: "With no icon, there's no hidden white space. Even padding already looks even.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "lead",
              label: "＋ New project",
              note: "Trim the icon's side. The icon's own white space makes up the rest.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "only",
              label: "⚙ (icon only)",
              note: "There's no text to balance against. Make it a square instead.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Fix the size of an icon-only button",
    body: (
      <>
        With no label, padding sets the size, so the button misses its neighbours' height and
        changes with every icon. Make it a fixed square as tall as its neighbours, and centre the
        icon. With no text to read, give it an accessible name and a tooltip.
      </>
    ),
    bad: {
      label: "Sized by padding",
      costs: ["44 × 44", "no tooltip"],
      view: <IconKeysDemo careful={false} />,
    },
    good: {
      label: "Fixed square",
      costs: ["38 × 38", "named + tooltip"],
      view: <IconKeysDemo careful />,
    },
    levels: [
      {
        name: "Three icons",
        prompt: (
          <>
            A toolbar has three icon-only buttons with the same padding. They come out 38, 42 and
            46px wide. Place the fix.
          </>
        ),
        piece: "one size for all",
        answer: "square",
        rows: [
          { depth: 0, text: "Toolbar", kind: "comp" },
          { depth: 1, text: "⚙  ✎  ⋯", tag: "38 · 42 · 46px" },
          {
            depth: 1,
            slot: {
              id: "pad",
              label: "+ less padding on all three",
              note: "They're still sized by each icon, just smaller. They still come out three widths.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "redraw",
              label: "+ icons redrawn to one width",
              note: "It holds until the next icon. The size still depends on what's inside.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "square",
              label: "+ a fixed square, icon centred",
              note: "Fix the box, not the padding. Every icon gets the same square, the next one too.",
            },
          },
        ],
      },
    ],
  },
];

export const TLDR = [
  ["Any button", "Give hover, press and focus a look, in 100 to 200ms"],
  ["Not available yet", "Show the no-entry cursor and a tooltip that says why"],
  ["Hovering a disabled button", "Keep its colour and drop still"],
  ["Picking a variant", "Fill one per screen, tint the secondary, make Cancel text"],
  ["It deletes something", "Make it red, then confirm by name, hold, or offer Undo"],
  ["An icon beside the label", "Take 4px off the icon's side"],
  ["An icon with no label", "Make it a fixed square with an accessible name and a tooltip"],
] as const;

export function ButtonDesign() {
  return (
    <RuleLanding
      lead={<>Style every state, say why it's off, and guard anything destructive.</>}
      learn={{
        title: "Answer every press",
        intro: <>Give each state and refusal a visible change, so no press feels lost.</>,
      }}
      lessons={LESSONS}
      tldr={TLDR}
      board="layout"
      take="build buttons the same way"
    />
  );
}
