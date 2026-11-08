import { boxScrollbarHost } from "../components/box-scrollbar.css";
import { icon, iconLit, techBadge } from "./tech-icon.css";
import { cx } from "../cx";
import { styles } from "./experience-list.css";
export const rowView = (isOpen: boolean) => ({
  head: cx(styles.head, iconLit.hover, !isOpen && styles.headCover),
  company: cx(styles.company, isOpen && iconLit.on),
  chevron: cx(styles.chevron, isOpen && styles.chevronOpen),
  frame: cx(styles.stackFrame, isOpen && styles.stackFrameOpen),
  stack: cx(styles.stack, isOpen && styles.stackOpen, isOpen && boxScrollbarHost.box),
  pill: cx(techBadge.badge, styles.pill, isOpen ? styles.pillOpen : styles.pillClosed),
  mark: cx(icon.pair, isOpen ? styles.markOpen : styles.markClosed),
  more: cx(styles.pill, styles.more, styles.pillClosed),
  hint: cx(styles.hint, isOpen && styles.hintOpen),
});

export const moreLabel = (count: number) => `+${count} more`;
