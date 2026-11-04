#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
export SP
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
G="python3 $HOME/.agents/tools/gate-slot.py -- timeout 590"
L=$SP/lever; D=$SP/diff; B=$SP/base/dist; N=$D/fix-dist; O=$D/f3; mkdir -p $O
step() { echo "== $1"; shift; "$@" 2>&1 | tail -${TAILN:-3} | cut -c1-220; }
step force-dark $G vp node $L/site-diff.mjs $B $N $O/force-dark.json force=one-hover,one-active,one-focus-visible widths=1440 themes=dark motion=reduce pointer=fine step=350 conc=3
step force-light-narrow $G vp node $L/site-diff.mjs $B $N $O/force-light.json force=one-hover,one-active,one-focus-visible widths=390 themes=light motion=reduce pointer=fine step=350 conc=3
step coarse $G vp node $L/site-diff.mjs $B $N $O/coarse.json widths=1440,961,960,959,641,640,639,480,390 themes=dark,light motion=reduce pointer=coarse conc=4
step fullmotion $G vp node $L/site-diff.mjs $B $N $O/fullmotion.json widths=1440,959,390 themes=dark,light motion=full pointer=fine,coarse conc=4
step fullmotion-ctl $G vp node $L/site-diff.mjs $B $B $O/fullmotion-ctl.json widths=1440,959,390 themes=dark,light motion=full pointer=fine,coarse conc=4
TAILN=12 step firstpaint $G vp node $L/firstpaint.mjs $B $N
TAILN=12 step cvcheck $G vp node $L/cvcheck.mjs $B $N
step pseudo $G vp node $L/pseudo.mjs $B $N $O/pseudo.json
step scenes $G vp node $L/motion2.mjs $B $N $O/scenes.json conc=3 except=quiz,palette
step scenes-ctl $G vp node $L/motion2.mjs $B $B $O/scenes-ctl.json conc=3 except=quiz,palette
TAILN=8 step order python3 $L/order-check.py $N
TAILN=30 step tokens python3 $L/css-tokens.py $B $N
TAILN=20 step prefixes python3 $L/prefix-parity.py $B $N
TAILN=30 step assets python3 $L/distcmp.py $B $N
PD=$O/pdf; rm -rf $PD; mkdir -p $PD
for f in $(cd $N && find . -name '*.pdf'); do
  k=$(echo "$f" | tr '/' '_')
  pdftotext -layout "$B/$f" "$PD/$k.b.txt"; pdftotext -layout "$N/$f" "$PD/$k.n.txt"
  cmp -s "$PD/$k.b.txt" "$PD/$k.n.txt" && T=same || T=DIFF
  pdftoppm -r 150 -png "$B/$f" "$PD/$k.B"; pdftoppm -r 150 -png "$N/$f" "$PD/$k.N"
  P=0; X=0; for b in "$PD/$k".B-*.png; do n=${b/.B-/.N-}; P=$((P+1)); cmp -s "$b" "$n" || X=$((X+1)); done
  echo "pdf $f text=$T pages=$P pagesDifferent=$X bytes=$(stat -f%z "$B/$f")->$(stat -f%z "$N/$f")"
done
sed -i '' "s#/diff/final-dist#/diff/fix-dist#" $L/css-audit.py
TAILN=30 step audit python3 $L/css-audit.py
echo DONE
