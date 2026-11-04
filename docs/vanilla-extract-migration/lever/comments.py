def comment_before(path, needle, lines):
    text = open(path).read()
    at = text.index(needle)
    start = text.rfind("\n", 0, at) + 1
    indent = text[start:len(text)].split(text[start:].lstrip()[0], 1)[0]
    block = "".join(f"{indent}{line}\n" for line in lines)
    open(path, "w").write(text[:start] + block + text[start:])


comment_before("src/sections/section.css.ts", "export const veil = {", [
    "/**",
    " * Copy that sits straight on the dither, with no card under it, rests on a veil: a blurred,",
    " * rounded patch of page colour drawn behind the words, so the dither never runs through them.",
    " * `dense` is for small text, whose thin strokes the dither breaks up more easily; `fit` hugs the",
    " * veil to the words on a block element. The patch is an ::after at z-index -1. The veil itself",
    " * stays out of stacking: it joins the content column's context (`arcade.wrap` isolates), where",
    " * every patch paints before any text. A veil that isolated would paint its patch over the text",
    " * of a neighbour or of the veiled heading around it.",
    " */",
])
comment_before("src/sections/rule-select.css.ts", '--halftone"]}, none', [
    "// The halftone over the hue, as two layers so the colour sits under the dots. Positions are",
    "// written per axis: the minifier folds 0% 0% into 0 0, which computes to 0px 0px.",
])
comment_before("src/components/command-palette.css.ts", "var(--c) 62%, #000", [
    "// A hue as text on that ground: full strength on black, inked down on white.",
])
comment_before("src/sections/tech-icon.css.ts", '"--brand":', [
    "// The tool's own colour for the current theme, from techBrand's inline properties.",
])
