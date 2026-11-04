"""Reruns every cross-engine and breakpoint job that held a diff outside the explained classes, alone, twice, then reports what survives."""
import json
import os
import re
import subprocess
import sys

SP = sys.argv[1]
D = f"{SP}/diff"
B = f"{SP}/base/dist"
N = f"{D}/fix-dist"
R = f"{D}/rep"
os.makedirs(R, exist_ok=True)
ENGINES = {"wk-new": "webkit", "ff-new": "firefox", "bp-new": "chromium"}


def real(engine, item):
    prop, a, b = item[0], str(item[1]), str(item[2])
    if prop.startswith("--") and engine == "firefox":
        return False
    if prop == "background-image" and a.startswith('url("data:image/png') and b.startswith('url("data:image/png'):
        return False
    if prop in ("background-position-x", "background-position-y"):
        return re.sub(r"\b0%", "0px", a) != re.sub(r"\b0%", "0px", b)
    return True


def norm_struct(v):
    v = re.sub(r"--cut-order:\s*\d+;?", "", str(v))
    v = re.sub(r"background-image:\s*url\([^)]*\);?", "", v)
    v = re.sub(r"data-in=&?", "", v)
    return re.sub(r"\s+", "", v).rstrip("&;")


def real_struct(row):
    return [s for s in row.get("struct", []) if not isinstance(s, dict) or norm_struct(s.get("base")) != norm_struct(s.get("new"))]


def rows_with_real(name, engine):
    out = []
    for r in json.load(open(f"{D}/{name}.json")):
        items = [i for x in r.get("diffs", []) for k in ("el", "b", "a") for i in x.get(k, []) if real(engine, i)]
        if items or real_struct(r):
            out.append(r["job"])
    return out


summary = {}
for name, engine in ENGINES.items():
    jobs = rows_with_real(name, engine)
    keys = sorted({(j["route"], j["width"], j["theme"], j["pointer"]) for j in jobs})
    print(name, "jobs with real-class diffs", len(keys), flush=True)
    if len(sys.argv) > 2 and sys.argv[2] == "count":
        continue
    survivors = []
    for route, width, theme, pointer in keys:
        hits = 0
        kept = None
        for run in range(2):
            out = f"{R}/{name}.json"
            subprocess.run(
                ["python3", os.path.expanduser("~/.agents/tools/gate-slot.py"), "--", "timeout", "300", "vp", "node", f"{SP}/lever/site-diff.mjs", B, N, out, f"engine={engine}", f"routes={route}", f"widths={width}", f"themes={theme}", "motion=reduce", f"pointer={pointer}", "conc=1"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
            rows = json.load(open(out))
            items = [i for r in rows for x in r.get("diffs", []) for k in ("el", "b", "a") for i in x.get(k, []) if real(engine, i)]
            struct = sum(len(real_struct(r)) for r in rows)
            if items or struct:
                hits += 1
                kept = (sorted({i[0] for i in items})[:8], struct, [str(i[1])[:60] + " -> " + str(i[2])[:60] for i in items[:2]])
        if hits:
            survivors.append({"route": route, "width": width, "theme": theme, "pointer": pointer, "runsWithDiff": hits, "sample": kept})
            print("SURVIVES", name, route, width, theme, pointer, hits, kept, flush=True)
    summary[name] = {"jobs": len(keys), "survivors": survivors}
    print(name, "repeated", len(keys), "survivors", len(survivors), flush=True)
json.dump(summary, open(f"{R}/summary.json", "w"))
print("DONE")
