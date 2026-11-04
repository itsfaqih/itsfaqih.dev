"""Seeds one defect per area into a copy of the built site, then checks the parity harness flags each and stays silent on the unmutated copy."""
import json
import os
import re
import shutil
import subprocess
import sys

SP = sys.argv[1]
D = f"{SP}/diff"
B = f"{SP}/base/dist"
N = f"{D}/fix-dist"
M = f"{D}/mut"
os.makedirs(M, exist_ok=True)


def html_files(root):
    for d, _, fs in os.walk(root):
        for f in fs:
            if f.endswith(".html"):
                yield os.path.join(d, f)


def sub(path, pat, rep, count=0):
    s = open(path).read()
    t, n = re.subn(pat, rep, s, count=count)
    assert n, f"no match {pat} in {path}"
    open(path, "w").write(t)
    return n


def every(root):
    return lambda pat, rep: sum(sub(f, pat, rep) for f in html_files(root) if re.search(pat, open(f).read()))


def layer_order(root):
    return every(root)(r"@layer base, global, under5, under4, under3, under2, under1;", "@layer base, global, under1, under2, under3, under4, under5;")


def token(root):
    return every(root)(r"--text:#f4f4f8", "--text:#f4f4f0")


def dot_token(root):
    return every(root)(r"--dot:[^;}]+", "--dot:#ff0000")


def coarse(root):
    return every(root)(r"@media \(pointer:coarse\)\{", "@media (pointer:none){")


def marker(root):
    return sub(f"{root}/rule-of-thumb/dialog-design.html", r"\.marker\b", ".nomarker")


def rule_page(root):
    f = f"{root}/rule-of-thumb/button-design.html"
    s = open(f).read()
    used = re.findall(r'class="([^"]+)"', s)
    ours = [c for cs in used[60:] for c in cs.split() if re.fullmatch(r"_[\w-]+", c)]
    for c in ours:
        if re.search(rf"\.{re.escape(c)}\{{[^{{}}]*(?:padding|margin|gap|font-size)", s):
            return sub(f, rf"\.{re.escape(c)}\{{", f".{c}x{{", count=1)
    raise AssertionError("no rule to break")


def hover_only(root):
    return every(root)(r":hover", ":not(:hover):hover")


MUTATIONS = {
    "layer-order": (layer_order, "routes=/,/cv widths=1440 themes=dark"),
    "token": (token, "routes=/ widths=1440 themes=dark"),
    "coarse": (coarse, "routes=/,/rule-of-thumb/button-design widths=390 themes=dark pointer=coarse"),
    "marker": (marker, "routes=/rule-of-thumb/dialog-design widths=1440 themes=dark force=hover"),
    "rule-page": (rule_page, "routes=/rule-of-thumb/button-design widths=1440 themes=dark"),
}
results = {}
ONLY = set(sys.argv[2].split(",")) if len(sys.argv) > 2 else None
G = ["python3", os.path.expanduser("~/.agents/tools/gate-slot.py"), "--", "timeout", "400", "vp", "node"]
for name, (fn, args) in MUTATIONS.items():
    if ONLY and name not in ONLY:
        continue
    root = f"{M}/{name}"
    shutil.rmtree(root, ignore_errors=True)
    shutil.copytree(N, root)
    changed = fn(root)
    for label, other in (("mutant", root), ("clean", N)):
        out = f"{M}/{name}-{label}.json"
        subprocess.run(G + [f"{SP}/lever/site-diff.mjs", B, other, out, "conc=1"] + args.split(), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=False)
        rows = json.load(open(out))
        n = sum(len(r.get("diffs", [])) for r in rows)
        ignored = {"--cut-order"}
        real = sum(1 for r in rows for x in r.get("diffs", []) for k in ("el", "b", "a") for i in x.get(k, []) if i[0] not in ignored)
        results[f"{name} {label}"] = {"sites": changed, "jobs": len(rows), "diffEls": n, "realItems": real}
        print(name, label, results[f"{name} {label}"], flush=True)
dots_root = f"{M}/dots"
shutil.rmtree(dots_root, ignore_errors=True)
shutil.copytree(N, dots_root)
print("dots sites", dot_token(dots_root), flush=True)
subprocess.run(G + [f"{SP}/lever/dots.mjs", B, dots_root, f"{M}/dots-mutant.json", "routes=/", "widths=1440", "themes=dark"], check=False)
json.dump(results, open(f"{M}/summary.json", "w"))
print("DONE")
