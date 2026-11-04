"""Groups value-aware motion diffs by scene, target, and property, and reports what falls outside the base-versus-base control."""
import collections
import glob
import json
import os
import re
import sys

O = sys.argv[1]


def load(pattern):
    rows = []
    for f in sorted(glob.glob(f"{O}/{pattern}*.json")):
        rows += json.load(open(f))
    return rows


def scene(label):
    return re.sub(r" \d+ (dark|light) (fine|coarse)$", "", label)


def tail(path):
    return ">".join(re.sub(r"\d+", "", p) for p in path.split(">")[-3:])


def sig(d, sc):
    t = d["type"]
    if t == "value":
        p = d["k"].split("|")
        return f"{sc}|value|{p[1]}|{p[2]}|{tail(p[0])}"
    if t == "page":
        return f"{sc}|page|{(d.get('where') or '')[-30:]}"
    if t == "frame":
        return f"{sc}|frame|{(d.get('where') or '')[-30:]}"
    if t.startswith("anim") and t != "anim-count":
        return f"{sc}|{t}|{(d.get('where') or '')[-30:]}"
    return f"{sc}|{t}"


def collect(rows):
    sigs = collections.Counter()
    ex = {}
    for r in rows:
        sc = scene(r["label"])
        for d in r.get("diffs", []):
            k = sig(d, sc)
            sigs[k] += 1
            ex.setdefault(k, (r["label"], d.get("label"), str(d.get("base"))[:110], str(d.get("new"))[:110], d.get("props", [])[:3]))
    return sigs, ex


state = load("state-")
page_diffs = sum(1 for r in state for d in r.get("diffs", []) if d["type"] == "page")
struct = sum(1 for r in state for d in r.get("diffs", []) if d["type"] == "page-count")
print("state jobs", len(state), "failed", sum(1 for r in state if r.get("failed")), "steps with page style diffs", page_diffs, "page-count", struct)
for r in state:
    for d in r.get("diffs", []):
        if d["type"] in ("page", "page-count"):
            print("  STATE", r["label"], d["label"], d.get("count"), d.get("where"), [p[:4] for p in d.get("props", [])][:4])
full, ctl = load("full-"), load("ctl-")
for name, rows in (("full", full), ("ctl", ctl)):
    print(name, "jobs", len(rows), "failed", sum(1 for r in rows if r.get("failed")), "anims", sum(r.get("anims", 0) for r in rows), "values", sum(r.get("values", 0) for r in rows), "diffs", sum(len(r.get("diffs", [])) for r in rows))
a, ex = collect(full)
b, _ = collect(ctl)
outside = {k: n for k, n in a.items() if k not in b}
print("signatures new", len(a), "ctl", len(b), "outside control", len(outside))
by = collections.Counter(k.split("|")[1] for k in outside)
print("outside by type", by.most_common())
for k, n in sorted(outside.items(), key=lambda x: -x[1])[:40]:
    print(n, k, ex[k])
