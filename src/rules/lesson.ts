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

/** A candidate in a choose level. `label` names it for screen readers and the markdown twin. */
type Choice = { id: string; label: string; note: string };

/**
 * A quiz level. A place level hands the reader a piece to drop into one of its board's slots. A
 * choose level has no piece: the page draws the candidates, as versions side by side or as spots on
 * a mock screen, and the reader taps one.
 */
export type Level = { name: string; answer: string } & (
  | { piece: string; rows: BoardRow[] }
  | { choices: [Choice, Choice, ...Choice[]] }
);

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
