import type { CSSProperties } from "react";
import {
  siAdonisjs,
  siApache,
  siAstro,
  siBaseui,
  siBiome,
  siBun,
  siClaudecode,
  siCss,
  siDocker,
  siDrizzle,
  siEffect,
  siEjs,
  siExpress,
  siFigma,
  siFramer,
  siGit,
  siHtml5,
  siInertia,
  siJest,
  siLaravel,
  siMariadb,
  siMockserviceworker,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNginx,
  siNodedotjs,
  siOpencode,
  siOpenrouter,
  siOxc,
  siPhosphoricons,
  siPhp,
  siPostcss,
  siPostgresql,
  siPrisma,
  siRadixui,
  siReact,
  siReactrouter,
  siRedis,
  siRedux,
  siShadcnui,
  siSnowflake,
  siStorybook,
  siTailwindcss,
  siTanstack,
  siTrpc,
  siTypescript,
  siVite,
  siVitest,
  siVuedotjs,
  siXstate,
  siXyflow,
  siZod,
} from "simple-icons";
import { EXTRA_MARKS, type Mark } from "./tech-marks";

const MARKS = new Map<string, Mark>(Object.entries({
  AdonisJS: siAdonisjs,
  Apache: siApache,
  Astro: siAstro,
  "Base UI": siBaseui,
  Biome: siBiome,
  Bun: siBun,
  "Claude Code": siClaudecode,
  CSS: siCss,
  Docker: siDocker,
  Drizzle: siDrizzle,
  Effect: siEffect,
  EJS: siEjs,
  Express: siExpress,
  Figma: siFigma,
  Framer: siFramer,
  Git: siGit,
  HTML: siHtml5,
  InertiaJS: siInertia,
  Jest: siJest,
  Laravel: siLaravel,
  MariaDB: siMariadb,
  MongoDB: siMongodb,
  MSW: siMockserviceworker,
  MySQL: siMysql,
  "Next.js": siNextdotjs,
  NGINX: siNginx,
  "Node.js": siNodedotjs,
  OpenCode: siOpencode,
  OpenRouter: siOpenrouter,
  Oxfmt: siOxc,
  Oxlint: siOxc,
  "Phosphor Icons": siPhosphoricons,
  PHP: siPhp,
  PostCSS: siPostcss,
  PostgreSQL: siPostgresql,
  Prisma: siPrisma,
  "Radix UI": siRadixui,
  "React Flow": siXyflow,
  "React Router": siReactrouter,
  React: siReact,
  Redis: siRedis,
  Redux: siRedux,
  "Shadcn UI": siShadcnui,
  Snowflake: siSnowflake,
  Storybook: siStorybook,
  "Tailwind CSS": siTailwindcss,
  "TanStack Query": siTanstack,
  "TanStack Router": siTanstack,
  "TanStack Start": siTanstack,
  TanStack: siTanstack,
  tRPC: siTrpc,
  TypeScript: siTypescript,
  Vite: siVite,
  Vitest: siVitest,
  Vue: siVuedotjs,
  XState: siXstate,
  Zod: siZod,
  ...EXTRA_MARKS,
}));

type Rgb = { r: number; g: number; b: number };

const toRgb = (hex: string): Rgb => ({
  r: parseInt(hex.slice(0, 2), 16),
  g: parseInt(hex.slice(2, 4), 16),
  b: parseInt(hex.slice(4, 6), 16),
});
const mix = ({ r, g, b }: Rgb, toward: number, t: number): Rgb => ({
  r: r + (toward - r) * t,
  g: g + (toward - g) * t,
  b: b + (toward - b) * t,
});
const toHex = ({ r, g, b }: Rgb) =>
  `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
const channel = (c: number) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const luminance = ({ r, g, b }: Rgb) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (x: Rgb, y: Rgb) => {
  const [a, b] = [luminance(x), luminance(y)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const PANEL = { dark: toRgb("17171f"), light: toRgb("ffffff") };
const GRAYSCALE_MAX_SPREAD = 40;
const NON_TEXT_MIN_CONTRAST = 3;

function brandFor(hex: string, theme: keyof typeof PANEL) {
  const rgb = toRgb(hex);
  const spread = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
  if (spread < GRAYSCALE_MAX_SPREAD) return "var(--text)";
  const toward = theme === "dark" ? 255 : 0;
  let mixed = rgb;
  for (let t = 0; contrast(mixed, PANEL[theme]) < NON_TEXT_MIN_CONTRAST && t <= 1; t += 0.05) {
    mixed = mix(rgb, toward, t);
  }
  return toHex(mixed);
}

export function techBrand(name: string): CSSProperties | undefined {
  const hex = MARKS.get(name)?.hex;
  if (!hex) return undefined;
  return { "--brand-dark": brandFor(hex, "dark"), "--brand-light": brandFor(hex, "light") };
}

export function TechIcon({ name }: { name: string }) {
  const mark = MARKS.get(name);
  if (!mark) return null;
  return (
    <svg className="ti" viewBox={mark.viewBox ?? "0 0 24 24"} aria-hidden="true">
      <path d={mark.path} fillRule={mark.evenOdd ? "evenodd" : undefined} />
    </svg>
  );
}
