#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
G="python3 $HOME/.agents/tools/gate-slot.py -- timeout 590"
L=$SP/lever; D=$SP/diff; B=$SP/base/dist; N=$D/fix-dist; O=$D/m3; mkdir -p $O
sum() { python3 - "$1" <<'PY'
import json,sys,collections
rows=json.load(open(sys.argv[1])); c=collections.Counter(d['type'] for r in rows for d in r.get('diffs',[]))
print(' ',len(rows),'jobs failed',sum(1 for r in rows if r.get('failed')),dict(c))
PY
}
for i in 1 2 3; do
  echo "cv new $i"; $G vp node $L/motion2.mjs $B $N $O/cv-new-$i.json conc=2 "only=palette full /cv" >/dev/null 2>&1; sum $O/cv-new-$i.json
  echo "cv ctl $i"; $G vp node $L/motion2.mjs $B $B $O/cv-ctl-$i.json conc=2 "only=palette full /cv" >/dev/null 2>&1; sum $O/cv-ctl-$i.json
done
for t in dark light; do
  echo "state palette button $t"; $G vp node $L/motion2.mjs $B $N $O/st-pal-$t.json conc=1 motion=reduce widths=390 themes=$t "only=palette full /rule-of-thumb/button-design" >/dev/null 2>&1; sum $O/st-pal-$t.json
done
for i in 1 2; do
  echo "state nvu $i"; $G vp node $L/motion2.mjs $B $N $O/st-nvu-$i.json conc=1 motion=reduce widths=1440 themes=dark "only=quiz null-vs-undefined" >/dev/null 2>&1; sum $O/st-nvu-$i.json
  echo "state dialog $i"; $G vp node $L/motion2.mjs $B $N $O/st-dlg-$i.json conc=1 motion=reduce widths=390 themes=light "only=quiz dialog-design" >/dev/null 2>&1; sum $O/st-dlg-$i.json
done
echo DONE
