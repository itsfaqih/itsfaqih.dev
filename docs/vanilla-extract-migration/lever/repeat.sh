cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
D=$SP/diff; B=$SP/base/dist; N=$D/final-dist
for i in 1 2 3 4 5 6; do
 for pair in "ctl $B" "new $N"; do set -- $pair
  vp node $SP/lever/site-diff.mjs $B $2 $D/rep/t-$1-$i.json routes=/rule-of-thumb/table-design widths=390 themes=light motion=full pointer=coarse conc=1 >/dev/null 2>&1
  vp node $SP/lever/site-diff.mjs $B $2 $D/rep/d-$1-$i.json routes=/rule-of-thumb/data-loading widths=1440 themes=dark motion=full pointer=fine conc=1 >/dev/null 2>&1
  vp node $SP/lever/site-diff.mjs $B $2 $D/rep/h-$1-$i.json routes=/rule-of-thumb/handling-timestamps widths=390 themes=light motion=full pointer=fine conc=1 >/dev/null 2>&1
 done
done
python3 - <<'PY'
import json,os,glob,collections
out=collections.defaultdict(list)
for f in sorted(glob.glob(os.environ['SP']+'/diff/rep/*.json')):
    n=os.path.basename(f).split('-'); r=json.load(open(f))[0]
    out[n[0]+' '+n[1]].append((r.get('mismatched'),len(r['struct'])))
for k,v in sorted(out.items()): print(k,v)
PY
