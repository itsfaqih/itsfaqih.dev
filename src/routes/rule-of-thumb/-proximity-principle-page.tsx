import * as stylex from "@stylexjs/stylex";
import {
  Code,
  Kbd,
  type Lesson,
  LessonText,
  type Level,
  RuleLanding,
  Tip,
  Tree,
} from "./-components/rule-landing";

const styles = stylex.create({
  suffixes: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  // Not the padding shorthand, which StyleX emits at class specificity, below the kit's code padding.
  suffix: {
    paddingBlock: "4px",
    paddingInline: "8px",
    fontSize: "13px",
    color: "var(--c-ink)",
  },
});

const LESSONS: Lesson[] = [
  {
    title: "Inline first",
    body: (
      <>
        Code used once stays where it's used. A helper in <Code>utils/</Code> with one caller adds a
        file and an import, and shares nothing.
      </>
    ),
    bad: {
      label: "In utils/",
      costs: ["2 files", "1 import"],
      view: (
        <Tree
          rows={[
            { depth: 0, text: "src/", kind: "dir" },
            { depth: 1, text: "routes/profile/", kind: "dir" },
            { depth: 2, text: "user-profile.tsx", tag: "uses it" },
            { depth: 1, text: "utils/", kind: "dir" },
            { k: "fd", depth: 2, text: "format-date.ts", moved: true },
          ]}
        />
      ),
    },
    good: {
      label: "Inline",
      costs: ["1 file", "0 imports"],
      view: (
        <Tree
          rows={[
            { depth: 0, text: "src/", kind: "dir" },
            { depth: 1, text: "routes/profile/", kind: "dir" },
            { depth: 2, text: "user-profile.tsx", tag: "uses it" },
            { k: "fd", depth: 3, text: "function formatDate()", moved: true },
          ]}
        />
      ),
    },
  },
  {
    title: "Prefer fewer files",
    body: (
      <>
        One component, one file. Split its types, styles and hook into a folder, and reading it
        takes five tabs.
      </>
    ),
    bad: {
      label: "A folder",
      costs: ["5 files", "4 imports"],
      view: (
        <Tree
          rows={[
            { depth: 0, text: "routes/profile/", kind: "dir" },
            { depth: 1, text: "user-profile/", kind: "dir" },
            { depth: 2, text: "index.tsx" },
            { depth: 2, text: "user-profile.tsx" },
            { k: "types", depth: 2, text: "types.ts", moved: true },
            { k: "styles", depth: 2, text: "styles.ts", moved: true },
            { k: "hook", depth: 2, text: "hooks.ts", moved: true },
          ]}
        />
      ),
    },
    good: {
      label: "One file",
      costs: ["1 file", "0 imports"],
      view: (
        <Tree
          rows={[
            { depth: 0, text: "routes/profile/", kind: "dir" },
            { depth: 1, text: "user-profile.tsx" },
            { k: "types", depth: 2, text: "type Profile", moved: true },
            { k: "styles", depth: 2, text: "const styles", moved: true },
            { k: "hook", depth: 2, text: "function useProfile()", moved: true },
          ]}
        />
      ),
    },
  },
  {
    title: "Own state, own component",
    exception: true,
    body: (
      <>
        Extract code used once only when it has its own state. In a child, a keystroke re-renders
        the child, not the page and its 500 rows.
      </>
    ),
    bad: {
      label: "In the page",
      costs: ["501 renders per key"],
      view: (
        <Tree
          rows={[
            { depth: 0, text: "<OrderPage>", kind: "comp" },
            { k: "state", depth: 1, text: "useState(query)", moved: true },
            { depth: 1, text: "<input>", kind: "comp" },
            { depth: 1, text: "<OrderList> 500 rows", kind: "comp" },
          ]}
        />
      ),
    },
    good: {
      label: "In a child",
      costs: ["1 render per key"],
      view: (
        <Tree
          rows={[
            { depth: 0, text: "<OrderPage>", kind: "comp" },
            { depth: 1, text: "<SearchInput>", kind: "comp" },
            { k: "state", depth: 2, text: "useState(query)", moved: true },
            { depth: 2, text: "<input>", kind: "comp" },
            { depth: 1, text: "<OrderList> 500 rows", kind: "comp" },
          ]}
        />
      ),
    },
  },
  {
    title: "Lowest common ancestor",
    body: (
      <>
        When a second file needs it, move it up to the nearest folder both callers share. The path
        then names its owner.
      </>
    ),
    extra: (
      <Tip>
        Name folders for what they hold, like <Code>routes/</Code> or <Code>controllers/</Code>, not{" "}
        <Code>features/</Code>.
      </Tip>
    ),
    bad: {
      label: "In hooks/",
      costs: ["2 hops each", "owner unclear"],
      view: (
        <Tree
          rows={[
            { depth: 0, text: "src/", kind: "dir" },
            { depth: 1, text: "hooks/", kind: "dir" },
            { k: "cart", depth: 2, text: "use-cart.ts", moved: true },
            { depth: 1, text: "routes/shop/", kind: "dir" },
            { depth: 2, text: "cart/summary.tsx", tag: "uses it" },
            { depth: 2, text: "checkout/pay-button.tsx", tag: "uses it" },
          ]}
        />
      ),
    },
    good: {
      label: "In routes/shop/",
      costs: ["1 hop each", "owner: shop"],
      view: (
        <Tree
          rows={[
            { depth: 0, text: "src/", kind: "dir" },
            { depth: 1, text: "routes/shop/", kind: "dir" },
            { k: "cart", depth: 2, text: "use-cart.ts", moved: true },
            { depth: 2, text: "cart/summary.tsx", tag: "uses it" },
            { depth: 2, text: "checkout/pay-button.tsx", tag: "uses it" },
          ]}
        />
      ),
    },
  },
  {
    title: "Global code, type folder",
    exception: true,
    body: (
      <>
        Code used almost everywhere, like a button, belongs to no page. Give it a folder named for
        its type, and a suffix so <Kbd>⌘P</Kbd> finds it.
      </>
    ),
    extra: (
      <LessonText style={styles.suffixes}>
        <Code style={styles.suffix}>user.schema.ts</Code>
        <Code style={styles.suffix}>use-auth.hook.ts</Code>
        <Code style={styles.suffix}>dashboard.page.tsx</Code>
      </LessonText>
    ),
    bad: {
      label: "In settings/",
      costs: ["11 cross-imports"],
      view: (
        <Tree
          rows={[
            { depth: 0, text: "src/", kind: "dir" },
            { depth: 1, text: "routes/", kind: "dir" },
            { depth: 2, text: "settings/", kind: "dir", tag: "uses it" },
            { k: "btn", depth: 3, text: "button.tsx", moved: true },
            { depth: 2, text: "checkout/", kind: "dir", tag: "uses it" },
            { depth: 2, text: "… 10 more pages", kind: "more", tag: "uses it" },
          ]}
        />
      ),
    },
    good: {
      label: "In components/",
      costs: ["1 obvious home"],
      view: (
        <Tree
          rows={[
            { depth: 0, text: "src/", kind: "dir" },
            { depth: 1, text: "components/", kind: "dir" },
            { k: "btn", depth: 2, text: "button.tsx", moved: true },
            { depth: 1, text: "routes/", kind: "dir" },
            { depth: 2, text: "settings/", kind: "dir", tag: "uses it" },
            { depth: 2, text: "checkout/", kind: "dir", tag: "uses it" },
            { depth: 2, text: "… 10 more pages", kind: "more", tag: "uses it" },
          ]}
        />
      ),
    },
  },
];

const CHEAT_SHEET = [
  ["Code used once", "Keep it inline"],
  ["Code too long", "Extract a function, same file"],
  ["Reused in the same file", "Extract a function, same file"],
  ["Reused across files", "The lowest common ancestor"],
  ["Used almost everywhere", "A type folder, like components/"],
  ["A child with its own state", "Its own component"],
] as const;

const LEVELS: Level[] = [
  {
    name: "One caller",
    prompt: (
      <>
        Only <Code>user-profile.tsx</Code> calls <Code>formatDate()</Code>. Where does it live?
      </>
    ),
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
          cost: ["+1 file", "+1 import"],
        },
      },
      { depth: 1, text: "routes/profile/", kind: "dir" },
      { depth: 2, text: "user-profile.tsx", tag: "uses it" },
      {
        depth: 3,
        slot: {
          id: "inline",
          label: "↳ inline, above UserProfile()",
          note: "Used once, so it stays where it's used. Nothing to import, nothing to open.",
          cost: ["0 files", "0 imports"],
        },
      },
      { depth: 1, text: "utils/", kind: "dir" },
      {
        depth: 2,
        slot: {
          id: "utils",
          label: "+ format-date.ts",
          note: "Three folders from its only caller. Extract it when a second file needs it, not before.",
          cost: ["+1 file", "+1 import", "3 hops"],
        },
      },
    ],
  },
  {
    name: "A component's own parts",
    prompt: (
      <>
        <Code>UserProfile</Code> has its own types, styles and a hook. Nothing else uses them. Where
        do they go?
      </>
    ),
    piece: "types · styles · useProfile()",
    answer: "file",
    rows: [
      { depth: 0, text: "src/", kind: "dir" },
      { depth: 1, text: "routes/profile/", kind: "dir" },
      {
        depth: 2,
        slot: {
          id: "folder",
          label: "+ user-profile/ index, types, styles, hooks",
          note: "Five files for one component, so five tabs to read it.",
          cost: ["5 files", "4 imports"],
        },
      },
      { depth: 2, text: "user-profile.tsx" },
      {
        depth: 3,
        slot: {
          id: "file",
          label: "↳ inside user-profile.tsx",
          note: "One file holds the whole component.",
          cost: ["1 file", "0 imports"],
        },
      },
      {
        depth: 1,
        slot: {
          id: "kinds",
          label: "+ types/, styles/, hooks/",
          note: "Sorted by kind, one component now spans four folders.",
          cost: ["4 folders", "3 imports"],
        },
      },
    ],
  },
  {
    name: "A search box",
    prompt: (
      <>
        A search box keeps its text in <Code>useState</Code>. Each keystroke re-renders whatever
        owns that state. Where does it live?
      </>
    ),
    piece: "useState(query)",
    answer: "child",
    rows: [
      { depth: 0, text: "src/stores/", kind: "dir" },
      {
        depth: 1,
        slot: {
          id: "store",
          label: "+ search-store.ts",
          note: "A global store for one input's text adds a file and a subscription, and keeps the state far from its input.",
          cost: ["+1 file", "global"],
        },
      },
      { depth: 0, text: "<OrderPage>", kind: "comp" },
      {
        depth: 1,
        slot: {
          id: "page",
          label: "↳ useState in OrderPage",
          note: "Every keystroke re-renders OrderPage and the 500-row OrderList under it.",
          cost: ["501 renders per key"],
        },
      },
      { depth: 1, text: "<OrderList> 500 rows", kind: "comp" },
      {
        depth: 1,
        slot: {
          id: "child",
          label: "+ new <SearchInput>",
          note: "Only SearchInput re-renders as you type. Worth a component, even if used once.",
          cost: ["1 render per key"],
        },
      },
    ],
  },
  {
    name: "Two callers",
    prompt: (
      <>
        <Code>cart/summary.tsx</Code> and <Code>checkout/pay-button.tsx</Code> now both call{" "}
        <Code>useCart()</Code>. Where does it move?
      </>
    ),
    piece: "useCart()",
    answer: "shop",
    rows: [
      { depth: 0, text: "src/", kind: "dir" },
      { depth: 1, text: "routes/shop/", kind: "dir" },
      {
        depth: 2,
        slot: {
          id: "shop",
          label: "+ use-cart.ts",
          note: "routes/shop/ is the nearest folder both callers share, so the path names its owner.",
          cost: ["1 hop each", "owner: shop"],
        },
      },
      { depth: 2, text: "cart/", kind: "dir" },
      { depth: 3, text: "summary.tsx", tag: "uses it" },
      {
        depth: 3,
        slot: {
          id: "cart",
          label: "+ use-cart.ts",
          note: "checkout/ would reach into cart/ for it. Move it up to the folder both share.",
          cost: ["checkout → cart"],
        },
      },
      { depth: 2, text: "checkout/", kind: "dir" },
      { depth: 3, text: "pay-button.tsx", tag: "uses it" },
      { depth: 1, text: "hooks/", kind: "dir" },
      {
        depth: 2,
        slot: {
          id: "hooks",
          label: "+ use-cart.ts",
          note: "hooks/ holds everything, so the path no longer says the shop owns it.",
          cost: ["2 hops each", "owner unclear"],
        },
      },
    ],
  },
  {
    name: "Twelve callers",
    prompt: (
      <>
        Twelve pages use <Code>button.tsx</Code>. Where does it go?
      </>
    ),
    piece: "button.tsx",
    answer: "components",
    rows: [
      { depth: 0, text: "src/", kind: "dir" },
      {
        depth: 1,
        slot: {
          id: "components",
          label: "+ components/button.tsx",
          note: "Used almost everywhere, so it gets a type folder. components/ says what it is, and ⌘P finds it.",
          cost: ["12 callers", "1 obvious home"],
        },
      },
      { depth: 1, text: "routes/", kind: "dir" },
      {
        depth: 2,
        slot: {
          id: "routes",
          label: "+ button.tsx",
          note: "routes/ is the lowest common ancestor, but a button belongs to no page.",
          cost: ["sits among pages"],
        },
      },
      { depth: 2, text: "settings/", kind: "dir", tag: "uses it" },
      {
        depth: 3,
        slot: {
          id: "settings",
          label: "+ button.tsx",
          note: "Its first caller doesn't own it. Eleven other pages would import from settings/.",
          cost: ["11 cross-imports"],
        },
      },
      { depth: 2, text: "… 11 more pages", kind: "more", tag: "uses it" },
    ],
  },
];

export function ProximityPrinciple() {
  return (
    <RuleLanding
      lead={
        <>
          Five placements, each with the wrong spot and the right one side by side in a real tree.
          Then a mini quiz where you place the code yourself.
        </>
      }
      learn={{
        title: "Near beats far",
        intro: (
          <>
            Put code as close as you can to where it's used, and move it only as far as its callers
            need. Each example shows the same code twice: on the left where it tends to drift, on
            the right where the rule puts it.
          </>
        ),
      }}
      lessons={LESSONS}
      tldr={CHEAT_SHEET}
      quiz={{
        intro: (
          <>
            Drag each piece to where it lives, or tap it, then tap a spot. A wrong spot shows its
            cost.
          </>
        ),
        levels: LEVELS,
        board: "tree",
      }}
      take="place files the same way"
    />
  );
}
