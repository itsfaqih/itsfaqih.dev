import { FlowArrowIcon, MaskHappyIcon } from "@phosphor-icons/react";
import type { CSSProperties } from "react";
import {
  siAdonisjs,
  siBaseui,
  siBiome,
  siClaudecode,
  siDocker,
  siEffect,
  siExpress,
  siFigma,
  siLaravel,
  siMongodb,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siReact,
  siReactrouter,
  siRedis,
  siSnowflake,
  siTailwindcss,
  siTanstack,
  siTypescript,
  siVite,
  siVitest,
  siXstate,
  siZod,
  type SimpleIcon,
} from "simple-icons";

const MARKS = {
  AdonisJS: siAdonisjs,
  "Base UI": siBaseui,
  Biome: siBiome,
  "Claude Code": siClaudecode,
  Docker: siDocker,
  Effect: siEffect,
  Express: siExpress,
  Figma: siFigma,
  Laravel: siLaravel,
  MongoDB: siMongodb,
  MySQL: siMysql,
  "Next.js": siNextdotjs,
  "Node.js": siNodedotjs,
  PostgreSQL: siPostgresql,
  React: siReact,
  "React Router": siReactrouter,
  Redis: siRedis,
  Snowflake: siSnowflake,
  "Tailwind CSS": siTailwindcss,
  TanStack: siTanstack,
  "TanStack Router": siTanstack,
  TypeScript: siTypescript,
  Vite: siVite,
  Vitest: siVitest,
  XState: siXstate,
  Zod: siZod,
} satisfies Record<string, SimpleIcon>;

const STAND_INS = {
  "React Flow": FlowArrowIcon,
  Playwright: MaskHappyIcon,
};

const STAND_IN_HEX: Record<keyof typeof STAND_INS, string> = {
  "React Flow": "FF0072",
  Playwright: "2EAD33",
};

const entryOf = <T,>(table: Record<string, T>, name: string) =>
  Object.entries(table).find(([key]) => key === name)?.[1];

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
  const hex = entryOf(MARKS, name)?.hex ?? entryOf(STAND_IN_HEX, name);
  if (!hex) return undefined;
  return { "--brand-dark": brandFor(hex, "dark"), "--brand-light": brandFor(hex, "light") };
}

export function TechIcon({ name }: { name: string }) {
  const mark = entryOf(MARKS, name);
  if (mark) {
    return (
      <svg className="ti" viewBox="0 0 24 24" aria-hidden="true">
        <path d={mark.path} />
      </svg>
    );
  }
  const StandIn = entryOf(STAND_INS, name);
  return StandIn ? <StandIn className="ti" weight="bold" aria-hidden="true" /> : null;
}
