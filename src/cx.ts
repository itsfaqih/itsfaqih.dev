export type ClassValue = string | false | null | undefined | readonly ClassValue[];

export const cx = (...classes: ClassValue[]): string =>
  classes
    .flatMap((value) => (Array.isArray(value) ? cx(...value) : value || []))
    .filter(Boolean)
    .join(" ");
