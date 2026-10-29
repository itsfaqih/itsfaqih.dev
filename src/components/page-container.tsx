import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";

type PageContainerProps = {
  children: ReactNode;
  maxWidth?: "2xl" | "3xl" | "4xl";
  style?: stylex.StyleXStyles;
};

export function PageContainer({ children, maxWidth = "2xl", style }: PageContainerProps) {
  return <div {...stylex.props(styles.container, maxWidths[maxWidth], style)}>{children}</div>;
}

const PHONE = "@media (max-width: 639px)";

const styles = stylex.create({
  container: {
    position: { default: null, [PHONE]: "relative" },
    isolation: { default: null, [PHONE]: "isolate" },
    marginInline: "auto",
    paddingInline: "1.5rem",
    paddingTop: { default: "96px", [PHONE]: 0 },
    paddingBottom: "5rem",
    // On phones the text sits on a white sheet that fades out at the top and bottom.
    "::before": {
      content: { default: null, [PHONE]: '""' },
      position: { default: null, [PHONE]: "absolute" },
      inset: { default: null, [PHONE]: 0 },
      zIndex: { default: null, [PHONE]: -1 },
      pointerEvents: { default: null, [PHONE]: "none" },
      backgroundImage: {
        default: null,
        [PHONE]: {
          default: "linear-gradient(90deg, transparent 0%, #FFFFFF 0%, #FFFFFF 100%, transparent 100%)",
          ":is(.dark *)": "none",
        },
      },
      // The old sheet's `background: none` minified to `background: 0 0`.
      backgroundPosition: { default: null, [PHONE]: { default: null, ":is(.dark *)": "0 0" } },
      maskImage: {
        default: null,
        [PHONE]: "linear-gradient(to bottom, transparent 0%, black 1%, black 85%, transparent 100%)",
      },
      opacity: { default: null, [PHONE]: 0.9 },
    },
  },
});

const maxWidths = stylex.create({
  "2xl": { maxWidth: "42rem" },
  "3xl": { maxWidth: "48rem" },
  "4xl": { maxWidth: "56rem" },
});
