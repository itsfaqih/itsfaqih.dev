import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { type Lesson, type Level, RuleLanding } from "./-components/rule-landing";
import "./typescript-code-writing.css";

const OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------- TypeScript, with what tsc says beside each line ----------

type Tone = "no" | "yes";
/** What the compiler, or the runtime, says about one line. Only an `error` counts toward the
 * pane's tsc total and gets a squiggle. */
type Note = { text: string; tone?: Tone; error?: true };
/** `hot` marks the line the lesson is about. */
type Line = { c: string; hot?: boolean; note?: Note };

const TOKEN =
  /(\/\/.*)|("(?:[^"\\]|\\.)*"|`[^`]*`)|\b(export|default|function|import|from|type|interface|extends|enum|const|let|return|as|true|false)\b|\b([A-Z][A-Za-z]*)\b|\b(\d+)\b/g;
const KINDS = ["com", "str", "kw", "ty", "num"] as const;

function paint(source: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let at = 0;
  for (const match of source.matchAll(TOKEN)) {
    if (match.index > at) parts.push(source.slice(at, match.index));
    const kind = KINDS[match.slice(1).findIndex((group) => group !== undefined)];
    parts.push(
      <span key={match.index} className={`t-${kind}`}>
        {match[0]}
      </span>,
    );
    at = match.index + match[0].length;
  }
  if (at < source.length) parts.push(source.slice(at));
  return parts;
}

/** Below this width the kit stacks the panes behind tabs, which plays its own move. */
const TABBED = "(max-width: 820px)";
/** How long the check rests on each line. */
const STEP = 110;

type Phase = "idle" | "run" | "done";

/** A pane of TypeScript that tsc reads top to bottom. It renders checked, so a glance shows the
 * verdict; a lesson still below the fold hides its notes and runs the check once it is on screen. */
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        wait = window.setTimeout(() => {
          if (!touched.current) run();
        }, 300);
      },
      { threshold: 0.6 },
    );
    observer.observe(view);
    return () => {
      observer.disconnect();
      clearTimeout(wait);
    };
  }, []);

  // The cursor steps down the lines; each note lands as the cursor reaches its line.
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
    <div ref={ref} className="ts-view" data-phase={phase}>
      <div className="ts-code">
        <i className="ts-cursor" aria-hidden="true" />
        {lines.map((line, index) => (
          <div key={index} className="ts-ln" data-hot={line.hot || undefined}>
            <code>
              {line.c ? paint(line.c) : " "}
              {line.note?.error && <i className="ts-sq" data-tone={line.note.tone} />}
            </code>
            {line.note && (
              <span className="ts-out" data-tone={line.note.tone}>
                <span className="sr-only">{line.note.error ? "error: " : "gives "}</span>
                {line.note.text}
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="ts-term">
        <span className="ts-cmd">$ tsc</span>
        <span className="ts-sum" aria-live="polite" data-clean={errors === 0 || undefined}>
          {summary}
        </span>
        <button
          type="button"
          className="btn soft sm"
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

// ---------- The lessons ----------

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

// ---------- The quiz levels ----------

const code = (text: string) => <code>{paint(text)}</code>;
const blank = (text: string) => (
  <>
    <span className="sr-only">{text}</span>
    <span className="ts-gap" aria-hidden="true" />
  </>
);
/** A slot that shows what it holds now, until the piece takes its place. */
const holds = (text: string) => <code className="ts-holds">{paint(text)}</code>;

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
