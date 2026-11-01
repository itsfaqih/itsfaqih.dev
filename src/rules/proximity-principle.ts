import type { Lesson, Side, Tldr, TreeRow } from "./lesson";

export const LESSONS: Lesson<Side & { tree: TreeRow[] }>[] = [
  {
    title: "Inline it first",
    bad: {
      label: "In utils/",
      costs: ["2 files", "1 import"],
      tree: [
        { depth: 0, text: "src/", kind: "dir" },
        { depth: 1, text: "routes/profile/", kind: "dir" },
        { depth: 2, text: "user-profile.ts", tag: "uses it" },
        { depth: 1, text: "utils/", kind: "dir" },
        { k: "fd", depth: 2, text: "format-date.ts", moved: true },
      ],
    },
    good: {
      label: "Inline",
      costs: ["1 file", "0 imports"],
      tree: [
        { depth: 0, text: "src/", kind: "dir" },
        { depth: 1, text: "routes/profile/", kind: "dir" },
        { depth: 2, text: "user-profile.ts", tag: "uses it" },
        { k: "fd", depth: 3, text: "function formatDate()", moved: true },
      ],
    },
    levels: [
      {
        name: "One caller",
        piece: "formatDate()",
        answer: "inline",
        rows: [
          { depth: 0, text: "src/", kind: "dir" },
          { depth: 1, text: "lib/", kind: "dir" },
          {
            depth: 2,
            slot: {
              id: "lib",
              label: "+ date.ts",
              note: "A new file and an import for a single caller. lib/ is utils/ under another name.",
            },
          },
          { depth: 1, text: "routes/profile/", kind: "dir" },
          { depth: 2, text: "user-profile.ts", tag: "uses it" },
          {
            depth: 3,
            slot: {
              id: "inline",
              label: "↳ inline, above UserProfile()",
              note: "Keep it where it's used, with nothing to import or open.",
            },
          },
          { depth: 1, text: "utils/", kind: "dir" },
          {
            depth: 2,
            slot: {
              id: "utils",
              label: "+ format-date.ts",
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
        { depth: 0, text: "routes/profile/", kind: "dir" },
        { depth: 1, text: "user-profile/", kind: "dir" },
        { depth: 2, text: "index.ts" },
        { depth: 2, text: "user-profile.ts" },
        { k: "types", depth: 2, text: "types.ts", moved: true },
        { k: "styles", depth: 2, text: "styles.ts", moved: true },
        { k: "hook", depth: 2, text: "helpers.ts", moved: true },
      ],
    },
    good: {
      label: "One file",
      costs: ["1 file", "0 imports"],
      tree: [
        { depth: 0, text: "routes/profile/", kind: "dir" },
        { depth: 1, text: "user-profile.ts" },
        { k: "types", depth: 2, text: "type Profile", moved: true },
        { k: "styles", depth: 2, text: "const styles", moved: true },
        { k: "hook", depth: 2, text: "function loadProfile()", moved: true },
      ],
    },
    levels: [
      {
        name: "A component's own parts",
        piece: "types · styles · loadProfile()",
        answer: "file",
        rows: [
          { depth: 0, text: "src/", kind: "dir" },
          { depth: 1, text: "routes/profile/", kind: "dir" },
          {
            depth: 2,
            slot: {
              id: "folder",
              label: "+ user-profile/ index, types, styles, helpers",
              note: "Five files for one component, so five tabs to read it.",
            },
          },
          { depth: 2, text: "user-profile.ts" },
          {
            depth: 3,
            slot: {
              id: "file",
              label: "↳ inside user-profile.ts",
              note: "Keep the whole component in one file.",
            },
          },
          {
            depth: 1,
            slot: {
              id: "kinds",
              label: "+ types/, styles/, helpers/",
              note: "Sorted by kind, one component now spans four folders.",
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
      label: "In the page",
      costs: ["501 renders per key"],
      tree: [
        { depth: 0, text: "Order page", kind: "comp" },
        { k: "state", depth: 1, text: "query state", moved: true },
        { depth: 1, text: "Search input", kind: "comp" },
        { depth: 1, text: "Order list, 500 rows", kind: "comp" },
      ],
    },
    good: {
      label: "In a child",
      costs: ["1 render per key"],
      tree: [
        { depth: 0, text: "Order page", kind: "comp" },
        { depth: 1, text: "Search box", kind: "comp" },
        { k: "state", depth: 2, text: "query state", moved: true },
        { depth: 2, text: "Search input", kind: "comp" },
        { depth: 1, text: "Order list, 500 rows", kind: "comp" },
      ],
    },
    levels: [
      {
        name: "A search box",
        piece: "query state",
        answer: "child",
        rows: [
          { depth: 0, text: "src/stores/", kind: "dir" },
          {
            depth: 1,
            slot: {
              id: "store",
              label: "+ search-store.ts",
              note: "A global store for one input's text adds a file and a subscription, and keeps the state far from its input.",
            },
          },
          { depth: 0, text: "Order page", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "page",
              label: "↳ state in the order page",
              note: "Every keystroke re-renders the order page and the 500-row list under it.",
            },
          },
          { depth: 1, text: "Order list, 500 rows", kind: "comp" },
          {
            depth: 1,
            slot: {
              id: "child",
              label: "+ new search box",
              note: "Extract it even when used once. Only the search box re-renders as you type.",
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
        { depth: 2, text: "checkout/pay-button.ts", tag: "uses it" },
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
        { depth: 2, text: "checkout/pay-button.ts", tag: "uses it" },
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
          { depth: 3, text: "pay-button.ts", tag: "uses it" },
          { depth: 1, text: "shared/", kind: "dir" },
          {
            depth: 2,
            slot: {
              id: "hooks",
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
        { k: "btn", depth: 3, text: "button.ts", moved: true },
        { depth: 2, text: "checkout/", kind: "dir", tag: "uses it" },
        { depth: 2, text: "… 10 more pages", kind: "more", tag: "uses it" },
      ],
    },
    good: {
      label: "In components/",
      costs: ["1 obvious home"],
      tree: [
        { depth: 0, text: "src/", kind: "dir" },
        { depth: 1, text: "components/", kind: "dir" },
        { k: "btn", depth: 2, text: "button.ts", moved: true },
        { depth: 1, text: "routes/", kind: "dir" },
        { depth: 2, text: "settings/", kind: "dir", tag: "uses it" },
        { depth: 2, text: "checkout/", kind: "dir", tag: "uses it" },
        { depth: 2, text: "… 10 more pages", kind: "more", tag: "uses it" },
      ],
    },
    levels: [
      {
        name: "Twelve callers",
        piece: "button.ts",
        answer: "components",
        rows: [
          { depth: 0, text: "src/", kind: "dir" },
          {
            depth: 1,
            slot: {
              id: "components",
              label: "+ components/button.ts",
              note: "Give it a type folder. components/ says what it is, and ⌘P finds it.",
            },
          },
          { depth: 1, text: "routes/", kind: "dir" },
          {
            depth: 2,
            slot: {
              id: "routes",
              label: "+ button.ts",
              note: "routes/ is the lowest common ancestor, but a button belongs to no page.",
            },
          },
          { depth: 2, text: "settings/", kind: "dir", tag: "uses it" },
          {
            depth: 3,
            slot: {
              id: "settings",
              label: "+ button.ts",
              note: "Its first caller doesn't own it. Eleven other pages would import from settings/.",
            },
          },
          { depth: 2, text: "… 11 more pages", kind: "more", tag: "uses it" },
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
  ["Used almost everywhere", "Use a type folder, like components/"],
  ["Your stack demands a boundary", "Comply with the constraint"],
] as const satisfies Tldr;
