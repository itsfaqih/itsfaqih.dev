# Brief: visual review of the rule pages on phones and tablets

You are reviewing screenshots only. Do not edit any file in `src/`. Do not start a server or a browser.

## What you review

Full-page screenshots are in `/Users/itsfaqih/itsfaqih.dev/redesign/rule-landing/shots/responsive/`, named `<width>x<height>-<page>.png`. Your prompt names the viewports you own. Each viewport has 8 pages.

The pages are rule-of-thumb landing pages. Each one has, from the top:
- a hero (crumb row with Share, a two-line title whose second line sits on a coloured highlight, a claim, a lead, and a tilted cover card);
- lessons, each with copy and a wrong-vs-right pair of panes (side by side above 820px wide, one pane plus Avoid/Do tabs at 820px and below);
- a TL;DR table;
- a drag-and-drop quiz board with a piece tray;
- a Markdown take-away and previous/next pagination.

The desktop design at 1440 is the intent. For comparison, look at `/Users/itsfaqih/itsfaqih.dev/redesign/rule-landing/shots/all/1440-<page>-top.png`.

## How to look

The screenshots are 8,000 to 11,000px tall. Never Read one whole. Slice each into windows one viewport tall and resize each window to at most 1000px on its long side, for example:

```
sips -c <viewport-height> <width> --cropOffset <y> 0 in.png --out /tmp/<name>.png
sips -Z 1000 /tmp/<name>.png --out /tmp/<name>.png
```

Write the slices to your scratchpad directory, not the repo. Look at every window of every page you own.

## What counts as a finding

Report anything a visitor on that device would notice:
- text that is clipped, overlaps other text, or runs outside its box;
- a pane, table, code block, or control that is cramped, squashed, or forced into an awkward wrap (a single orphan word on a line in a button or chip counts);
- UI inside a lesson pane that no longer reads (a table whose columns collide, a dialog that spills out, a chart whose labels overlap);
- uneven or broken spacing between sections compared with the other pages at the same width;
- a layout that wastes the width badly (for example, a tablet showing a narrow column with large empty gutters where the desktop shows two columns);
- anything that looks broken or unfinished.

Already known, do not report:
- At 360, button-design's tab bar runs past the right edge.
- At 360, the "Handling Timestamps" title is 6px too wide.
- At 360, typescript-code-writing's quiz gaps run past the right edge.
- The "← All rules" link is a small tap target.
- The Share label is hidden on phones on purpose.
- The bottom-right palm-tree button and the bottom-centre pill are site chrome.
- The full-page capture may show the black island navbar only at the top. That is expected.

## Report

Group the findings by page. For each one give:
- the viewport and the page;
- the y offset in the screenshot;
- what is wrong, in one sentence, naming the element by its visible text;
- the severity: broken, ugly, or nit;
- the path of a slice that shows it.

End with a list of the page and viewport pairs you checked and found clean. Keep the report under 600 words. Report only what you saw in a slice. If you're unsure whether something is intended, say so and give the slice.

Wait on every command and run you start; end your turn with its final result.
