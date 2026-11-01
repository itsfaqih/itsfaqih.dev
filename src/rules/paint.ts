/**
 * Splits a line of code into runs for colouring: a match of `token` carries the index of the
 * capture group that matched (`kind`), and the text between matches carries none.
 */
export function tokenize(source: string, token: RegExp) {
  const parts: { text: string; kind?: number }[] = [];
  let at = 0;
  for (const match of source.matchAll(token)) {
    if (match.index > at) parts.push({ text: source.slice(at, match.index) });
    parts.push({ text: match[0], kind: match.slice(1).findIndex((group) => group !== undefined) });
    at = match.index + match[0].length;
  }
  if (at < source.length) parts.push({ text: source.slice(at) });
  return parts;
}
