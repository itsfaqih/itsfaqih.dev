# Share videos

The looping videos that the home page, the Rule of Thumb index and each rule page share as `og:video`, beside their PNG card. Each film is an HTML page whose every frame is a pure function of time; `render.mjs` seeks it frame by frame in Playwright, screenshots at 2x, and encodes 1200×630, 30 fps, silent H.264 with `+faststart`.

| Film                      | Page                  | Published as                       |
| ------------------------- | --------------------- | ---------------------------------- |
| `films/headline.html`     | `/`                   | `public/og/home.mp4`               |
| `films/rule-index.html`   | `/rule-of-thumb`      | `public/og/rule-of-thumb.mp4`      |
| `films/rule.html?id=<id>` | `/rule-of-thumb/<id>` | `public/og/rule-of-thumb/<id>.mp4` |

The backdrop in `films/dots.js` is the site's dot screen from `src/sections/backdrop-dots.ts`, drawn as a function of film time, with the light in the bottom-right corner in the page's hue.

## Render and publish

From the repository root:

```sh
cd scripts/og/video
vp node --experimental-strip-types rules-data.mjs   # films/rules-data.js from src/data/guidelines.ts
vp node render.mjs headline
vp node render.mjs rule-index --poster-at 1.9
vp node render.mjs rule --q id=button-design --name rule-button-design --poster-at 2.3   # once per rule
vp node publish.mjs                                 # copies out/*.mp4 into public/og
```

`--stills 12` or `--at 0.3,2.3` renders a contact sheet instead of the video, to check frames before a full render. Output goes to `out/`, which git ignores.

## Adding a rule

1. Run `rules-data.mjs`, render the rule's film, and run `publish.mjs`.
2. Add the rule's path to `OG_VIDEO_PAGES` in `src/seo.ts`.

The build fails when a page names an `og:video` whose file is missing from `public/og`, so step 2 can't land before step 1.
