import * as stylex from "@stylexjs/stylex";

import { utilityStyles } from "./stylex-utilities";

const compiledUtilities = new Map(Object.entries(utilityStyles));

/**
 * Merge legacy utility names through StyleX while preserving selector-based
 * classes for states StyleX cannot model (for example parent selectors).
 */
export function cx(...values: (string | false | null | undefined)[]): string {
  const tokens = values.flatMap((value) => (value ? value.split(/\s+/).filter(Boolean) : []));

  const styleReferences: stylex.CompiledStyles[] = [];
  const fallbackClasses: string[] = [];
  for (const token of tokens) {
    const compiledStyle = compiledUtilities.get(token);
    if (compiledStyle) styleReferences.push(compiledStyle);
    else fallbackClasses.push(token);
  }

  const compiledProps = stylex.props(...styleReferences);
  return [compiledProps.className, ...fallbackClasses].filter(Boolean).join(" ");
}
