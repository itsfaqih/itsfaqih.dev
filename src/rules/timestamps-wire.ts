import type { Part } from "./handling-timestamps";

/**
 * Sets the text of a wire line (timestamps-wire.astro) to `parts`, in place. A line's nodes are its parts
 * in order, past the comments between them; a quoted part is a span of `"`, the text and `"`.
 */
export function patchLine(code: Element, parts: Part[]) {
  const nodes = [...code.childNodes].filter((node) => node.nodeType !== Node.COMMENT_NODE);
  parts.forEach((part, index) => {
    const node = nodes[index]!;
    const text = part.quoted ? node.childNodes[2]! : node;
    if (text.nodeValue !== part.text) text.nodeValue = part.text;
  });
}
