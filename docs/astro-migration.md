# Astro migration: what changed and how it performs

The site moved from TanStack Start + Nitro (a React app that hydrates the whole page and routes on the client) to Astro 7 (static pages, React only inside islands). It looks the same: all 49 baseline screenshots in `tests/visual/__screenshots__/` pass unchanged, and `tests/visual/interactions.test.ts` drives the command palette, the theme toggle, rule demos, the rule dive and zoom-out, the blog table of contents, and the home stack filter and experience list.

## What changed for a reader

- **Less JavaScript.** Each page downloads 17% to 58% less script (the measured "JS" columns below). The blog index and the post frame ship no React of their own. Only the header and the global helpers (the command palette, the cursor, the favicon cycle, smooth scroll, the scrollbar) hydrate.
- **Interactive sooner.** Each measured page becomes usable sooner on both network profiles. The biggest gain is the blog post: 3.43 s → 2.44 s on mobile 4G.
- **Navigation.** A link is now a full page load. Astro prefetches a link on hover, and the browser's cross-document view transitions replay the old fade, rule dive, and zoom-out (`src/layouts/head-script.ts`). Browsers without cross-document view transitions (Firefox today) navigate with no animation.
- **Build output.** The output went from 432 JS files (12.3 MB, mostly syntax-highlighter grammars and themes split into chunks) to 43 (1.1 MB). Code blocks are prerendered, so the highlighter no longer ships.

## Decisions

| Decision                                                           | Why                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static output with `build.format: "file"`                          | Cloudflare Pages serves `blog.html` at `/blog` with no redirect. This replaces the Nitro worker and its `_routes.json` rewrite.                                                                                                                                                                |
| No `<ClientRouter />`                                              | Real navigations plus native view transitions add no router script. Transition state crosses the navigation in `sessionStorage`.                                                                                                                                                               |
| Header `client:load`, global helpers `client:idle`                 | The header must work at first paint. The rest can wait for idle.                                                                                                                                                                                                                               |
| Home, the rule index and the rule pages each hydrate as one island | Nearly every section is interactive (hero, backdrop, stack filter, experience list, rule spread, demos), and the rule pages pass JSX between components, which an island boundary cannot serialize. Splitting them would save little script: the interactive sections carry most of the bytes. |
| `modulepreload` for each `client:load` island's import closure     | Without it the header's import chain cost five round trips. See the v1 → v2 numbers below.                                                                                                                                                                                                     |
| No idle prefetch of every rule page                                | Prefetching rule pages replaced the router's chunk preload. A rule page is about 85 KB of HTML because CSS and core fonts are inlined, so four of them doubled home's transfer and delayed interactivity. Hover prefetch remains.                                                              |
| StyleX unchanged, sheet inlined per page                           | The same CSS strategy as the React build: inline CSS, with core fonts and cursors as data URIs.                                                                                                                                                                                                |

## Results

Method: `scripts/perf-compare.ts` serves the React build (`.output/public` from `main` at 53ec8bb) and the Astro build from one local server with Brotli and no browser cache. It runs 5 cold runs per page and build, alternating which build goes first, and reports the median with the range in parentheses. "Interactive" is when the header's React root mounts, which is the same component on both builds. Every run finished with zero failed requests and zero console errors.

### Mobile 4G (390×844, 1.47 Mbit/s, 562 ms RTT, 4× CPU slowdown)

| Page                         | Build | FCP ms           | LCP ms           | Interactive ms   | Transferred KB | JS KB |
| ---------------------------- | ----- | ---------------- | ---------------- | ---------------- | -------------- | ----- |
| /                            | React | 4268 (4236–4732) | 4412 (4364–4848) | 3845 (3696–4507) | 423            | 287   |
| /                            | Astro | 3356 (3204–3436) | 3572 (3368–3620) | 3557 (3482–3585) | 340            | 202   |
| /blog                        | React | 1084 (1076–1136) | 1084             | 2973 (2930–2993) | 231            | 154   |
| /blog                        | Astro | 1096 (1084–1156) | 1096             | 2412 (2391–2513) | 193            | 114   |
| /blog/hello-world            | React | 1088 (1084–1204) | 1088             | 3426 (3317–4140) | 404            | 318   |
| /blog/hello-world            | Astro | 1104 (1092–4596) | 1104             | 2443 (2369–5772) | 223            | 135   |
| /rule-of-thumb               | React | 1596 (1556–4484) | 3976 (3848–6896) | 3172 (3058–6056) | 302            | 223   |
| /rule-of-thumb               | Astro | 1596 (1572–3140) | 3160 (3108–4968) | 2855 (2810–4659) | 218            | 137   |
| /rule-of-thumb/dialog-design | React | 1380 (1080–3484) | 1380             | 3409 (3346–5775) | 271            | 187   |
| /rule-of-thumb/dialog-design | Astro | 1228 (1104–3644) | 1248             | 2716 (2612–5276) | 241            | 156   |
| /rule-of-thumb/table-design  | React | 1304 (1092–4064) | 1304             | 3431 (3341–6538) | 271            | 187   |
| /rule-of-thumb/table-design  | Astro | 1296 (1088–3748) | 1384             | 3373 (3160–5528) | 242            | 156   |

The machine's load average was 21 to 26 during this run, which accounts for the outlier maxima. The alternating order exposed both builds to the same noise.

### Desktop slow 3G (1440×900, 400 kbit/s, 2000 ms RTT, no CPU slowdown)

| Page                         | React interactive ms | Astro interactive ms | React LCP ms | Astro LCP ms |
| ---------------------------- | -------------------- | -------------------- | ------------ | ------------ |
| /                            | 12750 (12679–12808)  | 12207 (12189–12212)  | 13416        | 11424        |
| /blog                        | 10101 (10096–10107)  | 8324 (8297–8335)     | 3604         | 3656         |
| /blog/hello-world            | 11435 (11416–11460)  | 8331 (8318–8333)     | 3600         | 3660         |
| /rule-of-thumb               | 10158 (10152–10203)  | 9897 (9892–9899)     | 10796        | 9180         |
| /rule-of-thumb/dialog-design | 10987 (10963–11001)  | 9173 (9150–9181)     | 3652         | 3700         |
| /rule-of-thumb/table-design  | 10980 (10978–11010)  | 10777 (10745–10817)  | 3644         | 3700         |

### Reading the numbers

- **What limits interactivity.** Round trips plus bytes. On slow 3G each round trip is 2 s and the link moves about 50 KB/s, so the header becomes interactive after the HTML, the module preloads, and the island script. Pages whose eager island is small (blog, blog post, dialog-design) gain the most. On table-design and home, a large page island still downloads before the header can mount, so the gain is smaller.
- **Why FCP is about 50 ms later on most Astro pages under slow 3G.** Astro's HTML is about 2 KB larger (the island markup and the preload list), which is about 40 ms at 50 KB/s. Home paints earlier because its intro waits for the page's island, and that island now arrives sooner.
- **Why the `load` event is not compared.** The React build injected its app script after `load` on purpose, so its `load` fired right after the HTML. Astro's island scripts load before `load`. The raw values are in `--out` JSON files when you rerun.
- **v1 → v2.** The first Astro build was slower than React (mobile interactive on home 4.69 s, on the blog post 4.50 s). It lacked the module preloads and still prefetched rule pages on idle. Those two fixes produced the numbers above.

## Rerun

```bash
git worktree add ../itsfaqih-react 53ec8bb && (cd ../itsfaqih-react && vp install && vp build)
vp build
vp node scripts/perf-compare.ts --site react=../itsfaqih-react/.output/public --site astro=dist \
  --profile mobile-4g --runs 5 --out /tmp/perf
```

`--profile desktop-3g` selects the second profile, and `--route /blog` (repeatable) limits the pages.

## Next lever

React DOM is about 63 KB of the roughly 120 KB every page pays. Rendering the islands with Preact (`@astrojs/preact` with `compat`) would cut most of that. Base UI, Vaul and the React Compiler runtime would need checking under `preact/compat` against the same visual and interaction gates. That is a separate experiment.
