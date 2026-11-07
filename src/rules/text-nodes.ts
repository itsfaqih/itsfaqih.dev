/** The text nodes directly inside `element`, in order. */
export const texts = (element: Element) =>
  [...element.childNodes].filter((node): node is Text => node.nodeType === Node.TEXT_NODE);
