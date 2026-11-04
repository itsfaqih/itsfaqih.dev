#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
export SP
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
L=$SP/lever; D=$SP/diff; B=$SP/base/dist; N=$D/fix-dist; P=$D/final-dist; O=$D/f4; mkdir -p $O
G="python3 $HOME/.agents/tools/gate-slot.py -- timeout 590"
scenes="home hero loop,theme switch,button design,null vs undefined,table design,dialog design,ts code"
for i in 1 2 3; do
  $G vp node $L/motion2.mjs $B $N $O/sc-new-$i.json conc=1 "only=$scenes" >/dev/null 2>&1; echo "scenes new $i $?"
  $G vp node $L/motion2.mjs $B $B $O/sc-ctl-$i.json conc=1 "only=$scenes" >/dev/null 2>&1; echo "scenes ctl $i $?"
done
for r in 1 2 3 4 5 6 7 8 9 10; do
  $G vp node $L/perf.mjs $B $N $O/perf-r$r.json rounds=1 >/dev/null 2>&1; echo "perf round $r $?"
done
for r in 1 2 3 4 5 6 7 8 9 10; do
  $G vp node $L/perf.mjs $P $N $O/fix-r$r.json rounds=1 scenarios=mobile routes=/ >/dev/null 2>&1; echo "prefix round $r $?"
done
python3 - "$O" <<'PY'
import json,sys,glob
O=sys.argv[1]
for name in ('perf','fix'):
  rows=[]
  for i,f in enumerate(sorted(glob.glob(f'{O}/{name}-r*.json'))):
    for r in json.load(open(f)):
      r['round']=i; rows.append(r)
  json.dump(rows,open(f'{O}/{name}.json','w'))
  print(name,'rows',len(rows),'fatal',sum('fatal' in r for r in rows))
PY
echo DONE
