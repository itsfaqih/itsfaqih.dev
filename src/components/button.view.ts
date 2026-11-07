import { tone, emphasis } from "./button.css";
/** The keys: brand filled, neutral filled or text, purple filled and tinted, pink tinted, and the page's hue filled and tinted. */
export const buttonVariant = {
  "primary-brand": [tone.brand, emphasis.primary],
  "primary-purple": [tone.purple, tone.purpleFill, emphasis.primary],
  "secondary-purple": [tone.purple, emphasis.secondary],
  "secondary-pink": [tone.pink, emphasis.secondary],
  "primary-hue": [tone.hue, emphasis.primary],
  "secondary-hue": [tone.hue, emphasis.secondary],
  "primary-neutral": [tone.neutral, emphasis.primary],
  "tertiary-neutral": [tone.neutral, emphasis.tertiary],
} as const;
