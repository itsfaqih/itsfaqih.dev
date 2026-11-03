import { chips } from "./chips.css";
import { iconLit, techBadge } from "./tech-icon.css";
import { hoverHold } from "../components/hover-hold.css";
import { loadIn } from "../components/load-in.css";
import { veil } from "./section.css";
import { cx } from "../cx";
import { styles } from "./stack-showcase.css";
// Before the first filter the groups glitch in (loadIn, with data-cut); after it they slide in.
export const groupLabelClass = (filtered: boolean) =>
  cx(!filtered && loadIn.veil, veil.dense, styles.groupLabel);
export const groupWordsClass = (filtered: boolean) => cx(!filtered && loadIn.piece, loadIn.words);
export const toolClass = (filtered: boolean) =>
  cx(!filtered && loadIn.piece, techBadge.badge, iconLit.hover, hoverHold.lift, styles.tool);
export const countClass = (on: boolean) => cx(chips.count, on && chips.countOn);
