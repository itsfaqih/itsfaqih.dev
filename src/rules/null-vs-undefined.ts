import type { Lesson, Side, Tldr } from "./lesson";

/** A line of a code pane: its source, and what it gives, toned as the ✕ or ✓ outcome. */
export type Line = { c: string; out?: string; tone?: "no" | "yes"; hot?: boolean };

/** Panes that show code carry their lines; the two live demos draw their own. */
type CodeSide = Side & { lines?: Line[] };

/** One way to fill a field on a pick board (null-pick-board.astro). */
export type FieldOption = {
  /** How the board's answer ids spell this option. */
  key: string;
  /** The segment's text. */
  label: string;
  /** The field's line once this is picked. */
  line: string;
  /** On a board with records, what the field holds after the send. Left out, it keeps `now`. */
  lands?: string;
  /** Why it's wrong. The field's answer has none. */
  note?: string;
};

/** A field on a pick board: its line before a pick, its options, and the right one's key. */
export type PickField = {
  name: string;
  line: string;
  answer: string;
  options: readonly FieldOption[];
  /** What the field holds before the send. A board whose fields have it shows Now, Wanted and Result. */
  now?: string;
};

/** The choice id a set of options, one per field, makes. */
export const pickChoice = (keys: readonly string[]) => keys.join("-");

/** Every way to fill `fields`; a wrong set's note is its first wrong field's. */
type PickSet = { id: string; label: string; note: string };
function pickChoices(fields: readonly PickField[], clear: string): [PickSet, PickSet, ...PickSet[]] {
  const sets = fields.reduce<FieldOption[][]>(
    (all, field) => all.flatMap((set) => field.options.map((option) => [...set, option])),
    [[]],
  );
  const [first, second, ...rest] = sets.map((set) => {
    const wrong = set.find((option, index) => option.key !== fields[index]!.answer);
    return {
      id: pickChoice(set.map((option) => option.key)),
      label: set.map((option) => option.line).join(", "),
      note: wrong ? wrong.note! : clear,
    };
  });
  return [first!, second!, ...rest];
}

/** The marks the "A new task" board offers, by the key its answer ids spell them with. */
const MARKS = [
  ["opt", "?:"],
  ["und", "| undefined"],
  ["nul", "| null"],
] as const;
type Mark = (typeof MARKS)[number][0];

/** A field the "A new task" board types with one of MARKS. */
const typed = (name: string, type: string, answer: Mark, notes: Partial<Record<Mark, string>>): PickField => ({
  name,
  line: `${name}: ${type}`,
  answer,
  options: MARKS.map(([key, label]) => ({
    key,
    label,
    line: key === "opt" ? `${name}?: ${type}` : `${name}: ${type} ${label}`,
    note: notes[key],
  })),
});

export const NEW_TASK: readonly PickField[] = [
  typed("assignee", "User", "nul", {
    opt: "?: lets a caller leave the assignee out and never decide. Make it required, so they pass a user or null on purpose.",
    und: "Callers must pass it now, but undefined reads as nobody gave a value. \"There's no assignee\" is a null someone wrote.",
  }),
  typed("color", "string", "opt", {
    und: "Now every caller has to write color: undefined just to get grey. ?: lets them leave it out.",
    nul: "Now every caller has to pass a colour or null, when most just want grey. ?: lets them leave it out.",
  }),
];
const NEW_TASK_CLEAR =
  "Every caller has to pass an assignee, a user or null on purpose. The colour can be left out, and grey fills in.";

export const LESSONS: Lesson<CodeSide>[] = [
  {
    title: "Tell missing from empty",
    bad: {
      label: "Both null",
      costs: ["1 user nagged"],
      lines: [
        { c: "ask = (u) => u.phone === null", hot: true },
        { c: "// Ana skipped it. Bo has none." },
        { c: '{ "name": "Ana", "phone": null }', out: "ask: true" },
        { c: '{ "name": "Bo", "phone": null }', out: "ask: true", tone: "no" },
      ],
    },
    good: {
      label: "Keep them apart",
      costs: ["0 nagged"],
      lines: [
        { c: "ask = (u) => u.phone === undefined", hot: true },
        { c: "// Ana skipped it. Bo has none." },
        { c: '{ "name": "Ana" }', out: "ask: true" },
        { c: '{ "name": "Bo", "phone": null }', out: "ask: false", tone: "yes" },
      ],
    },
    levels: [
      {
        name: "Fields you asked for",
        piece: "omit the key",
        answer: "phone",
        rows: [
          { depth: 0, text: "// GET /users/bo?fields=name,manager" },
          { depth: 0, text: "{" },
          { depth: 1, text: '"name": "Bo",' },
          {
            depth: 1,
            lead: '"manager":',
            slot: {
              id: "manager",
              label: '"manager":',
              note: "A missing manager reads as not loaded, so the client fetches it again on every view.",
            },
          },
          {
            depth: 1,
            lead: '"phone":',
            slot: {
              id: "phone",
              label: '"phone":',
              note: "Nobody asked, so send nothing. A missing key means no value was given.",
            },
          },
          { depth: 0, text: "}" },
        ],
      },
    ],
  },
  {
    title: "Mark optional with ?:",
    bad: {
      label: "string | null",
      costs: ["1 type error", "null at every call"],
      lines: [
        { c: "function welcome(name: string | null) {", hot: true },
        { c: '  return `Hi, ${name ?? "guest"}`' },
        { c: "}" },
        { c: "welcome()", out: "TS2554: Expected 1 argument", tone: "no" },
        { c: "welcome(null)", out: '"Hi, guest"' },
      ],
    },
    good: {
      label: "name?: string",
      costs: ["0 errors", "0 extra args"],
      lines: [
        { c: "function welcome(name?: string) {", hot: true },
        { c: '  return `Hi, ${name ?? "guest"}`' },
        { c: "}" },
        { c: "welcome()", out: '"Hi, guest"', tone: "yes" },
        { c: 'welcome("Ana")', out: '"Hi, Ana"' },
      ],
    },
    levels: [
      {
        name: "A skippable field",
        piece: "?: string",
        answer: "nickname",
        rows: [
          { depth: 0, text: "type SignUp = {" },
          {
            depth: 1,
            lead: "email",
            slot: {
              id: "email",
              label: "email: string",
              note: "Every sign-up needs an email. Optional lets a caller forget it with no error.",
            },
          },
          {
            depth: 1,
            lead: "nickname",
            slot: {
              id: "nickname",
              label: "nickname: string",
              note: "Make it optional. Callers with no nickname leave it out, and it reads undefined.",
            },
          },
          {
            depth: 1,
            lead: "password",
            slot: {
              id: "password",
              label: "password: string",
              note: "A sign-up with no password should fail where it's written, not at the first login.",
            },
          },
          { depth: 0, text: "}" },
        ],
      },
    ],
  },
  {
    title: "Clear with null",
    bad: { label: "= undefined", costs: ["{} sent", "clear lost"] },
    good: { label: "= null", costs: ["1 field cleared"] },
    levels: [
      {
        name: "The date picker",
        piece: "null",
        answer: "due",
        rows: [
          { depth: 0, text: 'patch("/tasks/12", {' },
          { depth: 1, text: 'title: "Ship v2",' },
          {
            depth: 1,
            lead: "assignee:",
            slot: {
              id: "assignee",
              label: "assignee:",
              note: "Sends assignee: null and unassigns Rina. Nobody asked for that.",
            },
          },
          {
            depth: 1,
            lead: "due:",
            slot: {
              id: "due",
              label: "due:",
              note: "Send null to clear it, since they cleared it on purpose.",
            },
          },
          {
            depth: 1,
            lead: "notes:",
            slot: {
              id: "notes",
              label: "notes:",
              note: "Sends notes: null and wipes notes the user never opened.",
            },
          },
          { depth: 0, text: "})" },
        ],
      },
    ],
  },
  {
    title: "Leave untouched fields out",
    bad: { label: "Every field", costs: ["2 fields wiped"] },
    good: { label: "Only changes", costs: ["0 fields wiped"] },
    levels: [
      {
        name: "Only the title",
        piece: "undefined",
        answer: "due",
        rows: [
          { depth: 0, text: "const changes = {" },
          {
            depth: 1,
            lead: "title:",
            slot: {
              id: "title",
              label: "title:",
              note: "undefined drops out of the JSON, so the rename never reaches the server.",
            },
          },
          {
            depth: 1,
            lead: "reviewer:",
            slot: {
              id: "reviewer",
              label: "reviewer:",
              note: "The removal drops out of the JSON, so the reviewer stays.",
            },
          },
          {
            depth: 1,
            lead: "due:",
            slot: {
              id: "due",
              label: "due:",
              note: "Leave it undefined so the server leaves due alone.",
            },
          },
          { depth: 0, text: "}" },
          { depth: 0, text: 'patch("/tasks/12", changes)' },
        ],
      },
    ],
  },
  {
    title: "Force the decision",
    bad: {
      label: "assignee?: User",
      costs: ["forgot it: 0 errors"],
      lines: [
        { c: "type Task = {" },
        { c: "  title: string" },
        { c: "  assignee?: User", hot: true },
        { c: "}" },
        { c: "save({ title })", out: "0 errors", tone: "no" },
        { c: '// shows "Unassigned". Nobody chose it.' },
      ],
    },
    good: {
      label: "User | null",
      costs: ["forgot it: 1 error"],
      lines: [
        { c: "type Task = {" },
        { c: "  title: string" },
        { c: "  assignee: User | null", hot: true },
        { c: "}" },
        { c: "save({ title })", out: "TS2741: 'assignee' is missing", tone: "yes" },
        { c: "save({ title, assignee: null })", out: "0 errors" },
      ],
    },
    levels: [
      {
        name: "A new task",
        answer: pickChoice(NEW_TASK.map((field) => field.answer)),
        choices: pickChoices(NEW_TASK, NEW_TASK_CLEAR),
      },
    ],
  },
  {
    title: "Return null for not found",
    bad: {
      label: "Send undefined",
      costs: ["0-byte body", "1 SyntaxError"],
      lines: [
        { c: "const user = users.get(email)", out: "undefined" },
        {
          c: "const body = JSON.stringify(user)",
          out: "undefined, 0 bytes",
          tone: "no",
          hot: true,
        },
        { c: "// on the client" },
        { c: "JSON.parse(body)", out: "SyntaxError: Unexpected end of JSON input", tone: "no" },
      ],
    },
    good: {
      label: "Send null",
      costs: ["4-byte body", "0 errors"],
      lines: [
        { c: "const user = users.get(email)", out: "undefined" },
        {
          c: "const body = JSON.stringify(user ?? null)",
          out: '"null", 4 bytes',
          tone: "yes",
          hot: true,
        },
        { c: "// on the client" },
        { c: "JSON.parse(body)", out: 'null: "No such user"', tone: "yes" },
      ],
    },
    levels: [
      {
        name: "Two sign-ups",
        piece: "null",
        answer: "bo",
        rows: [
          { depth: 0, text: "const seen = new Map([" },
          { depth: 1, text: '["ana@x.io", { id: 7 }],' },
          {
            depth: 1,
            lead: '["bo@x.io",',
            slot: {
              id: "bo",
              label: '["bo@x.io",',
              note: "Cache null to record that nobody has it, so the next lookup is skipped.",
            },
          },
          {
            depth: 1,
            lead: '["cy@x.io",',
            slot: {
              id: "cy",
              label: '["cy@x.io",',
              note: "Says nobody has cy@x.io before anyone checked. Cy can't sign in until the cache clears.",
            },
          },
          { depth: 0, text: "])" },
        ],
      },
    ],
  },
];

export const TLDR = [
  ["Declared, not assigned yet", "Leave it undefined"],
  ["An argument the caller may skip", "Type it name?: string"],
  ["The user cleared a field", "Set it to null"],
  ["A field the user didn't touch", "Leave it out of the request"],
  ["A field every caller must decide", "Type it T | null, not ?:"],
  ["A lookup that found nothing", "Return null"],
] as const satisfies Tldr;

export type Way = "bad" | "good";
export type Field = "title" | "assignee" | "due" | "reviewer";
export type Row = Partial<Record<Field, string | null>>;
export type Body = Partial<Record<Field, string | null | undefined>>;
export type Phase = "idle" | "sent" | "done";
export type Verdict = "saved" | "kept" | "wiped" | "lost";

const FIELDS: readonly Field[] = ["title", "assignee", "due", "reviewer"];

/** What reaches the server: JSON drops the keys set to undefined. */
export function arrived(body: Body): Row {
  const row: Row = {};
  for (const field of FIELDS) {
    const value = body[field];
    if (value !== undefined) row[field] = value;
  }
  return row;
}

export function verdictOf(field: Field, before: Row, after: Row, intent: Row): Verdict {
  if (field in intent) return after[field] === intent[field] ? "saved" : "lost";
  return after[field] === before[field] ? "kept" : "wiped";
}

/**
 * The two save demos. "clear" removes the reviewer, "rename" edits the title; each sends a PATCH
 * the ✕ way or the ✓ way and shows what the record keeps.
 */
export const DEMOS = {
  clear: {
    fields: ["title", "reviewer"],
    before: { title: "Ship v2", reviewer: "Rina" },
    body: (way: Way): Body => ({ reviewer: way === "bad" ? undefined : null }),
    intent: (): Row => ({ reviewer: null }),
    lines: (way: Way): Line[] => [
      { c: "// ✕ on the reviewer chip" },
      { c: `changes.reviewer = ${way === "bad" ? "undefined" : "null"}`, hot: true },
      { c: 'patch("/tasks/12", changes)' },
    ],
  },
  rename: {
    fields: ["title", "assignee", "due"],
    before: { title: "Ship v1", assignee: "Rina", due: "Nov 3" },
    body: (way: Way, title: string): Body =>
      way === "bad" ? { title, assignee: null, due: null } : { title },
    intent: (title: string): Row => ({ title }),
    lines: (way: Way): Line[] =>
      way === "bad"
        ? [
            { c: "const draft = { title: input.value,", hot: true },
            { c: "  assignee: null, due: null }", hot: true },
            { c: "" },
            { c: 'patch("/tasks/12", draft)' },
          ]
        : [
            { c: "const draft: Partial<Task> = {}", hot: true },
            { c: "" },
            { c: "draft.title = input.value" },
            { c: 'patch("/tasks/12", draft)' },
          ],
  },
} satisfies Record<
  string,
  {
    fields: readonly Field[];
    before: Row;
    body: (way: Way, title: string) => Body;
    intent: (title: string) => Row;
    lines: (way: Way) => Line[];
  }
>;

export type Demo = keyof typeof DEMOS;

/** The title the rename demo's field starts with. */
export const TITLE = "Ship v2";
