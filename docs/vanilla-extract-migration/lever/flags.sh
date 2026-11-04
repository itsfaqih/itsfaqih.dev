#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
G="python3 $HOME/.agents/tools/gate-slot.py --"
L=$SP/lever; D=$SP/diff
$G timeout 590 vp node $L/dots.mjs $SP/base/dist $D/fix-dist $D/dots.json widths=1440,390 themes=dark,light > $SP/flag-dots.log 2>&1; echo dots=$?
$G timeout 590 vp node $L/motion2.mjs $SP/base/dist $D/fix-dist $D/m2-quiz-new.json conc=3 only=quiz > $SP/flag-q-new.log 2>&1; echo qnew=$?
$G timeout 590 vp node $L/motion2.mjs $SP/base/dist $SP/base/dist $D/m2-quiz-ctl.json conc=3 only=quiz > $SP/flag-q-ctl.log 2>&1; echo qctl=$?
$G timeout 590 vp node $L/motion2.mjs $SP/base/dist $D/fix-dist $D/m2-pal-new.json conc=3 "only=palette full" > $SP/flag-p-new.log 2>&1; echo pnew=$?
$G timeout 590 vp node $L/motion2.mjs $SP/base/dist $SP/base/dist $D/m2-pal-ctl.json conc=3 "only=palette full" > $SP/flag-p-ctl.log 2>&1; echo pctl=$?
echo DONE
