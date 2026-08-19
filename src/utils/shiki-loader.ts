const shikiModule = import("shiki");

export function highlightCode(code: string, lang: string) {
  return shikiModule.then(({ codeToHtml }) =>
    codeToHtml(code, {
      lang,
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
    }),
  );
}
