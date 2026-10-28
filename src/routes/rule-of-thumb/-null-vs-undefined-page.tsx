import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import {
  type Lesson,
  type Level,
  paint,
  reducedMotion,
  RuleLanding,
  TABBED,
} from "./-components/rule-landing";
import "./null-vs-undefined.css";

// ---------- Code, with what each line gives beside it ----------

type Tone = "no" | "yes";
/** One line of code. `out` is the data the line produces, set on its right. */
type Line = { c: string; out?: string; tone?: Tone; hot?: boolean };

/** `null` gets the thumbnail's solid box and `undefined` its dashed empty slot. */
const TOKEN =
  /(\/\/.*)|("(?:[^"\\]|\\.)*"|`[^`]*`)|\b(null)\b|\b(undefined)\b|\b(const|let|function|return|type|await|new)\b/g;
const KINDS = ["com", "str", "nul", "und", "kw"] as const;

function Code({ lines }: { lines: Line[] }) {
  return (
    <div className="nv-code">
      {lines.map((line, index) => (
        <div key={index} className="nv-ln" data-hot={line.hot || undefined}>
          <code>{line.c ? paint(line.c, TOKEN, KINDS) : " "}</code>
          {line.out && (
            <span className="nv-out" data-tone={line.tone}>
              <span className="sr-only">gives </span>
              {paint(line.out, TOKEN, KINDS)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------- The live saves: a form, the request it sends, the row it lands on ----------

type Way = "bad" | "good";
type Field = "title" | "assignee" | "due" | "reviewer";
/** A task row on the server. */
type Row = Partial<Record<Field, string | null>>;
/** What the client hands to the request. */
type Body = Partial<Record<Field, string | null | undefined>>;
type Phase = "idle" | "sent" | "done";
type Verdict = "saved" | "kept" | "wiped" | "lost";

/** What the server receives. Like JSON.stringify, it drops every key set to undefined. */
function arrived(body: Body): Row {
  const row: Row = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && isField(key)) row[key] = value;
  }
  return row;
}

const FIELDS: readonly Field[] = ["title", "assignee", "due", "reviewer"];
const isField = (key: string): key is Field => FIELDS.some((field) => field === key);

/** A field the user meant to change either landed or got lost; any other field was either kept
 * or wiped by the request. */
function verdictOf(field: Field, before: Row, after: Row, intent: Row): Verdict {
  if (field in intent) return after[field] === intent[field] ? "saved" : "lost";
  return after[field] === before[field] ? "kept" : "wiped";
}

const SEND_MS = 460;

/** The save starts done, so a glance shows the outcome. A lesson still below the fold rewinds
 * to before and saves once it is on screen. */
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

  // Behind the kit's tabs, which already play their own move, the save stays done.
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        wait = window.setTimeout(() => {
          if (!touched.current) send();
        }, 500);
      },
      { threshold: 0.6 },
    );
    observer.observe(flow);
    return () => {
      observer.disconnect();
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
  return (
    <div ref={save.ref} className="nv-flow" data-phase={phase} data-ran={runs > 0 || undefined}>
      <div className="nv-form">{children}</div>
      <div className="nv-wire" key={`w${runs}`}>
        <span className="nv-verb">PATCH /tasks/12</span>
        {phase === "idle" ? (
          <span className="nv-idle">not sent yet</span>
        ) : (
          <code className="nv-body">{paint(JSON.stringify(body), TOKEN, KINDS)}</code>
        )}
        <i className="nv-packet" aria-hidden="true" />
      </div>
      <dl className="nv-rec" key={phase === "done" ? `r${runs}` : "before"}>
        {fields.map((field, index) => {
          const verdict = phase === "done" ? verdictOf(field, before, after, intent) : undefined;
          const value = row[field];
          return (
            <div key={field} className="nv-cell" data-verdict={verdict} style={{ "--i": index }}>
              <dt>{field}</dt>
              <dd>{value === null ? <span className="t-nul">null</span> : value}</dd>
              {verdict && <span className="nv-tag">{verdict}</span>}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

const CLEAR_BEFORE: Row = { title: "Ship v2", reviewer: "Rina" };

/** Lesson 3: the user removes the reviewer, and the change saves on the spot. */
function ClearDemo({ way }: { way: Way }) {
  const save = useSave();
  const cleared = save.phase !== "idle";
  return (
    <div className="nv-view">
      <Code
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
        <span className="nv-label">Reviewer</span>
        {cleared ? (
          <span className="nv-none">None</span>
        ) : (
          <span className="nv-chip">
            Rina
            <button type="button" aria-label="Remove reviewer Rina" onClick={save.send}>
              ✕
            </button>
          </span>
        )}
        {cleared && (
          <button
            type="button"
            className="btn soft sm nv-again"
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

/** Lesson 4: the user renames the task and saves. The title is a real input. */
function RenameDemo({ way }: { way: Way }) {
  const save = useSave();
  const [title, setTitle] = useState("Ship v2");
  const body: Body = way === "bad" ? { title, assignee: null, due: null } : { title };
  const saved = save.phase === "done";
  return (
    <div className="nv-view">
      <Code
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
        <label className="nv-field">
          <span className="nv-label">Title</span>
          <input
            value={title}
            spellCheck={false}
            onChange={(event) => {
              setTitle(event.target.value);
              if (saved) save.reset();
            }}
          />
        </label>
        <button
          type="button"
          className="btn soft sm nv-again"
          disabled={save.phase === "sent"}
          onClick={saved ? save.reset : save.send}
        >
          {saved ? "Reset" : "Save"}
        </button>
      </Flow>
    </div>
  );
}

// ---------- The lessons ----------

const LESSONS: Lesson[] = [
  {
    title: "Missing or empty",
    body: (
      <>
        <code>undefined</code> means nobody gave a value. <code>null</code> means someone checked
        and the answer is nothing. Ana skipped the phone question. Bo said he has no phone. Send
        both as <code>null</code> and no code can tell them apart.
      </>
    ),
    bad: {
      label: "Both null",
      costs: ["1 user nagged"],
      view: (
        <Code
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
        <Code
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
        A value the caller may leave out is <code>undefined</code> when they do. Type it with{" "}
        <code>?:</code>, and the caller just leaves it out. Typed <code>| null</code>, every call
        has to spell out the nothing.
      </>
    ),
    bad: {
      label: "string | null",
      costs: ["1 type error", "null at every call"],
      view: (
        <Code
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
        <Code
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
        When the user empties a field, say so with <code>null</code>. JSON drops every key set to{" "}
        <code>undefined</code>, so a clear sent that way never reaches the server.
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
        A PATCH changes what it carries. Start a draft at <code>null</code> and every field the user
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
        <code>?:</code> lets a caller skip a field without a word. When every caller must decide,
        make the field required and nullable. Forgetting it is then an error, and "nobody" is a{" "}
        <code>null</code> someone wrote on purpose.
      </>
    ),
    bad: {
      label: "assignee?: User",
      costs: ["forgot it: 0 errors"],
      view: (
        <Code
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
        <Code
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
        A lookup that finds nothing has an answer, and the answer is <code>null</code>.{" "}
        <code>Map.get</code> hands you <code>undefined</code>, and <code>JSON.stringify</code> turns
        that into no body at all.
      </>
    ),
    bad: {
      label: "res.json(user)",
      costs: ["0-byte body", "1 SyntaxError"],
      view: (
        <Code
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
        <Code
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

// ---------- The quiz levels ----------

const code = (text: string) => <code>{paint(text, TOKEN, KINDS)}</code>;
/** A field waiting for its value. */
const key = (text: string) => <code>{paint(text, TOKEN, KINDS)}</code>;
const blank = (text: string) => (
  <>
    <span className="sr-only">{text}</span>
    <span className="nv-gap" aria-hidden="true" />
  </>
);

const LEVELS: Level[] = [
  {
    name: "The date picker",
    prompt: (
      <>
        The user pressed ✕ on the due date. They never opened the assignee or the notes. Which field
        gets <code>null</code>?
      </>
    ),
    piece: "null",
    answer: "due",
    rows: [
      { depth: 0, text: code('patch("/tasks/12", {') },
      { depth: 1, text: code('title: "Ship v2",') },
      {
        depth: 1,
        lead: key("assignee:"),
        slot: {
          id: "assignee",
          label: blank("assignee:"),
          note: "Sends assignee: null and unassigns Rina. Nobody asked for that.",
          cost: ["1 field wiped"],
        },
      },
      {
        depth: 1,
        lead: key("due:"),
        slot: {
          id: "due",
          label: blank("due:"),
          note: "They cleared it on purpose, so you send null and the server clears it.",
          cost: ["1 field cleared", "0 wiped"],
        },
      },
      {
        depth: 1,
        lead: key("notes:"),
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
        field can be <code>undefined</code>?
      </>
    ),
    piece: "undefined",
    answer: "due",
    rows: [
      { depth: 0, text: code("const changes = {") },
      {
        depth: 1,
        lead: key("title:"),
        slot: {
          id: "title",
          label: blank("title:"),
          note: "undefined drops out of the JSON, so the rename never reaches the server.",
          cost: ["rename lost"],
        },
      },
      {
        depth: 1,
        lead: key("reviewer:"),
        slot: {
          id: "reviewer",
          label: blank("reviewer:"),
          note: "The removal drops out of the JSON, so the reviewer stays.",
          cost: ["clear lost"],
        },
      },
      {
        depth: 1,
        lead: key("due:"),
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
        You looked up <code>bo@x.io</code> and nobody has that email. You haven't looked up{" "}
        <code>cy@x.io</code> yet. Which entry gets <code>null</code>?
      </>
    ),
    piece: "null",
    answer: "bo",
    rows: [
      { depth: 0, text: code("const seen = new Map([") },
      { depth: 1, text: code('["ana@x.io", { id: 7 }],') },
      {
        depth: 1,
        lead: key('["bo@x.io",'),
        slot: {
          id: "bo",
          label: blank('["bo@x.io",'),
          note: "You checked and nobody has it. null says so, and the next lookup is skipped.",
          cost: ["1 lookup saved"],
        },
      },
      {
        depth: 1,
        lead: key('["cy@x.io",'),
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
        back to grey. Where does <code>| null</code> go?
      </>
    ),
    piece: "| null",
    answer: "assignee",
    rows: [
      { depth: 0, text: code("type NewTask = {") },
      {
        depth: 1,
        lead: key("title: string"),
        slot: {
          id: "title",
          label: blank("title: string"),
          note: "Now a task can have no title, and every list that shows one needs a fallback.",
          cost: ["+1 check per view"],
        },
      },
      {
        depth: 1,
        lead: key("assignee: User"),
        slot: {
          id: "assignee",
          label: blank("assignee: User"),
          note: "Callers can't skip it. They pass a user, or null on purpose.",
          cost: ["forgot it: 1 error"],
        },
      },
      {
        depth: 1,
        lead: key("color?: string"),
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
        The client asked for <code>?fields=name,manager</code>. Bo has no manager. Nobody asked for
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
        lead: key('"manager":'),
        slot: {
          id: "manager",
          label: blank('"manager":'),
          note: "A missing manager reads as not loaded, so the client fetches it again on every view.",
          cost: ["+1 request per view"],
        },
      },
      {
        depth: 1,
        lead: key('"phone":'),
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
      className="null-vs-undefined"
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
            <code>undefined</code> says no value was given. <code>null</code> says the value is
            empty, on purpose. Each example runs the same code twice: on the left where the two
            blur, on the right where the rule keeps them apart. What each line gives sits beside it.
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
