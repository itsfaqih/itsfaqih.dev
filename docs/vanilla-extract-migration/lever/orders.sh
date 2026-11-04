#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
export SP
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
L=$SP/lever; O=$SP/diff/orders; rm -rf $O; mkdir -p $O
G="python3 $HOME/.agents/tools/gate-slot.py -- timeout 590"
lo() { sysctl -n vm.loadavg | awk '{print $2}'; }
python3 $L/mk-orders.py $SP 1 2 3 4 5 6
for s in 1 2 3 4 5 6; do
  a=$(lo); $G vp node $L/perf.mjs $O/base-$s $O/new-$s $O/run-$s.json rounds=4 scenarios=mobile >/dev/null 2>&1; echo "order $s exit $? load $a to $(lo) at $(date +%H:%M)"
done
echo DONE
