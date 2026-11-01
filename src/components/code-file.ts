import { registerCustomCSSVariableTheme, type FileContents, type FileOptions } from "@pierre/diffs";

const ARCADE_THEME = "arcade";
registerCustomCSSVariableTheme(ARCADE_THEME, {});

const LANGUAGE_EXTENSIONS = new Map(
  Object.entries({
    bash: "sh",
    css: "css",
    html: "html",
    javascript: "js",
    jsx: "jsx",
    json: "json",
    markdown: "md",
    mdx: "mdx",
    shell: "sh",
    text: "txt",
    ts: "ts",
    tsx: "tsx",
    typescript: "ts",
    yaml: "yml",
  }),
);

export const CODE_OPTIONS: FileOptions<undefined, undefined> = {
  theme: {
    light: ARCADE_THEME,
    dark: ARCADE_THEME,
  },
  themeType: "system",
  overflow: "scroll",
  disableLineNumbers: false,
  disableFileHeader: true,
};

export function codeFile(code: string, lang: string): FileContents {
  const language = lang.trim().toLowerCase() || "text";
  return {
    name: `example.${LANGUAGE_EXTENSIONS.get(language) ?? language}`,
    contents: code,
    lang: language,
  };
}
