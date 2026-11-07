# Faqih Muntashir’s website

Personal website built with Astro and vanilla-extract. It includes a homepage, MDX blog, and interactive Rule of Thumb articles. Astro prerenders every page to static HTML, and the interactive parts are custom elements that `*.client.ts` modules define in the browser.

## Development

```bash
vp install
vp run dev
```

`vp run dev` starts `astro dev` on the LAN and prints a line like `LAN: http://192.168.1.20:5173/`. Open that URL on a phone on the same Wi-Fi; `127.0.0.1` and `localhost` reach only this Mac. It takes the first free port from 5173 up, so a server another checkout or project runs keeps its port. Astro runs one dev server per checkout: run `vp run dev` again and it prints the running server's URL instead of starting a second. Stop it with `vp run dev:stop` once you are done, and stop the servers of checkouts you no longer use the same way (`vp exec astro dev status` in a checkout shows whether it runs one). `vp dev` on its own starts Vite+'s plain Vite server, not Astro, so use `vp run dev`.

The project uses [Vite+](https://viteplus.dev) with pnpm behind it. `package.json` pins pnpm in `packageManager` and `.node-version` pins Node; `vp` downloads both on first use. Cloudflare Pages reads `.node-version` but not `packageManager`, so its project settings set `PNPM_VERSION=12.16.1`. Add and remove dependencies with `vp add` and `vp remove`, and run other scripts with `vp run ...`. `pnpm-workspace.yaml` holds the Vite+ catalog and the packages allowed to run install scripts.

## Checks

```bash
vp run lint
vp run typecheck
vp run test
vp run test:visual
vp run test:behavior
vp run test:sounds
vp run build
vp run verify
vp node scripts/head-parity.ts <other-build>
```

`vp run verify` runs every check above in turn (lint, `vp fmt --check .`, typecheck, unit, build, visual, behavior and sounds) and is the gate before a merge. `vp install` also installs a [lefthook](https://lefthook.dev) pre-commit hook, set in `lefthook.yml`, that checks the format and lint of the staged files and runs the typecheck when code changed. Lefthook takes over the repository's Git hooks, so it also runs Git LFS's own hooks for the baselines below.

Oxlint runs the default rules plus all generic [anti-slop](https://github.com/dmmulroy/anti-slop) rules at error severity. Lint and format configuration lives in the `lint` and `fmt` blocks of `vite.config.ts`, which holds nothing else; Vite+ bundles Oxlint and Oxfmt. Astro builds from `astro.config.ts`, and `vitest.config.ts` holds the test projects. The vendored plugin, license, upstream revision, and local compatibility note live in `tools/oxlint/anti-slop/`, which the formatter skips so it stays byte-for-byte with upstream. `vp run typecheck` runs [tsrs](https://github.com/oxc-project/tsrs), a Rust port of the TypeScript 7 checker.

Agent assets, the vendored plugin, the build output, and Astro's generated `.astro/` types are excluded from application linting. The vendored TypeScript source is included in typechecking. Effect rules are not enabled because the website has no direct Effect dependency. `no-restricted-imports` rejects React, React DOM, `@astrojs/react`, Base UI, Vaul and Phosphor's React package, which left with the migration.

Vitest has three projects. `unit` runs `src/**/*.test.ts` in jsdom, with the vanilla-extract plugin compiling components as the site build does. `tests/unit/setup.ts` stands in for the `matchMedia` jsdom lacks, answering every query false. The test command allows an empty suite, but regression tests should be added for behavior changed during maintenance.

`visual` serves the build in `dist/` (another directory through `SITE_DIR`) and runs its test files. `pages.test.ts` screenshots every page with Playwright Chromium at desktop (1440px) and mobile (390px) widths in light and dark themes. Before each capture it scrolls the page through so every scroll reveal plays, and it fails if a rendered `[data-cut]` or `[data-rev]` block is still unrevealed; a new reveal marker joins `unrevealedSelector` in `page-setup.ts`. Each screenshot spans the viewport width and the page's scroll height, and is compared with its baseline in `tests/visual/__screenshots__/`, failing when more than 20 pixels differ. Any error the page logs or throws also fails it. On a failure, the actual and diff images land in `tests/visual/__diff__/`. Pages are discovered from the build, so a new page fails the suite until its baselines exist, and a removed page fails it until its baselines are deleted. After an intended visual change, run `vp run test:visual:update`, review the changed PNGs, and commit them. The update writes only shots that are missing or differ from their baseline, and deletes baselines whose shot no longer exists, so its diff holds just the change. Baselines are rendered on macOS; another OS renders fonts differently and needs its own baselines. `command-palette.test.ts` drives the ⌘K palette: its groups, filtering, arrow keys, Enter and the Rule of Thumb submenu. `interactions.test.ts` drives the pages as a reader does: opening the command palette, the theme switch and its reload, a demo on two rule pages, the dive from a rule tile and the zoom back out (to the index and to the home deck), flat disabled keys, controls that stay under a pointer at their edge as they move, the home stack filter and experience list, a page's full width from the first frame, and every rule title fitting its column before any script runs. It fails on any error a page logs. `css-order.test.ts` and `css-prefixes.test.ts` check the built CSS. `arrows.test.ts` walks every hint, toggle and Squint arrow on the rule pages and holds each to the arrow rules in `tests/arrow-rules.ts`; `src/arrows.test.ts` holds the hero's arrows to them. An arrow that breaks a rule today is listed in the test's `PARKED` list, by page, width, rule and the control it points at, with its reason, and runs as an expected failure; an arrow that points at nothing, or a target with no arrow or two, is never parked. `vp run test:visual` builds first; `vp test run --project visual` tests the build already in `dist/`.

`behavior` serves the same build and runs `behavior.test.ts`. It hovers and activates every visible control in each page's `<main>` and compares a screenshot of the region around it with its baseline in `tests/visual/__behavior__/`. Each page's list of controls is pinned there too, so a control that appears or disappears fails it. After an intended change, run `vp run test:behavior:update` and review what it wrote; like the visual update, it rewrites only changed or missing shots and removes stale ones. The baseline screenshots are stored in Git LFS, so install it (`brew install git-lfs`, then `git lfs install`) before you clone, or run `git lfs pull` afterwards.

`scripts/head-parity.ts` compares the head tags crawlers and share cards read (title, description, canonical, `og:*`, `twitter:*`, theme-color, icons and JSON-LD) on every page of `dist/` with another build, and exits 1 on a missing page or any difference.

## Production

```bash
vp run build
vp run preview
```

`astro build` writes a static site to `dist/`, one `x.html` per page (`blog.html`, `rule-of-thumb/table-design.html`) so a static host answers `/blog` without a redirect, plus `404.html`. The `finish-pages` integration in `astro.config.ts` then inlines the core fonts into every page, writes the OG cards, `sitemap.xml` and `robots.txt` (`scripts/og/share-assets.ts`), and writes `_headers`, which gives each Markdown twin a canonical `Link` header on Cloudflare Pages. It also prints `/cv` to its two PDFs with Playwright Chromium (`scripts/cv/export-pdf.ts`), which installs that browser itself when a build machine such as Cloudflare Pages lacks it, and the PDFs exist only in a build, not under `astro dev`. No runtime server is needed.

Pages render without JavaScript except where an Astro component ships a `<script>`. Each such script imports the component's `*.client.ts` module, which defines a custom element over the prerendered markup. The header defines its element on load. The command palette, cursor and scrollbar define theirs when the browser is idle (`whenIdle` in `src/hooks/idle.ts`), and the favicon cycle and smooth scroll start then too. The home page, the Rule of Thumb index and each rule page define their elements on load, since their reveals and demos need script to show. The blog index and code blocks ship none. A post loads its table of contents, its drawer and any custom element its MDX embeds. Navigations are full page loads, animated by cross-document view transitions that `src/layouts/head-script.ts` types in `pageswap` and `pagereveal`, and Astro prefetches a link on hover.

`docs/astro-migration.md` records the move from TanStack Start in two steps (React islands, then pure Astro), the custom-element pattern every interactive part follows, and the load comparison against the React build, with the `scripts/perf-compare.ts` command that reruns it.

## Fonts

```bash
uv run scripts/fonts.py
```

The build does not process fonts. The script cuts Geist, Geist Mono and Unbounded down to the weights, OpenType features and characters the site uses, writes two files per family to `public/fonts/` and their `@font-face` rules to `src/fonts.css`, and rebuilds the OG card fonts in `scripts/og/fonts/`; commit what it writes. The build inlines each `-core.woff2` (ASCII and common punctuation) into every page. A page fetches the family's `-extended.woff2` (Latin-1, Latin Extended-A and a few symbols) only when it draws one of those characters. Edit `FAMILIES` or `FEATURES` in the script and rerun it when a family is set at a weight outside its range or draws a character outside its two files, when a page turns on an OpenType feature or sets a `lang` other than English, or when a font is upgraded. Each run lists the characters in `src/` that no file has; a system font draws those.

## Sounds

```bash
vp node scripts/sounds.ts
vp run build && vp node scripts/verify-sounds.ts --shots <dir>
```

Every press of a link or button plays a short clip from [soundcn](https://soundcn.xyz), a registry of CC0 sound effects, and the header's speaker button mutes them (saved as `localStorage.sound`). `scripts/sounds.ts` maps each cue to its registry item, refuses any item not licensed CC0, and writes `public/sounds/<cue>.mp3`; commit what it writes. `src/hooks/sound.ts` holds the cues and their volumes. A control that plays its own cue carries `data-sound="none"`, or `data-sound="<cue>"` to swap the tap for another. `scripts/verify-sounds.ts` drives the built site in Chromium, logs which clip each interaction plays, fails on any console warning, and with `--shots` saves the header in both themes at 1440px and 390px.

## Source layout

- `src/pages/`: Astro's file-based pages. Each is a thin `.astro` file that picks the layout, the head tags and the page component.
- `src/layouts/`: `site.astro`, the document every page shares (head tags, theme-color, the inline head script, the header, command palette, cursor and scrollbar, with the `@layer` order statement as its first style), and `head-script.ts`, which sets the theme, the sound toggle's glyph, the intro classes and the view-transition types before first paint.
- `src/sections/`: the home page (`home.astro`) and the pieces the rule pages share with it.
- `src/rules/`: the Rule of Thumb index, each rule's page component, the `RuleLanding` frame and `rule-page.astro`. `docs/rule-pages.md` explains how a rule page is built.
- `src/blog/`: the post list, the post frame and its table of contents.
- `src/components/`: shared UI, including `icon.astro`, which draws Phosphor icons from their path data.
- `src/hooks/`: shared browser helpers for idle callbacks, media queries and the theme store.
- `src/content/blog/`: MDX articles, loaded as a content collection (`src/content.config.ts`).
- `src/data/guidelines.ts`: Rule of Thumb metadata.
- Styles: every component styles itself with vanilla-extract, from a `.css.ts` module (`header.css.ts` for `header.astro`). Styles shared across files live in their own modules at the lowest common ancestor: `src/components/arcade.css.ts` (the arcade roots, column, scanlines and screen-reader text), `button.css.ts` and `load-in.css.ts`, and `src/sections/section.css.ts` and `hero-type.css.ts`. `src/layers.css.ts` names the override layers, `src/when.ts` builds parent and sibling state selectors, and `src/cx.ts` joins classes.
- `src/styles.css`, `src/arcade.css` and `src/fonts.css`: the only global CSS, for what a component class cannot express: the preflight reset, `@font-face`, the Lenis sheet, rules on `<html>` and the classes scripts set on it, view transitions, `@property` registrations and the reduced-motion blanket. Each rule says why it is global.
- `src/theme.tokens.ts`, `src/theme.vars.css.ts` and `src/theme.ts`: the token values, their CSS variables with the light theme, and the theme names and colours scripts read.
- `public/rule-of-thumb/<id>.md`: the Markdown twin of each rule page, an agent skill that its "Copy SKILL.md" button copies and its "View .md" link opens. Change it with the page. `src/rules/markdown-twins.test.ts` checks its `name` and `description` frontmatter, and that it opens with the rule's title and claim, has a section per lesson and carries every TL;DR row.

See `CODE_STRUCTURE.md` and `STYLING_GUIDELINES.md` for repository conventions. The interactive article demos are site content, not disposable starter examples.
