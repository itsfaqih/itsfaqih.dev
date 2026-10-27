import { registerCustomCSSVariableTheme } from "@pierre/diffs";
import { File, type FileContents, type FileOptions } from "@pierre/diffs/react";
import { isValidElement, type ComponentPropsWithoutRef, type CSSProperties, type ReactElement } from "react";
import { cn } from "../cn";

// One syntax theme for both appearances: token colours are CSS variables, set on
// .code-block in rot.css from the arcade palette, so they flip with the page theme.
const ARCADE_THEME = "arcade";
registerCustomCSSVariableTheme(ARCADE_THEME, {
  foreground: "#f4f4f8",
  background: "#17171f",
  "token-comment": "#87879d",
  "token-keyword": "#ff6ad5",
  "token-string": "#7dff6a",
  "token-string-expression": "#7dff6a",
  "token-constant": "#ffe14d",
  "token-function": "#4dd4ff",
  "token-parameter": "#9d7bff",
  "token-punctuation": "#a1a1b5",
  "token-link": "#4dd4ff",
});

type CodeBlockProps = {
  code: string;
  lang?: string;
  className?: string;
  style?: CSSProperties;
  highlightLines?: readonly number[];
  highlightBackground?: string;
  highlightBorder?: string;
};

const LANGUAGE_EXTENSIONS = new Map(Object.entries({
  bash: "sh",
  css: "css",
  html: "html",
  javascript: "js",
  jsx: "jsx",
  json: "json",
  markdown: "md",
  mdx: "mdx",
  shell: "sh",
  text: "txt",
  ts: "ts",
  tsx: "tsx",
  typescript: "ts",
  yaml: "yml",
}));

function normalizeLanguage(language: string) {
  const normalized = language.trim().toLowerCase();
  return normalized || "text";
}

function getFilename(language: string) {
  return `example.${LANGUAGE_EXTENSIONS.get(language) ?? language}`;
}

function createHighlightStyles(
  highlightLines: readonly number[] | undefined,
  highlightBackground = "color-mix(in srgb, var(--diffs-bg) 86%, var(--diffs-mixer))",
  highlightBorder = "var(--diffs-fg)",
) {
  const lines = [...new Set(highlightLines?.filter((line) => Number.isInteger(line) && line > 0) ?? [])];
  if (lines.length === 0) return undefined;

  const highlightedSelectors = lines.map((line) => `:host [data-line="${line}"]`).join(",\n");

  return `
    :host [data-line] {
      opacity: 0.4;
      transition: opacity 180ms ease, background-color 180ms ease, box-shadow 180ms ease;
    }

    ${highlightedSelectors} {
      opacity: 1;
      background-color: ${highlightBackground};
      box-shadow: inset 3px 0 ${highlightBorder};
    }
  `;
}

export function CodeBlock({
  code,
  lang = "tsx",
  className,
  style,
  highlightLines,
  highlightBackground,
  highlightBorder,
}: CodeBlockProps) {
  const language = normalizeLanguage(lang);
  const file: FileContents = {
    name: getFilename(language),
    contents: code,
    lang: language,
  };
  const options: FileOptions<undefined> = {
    theme: {
      light: ARCADE_THEME,
      dark: ARCADE_THEME,
    },
    themeType: "system",
    overflow: "scroll",
    disableLineNumbers: false,
    disableFileHeader: true,
    unsafeCSS: createHighlightStyles(highlightLines, highlightBackground, highlightBorder),
  };

  const fileStyle: CSSProperties = {
    "--diffs-font-family": "var(--mono)",
    "--diffs-header-font-family": "var(--font-sans)",
    ...style,
  };

  return (
    <File
      file={file}
      options={options}
      className={cn("code-block", className)}
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
};

export function MarkdownCodeBlock(props: MarkdownCodeBlockProps) {
  const codeProps = isValidElement<MarkdownCodeElementProps>(props.children)
    ? props.children.props
    : undefined;
  const className = codeProps?.className ?? "";
  const language =
    codeProps?.["data-language"] ??
    className.match(/(?:^|\s)language-([^\s]+)/)?.[1] ??
    "text";
  const rawCode = readText(codeProps?.children ?? props.children);
  const code = rawCode.endsWith(String.fromCharCode(13, 10))
    ? rawCode.slice(0, -2)
    : rawCode.endsWith("\n")
      ? rawCode.slice(0, -1)
      : rawCode;

  return <CodeBlock code={code} lang={language} />;
}
