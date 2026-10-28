"""Writes the arcade cursors to public/cursors/ as pixel-art SVGs.

Each map is drawn on a grid of CELL px squares: K is the ink outline, F the gold fill. The ink is
the dark page colour, so on the dark theme the gold shape stands alone and on the light theme it
gets a crisp edge. Run: python3 scripts/cursors.py
"""

from pathlib import Path

CELL = 2
INK = "#0e0e13"
GOLD = "#ffe14d"

ARROW = """
K.........
KK........
KFK.......
KFFK......
KFFFK.....
KFFFFK....
KFFFFFK...
KFFFFFFK..
KFFFFFFFK.
KFFFKKKKK.
KFFK......
KFK.......
KK........
"""

POINT = """
..KKKK......
..KFFK......
..KFFK......
..KFFKKKK...
..KFFKFFKKKK
KKKFFKFFKFFK
KFKFFFFFFFFK
KFFFFFFFFFFK
KFFFFFFFFFFK
KKFFFFFFFFFK
.KKFFFFFFFKK
..KFFFFFFFK.
..KKKKKKKKK.
"""

GRAB = """
.....KKKK...
..KKKKFFK...
..KFFKFFKKKK
..KFFKFFKFFK
..KFFKFFKFFK
KKKFFKFFKFFK
KFKFFFFFFFFK
KFFFFFFFFFFK
KFFFFFFFFFFK
KKFFFFFFFFFK
.KKFFFFFFFFK
..KKFFFFFFKK
...KKKKKKKK.
"""

GRABBING = """
..KKKKKKKKKK
..KFFKFFKFFK
KKKFFFFFFFFK
KFKFFFFFFFFK
KFFFFFFFFFFK
KFFFFFFFFFFK
KKFFFFFFFFFK
.KKFFFFFFFFK
..KKFFFFFFKK
...KKKKKKKK.
"""

TEXT = """
KKKKKKK
KFFFFFK
KKKFKKK
..KFK..
..KFK..
..KFK..
..KFK..
..KFK..
..KFK..
..KFK..
KKKFKKK
KFFFFFK
KKKKKKK
"""


def rects(rows: list[str], keep: str) -> str:
    return "".join(
        f"M{x} {y}h1v1h-1z"
        for y, row in enumerate(rows)
        for x, cell in enumerate(row)
        if cell in keep
    )


def svg(art: str) -> str:
    rows = art.strip("\n").split("\n")
    width = max(map(len, rows))
    height = len(rows)
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width * CELL:g}" height="{height * CELL:g}"'
        f' viewBox="0 0 {width} {height}" shape-rendering="crispEdges">'
        f'<path fill="{INK}" d="{rects(rows, "K")}"/>'
        f'<path fill="{GOLD}" d="{rects(rows, "F")}"/>'
        "</svg>\n"
    )


out = Path(__file__).resolve().parent.parent / "public" / "cursors"
out.mkdir(exist_ok=True)
for name, art in {"arrow": ARROW, "point": POINT, "grab": GRAB, "grabbing": GRABBING, "text": TEXT}.items():
    (out / f"{name}.svg").write_text(svg(art))
