export function toolToIcon(tool: "typescript" | "react" | "astro" | "figma") {
  switch (tool) {
    case "astro":
      return "logos:astro-icon";
    case "figma":
      return "logos:figma";
    case "react":
      return "logos:react";
    case "typescript":
      return "logos:typescript-icon";
  }
}
