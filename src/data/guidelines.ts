type GuidelineBase = {
  id: string;
  label: string;
  title: string;
  description: string;
  hidden?: boolean;
  interactive?: boolean;
};

type PublishedEntry = GuidelineBase & {
  comingSoon?: false;
  headTitle: string;
  claim: string;
  coverTag: `${string} → ${string}`;
};

type Entry = PublishedEntry | (GuidelineBase & { comingSoon: true });

export type PublishedGuideline = PublishedEntry & { href: string };
export type Guideline = Entry & { href: string };

const ENTRIES: Entry[] = [
  {
    id: "proximity-principle",
    label: "Code Writing",
    title: "Proximity Principle",
    description: "Where to put code and files",
    headTitle: "Proximity Principle: Keep Code Next to the Code That Uses It",
    claim: "Keep code next to the code that uses it.",
    coverTag: "FAR → NEAR",
    interactive: true,
  },
  {
    id: "typescript-code-writing",
    label: "Code Writing",
    title: "TypeScript Guidelines",
    description: "Unions, inference, options objects, and strict flags",
    headTitle: "TypeScript Guidelines: Precise Types That Catch Mistakes",
    claim: "Write types precise enough that the compiler catches a mistake where you made it.",
    coverTag: "LOOSE → STRICT",
    hidden: true,
  },
  {
    id: "button-design",
    label: "UX Design",
    title: "Button Design",
    description: "States, hover, variants, and icon alignment",
    headTitle: "Button Design: States, Hover, Variants, and Icon Alignment",
    claim: "A button shows what it does and what it's doing.",
    coverTag: "SILENT → TACTILE",
    interactive: true,
  },
  {
    id: "table-design",
    label: "UX Design",
    title: "Table Design",
    description: "States, pagination, actions, and numbers",
    headTitle: "Table Design: States, Pagination, Actions, and Numbers",
    claim: "Line up what people compare, and never leave a table blank.",
    coverTag: "RAGGED → ALIGNED",
    hidden: true,
  },
  {
    id: "dialog-design",
    label: "UX Design",
    title: "Dialog Design",
    description: "Focus trap, inert background, and unsaved drafts",
    headTitle: "Dialog Design: Focus Trap, Escape, and Keeping User Input",
    claim: "A dialog holds focus, lets Escape close it, and keeps what you typed.",
    coverTag: "LEAKY → SEALED",
    hidden: true,
  },
  {
    id: "form-submission",
    label: "UX Design",
    title: "Form Submission",
    description: "Validation, error handling, and user feedback",
    comingSoon: true,
    hidden: true,
  },
  {
    id: "data-loading",
    label: "Architecture",
    title: "Data Loading",
    description: "SSR, loaders, SWR, and error handling",
    headTitle: "Data Loading: SSR, Loaders, SWR, and Never a Blank Screen",
    claim: "Fetch early, show what you have, and never blank the screen.",
    coverTag: "BLANK → INSTANT",
    interactive: true,
  },
  {
    id: "handling-timestamps",
    label: "Best Practices",
    title: "Handling Timestamps",
    description: "Store UTC, display local",
    headTitle: "Handling Timestamps: Store UTC, Display Local Time",
    claim: "Store and send UTC. Turn it local only on the reader's screen.",
    coverTag: "LOCAL → UTC",
    hidden: true,
  },
  {
    id: "null-vs-undefined",
    label: "Code Writing",
    title: "Null vs Undefined",
    description: "Missing versus empty values",
    headTitle: "Null vs Undefined in TypeScript: Empty vs Missing",
    claim: "Use undefined for a value nobody gave, and null for one emptied on purpose.",
    coverTag: "IMPLICIT → EXPLICIT",
  },
];

const GUIDELINES: Guideline[] = ENTRIES.map((entry) => ({
  ...entry,
  href: `/rule-of-thumb/${entry.id}`,
}));

const CATEGORY_COLOR = new Map<string, `var(--${string})`>([
  ["Code Writing", "var(--cw)"],
  ["UX Design", "var(--ux)"],
  ["Architecture", "var(--ar)"],
  ["Best Practices", "var(--ts)"],
  ["Accessibility", "var(--ax)"],
]);

export const colorOf = (category: string) => CATEGORY_COLOR.get(category) ?? "var(--go)";

export const PUBLISHED_GUIDELINES = GUIDELINES.filter(
  (guideline): guideline is PublishedGuideline => !guideline.comingSoon,
);

export const VISIBLE_GUIDELINES = PUBLISHED_GUIDELINES.filter((guideline) => !guideline.hidden);

export const TOPICS = [...new Set(VISIBLE_GUIDELINES.map((guideline) => guideline.label))];

export function ruleNumber(rule: PublishedGuideline) {
  const index = VISIBLE_GUIDELINES.indexOf(rule);
  return index === -1 ? null : String(index + 1).padStart(3, "0");
}
