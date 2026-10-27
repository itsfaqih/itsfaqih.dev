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
....KK.......
...KFFK......
...KFFK......
...KFFK......
...KFFKKK....
...KFFKFFKKK.
...KFFKFFKFFK
KK.KFFKFFKFFK
KFKKFFFFFFFFK
KFFKFFFFFFFFK
.KFFFFFFFFFFK
..KFFFFFFFFFK
..KFFFFFFFFK.
...KFFFFFFK..
...KKKKKKKK..
"""

GRAB = """
...KK.KK.KK.
..KFFKFFKFFK
..KFFKFFKFFK
..KFFKFFKFFK
..KFFKFFKFFK
..KFFKFFKFFK
KKKFFKFFKFFK
KFFKFFFFFFFK
KFFFKFFFFFFK
.KFFFFFFFFFK
.KFFFFFFFFFK
..KFFFFFFFK.
...KFFFFFK..
...KKKKKKK..
"""

GRABBING = """
..KK.KK.KK..
.KFFKFFKFFK.
.KFFKFFKFFKK
.KFFKFFKFFKK
KKKKKKKKKFFK
KFFFFFFFKFFK
KFFFFFFFFFFK
KFFFFFFFFFFK
.KFFFFFFFFK.
..KKKKKKKK..
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
for name, art in {"arrow": ARROW, "point": POINT, "grab": GRAB, "grabbing": GRABBING}.items():
    (out / f"{name}.svg").write_text(svg(art))
