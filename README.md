# Faqih Muntashir’s website

Personal website built with React, TanStack Start, Vite, and StyleX. It includes a homepage, MDX blog, and interactive Rule of Thumb articles.

## Development

```bash
vp install
vp dev
```

Vite is configured for `http://127.0.0.1:5173`. If that port belongs to another project, use a separate port rather than stopping its server:

```bash
vp dev --port 5174 --strictPort
```

The project uses [Vite+](https://viteplus.dev) with pnpm behind it. `package.json` pins pnpm in `packageManager` and `.node-version` pins Node; `vp` downloads both on first use. Cloudflare Pages reads `.node-version` but not `packageManager`, so its project settings set `PNPM_VERSION=12.16.1`. Add and remove dependencies with `vp add` and `vp remove`, and run other scripts with `vp run ...`. `pnpm-workspace.yaml` holds the Vite+ catalog and the packages allowed to run install scripts.

## Checks

```bash
vp run lint
vp run typecheck
vp run test
vp run test:visual
vp build
```

Oxlint runs the default rules plus all generic [anti-slop](https://github.com/dmmulroy/anti-slop) rules at error severity. Lint and format configuration lives in the `lint` and `fmt` blocks of `vite.config.ts`; Vite+ bundles Oxlint and Oxfmt. The vendored plugin, license, upstream revision, and local compatibility note live in `tools/oxlint/anti-slop/`, which the formatter skips so it stays byte-for-byte with upstream. `vp run typecheck` runs [tsrs](https://github.com/oxc-project/tsrs), a Rust port of the TypeScript 7 checker.

Agent assets, the vendored plugin, and TanStack's generated route tree are excluded from application linting. Owned Storybook configuration remains checked. The vendored TypeScript source is included in typechecking. Effect rules are not enabled because the website has no direct Effect dependency.

Vitest has two projects. `unit` runs `src/**/*.test.{ts,tsx}` in jsdom, with the StyleX plugin compiling components as the site build does. The test command allows an empty suite, but regression tests should be added for behavior changed during maintenance.

`visual` builds the site, serves the prerendered pages in `.output/public`, and screenshots every page with Playwright Chromium at desktop (1440px) and mobile (390px) widths in light and dark themes. Each screenshot is compared with its baseline in `tests/visual/__screenshots__/`. On a failure, the actual and diff images land in `tests/visual/__diff__/`. Pages are discovered from the build, so a new page fails the suite until its baselines exist, and a removed page fails it until its baselines are deleted. After an intended visual change, run `vp run test:visual:update`, review the changed PNGs, and commit them. Baselines are rendered on macOS; another OS renders fonts differently and needs its own baselines.

## Production

```bash
vp build
```

TanStack Start prerenders discoverable routes as complete HTML in `.output/public`. React hydrates those pages for client-side navigation and interactions; static hosting does not need a runtime server. The Cloudflare preview command uses `scripts/cloudflare-pages-preview.mjs` when the Cloudflare build environment is detected.

## Fonts

```bash
uv run scripts/fonts.py
```

The build does not process fonts. The script cuts Geist, Geist Mono and Unbounded down to the weights, OpenType features and characters the site uses, writes two files per family to `public/fonts/` and their `@font-face` rules to `src/fonts.css`, and rebuilds the OG card fonts in `scripts/og/fonts/`; commit what it writes. The build inlines each `-core.woff2` (ASCII and common punctuation) into every page. A page fetches the family's `-extended.woff2` (Latin-1, Latin Extended-A and a few symbols) only when it draws one of those characters. Edit `FAMILIES` or `FEATURES` in the script and rerun it when a family is set at a weight outside its range or draws a character outside its two files, when a page turns on an OpenType feature or sets a `lang` other than English, or when a font is upgraded. Each run lists the characters in `src/` that no file has; a system font draws those.

## Storybook

```bash
vp run storybook
vp run build-storybook
```

Stories live in `src/stories` and use the same global stylesheet and StyleX tokens as the website. With no theme class on `<html>`, they render in the dark palette. The explicit `*.stories.tsx` glob keeps route MDX files in the TanStack Start pipeline.

## Source layout

- `src/routes/`: file-based routes and their local components. `src/routes/__root.tsx` owns the root layout and development-only React Grab loader.
- `src/components/`: shared UI and article thumbnails.
- `src/hooks/`: shared browser and interaction hooks.
- `src/content/blog/`: MDX articles.
- `src/data/guidelines.ts`: Rule of Thumb metadata.
- Styles: every component styles itself with a colocated StyleX `stylex.create`. Styles shared across files live in their own modules at the lowest common ancestor: `src/components/arcade.ts` (the arcade roots, column, scanlines and screen-reader text), `button.ts` and `load-in.ts`, and `src/routes/-components/section.ts` and `hero-type.ts`.
- `src/styles.css`, `src/arcade.css` and `src/fonts.css`: the only global CSS, for what StyleX cannot express: the preflight reset, `@font-face`, the Lenis sheet, rules on `<html>` and the classes scripts set on it, view transitions, `@property` registrations and the reduced-motion blanket. Each rule says why it is global.
- `src/theme.stylex.ts` and `src/theme.ts`: StyleX tokens and the light theme.
- `src/routeTree.gen.ts`: generated by TanStack; do not edit by hand.
- `public/rule-of-thumb/<id>.md`: the Markdown twin of each rule page, served by its "View .md" link for readers to paste into an `AGENTS.md`. Change it with the page. `src/routes/rule-of-thumb/-markdown-twins.test.ts` checks that it opens with the rule's title and claim, has a section per lesson and carries every TL;DR row.

See `CODE_STRUCTURE.md` and `STYLING_GUIDELINES.md` for repository conventions. The interactive article demos are site content, not disposable starter examples.
