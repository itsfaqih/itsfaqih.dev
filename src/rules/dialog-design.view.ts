import { cx } from "../cx";
import { styles } from "./dialog-design.css";
export type ReadTone = "no" | "yes" | undefined;

// The classes the demos' elements (dialog-design.client.ts) switch between, so the first frame
// and the client build them from one place.
export const dialogView = (top: boolean, open: boolean) =>
  cx(styles.dialog, top && styles.dialogTop, open && styles.dialogOpen);
export const scrimView = (top: boolean, on: boolean) =>
  cx(styles.scrim, top && styles.scrimTop, on && styles.scrimOn);
export const readView = (tone: ReadTone) =>
  cx(styles.read, tone === "no" && styles.readNo, tone === "yes" && styles.readYes);
export const cardView = (gone: boolean) =>
  cx(styles.card, styles.spreadInCard, gone && styles.gone);
export const articleView = (locked: boolean) =>
  cx(styles.page, styles.article, locked && styles.locked);
// The ring shares no property with a stop's own look, so it joins that look's classes as is.
export const ringView = (behind: boolean) => cx(styles.ring, behind && styles.ringBehind);
