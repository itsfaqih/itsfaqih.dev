#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
export SP
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
L=$SP/lever; B=$SP/base/dist; N=$SP/diff/fix-dist; O=$SP/diff/a4; rm -rf $O; mkdir -p $O
G="python3 $HOME/.agents/tools/gate-slot.py -- timeout 590"
for i in 1 2 3 4 5; do
  for s in "quiz proximity-principle" "quiz button-design"; do
    k=$(echo "$s" | tr ' /' '--')
    $G vp node $L/motion2.mjs $B $N $O/bn-$k-$i.json conc=1 "only=$s" widths=1440 themes=dark >/dev/null 2>&1; echo "base new $k $i $?"
    $G vp node $L/motion2.mjs $N $B $O/nb-$k-$i.json conc=1 "only=$s" widths=1440 themes=dark >/dev/null 2>&1; echo "new base $k $i $?"
    $G vp node $L/motion2.mjs $B $B $O/bb-$k-$i.json conc=1 "only=$s" widths=1440 themes=dark >/dev/null 2>&1; echo "base base $k $i $?"
    $G vp node $L/motion2.mjs $N $N $O/nn-$k-$i.json conc=1 "only=$s" widths=1440 themes=dark >/dev/null 2>&1; echo "new new $k $i $?"
  done
done
echo DONE
