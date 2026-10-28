# Brief: rebuild one rule page on the rule-landing kit

You rebuild exactly one rule page, named in your prompt as `<slug>`. Proximity Principle is the reference. Your page must read as its sibling: the same structure and visual language, with this rule's own content and visuals.

Repo: `/Users/itsfaqih/itsfaqih.dev`, a TanStack Start + React 19 app.

## Read first

- `src/routes/rule-of-thumb/-components/rule-landing.tsx` and `rule-landing.css`. This is the kit. `RuleLanding` renders the whole page from data:
  - the hero with the tilted cover;
  - the island title dock and Share;
  - lessons that set the wrong way beside the right one, with tabs only below 820px;
  - the TL;DR;
  - the drag-and-drop quiz;
  - the Markdown take-away and the pagination.
- `src/routes/rule-of-thumb/-proximity-principle-page.tsx` and `proximity-principle.css`. This is the reference caller. Match its voice, density and data shapes.
- `public/rule-of-thumb/<slug>.md`. This is the rule's canonical content. Every rule in it must be taught by a lesson, the TL;DR or a quiz level.
- The current page: `src/routes/rule-of-thumb/<slug>.tsx` and everything it imports. Mine it for content and for demos worth keeping.
- `redesign/rule-landing/DIRECTION.md`, for the visual system and motion rules, especially v3 to v8.
- `redesign/rule-landing/RUN.md`, for the run's decisions.

## Build

### Files you own
- `src/routes/rule-of-thumb/-<slug>-page.tsx` (new).
- `src/routes/rule-of-thumb/<slug>.css` (new or replaced). Scope every rule under `.rule-page.<slug>`.
- The route file `src/routes/rule-of-thumb/<slug>.tsx`. Shrink it to `createFileRoute` plus the component import, as `proximity-principle.tsx` does. Keep any `head()` or meta options it has.
- The old page's own components.
  - Delete each one your page no longer imports, and only after `grep -rn` shows nothing else in `src/` imports it.
  - Use `git rm` for tracked files.
  - Delete the old page CSS if it is unused.

### Do not edit
- The kit, the Proximity files and `-components/index.tsx`.
- `rule-art.tsx` and `src/data/guidelines.ts`.
- `src/arcade.css`, `src/rot.css`, `src/components/header.tsx` and `src/routes/index.tsx`.
- Another page's files.

Other workers are rebuilding other pages in this same checkout right now, and another thread edits the shared files. If you need a kit change, work around it in your page and report the change you wanted. Do not unhide hidden rules.

### Data
- `claim` is one short sentence: the rule itself.
- `lead` says what the page holds. Follow Proximity's pattern.
- `coverTag` is two words with an arrow, naming the move from wrong to right (Proximity's is "FAR → NEAR").
- `learn` is a title plus an intro that explains the left/right convention.
- `lessons` holds 4 to 6 lessons. Each sets the wrong way (`bad`) beside the right way (`good`).
  - Each side has a short `label`, a `view`, and 1 to 3 concrete `costs` chips such as "2 clicks", "flashes 120ms" or "0 imports".
  - Mark a lesson `exception: true` only when the md names an exception.
  - Views must show, not tell.
    - UX topics (buttons, tables, dialogs, loading) render real, working UI in the panes: actual buttons in their states, a real table, a live dialog, a skeleton next to a spinner.
    - Code topics render code or the kit's `Tree`.
  - Use the site's tokens and classes (look at `.btn`, `.panel`, `.well` and the `--c`/`--no`/`--yes` hues in the kit CSS and `src/arcade.css`).
  - Reuse an old demo only if it still teaches best, restyled to this system.
- `tldr` holds 4 to 7 rows of situation and answer.
- `quiz` holds 3 to 5 levels, plus a `board` noun ("tree", "timeline", "form", "type").
  - Each level has a short `piece`, context `rows` and 2 or 3 slots.
  - Every wrong slot's `note` says what it would cost, in one sentence, and its `cost` chips quantify that.
  - Answers must be fair but not obvious.
  - Rows take any node, so a board can be a timeline, a component anatomy or a type, as well as a file tree.
  - A slot row can carry a `lead`, such as a key before its value. The lead stays visible once the piece is seated. See `-null-vs-undefined-page.tsx`.
- Kit behaviour you can rely on:
  - Lesson copy styles reach `.lesson-copy` only, not your panes.
  - Tab labels don't wrap.
  - On mobile both panes share one grid cell, so a lesson keeps the taller side's height when the tabs switch.
- Pages already built on the kit are worth reading for patterns: `-button-design-page.tsx`, `-data-loading-page.tsx` and `-null-vs-undefined-page.tsx`.
- `take` is optional. Pass your own when the default "agents will follow it too" line reads wrong.

### Copy
Keep the copy plain, concrete and second person, like Proximity.
- Use short sentences.
- No em dashes.
- No "elevate", "seamless" or "unleash".
- No all-caps letter-spaced labels over headings, and no arrow on every link.

### Signature
Give the page one motion moment that only this rule has, usually inside a lesson view (for example, a button walking through its states, or a request timeline filling in).
- Follow the /animate rules:
  - Animate transform and opacity only.
  - Use custom ease-out curves, and the kit's `OUT`/`SNAP` timing where it fits.
  - Never start from `scale(0)`.
  - Keep UI moves under 300ms; a loop that explains the rule may run longer.
- Under reduced motion, keep only opacity and colour changes, or hold a still frame.

Write a short `redesign/rule-landing/pages/<slug>.md` before you build. Give it these sections:
- **Brief.** Who arrives, the one action, and three feel words that pull against each other.
- **Plan.** The lesson-by-lesson plan, with each side's view.
- **Quiz.** The quiz plan.
- **Signature.** What it is and what it does under reduced motion.
- **Critique.** Filled in after verification.

You may query the design-taste MCP (`mcp__design-taste__run`) for a specific visual. Load it with ToolSearch first. This is optional; the system is already set by the reference.

## Commands

- Use `vp`, never npm, npx or node directly.
  - `vp run typecheck`
  - `vp run lint`
  - `vp exec oxfmt <your files only>`
- Do not run `vp install`.
- oxlint rejects type assertions without a `SAFETY:` comment, so use `instanceof` checks.
- Other workers' files may show errors mid-flight. Your files must be clean. Ignore the warnings in `redesign/trailer.js`.
- Comments: only a non-obvious why. No narration.
- Do not commit and do not stage, except `git rm` of your deleted files.

## Verify on the real page (Prove It Works)

1. Start your own dev server on the port your prompt gives: `cd /Users/itsfaqih/itsfaqih.dev && (vp run dev --port <port> --host 127.0.0.1 --strictPort > /tmp/<slug>-dev.log 2>&1 &)`. Poll until it answers.
2. Drive the browser with agent-browser.
   - Use session `<slug>`. Run `agent-browser skills get core` once.
   - Wrap every call as `timeout 40 agent-browser --session <slug> ...`. Put this in a wrapper script, because `timeout` cannot exec a string with spaces.
   - Headless transitions advance only while painting, so wait about 2s after scrolls and clicks.
   - Click via `eval` `.click()` if the "outside viewport" error appears.
   - Example scripts from the kit extraction are in `/private/tmp/claude-501/-Users-itsfaqih-itsfaqih-dev/ffa04f5d-0266-47c6-9033-c4de0d333a7a/scratchpad/` (`capture.sh`, `interact.sh`, `pixdiff.py`). Copy them; don't edit them.
3. Capture to `redesign/rule-landing/shots/<slug>/` at 1440x900 and 390x844, in light and dark.
   - Shoot the top, scrollY ≈ 1400 (docked), each lesson, the TL;DR and the quiz.
   - Toggle dark with `document.querySelector('.tools .theme').click()`, and restore light at the end.
   - Before you Read a screenshot, write a copy at most 1000px wide with `sips -Z 1000 in.png --out x.png`.
   - Look at every shot. Hold it next to `redesign/rule-landing/shots/kit/after-*.png` (Proximity): same structure, same polish.
4. Check these on the page:
   - Docked: the h1's left edge equals `.act-label .title`'s left edge, within ±1px.
   - At 390, `document.documentElement.scrollWidth === innerWidth`.
   - No console errors.
   - Level 1 clears by tapping (`.click()` on the piece, then on the right slot).
   - A wrong slot shows its note.
   - Each lesson's views render and work: click the live UI.
   - At 390, the tabs switch.
5. Write **Critique, round 1** in your pages md: the squint test, type, colour, space, motion and mobile, plus a count of generated tells. Fix every gap, then run round 2. Stop when round 2 finds only nits.
6. Stop your dev server (`pkill -f "port <port>"`) and close the browser session.

## Report back

- The files you created, changed and deleted.
- Each lesson in one line, and the quiz levels.
- The signature.
- Check results with numbers: dock lefts, scrollWidth, console, quiz.
- Kit changes you wanted, and anything left undone.

Wait on every command and run you start; end your turn with its final result.
