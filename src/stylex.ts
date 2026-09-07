import * as stylex from "@stylexjs/stylex";

import { utilityStyles } from "./stylex-utilities";

type ClassSelection = {
  readonly [className: string]: boolean | null | undefined;
};

export type ClassValue = string | false | null | undefined | readonly ClassValue[] | ClassSelection;

const compiledUtilities = new Map(Object.entries(utilityStyles));

function isClassValueArray(value: ClassValue): value is readonly ClassValue[] {
  return Array.isArray(value);
}

function isClassSelection(value: ClassValue): value is ClassSelection {
  return Object(value) === value && !isClassValueArray(value);
}

/**
 * Merge legacy utility names through StyleX while preserving selector-based
 * classes for states StyleX cannot model (for example parent selectors).
 */
export function cx(...values: ClassValue[]): string {
  const tokens: string[] = [];
  const remaining = [...values];
  while (remaining.length > 0) {
    const value = remaining.shift();
    if (!value) continue;
    if (isClassValueArray(value)) {
      remaining.unshift(...value);
      continue;
    }
    if (isClassSelection(value)) {
      for (const [className, enabled] of Object.entries(value)) {
        if (enabled) tokens.push(className);
      }
      continue;
    }
    tokens.push(...value.split(/\s+/).filter(Boolean));
  }

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
