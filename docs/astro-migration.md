# Astro migration: what changed and how it performs

The site moved from TanStack Start + Nitro (a React app that hydrates the whole page and routes on the client) to Astro 7 in two steps, and the migration is finished.

1. **React islands.** Astro prerendered every page, and React rendered the interactive parts as islands. All 48 baseline screenshots in `tests/visual/__screenshots__/` passed unchanged, and `tests/visual/interactions.test.ts` drove the command palette, the theme toggle, rule demos, the rule dive and zoom-out, the blog table of contents, and the home stack filter and experience list. The decisions and load numbers below are from this step.
2. **Pure Astro.** Each island was ported, one area at a time, to `.astro` markup plus a custom element. Then `@astrojs/react`, React, React DOM, Base UI, Vaul, Phosphor's React package, the React Compiler, testing-library and Storybook were removed. The screenshot baselines were not touched, and a `no-restricted-imports` rule in `vite.config.ts` keeps React and those UI kits out.

## How a page works now

Every page and component is an `.astro` file, prerendered to HTML. An interactive part is a custom element. Its `.astro` file renders the markup, marks the parts the script needs with `data-part`, and ships a `<script>` that imports `<name>.client.ts`. That module defines the element. The element is the component's root, or a `display: contents` host (`host.contents` in `src/rules/rule-landing.styles.ts`). It wires its listeners in `connectedCallback` through one `AbortController` and aborts it from `disconnectedCallback`. Styles live in `<name>.styles.ts`, which also exports view helpers for any class the element swaps at runtime. Icons go through `src/components/icon.astro`, which holds Phosphor's path data. `docs/rule-pages.md` shows the pattern on a rule page.

## What changed for a reader

- **Less JavaScript.** Step one cut each page's script by 17% to 58%. Step two cut it again, to 23 to 47 KB per page. The blog post went from 318 KB of script on the React build to 27 KB.
- **Header usable sooner.** On mobile 4G the header answered input 0.4 to 1.0 s sooner than on the React build on every measured page. The blog post gained the most, 3.31 s to 2.31 s. This measures the header only. The demos and the idle-defined palette are not timed.
- **Navigation.** A link is now a full page load. Astro prefetches a link on hover, and the browser's cross-document view transitions replay the old fade, rule dive, and zoom-out (`src/layouts/head-script.ts`). Browsers without cross-document view transitions (Firefox today) navigate with no animation.
- **Build output.** Step one took the output from 432 JS files (12.3 MB, mostly syntax-highlighter grammars and themes split into chunks) to 43 (1.1 MB). Code blocks are prerendered, so the highlighter no longer ships. Step two shrank `dist/_astro` from 660 KB to 444 KB.

## Decisions

| Decision                                                           | Why                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static output with `build.format: "file"`                          | Cloudflare Pages serves `blog.html` at `/blog` with no redirect. This replaces the Nitro worker and its `_routes.json` rewrite.                                                                                                                                             |
| No `<ClientRouter />`                                              | Real navigations plus native view transitions add no router script. Transition state crosses the navigation in `sessionStorage`.                                                                                                                                            |
| Header `client:load`, global helpers `client:idle`                 | The header must work at first paint. The rest can wait for idle. Step two keeps the split. The header's element is defined on load, the helpers' through `whenIdle` (`src/hooks/idle.ts`).                                                                                  |
| Home, the rule index and the rule pages each hydrate as one island | Nearly every section is interactive (hero, backdrop, stack filter, experience list, rule spread, demos), and the rule pages pass JSX between components, which an island boundary cannot serialize. Step two replaced each with one custom element per interactive section. |
| `modulepreload` for each `client:load` island's import closure     | Without it the header's import chain cost five round trips. See the v1 → v2 numbers below. Step two preloads each module script's import closure the same way.                                                                                                              |
| No idle prefetch of every rule page                                | Prefetching rule pages replaced the router's chunk preload. A rule page is about 85 KB of HTML because CSS and core fonts are inlined, so four of them doubled home's transfer and delayed interactivity. Hover prefetch remains.                                           |
| StyleX unchanged, sheet inlined per page                           | The same CSS strategy as the React build: inline CSS, with core fonts and cursors as data URIs.                                                                                                                                                                             |

## Results

One run measured all three builds side by side on 2026-11-02. "React" is the TanStack Start build (`.output/public` from `main` at 53ec8bb). "Step one" is the React-islands build (51e75b8). "Step two" is the current build.

Method: `scripts/perf-compare.ts` serves every build from one local server with Brotli and no browser cache. It runs 5 cold runs per page and build, alternating the order of the builds, and reports the median with the range in parentheses. "Interactive" is when the header answers input, which is when its React root mounts or its `<site-header>` element is defined. It does not time the page's demos or the palette, which is defined when the browser is idle. All 240 runs finished with zero failed requests and zero console errors. The load average was 4 to 10 on 10 cores, and the alternating order spread that noise across the builds.

### Mobile 4G (390×844, 1.47 Mbit/s, 562 ms RTT, 4× CPU slowdown)

| Page                         | Build    | FCP ms | LCP ms | Interactive ms   | Transferred KB | JS KB |
| ---------------------------- | -------- | ------ | ------ | ---------------- | -------------- | ----- |
| /                            | React    | 3924   | 4052   | 3598 (3594–4948) | 423            | 287   |
| /                            | Step one | 3172   | 3344   | 3436 (3370–3459) | 340            | 202   |
| /                            | Step two | 3340   | 3340   | 3177 (3171–3333) | 187            | 43    |
| /blog                        | React    | 1048   | 1048   | 2891 (2849–2972) | 231            | 154   |
| /blog                        | Step one | 1072   | 1072   | 2356 (2354–2371) | 193            | 114   |
| /blog                        | Step two | 1080   | 1080   | 2307 (2301–2322) | 104            | 24    |
| /blog/hello-world            | React    | 1064   | 1064   | 3307 (3271–3331) | 404            | 318   |
| /blog/hello-world            | Step one | 1064   | 1064   | 2363 (2349–2366) | 223            | 135   |
| /blog/hello-world            | Step two | 1076   | 1076   | 2310 (2297–2318) | 117            | 27    |
| /rule-of-thumb               | React    | 1540   | 3792   | 3012 (2994–3080) | 302            | 223   |
| /rule-of-thumb               | Step one | 1540   | 3072   | 2786 (2778–2790) | 218            | 137   |
| /rule-of-thumb               | Step two | 1172   | 3596   | 2360 (2354–2369) | 122            | 39    |
| /rule-of-thumb/dialog-design | React    | 1240   | 1240   | 3256 (3203–3317) | 271            | 187   |
| /rule-of-thumb/dialog-design | Step one | 1168   | 1184   | 2610 (2580–2624) | 241            | 156   |
| /rule-of-thumb/dialog-design | Step two | 1196   | 1244   | 2398 (2390–2429) | 131            | 42    |
| /rule-of-thumb/table-design  | React    | 1212   | 1212   | 3357 (3265–3401) | 271            | 187   |
| /rule-of-thumb/table-design  | Step one | 1116   | 1164   | 2774 (2764–2846) | 242            | 156   |
| /rule-of-thumb/table-design  | Step two | 1196   | 1196   | 2949 (2947–2970) | 136            | 47    |

### Desktop slow 3G (1440×900, 400 kbit/s, 2000 ms RTT, no CPU slowdown)

| Page                         | React interactive ms | Step one interactive ms | Step two interactive ms | React LCP ms | Step one LCP ms | Step two LCP ms |
| ---------------------------- | -------------------- | ----------------------- | ----------------------- | ------------ | --------------- | --------------- |
| /                            | 12691 (12665–12752)  | 12112 (12098–12149)     | 11256 (11253–11266)     | 13336        | 11304           | 12956           |
| /blog                        | 10019 (10003–10056)  | 8236 (8214–8265)        | 8073 (8072–8117)        | 3572         | 3648            | 3652            |
| /blog/hello-world            | 11383 (11355–11400)  | 8233 (8206–8275)        | 8101 (8072–8139)        | 3572         | 3636            | 3668            |
| /rule-of-thumb               | 10145 (10103–10149)  | 9773 (9755–9822)        | 8316 (8289–8347)        | 10760        | 9056            | 10748           |
| /rule-of-thumb/dialog-design | 10914 (10906–10941)  | 9063 (9038–9104)        | 8474 (8430–8477)        | 3628         | 3676            | 3712            |
| /rule-of-thumb/table-design  | 10936 (10906–10951)  | 9759 (9754–9852)        | 10366 (10355–10417)     | 3636         | 3680            | 3704            |

### What the module preloads buy

Step two first shipped with the preload list empty, because the code that builds it looked for `<astro-island>` elements and none were left. The same pages built without the list measure the fix.

| Page                         | Mobile interactive ms, without → with | Mobile LCP ms, without → with | Desktop interactive ms, without → with |
| ---------------------------- | ------------------------------------- | ----------------------------- | -------------------------------------- |
| /                            | 3145 → 3177                           | 4164 → 3340                   | 11113 → 11256                          |
| /blog                        | 2238 → 2307                           | 1084 → 1080                   | 7832 → 8073                            |
| /blog/hello-world            | 2567 → 2310                           | 1080 → 1076                   | 9041 → 8101                            |
| /rule-of-thumb               | 2726 → 2360                           | 3576 → 3596                   | 9649 → 8316                            |
| /rule-of-thumb/dialog-design | 2807 → 2398                           | 1176 → 1244                   | 9933 → 8474                            |
| /rule-of-thumb/table-design  | 3362 → 2949                           | 1168 → 1196                   | 11801 → 10366                          |

The preloads save 0.26 to 0.41 s on mobile and 0.9 to 1.5 s on slow 3G for the pages with deep import chains. Home's LCP improves by 0.8 s on mobile. On the blog index and home, the list makes no measurable difference on mobile and delays interactivity by 0.14 to 0.24 s on slow 3G, because the preloads share the link with the header's own script.

### Reading the numbers

- **What limits interactivity.** Round trips. Step two removed 90 to 160 KB of script per page compared with step one, which is 0.5 to 0.9 s of transfer at 1.47 Mbit/s. Interactivity moved by at most 0.43 s on mobile, because the header's script was never the bulk of those bytes. It waits for the HTML and then one more round trip for its modules. On slow 3G, four 2 s round trips put the floor near 8 s, and the blog, the blog post and dialog-design sit on it.
- **Table design is slower than step one.** Step one preloaded only the modules of `client:load` islands. Step two preloads every module script, so the table demos' 47 KB downloads alongside the header's script and delays it by 0.18 s on mobile and 0.6 s on slow 3G. Without the preloads the page is slower still.
- **The rule index paints its largest text later than step one, and home does on slow 3G.** Rule index LCP is 3596 against 3072 ms on mobile and 10748 against 9056 ms on slow 3G. Home LCP is 12956 against 11304 ms on slow 3G and equal on mobile. Step two still matches or beats the React build on both pages (rule index 10.75 s against 10.76 s on slow 3G). In step two the rule index's title paints about 2.4 s after the header is defined on slow 3G. This run does not isolate why step one painted it sooner.
- **Other regressions against step one.** Home's FCP on mobile is 3340 ms (3320–3508) against 3172 ms (3156–3200). Total blocking time on mobile rose on dialog-design (7 to 43 ms) and table-design (15 to 41 ms), still far under the 200 ms that counts as poor.
- **Why the `load` event is not compared.** The React build injected its app script after `load` on purpose, so its `load` fired right after the HTML. Astro's module scripts load before `load`. The raw values are in the `--out` JSON files when you rerun.
- **v1 → v2 of step one.** The first Astro build was slower than React (mobile interactive on home 4.69 s, on the blog post 4.50 s). It lacked the module preloads and still prefetched rule pages on idle. Those two fixes produced step one's numbers above.

## Known differences from the React build

These were found while porting and kept on purpose. None of them changes a screenshot baseline.

- The command palette opens with `show()` instead of as a modal, makes the rest of the page `inert`, and keeps Tab inside with focus guards, so the header can sit above its backdrop. It carries `aria-modal="true"` as Base UI's popup did. On first open it highlights Home.
- The post's table-of-contents drawer moves focus into itself when it opens, because the page behind it is inert. Vaul left focus on the trigger.
- The drawer no longer lists "Table of Contents". The React build read headings from the live page and picked up the drawer's own title.
- Typed inputs set `.value` only. React also mirrored the value into the `value` attribute.
- Ids are fixed strings derived from props instead of `useId` output.
- Some hint arrows sit at a different place in the DOM, with the same rendering.
- The home stack filter's view transition names every element it moves.
- The phone reader’s clocks on the timestamps page do not swing in. They did not on the React build either.

## Rerun

```bash
git worktree add --detach ../itsfaqih-react 53ec8bb && (cd ../itsfaqih-react && vp install && vp build)
git worktree add --detach ../itsfaqih-step1 51e75b8 && (cd ../itsfaqih-step1 && vp install && vp run build)
vp run build
vp node scripts/perf-compare.ts --site react=../itsfaqih-react/.output/public \
  --site step1=../itsfaqih-step1/dist --site astro=dist --profile mobile-4g --runs 5 --out /tmp/perf
```

`--profile desktop-3g` selects the second profile, and `--route /blog` (repeatable) limits the pages.

## Next lever

Preload the header's import closure ahead of the page's own modules, or give the page's preloads a low `fetchpriority`. That would recover table design's 0.18 s and the 0.14 to 0.24 s on the blog index and home under slow 3G without losing what the preloads save on deep chains.
