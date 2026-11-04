import collections
import json
import re
import sys

D, new, ctl = sys.argv[1:4]
IGNORE_CUSTOM = len(sys.argv) > 4 and sys.argv[4] == "nocustom"


def load(n):
    return json.load(open(f"{D}/{n}.json"))


def toks(v):
    return re.sub(r"\s+", "", str(v)).replace('"', "'").lower()


def walk(rows):
    for r in rows:
        for x in r.get("diffs", []):
            for kind in ("el", "b", "a"):
                for item in x.get(kind, []):
                    yield r, x, kind, item


ctlprops = collections.Counter(f"{i[0]}" for _, _, _, i in walk(load(ctl)))
sample = {}
cnt = collections.Counter()
same_after_ws = collections.Counter()
for r, x, kind, item in walk(load(new)):
    p = item[0]
    if toks(item[1]) == toks(item[2]):
        same_after_ws[p] += 1
        continue
    if IGNORE_CUSTOM and p.startswith("--"):
        cnt["custom-prop"] += 1
        sample.setdefault("custom:" + p, (r["label"], x["path"][-40:], str(item[1])[:90], str(item[2])[:90]))
        continue
    cnt[p] += 1
    sample.setdefault(p, (r["label"], x["path"][-40:], str(item[1])[:90], str(item[2])[:90]))
print("whitespace or quote only props", sum(same_after_ws.values()), "distinct", len(same_after_ws))
print("real diffs by prop, with control count:")
for p, n in cnt.most_common(40):
    print(f"  {p}: {n} (ctl {ctlprops.get(p, 0)})  {sample.get(p)}")
cust = [k for k in sample if k.startswith("custom:")]
print("custom samples", len(cust))
for k in cust[:24]:
    print(" ", k, sample[k][2:], "|", sample[k][0])
for name in (new, ctl):
    st = collections.Counter()
    ex = {}
    for r in load(name):
        for s in r.get("struct", []):
            k = str(s.get("what", s.get("type", "")))[:30] if isinstance(s, dict) else str(s)[:30]
            st[r["job"]["route"] + " " + k] += 1
            ex.setdefault(r["job"]["route"], json.dumps(s)[:220])
    print(name, "struct", dict(st.most_common(8)))
    print("  ex", list(ex.items())[:3])
