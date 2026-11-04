import collections
import json
import sys

D = sys.argv[1]


def summ(name):
    rows = json.load(open(f"{D}/{name}.json"))
    comps = sum(r.get("n", 0) for r in rows)
    errs = sum(1 for r in rows if r.get("failed") or r.get("error"))
    pageerr = sum(len(r.get("errors", {}).get("new", [])) for r in rows)
    struct = sum(len(r.get("struct", [])) for r in rows)
    props = collections.Counter()
    routes = collections.Counter()
    ndiff = 0
    for r in rows:
        ds = r.get("diffs", [])
        ndiff += len(ds)
        if ds:
            routes[r["job"]["route"]] += len(ds)
        for x in ds:
            for kind, key in (("el", "el"), ("b", "b"), ("a", "a")):
                for item in x.get(key, []):
                    props[f"{kind}:{item[0]}"] += 1
    print(f"{name}: jobs {len(rows)} elements {comps} failed {errs} newPageErrors {pageerr} struct {struct} diffEls {ndiff}")
    print("  routes", dict(routes.most_common(6)))
    print("  props", dict(props.most_common(10)))


for n in sys.argv[2:]:
    summ(n)
