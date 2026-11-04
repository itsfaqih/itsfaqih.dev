#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
export SP
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
L=$SP/lever; D=$SP/diff; B=$SP/base/dist; N=$D/fix-dist; P=$D/final-dist; R=$D/fix-reorder; O=$D/f6; rm -rf $O; mkdir -p $O
G="python3 $HOME/.agents/tools/gate-slot.py -- timeout 590"
lo() { sysctl -n vm.loadavg | awk '{print $2}'; }
for r in 1 2 3; do
  s=$(lo); $G vp node $L/perf.mjs $B $N $O/perf-r$r.json rounds=4 >/dev/null 2>&1; echo "perf $r exit $? load $s to $(lo) at $(date +%H:%M)"
done
s=$(lo); $G vp node $L/perf.mjs $P $R $O/order.json rounds=12 scenarios=mobile routes=/ control=$N >/dev/null 2>&1; echo "order exit $? load $s to $(lo) at $(date +%H:%M)"
python3 - "$O" <<'PY'
import json,sys,glob
O=sys.argv[1]
rows=[]
for i,f in enumerate(sorted(glob.glob(f'{O}/perf-r*.json'))):
  for r in json.load(open(f)):
    r['round']=f"{i}.{r['round']}"; rows.append(r)
json.dump(rows,open(f'{O}/perf.json','w'))
print('perf rows',len(rows),'fatal',sum('fatal' in r for r in rows))
print('order fatal',sum('fatal' in r for r in json.load(open(f'{O}/order.json'))))
PY
echo DONE
