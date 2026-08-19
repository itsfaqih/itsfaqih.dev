const shikiModule = import("shiki");

const SHIKI_THEMES = {
  light: "github-light",
  dark: "github-dark",
} as const;

type HighlightLanguage = "tsx" | "json" | "typescript";

export function highlightShikiCode(code: string, lang: HighlightLanguage) {
  return shikiModule.then(({ codeToHtml }) =>
    codeToHtml(code, {
      lang,
      themes: SHIKI_THEMES,
    }),
  );
}
