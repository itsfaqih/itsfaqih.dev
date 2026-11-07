# /// script
# dependencies = ["fonttools", "brotli"]
# ///
"""Cut the web fonts down to what the site draws and write src/fonts.css. Run by hand and commit
the output: uv run scripts/fonts.py

Rerun after editing FAMILIES or FEATURES: when a family is set at a weight outside its range or draws
a character outside its files, a page turns on an OpenType feature or sets a lang other than
English, or a font is upgraded. A character in neither file falls back to a system font; the run
lists the ones in src/ so a new one shows up.
"""

import re
import urllib.request
from io import BytesIO
from pathlib import Path

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
GOOGLE_FONTS = "https://raw.githubusercontent.com/google/fonts"
# Inlined into every page: ASCII and the punctuation and signs the pages use.
CORE = [*range(0x20, 0x7F), *map(ord, "\u00a0‘’“”–—…©·×−")]
# Fetched only by a page that uses one: Latin-1 and Latin Extended-A.
EXTENDED = range(0xA0, 0x180)
# Per family: its source, the weights it is set at (a request outside clamps to the nearest end), and
# the characters outside Latin it draws on some pages.
FAMILIES = {
    # The command palette's • between a guideline's label and description.
    "Geist": (
        "87a44ad3d4535f7b3a5a715a08e8944f144afd06/ofl/geist/Geist%5Bwght%5D.ttf",
        (400, 700),
        "•",
    ),
    "Geist Mono": (
        "9e25e2ba265e5298f70f6182dd4e8a3ebf1b9123/ofl/geistmono/GeistMono%5Bwght%5D.ttf",
        (400, 600),
        "",
    ),
    # The command palette's ↑ and ↓ keys.
    "Unbounded": (
        "8b80d4f3f73cfe02b69a6f0dc71da5a1cc574bd3/ofl/unbounded/Unbounded%5Bwght%5D.ttf",
        (500, 900),
        "↑↓",
    ),
}
# Satori draws a variable font only at its default instance.
OG_WEIGHTS = {"Geist": (400, 500), "Geist Mono": (500,), "Unbounded": (700, 900)}
# What Chrome applies to horizontal Latin text by default, and the numerals the pages set. Every
# page is lang="en", so locl's forms for other languages are left out.
FEATURES = ["ccmp", "rvrn", "rlig", "rclt", "calt", "clig", "liga", "kern", "mark", "mkmk", "curs"]
FEATURES += ["tnum", "pnum"]
# Google only sends a woff2 to a browser it recognises.
AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"


def fetch(url: str) -> bytes:
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": AGENT})).read()


def ranges(points: list[int]) -> str:
    spans: list[list[int]] = []
    for point in sorted(set(points)):
        if spans and point == spans[-1][1] + 1:
            spans[-1][1] = point
        else:
            spans.append([point, point])
    return ", ".join(f"U+{a:04X}" if a == b else f"U+{a:04X}-{b:04X}" for a, b in spans)


def face(family: str, weights: tuple[int, int], file: str, unicode_range: str) -> str:
    return (
        f'@font-face {{\n  font-family: "{family}";\n  font-style: normal;\n'
        f"  font-weight: {weights[0]} {weights[1]};\n  font-display: swap;\n"
        f'  src: url(/fonts/{file}) format("woff2");\n  unicode-range: {unicode_range};\n}}\n'
    )


def limit_weight(font: TTFont, weights: tuple[int, int]) -> TTFont:
    if weights[0] == weights[1]:
        return instantiateVariableFont(font, {"wght": weights[0]})
    # Only a whole side of the axis can go without moving an outline. The instancer drops it from
    # the variation stores exactly, but rewrites every glyph's deltas, rounding the ones the font
    # left to interpolation, so the glyphs keep their own deltas minus that side's.
    axis = next(axis for axis in font["fvar"].axes if axis.axisTag == "wght")
    low = axis.defaultValue if weights[0] >= axis.defaultValue else axis.minValue
    high = axis.defaultValue if weights[1] <= axis.defaultValue else axis.maxValue
    limited = instantiateVariableFont(font, {"wght": (low, high)}, optimize=False)
    limited["gvar"].variations = {
        glyph: [
            delta
            for delta in variations
            if (low < axis.defaultValue or delta.axes["wght"][1] >= 0)
            and (high > axis.defaultValue or delta.axes["wght"][1] <= 0)
        ]
        for glyph, variations in font["gvar"].variations.items()
    }
    # Named instances only label the axis, and each brings its name records.
    limited["fvar"].instances = []
    return limited


def subset(data: bytes, unicodes: list[int], whole: TTFont | None) -> TTFont:
    font = TTFont(BytesIO(data), recalcTimestamp=False)
    options = Options()
    options.layout_features = FEATURES
    options.hinting = False
    options.drop_tables += ["meta", "STAT"]
    # Below 20px Chrome on macOS places a glyph by the font's bounding box and the glyph named X, so
    # the names stay, and a file that stands in for the whole font keeps both, the X without its
    # character.
    options.glyph_names = True
    subsetter = Subsetter(options)
    subsetter.populate(unicodes=unicodes, glyphs=["X"] if whole else [])
    subsetter.subset(font)
    if whole:
        for table in font["cmap"].tables:
            table.cmap.pop(ord("X"), None)
        for key in ("xMin", "yMin", "xMax", "yMax"):
            setattr(font["head"], key, getattr(whole["head"], key))
        font.recalcBBoxes = False
    font.flavor = "woff2"
    return font


css = ["/* Generated by scripts/fonts.py. Global: @font-face belongs to the whole document. */\n"]
(ROOT / "scripts/og/fonts").mkdir(parents=True, exist_ok=True)
(ROOT / "public/fonts").mkdir(exist_ok=True)
for stale in (ROOT / "public/fonts").glob("*.woff2"):
    stale.unlink()
drawn: set[int] = set()
for family, (path, weights, extended) in FAMILIES.items():
    slug = family.lower().replace(" ", "-")
    source = fetch(f"{GOOGLE_FONTS}/{path}")
    license = fetch(f"{GOOGLE_FONTS}/{path.rsplit('/', 1)[0]}/OFL.txt").decode()
    # The OFL bars a modified font from using a Reserved Font Name, so a subset would need renaming.
    if re.search(r"with Reserved Font Name", license, re.I):
        raise SystemExit(f"{family} has a Reserved Font Name: rename it inside the subsets")

    query = f"family={family.replace(' ', '+')}:wght@{weights[0]}..{weights[1]}&display=swap"
    sheet = fetch(f"https://fonts.googleapis.com/css2?{query}").decode()
    latin = re.search(r"/\* latin \*/[^}]*url\((\S+?)\)", sheet)
    font = TTFont(BytesIO(fetch(latin[1])), recalcTimestamp=False)
    for weight in OG_WEIGHTS[family]:
        static = instantiateVariableFont(font, {"wght": weight})
        static.flavor = None
        static.save(ROOT / f"scripts/og/fonts/{slug}-{weight}.ttf")

    original = TTFont(BytesIO(source), recalcTimestamp=False)
    limited = BytesIO()
    limit_weight(original, weights).save(limited)
    # The extended file draws what the whole font used to, and the core what the inlined subset did.
    for part, unicodes, whole in (
        ("extended", [point for point in [*EXTENDED, *map(ord, extended)] if point not in CORE], original),
        ("core", CORE, None),
    ):
        font = subset(limited.getvalue(), unicodes, whole)
        font.save(ROOT / f"public/fonts/{slug}-{part}.woff2")
        points = list(font.getBestCmap())
        drawn.update(points)
        css.append(face(family, weights, f"{slug}-{part}.woff2", ranges(points)))

(ROOT / "src/fonts.css").write_text("".join(css))

used = {
    char
    for file in (ROOT / "src").rglob("*")
    if file.suffix in {".ts", ".tsx", ".astro", ".md", ".mdx", ".css"}
    for char in file.read_text()
    if ord(char) > 0x7E
}
if fallback := "".join(sorted(char for char in used if ord(char) not in drawn)):
    print(f"src/ has characters no subset draws; a system font draws them: {fallback}")
