import { button } from "../components/button.css";
import { buttonVariant } from "../components/button";
import { type Verdict, wentWrong } from "./null-vs-undefined";
import { cx, type ClassValue } from "../cx";
import { styles } from "./null-vs-undefined.css";
const TOKEN =
  /(\/\/.*)|("(?:[^"\\]|\\.)*"|`[^`]*`)|\b(null)\b|\b(undefined)\b|\b(const|let|function|return|type|await|new)\b/g;

export const KINDS = [styles.com, styles.str, styles.nul, styles.und, styles.kw];
// Inside an output note the note's tone colours strings and nothings.
export const OUT_KINDS = [
  styles.com,
  [styles.str, styles.inherit],
  [styles.nul, styles.inherit],
  [styles.und, styles.inherit],
  styles.kw,
];

type Painted = { text: string; class?: string };

/** Colours a line of code: a match of TOKEN's nth capture group gets the class of `kinds[n]`. */
export function paint(source: string, kinds: readonly ClassValue[]): Painted[] {
  const parts: Painted[] = [];
  let at = 0;
  for (const match of source.matchAll(TOKEN)) {
    if (match.index > at) parts.push({ text: source.slice(at, match.index) });
    const kind = kinds[match.slice(1).findIndex((group) => group !== undefined)];
    parts.push({ text: match[0], class: cx(kind) });
    at = match.index + match[0].length;
  }
  if (at < source.length) parts.push({ text: source.slice(at) });
  return parts;
}

/** Classes the save demo (null-flow.astro) and its element share. */
export const flowView = {
  button: cx(button.base, buttonVariant["primary-neutral"], button.sm, styles.button),
  save: cx(button.base, buttonVariant["secondary-hue"], button.sm, styles.button),
  body: (typing: boolean) => cx(styles.body, typing && styles.typing),
  packet: (dropping: boolean) => cx(styles.packet, dropping && styles.dropping),
  cell: (verdict: Verdict | undefined, ran: boolean) =>
    cx(
      styles.cell,
      verdict === "saved" && styles.cellSaved,
      verdict !== undefined && wentWrong(verdict) && styles.cellLost,
      ran && verdict !== undefined && styles.flashing,
    ),
  value: (bad: boolean, landing: boolean) =>
    cx(styles.value, bad && styles.valueLost, landing && styles.landing),
  nul: (bad: boolean) => cx(styles.nul, bad && styles.nulLost),
  tag: (verdict: Verdict) =>
    cx(
      styles.tag,
      wentWrong(verdict) ? styles.tagLost : styles.tagKept,
    ),
};

/** Classes a pick board (null-pick-board.astro) and its element share. */
export const pickView = {
  key: (on: boolean) => cx(styles.pickKey, on && styles.pickKeyOn),
  check: cx(button.base, buttonVariant["primary-hue"], button.sm, styles.pickCheck),
  /** A Result line, tinted by whether it matches Wanted; unsent, it waits for Check. */
  result: (hit?: boolean) =>
    cx(
      styles.pickRecordLine,
      hit === undefined ? styles.pickUnsent : hit ? styles.pickHit : styles.pickMiss,
    ),
};
