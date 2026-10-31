"""Writes src/routes/-components/tech-logos.ts: the stack's tools in their full-colour logos.

Each logo comes from an Iconify set (the logos set, devicon where it lacks one), or from scripts/logos
for the VoidZero tools, and is themed here,
so the page needs no per-logo CSS. Every colour becomes light-dark(light, dark), which follows the
color-scheme the theme sets on html:
- On the light panel a logo keeps its own colours, black taking the text colour.
- On the dark panel a logo drawn in black swaps its greys end for end (black turns to the text
  colour, white to the panel, as in a reversed logo), and a colour too dark to read lifts toward
  white until it has 3:1, as tech-icon's brandFor does for the one-colour marks.
Masks and clip paths only shape the logo, so their colours stay as they are.

Each tool also gets its ring: its colours, each at the angle (clockwise from the top) where it sits
in the logo, for the hover outline's conic gradient.

Run: uv run --with svgelements scripts/tech-logos.py
"""

import json
import math
import re
import subprocess
import tempfile
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

from svgelements import Matrix, Path as SvgPath

SETS = {"logos": "1.2.18", "devicon": "1.2.74"}

# Tool name: Iconify icon ("ecr" is drawn here, "file:<name>" reads scripts/logos/<name>.svg). Tools missing here keep their one-colour mark
# from tech-icon, as do XState and tRPC, whose logos here carry their wordmarks.
LOGOS = {
    "TypeScript": "logos:typescript-icon",
    "PHP": "logos:php",
    "HTML": "logos:html-5",
    "CSS": "logos:css",
    "React": "logos:react",
    "Vue": "logos:vue",
    "Next.js": "logos:nextjs-icon",
    "Astro": "logos:astro-icon",
    "React Router": "logos:react-router",
    "Effect": "logos:effect-icon",
    "Redux": "logos:redux",
    "Zod": "logos:zod",
    "Tailwind CSS": "logos:tailwindcss-icon",
    "InertiaJS": "devicon:inertiajs",
    "Figma": "logos:figma",
    "Framer": "logos:framer",
    "Node.js": "logos:nodejs-icon",
    "Laravel": "logos:laravel",
    "AdonisJS": "logos:adonisjs-icon",
    "Prisma": "logos:prisma",
    "Drizzle": "logos:drizzle-icon",
    "PostgreSQL": "logos:postgresql",
    "MySQL": "logos:mysql-icon",
    "MariaDB": "logos:mariadb-icon",
    "MongoDB": "logos:mongodb-icon",
    "Redis": "logos:redis",
    "RabbitMQ": "logos:rabbitmq-icon",
    "Snowflake": "logos:snowflake-icon",
    "Vitest": "file:vitest",
    "Jest": "logos:jest",
    "Playwright": "logos:playwright",
    "Cypress": "logos:cypress-icon",
    "Storybook": "logos:storybook-icon",
    "Biome": "logos:biomejs-icon",
    "ESLint": "logos:eslint",
    "Prettier": "logos:prettier",
    "Oxlint": "file:oxc",
    "Oxfmt": "file:oxc",
    "Docker": "logos:docker-icon",
    "Kubernetes": "logos:kubernetes",
    "Git": "logos:git-icon",
    "Vite": "file:vite",
    "Bun": "logos:bun",
    "NGINX": "logos:nginx",
    "Apache": "logos:apache",
    "IIS": "logos:microsoft-icon",
    "Amazon Route 53": "logos:aws-route53",
    "Amazon CodeBuild": "logos:aws-codebuild",
    "Amazon CodePipeline": "logos:aws-codepipeline",
    "Amazon ECR": "ecr",
    "Amazon WAF": "logos:aws-waf",
    "Amazon S3": "logos:aws-s3",
    "Amazon SES": "logos:aws-ses",
    "Amazon SNS": "logos:aws-sns",
    "Amazon EKS": "logos:aws-eks",
    "Amazon EC2": "logos:aws-ec2",
    "Amazon Secrets Manager": "logos:aws-secrets-manager",
    "Amazon Glue": "logos:aws-glue",
    "Amazon CloudFormation": "logos:aws-cloudformation",
    "Mailjet": "logos:mailjet-icon",
    "Claude Code": "logos:claude-code",
    "OpenCode": "logos:opencode-icon",
    "OpenRouter": "logos:openrouter-icon",
}

# Tools whose simple-icons mark is another drawing than the logo (an older Redis, MySQL's wordmark,
# Drizzle's slashes): their one-colour mark is drawn from the logo instead, so hover only adds colour.
FLAT = {"Redis", "MySQL", "HTML", "Drizzle", "Vitest", "Jest", "Vite", "OpenRouter", "Oxlint", "Oxfmt", "Cypress"}
# Of those, the logos whose colours would grey out badly (blurred glows that mottle a bright mark,
# Cypress's pale fading arcs): every colour masks solid and the mark keeps one flat silhouette.
SOLID = {"Vitest", "Vite", "Oxlint", "Oxfmt", "Cypress"}

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/routes/-components/tech-logos.ts"


def ecr() -> tuple[str, str]:
    """Amazon ECR, which the logos set lacks: tech-marks' glyph on the Containers tile, as AWS draws it."""
    marks = (ROOT / "src/routes/-components/tech-marks.ts").read_text()
    glyph = re.search(r'"Amazon ECR": \{.*?path: "([^"]+)"', marks, re.S)
    assert glyph, "tech-marks.ts has no Amazon ECR path"
    return "0 0 64 64", (
        '<defs><linearGradient id="a" x1="0%" x2="100%" y1="100%" y2="0%">'
        '<stop offset="0%" stop-color="#c8511b"/><stop offset="100%" stop-color="#f90"/>'
        '</linearGradient></defs><path fill="url(#a)" d="M0 0h64v64H0z"/>'
        f'<path fill="#fff" fill-rule="evenodd" d="{glyph.group(1)}"/>'
    )


def local(name: str) -> tuple[str, str]:
    """A logo kept in scripts/logos: the VoidZero marks in their parentheses, from each project's site
    (vite.dev, vitest.dev, oxc.rs), with the parentheses in the brand's black and Oxc's wordmark cut away."""
    svg = (ROOT / "scripts/logos" / f"{name}.svg").read_text()
    view_box = re.search(r'<svg[^>]*viewBox="([^"]+)"', svg)
    assert view_box, f"scripts/logos/{name}.svg has no viewBox"
    body = re.sub(r"^\s*<svg[^>]*>|</svg>\s*$", "", svg)
    return view_box.group(1), f'<g fill="none">{body}</g>'


PANEL_DARK = (0x17, 0x17, 0x1F)
TEXT = "var(--text)"
PANEL = "var(--panel)"
SHAPES = {"path", "circle", "ellipse", "rect", "polygon", "polyline", "line", "use"}
PAINTS = ("fill", "stroke", "stop-color", "flood-color", "lighting-color")
NAMED = {"white": "ffffff", "black": "000000", "red": "ff0000", "none": None}


def load(name: str) -> dict:
    url = f"https://cdn.jsdelivr.net/npm/@iconify-json/{name}@{SETS[name]}/icons.json"
    with urllib.request.urlopen(url) as response:
        return json.load(response)


def icon(sets: dict, ref: str) -> tuple[str, str]:
    prefix, name = ref.split(":")
    data = sets[prefix]
    extra: dict = {}
    if name not in data["icons"]:
        alias = data["aliases"][name]
        extra = {k: v for k, v in alias.items() if k != "parent"}
        name = alias["parent"]
    found = {**data["icons"][name], **extra}
    left, top = found.get("left", 0), found.get("top", 0)
    width = found.get("width", data.get("width", 16))
    height = found.get("height", data.get("height", 16))
    return f"{left} {top} {width} {height}", found["body"]


def hex_of(value: str | None) -> str | None:
    if value is None:
        return None
    value = value.strip().lower()
    if value in NAMED:
        return NAMED[value]
    match = re.fullmatch(r"#([0-9a-f]{3}|[0-9a-f]{6})", value)
    if not match:
        return None
    digits = match.group(1)
    return "".join(c * 2 for c in digits) if len(digits) == 3 else digits


def rgb(hex6: str) -> tuple[int, int, int]:
    return tuple(int(hex6[i : i + 2], 16) for i in (0, 2, 4))  # type: ignore[return-value]


def luminance(c: tuple[int, int, int]) -> float:
    def channel(v: int) -> float:
        v = v / 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4

    r, g, b = (channel(v) for v in c)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    x, y = luminance(a), luminance(b)
    return (max(x, y) + 0.05) / (min(x, y) + 0.05)


def grey(c: tuple[int, int, int]) -> bool:
    return max(c) - min(c) < 16


def inky(c: tuple[int, int, int]) -> bool:
    return grey(c) and max(c) < 64


def dark_tone(hex6: str, reversed_: bool) -> str:
    c = rgb(hex6)
    if reversed_ and grey(c):
        if inky(c):
            return TEXT
        if min(c) > 235:
            return PANEL
        # A mid grey lands as far from the text colour as it sat from black.
        t = sum(c) / 3 / 255
        mixed = tuple(round(244 - (244 - 23) * t) for _ in range(3))
        return "#" + "".join(f"{v:02x}" for v in mixed)
    if inky(c):
        return TEXT
    mixed = c
    t = 0.0
    while contrast(mixed, PANEL_DARK) < 3 and t <= 1:
        t += 0.05
        mixed = tuple(round(v + (255 - v) * t) for v in c)
    return "#" + "".join(f"{v:02x}" for v in mixed)


def light_tone(hex6: str, edge: float = 1) -> str:
    c = rgb(hex6)
    if inky(c):
        return TEXT
    mixed = c
    t = 0.0
    while contrast(mixed, (255, 255, 255)) < edge and t <= 1:
        t += 0.05
        mixed = tuple(round(v * (1 - t)) for v in c)
    return "#" + "".join(f"{v:02x}" for v in mixed)


def tone(hex6: str, reversed_: bool, edge: float = 1) -> str:
    light, dark = light_tone(hex6, edge), dark_tone(hex6, reversed_)
    return light if light == dark else f"light-dark({light}, {dark})"


def ink(hex6: str) -> str:
    """The grey a colour masks with: as dark as the colour is light, so white cuts the logo away."""
    r, g, b = (v / 255 for v in rgb(hex6))
    light = 0.2126 * r + 0.7152 * g + 0.0722 * b
    v = 0 if light > 0.94 else round(255 * (1 - light) ** 0.5)
    return f"#{v:02x}{v:02x}{v:02x}"


def styles_of(element: ET.Element) -> dict[str, str]:
    style = element.get("style", "")
    return dict(
        (k.strip(), v.strip())
        for k, v in (part.split(":", 1) for part in style.split(";") if ":" in part)
    )


def paint(element: ET.Element, prop: str) -> str | None:
    return styles_of(element).get(prop, element.get(prop))


def box(
    element: ET.Element, matrix: Matrix, ids: dict[str, ET.Element]
) -> tuple[float, float, float, float] | None:
    tag = element.tag
    if tag == "use":
        target = ids.get((element.get("href") or "").removeprefix("#"))
        return box(target, matrix, ids) if target is not None else None
    num = lambda key, default=0.0: float(element.get(key, default) or default)  # noqa: E731
    if tag == "path":
        d = element.get("d")
        if not d:
            return None
        shape = SvgPath(d)
    elif tag in ("circle", "ellipse"):
        rx = num("r") if tag == "circle" else num("rx")
        ry = num("r") if tag == "circle" else num("ry")
        cx, cy = num("cx"), num("cy")
        shape = SvgPath(f"M{cx - rx} {cy - ry}H{cx + rx}V{cy + ry}H{cx - rx}Z")
    elif tag == "rect":
        x, y = num("x"), num("y")
        w, h = num("width"), num("height")
        shape = SvgPath(f"M{x} {y}h{w}v{h}h{-w}Z")
    elif tag in ("polygon", "polyline"):
        points = re.findall(r"-?[\d.]+(?:e-?\d+)?", element.get("points", ""))
        if len(points) < 4:
            return None
        shape = SvgPath("M" + " ".join(points))
    else:
        return None
    shape = shape * matrix
    bbox = shape.bbox()
    return bbox if bbox else None


def parse(body: str) -> ET.Element:
    root = ET.fromstring(f'<svg xmlns="http://www.w3.org/2000/svg">{body}</svg>')
    ns = "{http://www.w3.org/2000/svg}"
    for element in root.iter():
        element.tag = element.tag.removeprefix(ns)
    return root


def serialize(root: ET.Element) -> str:
    markup = "".join(ET.tostring(child, encoding="unicode") for child in root)
    return re.sub(r' xmlns(:\w+)?="[^"]*"', "", markup)


def scope(markup: str, uid: str) -> str:
    # Ids get a per-badge suffix at render time, so two badges never share a gradient.
    markup = re.sub(r'id="([^"]+)"', lambda m: f'id="{uid}{m.group(1)}$"', markup)
    markup = re.sub(r"url\(#([^)]+)\)", lambda m: f"url(#{uid}{m.group(1)}$)", markup)
    return re.sub(r'href="#([^"]+)"', lambda m: f'href="#{uid}{m.group(1)}$"', markup)


def flat(view_box: str, body: str, uid: str, solid: bool = False) -> str:
    """The logo in one colour: its greys from ink() mask a currentColor box, so a white detail drawn
    over a colour still cuts through it, as a one-colour mark draws it."""
    root = parse(body)

    def visit(element: ET.Element, fill: str | None, plain: bool) -> None:
        if element.tag in ("mask", "clipPath", "defs", "filter", "pattern", "symbol"):
            plain = False
        own = paint(element, "fill")
        fill = own if own is not None else fill
        if plain and element.tag in SHAPES and fill is None:
            element.set("fill", "#000")
        if plain or element.tag in ("linearGradient", "radialGradient", "stop"):
            for prop in PAINTS:
                if h := hex_of(paint(element, prop)):
                    if element.get(prop) is not None:
                        del element.attrib[prop]
                    style = styles_of(element)
                    style[prop] = "#fff" if solid else ink(h)
                    element.set("style", ";".join(f"{k}:{v}" for k, v in style.items()))
        for child in element:
            visit(child, fill, plain)

    for child in root:
        visit(child, None, True)
    x, y, width, height = view_box.split()
    area = f'x="{x}" y="{y}" width="{width}" height="{height}"'
    mask = f'<mask id="-flat" maskUnits="userSpaceOnUse" {area}>{serialize(root)}</mask>'
    shape = f'<rect {area} fill="currentColor" mask="url(#-flat)"/>'
    return scope(mask + shape, uid)


def theme(view_box: str, body: str, uid: str) -> tuple[str, list[tuple[str, int]]]:
    root = parse(body)

    ids = {element.get("id"): element for element in root.iter() if element.get("id")}
    # Gradients by id, so a shape painted with one counts toward its stops' colours.
    gradients: dict[str, list[str]] = {}
    for element in root.iter():
        if element.tag in ("linearGradient", "radialGradient") and element.get("id"):
            stops = [hex_of(paint(stop, "stop-color") or "#000") for stop in element.iter("stop")]
            gradients[element.get("id")] = [s for s in stops if s]

    colours = {
        h
        for element in root.iter()
        for prop in PAINTS
        if (h := hex_of(paint(element, prop)))
    }
    # Shapes with no fill anywhere up their tree paint black.
    reversed_ = any(inky(rgb(h)) for h in colours)

    x0, y0, width, height = (float(v) for v in view_box.split())
    centre = (x0 + width / 2, y0 + height / 2)
    weights: dict[str, list[float]] = {}

    def visit(element: ET.Element, fill: str | None, matrix: Matrix, plain: bool) -> None:
        if element.tag in ("mask", "clipPath", "defs", "filter", "pattern", "symbol"):
            plain = False
        if transform := element.get("transform"):
            matrix = Matrix(transform) * matrix
        own = paint(element, "fill")
        fill = own if own is not None else fill
        if plain and element.tag in SHAPES and own is None and fill is None:
            element.set("fill", "#000")
            fill = "#000"
        if plain and element.tag in SHAPES:
            target = fill or "#000"
            hues = (
                gradients.get(target[5:-1], [])
                if target.startswith("url(#")
                else [h] if (h := hex_of(target)) else []
            )
            opacity = float(paint(element, "fill-opacity") or paint(element, "opacity") or 1)
            if (bbox := box(element, matrix, ids)) and hues:
                x1, y1, x2, y2 = bbox
                area = (x2 - x1) * (y2 - y1) * opacity / len(hues)
                for h in hues:
                    weights.setdefault(h, []).extend((area, (x1 + x2) / 2, (y1 + y2) / 2))
        if plain or element.tag in ("linearGradient", "radialGradient", "stop", "defs"):
            for prop in PAINTS:
                value = paint(element, prop)
                if (h := hex_of(value)) and not element.tag == "mask":
                    if element.get(prop) is not None:
                        del element.attrib[prop]
                    style = styles_of(element)
                    style[prop] = tone(h, reversed_)
                    element.set("style", ";".join(f"{k}:{v}" for k, v in style.items()))
        for child in element:
            visit(child, fill, matrix, plain)

    for child in root:
        visit(child, None, Matrix(), True)

    # Each colour's place: the area-weighted centre of its shapes, as an angle around the logo. A
    # colour centred in the logo (a tile, a backdrop) has no side: the largest takes the side the
    # others leave, or with none placed the centred colours share the ring evenly. A thin outline needs
    # 2:1 against the light panel, where the logo itself can lean on its other colours.
    placed: list[tuple[str, int]] = []
    centred: list[tuple[float, str, bool]] = []
    total = sum(sum(w[0::3]) for w in weights.values()) or 1
    reach = max(width, height) * 0.12
    for h, w in weights.items():
        area = sum(w[0::3])
        c = rgb(h)
        if area / total < 0.04 or (grey(c) and min(c) > 220):
            continue
        x = sum(a * cx for a, cx in zip(w[0::3], w[1::3])) / area - centre[0]
        y = centre[1] - sum(a * cy for a, cy in zip(w[0::3], w[2::3])) / area
        if math.hypot(x, y) < reach:
            centred.append((area, tone(h, reversed_, 2), not grey(c)))
        else:
            placed.append((tone(h, reversed_, 2), round(math.degrees(math.atan2(x, y)) % 360)))
    hued = sorted([entry for entry in centred if entry[2]] or centred, reverse=True)
    if not placed:
        placed = [(colour, round(360 * i / len(hued))) for i, (_, colour, _) in enumerate(hued)]
    elif hued:
        # Beside colours that have a side, the centred one fills the side they leave.
        x = sum(math.sin(math.radians(angle)) for _, angle in placed)
        y = sum(math.cos(math.radians(angle)) for _, angle in placed)
        placed.append((hued[0][1], round(math.degrees(math.atan2(-x, -y)) % 360)))
    seen: dict[str, int] = {}
    for colour, angle in placed:
        seen.setdefault(colour, angle)
    ring = sorted(seen.items(), key=lambda item: item[1])

    return scope(serialize(root), uid), ring


def minify(logos: list[tuple[str, str]]) -> list[str]:
    """Rounds each body's coordinates with svgo: a tenth of a unit is far below a pixel at badge size."""
    with tempfile.TemporaryDirectory() as folder:
        for index, (view_box, body) in enumerate(logos):
            svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view_box}">{body}</svg>'
            Path(folder, f"{index}.svg").write_text(svg)
        subprocess.run(
            ["vp", "dlx", "svgo@3.3.2", "-q", "-f", folder, "-o", folder, "-p", "1"], check=True
        )
        return [
            re.sub(r"^<svg[^>]*>|</svg>$", "", Path(folder, f"{index}.svg").read_text().strip())
            for index in range(len(logos))
        ]


def main() -> None:
    sets = {name: load(name) for name in SETS}
    logos = [
        ecr() if ref == "ecr" else local(ref[5:]) if ref.startswith("file:") else icon(sets, ref)
        for ref in LOGOS.values()
    ]
    bodies = minify(logos)
    entries = []
    for index, tool in enumerate(LOGOS):
        view_box, body = logos[index][0], bodies[index]
        markup, ring = theme(view_box, body, f"t{index}")
        mark = f"    flat: {json.dumps(flat(view_box, body, f'f{index}', tool in SOLID))},\n" if tool in FLAT else ""
        entries.append(
            f"  {json.dumps(tool)}: {{\n"
            f"    viewBox: {json.dumps(view_box)},\n"
            f"    ring: {json.dumps([list(r) for r in ring])},\n"
            f"    body: {json.dumps(markup)},\n"
            f"{mark}"
            "  },"
        )
    OUT.write_text(
        "// Generated by scripts/tech-logos.py from Iconify's logos and devicon sets. Do not edit.\n"
        "// Each id ends in $, which TechIcon swaps for a per-badge suffix.\n"
        "export type TechLogo = { viewBox: string; ring: [string, number][]; body: string; flat?: string };\n\n"
        "export const TECH_LOGOS = new Map<string, TechLogo>(Object.entries({\n"
        + "\n".join(entries)
        + "\n}));\n"
    )
    print(f"wrote {len(entries)} logos to {OUT}")


if __name__ == "__main__":
    main()
