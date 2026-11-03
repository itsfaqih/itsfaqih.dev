export type Theme = "light" | "dark";

/** The classes each theme puts on <html>. theme.vars.css.ts and the plain stylesheets key on them. */
export const THEME_CLASSES: Record<Theme, string[]> = {
  light: ["light"],
  dark: ["dark"],
};

/** Each theme's page background, for the browser chrome's theme-color. */
export const THEME_COLORS: Record<Theme, string> = { light: "#f5f5f8", dark: "#0e0e13" };
