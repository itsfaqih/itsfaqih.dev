/** A rule page's data (`LESSONS`, `TLDR`), shared by its page and markdown-twins.test.ts. */

export type TreeRow = {
  depth: number;
  text: string;
  kind?: "dir" | "comp" | "more";
  /** The row that changes place between the panes; `k` pairs it across them. */
  moved?: boolean;
  tag?: string;
  k?: string;
};

export type Side = { label: string; costs: string[] };

export type Slot = { id: string; label: string; note: string };

export type BoardRow =
  | { depth: number; text: string; kind?: TreeRow["kind"]; tag?: string }
  | { depth: number; slot: Slot; lead?: string };

export type Level = {
  name: string;
  piece: string;
  answer: string;
  rows: BoardRow[];
};

/** Each page widens `Side` with what its panes draw from, such as `{ tree: TreeRow[] }`. */
export type Lesson<S extends Side = Side> = {
  title: string;
  exception?: boolean;
  bad: S;
  good: S;
  /** Quiz levels that test this lesson, played right after it. */
  levels: [Level, ...Level[]];
};

export type Tldr = readonly (readonly [situation: string, answer: string])[];
