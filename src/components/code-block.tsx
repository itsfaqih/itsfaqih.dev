import * as stylex from "@stylexjs/stylex";
import { File } from "@pierre/diffs/react";
import type { CSSProperties } from "react";
import { CODE_OPTIONS, codeFile } from "./code-file";
import { fonts, palette } from "../theme.stylex";

type CodeBlockProps = {
  code: string;
  lang: string;
  prerenderedHTML?: string;
};

export function CodeBlock({ code, lang, prerenderedHTML }: CodeBlockProps) {
  const fileStyle: CSSProperties = { "--lines": code.split("\n").length };

  return (
    <File
      file={codeFile(code, lang)}
      options={CODE_OPTIONS}
      prerenderedHTML={prerenderedHTML}
      {...stylex.props(styles.file)}
      style={fileStyle}
    />
  );
}

type MarkdownCodeBlockProps = {
  "data-code": string;
  "data-language": string;
  "data-prerendered": string;
};

/** A post's fenced code, as rehypeHighlightCode in astro.config.ts hands it over. */
export function MarkdownCodeBlock(props: MarkdownCodeBlockProps) {
  return (
    <CodeBlock
      code={props["data-code"]}
      lang={props["data-language"]}
      prerenderedHTML={props["data-prerendered"]}
    />
  );
}

const ink = (hue: string) => `color-mix(in oklab, ${hue} ${palette["--ink-mix"]}, #000)`;

const styles = stylex.create({
  file: {
    display: "block",
    width: "100%",
    minWidth: 0,
    maxWidth: "100%",
    minHeight:
      "calc(var(--lines, 0) * var(--diffs-line-height) + 2 * var(--diffs-gap-block) + 2px)",
    overflow: "hidden",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: palette["--border"],
    borderRadius: "0.75rem",
    backgroundColor: palette["--card"],
    color: palette["--text"],
    // The shadow DOM uses light-dark(); pin it to the site's explicit mode.
    colorScheme: { default: "light", ":is(.dark *)": "dark" },
    "--diffs-gap-block": "0.5rem",
    "--diffs-line-height": "1.625rem",
    "--diffs-font-family": fonts["--mono"],
    "--diffs-header-font-family": fonts["--font-sans"],
    "--diffs-light-bg": palette["--card"],
    "--diffs-dark-bg": palette["--card"],
    "--diffs-foreground": palette["--text"],
    "--diffs-background": palette["--panel"],
    "--diffs-token-comment": palette["--mute"],
    "--diffs-token-keyword": ink(palette["--ux"]),
    "--diffs-token-string": ink(palette["--ts"]),
    "--diffs-token-string-expression": ink(palette["--ts"]),
    "--diffs-token-constant": palette["--go-ink"],
    "--diffs-token-function": ink(palette["--cw"]),
    "--diffs-token-parameter": ink(palette["--ax"]),
    "--diffs-token-punctuation": palette["--dim"],
    "--diffs-token-link": ink(palette["--cw"]),
  },
});
