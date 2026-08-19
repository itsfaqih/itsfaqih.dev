import * as stylex from "@stylexjs/stylex";

import { utilityStyles } from "./stylex-utilities";

export type ClassValue =
  | string
  | false
  | null
  | undefined
  | readonly ClassValue[]
  | { readonly [className: string]: boolean | null | undefined };

const compiledUtilities = utilityStyles as unknown as Record<string, stylex.CompiledStyles>;

function flattenClassValues(value: ClassValue, output: string[]): void {
  if (!value) return;
  if (typeof value === "string") {
    output.push(...value.split(/\s+/).filter(Boolean));
    return;
  }
  if (Array.isArray(value)) {
    for (const nestedValue of value) flattenClassValues(nestedValue, output);
    return;
  }
  for (const [className, enabled] of Object.entries(value)) {
    if (enabled) output.push(className);
  }
}

/**
 * Merge legacy utility names through StyleX while preserving selector-based
 * classes for states StyleX cannot model (for example parent selectors).
 */
export function cx(...values: ClassValue[]): string {
  const tokens: string[] = [];
  for (const value of values) flattenClassValues(value, tokens);

  const styleReferences: stylex.CompiledStyles[] = [];
  const fallbackClasses: string[] = [];
  for (const token of tokens) {
    const compiledStyle = compiledUtilities[token];
    if (compiledStyle) styleReferences.push(compiledStyle);
    else fallbackClasses.push(token);
  }

  const compiledProps = stylex.props(...styleReferences);
  return [compiledProps.className, ...fallbackClasses].filter(Boolean).join(" ");
}
