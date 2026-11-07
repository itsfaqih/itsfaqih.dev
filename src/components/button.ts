import { tone, emphasis } from "./button.css";
/** The keys: brand, destructive and neutral, each filled, tinted or text (neutral is never tinted), plus purple filled and tinted, pink tinted, and the page's hue filled and tinted. */
export const buttonVariant = {
  "primary-brand": [tone.brand, emphasis.primary],
  "secondary-brand": [tone.brand, emphasis.secondary],
  "tertiary-brand": [tone.brand, emphasis.tertiary],
  "primary-purple": [tone.purple, tone.purpleFill, emphasis.primary],
  "secondary-purple": [tone.purple, emphasis.secondary],
  "secondary-pink": [tone.pink, emphasis.secondary],
  "primary-hue": [tone.hue, emphasis.primary],
  "secondary-hue": [tone.hue, emphasis.secondary],
  "primary-destructive": [tone.destructive, emphasis.primary],
  "secondary-destructive": [tone.destructive, emphasis.secondary],
  "tertiary-destructive": [tone.destructive, emphasis.tertiary],
  "primary-neutral": [tone.neutral, emphasis.primary],
  "tertiary-neutral": [tone.neutral, emphasis.tertiary],
} as const;

export type ButtonVariant = keyof typeof buttonVariant;
