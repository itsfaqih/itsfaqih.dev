# Agent notes

Pointers only; each file below holds the detail. `CLAUDE.md` is a symlink to this file.

## Read first

- **`CODE_STRUCTURE.md`** maps the code. Its **Arrows** section lists every arrow kind (hint,
  toggle, Squint, hero) and its caller. "Arrows" means all four unless the user names one, and
  arrow controls are per section.
- **`STYLING_GUIDELINES.md`** before touching a `.css.ts` file (cascade layers, `under1`).
- **`docs/rule-pages.md`** before building or changing a rule page. Check every quiz against its
  **Quiz rules** before showing it.
- **`DIRECTION.md`** (58KB) is the design history, one pass per `#` heading; later passes override
  earlier ones. Read only the pass for the surface you touch:
  - Rule of Thumb articles: "Rule of Thumb articles: polished game writing" (the latest; it
    withdraws the scroll-slide deck), then "Rule of Thumb: direction" for the index, thumbnails and
    critiques.
  - Home hero: "Home hero: the bench", then the hero part of "Three-line hero, index load-in, and
    articles as scroll slides".
  - Home cards: "Cards: game-panel pass".
  - Load-in and the fixed header: "Home load-in and fixed header", and the index load-in in
    "Three-line hero…".

## Checks

Run each through `python3 ~/.agents/tools/gate-slot.py -- <command>`.

| Command                | What                                                        |
| ---------------------- | ----------------------------------------------------------- |
| `vp run lint`          | oxlint                                                      |
| `vp fmt --check .`     | oxfmt (`vp run format` writes)                              |
| `vp run typecheck`     | tsrs                                                        |
| `vp run test`          | unit tests, including the hero and Squint arrow rules       |
| `vp run test:visual`   | build, then screenshots, css-order and the hint arrow rules |
| `vp run test:behavior` | build, then every control's before/after shots              |
| `vp run test:sounds`   | build, then every sound plays when it should                |
| **`vp run verify`**    | **all of the above: the merge gate; run it before merging** |

The `*:update` scripts rewrite only baselines that changed or are missing, and delete ones whose
shot is gone. `vp install` installs the lefthook pre-commit hook (format, lint and typecheck on
staged files; it also runs Git LFS's hooks).

## Dev server

Start it with `vp run dev`, not `vp dev` (plain Vite, not Astro). It listens on the LAN and prints
the LAN URL: give the user that URL, since they often test on a phone. One server runs per
checkout: rerunning reuses it, and `vp run dev:stop` stops it. Stop the server you started when
its work is done.
