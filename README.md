# Faqih Muntashir’s website

Personal website built with Astro and StyleX. It includes a homepage, MDX blog, and interactive Rule of Thumb articles. Astro prerenders every page to static HTML, and the interactive parts are custom elements that `*.client.ts` modules define in the browser.

## Development

```bash
vp install
vp dev
```

`vp dev` runs `astro dev` at `http://127.0.0.1:5173`. If that port belongs to another project, use a separate port rather than stopping its server:

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
vp run test:behavior
vp run build
vp node scripts/head-parity.ts <other-build>
```

Oxlint runs the default rules plus all generic [anti-slop](https://github.com/dmmulroy/anti-slop) rules at error severity. Lint and format configuration lives in the `lint` and `fmt` blocks of `vite.config.ts`, which holds nothing else; Vite+ bundles Oxlint and Oxfmt. Astro builds from `astro.config.ts`, and `vitest.config.ts` holds the test projects. The vendored plugin, license, upstream revision, and local compatibility note live in `tools/oxlint/anti-slop/`, which the formatter skips so it stays byte-for-byte with upstream. `vp run typecheck` runs [tsrs](https://github.com/oxc-project/tsrs), a Rust port of the TypeScript 7 checker.

Agent assets, the vendored plugin, the build output, and Astro's generated `.astro/` types are excluded from application linting. The vendored TypeScript source is included in typechecking. Effect rules are not enabled because the website has no direct Effect dependency. `no-restricted-imports` rejects React, React DOM, `@astrojs/react`, Base UI, Vaul and Phosphor's React package, which left with the migration.

Vitest has three projects. `unit` runs `src/**/*.test.ts` in jsdom, with the StyleX plugin compiling components as the site build does. `tests/unit/setup.ts` stands in for the `matchMedia` jsdom lacks, answering every query false. The test command allows an empty suite, but regression tests should be added for behavior changed during maintenance.

`visual` serves the build in `dist/` (another directory through `SITE_DIR`) and runs three files. `pages.test.ts` screenshots every page with Playwright Chromium at desktop (1440px) and mobile (390px) widths in light and dark themes. Before each capture it scrolls the page through so every scroll reveal plays, and it fails if a rendered `[data-cut]` or `[data-rev]` block is still unrevealed; a new reveal marker joins `unrevealedSelector` in `pages.test.ts`. Each screenshot spans the viewport width and the page's scroll height, and is compared with its baseline in `tests/visual/__screenshots__/`, failing when more than 20 pixels differ. Any error the page logs or throws also fails it. On a failure, the actual and diff images land in `tests/visual/__diff__/`. Pages are discovered from the build, so a new page fails the suite until its baselines exist, and a removed page fails it until its baselines are deleted. After an intended visual change, run `vp run test:visual:update`, review the changed PNGs, and commit them. Baselines are rendered on macOS; another OS renders fonts differently and needs its own baselines. `command-palette.test.ts` drives the ⌘K palette: its groups, filtering, arrow keys, Enter and the Rule of Thumb submenu. `interactions.test.ts` drives the pages as a reader does: opening the command palette, the theme switch and its reload, a demo on two rule pages, the dive from a rule tile and the zoom back out, the blog's table of contents and code, and the home stack filter and experience list. It fails on any error a page logs. `vp run test:visual` builds first; `vp test run --project visual` tests the build already in `dist/`.

`behavior` serves the same build and runs `behavior.test.ts`. It hovers and activates every visible control in each page's `<main>` and compares a screenshot of the region around it with its baseline in `tests/visual/__behavior__/`. Each page's list of controls is pinned there too, so a control that appears or disappears fails it. After an intended change, run `vp run test:behavior:update` and review what it wrote.

`scripts/head-parity.ts` compares the head tags crawlers and share cards read (title, description, canonical, `og:*`, `twitter:*`, theme-color, icons and JSON-LD) on every page of `dist/` with another build, and exits 1 on a missing page or any difference.

## Production

```bash
vp run build
vp run preview
```

`astro build` writes a static site to `dist/`, one `x.html` per page (`blog.html`, `rule-of-thumb/table-design.html`) so a static host answers `/blog` without a redirect, plus `404.html`. The `finish-pages` integration in `astro.config.ts` then inlines StyleX's sheet and the core fonts and cursors into every page, writes the OG cards, `sitemap.xml` and `robots.txt` (`scripts/og/share-assets.ts`), and writes `_headers`, which gives each Markdown twin a canonical `Link` header on Cloudflare Pages. No runtime server is needed.

Pages render without JavaScript except where an Astro component ships a `<script>`. Each such script imports the component's `*.client.ts` module, which defines a custom element over the prerendered markup. The header defines its element on load. The command palette, cursor and scrollbar define theirs when the browser is idle (`whenIdle` in `src/hooks/idle.ts`), and the favicon cycle and smooth scroll start then too. The home page, the Rule of Thumb index and each rule page define their elements on load, since their reveals and demos need script to show. The blog index and code blocks ship none. A post loads its table of contents, its drawer and any custom element its MDX embeds. Navigations are full page loads, animated by cross-document view transitions that `src/layouts/head-script.ts` types in `pageswap` and `pagereveal`, and Astro prefetches a link on hover.

`docs/astro-migration.md` records the move from TanStack Start in two steps (React islands, then pure Astro), the custom-element pattern every interactive part follows, and the load comparison against the React build, with the `scripts/perf-compare.ts` command that reruns it.

## Fonts

```bash
uv run scripts/fonts.py
```

The build does not process fonts. The script cuts Geist, Geist Mono and Unbounded down to the weights, OpenType features and characters the site uses, writes two files per family to `public/fonts/` and their `@font-face` rules to `src/fonts.css`, and rebuilds the OG card fonts in `scripts/og/fonts/`; commit what it writes. The build inlines each `-core.woff2` (ASCII and common punctuation) into every page. A page fetches the family's `-extended.woff2` (Latin-1, Latin Extended-A and a few symbols) only when it draws one of those characters. Edit `FAMILIES` or `FEATURES` in the script and rerun it when a family is set at a weight outside its range or draws a character outside its two files, when a page turns on an OpenType feature or sets a `lang` other than English, or when a font is upgraded. Each run lists the characters in `src/` that no file has; a system font draws those.

## Source layout

- `src/pages/`: Astro's file-based pages. Each is a thin `.astro` file that picks the layout, the head tags and the page component.
- `src/layouts/`: `site.astro`, the document every page shares (head tags, theme-color, the inline head script, the header, command palette, cursor and scrollbar and, in development, the StyleX dev sheet and React Grab), and `head-script.ts`, which sets the theme, the intro classes and the view-transition types before first paint.
- `src/sections/`: the home page (`home.astro`) and the pieces the rule pages share with it.
- `src/rules/`: the Rule of Thumb index, each rule's page component, the `RuleLanding` frame and `rule-page.astro`. `docs/rule-pages.md` explains how a rule page is built.
- `src/blog/`: the post list, the post frame and its table of contents.
- `src/components/`: shared UI, including `icon.astro`, which draws Phosphor icons from their path data.
- `src/hooks/`: shared browser helpers for idle callbacks, media queries and the theme store.
- `src/content/blog/`: MDX articles, loaded as a content collection (`src/content.config.ts`).
- `src/data/guidelines.ts`: Rule of Thumb metadata.
- Styles: every component styles itself with StyleX, from a `stylex.create` module (`header.styles.ts` for `header.astro`). Styles shared across files live in their own modules at the lowest common ancestor: `src/components/arcade.ts` (the arcade roots, column, scanlines and screen-reader text), `button.ts` and `load-in.ts`, and `src/sections/section.ts` and `hero-type.ts`.
- `src/styles.css`, `src/arcade.css` and `src/fonts.css`: the only global CSS, for what StyleX cannot express: the preflight reset, `@font-face`, the Lenis sheet, rules on `<html>` and the classes scripts set on it, view transitions, `@property` registrations and the reduced-motion blanket. Each rule says why it is global.
- `src/theme.stylex.ts` and `src/theme.ts`: StyleX tokens and the light theme.
- `public/rule-of-thumb/<id>.md`: the Markdown twin of each rule page, served by its "View .md" link for readers to paste into an `AGENTS.md`. Change it with the page. `src/rules/markdown-twins.test.ts` checks that it opens with the rule's title and claim, has a section per lesson and carries every TL;DR row.

See `CODE_STRUCTURE.md` and `STYLING_GUIDELINES.md` for repository conventions. The interactive article demos are site content, not disposable starter examples.
