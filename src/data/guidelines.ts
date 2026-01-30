export type Guideline = {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  comingSoon?: boolean;
}

export const GUIDELINES: Guideline[] = [
  {
    id: "proximity-principle",
    label: "Code Writing",
    title: "Proximity Principle",
    description: "How code writings and files should be structured",
    href: "/rule-of-thumb/proximity-principle",
  },
  {
    id: "typescript-code-writing",
    label: "Code Writing",
    title: "TypeScript Guidelines",
    description: "Rules for writing clean and maintainable TypeScript",
    href: "/rule-of-thumb/typescript-code-writing",
  },
  {
    id: "button-design",
    label: "UX Design",
    title: "Button Design",
    description: "States, hover, variants, and icon alignment",
    href: "/rule-of-thumb/button-design",
  },
  {
    id: "table-design",
    label: "UX Design",
    title: "Table Design",
    description: "States, pagination, actions, and numbers",
    href: "/rule-of-thumb/table-design",
  },
  {
    id: "dialog-design",
    label: "UX Design",
    title: "Dialog Design",
    description: "Focus trap, inert background, and data safety patterns",
    href: "/rule-of-thumb/dialog-design",
  },
  {
    id: "form-submission",
    label: "UX Design",
    title: "Form Submission",
    description: "Validation, error handling, and user feedback",
    href: "/rule-of-thumb/form-submission",
    comingSoon: true,
  },
  {
    id: "data-loading",
    label: "Architecture",
    title: "Data Loading",
    description: "SSR, loaders, SWR, and error handling",
    href: "/rule-of-thumb/data-loading",
  },
  {
    id: "handling-timestamps",
    label: "Best Practices",
    title: "Handling Timestamps",
    description: "Store UTC, display local",
    href: "/rule-of-thumb/handling-timestamps",
  },
  {
    id: "null-vs-undefined",
    label: "Code Writing",
    title: "Null vs Undefined",
    description: "The difference between empty and missing values",
    href: "/rule-of-thumb/null-vs-undefined",
  },
];
