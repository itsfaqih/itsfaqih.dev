import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";

type PageContainerProps = {
  children: ReactNode;
  maxWidth?: "2xl" | "3xl" | "4xl";
  style?: stylex.StyleXStyles;
};

export function PageContainer({ children, maxWidth = "2xl", style }: PageContainerProps) {
  const { className } = stylex.props(styles.container, maxWidths[maxWidth], style);

  // .page-container in styles.css owns the top padding at every width.
  return <div className={`page-container ${className}`}>{children}</div>;
}

const styles = stylex.create({
  container: {
    marginInline: "auto",
    paddingInline: "1.5rem",
    paddingBottom: "5rem",
  },
});

const maxWidths = stylex.create({
  "2xl": { maxWidth: "42rem" },
  "3xl": { maxWidth: "48rem" },
  "4xl": { maxWidth: "56rem" },
});
