import * as stylex from "@stylexjs/stylex";
import { useLayoutEffect, useRef, useState } from "react";
import { reducedMotion } from "../../hooks/use-media-query";
import { fonts, palette } from "../../theme.stylex";
import {
  type Lesson,
  type Level,
  onceOnScreen,
  OUT,
  paint,
  RuleLanding,
  TABBED,
} from "./-components/rule-landing";

type Tone = "no" | "yes";
type Note = { text: string; tone?: Tone; error?: true };
type Line = { c: string; hot?: boolean; note?: Note };

const TOKEN =
  /(\/\/.*)|("(?:[^"\\]|\\.)*"|`[^`]*`)|\b(export|default|function|import|from|type|interface|extends|enum|const|let|return|as|true|false)\b|\b([A-Z][A-Za-z]*)\b|\b(\d+)\b/g;
const PHONE = "@media (max-width: 640px)";

const styles = stylex.create({
  kw: { color: "var(--c-ink)" },
  ty: { color: palette["--text"], fontWeight: 600 },
  str: { color: `color-mix(in oklab, ${palette["--ar"]} ${palette["--ink-mix"]}, #000)` },
  quiet: { color: palette["--mute"] },
  view: {
    display: "grid",
    gridTemplateRows: "1fr auto",
    gap: "14px",
  },
  code: {
    position: "relative",
    display: "grid",
    gap: "2px",
    alignContent: "start",
    fontSize: { default: "12.5px", [PHONE]: "12px" },
    lineHeight: 1.5,
    fontFamily: fonts["--mono"],
  },
  line: {
    position: "relative",
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
      [stylex.when.ancestor('[data-side="bad"]')]: "color-mix(in srgb, var(--no) 10%, transparent)",
      [stylex.when.ancestor('[data-side="good"]')]: "color-mix(in srgb, var(--c) 10%, transparent)",
    },
    boxShadow: {
      default: null,
      [stylex.when.ancestor('[data-side="bad"]')]: "inset 2px 0 0 var(--no)",
      [stylex.when.ancestor('[data-side="good"]')]: "inset 2px 0 0 var(--c)",
    },
  },
  source: {
    position: "relative",
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
    backgroundColor: "color-mix(in srgb, var(--no) 16%, transparent)",
    color: "var(--no-ink)",
  },
  outYes: {
    backgroundColor: "color-mix(in srgb, var(--yes) 18%, transparent)",
    color: "var(--yes-ink)",
  },
  // A squiggle under the line, drawn by a mask so it takes the tone's colour.
  squiggle: {
    position: "absolute",
    right: 0,
    bottom: "-3px",
    left: 0,
    height: "4px",
    backgroundColor: "var(--no)",
    transformOrigin: "left",
    pointerEvents: "none",
    maskImage:
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='4'%3E%3Cpath d='M0 3 1.5 1 3 3 4.5 1 6 3' fill='none' stroke='black' stroke-width='1.2'/%3E%3C/svg%3E\")",
    maskRepeat: "repeat-x",
    maskPosition: "left",
    maskSize: "6px 4px",
  },
  squiggleYes: {
    backgroundColor: "var(--c)",
  },
  cursor: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: "26px",
    borderRadius: "6px",
    backgroundColor: "color-mix(in srgb, var(--c) 14%, transparent)",
    boxShadow: "inset 0 -2px 0 var(--c)",
    opacity: 0,
    transformOrigin: "top",
    pointerEvents: "none",
  },
  unrun: {
    opacity: 0,
  },
  term: {
    display: "flex",
    flexWrap: "wrap",
    rowGap: "8px",
    columnGap: "10px",
    alignItems: "center",
    paddingTop: "12px",
    borderTopWidth: "1.5px",
    borderTopStyle: "dashed",
    borderTopColor: palette["--hair"],
    fontWeight: 600,
    fontSize: "12px",
    lineHeight: "normal",
    fontFamily: fonts["--mono"],
  },
  command: {
    color: "var(--c-ink)",
  },
  summary: {
    color: palette["--dim"],
  },
  run: {
    marginLeft: "auto",
    opacity: { default: null, ":disabled": 0.5 },
  },
  boardCode: {
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  },
  holds: {
    color: {
      default: palette["--dim"],
      [stylex.when.ancestor(":enabled")]: palette["--text"],
    },
  },
  gap: {
    display: { default: null, [stylex.when.ancestor("[data-off]")]: "none" },
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    width: "3.2em",
    height: "1.1em",
    borderBottomWidth: "2px",
    borderBottomStyle: "solid",
    borderBottomColor: "color-mix(in srgb, var(--c) 55%, transparent)",
  },
});

const KINDS = [styles.quiet, styles.str, styles.kw, styles.ty, styles.quiet];

const STEP = 110;

type Phase = "idle" | "run" | "done";

function Checked({ lines }: { lines: Line[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("done");
  const [runs, setRuns] = useState(0);
  const touched = useRef(false);
  const errors = lines.filter((line) => line.note?.error).length;

  function run() {
    setRuns((count) => count + 1);
    setPhase(reducedMotion() ? "done" : "run");
  }

  useLayoutEffect(() => {
    const view = ref.current;
    if (
      !view ||
      reducedMotion() ||
      matchMedia(TABBED).matches ||
      view.getBoundingClientRect().top < innerHeight * 0.7
    )
      return;
    setPhase("idle");
    let wait = 0;
    const stop = onceOnScreen(view, () => {
      wait = window.setTimeout(() => {
        if (!touched.current) run();
      }, 300);
    });
    return () => {
      stop();
      clearTimeout(wait);
    };
  }, []);

  useLayoutEffect(() => {
    const view = ref.current;
    if (!view || runs === 0) return;
    const rows = [...view.querySelectorAll<HTMLElement>(".ts-ln")];
    const marks = view.querySelectorAll<HTMLElement>(".ts-out, .ts-sq");
    if (reducedMotion()) {
      for (const mark of marks) {
        mark.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
      }
      return;
    }
    const total = rows.length * STEP;
    const cursor = view.querySelector<HTMLElement>(".ts-cursor");
    cursor?.animate(
      [
        ...rows.map((row, index) => ({
          offset: index / rows.length,
          opacity: 1,
          transform: `translateY(${row.offsetTop}px) scaleY(${row.offsetHeight / 26})`,
          easing: OUT,
        })),
        {
          offset: 1,
          opacity: 0,
          transform: `translateY(${rows.at(-1)?.offsetTop ?? 0}px)`,
        },
      ],
      { duration: total },
    );
    rows.forEach((row, index) => {
      const delay = index * STEP + 40;
      row.querySelector(".ts-out")?.animate(
        [
          { opacity: 0, transform: "translateX(-6px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: 200, delay, easing: OUT, fill: "backwards" },
      );
      row.querySelector(".ts-sq")?.animate([{ transform: "scaleX(0)" }, { transform: "none" }], {
        duration: 240,
        delay,
        easing: OUT,
        fill: "backwards",
      });
    });
    const timer = window.setTimeout(() => setPhase("done"), total);
    return () => clearTimeout(timer);
  }, [runs]);

  const summary =
    phase === "idle"
      ? "not run yet"
      : phase === "run"
        ? "checking…"
        : errors === 1
          ? "1 error"
          : `${errors} errors`;

  return (
    <div ref={ref} {...stylex.props(styles.view)}>
      <div {...stylex.props(styles.code)}>
        <i aria-hidden="true" className={`ts-cursor ${stylex.props(styles.cursor).className}`} />
        {lines.map((line, index) => (
          <div
            key={index}
            className={`ts-ln ${stylex.props(styles.line, line.hot && styles.hot).className}`}
          >
            <code {...stylex.props(styles.source)}>
              {line.c ? paint(line.c, TOKEN, KINDS) : " "}
              {line.note?.error && (
                <i
                  className={`ts-sq ${stylex.props(styles.squiggle, line.note.tone === "yes" && styles.squiggleYes, phase === "idle" && styles.unrun).className}`}
                />
              )}
            </code>
            {line.note && (
              <span
                className={`ts-out ${stylex.props(styles.out, line.note.tone === "no" && styles.outNo, line.note.tone === "yes" && styles.outYes, phase === "idle" && styles.unrun).className}`}
              >
                <span className="sr-only">{line.note.error ? "error: " : "gives "}</span>
                {line.note.text}
              </span>
            )}
          </div>
        ))}
      </div>
      <div {...stylex.props(styles.term)}>
        <span {...stylex.props(styles.command)}>$ tsc</span>
        <span aria-live="polite" {...stylex.props(styles.summary)}>
          {summary}
        </span>
        <button
          type="button"
          className={`btn soft sm ${stylex.props(styles.run).className}`}
          disabled={phase === "run"}
          onClick={() => {
            touched.current = true;
            run();
          }}
        >
          Run tsc
        </button>
      </div>
    </div>
  );
}

const LESSONS: Lesson[] = [
  {
    title: "Name it once",
    body: (
      <>
        Export each function by name, with the <code>function</code> keyword. A default export takes
        whatever name each importer gives it, so a typo compiles and the stack trace says{" "}
        <code>default</code>. Keep arrow functions for callbacks.
      </>
    ),
    bad: {
      label: "Default export",
      costs: ["2 names, 1 function", "typo: 0 errors"],
      view: (
        <Checked
          lines={[
            { c: "// cart.ts" },
            {
              c: "export default function (items: Item[]) {…}",
              hot: true,
              note: { text: "stack: at default", tone: "no" },
            },
            { c: "// checkout.tsx" },
            { c: 'import total from "./cart"' },
            { c: "// receipt.tsx" },
            { c: 'import calcTotl from "./cart"', note: { text: "0 errors", tone: "no" } },
          ]}
        />
      ),
    },
    good: {
      label: "By name",
      costs: ["1 name", "typo: TS2724"],
      view: (
        <Checked
          lines={[
            { c: "// cart.ts" },
            {
              c: "export function calculateTotal(items: Item[]) {…}",
              hot: true,
              note: { text: "stack: at calculateTotal", tone: "yes" },
            },
            { c: "// checkout.tsx" },
            { c: 'import { calculateTotal } from "./cart"' },
            { c: "// receipt.tsx" },
            {
              c: 'import { calculateTotl } from "./cart"',
              note: { text: "TS2724: did you mean 'calculateTotal'?", tone: "yes", error: true },
            },
          ]}
        />
      ),
    },
  },
  {
    title: "Extend with interface",
    body: (
      <>
        Use <code>type</code> for shapes, unions and aliases. To build one shape on another, use{" "}
        <code>interface … extends</code>: a clash fails on the declaration, in plain words. With{" "}
        <code>&</code> the clash compiles, the field turns into <code>never</code>, and the error
        waits for the first object that tries to fill it.
      </>
    ),
    bad: {
      label: "User & {…}",
      costs: ["0 errors at the type", "TS2322 at the use"],
      view: (
        <Checked
          lines={[
            { c: "type User = { id: string; name: string }" },
            {
              c: "type Admin = User & { id: number }",
              hot: true,
              note: { text: "id: never", tone: "no" },
            },
            { c: "// later, in admin.ts" },
            {
              c: 'const ana: Admin = { id: 1, name: "Ana" }',
              note: {
                text: "TS2322: 'number' is not assignable to 'never'",
                tone: "no",
                error: true,
              },
            },
          ]}
        />
      ),
    },
    good: {
      label: "extends User",
      costs: ["TS2430 at the type"],
      view: (
        <Checked
          lines={[
            { c: "type User = { id: string; name: string }" },
            {
              c: "interface Admin extends User {",
              hot: true,
              note: { text: "TS2430: incorrectly extends 'User'", tone: "yes", error: true },
            },
            { c: "  id: number", note: { text: "'number' is not 'string'", tone: "yes" } },
            { c: "}" },
          ]}
        />
      ),
    },
  },
  {
    title: "Unions, not enums",
    body: (
      <>
        A string enum is a runtime object with its own rules: it won't take the plain string it
        stands for, it adds JavaScript to your bundle, and Node's type stripping refuses to run it.
        A union of strings is only a type.
      </>
    ),
    extra: (
      <p className="tip">
        Need the values at runtime too? Write{" "}
        <code>const ROLES = ["ADMIN", "VIEWER"] as const</code> and derive the type from it.
      </p>
    ),
    bad: {
      label: "enum Role",
      costs: ["+5 lines of JS", 'TS2345 on "ADMIN"'],
      view: (
        <Checked
          lines={[
            {
              c: 'enum Role { Admin = "ADMIN", Viewer = "VIEWER" }',
              hot: true,
              note: { text: "+5 lines of JS", tone: "no" },
            },
            { c: "function setRole(role: Role) {…}" },
            { c: "setRole(Role.Admin)" },
            {
              c: 'setRole("ADMIN")',
              note: { text: "TS2345: '\"ADMIN\"' is not a 'Role'", tone: "no", error: true },
            },
          ]}
        />
      ),
    },
    good: {
      label: "String union",
      costs: ["0 lines of JS", "typo: TS2345"],
      view: (
        <Checked
          lines={[
            {
              c: 'type Role = "ADMIN" | "VIEWER"',
              hot: true,
              note: { text: "0 lines of JS", tone: "yes" },
            },
            { c: "function setRole(role: Role) {…}" },
            { c: 'setRole("ADMIN")', note: { text: "0 errors" } },
            {
              c: 'setRole("ADMN")',
              note: { text: "TS2345: '\"ADMN\"' is not a 'Role'", tone: "yes", error: true },
            },
          ]}
        />
      ),
    },
  },
  {
    title: "Infer inside, annotate the edges",
    body: (
      <>
        Let TypeScript infer local values. A label on a local only widens it. Annotate where a
        contract starts: a return type, a public API. Then a typo fails where you wrote it, not in
        some caller.
      </>
    ),
    bad: {
      label: "Label locals",
      costs: ["TS2345 from a label", "typo: TS2339 at the caller"],
      view: (
        <Checked
          lines={[
            { c: 'const role: string = "ADMIN"', hot: true },
            {
              c: "setRole(role)",
              note: { text: "TS2345: 'string' is not a 'Role'", tone: "no", error: true },
            },
            { c: "function getUser() {", hot: true },
            { c: '  return { id: "1", nmae: "Ana" }', note: { text: "0 errors", tone: "no" } },
            { c: "}" },
            {
              c: "getUser().name",
              note: { text: "TS2339: no 'name' here", tone: "no", error: true },
            },
          ]}
        />
      ),
    },
    good: {
      label: "Label edges",
      costs: ["0 labels on locals", "typo: TS2353 at the return"],
      view: (
        <Checked
          lines={[
            { c: 'const role = "ADMIN"', hot: true, note: { text: 'role: "ADMIN"', tone: "yes" } },
            { c: "setRole(role)", note: { text: "0 errors" } },
            { c: "function getUser(): User {", hot: true },
            {
              c: '  return { id: "1", nmae: "Ana" }',
              note: { text: "TS2353: 'nmae' is not in 'User'", tone: "yes", error: true },
            },
            { c: "}" },
            { c: "getUser().name" },
          ]}
        />
      ),
    },
  },
  {
    title: "One options object",
    body: (
      <>
        Past two parameters, take one object. Four arguments in a row are a guessing game at every
        call, and two strings swap without a word. Named keys can't swap, read on their own, and
        take a new optional field without breaking a caller.
      </>
    ),
    bad: {
      label: "4 arguments",
      costs: ["swap: 0 errors", "role typo: 0 errors"],
      view: (
        <Checked
          lines={[
            { c: "function createUser(name: string," },
            { c: "  email: string, role: string, active: boolean)" },
            {
              c: 'createUser("ana@x.io", "Ana", "admin", true)',
              hot: true,
              note: { text: "0 errors", tone: "no" },
            },
            { c: '// saved: name "ana@x.io", email "Ana"' },
          ]}
        />
      ),
    },
    good: {
      label: "{ options }",
      costs: ["swap: impossible", "role typo: TS2820"],
      view: (
        <Checked
          lines={[
            { c: "function createUser(options: { name: string;" },
            { c: '  email: string; role?: "admin" | "user" })' },
            {
              c: 'createUser({ email: "ana@x.io", name: "Ana" })',
              hot: true,
              note: { text: "0 errors, any order", tone: "yes" },
            },
            {
              c: 'createUser({ name, email, role: "admn" })',
              note: { text: "TS2820: did you mean '\"admin\"'?", tone: "yes", error: true },
            },
          ]}
        />
      ),
    },
  },
  {
    title: "Turn the flags on",
    body: (
      <>
        <code>strict</code> is the floor, not the ceiling. Even under it, <code>users[0]</code>{" "}
        reads as a <code>User</code> on an empty list. <code>noUncheckedIndexedAccess</code> makes
        every index read say it may be missing.
      </>
    ),
    extra: (
      <p className="tip">
        Add <code>verbatimModuleSyntax</code> too, so a type import must say{" "}
        <code>import type</code>. Write ESM only: <code>import</code> and <code>export</code>, never{" "}
        <code>require</code>.
      </p>
    ),
    bad: {
      label: "strict only",
      costs: ["0 errors", "1 TypeError in prod"],
      view: (
        <Checked
          lines={[
            { c: '// tsconfig: "strict": true' },
            { c: "const first = users[0]", hot: true, note: { text: "first: User", tone: "no" } },
            { c: "first.name.toUpperCase()", note: { text: "TypeError at runtime", tone: "no" } },
            { c: "// users is [] on a new account" },
          ]}
        />
      ),
    },
    good: {
      label: "+ noUnchecked…",
      costs: ["TS18048 at build", "0 crashes"],
      view: (
        <Checked
          lines={[
            { c: '// + "noUncheckedIndexedAccess": true' },
            {
              c: "const first = users[0]",
              hot: true,
              note: { text: "first: User | undefined", tone: "yes" },
            },
            {
              c: "first.name.toUpperCase()",
              note: { text: "TS18048: possibly 'undefined'", tone: "yes", error: true },
            },
            { c: 'first?.name ?? "No users yet"', note: { text: "0 errors" } },
          ]}
        />
      ),
    },
  },
];

const TLDR = [
  ["A function other files use", "export function name()"],
  ["A shape, a union, an alias", "type"],
  ["One shape built on another", "interface … extends"],
  ["A fixed set of values", "A string union, not an enum"],
  ["A local value", "Infer it. Annotate returns and APIs."],
  ["Three or more parameters", "One options object"],
  ["A new tsconfig", "strict, noUncheckedIndexedAccess, verbatimModuleSyntax, ESM"],
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
const holds = (text: string) => (
  <code {...stylex.props(styles.boardCode, styles.holds)}>{paint(text, TOKEN, KINDS)}</code>
);

const LEVELS: Level[] = [
  {
    name: "Send an email",
    prompt: <>Strings in a row swap without a word. Which signature takes an options object?</>,
    piece: "options",
    answer: "send",
    rows: [
      {
        depth: 0,
        lead: code("function double("),
        slot: {
          id: "double",
          label: holds("n: number"),
          note: "One argument can't be swapped. Wrapping it adds a type and braces for nothing.",
          cost: ["+1 type", "0 swaps prevented"],
        },
      },
      {
        depth: 0,
        lead: code("function fullName("),
        slot: {
          id: "name",
          label: holds("first, last"),
          note: "Two arguments still read fine at the call. The rule starts at three.",
          cost: ["+1 type for 2 args"],
        },
      },
      {
        depth: 0,
        lead: code("function sendEmail("),
        slot: {
          id: "send",
          label: holds("to, subject, body"),
          note: "Three strings in a row swap without an error. Named keys can't.",
          cost: ["swap: impossible"],
        },
      },
    ],
  },
  {
    name: "The role list",
    prompt: (
      <>
        You loop over the roles at runtime and want a <code>Role</code> type that stays in step with
        the list. Where does <code>as const</code> go?
      </>
    ),
    piece: "as const",
    answer: "roles",
    rows: [
      {
        depth: 0,
        lead: code('const ROLES = ["ADMIN", "EDITOR"]'),
        slot: {
          id: "roles",
          label: blank('const ROLES = ["ADMIN", "EDITOR"]'),
          note: "ROLES becomes a readonly tuple, so Role is the union. No enum, no extra JavaScript.",
          cost: ["Role: 2 members", "0 enum lines"],
        },
      },
      {
        depth: 0,
        lead: code('let role = "ADMIN"'),
        slot: {
          id: "role",
          label: blank('let role = "ADMIN"'),
          note: 'role is a let you mean to change. Frozen to "ADMIN", the next assignment fails.',
          cost: ["TS2322 on reassign"],
        },
      },
      {
        depth: 0,
        lead: code("const limit = 3"),
        slot: {
          id: "limit",
          label: blank("const limit = 3"),
          note: "A const 3 is already the literal 3. ROLES stays string[], so Role is any string.",
          cost: ["Role: string", "typo: 0 errors"],
        },
      },
      { depth: 0, text: code("type Role = (typeof ROLES)[number]") },
    ],
  },
  {
    name: "The contract",
    prompt: (
      <>
        <code>getUser</code> is the module's public API, and <code>find</code> may come back empty.
        Where does <code>: User</code> go?
      </>
    ),
    piece: ": User",
    answer: "ret",
    rows: [
      {
        depth: 0,
        lead: code("export function getUser(id: string)"),
        slot: {
          id: "ret",
          label: blank("export function getUser(id: string)"),
          note: "The return type is the contract. find can miss, so the build fails at the return, inside getUser.",
          cost: ["TS2322 at the return"],
        },
      },
      { depth: 1, text: code("return users.find((u) => u.id === id)") },
      { depth: 0, text: code("// profile.tsx") },
      {
        depth: 0,
        lead: code("const user"),
        slot: {
          id: "local",
          label: blank("const user"),
          note: "The error moves into this caller, and every other caller still gets User | undefined.",
          cost: ["error at 1 of N callers"],
        },
      },
      { depth: 1, text: code("= getUser(params.id)") },
      {
        depth: 0,
        lead: code("users.map((u"),
        slot: {
          id: "param",
          label: blank("users.map((u"),
          note: "map already knows u is a User. The label repeats it and catches nothing.",
          cost: ["0 errors caught"],
        },
      },
    ],
  },
  {
    name: "The crash report",
    prompt: (
      <>
        <code>users[0].name</code> crashed in production on an empty list. <code>strict</code> is
        already on. Which flag would have failed the build?
      </>
    ),
    piece: "true",
    answer: "index",
    rows: [
      { depth: 0, text: code('"compilerOptions": {') },
      { depth: 1, text: code('"strict": true,') },
      {
        depth: 1,
        lead: code('"noImplicitAny":'),
        slot: {
          id: "any",
          label: blank('"noImplicitAny":'),
          note: "strict already turns it on. users[0] still reads as User, so the crash ships.",
          cost: ["0 new errors"],
        },
      },
      {
        depth: 1,
        lead: code('"noUncheckedIndexedAccess":'),
        slot: {
          id: "index",
          label: blank('"noUncheckedIndexedAccess":'),
          note: "users[0] becomes User | undefined, and .name fails with TS18048 before it ships.",
          cost: ["TS18048 at build", "0 crashes"],
        },
      },
      {
        depth: 1,
        lead: code('"verbatimModuleSyntax":'),
        slot: {
          id: "verbatim",
          label: blank('"verbatimModuleSyntax":'),
          note: "It makes type imports say import type. Worth having, but users[0] still reads as User.",
          cost: ["crash: 0 errors"],
        },
      },
      { depth: 0, text: code("}") },
    ],
  },
];

export function TypeScriptCodeWriting() {
  return (
    <RuleLanding
      className="typescript-code-writing"
      lead={
        <>
          Six habits, each with the loose code beside the precise one and what tsc says about every
          line. Then a mini quiz where you put each piece where it belongs.
        </>
      }
      learn={{
        title: "Let the compiler catch it",
        intro: (
          <>
            Each example is the same code written twice: loose on the left, precise on the right.
            tsc reads both from the top, and what it says about a line sits beside that line. A
            squiggle marks a compile error.
          </>
        ),
      }}
      lessons={LESSONS}
      tldr={TLDR}
      quiz={{
        intro: (
          <>
            Four pieces of TypeScript looking for their line. Drag each one into place, or tap it
            and then tap a spot. A wrong spot tells you what it would cost.
          </>
        ),
        levels: LEVELS,
        board: "code",
      }}
      take="write the precise form too"
    />
  );
}
