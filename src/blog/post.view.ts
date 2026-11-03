import { marker } from "../when";
import { cx } from "../cx";
import { proseStyles, styles, SLIDE, EASE } from "./post.css";
export const SLIDE_TRANSITION = `transform ${SLIDE} ${EASE}`;
export const FADE_TRANSITION = `opacity ${SLIDE} ${EASE}`;

/** The post page's classes, for its .astro frame, which StyleX cannot compile. */
export const post = {
  page: styles.page,
  shell: styles.shell,
  layout: styles.layout,
  backLinkTop: cx(styles.backLink, styles.backLinkTop, marker),
  backLink: cx(styles.backLink, marker),
  backArrow: styles.backArrow,
  header: styles.header,
  meta: styles.meta,
  metaItem: cx(styles.metaItem, styles.small, styles.muted),
  title: styles.title,
  summary: styles.summary,
  rule: styles.rule,
  body: styles.body,
  footer: styles.footer,
  footerRow: styles.footerRow,
  thanks: cx(styles.small, styles.muted),
  tocRail: styles.tocRail,
};

export const prose = {
  p: proseStyles.p,
  h2: proseStyles.h2,
};

/** The table-of-contents drawer's classes, for toc-drawer.astro. */
export const drawer = {
  host: styles.drawerHost,
  guard: styles.guard,
  button: styles.tocButton,
  overlay: styles.overlay,
  content: styles.drawer,
  panel: styles.drawerPanel,
  handle: styles.handle,
  body: styles.drawerBody,
  title: styles.drawerTitle,
  scroll: styles.drawerScroll,
};
