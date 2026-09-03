import { cx } from "@/stylex";

const TECH_ICON_MAP = {
  react: "react",
  typescript: "typescript",
  nextjs: "nextdotjs",
  snowflake: "snowflake",
  "react-router": "reactrouter",
  tailwindcss: "tailwindcss",
  vue: "vuedotjs",
  nodejs: "nodedotjs",
  postgresql: "postgresql",
  aws: "amazonwebservices",
  supabase: "supabase",
  "tanstack-start": "tanstack",
  "tanstack-router": "tanstack",
  laravel: "laravel",
  php: "php",
  mysql: "mysql",
  figma: "figma",
  express: "express",
  mongodb: "mongodb",
  astro: "astro",
  docker: "docker",
  vite: "vite",
  biome: "biome",
  vitest: "vitest",
  zod: "zod",
  xstate: "xstate",
  reactflow: "reactflow",
  adonisjs: "adonisjs",
  framer: "framer",
  bun: "bun",
  playwright: "playwright",
} as const;

const TECH_DISPLAY_NAME_MAP: Record<keyof typeof TECH_ICON_MAP, string> = {
  react: "React",
  typescript: "TypeScript",
  nextjs: "Next.js",
  snowflake: "Snowflake",
  "react-router": "React Router",
  tailwindcss: "Tailwind CSS",
  vue: "Vue",
  nodejs: "Node.js",
  postgresql: "PostgreSQL",
  aws: "AWS",
  supabase: "Supabase",
  "tanstack-start": "TanStack Start",
  "tanstack-router": "TanStack Router",
  laravel: "Laravel",
  php: "PHP",
  mysql: "MySQL",
  figma: "Figma",
  express: "Express",
  mongodb: "MongoDB",
  astro: "Astro",
  docker: "Docker",
  vite: "Vite",
  biome: "Biome",
  vitest: "Vitest",
  zod: "Zod",
  xstate: "XState",
  reactflow: "React Flow",
  adonisjs: "AdonisJS",
  framer: "Framer Motion",
  bun: "Bun",
  playwright: "Playwright",
};

export type TechTag = keyof typeof TECH_ICON_MAP;

type TechTagProps = {
  tag: TechTag;
};

export function TechTagComponent({ tag }: TechTagProps) {
  const iconSlug = TECH_ICON_MAP[tag];
  const displayName = TECH_DISPLAY_NAME_MAP[tag];

  return (
    <span className={cx("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-background border border-border text-muted-foreground")}>
      <img
        src={`https://cdn.simpleicons.org/${iconSlug}`}
        alt=""
        className={cx("size-3 opacity-60")}
        style={{ filter: "var(--icon-filter, grayscale(100%))" }}
      />
      {displayName}
    </span>
  );
}
