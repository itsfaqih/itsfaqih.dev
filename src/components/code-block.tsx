import { File } from "@pierre/diffs/react";
import { isValidElement, type ComponentPropsWithoutRef, type CSSProperties, type ReactElement } from "react";
import { CODE_OPTIONS, codeFile } from "./code-file";

type CodeBlockProps = {
  code: string;
  lang: string;
  prerenderedHTML?: string;
};

export function CodeBlock({ code, lang, prerenderedHTML }: CodeBlockProps) {
  const fileStyle: CSSProperties = {
    "--lines": code.split("\n").length,
    "--diffs-font-family": "var(--mono)",
    "--diffs-header-font-family": "var(--font-sans)",
  };

  return (
    <File
      file={codeFile(code, lang)}
      options={CODE_OPTIONS}
      prerenderedHTML={prerenderedHTML}
      className="code-block"
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
    codeProps?.["data-language"] ??
    className.match(/(?:^|\s)language-([^\s]+)/)?.[1] ??
    "text";
  const code = readText(codeProps?.children ?? props.children).replace(/\r?\n$/, "");

  return <CodeBlock code={code} lang={language} prerenderedHTML={props["data-prerendered"]} />;
}
