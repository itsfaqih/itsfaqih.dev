import { SpeakerHighIcon, XIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import {
  type ComponentProps,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { reducedMotion } from "../../hooks/use-media-query";
import { cursors, fonts, motion, palette } from "../../theme.stylex";
import { Kbd, type Lesson, onceOnScreen, RuleLanding, Tip } from "./-components/rule-landing";
import { kit } from "./-components/rule-landing.stylex";

const PHONE = "@media (max-width: 640px)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";
const HOVER = "@media (hover: hover) and (pointer: fine)";
const TOUCH = "@media (pointer: coarse)";
const LIGHT = ":is(.light *)";

const ringIn = stylex.keyframes({
  from: { opacity: 0, transform: "scale(1.12)" },
});

const styles = stylex.create({
  stage: {
    display: "grid",
    gap: "12px",
    alignContent: "start",
  },
  screen: {
    position: "relative",
    isolation: "isolate",
    overflow: "hidden",
    height: "260px",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
    fontWeight: 500,
    fontSize: "13px",
    lineHeight: 1.35,
    fontFamily: fonts["--sans"],
    color: palette["--text"],
  },
  page: {
    display: "grid",
    gap: "12px",
    alignContent: "start",
    height: "100%",
    paddingBlock: { default: "14px", [PHONE]: "12px" },
    paddingInline: { default: "14px", [PHONE]: "12px" },
  },
  checkout: {
    gridTemplateRows: "auto auto 1fr",
  },
  spread: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "20px",
    height: "20px",
    borderRadius: "6px",
    backgroundColor: "var(--c)",
  },
  ghost: {
    display: "block",
    width: "var(--w, 60%)",
    height: "8px",
    borderRadius: "4px",
    backgroundColor: `color-mix(in srgb, ${palette["--text"]} 12%, transparent)`,
  },
  card: {
    display: "grid",
    gap: "10px",
    paddingBlock: "12px",
    paddingInline: "12px",
    borderRadius: "10px",
    backgroundColor: palette["--panel-2"],
  },
  gone: {
    backgroundColor: `color-mix(in srgb, ${kit["--no"]} 14%, ${palette["--panel-2"]})`,
  },
  strong: {
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  },
  goneName: {
    color: kit["--no-ink"],
  },
  price: {
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--dim"],
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  pay: {
    alignSelf: "end",
    justifyContent: "flex-end",
  },
  link: {
    justifySelf: "start",
    marginBlock: "-4px",
    marginInline: "-6px",
    paddingBlock: "6px",
    paddingInline: "6px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    backgroundColor: "transparent",
    backgroundImage: "none",
    backgroundPosition: "0px 0px",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    textDecorationLine: "underline",
    textUnderlineOffset: "3px",
    color: palette["--dim"],
    cursor: cursors["--cursor-point"],
  },
  pill: {
    height: "26px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "13px",
    backgroundColor: "color-mix(in srgb, var(--c) 18%, transparent)",
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: "var(--c-ink)",
    cursor: cursors["--cursor-point"],
  },
  mail: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    height: "22px",
  },
  dot: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "var(--c)",
  },
  tag: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "30px",
    height: "14px",
    borderRadius: "7px",
    backgroundColor: "color-mix(in srgb, var(--c) 30%, transparent)",
  },
  project: {
    display: "grid",
    gap: "2px",
    minWidth: 0,
  },
  meta: {
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
  },
  article: {
    overflowY: "auto",
    overscrollBehavior: "contain",
    scrollbarGutter: "stable",
    scrollbarWidth: "thin",
  },
  locked: {
    overflowY: "hidden",
  },
  para: {
    display: "grid",
    gap: "7px",
  },
  figure: {
    height: "64px",
    marginBottom: "4px",
    borderRadius: "8px",
    backgroundColor: `color-mix(in srgb, var(--c) 16%, ${palette["--panel-2"]})`,
  },
  scrim: {
    position: "absolute",
    zIndex: 2,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: { default: "rgb(6 6 10 / 0.55)", [LIGHT]: "rgb(20 20 30 / 0.32)" },
    opacity: 0,
    pointerEvents: "none",
    transition: `opacity 180ms ${motion["--out"]}`,
  },
  scrimTop: {
    zIndex: 5,
  },
  scrimOn: {
    opacity: 1,
    pointerEvents: "auto",
  },
  dialog: {
    position: "absolute",
    zIndex: 4,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: "grid",
    gap: "10px",
    width: "min(300px, 100% - 24px)",
    height: "fit-content",
    marginBlock: "auto",
    marginInline: "auto",
    paddingBlock: { default: "14px", [PHONE]: "12px" },
    paddingInline: { default: "14px", [PHONE]: "12px" },
    borderRadius: "14px",
    backgroundColor: palette["--panel"],
    boxShadow: `0 0 0 1px ${palette["--hair"]}, 0 14px 32px rgb(0 0 0 / 0.35)`,
    opacity: 0,
    visibility: "hidden",
    transform: { default: "translateY(8px) scale(0.97)", [REDUCE]: "none" },
    transition: "opacity 140ms ease, transform 140ms ease, visibility 0s 140ms",
  },
  dialogTop: {
    zIndex: 6,
    width: "min(270px, 100% - 40px)",
  },
  dialogOpen: {
    opacity: 1,
    // inherit, not visible: on a phone the hidden pane must keep its open dialog hidden too.
    visibility: "inherit",
    transform: "none",
    transition: `opacity 200ms ${motion["--out"]}, transform 240ms ${motion["--out"]}, visibility 0s`,
  },
  head: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "28px",
  },
  title: {
    textWrap: "pretty",
    marginBlock: 0,
    marginInline: 0,
    fontWeight: 700,
    fontSize: "15px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  },
  body: {
    textWrap: "pretty",
    marginTop: "-4px",
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
    fontSize: "12.5px",
    lineHeight: 1.45,
    color: palette["--dim"],
  },
  field: {
    display: "grid",
    gap: "5px",
    outline: { default: null, ":focus-visible": "none" },
  },
  label: {
    fontWeight: 600,
    fontSize: "11.5px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--dim"],
  },
  inputWrap: {
    position: "relative",
    display: "block",
  },
  input: {
    width: "100%",
    height: "34px",
    paddingBlock: 0,
    paddingInline: "10px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: palette["--hair"],
    borderRadius: "8px",
    backgroundColor: palette["--bg"],
    fontWeight: 500,
    // Under 16px, iOS zooms the page in on focus and leaves it zoomed.
    fontSize: { default: "13px", [TOUCH]: "16px" },
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
    "::placeholder": {
      color: palette["--mute"],
    },
  },
  acts: {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
  },
  share: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  url: {
    overflow: "hidden",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: 0,
    height: "32px",
    paddingBlock: 0,
    paddingInline: "10px",
    borderRadius: "8px",
    backgroundColor: palette["--panel-2"],
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "32px",
    fontFamily: fonts["--mono"],
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    color: palette["--dim"],
  },
  btn: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    height: "32px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "9px",
    backgroundColor: "var(--c)",
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    whiteSpace: "nowrap",
    color: "var(--on-c)",
    cursor: cursors["--cursor-point"],
  },
  soft: {
    backgroundColor: {
      default: palette["--panel"],
      ":hover": { default: null, [HOVER]: palette["--soft-hover"] },
      ":active": palette["--soft-hover"],
    },
    boxShadow: `inset 0 0 0 1px ${palette["--hair"]}`,
    color: palette["--text"],
  },
  softInCard: {
    backgroundColor: {
      default: palette["--bg"],
      ":hover": { default: null, [HOVER]: palette["--soft-hover"] },
      ":active": palette["--soft-hover"],
    },
  },
  plain: {
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [HOVER]: palette["--soft-hover"] },
      ":active": palette["--soft-hover"],
    },
    backgroundPosition: {
      default: "0px 0px",
      ":hover": { default: null, [HOVER]: "initial" },
      ":active": "initial",
    },
    color: palette["--text"],
  },
  red: {
    "--c": kit["--no"],
  },
  redTint: {
    backgroundColor: `color-mix(in srgb, ${kit["--no"]} 16%, transparent)`,
    color: kit["--no-ink"],
  },
  close: {
    display: "grid",
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    placeItems: "center",
    width: "28px",
    height: "28px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "8px",
    backgroundColor: {
      default: "transparent",
      ":hover": { default: null, [HOVER]: palette["--soft-hover"] },
      ":active": palette["--soft-hover"],
    },
    backgroundPosition: {
      default: "0px 0px",
      ":hover": { default: null, [HOVER]: "initial" },
      ":active": "initial",
    },
    color: palette["--dim"],
    cursor: cursors["--cursor-point"],
  },
  closeIcon: {
    width: "14px",
    height: "14px",
  },
  // Every focus stop in the window: the demo draws its own ring, so the browser's stays off.
  stop: {
    position: "relative",
    outline: { default: null, ":focus-visible": "none" },
  },
  ring: {
    "::after": {
      content: '""',
      position: "absolute",
      top: "-4px",
      right: "-4px",
      bottom: "-4px",
      left: "-4px",
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: palette["--focus"],
      borderRadius: "12px",
      pointerEvents: "none",
      animationName: { default: ringIn, [REDUCE]: "none" },
      animationDuration: { default: "220ms", [REDUCE]: "0s" },
      animationTimingFunction: { default: motion["--out"], [REDUCE]: "ease" },
    },
  },
  ringBehind: {
    zIndex: 3,
    "::after": {
      borderStyle: "dashed",
      borderColor: kit["--no"],
    },
  },
  bar: {
    display: "flex",
    flexWrap: "wrap",
    rowGap: "8px",
    columnGap: "12px",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "34px",
  },
  keys: {
    display: "flex",
    gap: "6px",
  },
  key: {
    minWidth: "46px",
    height: "30px",
    paddingBlock: 0,
    paddingInline: "10px",
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
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    cursor: cursors["--cursor-point"],
    transform: {
      default: null,
      ":active": { default: "translateY(2px)", [REDUCE]: "none" },
    },
    outlineWidth: { default: null, ":focus-visible": "2px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "2px" },
    transition: `transform 120ms ${motion["--out"]}, box-shadow 120ms ${motion["--out"]}`,
  },
  read: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "140px",
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: 1.4,
    fontFamily: fonts["--mono"],
    textAlign: "right",
    color: palette["--dim"],
  },
  readNo: {
    color: kit["--no-ink"],
  },
  readYes: {
    color: kit["--yes-ink"],
  },
  speech: {
    display: "inline-flex",
    gap: "6px",
    alignItems: "baseline",
    textAlign: "left",
  },
  speaker: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "13px",
    height: "13px",
    translate: "0 2px",
  },
});

function useWindowFocus() {
  const ref = useRef<HTMLDivElement>(null);
  const atRef = useRef<string | null>(null);
  const pending = useRef(false);
  const [focus, setFocus] = useState<{ at: string | null }>({ at: null });

  useLayoutEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    if (focus.at) find(focus.at)?.focus({ preventScroll: true });
  });

  function find(stop: string) {
    return ref.current?.querySelector<HTMLElement>(`[data-stop="${stop}"]`) ?? null;
  }

  function move(stop: string | null, real: boolean) {
    atRef.current = stop;
    pending.current = real;
    setFocus({ at: stop });
  }

  function next(within: HTMLElement | null, back: boolean) {
    const stops = [...(ref.current?.querySelectorAll<HTMLElement>("[data-stop]") ?? [])].filter(
      (element) => !element.closest("[inert]") && (!within || within.contains(element)),
    );
    if (stops.length === 0) return null;
    const now = stops.findIndex((element) => element.dataset.stop === atRef.current);
    const to =
      now === -1
        ? back
          ? stops.length - 1
          : 0
        : (now + (back ? -1 : 1) + stops.length) % stops.length;
    return stops[to]?.dataset.stop ?? null;
  }

  function onFocus(event: FocusEvent<HTMLDivElement>) {
    const stop =
      event.target instanceof HTMLElement
        ? event.target.closest<HTMLElement>("[data-stop]")?.dataset.stop
        : undefined;
    if (!stop || stop === atRef.current) return;
    atRef.current = stop;
    setFocus({ at: stop });
  }

  /** `behind` marks a stop on the page while the dialog is open. */
  function stop(
    name: string,
    style: stylex.StyleXArray<stylex.CompiledStyles | false>,
    behind = false,
  ) {
    const at = focus.at === name;
    return {
      "data-stop": name,
      ...stylex.props(styles.stop, style, at && styles.ring, at && behind && styles.ringBehind),
    };
  }

  return { ref, at: focus.at, find, move, next, onFocus, stop };
}

type WindowFocus = ReturnType<typeof useWindowFocus>;

type ScreenProps = {
  focus: WindowFocus;
  open: boolean;
  page: ReactNode;
  children: ReactNode;
  onScrim?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
};

function Screen({ focus, open, page, children, onScrim, onKeyDown }: ScreenProps) {
  return (
    <div
      ref={focus.ref}
      onFocus={focus.onFocus}
      onKeyDown={onKeyDown}
      {...stylex.props(styles.screen)}
    >
      {page}
      <div
        aria-hidden="true"
        onClick={onScrim}
        {...stylex.props(styles.scrim, open && styles.scrimOn)}
      />
      {children}
    </div>
  );
}

type DialogProps = {
  open: boolean;
  title: string;
  body?: ReactNode;
  children: ReactNode;
  close?: ReactNode;
  bare?: boolean;
  held?: boolean;
  top?: boolean;
  ref?: Ref<HTMLDivElement>;
};

/** Labelled by its title and described by its body. No aria-modal: inside a pane it would tell a
 * screen reader the real page is gone. */
function Dialog({ open, title, body, children, close, bare, held, top, ref }: DialogProps) {
  const id = useId();
  return (
    <div
      ref={ref}
      role={bare ? undefined : "dialog"}
      aria-labelledby={bare ? undefined : `${id}t`}
      aria-describedby={bare || !body ? undefined : `${id}d`}
      inert={!open || held}
      {...stylex.props(styles.dialog, top && styles.dialogTop, open && styles.dialogOpen)}
    >
      <div {...stylex.props(styles.head)}>
        <p id={`${id}t`} {...stylex.props(styles.title)}>
          {title}
        </p>
        {close}
      </div>
      {body && (
        <p id={`${id}d`} {...stylex.props(styles.body)}>
          {body}
        </p>
      )}
      {children}
    </div>
  );
}

type CloseProps = { focus: WindowFocus; onClose: () => void };

function CloseX({ focus, onClose }: CloseProps) {
  return (
    <button type="button" aria-label="Close" {...focus.stop("x", styles.close)} onClick={onClose}>
      <XIcon weight="bold" aria-hidden="true" {...stylex.props(styles.closeIcon)} />
    </button>
  );
}

type FieldProps = { focus: WindowFocus; name: string; label: string } & ComponentProps<"input">;

function Field({ focus, name, label, ...input }: FieldProps) {
  return (
    <label {...stylex.props(styles.field)}>
      <span {...stylex.props(styles.label)}>{label}</span>
      <span {...stylex.props(styles.inputWrap, focus.at === name && styles.ring)}>
        <input {...input} data-stop={name} {...stylex.props(styles.stop, styles.input)} />
      </span>
    </label>
  );
}

function Key({
  children,
  onPress,
  hint,
}: {
  children: ReactNode;
  onPress: () => void;
  hint?: boolean;
}) {
  return (
    <button
      type="button"
      data-hint={hint || undefined}
      {...stylex.props(styles.key)}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onPress}
    >
      {children}
    </button>
  );
}

type StageProps = {
  stageRef?: RefObject<HTMLDivElement | null>;
  keys: ReactNode;
  read: ReactNode;
  tone?: "no" | "yes";
  children: ReactNode;
};

function Stage({ stageRef, keys, read, tone, children }: StageProps) {
  return (
    <div ref={stageRef} {...stylex.props(styles.stage)}>
      {children}
      <div {...stylex.props(styles.bar)}>
        <span {...stylex.props(styles.keys)}>{keys}</span>
        <span
          aria-live="polite"
          {...stylex.props(
            styles.read,
            tone === "no" && styles.readNo,
            tone === "yes" && styles.readYes,
          )}
        >
          {read}
        </span>
      </div>
    </div>
  );
}

const PROFILE_STOPS = new Map([
  ["trigger", "Edit profile"],
  ["pay", "Pay now"],
  ["help", "Help"],
  ["name", "Name"],
  ["cancel", "Cancel"],
  ["save", "Save"],
]);
const IN_PROFILE = ["name", "cancel", "save"];
const WALK_START = 500;
const WALK_STEP = 600;
const WALK_PRESSES = 7;

function FocusDemo({ sealed }: { sealed: boolean }) {
  const focus = useWindowFocus();
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const [open, setOpen] = useState(false);

  function show(real: boolean) {
    setOpen(true);
    focus.move(sealed ? "name" : "trigger", real);
  }

  function hide() {
    setOpen(false);
    const stays = focus.at !== null && !IN_PROFILE.includes(focus.at) ? focus.at : null;
    focus.move(sealed ? "trigger" : stays, true);
  }

  function tab(real: boolean, back = false) {
    focus.move(focus.next(sealed && open ? dialogRef.current : null, back), real);
  }

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || reducedMotion()) return;
    const timers: number[] = [];
    const later = (at: number, step: () => void) =>
      timers.push(
        window.setTimeout(() => {
          if (!touched.current) step();
        }, at),
      );
    const stop = onceOnScreen(stage, () => {
      later(WALK_START, () => show(false));
      for (let press = 1; press <= WALK_PRESSES; press++) {
        later(WALK_START + press * WALK_STEP, () => tab(false));
      }
    });
    return () => {
      stop();
      for (const timer of timers) clearTimeout(timer);
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!open) return;
    if (event.key === "Escape") hide();
    if (event.key === "Tab" && sealed) {
      event.preventDefault();
      tab(true, event.shiftKey);
    }
  }

  const behind = open && focus.at !== null && !IN_PROFILE.includes(focus.at);
  const where = (focus.at && PROFILE_STOPS.get(focus.at)) ?? "<body>";

  return (
    <div
      onPointerDownCapture={() => (touched.current = true)}
      onKeyDownCapture={() => (touched.current = true)}
    >
      <Stage
        stageRef={stageRef}
        keys={
          <>
            <Key hint onPress={() => tab(true)}>
              Tab
            </Key>
            <Key onPress={() => open && hide()}>Esc</Key>
          </>
        }
        read={
          <>
            Focus: {where}
            {behind && ", behind"}
          </>
        }
        tone={behind || (open && !focus.at) ? "no" : undefined}
      >
        <Screen
          focus={focus}
          open={open}
          onKeyDown={onKeyDown}
          page={
            <div inert={sealed && open} {...stylex.props(styles.page, styles.checkout)}>
              <div {...stylex.props(styles.spread)}>
                <span {...stylex.props(styles.logo)} />
                <button type="button" {...focus.stop("help", styles.link, open)}>
                  Help
                </button>
              </div>
              <div {...stylex.props(styles.card)}>
                <div {...stylex.props(styles.spread)}>
                  <b {...stylex.props(styles.strong)}>Order #2041</b>
                  <span {...stylex.props(styles.price)}>$86.00</span>
                </div>
                <span style={{ "--w": "70%" }} {...stylex.props(styles.ghost)} />
                <span style={{ "--w": "48%" }} {...stylex.props(styles.ghost)} />
              </div>
              <div {...stylex.props(styles.row, styles.pay)}>
                <button
                  type="button"
                  {...focus.stop("trigger", [styles.btn, styles.soft], open)}
                  onClick={() => show(true)}
                >
                  Edit profile
                </button>
                <button type="button" {...focus.stop("pay", styles.btn, open)}>
                  Pay now
                </button>
              </div>
            </div>
          }
        >
          <Dialog ref={dialogRef} open={open} title="Edit profile">
            <Field focus={focus} name="name" label="Name" defaultValue="Ada Lovelace" />
            <div {...stylex.props(styles.acts)}>
              <button
                type="button"
                {...focus.stop("cancel", [styles.btn, styles.plain])}
                onClick={hide}
              >
                Cancel
              </button>
              <button type="button" {...focus.stop("save", styles.btn)} onClick={hide}>
                Save
              </button>
            </div>
          </Dialog>
        </Screen>
      </Stage>
    </div>
  );
}

function EscapeDemo({ sealed }: { sealed: boolean }) {
  const focus = useWindowFocus();
  const [open, setOpen] = useState(false);
  const [said, setSaid] = useState("Open What's new, then press Esc");
  const [ignored, setIgnored] = useState(0);

  function show() {
    setOpen(true);
    focus.move("ok", true);
  }

  function close(how: string) {
    setOpen(false);
    setSaid(`Closed by ${how}`);
    focus.move("trigger", true);
  }

  function refuse(what: string) {
    setIgnored(ignored + 1);
    setSaid(`${what} ignored, ${ignored + 1}×`);
  }

  function escape() {
    if (!open) return;
    if (sealed) close("Esc");
    else refuse("Esc");
  }

  return (
    <Stage
      keys={<Key onPress={escape}>Esc</Key>}
      read={said}
      tone={ignored > 0 && open ? "no" : undefined}
    >
      <Screen
        focus={focus}
        open={open}
        onKeyDown={(event) => event.key === "Escape" && escape()}
        onScrim={() => (sealed ? close("a click outside") : refuse("Click outside"))}
        page={
          <div inert={open} {...stylex.props(styles.page)}>
            <div {...stylex.props(styles.spread)}>
              <span {...stylex.props(styles.logo)} />
              <button
                data-hint
                type="button"
                {...focus.stop("trigger", styles.pill, open)}
                onClick={show}
              >
                What's new
              </button>
            </div>
            {[72, 54, 64, 46].map((width) => (
              <div key={width} {...stylex.props(styles.mail)}>
                <span {...stylex.props(styles.dot)} />
                <span style={{ "--w": `${width}%` }} {...stylex.props(styles.ghost)} />
              </div>
            ))}
          </div>
        }
      >
        <Dialog
          open={open}
          title="What's new in 2.4"
          body="Threads fold up, and search now finds attachments."
          close={<CloseX focus={focus} onClose={() => close("×")} />}
        >
          <div {...stylex.props(styles.acts)}>
            <button type="button" {...focus.stop("ok", styles.btn)} onClick={() => close("Got it")}>
              Got it
            </button>
          </div>
        </Dialog>
      </Screen>
    </Stage>
  );
}

type ConfirmPhase = "idle" | "open" | "deleted";

function ConfirmDemo({ sealed }: { sealed: boolean }) {
  const focus = useWindowFocus();
  const [phase, setPhase] = useState<ConfirmPhase>("idle");
  const open = phase === "open";

  function go(next: ConfirmPhase, stop: string) {
    setPhase(next);
    focus.move(stop, true);
  }

  const read =
    phase === "deleted"
      ? "Enter deleted 214 files"
      : open && focus.at
        ? `Enter presses ${focus.at === "delete" ? "Delete" : focus.at === "cancel" ? "Cancel" : "Delete project"}`
        : "Open Delete project, then press Enter";

  return (
    <Stage
      keys={<Key onPress={() => focus.at && focus.find(focus.at)?.click()}>Enter</Key>}
      read={read}
      tone={phase === "deleted" || focus.at === "delete" ? "no" : open ? "yes" : undefined}
    >
      <Screen
        focus={focus}
        open={open}
        onKeyDown={(event) => event.key === "Escape" && open && go("idle", "trigger")}
        page={
          <div inert={open} {...stylex.props(styles.page)}>
            <div {...stylex.props(styles.spread)}>
              <span {...stylex.props(styles.logo)} />
              <span style={{ "--w": "30%" }} {...stylex.props(styles.ghost)} />
            </div>
            <div {...stylex.props(styles.spread, styles.card, phase === "deleted" && styles.gone)}>
              {phase === "deleted" ? (
                <>
                  <span {...stylex.props(styles.project)}>
                    <b {...stylex.props(styles.strong, styles.goneName)}>Moonbase deleted</b>
                    <small {...stylex.props(styles.meta)}>214 files gone</small>
                  </span>
                  <button
                    type="button"
                    {...focus.stop("reset", [styles.btn, styles.soft, styles.softInCard], open)}
                    onClick={() => go("idle", "trigger")}
                  >
                    Restore
                  </button>
                </>
              ) : (
                <>
                  <span {...stylex.props(styles.project)}>
                    <b {...stylex.props(styles.strong)}>Moonbase</b>
                    <small {...stylex.props(styles.meta)}>214 files · edited 2h ago</small>
                  </span>
                  <button
                    data-hint
                    type="button"
                    {...focus.stop("trigger", [styles.btn, styles.red, styles.redTint], open)}
                    onClick={() => go("open", sealed ? "cancel" : "delete")}
                  >
                    Delete project
                  </button>
                </>
              )}
            </div>
            <span style={{ "--w": "62%" }} {...stylex.props(styles.ghost)} />
            <span style={{ "--w": "48%" }} {...stylex.props(styles.ghost)} />
          </div>
        }
      >
        <Dialog
          open={open}
          title="Delete Moonbase?"
          body="Its 214 files go too. This can't be undone."
        >
          <div {...stylex.props(styles.acts)}>
            <button
              type="button"
              {...focus.stop("cancel", [styles.btn, styles.plain])}
              onClick={() => go("idle", "trigger")}
            >
              Cancel
            </button>
            <button
              type="button"
              {...focus.stop("delete", [styles.btn, styles.red])}
              onClick={() => go("deleted", "reset")}
            >
              Delete
            </button>
          </div>
        </Dialog>
      </Screen>
    </Stage>
  );
}

const DRAFT = "Checkout fails on Safari 17 when a coupon is set";

type DraftPhase = "closed" | "open" | "confirm";

function DraftDemo({ sealed }: { sealed: boolean }) {
  const focus = useWindowFocus();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<DraftPhase>("closed");
  const [draft, setDraft] = useState(DRAFT);
  const [said, setSaid] = useState(`Draft: ${DRAFT.length} chars`);
  const dirty = draft.trim() !== "";

  function show() {
    setPhase("open");
    focus.move("title", true);
    setSaid(dirty ? `Draft: ${draft.length} chars` : "Draft: empty");
  }

  function drop(how: string) {
    setPhase("closed");
    focus.move("trigger", true);
    setSaid(dirty ? `${how}: ${draft.length} chars gone` : `Closed by ${how}`);
    setDraft("");
  }

  function leave(how: string) {
    if (!sealed || !dirty) return drop(how);
    setPhase("confirm");
    focus.move("keep", true);
    setSaid("Asked first");
  }

  function strayClick() {
    if (!sealed || !dirty) return drop("A click outside");
    setSaid("Click outside: still open");
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (reducedMotion()) {
      dialog.animate(
        [{ boxShadow: `0 0 0 2px ${kit["--no"]}` }, { boxShadow: "0 0 0 2px transparent" }],
        {
          duration: 480,
          easing: "ease-out",
        },
      );
      return;
    }
    dialog.animate(
      [
        { transform: "none" },
        { transform: "translateX(-6px)" },
        { transform: "translateX(6px)" },
        { transform: "translateX(-4px)" },
        { transform: "translateX(4px)" },
        { transform: "none" },
      ],
      { duration: 320, easing: "cubic-bezier(0.83, 0, 0.17, 1)" },
    );
  }

  function keepEditing() {
    setPhase("open");
    focus.move("title", true);
    setSaid(`Draft: ${draft.length} chars`);
  }

  function escape() {
    if (phase === "open") leave("Esc");
    else if (phase === "confirm") keepEditing();
  }

  return (
    <Stage
      keys={
        <>
          <Key onPress={escape}>Esc</Key>
          <Key
            onPress={() => {
              setDraft(DRAFT);
              setSaid(`Draft: ${DRAFT.length} chars`);
            }}
          >
            Retype
          </Key>
        </>
      }
      read={said}
      tone={
        said.endsWith("gone")
          ? "no"
          : said.startsWith("Asked") || said.endsWith("open")
            ? "yes"
            : undefined
      }
    >
      <Screen
        focus={focus}
        open={phase !== "closed"}
        onKeyDown={(event) => event.key === "Escape" && escape()}
        onScrim={() => phase === "open" && strayClick()}
        page={
          <div inert={phase !== "closed"} {...stylex.props(styles.page)}>
            <div {...stylex.props(styles.spread)}>
              <span {...stylex.props(styles.logo)} />
              <button
                data-hint
                type="button"
                {...focus.stop("trigger", [styles.btn, styles.soft], phase !== "closed")}
                onClick={show}
              >
                New issue
              </button>
            </div>
            {[66, 52, 74].map((width) => (
              <div key={width} {...stylex.props(styles.mail)}>
                <span {...stylex.props(styles.tag)} />
                <span style={{ "--w": `${width}%` }} {...stylex.props(styles.ghost)} />
              </div>
            ))}
          </div>
        }
      >
        <Dialog
          ref={dialogRef}
          open={phase !== "closed"}
          held={phase === "confirm"}
          title="New issue"
          close={<CloseX focus={focus} onClose={() => leave("×")} />}
        >
          <Field
            focus={focus}
            name="title"
            label="Title"
            value={draft}
            placeholder="Export button does nothing"
            onChange={(event) => setDraft(event.target.value)}
          />
          <div {...stylex.props(styles.acts)}>
            <button
              type="button"
              {...focus.stop("create", styles.btn)}
              onClick={() => {
                setPhase("closed");
                focus.move("trigger", true);
                setSaid("Issue created");
                setDraft(DRAFT);
              }}
            >
              Create
            </button>
          </div>
        </Dialog>
        {sealed && (
          <>
            <div
              aria-hidden="true"
              {...stylex.props(
                styles.scrim,
                styles.scrimTop,
                phase === "confirm" && styles.scrimOn,
              )}
            />
            <Dialog
              top
              open={phase === "confirm"}
              title="Discard this draft?"
              body={`You'll lose ${draft.length} characters.`}
            >
              <div {...stylex.props(styles.acts)}>
                <button
                  type="button"
                  {...focus.stop("keep", [styles.btn, styles.plain])}
                  onClick={keepEditing}
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  {...focus.stop("discard", [styles.btn, styles.red])}
                  onClick={() => drop("Discarded")}
                >
                  Discard
                </button>
              </div>
            </Dialog>
          </>
        )}
      </Screen>
    </Stage>
  );
}

function ScrollDemo({ sealed }: { sealed: boolean }) {
  const focus = useWindowFocus();
  const pageRef = useRef<HTMLDivElement>(null);
  const base = useRef(0);
  const [open, setOpen] = useState(false);
  const [moved, setMoved] = useState(0);
  const locked = sealed && open;

  function show() {
    base.current = pageRef.current?.scrollTop ?? 0;
    setMoved(0);
    setOpen(true);
    focus.move("copy", true);
  }

  function hide() {
    setOpen(false);
    focus.move("trigger", true);
  }

  function nudge(by: number) {
    const page = pageRef.current;
    if (!page || locked) return;
    page.scrollTop += by;
    if (open) setMoved(Math.abs(Math.round(page.scrollTop - base.current)));
  }

  useEffect(() => {
    const screen = focus.ref.current;
    if (!screen || !open) return;
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      if (!sealed) nudge(event.deltaY);
    }
    screen.addEventListener("wheel", onWheel, { passive: false });
    return () => screen.removeEventListener("wheel", onWheel);
  }, [open, sealed, focus.ref]);

  return (
    <Stage
      keys={<Key onPress={() => nudge(60)}>Scroll</Key>}
      read={open ? `Page moved ${moved}px` : "Open Share, then scroll"}
      tone={open ? (moved > 0 ? "no" : "yes") : undefined}
    >
      <Screen
        focus={focus}
        open={open}
        onKeyDown={(event) => event.key === "Escape" && open && hide()}
        page={
          <div
            ref={pageRef}
            inert={open}
            {...stylex.props(styles.page, styles.article, locked && styles.locked)}
          >
            <div {...stylex.props(styles.spread)}>
              <b {...stylex.props(styles.strong)}>Why we moved to Postgres</b>
              <button
                data-hint
                type="button"
                {...focus.stop("trigger", [styles.btn, styles.soft], open)}
                onClick={show}
              >
                Share
              </button>
            </div>
            {[0, 1, 2, 3, 4, 5].map((block) => (
              <div key={block} {...stylex.props(styles.para)}>
                {block % 3 === 1 && <span {...stylex.props(styles.figure)} />}
                {[96, 88, 92, 60].map((width) => (
                  <span
                    key={width}
                    style={{ "--w": `${width - (block % 3) * 4}%` }}
                    {...stylex.props(styles.ghost)}
                  />
                ))}
              </div>
            ))}
          </div>
        }
      >
        <Dialog open={open} title="Share this post" close={<CloseX focus={focus} onClose={hide} />}>
          <div {...stylex.props(styles.share)}>
            <span {...stylex.props(styles.url)}>itsfaqih.dev/p/42</span>
            <button type="button" {...focus.stop("copy", styles.btn)} onClick={hide}>
              Copy link
            </button>
          </div>
        </Dialog>
      </Screen>
    </Stage>
  );
}

function announce(dialog: HTMLElement, target: HTMLElement) {
  const textOf = (ids: string | null) =>
    (ids ?? "")
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
  const parts: string[] = [];
  const role = dialog.getAttribute("role");
  if (role) parts.push(`${textOf(dialog.getAttribute("aria-labelledby"))}, ${role}.`);
  const description = textOf(dialog.getAttribute("aria-describedby"));
  if (description) parts.push(description);
  parts.push(
    target instanceof HTMLInputElement
      ? `${target.labels?.[0]?.firstElementChild?.textContent ?? ""}, edit text, ${target.value}`
      : `${target.textContent ?? ""}, button`,
  );
  return parts.join(" ");
}

function NameDemo({ sealed }: { sealed: boolean }) {
  const focus = useWindowFocus();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [speech, setSpeech] = useState("");

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    const target = focus.at ? focus.find(focus.at) : null;
    setSpeech(open && dialog && target && dialog.contains(target) ? announce(dialog, target) : "");
  }, [open, focus.at]);

  function show() {
    setOpen(true);
    focus.move("name", true);
  }

  function hide() {
    setOpen(false);
    focus.move("trigger", true);
  }

  return (
    <Stage
      keys={
        <Key onPress={() => focus.move(focus.next(open ? dialogRef.current : null, false), true)}>
          Tab
        </Key>
      }
      read={
        speech ? (
          <span {...stylex.props(styles.speech)}>
            <SpeakerHighIcon weight="bold" aria-hidden="true" {...stylex.props(styles.speaker)} />“
            {speech}”
          </span>
        ) : (
          "Open Rename to hear it"
        )
      }
      tone={speech ? (sealed ? "yes" : "no") : undefined}
    >
      <Screen
        focus={focus}
        open={open}
        onKeyDown={(event) => event.key === "Escape" && open && hide()}
        page={
          <div inert={open} {...stylex.props(styles.page)}>
            <div {...stylex.props(styles.spread)}>
              <span {...stylex.props(styles.logo)} />
              <span style={{ "--w": "34%" }} {...stylex.props(styles.ghost)} />
            </div>
            <div {...stylex.props(styles.spread, styles.card)}>
              <span {...stylex.props(styles.project)}>
                <b {...stylex.props(styles.strong)}>report.pdf</b>
                <small {...stylex.props(styles.meta)}>2.4 MB · shared</small>
              </span>
              <button
                data-hint
                type="button"
                {...focus.stop("trigger", [styles.btn, styles.soft, styles.softInCard], open)}
                onClick={show}
              >
                Rename
              </button>
            </div>
            <span style={{ "--w": "58%" }} {...stylex.props(styles.ghost)} />
          </div>
        }
      >
        <Dialog
          ref={dialogRef}
          bare={!sealed}
          open={open}
          title="Rename file"
          body="Pick a name your team will find."
        >
          <Field focus={focus} name="name" label="Name" defaultValue="report.pdf" />
          <div {...stylex.props(styles.acts)}>
            <button
              type="button"
              {...focus.stop("cancel", [styles.btn, styles.plain])}
              onClick={hide}
            >
              Cancel
            </button>
            <button type="button" {...focus.stop("save", styles.btn)} onClick={hide}>
              Save
            </button>
          </div>
        </Dialog>
      </Screen>
    </Stage>
  );
}

export const LESSONS: Lesson[] = [
  {
    title: "Keep focus inside",
    body: (
      <>
        Move focus into the dialog when it opens. Let <Kbd>Tab</Kbd> cycle its controls and never
        reach the inert page behind. On close, return focus to the button that opened it. Press Tab
        in both.
      </>
    ),
    bad: {
      label: "Focus wanders",
      costs: ["starts behind", "Tab leaves it", "lost on close"],
      view: <FocusDemo sealed={false} />,
    },
    good: {
      label: "Hold focus",
      costs: ["starts in Name", "Tab stays in", "back on close"],
      view: <FocusDemo sealed />,
    },
    levels: [
      {
        name: "It closed",
        prompt: (
          <>
            You opened <b>Edit profile</b> from its button halfway down a settings page, then
            pressed Save. Place where focus goes.
          </>
        ),
        piece: "focus",
        answer: "trigger",
        rows: [
          {
            depth: 0,
            slot: {
              id: "body",
              label: "Top of the page",
              note: "Focus starts over at the top. A keyboard user tabs past 12 links to get back.",
            },
          },
          { depth: 1, text: "Nav, 12 links", kind: "more" },
          { depth: 1, text: "Settings page", kind: "comp" },
          {
            depth: 2,
            slot: {
              id: "trigger",
              label: "Edit profile button",
              note: "Return focus here, where they left off. One Tab continues down the page.",
            },
          },
          {
            depth: 2,
            slot: {
              id: "next",
              label: "Change password button",
              note: "Close, but they never picked it, so a screen reader announces it without warning.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Let Escape close it",
    body: (
      <>
        Close every dialog on <Kbd>Esc</Kbd>, every time, since keyboard users leave that way. Let a
        click outside close an info dialog too, as it has nothing to lose.
      </>
    ),
    bad: {
      label: "Esc ignored",
      costs: ["Esc ignored", "2 ways out"],
      view: <EscapeDemo sealed={false} />,
    },
    good: {
      label: "Close on Esc",
      costs: ["Esc closes", "4 ways out"],
      view: <EscapeDemo sealed />,
    },
    levels: [
      {
        name: "A click outside",
        prompt: <>Three dialogs. Place the close on the one a click outside should close.</>,
        piece: "close",
        answer: "news",
        rows: [
          { depth: 0, text: "click on the scrim", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "issue",
              label: "New issue, title typed in",
              note: `One stray click throws away the ${DRAFT.length} characters they typed.`,
            },
          },
          {
            depth: 1,
            slot: {
              id: "news",
              label: "What's new, nothing to fill in",
              note: "Close it on a click outside, since there is nothing to lose.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "profile",
              label: "Edit profile, nothing changed yet",
              note: "Let Esc and Cancel close it, since it's a form one keystroke from holding input.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Focus the safe answer",
    body: (
      <>
        Focus a form's first field so people can type at once. Focus Cancel on a confirm that
        destroys something, so a stray <Kbd>Enter</Kbd> backs out. Open both and press Enter.
      </>
    ),
    extra: (
      <Tip>
        Focus the destructive button only where speed matters more and the action can be undone.
      </Tip>
    ),
    bad: {
      label: "Delete first",
      costs: ["Enter deletes", "214 files"],
      view: <ConfirmDemo sealed={false} />,
    },
    good: {
      label: "Focus Cancel",
      costs: ["Enter cancels", "0 files lost"],
      view: <ConfirmDemo sealed />,
    },
    levels: [
      {
        name: "Delete forever",
        prompt: (
          <>
            <b>Delete Moonbase?</b> removes 214 files for good. Place where focus starts.
          </>
        ),
        piece: "first focus",
        answer: "cancel",
        rows: [
          { depth: 0, text: "Moonbase project row", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "trigger",
              label: "Delete project, on the page behind",
              note: "Focus stays behind the dim layer. Tab moves through the page, and Enter reopens the dialog.",
            },
          },
          { depth: 0, text: "Confirm dialog", kind: "comp" },
          { depth: 1, text: "Delete Moonbase?" },
          {
            depth: 1,
            slot: {
              id: "cancel",
              label: "Cancel",
              note: "Focus the safe answer. A stray Enter backs out, and deleting takes a deliberate move.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "delete",
              label: "Delete",
              note: "One Enter deletes 214 files before anyone has read the title.",
            },
          },
        ],
      },
      {
        name: "Add a contact",
        prompt: (
          <>
            <b>Add contact</b> has Name and Email fields. Place where focus starts.
          </>
        ),
        piece: "first focus",
        answer: "name",
        rows: [
          { depth: 0, text: "Add contact dialog", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "close",
              label: "× Close",
              note: "Typing goes nowhere, and one Enter closes the form they came to fill.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "name",
              label: "Name field",
              note: "Focus the first field so they start typing at once, with no click or Tab.",
            },
          },
          { depth: 1, text: "Email field" },
          {
            depth: 1,
            slot: {
              id: "save",
              label: "Save",
              note: "Enter saves an empty contact, and they Shift+Tab back up to start.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Ask before you drop a draft",
    body: (
      <>
        A click outside is often a slip. Once a form has input, shake the dialog on that click
        instead of closing it, and ask before <Kbd>Esc</Kbd> or × discards the draft. Click the dim
        area in both.
      </>
    ),
    bad: {
      label: "Click drops it",
      costs: ["1 stray click", `${DRAFT.length} chars gone`],
      view: <DraftDemo sealed={false} />,
    },
    good: {
      label: "Ask first",
      costs: ["0 chars lost", "asks first"],
      view: <DraftDemo sealed />,
    },
    levels: [
      {
        name: "A slip",
        prompt: (
          <>
            Three dialogs, and a click lands on the dim area by mistake. Place the shake on the one
            that should stay open.
          </>
        ),
        piece: "shake",
        answer: "issue",
        rows: [
          { depth: 0, text: "click on the scrim", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "news",
              label: "What's new, nothing to fill in",
              note: "Nothing typed, nothing lost. Shaking it blocks a safe way out.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "issue",
              label: "New issue, title typed in",
              note: `Shake it and keep the ${DRAFT.length} characters. Esc or × asks before it drops them.`,
            },
          },
          {
            depth: 1,
            slot: {
              id: "preview",
              label: "Image preview, nothing to fill in",
              note: "It holds no input, so a click outside should just close it.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Lock the page behind",
    body: (
      <>
        Stop the page under the dialog from scrolling, so it stays still. Keep the scrollbar's space
        so nothing shifts when the scrollbar hides. Open Share, then scroll.
      </>
    ),
    bad: {
      label: "Page scrolls",
      costs: ["page moves", "place lost"],
      view: <ScrollDemo sealed={false} />,
    },
    good: {
      label: "Lock the page",
      costs: ["0px moved", "0px shift"],
      view: <ScrollDemo sealed />,
    },
    levels: [
      {
        name: "Hold the page",
        prompt: (
          <>
            <b>Share</b> opens over a long article. Place the scroll lock so the article stays
            still.
          </>
        ),
        piece: "scroll lock",
        answer: "body",
        rows: [
          {
            depth: 0,
            slot: {
              id: "body",
              label: "The page",
              note: "Lock the page while the dialog is open, and keep room for its scrollbar so nothing shifts.",
            },
          },
          { depth: 1, text: "The article, 3,000 words", kind: "more" },
          {
            depth: 1,
            slot: {
              id: "scrim",
              label: "The dim layer",
              note: "The dim layer never scrolled. The article under it still does.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "panel",
              label: "The dialog panel",
              note: "A long dialog gets cut off, and the article behind it still scrolls.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Give it a name",
    body: (
      <>
        Tell a screen reader that a dialog opened and what it's called. Mark it as a modal dialog,
        name it by its title and describe it by its text.
      </>
    ),
    bad: {
      label: "A plain box",
      costs: ["no role", "no name"],
      view: <NameDemo sealed={false} />,
    },
    good: {
      label: "Name the dialog",
      costs: ["a dialog", "named", "described"],
      view: <NameDemo sealed />,
    },
    levels: [
      {
        name: "Read aloud",
        prompt: (
          <>
            A screen reader user presses Delete and <b>Delete Moonbase?</b> opens. Pick the version
            that tells them what opened.
          </>
        ),
        piece: "the dialog",
        answer: "named",
        rows: [
          { depth: 0, text: "screen reader, as it opens", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "plain",
              label: "+ a plain box",
              note: "Focus moves, but nothing says a dialog opened or what it asks.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "role",
              label: "+ marked as a dialog",
              note: "They hear dialog, but not which one or what it asks.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "named",
              label: "+ a dialog with a name and a description",
              note: "They hear Delete Moonbase?, dialog, then that 214 files go for good. That's enough to answer.",
            },
          },
        ],
      },
    ],
  },
];

export const TLDR = [
  ["It opens", "Focus the first field, or Cancel if it destroys something"],
  ["While it's open", "Cycle Tab inside. Keep the page behind inert and still"],
  ["Escape", "Close it, every time"],
  ["A click outside", "Close an info dialog. Shake or ask on a form with input"],
  ["It closes", "Return focus to the button that opened it"],
  ["For screen readers", "Mark it as a modal dialog. Name it by its title"],
  ["On a phone", "Use a bottom sheet that swipes down to close"],
] as const;

export function DialogDesign() {
  return (
    <RuleLanding
      lead={
        <>Trap Tab inside the dialog, lock the page behind it, and name it for screen readers.</>
      }
      learn={{
        title: "Hold focus, let go cleanly",
        intro: <>Give a dialog a way through and a way out, since it takes over the screen.</>,
      }}
      lessons={LESSONS}
      tldr={TLDR}
      board="screen"
      take="build dialogs the same way"
    />
  );
}
