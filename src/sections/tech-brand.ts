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
  siEslint,
  siExpress,
  siFigma,
  siFramer,
  siGit,
  siHtml5,
  siInertia,
  siJest,
  siKubernetes,
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
  siPrettier,
  siPrisma,
  siRabbitmq,
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
import { TECH_LOGOS } from "./tech-logos";
import { EXTRA_MARKS, type Mark } from "./tech-marks";

export const MARKS = new Map<string, Mark>(
  Object.entries({
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
    ESLint: siEslint,
    Express: siExpress,
    Figma: siFigma,
    Framer: siFramer,
    Git: siGit,
    HTML: siHtml5,
    InertiaJS: siInertia,
    Jest: siJest,
    Kubernetes: siKubernetes,
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
    Prettier: siPrettier,
    Prisma: siPrisma,
    RabbitMQ: siRabbitmq,
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
  }),
);

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
const luminance = ({ r, g, b }: Rgb) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
const contrast = (x: Rgb, y: Rgb) => {
  const [a, b] = [luminance(x), luminance(y)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const PANEL = { dark: toRgb("17171f"), light: toRgb("ffffff") };
const GRAYSCALE_MAX_SPREAD = 40;
const NON_TEXT_MIN_CONTRAST = 3;

/** A brand colour (hex without #) for a theme: greys take the text colour, and a colour short of
 * minContrast against the panel moves away from it until it gets there. */
export function brandFor(
  hex: string,
  theme: keyof typeof PANEL,
  minContrast = NON_TEXT_MIN_CONTRAST,
) {
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

const BRANDS = new Map<string, Record<string, string>>(
  [...MARKS].flatMap(([name, { hex }]) => {
    if (!hex) return [];
    const brand = {
      "--brand-dark": brandFor(hex, "dark"),
      "--brand-light": brandFor(hex, "light"),
    };
    return [[name, { ...brand, "--ring": ringOf(name, brand) }]];
  }),
);

/** A tool's brand colours and ring as an inline style string, for its badge (techBadge). */
export function techBrand(name: string) {
  const brand = BRANDS.get(name);
  return brand && styleOf(brand);
}

/** Serializes custom properties the way React writes a style object: `--a:1;--b:2`. */
export const styleOf = (properties: Record<string, string | number>) =>
  Object.entries(properties)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");

let instances = 0;
/** Keeps the gradient ids of each TechIcon on a page apart, as React's useId did. */
export const instanceSuffix = () => `t${++instances}`;
