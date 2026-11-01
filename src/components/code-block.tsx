import * as stylex from "@stylexjs/stylex";
import { File } from "@pierre/diffs/react";
import {
  isValidElement,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactElement,
} from "react";
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

type MarkdownCodeChild =
  | string
  | number
  | boolean
  | null
  | undefined
  | ReactElement<MarkdownCodeElementProps>
  | readonly MarkdownCodeChild[];

type MarkdownCodeElementProps = {
  children?: MarkdownCodeChild;
  className?: string;
  "data-language"?: string;
};

function isCodeChildren(node: MarkdownCodeChild): node is readonly MarkdownCodeChild[] {
  return Array.isArray(node);
}

function readText(node: MarkdownCodeChild): string {
  if (node == null || node === true || node === false) return "";
  if (isCodeChildren(node)) return node.map(readText).join("");
  if (isValidElement<MarkdownCodeElementProps>(node)) return readText(node.props.children);
  return String(node);
}

type MarkdownCodeBlockProps = Omit<ComponentPropsWithoutRef<"pre">, "children"> & {
  children?: MarkdownCodeChild;
  "data-prerendered"?: string;
};

export function MarkdownCodeBlock(props: MarkdownCodeBlockProps) {
  const codeProps = isValidElement<MarkdownCodeElementProps>(props.children)
    ? props.children.props
    : undefined;
  const className = codeProps?.className ?? "";
  const language =
    codeProps?.["data-language"] ?? className.match(/(?:^|\s)language-([^\s]+)/)?.[1] ?? "text";
  const code = readText(codeProps?.children ?? props.children).replace(/\r?\n$/, "");

  return <CodeBlock code={code} lang={language} prerenderedHTML={props["data-prerendered"]} />;
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
