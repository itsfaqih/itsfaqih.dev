export interface Guideline {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
}

export const GUIDELINES: Guideline[] = [
  {
    id: "proximity-principle",
    label: "Code Structure",
    title: "Proximity Principle",
    description: "How code writings and files should be structured",
    href: "/my-views/proximity-principle",
  },
  {
    id: "typescript-code-writing",
    label: "Code Quality",
    title: "TypeScript Guidelines",
    description: "Rules for writing clean and maintainable TypeScript",
    href: "/my-views/typescript-code-writing",
  },
  {
    id: "button-design",
    label: "UX Design",
    title: "Button Design",
    description: "States, hover, variants, and icon alignment",
    href: "/my-views/button-design",
  },
  {
    id: "table-design",
    label: "UX Design",
    title: "Table Design",
    description: "States, pagination, actions, and numbers",
    href: "/my-views/table-design",
  },
  {
    id: "dialog-design",
    label: "UX Design",
    title: "Dialog Design",
    description: "Focus trap, inert background, and data safety patterns",
    href: "/my-views/dialog-design",
  },
  {
    id: "data-loading",
    label: "Architecture",
    title: "Data Loading",
    description: "SSR, loaders, SWR, and error handling",
    href: "/my-views/data-loading",
  },
  {
    id: "handling-timestamps",
    label: "Best Practices",
    title: "Handling Timestamps",
    description: "Store UTC, display local",
    href: "/my-views/handling-timestamps",
  },
  {
    id: "null-vs-undefined",
    label: "JavaScript",
    title: "Null vs Undefined",
    description: "The difference between empty and missing values",
    href: "/my-views/null-vs-undefined",
  },
];
