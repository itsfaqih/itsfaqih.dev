#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
export SP
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
L=$SP/lever; B=$SP/base/dist; N=$SP/diff/fix-dist; O=$SP/diff/a3; rm -rf $O; mkdir -p $O
G="python3 $HOME/.agents/tools/gate-slot.py -- timeout 590"
for i in 1 2 3; do
  for s in "quiz table-design" "quiz button-design" "quiz null-vs-undefined" "quiz data-loading" "quiz dialog-design"; do
    k=$(echo "$s" | tr ' /' '--')
    $G vp node $L/motion2.mjs $B $N $O/red-new-$k-$i.json conc=1 motion=reduce "only=$s" >/dev/null 2>&1; echo "reduce new $k $i $?"
    $G vp node $L/motion2.mjs $B $B $O/red-ctl-$k-$i.json conc=1 motion=reduce "only=$s" >/dev/null 2>&1; echo "reduce ctl $k $i $?"
  done
  for s in "quiz proximity-principle" "quiz button-design" "quiz data-loading"; do
    k=$(echo "$s" | tr ' /' '--')
    $G vp node $L/motion2.mjs $B $N $O/full-new-$k-$i.json conc=1 "only=$s" >/dev/null 2>&1; echo "full new $k $i $?"
    $G vp node $L/motion2.mjs $B $B $O/full-ctl-$k-$i.json conc=1 "only=$s" >/dev/null 2>&1; echo "full ctl $k $i $?"
  done
done
echo DONE
