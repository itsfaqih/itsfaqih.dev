import * as stylex from "@stylexjs/stylex";
import { type CSSProperties, useId } from "react";
import {
  siAdonisjs,
  siApache,
  siAstro,
  siBaseui,
  siBiome,
  siBun,
  siClaudecode,
  siCss,
  siCypress,
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
import { palette } from "../../theme.stylex";
import { TECH_LOGOS } from "./tech-logos";
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
  Cypress: siCypress,
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

/** A brand colour (hex without #) for a theme: greys take the text colour, and a colour short of
 * minContrast against the panel moves away from it until it gets there. */
export function brandFor(hex: string, theme: keyof typeof PANEL, minContrast = NON_TEXT_MIN_CONTRAST) {
  const rgb = toRgb(hex);
  const spread = Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b);
  if (spread < GRAYSCALE_MAX_SPREAD) return "var(--text)";
  const toward = theme === "dark" ? 255 : 0;
  let mixed = rgb;
  for (let t = 0; contrast(mixed, PANEL[theme]) < minContrast && t <= 1; t += 0.05) {
    mixed = mix(rgb, toward, t);
  }
  return toHex(mixed);
}

// The outline a badge lights up in: the logo's colours around a conic gradient, each where it sits
// in the logo, or the one brand colour of a single-colour mark. light-dark() follows the theme.
function ringOf(name: string, brand: { "--brand-dark": string; "--brand-light": string }) {
  const stops = TECH_LOGOS.get(name)?.ring ?? [];
  if (stops.length < 2) {
    const tone = stops[0]?.[0] ?? `light-dark(${brand["--brand-light"]}, ${brand["--brand-dark"]})`;
    return `linear-gradient(${tone}, ${tone})`;
  }
  const from = stops[0]?.[1] ?? 0;
  const around = stops.map(([tone, at]) => `${tone} ${at - from}deg`);
  return `conic-gradient(from ${from}deg, ${around.join(", ")}, ${stops[0]?.[0]} 360deg)`;
}

const BRANDS = new Map<string, CSSProperties>(
  [...MARKS].flatMap(([name, { hex }]) => {
    if (!hex) return [];
    const brand = { "--brand-dark": brandFor(hex, "dark"), "--brand-light": brandFor(hex, "light") };
    return [[name, { ...brand, "--ring": ringOf(name, brand) }]];
  }),
);

export function techBrand(name: string) {
  return BRANDS.get(name);
}

/**
 * A tool's one-colour mark (drawn from its logo where simple-icons draws another shape), which
 * `style` can tint, over its logo in its own colours: the logo
 * themed by scripts/tech-logos.py, or the mark in its brand colour where there is no such logo.
 * The colours show while an ancestor sets --lit to 1 (iconLit), and the mark fades out for them.
 * A logo wider than it is tall (the VoidZero marks in their parentheses) widens the icon to fit.
 */
export function TechIcon({ name, style }: { name: string; style?: stylex.StyleXStyles }) {
  const suffix = useId().replace(/[^\w-]/g, "");
  const mark = MARKS.get(name);
  if (!mark) return null;
  const logo = TECH_LOGOS.get(name);
  const path = <path d={mark.path} fillRule={mark.evenOdd ? "evenodd" : undefined} />;
  const [, , width = 1, height = 1] = logo?.viewBox.split(" ").map(Number) ?? [];
  return (
    <span
      {...stylex.props(icon.pair, style)}
      style={width > height ? { "--wide": width / height } : undefined}
      aria-hidden="true"
    >
      {logo?.flat ? (
        <svg
          {...stylex.props(icon.flat)}
          viewBox={logo.viewBox}
          dangerouslySetInnerHTML={{ __html: logo.flat.replaceAll("$", suffix) }}
        />
      ) : (
        <svg {...stylex.props(icon.flat)} viewBox={mark.viewBox ?? "0 0 24 24"}>
          {path}
        </svg>
      )}
      {logo ? (
        <svg
          {...stylex.props(icon.lit)}
          viewBox={logo.viewBox}
          dangerouslySetInnerHTML={{ __html: logo.body.replaceAll("$", suffix) }}
        />
      ) : (
        <svg {...stylex.props(icon.lit, styles.brand)} viewBox={mark.viewBox ?? "0 0 24 24"}>
          {path}
        </svg>
      )}
    </span>
  );
}

// The tool's own colour for the current theme, from techBrand's inline properties.
const BRAND = {
  "--brand": {
    default: `var(--brand-dark, ${palette["--go-ink"]})`,
    ":is(.light *)": `var(--brand-light, ${palette["--go-ink"]})`,
  },
};

/**
 * `badge` lays a tool's mark and name in a row, and `brand` sets --brand, a single-colour mark's
 * colour. Pair either with techBrand(name) as the inline style, which also carries --ring.
 */
export const techBadge = stylex.create({
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    userSelect: "none",
    ...BRAND,
  },
  brand: BRAND,
});

const FADE = {
  transitionProperty: "opacity",
  transitionDuration: "120ms",
  transitionTimingFunction: "ease",
};

/** The two layers of a TechIcon or CompanyLogo: `flat`, the one-colour mark, and `lit`, the colours. */
export const icon = stylex.create({
  pair: {
    flex: "none",
    display: "inline-grid",
    width: "calc(1.15em * var(--wide, 1))",
    height: "1.15em",
    color: palette["--dim"],
  },
  flat: {
    gridArea: "1 / 1",
    width: "100%",
    height: "100%",
    fill: "currentColor",
    opacity: "calc(1 - var(--lit, 0))",
    ...FADE,
  },
  lit: {
    gridArea: "1 / 1",
    width: "100%",
    height: "100%",
    opacity: "var(--lit, 0)",
    ...FADE,
  },
});

/** Lights the icons inside: set it on a badge under the pointer, focused, pressed or open. */
export const iconLit = stylex.create({
  on: {
    "--lit": "1",
  },
  hover: {
    "--lit": { default: null, ":hover": "1", ":focus-visible": "1" },
  },
});

const styles = stylex.create({
  brand: {
    fill: `var(--brand, ${palette["--mute"]})`,
  },
});
