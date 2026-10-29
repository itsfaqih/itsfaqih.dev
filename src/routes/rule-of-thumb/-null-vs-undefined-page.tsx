import * as stylex from "@stylexjs/stylex";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { reducedMotion } from "../../hooks/use-media-query";
import { cursors, fonts, motion, palette } from "../../theme.stylex";
import {
  Code,
  type Lesson,
  type Level,
  onceOnScreen,
  paint,
  RuleLanding,
  TABBED,
} from "./-components/rule-landing";
import { kit } from "./-components/rule-landing.stylex";
import { button } from "../../components/button";

type Tone = "no" | "yes";
type Line = { c: string; out?: string; tone?: Tone; hot?: boolean };

const TOKEN =
  /(\/\/.*)|("(?:[^"\\]|\\.)*"|`[^`]*`)|\b(null)\b|\b(undefined)\b|\b(const|let|function|return|type|await|new)\b/g;
const PHONE = "@media (max-width: 640px)";
const MOTION = "@media (prefers-reduced-motion: no-preference)";

const flash = stylex.keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
});
const typeIn = stylex.keyframes({
  from: { opacity: 0, transform: "translate(-8px)" },
});
const drop = stylex.keyframes({
  from: { opacity: 1, transform: "translateY(-14px)" },
  "70%": { opacity: 1 },
  to: { opacity: 0, transform: "translateY(16px)" },
});
const land = stylex.keyframes({
  from: { opacity: 0, transform: "translateY(6px)" },
});

const styles = stylex.create({
  kw: { color: "var(--c-ink)" },
  str: { color: `color-mix(in oklab, ${palette["--ar"]} ${palette["--ink-mix"]}, #000)` },
  com: { color: palette["--mute"] },
  nul: {
    paddingBlock: 0,
    paddingInline: "3px",
    borderRadius: "4px",
    backgroundColor: "color-mix(in srgb, var(--c) 20%, transparent)",
    boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--c) 70%, transparent)",
    fontWeight: 700,
    color: "var(--c-ink)",
  },
  und: {
    paddingBlock: 0,
    paddingInline: "3px",
    borderRadius: "4px",
    outlineWidth: "1px",
    outlineStyle: "dashed",
    outlineColor: palette["--mute"],
    outlineOffset: "-1px",
    fontWeight: 700,
    color: palette["--dim"],
  },
  inherit: { color: "inherit" },
  introCode: {
    paddingBlock: "1px",
    paddingInline: "6px",
    borderRadius: "6px",
    backgroundColor: palette["--panel-2"],
    fontWeight: 600,
    fontSize: "0.88em",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--text"],
  },
  view: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "14px",
    alignContent: "start",
  },
  code: {
    display: "grid",
    gap: "2px",
    fontSize: { default: "12.5px", [PHONE]: "12px" },
    lineHeight: 1.5,
    fontFamily: fonts["--mono"],
  },
  line: {
    display: "flex",
    flexWrap: "wrap",
    rowGap: "2px",
    columnGap: "12px",
    alignItems: "center",
    minHeight: "26px",
    paddingBlock: "1px",
    paddingInline: { default: "8px", [PHONE]: "6px" },
    borderRadius: "6px",
  },
  hot: {
    backgroundColor: {
      default: null,
      [stylex.when.ancestor('[data-side="bad"]')]:
        `color-mix(in srgb, ${kit["--no"]} 10%, transparent)`,
      [stylex.when.ancestor('[data-side="good"]')]: "color-mix(in srgb, var(--c) 10%, transparent)",
    },
    boxShadow: {
      default: null,
      [stylex.when.ancestor('[data-side="bad"]')]: `inset 2px 0 0 ${kit["--no"]}`,
      [stylex.when.ancestor('[data-side="good"]')]: "inset 2px 0 0 var(--c)",
    },
  },
  source: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "auto",
    minWidth: 0,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
    color: palette["--text"],
  },
  out: {
    maxWidth: "100%",
    marginLeft: "auto",
    paddingBlock: "1px",
    paddingInline: "8px",
    borderRadius: "6px",
    backgroundColor: palette["--panel-2"],
    fontWeight: 600,
    fontSize: "11.5px",
    lineHeight: 1.6,
    fontFamily: fonts["--mono"],
    color: palette["--dim"],
    overflowWrap: "anywhere",
    "::before": {
      content: '"→ "',
      color: palette["--mute"],
    },
  },
  outNo: {
    backgroundColor: `color-mix(in srgb, ${kit["--no"]} 16%, transparent)`,
    color: kit["--no-ink"],
  },
  outYes: {
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  },
  flow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: "10px",
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
    rowGap: "8px",
    columnGap: "10px",
    alignItems: "center",
    minHeight: "58px",
    paddingBlock: "10px",
    paddingInline: "12px",
    borderRadius: "12px",
    backgroundColor: palette["--panel"],
    boxShadow: palette["--raise"],
  },
  label: {
    fontWeight: 700,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
    color: palette["--dim"],
  },
  field: {
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "160px",
    gap: "10px",
    alignItems: "center",
    minWidth: 0,
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
    minWidth: 0,
    height: "38px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "solid",
    borderColor: { default: palette["--hair"], ":focus-visible": "var(--c)" },
    borderRadius: "10px",
    backgroundColor: palette["--panel-2"],
    fontWeight: 600,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: {
      default: null,
      ":focus-visible": "color-mix(in srgb, var(--c) 30%, transparent)",
    },
    outlineOffset: { default: null, ":focus-visible": 0 },
    transition: `border-color ${kit["--t-fb"]} ease`,
  },
  chip: {
    display: "inline-flex",
    gap: "4px",
    alignItems: "center",
    height: "34px",
    paddingTop: 0,
    paddingRight: "4px",
    paddingBottom: 0,
    paddingLeft: "12px",
    borderRadius: "999px",
    backgroundColor: palette["--panel-2"],
    boxShadow: `0 2px 0 ${palette["--drop-ink"]}`,
    fontWeight: 600,
    fontSize: "14px",
    lineHeight: "normal",
    fontFamily: fonts["--sans"],
    color: palette["--text"],
  },
  remove: {
    display: "grid",
    alignItems: "center",
    justifyItems: "center",
    width: "26px",
    height: "26px",
    borderWidth: 0,
    borderStyle: "none",
    borderColor: "currentcolor",
    borderRadius: "999px",
    backgroundColor: {
      default: "transparent",
      ":hover": `color-mix(in srgb, ${kit["--no"]} 18%, transparent)`,
    },
    fontSize: "12px",
    color: { default: palette["--dim"], ":hover": kit["--no-ink"] },
    cursor: cursors["--cursor-point"],
    transform: { default: null, ":active": "scale(0.92)" },
    outlineWidth: { default: null, ":focus-visible": "3px" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineColor: { default: null, ":focus-visible": palette["--focus"] },
    outlineOffset: { default: null, ":focus-visible": "1px" },
    transition: `background-color ${kit["--t-fb"]} ease, color ${kit["--t-fb"]} ease, transform ${kit["--t-fb"]} ${motion["--out"]}`,
  },
  none: {
    display: "inline-flex",
    alignItems: "center",
    height: "34px",
    paddingBlock: 0,
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: palette["--hair"],
    borderRadius: "999px",
    fontSize: "14px",
    color: palette["--mute"],
  },
  again: {
    marginLeft: "auto",
    opacity: { default: null, ":disabled": 0.5 },
  },
  wire: {
    position: "relative",
    display: "flex",
    flexWrap: "wrap",
    rowGap: "4px",
    columnGap: "10px",
    alignItems: "baseline",
    minHeight: "38px",
    paddingBlock: "8px",
    paddingInline: "12px",
    borderWidth: "1.5px",
    borderStyle: "dashed",
    borderColor: palette["--hair"],
    borderRadius: "10px",
    fontSize: "12px",
    lineHeight: 1.5,
    fontFamily: fonts["--mono"],
  },
  verb: {
    fontWeight: 700,
    color: "var(--c-ink)",
  },
  idle: {
    color: palette["--mute"],
  },
  body: {
    minWidth: 0,
    overflowWrap: "anywhere",
    color: palette["--text"],
  },
  typing: {
    animationName: { default: null, [MOTION]: typeIn },
    animationDuration: { default: null, [MOTION]: "180ms" },
    animationTimingFunction: { default: null, [MOTION]: motion["--out"] },
    animationFillMode: { default: null, [MOTION]: "both" },
  },
  packet: {
    position: "absolute",
    bottom: "-4px",
    left: "50%",
    width: "6px",
    height: "6px",
    marginLeft: "-3px",
    backgroundColor: "var(--c)",
    opacity: 0,
  },
  dropping: {
    animationName: { default: null, [MOTION]: drop },
    animationDuration: { default: null, [MOTION]: "260ms" },
    animationTimingFunction: { default: null, [MOTION]: motion["--out"] },
    animationDelay: { default: null, [MOTION]: "180ms" },
    animationFillMode: { default: null, [MOTION]: "both" },
  },
  record: {
    display: "grid",
    gridAutoColumns: "minmax(0, 1fr)",
    gridAutoFlow: "column",
    gap: "2px",
    marginBlock: 0,
    marginInline: 0,
    paddingBlock: "4px",
    paddingInline: "4px",
    borderRadius: "12px",
    backgroundColor: palette["--panel-2"],
  },
  cell: {
    position: "relative",
    display: "grid",
    gap: "2px",
    alignContent: "start",
    minWidth: 0,
    paddingBlock: "8px",
    paddingInline: { default: "10px", [PHONE]: "8px" },
    borderRadius: "9px",
    isolation: "isolate",
    "::after": {
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: -1,
      borderRadius: "inherit",
      opacity: 0,
    },
  },
  cellSaved: {
    "::after": {
      backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 22%, transparent)`,
    },
  },
  cellLost: {
    "::after": {
      backgroundColor: `color-mix(in srgb, ${kit["--no"]} 24%, transparent)`,
    },
  },
  flashing: {
    "::after": {
      animationName: flash,
      animationDuration: "640ms",
      animationTimingFunction: motion["--out"],
      animationDelay: "calc(var(--i) * 40ms)",
      animationFillMode: "both",
    },
  },
  name: {
    fontWeight: 600,
    fontSize: "11px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
    color: palette["--mute"],
  },
  value: {
    minHeight: "21px",
    marginBlock: 0,
    marginInline: 0,
    fontWeight: 600,
    fontSize: "13px",
    lineHeight: 1.6,
    fontFamily: fonts["--mono"],
    color: palette["--text"],
    overflowWrap: "anywhere",
  },
  valueLost: {
    color: kit["--no-ink"],
  },
  landing: {
    animationName: { default: null, [MOTION]: land },
    animationDuration: { default: null, [MOTION]: "240ms" },
    animationTimingFunction: { default: null, [MOTION]: motion["--out"] },
    animationDelay: { default: null, [MOTION]: "calc(var(--i) * 40ms)" },
    animationFillMode: { default: null, [MOTION]: "both" },
  },
  nulLost: {
    backgroundColor: `color-mix(in srgb, ${kit["--no"]} 18%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${kit["--no"]} 70%, transparent)`,
    color: kit["--no-ink"],
  },
  tag: {
    justifySelf: "start",
    paddingBlock: "1px",
    paddingInline: "6px",
    borderRadius: "5px",
    fontWeight: 700,
    fontSize: "10px",
    lineHeight: "normal",
    fontFamily: fonts["--display"],
  },
  tagKept: {
    backgroundColor: `color-mix(in srgb, ${kit["--yes"]} 18%, transparent)`,
    color: kit["--yes-ink"],
  },
  tagLost: {
    backgroundColor: `color-mix(in srgb, ${kit["--no"]} 16%, transparent)`,
    color: kit["--no-ink"],
  },
  boardCode: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  gap: {
    display: { default: null, [stylex.when.ancestor("[data-off]")]: "none" },
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "3.2em",
    height: "1.1em",
    marginLeft: "8px",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "color-mix(in srgb, var(--c) 55%, transparent)",
  },
});

const KINDS = [styles.com, styles.str, styles.nul, styles.und, styles.kw];
// Inside an output note the note's tone colours strings and nothings.
const OUT_KINDS = [
  styles.com,
  [styles.str, styles.inherit],
  [styles.nul, styles.inherit],
  [styles.und, styles.inherit],
  styles.kw,
];

function CodeBlock({ lines }: { lines: Line[] }) {
  return (
    <div {...stylex.props(styles.code)}>
      {lines.map((line, index) => (
        <div key={index} {...stylex.props(styles.line, line.hot && styles.hot)}>
          <code {...stylex.props(styles.source)}>{line.c ? paint(line.c, TOKEN, KINDS) : " "}</code>
          {line.out && (
            <span
              {...stylex.props(
                styles.out,
                line.tone === "no" && styles.outNo,
                line.tone === "yes" && styles.outYes,
              )}
            >
              <span className="sr-only">gives </span>
              {paint(line.out, TOKEN, OUT_KINDS)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

type Way = "bad" | "good";
type Field = "title" | "assignee" | "due" | "reviewer";
type Row = Partial<Record<Field, string | null>>;
type Body = Partial<Record<Field, string | null | undefined>>;
type Phase = "idle" | "sent" | "done";
type Verdict = "saved" | "kept" | "wiped" | "lost";

function arrived(body: Body): Row {
  const row: Row = {};
  for (const field of FIELDS) {
    const value = body[field];
    if (value !== undefined) row[field] = value;
  }
  return row;
}

const FIELDS: readonly Field[] = ["title", "assignee", "due", "reviewer"];

function verdictOf(field: Field, before: Row, after: Row, intent: Row): Verdict {
  if (field in intent) return after[field] === intent[field] ? "saved" : "lost";
  return after[field] === before[field] ? "kept" : "wiped";
}

const SEND_MS = 460;

function useSave() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("done");
  const [runs, setRuns] = useState(0);
  const timer = useRef(0);
  const touched = useRef(false);

  function send() {
    clearTimeout(timer.current);
    setRuns((count) => count + 1);
    if (reducedMotion()) {
      setPhase("done");
      return;
    }
    setPhase("sent");
    timer.current = window.setTimeout(() => setPhase("done"), SEND_MS);
  }

  useLayoutEffect(() => {
    const flow = ref.current;
    if (
      !flow ||
      reducedMotion() ||
      matchMedia(TABBED).matches ||
      flow.getBoundingClientRect().top < innerHeight * 0.7
    )
      return;
    setPhase("idle");
    let wait = 0;
    const stop = onceOnScreen(flow, () => {
      wait = window.setTimeout(() => {
        if (!touched.current) send();
      }, 500);
    });
    return () => {
      stop();
      clearTimeout(wait);
      clearTimeout(timer.current);
    };
  }, []);

  return {
    ref,
    phase,
    runs,
    send: () => {
      touched.current = true;
      send();
    },
    reset: () => {
      touched.current = true;
      clearTimeout(timer.current);
      setPhase("idle");
    },
  };
}

type Save = ReturnType<typeof useSave>;

type FlowProps = {
  save: Save;
  fields: readonly Field[];
  before: Row;
  body: Body;
  intent: Row;
  children: ReactNode;
};

function Flow({ save, fields, before, body, intent, children }: FlowProps) {
  const { phase, runs } = save;
  const after = { ...before, ...arrived(body) };
  const row = phase === "done" ? after : before;
  const ran = runs > 0;
  return (
    <div ref={save.ref} {...stylex.props(styles.flow)}>
      <div {...stylex.props(styles.form)}>{children}</div>
      <div key={`w${runs}`} {...stylex.props(styles.wire)}>
        <span {...stylex.props(styles.verb)}>PATCH /tasks/12</span>
        {phase === "idle" ? (
          <span {...stylex.props(styles.idle)}>not sent yet</span>
        ) : (
          <code {...stylex.props(styles.body, phase === "sent" && styles.typing)}>
            {paint(JSON.stringify(body), TOKEN, KINDS)}
          </code>
        )}
        <i
          aria-hidden="true"
          {...stylex.props(styles.packet, phase === "sent" && styles.dropping)}
        />
      </div>
      <dl key={phase === "done" ? `r${runs}` : "before"} {...stylex.props(styles.record)}>
        {fields.map((field, index) => {
          const verdict = phase === "done" ? verdictOf(field, before, after, intent) : undefined;
          const good = verdict === "saved" || verdict === "kept";
          const bad = verdict === "wiped" || verdict === "lost";
          const value = row[field];
          return (
            <div
              key={field}
              style={{ "--i": index }}
              {...stylex.props(
                styles.cell,
                verdict === "saved" && styles.cellSaved,
                bad && styles.cellLost,
                ran && verdict && styles.flashing,
              )}
            >
              <dt {...stylex.props(styles.name)}>{field}</dt>
              <dd
                {...stylex.props(
                  styles.value,
                  bad && styles.valueLost,
                  ran && phase === "done" && styles.landing,
                )}
              >
                {value === null ? (
                  <span {...stylex.props(styles.nul, bad && styles.nulLost)}>null</span>
                ) : (
                  value
                )}
              </dd>
              {verdict && (
                <span {...stylex.props(styles.tag, good && styles.tagKept, bad && styles.tagLost)}>
                  {verdict}
                </span>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

const CLEAR_BEFORE: Row = { title: "Ship v2", reviewer: "Rina" };

function ClearDemo({ way }: { way: Way }) {
  const save = useSave();
  const cleared = save.phase !== "idle";
  return (
    <div {...stylex.props(styles.view)}>
      <CodeBlock
        lines={[
          { c: "// ✕ on the reviewer chip" },
          { c: `changes.reviewer = ${way === "bad" ? "undefined" : "null"}`, hot: true },
          { c: 'patch("/tasks/12", changes)' },
        ]}
      />
      <Flow
        save={save}
        fields={["title", "reviewer"]}
        before={CLEAR_BEFORE}
        body={{ reviewer: way === "bad" ? undefined : null }}
        intent={{ reviewer: null }}
      >
        <span {...stylex.props(styles.label)}>Reviewer</span>
        {cleared ? (
          <span {...stylex.props(styles.none)}>None</span>
        ) : (
          <span {...stylex.props(styles.chip)}>
            Rina
            <button
              type="button"
              aria-label="Remove reviewer Rina"
              onClick={save.send}
              {...stylex.props(styles.remove)}
            >
              ✕
            </button>
          </span>
        )}
        {cleared && (
          <button
            type="button"
            {...stylex.props(button.base, button.soft, button.sm, styles.again)}
            disabled={save.phase === "sent"}
            onClick={save.reset}
          >
            Reset
          </button>
        )}
      </Flow>
    </div>
  );
}

const RENAME_BEFORE: Row = { title: "Ship v1", assignee: "Rina", due: "Nov 3" };

function RenameDemo({ way }: { way: Way }) {
  const save = useSave();
  const [title, setTitle] = useState("Ship v2");
  const body: Body = way === "bad" ? { title, assignee: null, due: null } : { title };
  const saved = save.phase === "done";
  return (
    <div {...stylex.props(styles.view)}>
      <CodeBlock
        lines={
          way === "bad"
            ? [
                { c: "const draft = { title: null,", hot: true },
                { c: "  assignee: null, due: null }", hot: true },
                { c: "draft.title = input.value" },
                { c: 'patch("/tasks/12", draft)' },
              ]
            : [
                { c: "const draft: Partial<Task> = {}", hot: true },
                { c: "" },
                { c: "draft.title = input.value" },
                { c: 'patch("/tasks/12", draft)' },
              ]
        }
      />
      <Flow
        save={save}
        fields={["title", "assignee", "due"]}
        before={RENAME_BEFORE}
        body={body}
        intent={{ title }}
      >
        <label {...stylex.props(styles.field)}>
          <span {...stylex.props(styles.label)}>Title</span>
          <input
            value={title}
            spellCheck={false}
            {...stylex.props(styles.input)}
            onChange={(event) => {
              setTitle(event.target.value);
              if (saved) save.reset();
            }}
          />
        </label>
        <button
          type="button"
          {...stylex.props(button.base, button.soft, button.sm, styles.again)}
          disabled={save.phase === "sent"}
          onClick={saved ? save.reset : save.send}
        >
          {saved ? "Reset" : "Save"}
        </button>
      </Flow>
    </div>
  );
}

const LESSONS: Lesson[] = [
  {
    title: "Missing or empty",
    body: (
      <>
        <Code>undefined</Code> means nobody gave a value. <Code>null</Code> means someone checked
        and the answer is nothing. Ana skipped the phone question. Bo said he has no phone. Send
        both as <Code>null</Code> and no code can tell them apart.
      </>
    ),
    bad: {
      label: "Both null",
      costs: ["1 user nagged"],
      view: (
        <CodeBlock
          lines={[
            { c: "ask = (u) => u.phone === null", hot: true },
            { c: "// Ana skipped it. Bo has none." },
            { c: '{ "name": "Ana", "phone": null }', out: "ask: true" },
            { c: '{ "name": "Bo", "phone": null }', out: "ask: true", tone: "no" },
          ]}
        />
      ),
    },
    good: {
      label: "Missing vs null",
      costs: ["0 nagged"],
      view: (
        <CodeBlock
          lines={[
            { c: "ask = (u) => u.phone === undefined", hot: true },
            { c: "// Ana skipped it. Bo has none." },
            { c: '{ "name": "Ana" }', out: "ask: true" },
            { c: '{ "name": "Bo", "phone": null }', out: "ask: false", tone: "yes" },
          ]}
        />
      ),
    },
  },
  {
    title: "Optional means undefined",
    body: (
      <>
        A value the caller may leave out is <Code>undefined</Code> when they do. Type it with{" "}
        <Code>?:</Code>, and the caller just leaves it out. Typed <Code>| null</Code>, every call
        has to spell out the nothing.
      </>
    ),
    bad: {
      label: "string | null",
      costs: ["1 type error", "null at every call"],
      view: (
        <CodeBlock
          lines={[
            { c: "function welcome(name: string | null) {", hot: true },
            { c: '  return `Hi, ${name ?? "guest"}`' },
            { c: "}" },
            { c: "welcome()", out: "TS2554: Expected 1 argument", tone: "no" },
            { c: "welcome(null)", out: '"Hi, guest"' },
          ]}
        />
      ),
    },
    good: {
      label: "name?: string",
      costs: ["0 errors", "0 extra args"],
      view: (
        <CodeBlock
          lines={[
            { c: "function welcome(name?: string) {", hot: true },
            { c: '  return `Hi, ${name ?? "guest"}`' },
            { c: "}" },
            { c: "welcome()", out: '"Hi, guest"', tone: "yes" },
            { c: 'welcome("Ana")', out: '"Hi, Ana"' },
          ]}
        />
      ),
    },
  },
  {
    title: "Clear with null",
    body: (
      <>
        When the user empties a field, say so with <Code>null</Code>. JSON drops every key set to{" "}
        <Code>undefined</Code>, so a clear sent that way never reaches the server.
      </>
    ),
    bad: {
      label: "= undefined",
      costs: ["{} sent", "clear lost"],
      view: <ClearDemo way="bad" />,
    },
    good: {
      label: "= null",
      costs: ["1 field cleared"],
      view: <ClearDemo way="good" />,
    },
  },
  {
    title: "Leave untouched fields out",
    body: (
      <>
        A PATCH changes what it carries. Start a draft at <Code>null</Code> and every field the user
        never touched goes out as a clear. Start it empty, and only what they changed is sent.
      </>
    ),
    bad: {
      label: "Every field",
      costs: ["2 fields wiped"],
      view: <RenameDemo way="bad" />,
    },
    good: {
      label: "Only changes",
      costs: ["0 fields wiped"],
      view: <RenameDemo way="good" />,
    },
  },
  {
    title: "Force the decision",
    body: (
      <>
        <Code>?:</Code> lets a caller skip a field without a word. When every caller must decide,
        make the field required and nullable. Forgetting it is then an error, and "nobody" is a{" "}
        <Code>null</Code> someone wrote on purpose.
      </>
    ),
    bad: {
      label: "assignee?: User",
      costs: ["forgot it: 0 errors"],
      view: (
        <CodeBlock
          lines={[
            { c: "type Task = {" },
            { c: "  title: string" },
            { c: "  assignee?: User", hot: true },
            { c: "}" },
            { c: "save({ title })", out: "0 errors", tone: "no" },
            { c: '// shows "Unassigned". Nobody chose it.' },
          ]}
        />
      ),
    },
    good: {
      label: "User | null",
      costs: ["forgot it: 1 error"],
      view: (
        <CodeBlock
          lines={[
            { c: "type Task = {" },
            { c: "  title: string" },
            { c: "  assignee: User | null", hot: true },
            { c: "}" },
            { c: "save({ title })", out: "TS2741: 'assignee' is missing", tone: "yes" },
            { c: "save({ title, assignee: null })", out: "0 errors" },
          ]}
        />
      ),
    },
  },
  {
    title: "Not found is null",
    body: (
      <>
        A lookup that finds nothing has an answer, and the answer is <Code>null</Code>.{" "}
        <Code>Map.get</Code> hands you <Code>undefined</Code>, and <Code>JSON.stringify</Code> turns
        that into no body at all.
      </>
    ),
    bad: {
      label: "res.json(user)",
      costs: ["0-byte body", "1 SyntaxError"],
      view: (
        <CodeBlock
          lines={[
            { c: "const user = users.get(email)", out: "undefined" },
            { c: "res.json(user)", out: "body: 0 bytes", tone: "no", hot: true },
            { c: "// on the client" },
            { c: "await r.json()", out: "SyntaxError: Unexpected end of JSON input", tone: "no" },
          ]}
        />
      ),
    },
    good: {
      label: "user ?? null",
      costs: ["4-byte body", "0 errors"],
      view: (
        <CodeBlock
          lines={[
            { c: "const user = users.get(email)", out: "undefined" },
            { c: "res.json(user ?? null)", out: "body: null", tone: "yes", hot: true },
            { c: "// on the client" },
            { c: "await r.json()", out: 'null: "No such user"', tone: "yes" },
          ]}
        />
      ),
    },
  },
];

const TLDR = [
  ["Declared, not assigned yet", "It's undefined"],
  ["An argument the caller may skip", "name?: string, so undefined"],
  ["The user cleared a field", "Set it to null"],
  ["A field the user didn't touch", "Leave it out of the request"],
  ["A field every caller must decide", "T | null, not ?:"],
  ["A lookup that found nothing", "Return null"],
] as const;

const code = (text: string) => (
  <code {...stylex.props(styles.boardCode)}>{paint(text, TOKEN, KINDS)}</code>
);
const blank = (text: string) => (
  <>
    <span className="sr-only">{text}</span>
    <span aria-hidden="true" {...stylex.props(styles.gap)} />
  </>
);

const LEVELS: Level[] = [
  {
    name: "The date picker",
    prompt: (
      <>
        The user pressed ✕ on the due date. They never opened the assignee or the notes. Which field
        gets <Code>null</Code>?
      </>
    ),
    piece: "null",
    answer: "due",
    rows: [
      { depth: 0, text: code('patch("/tasks/12", {') },
      { depth: 1, text: code('title: "Ship v2",') },
      {
        depth: 1,
        lead: code("assignee:"),
        slot: {
          id: "assignee",
          label: blank("assignee:"),
          note: "Sends assignee: null and unassigns Rina. Nobody asked for that.",
          cost: ["1 field wiped"],
        },
      },
      {
        depth: 1,
        lead: code("due:"),
        slot: {
          id: "due",
          label: blank("due:"),
          note: "They cleared it on purpose, so you send null and the server clears it.",
          cost: ["1 field cleared", "0 wiped"],
        },
      },
      {
        depth: 1,
        lead: code("notes:"),
        slot: {
          id: "notes",
          label: blank("notes:"),
          note: "Sends notes: null and wipes notes the user never opened.",
          cost: ["1 field wiped"],
        },
      },
      { depth: 0, text: code("})") },
    ],
  },
  {
    name: "Only the title",
    prompt: (
      <>
        The user renamed the task and removed its reviewer. They didn't touch the due date. Which
        field can be <Code>undefined</Code>?
      </>
    ),
    piece: "undefined",
    answer: "due",
    rows: [
      { depth: 0, text: code("const changes = {") },
      {
        depth: 1,
        lead: code("title:"),
        slot: {
          id: "title",
          label: blank("title:"),
          note: "undefined drops out of the JSON, so the rename never reaches the server.",
          cost: ["rename lost"],
        },
      },
      {
        depth: 1,
        lead: code("reviewer:"),
        slot: {
          id: "reviewer",
          label: blank("reviewer:"),
          note: "The removal drops out of the JSON, so the reviewer stays.",
          cost: ["clear lost"],
        },
      },
      {
        depth: 1,
        lead: code("due:"),
        slot: {
          id: "due",
          label: blank("due:"),
          note: "It drops out of the JSON, so the server never sees due and leaves it alone.",
          cost: ["0 fields wiped"],
        },
      },
      { depth: 0, text: code("}") },
      { depth: 0, text: code('patch("/tasks/12", changes)') },
    ],
  },
  {
    name: "Two sign-ups",
    prompt: (
      <>
        You looked up <Code>bo@x.io</Code> and nobody has that email. You haven't looked up{" "}
        <Code>cy@x.io</Code> yet. Which entry gets <Code>null</Code>?
      </>
    ),
    piece: "null",
    answer: "bo",
    rows: [
      { depth: 0, text: code("const seen = new Map([") },
      { depth: 1, text: code('["ana@x.io", { id: 7 }],') },
      {
        depth: 1,
        lead: code('["bo@x.io",'),
        slot: {
          id: "bo",
          label: blank('["bo@x.io",'),
          note: "You checked and nobody has it. null says so, and the next lookup is skipped.",
          cost: ["1 lookup saved"],
        },
      },
      {
        depth: 1,
        lead: code('["cy@x.io",'),
        slot: {
          id: "cy",
          label: blank('["cy@x.io",'),
          note: "Says nobody has cy@x.io before anyone checked. Cy can't sign in until the cache clears.",
          cost: ["1 user locked out"],
        },
      },
      { depth: 0, text: code("])") },
    ],
  },
  {
    name: "A new task",
    prompt: (
      <>
        Every new task must name an assignee or say there's none. The colour is optional and falls
        back to grey. Where does <Code>| null</Code> go?
      </>
    ),
    piece: "| null",
    answer: "assignee",
    rows: [
      { depth: 0, text: code("type NewTask = {") },
      {
        depth: 1,
        lead: code("title: string"),
        slot: {
          id: "title",
          label: blank("title: string"),
          note: "Now a task can have no title, and every list that shows one needs a fallback.",
          cost: ["+1 check per view"],
        },
      },
      {
        depth: 1,
        lead: code("assignee: User"),
        slot: {
          id: "assignee",
          label: blank("assignee: User"),
          note: "Callers can't skip it. They pass a user, or null on purpose.",
          cost: ["forgot it: 1 error"],
        },
      },
      {
        depth: 1,
        lead: code("color?: string"),
        slot: {
          id: "color",
          label: blank("color?: string"),
          note: "Missing and null now both mean grey. Two ways to say one thing.",
          cost: ["2 ways to say grey"],
        },
      },
      { depth: 0, text: code("}") },
    ],
  },
  {
    name: "Fields you asked for",
    prompt: (
      <>
        The client asked for <Code>?fields=name,manager</Code>. Bo has no manager. Nobody asked for
        his phone. Which key do you leave out?
      </>
    ),
    piece: "omit the key",
    answer: "phone",
    rows: [
      { depth: 0, text: code("// GET /users/bo?fields=name,manager") },
      { depth: 0, text: code("{") },
      { depth: 1, text: code('"name": "Bo",') },
      {
        depth: 1,
        lead: code('"manager":'),
        slot: {
          id: "manager",
          label: blank('"manager":'),
          note: "A missing manager reads as not loaded, so the client fetches it again on every view.",
          cost: ["+1 request per view"],
        },
      },
      {
        depth: 1,
        lead: code('"phone":'),
        slot: {
          id: "phone",
          label: blank('"phone":'),
          note: "Nobody asked, so nothing is sent. A missing key says no value was given.",
          cost: ["0 bytes", "0 claims"],
        },
      },
      { depth: 0, text: code("}") },
    ],
  },
];

export function NullVsUndefined() {
  return (
    <RuleLanding
      lead={
        <>
          Six cases, each with the code that blurs the two beside the code that keeps them apart,
          and the data each line produces. Then a mini quiz where you put each nothing in its place.
        </>
      }
      learn={{
        title: "Missing is not empty",
        intro: (
          <>
            <Code style={styles.introCode}>undefined</Code> says no value was given.{" "}
            <Code style={styles.introCode}>null</Code> says the value is empty, on purpose. Each
            example runs the same code twice: on the left where the two blur, on the right where the
            rule keeps them apart. What each line gives sits beside it.
          </>
        ),
      }}
      lessons={LESSONS}
      tldr={TLDR}
      quiz={{
        intro: (
          <>
            Five fields waiting for nothing. Drag each piece to where it belongs, or tap it and then
            tap a spot. A wrong spot tells you what it would cost.
          </>
        ),
        levels: LEVELS,
        board: "code",
      }}
      take="keep missing and empty apart too"
    />
  );
}
