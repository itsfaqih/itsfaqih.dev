import { registerCustomCSSVariableTheme } from "@pierre/diffs";
import { File, type FileContents, type FileOptions } from "@pierre/diffs/react";
import { isValidElement, type ComponentPropsWithoutRef, type CSSProperties, type ReactElement } from "react";

const ARCADE_THEME = "arcade";
registerCustomCSSVariableTheme(ARCADE_THEME, {});

type CodeBlockProps = {
  code: string;
  lang: string;
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

export function CodeBlock({ code, lang }: CodeBlockProps) {
  const language = lang.trim().toLowerCase() || "text";
  const file: FileContents = {
    name: `example.${LANGUAGE_EXTENSIONS.get(language) ?? language}`,
    contents: code,
    lang: language,
  };
  const options: FileOptions<undefined, undefined> = {
    theme: {
      light: ARCADE_THEME,
      dark: ARCADE_THEME,
    },
    themeType: "system",
    overflow: "scroll",
    disableLineNumbers: false,
    disableFileHeader: true,
  };

  const fileStyle: CSSProperties = {
    "--lines": code.split("\n").length,
    "--diffs-font-family": "var(--mono)",
    "--diffs-header-font-family": "var(--font-sans)",
  };

  return <File file={file} options={options} className="code-block" style={fileStyle} />;
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
  const code = readText(codeProps?.children ?? props.children).replace(/\r?\n$/, "");

  return <CodeBlock code={code} lang={language} />;
}
