#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
export SP
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
L=$SP/lever; D=$SP/diff; B=$SP/base/dist; N=$D/fix-dist; P=$D/final-dist; R=$D/fix-reorder; O=$D/f5; mkdir -p $O
G="python3 $HOME/.agents/tools/gate-slot.py -- timeout 590"
quiet() { for i in $(seq 1 120); do l=$(sysctl -n vm.loadavg | awk '{print $2}'); awk "BEGIN{exit !($l<6)}" && break; sleep 15; done; echo "$1 start load $l" >> $O/load.log; }
for r in 01 02 03 04 05 06 07 08 09 10; do
  quiet perf$r; $G vp node $L/perf.mjs $B $N $O/perf-r$r.json rounds=1 >/dev/null 2>&1; echo "perf $r $? end load $(sysctl -n vm.loadavg | awk '{print $2}')" | tee -a $O/load.log
done
for r in 01 02 03 04 05 06 07 08 09 10 11 12; do
  quiet order$r; $G vp node $L/perf.mjs $P $R $O/order-r$r.json rounds=1 scenarios=mobile routes=/ control=$N >/dev/null 2>&1; echo "order $r $? end load $(sysctl -n vm.loadavg | awk '{print $2}')" | tee -a $O/load.log
done
python3 - "$O" <<'PY'
import json,sys,glob
O=sys.argv[1]
for name in ('perf','order'):
  rows=[]
  for i,f in enumerate(sorted(glob.glob(f'{O}/{name}-r*.json'))):
    for r in json.load(open(f)):
      r['round']=i; rows.append(r)
  json.dump(rows,open(f'{O}/{name}.json','w'))
  print(name,'rows',len(rows),'fatal',sum('fatal' in r for r in rows))
PY
echo DONE
