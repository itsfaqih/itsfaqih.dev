import type { Lesson, Tldr } from "./lesson";

export type Person = { name: string; role: "Admin" | "Editor" | "Viewer" };

export const ACCOUNTS = ["Acme", "Globex", "Initech", "Umbrella", "Hooli"];
export const MRR = [12500, 8750.5, 340, 95200, 1111.11];
export const TICKS: readonly (readonly [row: number, value: number])[] = [
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
export const TICK_MS = 1600;
export const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const money = (value: number) =>
  value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export type Roster = {
  phase: "loading" | "error" | "ready";
  settles: boolean;
  users: readonly Person[];
  query: string;
};
export type RosterView = "loading" | "empty" | "error" | "none" | "data";

export const TEAM: readonly Person[] = [
  { name: "Alice Johnson", role: "Admin" },
  { name: "Bob Smith", role: "Editor" },
  { name: "Carol Williams", role: "Viewer" },
  { name: "David Brown", role: "Editor" },
];
export const READY: Roster = { phase: "ready", settles: false, users: TEAM, query: "" };
export const PRESETS: Record<RosterView, Roster> = {
  loading: { ...READY, phase: "loading" },
  empty: { ...READY, users: [] },
  error: { ...READY, phase: "error" },
  none: { ...READY, query: "zed" },
  data: READY,
};
export const VIEW_NAMES: readonly (readonly [RosterView, string])[] = [
  ["loading", "Loading"],
  ["empty", "Empty"],
  ["error", "Error"],
  ["none", "No results"],
  ["data", "Data"],
];

export const matches = (roster: Roster) =>
  roster.users.filter((user) =>
    user.name.toLowerCase().includes(roster.query.trim().toLowerCase()),
  );

export function viewOf(roster: Roster): RosterView {
  if (roster.phase !== "ready") return roster.phase;
  if (roster.users.length === 0) return "empty";
  return matches(roster).length === 0 ? "none" : "data";
}

export const CREW: readonly Person[] = [
  { name: "Ana Li", role: "Admin" },
  { name: "Bob Smith", role: "Editor" },
  { name: "Carol Williams", role: "Viewer" },
  { name: "Ed Ng", role: "Editor" },
];

export type Filter = "all" | "admin" | "owner";

export const STAFF: readonly Person[] = [
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
export const PER_PAGE = 4;

export const FILTERED: Record<Filter, readonly Person[]> = {
  all: STAFF,
  admin: STAFF.filter((person) => person.role === "Admin"),
  owner: [],
};
/** The filter the pager demo opens on. */
export const START_FILTER: Filter = "admin";
export const FILTERS: readonly (readonly [Filter, string])[] = [
  ["all", `All ${FILTERED.all.length}`],
  ["admin", `Admins ${FILTERED.admin.length}`],
  ["owner", `Owners ${FILTERED.owner.length}`],
];

export const URL_PER_PAGE = 3;
export const URL_PAGES = Math.ceil(STAFF.length / URL_PER_PAGE);

export const LESSONS: Lesson[] = [
  {
    title: "Right-align numbers",
    bad: { label: "As typed", costs: ["edges 25px apart", "12500, no commas"] },
    good: { label: "Align right, tabular", costs: ["1 edge", "tabular figures", "12,500.00"] },
    levels: [
      {
        name: "Scan for the biggest",
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
    bad: { label: "Blank", costs: ["3 states, 1 message", "0 next steps"] },
    good: { label: "Say what's next", costs: ["1 next step each", "height holds"] },
    levels: [
      {
        name: "Fill the blank",
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
    bad: { label: "Hover only", costs: ["hidden until hover", "Edit at 3 x-positions"] },
    good: { label: "Last column", costs: ["always there", "1 column, 76px", "2 tooltips"] },
    levels: [
      {
        name: "Place the actions",
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
    bad: { label: "Always there", costs: ["Page 1 of 1", "2 dead arrows"] },
    good: { label: "Show for 2+ pages", costs: ["0 dead controls"] },
    levels: [
      {
        name: "Count the pages",
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
    bad: { label: "In state", costs: ["reload → page 1", "link says /users"] },
    good: { label: "Keep in the URL", costs: ["?page=2", "reload keeps it"] },
    levels: [
      {
        name: "Share page 3",
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
] as const satisfies Tldr;
