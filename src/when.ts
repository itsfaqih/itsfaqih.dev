/**
 * Class names a parent or an earlier sibling carries so a descendant can style itself on that
 * parent's state. Plain strings, since they go into `class` attributes and into selectors alike.
 */
export const marker = "marker";

export const when = {
  /** Matches an element inside a `on` element in `state`, such as `:hover` or `[data-open]`. */
  ancestor: (state: string, on = marker) => `:where(.${on}${state} *)`,
  /** Matches an element after a `on` sibling in `state`. */
  siblingBefore: (state: string, on = marker) => `:where(.${on}${state} ~ *)`,
};
