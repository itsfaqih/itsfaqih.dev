import type { Lesson, Side, Tldr } from "./lesson";

export type Note = { text: string; tone?: "no" | "yes"; error?: true };
/** A line of code in a pane, with what tsc says about it. */
export type Line = { c: string; hot?: boolean; note?: Note };

export const LESSONS: Lesson<Side & { lines: Line[] }>[] = [
  {
    title: "Name it once",
    bad: {
      label: "Default export",
      costs: ["2 names, 1 function", "typo: 0 errors"],
      lines: [
        { c: "// cart.ts" },
        {
          c: "export default function (items: Item[]) {…}",
          hot: true,
          note: { text: "stack: at default", tone: "no" },
        },
        { c: "// checkout.ts" },
        { c: 'import total from "./cart"' },
        { c: "// receipt.ts" },
        { c: 'import calcTotl from "./cart"', note: { text: "0 errors", tone: "no" } },
      ],
    },
    good: {
      label: "By name",
      costs: ["1 name", "typo: TS2724"],
      lines: [
        { c: "// cart.ts" },
        {
          c: "export function calculateTotal(items: Item[]) {…}",
          hot: true,
          note: { text: "stack: at calculateTotal", tone: "yes" },
        },
        { c: "// checkout.ts" },
        { c: 'import { calculateTotal } from "./cart"' },
        { c: "// receipt.ts" },
        {
          c: 'import { calculateTotl } from "./cart"',
          note: { text: "TS2724: did you mean 'calculateTotal'?", tone: "yes", error: true },
        },
      ],
    },
    levels: [
      {
        name: "A typo",
        answer: "named",
        choices: [
          {
            id: "default",
            label: "export default function formatPrice",
            note: "Each importer names a default export, so formatPrcie compiles and the stack trace says default.",
          },
          {
            id: "named",
            label: "export function formatPrice",
            note: "Export it by name. Every import must spell formatPrice, so the typo fails where you wrote it.",
          },
          {
            id: "local",
            label: "function formatPrice",
            note: "Without export, all three imports fail, the correct ones too.",
          },
        ],
      },
    ],
  },
  {
    title: "Extend with interface",
    bad: {
      label: "User & {…}",
      costs: ["0 errors at the type", "TS2322 at the use"],
      lines: [
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
      ],
    },
    good: {
      label: "extends User",
      costs: ["TS2430 at the type"],
      lines: [
        { c: "type User = { id: string; name: string }" },
        {
          c: "interface Admin extends User {",
          hot: true,
          note: { text: "TS2430: incorrectly extends 'User'", tone: "yes", error: true },
        },
        { c: "  id: number", note: { text: "'number' is not 'string'", tone: "yes" } },
        { c: "}" },
      ],
    },
    levels: [
      {
        name: "A clash",
        answer: "extends",
        choices: [
          {
            id: "and",
            label: "type Invoice = Order & { total: string }",
            note: "It compiles. total becomes never, and the error shows up at the first Invoice you write.",
          },
          {
            id: "extends",
            label: "interface Invoice extends Order { total: string }",
            note: "Extend it. The clash fails right here, and the message names both types of total.",
          },
          {
            id: "value",
            label: 'const Invoice = { total: "0" }',
            note: "That's a value, not a type. Nothing checks it against Order at all.",
          },
        ],
      },
    ],
  },
  {
    title: "Use unions, not enums",
    bad: {
      label: "enum Role",
      costs: ["+5 lines of JS", 'TS2345 on "ADMIN"'],
      lines: [
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
      ],
    },
    good: {
      label: "String union",
      costs: ["0 lines of JS", "typo: TS2345"],
      lines: [
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
      ],
    },
    levels: [
      {
        name: "The status list",
        piece: "as const",
        answer: "roles",
        rows: [
          {
            depth: 0,
            lead: 'const STATUSES = ["draft", "paid"]',
            slot: {
              id: "roles",
              label: 'const STATUSES = ["draft", "paid"]',
              note: "Freeze the list. STATUSES becomes a readonly tuple, so Status is the union, with no enum and no extra JavaScript.",
            },
          },
          {
            depth: 0,
            lead: 'let status = "draft"',
            slot: {
              id: "role",
              label: 'let status = "draft"',
              note: 'status is a let you mean to change. Frozen to "draft", the next assignment fails.',
            },
          },
          {
            depth: 0,
            lead: "const retries = 3",
            slot: {
              id: "limit",
              label: "const retries = 3",
              note: "A const 3 is already the literal 3. STATUSES stays string[], so Status is any string.",
            },
          },
          { depth: 0, text: "type Status = (typeof STATUSES)[number]" },
        ],
      },
    ],
  },
  {
    title: "Infer inside, annotate the edges",
    bad: {
      label: "Label locals",
      costs: ["TS2345 from a label", "typo: TS2339 at the caller"],
      lines: [
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
      ],
    },
    good: {
      label: "Label edges",
      costs: ["0 labels on locals", "typo: TS2353 at the return"],
      lines: [
        { c: 'const role = "ADMIN"', hot: true, note: { text: 'role: "ADMIN"', tone: "yes" } },
        { c: "setRole(role)", note: { text: "0 errors" } },
        { c: "function getUser(): User {", hot: true },
        {
          c: '  return { id: "1", nmae: "Ana" }',
          note: { text: "TS2353: 'nmae' is not in 'User'", tone: "yes", error: true },
        },
        { c: "}" },
        { c: "getUser().name" },
      ],
    },
    levels: [
      {
        name: "The contract",
        piece: ": Order",
        answer: "ret",
        rows: [
          {
            depth: 0,
            lead: "export function findOrder(id: string)",
            slot: {
              id: "ret",
              label: "export function findOrder(id: string)",
              note: "Annotate the return type, since it is the contract. find can miss, so the build fails at the return, inside findOrder.",
            },
          },
          { depth: 1, text: "return orders.find((o) => o.id === id)" },
          { depth: 0, text: "// refund.ts" },
          {
            depth: 0,
            lead: "const order",
            slot: {
              id: "local",
              label: "const order",
              note: "The error moves into this caller, and every other caller still gets Order | undefined.",
            },
          },
          { depth: 1, text: "= findOrder(req.params.id)" },
          {
            depth: 0,
            lead: "orders.map((o",
            slot: {
              id: "param",
              label: "orders.map((o",
              note: "Skip the label. map already knows o is an Order, and the label catches nothing.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Take one options object",
    bad: {
      label: "4 arguments",
      costs: ["swap: 0 errors", "role typo: 0 errors"],
      lines: [
        { c: "function createUser(name: string," },
        { c: "  email: string, role: string, active: boolean)" },
        {
          c: 'createUser("ana@x.io", "Ana", "admin", true)',
          hot: true,
          note: { text: "0 errors", tone: "no" },
        },
        { c: '// saved: name "ana@x.io", email "Ana"' },
      ],
    },
    good: {
      label: "{ options }",
      costs: ["swap: impossible", "role typo: TS2820"],
      lines: [
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
      ],
    },
    levels: [
      {
        name: "Send an email",
        piece: "options",
        answer: "send",
        rows: [
          {
            depth: 0,
            lead: "function double(",
            slot: {
              id: "double",
              label: "n: number",
              note: "One argument can't be swapped. Wrapping it adds a type and braces for nothing.",
            },
          },
          {
            depth: 0,
            lead: "function fullName(",
            slot: {
              id: "name",
              label: "first, last",
              note: "Two arguments still read fine at the call. The rule starts at three.",
            },
          },
          {
            depth: 0,
            lead: "function sendEmail(",
            slot: {
              id: "send",
              label: "to, subject, body",
              note: "Take one options object. Three strings in a row swap without an error, and named keys can't.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Turn the flags on",
    bad: {
      label: "strict only",
      costs: ["0 errors", "1 TypeError in prod"],
      lines: [
        { c: '// tsconfig: "strict": true' },
        { c: "const first = users[0]", hot: true, note: { text: "first: User", tone: "no" } },
        { c: "first.name.toUpperCase()", note: { text: "TypeError at runtime", tone: "no" } },
        { c: "// users is [] on a new account" },
      ],
    },
    good: {
      label: "+ noUnchecked…",
      costs: ["TS18048 at build", "0 crashes"],
      lines: [
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
      ],
    },
    levels: [
      {
        name: "The crash report",
        piece: "true",
        answer: "index",
        rows: [
          { depth: 0, text: '"compilerOptions": {' },
          { depth: 1, text: '"strict": true,' },
          {
            depth: 1,
            lead: '"noImplicitAny":',
            slot: {
              id: "any",
              label: '"noImplicitAny":',
              note: "strict already turns it on. cells[1] still reads as string, so the crash ships.",
            },
          },
          {
            depth: 1,
            lead: '"noUncheckedIndexedAccess":',
            slot: {
              id: "index",
              label: '"noUncheckedIndexedAccess":',
              note: "Turn it on. cells[1] becomes string | undefined, and .trim() fails with TS18048 before it ships.",
            },
          },
          {
            depth: 1,
            lead: '"verbatimModuleSyntax":',
            slot: {
              id: "verbatim",
              label: '"verbatimModuleSyntax":',
              note: "It makes type imports say import type. Keep it, but cells[1] still reads as string.",
            },
          },
          { depth: 0, text: "}" },
        ],
      },
    ],
  },
];

export const TLDR = [
  ["A function other files use", "Use export function name()"],
  ["A shape, a union, an alias", "Use type"],
  ["One shape built on another", "Use interface … extends"],
  ["A fixed set of values", "Use a string union, not an enum"],
  ["A local value", "Infer it. Annotate returns and APIs."],
  ["Three or more parameters", "Take one options object"],
  ["A new tsconfig", "Enable strict, noUncheckedIndexedAccess, verbatimModuleSyntax and ESM"],
] as const satisfies Tldr;
