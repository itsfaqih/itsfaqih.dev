import type { Lesson, Side, Tldr, TreeRow } from "./lesson";

export const LESSONS: Lesson<Side & { tree: TreeRow[] }>[] = [
  {
    title: "Inline it first",
    bad: {
      label: "In utils/",
      costs: ["2 files", "1 import"],
      tree: [
        { depth: 0, text: "src/", kind: "dir" },
        { depth: 1, text: "routes/orders/", kind: "dir" },
        { depth: 2, text: "refund.ts", tag: "uses it" },
        { depth: 1, text: "utils/", kind: "dir" },
        { k: "fd", depth: 2, text: "to-cents.ts", moved: true },
      ],
    },
    good: {
      label: "Inline",
      costs: ["1 file", "0 imports"],
      tree: [
        { depth: 0, text: "src/", kind: "dir" },
        { depth: 1, text: "routes/orders/", kind: "dir" },
        { depth: 2, text: "refund.ts", tag: "uses it" },
        { k: "fd", depth: 3, text: "function toCents()", moved: true },
      ],
    },
    levels: [
      {
        name: "One caller",
        piece: "toCents()",
        answer: "inline",
        rows: [
          { depth: 0, text: "src/", kind: "dir" },
          { depth: 1, text: "lib/", kind: "dir" },
          {
            depth: 2,
            slot: {
              id: "lib",
              label: "+ money.ts",
              note: "A new file and an import for a single caller. lib/ is utils/ under another name.",
            },
          },
          { depth: 1, text: "routes/orders/", kind: "dir" },
          { depth: 2, text: "refund.ts", tag: "uses it" },
          {
            depth: 3,
            slot: {
              id: "inline",
              label: "↳ inline, above refund()",
              note: "Keep it where it's used, with nothing to import or open.",
            },
          },
          { depth: 1, text: "utils/", kind: "dir" },
          {
            depth: 2,
            slot: {
              id: "utils",
              label: "+ to-cents.ts",
              note: "Three folders from its only caller. Extract it when a second file needs it, not before.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Prefer fewer files",
    bad: {
      label: "A folder",
      costs: ["5 files", "4 imports"],
      tree: [
        { depth: 0, text: "routes/orders/", kind: "dir" },
        { depth: 1, text: "create-order/", kind: "dir" },
        { depth: 2, text: "index.ts" },
        { depth: 2, text: "create-order.ts" },
        { k: "types", depth: 2, text: "types.ts", moved: true },
        { k: "schema", depth: 2, text: "schema.ts", moved: true },
        { k: "helper", depth: 2, text: "helpers.ts", moved: true },
      ],
    },
    good: {
      label: "One file",
      costs: ["1 file", "0 imports"],
      tree: [
        { depth: 0, text: "routes/orders/", kind: "dir" },
        { depth: 1, text: "create-order.ts" },
        { k: "types", depth: 2, text: "type OrderInput", moved: true },
        { k: "schema", depth: 2, text: "const schema", moved: true },
        { k: "helper", depth: 2, text: "function priceItems()", moved: true },
      ],
    },
    levels: [
      {
        name: "A handler's own parts",
        piece: "types · schema · priceItems()",
        answer: "file",
        rows: [
          { depth: 0, text: "src/", kind: "dir" },
          { depth: 1, text: "routes/orders/", kind: "dir" },
          {
            depth: 2,
            slot: {
              id: "folder",
              label: "+ create-order/ index, types, schema, helpers",
              note: "Five files for one handler, so five tabs to read it.",
            },
          },
          { depth: 2, text: "create-order.ts" },
          {
            depth: 3,
            slot: {
              id: "file",
              label: "↳ inside create-order.ts",
              note: "Keep the whole handler in one file.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "kinds",
              label: "+ types/, schemas/, helpers/",
              note: "Sorted by kind, one handler now spans four folders.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Comply with the constraint",
    exception: true,
    bad: {
      label: "In the handler",
      costs: ["every request waits 2 s"],
      tree: [
        { depth: 0, text: "routes/reports/", kind: "dir" },
        { depth: 1, text: "export.ts" },
        { k: "work", depth: 2, text: "function buildReport()", moved: true },
      ],
    },
    good: {
      label: "In a worker",
      costs: ["no request waits"],
      tree: [
        { depth: 0, text: "routes/reports/", kind: "dir" },
        { depth: 1, text: "export.ts" },
        { depth: 1, text: "build-report.worker.ts" },
        { k: "work", depth: 2, text: "function buildReport()", moved: true },
      ],
    },
    levels: [
      {
        name: "A slow export",
        piece: "buildReport()",
        answer: "worker",
        rows: [
          { depth: 0, text: "src/", kind: "dir" },
          { depth: 1, text: "services/", kind: "dir" },
          {
            depth: 2,
            slot: {
              id: "service",
              label: "+ reports.service.ts",
              note: "A new file, but it still runs on the main thread. Every request still waits 2 s.",
            },
          },
          { depth: 1, text: "routes/reports/", kind: "dir" },
          { depth: 2, text: "export.ts", tag: "uses it" },
          {
            depth: 3,
            slot: {
              id: "inline",
              label: "↳ inline, in export.ts",
              note: "It runs on the main thread, so every other request waits 2 s for it.",
            },
          },
          {
            depth: 2,
            slot: {
              id: "worker",
              label: "+ build-report.worker.ts",
              note: "Extract it even when used once. A worker thread runs it, and other requests keep going.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Use the lowest common ancestor",
    bad: {
      label: "In shared/",
      costs: ["2 hops each", "owner unclear"],
      tree: [
        { depth: 0, text: "src/", kind: "dir" },
        { depth: 1, text: "shared/", kind: "dir" },
        { k: "cart", depth: 2, text: "cart.ts", moved: true },
        { depth: 1, text: "routes/shop/", kind: "dir" },
        { depth: 2, text: "cart/summary.ts", tag: "uses it" },
        { depth: 2, text: "checkout/charge.ts", tag: "uses it" },
      ],
    },
    good: {
      label: "In routes/shop/",
      costs: ["1 hop each", "owner: shop"],
      tree: [
        { depth: 0, text: "src/", kind: "dir" },
        { depth: 1, text: "routes/shop/", kind: "dir" },
        { k: "cart", depth: 2, text: "cart.ts", moved: true },
        { depth: 2, text: "cart/summary.ts", tag: "uses it" },
        { depth: 2, text: "checkout/charge.ts", tag: "uses it" },
      ],
    },
    levels: [
      {
        name: "Two callers",
        piece: "getCart()",
        answer: "shop",
        rows: [
          { depth: 0, text: "src/", kind: "dir" },
          { depth: 1, text: "routes/shop/", kind: "dir" },
          {
            depth: 2,
            slot: {
              id: "shop",
              label: "+ cart.ts",
              note: "Move it to routes/shop/, the nearest folder both callers share, so the path names its owner.",
            },
          },
          { depth: 2, text: "cart/", kind: "dir" },
          { depth: 3, text: "summary.ts", tag: "uses it" },
          {
            depth: 3,
            slot: {
              id: "cart",
              label: "+ cart.ts",
              note: "checkout/ would reach into cart/ for it. Move it up to the folder both share.",
            },
          },
          { depth: 2, text: "checkout/", kind: "dir" },
          { depth: 3, text: "charge.ts", tag: "uses it" },
          { depth: 1, text: "shared/", kind: "dir" },
          {
            depth: 2,
            slot: {
              id: "shared",
              label: "+ cart.ts",
              note: "shared/ holds everything, so the path no longer says the shop owns it.",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Give global code a type folder",
    exception: true,
    bad: {
      label: "In settings/",
      costs: ["11 cross-imports"],
      tree: [
        { depth: 0, text: "src/", kind: "dir" },
        { depth: 1, text: "routes/", kind: "dir" },
        { depth: 2, text: "settings/", kind: "dir", tag: "uses it" },
        { k: "auth", depth: 3, text: "require-auth.ts", moved: true },
        { depth: 2, text: "checkout/", kind: "dir", tag: "uses it" },
        { depth: 2, text: "… 10 more routes", kind: "more", tag: "uses it" },
      ],
    },
    good: {
      label: "In middleware/",
      costs: ["1 obvious home"],
      tree: [
        { depth: 0, text: "src/", kind: "dir" },
        { depth: 1, text: "middleware/", kind: "dir" },
        { k: "auth", depth: 2, text: "require-auth.ts", moved: true },
        { depth: 1, text: "routes/", kind: "dir" },
        { depth: 2, text: "settings/", kind: "dir", tag: "uses it" },
        { depth: 2, text: "checkout/", kind: "dir", tag: "uses it" },
        { depth: 2, text: "… 10 more routes", kind: "more", tag: "uses it" },
      ],
    },
    levels: [
      {
        name: "Twelve callers",
        piece: "require-auth.ts",
        answer: "middleware",
        rows: [
          { depth: 0, text: "src/", kind: "dir" },
          {
            depth: 1,
            slot: {
              id: "middleware",
              label: "+ middleware/require-auth.ts",
              note: "Give it a type folder. middleware/ says what it is, and ⌘P finds it.",
            },
          },
          { depth: 1, text: "routes/", kind: "dir" },
          {
            depth: 2,
            slot: {
              id: "routes",
              label: "+ require-auth.ts",
              note: "routes/ is the lowest common ancestor, but a middleware is not a route.",
            },
          },
          { depth: 2, text: "settings/", kind: "dir", tag: "uses it" },
          {
            depth: 3,
            slot: {
              id: "settings",
              label: "+ require-auth.ts",
              note: "Its first caller doesn't own it. Eleven other routes would import from settings/.",
            },
          },
          { depth: 2, text: "… 11 more routes", kind: "more", tag: "uses it" },
        ],
      },
    ],
  },
];

export const TLDR = [
  ["Code used once", "Keep it inline"],
  ["Code too long", "Extract a function, same file"],
  ["Reused in the same file", "Extract a function, same file"],
  ["Reused across files", "Move it to the lowest common ancestor"],
  ["Used almost everywhere", "Use a type folder, like middleware/"],
  ["Your stack demands a boundary", "Comply with the constraint"],
] as const satisfies Tldr;
