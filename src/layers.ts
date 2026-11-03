/** Earlier layers lose to later ones and every layer loses to unlayered CSS, so under1 beats under2. */
export const LAYER_ORDER = [
  "base",
  "global",
  "under5",
  "under4",
  "under3",
  "under2",
  "under1",
] as const;
