export type ClassValue = string | false | null | undefined | readonly ClassValue[];

/**
 * Joins class names, skipping the falsy ones. It does not merge: which class wins is decided by the
 * cascade layers in `layers.css.ts`, so an override's order here changes nothing.
 */
export const cx = (...classes: ClassValue[]): string =>
  classes
    .flatMap((value) => (Array.isArray(value) ? cx(...value) : value || []))
    .filter(Boolean)
    .join(" ");
