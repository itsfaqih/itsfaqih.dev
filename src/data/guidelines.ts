type GuidelineBase = {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  hidden?: boolean;
  /** The article includes demos the reader can try. */
  interactive?: boolean;
};

export type PublishedGuideline = GuidelineBase & {
  comingSoon?: false;
  headTitle: string;
  claim: string;
  coverTag: `${string} → ${string}`;
};

export type Guideline = PublishedGuideline | (GuidelineBase & { comingSoon: true });

export const GUIDELINES: Guideline[] = [
  {
    id: "proximity-principle",
    label: "Code Writing",
    title: "Proximity Principle",
    description: "How code writings and files should be structured",
    href: "/rule-of-thumb/proximity-principle",
    headTitle: "Proximity Principle: Keep Code Next to the Code That Uses It",
    claim: "Keep code next to the code that uses it.",
    coverTag: "FAR → NEAR",
    interactive: true,
  },
  {
    id: "typescript-code-writing",
    label: "Code Writing",
    title: "TypeScript Guidelines",
    description: "Rules for writing clean and maintainable TypeScript",
    href: "/rule-of-thumb/typescript-code-writing",
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
    href: "/rule-of-thumb/button-design",
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
    href: "/rule-of-thumb/table-design",
    headTitle: "Table Design: States, Pagination, Actions, and Numbers",
    claim: "Line up what people compare, and never leave a table blank.",
    coverTag: "RAGGED → ALIGNED",
    hidden: true,
  },
  {
    id: "dialog-design",
    label: "UX Design",
    title: "Dialog Design",
    description: "Focus trap, inert background, and data safety patterns",
    href: "/rule-of-thumb/dialog-design",
    headTitle: "Dialog Design: Focus Trap, Escape, and Keeping User Input",
    claim: "A dialog holds focus, lets Escape out, and keeps what you typed.",
    coverTag: "LEAKY → SEALED",
    hidden: true,
  },
  {
    id: "form-submission",
    label: "UX Design",
    title: "Form Submission",
    description: "Validation, error handling, and user feedback",
    href: "/rule-of-thumb/form-submission",
    comingSoon: true,
    hidden: true,
  },
  {
    id: "data-loading",
    label: "Architecture",
    title: "Data Loading",
    description: "SSR, loaders, SWR, and error handling",
    href: "/rule-of-thumb/data-loading",
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
    href: "/rule-of-thumb/handling-timestamps",
    headTitle: "Handling Timestamps: Store UTC, Display Local Time",
    claim: "Store and send UTC. Turn it local only on the reader's screen.",
    coverTag: "LOCAL → UTC",
    hidden: true,
  },
  {
    id: "null-vs-undefined",
    label: "Code Writing",
    title: "Null vs Undefined",
    description: "The difference between empty and missing values",
    href: "/rule-of-thumb/null-vs-undefined",
    headTitle: "Null vs Undefined in TypeScript: Empty vs Missing",
    claim: "Use undefined for a value nobody gave, and null for one emptied on purpose.",
    coverTag: "IMPLICIT → EXPLICIT",
  },
];

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

export const VISIBLE_GUIDELINES = GUIDELINES.filter((guideline) => !guideline.hidden);

export function ruleNumber(rule: Guideline) {
  const index = VISIBLE_GUIDELINES.indexOf(rule);
  return index === -1 ? null : String(index + 1).padStart(3, "0");
}
