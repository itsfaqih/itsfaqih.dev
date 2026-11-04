export const marker = "marker";

export const when = {
  ancestor: (state: string, markerClass = marker) => `:where(.${markerClass}${state} *)`,
  siblingBefore: (state: string, markerClass = marker) => `:where(.${markerClass}${state} ~ *)`,
};
