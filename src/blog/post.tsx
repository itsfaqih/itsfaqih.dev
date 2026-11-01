import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { ListIcon } from "@phosphor-icons/react";
import { Drawer } from "vaul";
import { TableOfContents } from "./table-of-contents";
import { motion, palette } from "../theme.stylex";

/** The table of contents on narrow screens: a floating button that opens it in a drawer. */
export function TocDrawer() {
  const [isTocOpen, setIsTocOpen] = useState(false);

  return (
    <Drawer.Root open={isTocOpen} onOpenChange={setIsTocOpen}>
      <Drawer.Trigger asChild>
        <button {...stylex.props(styles.tocButton)} aria-label="Table of Contents">
          <ListIcon size={24} />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay {...stylex.props(styles.overlay)} />
        <Drawer.Content {...stylex.props(styles.drawer)}>
          <div {...stylex.props(styles.drawerPanel)}>
            <div aria-hidden {...stylex.props(styles.handle)} />
            <div {...stylex.props(styles.drawerBody)}>
              <Drawer.Title {...stylex.props(styles.drawerTitle)}>Table of Contents</Drawer.Title>
              <div {...stylex.props(styles.drawerScroll)}>
                <TableOfContents onLinkClick={() => setIsTocOpen(false)} />
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const HOVER = "@media (hover: hover) and (pointer: fine)";
const REDUCE = "@media (prefers-reduced-motion: reduce)";

// The tags the posts render. Values follow Tailwind Typography's prose-zinc.
const proseStyles = stylex.create({
  p: {
    marginTop: { default: "1.25em", ":first-child": 0, ":is(h2 + *)": 0 },
    marginBottom: { default: "1.25em", ":last-child": 0 },
    color: palette["--muted-foreground"],
  },
  h2: {
    marginTop: "2em",
    marginBottom: "1em",
    scrollMarginTop: "6rem",
    fontSize: "1.5em",
    lineHeight: "calc(32 / 24)",
    fontWeight: 700,
    color: palette["--text"],
  },
});

const styles = stylex.create({
  page: {
    position: "relative",
    minHeight: "100svh",
  },
  shell: {
    position: "relative",
    maxWidth: "72rem",
    marginInline: "auto",
    paddingInline: "1.5rem",
    paddingTop: "2rem",
    paddingBottom: "3rem",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: {
      default: "repeat(1, minmax(0, 1fr))",
      "@media (min-width: 64rem)": "1fr 250px",
    },
    alignItems: "flex-start",
    gap: "3rem",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    color: {
      default: palette["--muted-foreground"],
      ":hover": { default: null, [HOVER]: palette["--text"] },
    },
    scale: { default: null, ":active": { default: "95% 95%", [REDUCE]: null } },
    transitionProperty: "color, scale",
    transitionDuration: {
      default: motion["--t-moderate-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-moderate"] },
      ":active": motion["--t-moderate"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--moderate"] },
      ":active": motion["--moderate"],
    },
  },
  backLinkTop: {
    marginBottom: "2rem",
  },
  backArrow: {
    translate: {
      default: null,
      [stylex.when.ancestor(":hover")]: {
        default: null,
        [HOVER]: { default: "-0.25rem 0", [REDUCE]: null },
      },
    },
    transitionProperty: "translate",
    transitionDuration: {
      default: motion["--t-moderate-exit"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: motion["--t-moderate"] },
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      [stylex.when.ancestor(":hover")]: { default: null, [HOVER]: motion["--moderate"] },
    },
  },
  header: {
    marginBottom: "2rem",
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  muted: {
    color: palette["--muted-foreground"],
  },
  small: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
  },
  title: {
    marginBottom: "1rem",
    fontSize: { default: "1.875rem", "@media (min-width: 40rem)": "2.25rem" },
    lineHeight: 1.25,
    fontWeight: 700,
  },
  summary: {
    fontSize: "1.125rem",
    lineHeight: 1.625,
    color: palette["--muted-foreground"],
  },
  rule: {
    height: 1,
    marginBottom: "2rem",
    backgroundColor: palette["--border"],
  },
  body: {
    lineHeight: 1.75,
    color: "oklch(87.1% .006 286.286)",
  },
  footer: {
    marginTop: "2rem",
    paddingTop: "1.5rem",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderColor: palette["--border"],
  },
  footerRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1rem",
  },
  tocRail: {
    display: { default: "none", "@media (min-width: 64rem)": "block" },
    position: "sticky",
    top: "3rem",
  },
  tocButton: {
    position: "fixed",
    right: "calc(1.5rem + env(safe-area-inset-right, 0px))",
    bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
    zIndex: 50,
    display: { default: null, "@media (min-width: 64rem)": "none" },
    padding: "1rem",
    borderRadius: "2147483647px",
    color: palette["--bg"],
    backgroundColor: palette["--text"],
    scale: {
      default: null,
      ":hover": { default: null, [HOVER]: { default: "105% 105%", [REDUCE]: null } },
      // Repeated under the media query, which would otherwise let hovering outrank pressing.
      ":active": {
        default: "95% 95%",
        [HOVER]: { default: "95% 95%", [REDUCE]: null },
        [REDUCE]: null,
      },
    },
    transitionProperty: "scale",
    transitionDuration: {
      default: motion["--t-moderate-exit"],
      ":hover": { default: null, [HOVER]: motion["--t-moderate"] },
      ":active": motion["--t-moderate"],
    },
    transitionTimingFunction: {
      default: motion["--exit"],
      ":hover": { default: null, [HOVER]: motion["--moderate"] },
      ":active": motion["--moderate"],
    },
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    backgroundColor: "rgb(0 0 0 / 0.4)",
  },
  drawer: {
    position: "fixed",
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    display: "flex",
    flexDirection: "column",
    maxHeight: "85dvh",
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderColor: palette["--border"],
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    outlineStyle: "none",
    backgroundColor: palette["--bg"],
  },
  drawerPanel: {
    display: "flex",
    flex: "1",
    flexDirection: "column",
    minHeight: 0,
    paddingTop: "1rem",
    paddingInline: "1rem",
    paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: palette["--bg"],
  },
  handle: {
    flexShrink: 0,
    width: "3rem",
    height: "0.375rem",
    marginInline: "auto",
    marginBottom: "1.5rem",
    borderRadius: "2147483647px",
    backgroundColor: palette["--border"],
  },
  drawerBody: {
    display: "flex",
    flex: "1",
    flexDirection: "column",
    width: "100%",
    maxWidth: "28rem",
    minHeight: 0,
    marginInline: "auto",
  },
  drawerTitle: {
    flexShrink: 0,
    marginBottom: "1rem",
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    fontWeight: 700,
  },
  drawerScroll: {
    flex: "1",
    overflowY: "auto",
    overscrollBehavior: "contain",
  },
});

/** The post page's classes, for its .astro frame, which StyleX cannot compile. */
export const post = {
  page: stylex.props(styles.page).className,
  shell: stylex.props(styles.shell).className,
  layout: stylex.props(styles.layout).className,
  backLinkTop: stylex.props(styles.backLink, styles.backLinkTop, stylex.defaultMarker()).className,
  backLink: stylex.props(styles.backLink, stylex.defaultMarker()).className,
  backArrow: stylex.props(styles.backArrow).className,
  header: stylex.props(styles.header).className,
  meta: stylex.props(styles.meta).className,
  metaItem: stylex.props(styles.metaItem, styles.small, styles.muted).className,
  title: stylex.props(styles.title).className,
  summary: stylex.props(styles.summary).className,
  rule: stylex.props(styles.rule).className,
  body: stylex.props(styles.body).className,
  footer: stylex.props(styles.footer).className,
  footerRow: stylex.props(styles.footerRow).className,
  thanks: stylex.props(styles.small, styles.muted).className,
  tocRail: stylex.props(styles.tocRail).className,
};

export const prose = {
  p: stylex.props(proseStyles.p).className,
  h2: stylex.props(proseStyles.h2).className,
};
