import { loadIn } from "./load-in.css";
import { cx } from "../cx";
import { styles } from "./header.css";
export type HeaderState = { scrolled: boolean; open: boolean; live: boolean };

export const SEGS = ["home", "live", "nav", "tools", "connect", "menu"] as const;
export type Seg = (typeof SEGS)[number];

/** Each segment's classes for a state. header.astro renders the first state, header.client.ts the rest. */
export function segView(seg: Seg, { scrolled, open, live }: HeaderState) {
  const full = !scrolled || open;
  const view = {
    home: {
      on: full || !live,
      compact: "idle",
      style: open && styles.homeFolded,
      row: open && styles.homeFoldedRow,
    },
    live: { on: !full && live, compact: "live", style: null, row: null },
    nav: { on: full, compact: undefined, style: null, row: null },
    tools: { on: true, compact: "always", style: styles.toolsSeg, row: null },
    connect: { on: true, compact: "always", style: styles.connectSeg, row: styles.connectRow },
    menu: { on: scrolled, compact: "always", style: null, row: null },
  }[seg];
  return {
    on: view.on,
    compact: view.compact,
    seg: cx(loadIn.islandPart, styles.seg, view.on && styles.segOn, view.style),
    row: `row ${cx(styles.row, view.on && styles.rowOn, view.row)}`,
  };
}

export function menuGlyphs(open: boolean) {
  return {
    list: cx(styles.glyph, open && styles.turnedRight),
    x: cx(styles.glyph, !open && styles.turnedLeft),
  };
}
