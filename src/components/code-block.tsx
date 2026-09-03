import { File, type FileContents, type FileOptions } from "@pierre/diffs/react";
import { isValidElement, useMemo, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "../cn";

type CodeBlockProps = {
  code: string;
  lang?: string;
  className?: string;
  style?: CSSProperties;
  highlightLines?: readonly number[];
  highlightBackground?: string;
  highlightBorder?: string;
};

const LANGUAGE_EXTENSIONS: Record<string, string> = {
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
};

function normalizeLanguage(language: string) {
  const normalized = language.trim().toLowerCase();
  return normalized || "text";
}

function getFilename(language: string) {
  return `example.${LANGUAGE_EXTENSIONS[language] ?? language}`;
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
  const file = useMemo<FileContents>(
    () => ({
      name: getFilename(language),
      contents: code,
      lang: language,
    }),
    [code, language],
  );
  const options = useMemo<FileOptions<undefined>>(
    () => ({
      theme: {
        light: "github-light",
        dark: "github-dark",
      },
      themeType: "system",
      overflow: "scroll",
      disableLineNumbers: false,
      disableFileHeader: true,
      unsafeCSS: createHighlightStyles(highlightLines, highlightBackground, highlightBorder),
    }),
    [highlightBackground, highlightBorder, highlightLines],
  );

  return (
    <File
      file={file}
      options={options}
      className={cn("code-block", className)}
      style={
        {
          "--diffs-font-family": "var(--font-mono)",
          "--diffs-header-font-family": "var(--font-sans)",
          ...style,
        } as CSSProperties
      }
    />
  );
}

type MarkdownCodeElementProps = {
  children?: ReactNode;
  className?: string;
  "data-language"?: string;
};

function readText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(readText).join("");
  if (!isValidElement(node)) return "";

  return readText((node.props as MarkdownCodeElementProps).children);
}

export function MarkdownCodeBlock(props: ComponentPropsWithoutRef<"pre">) {
  const codeElement = isValidElement(props.children) ? props.children : undefined;
  const codeProps = codeElement?.props as MarkdownCodeElementProps | undefined;
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
