const NAMED = new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
]);

/** Decodes the character references a built page writes in its head text and attributes. */
export function decodeHtml(text: string) {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (reference, name: string) => {
    if (name[0] !== "#") return NAMED.get(name.toLowerCase()) ?? reference;
    const hex = name[1] === "x" || name[1] === "X";
    return String.fromCodePoint(parseInt(name.slice(hex ? 2 : 1), hex ? 16 : 10));
  });
}
