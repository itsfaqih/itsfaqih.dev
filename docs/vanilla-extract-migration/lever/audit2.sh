#!/bin/bash
SP=/private/tmp/claude-501/-Users-itsfaqih--t3-worktrees-itsfaqih-dev-refactor-vanilla-extract/5bdd764b-8769-431c-ab46-6c3c4dbc7f3c/scratchpad
export SP
cd /Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
L=$SP/lever; D=$SP/diff; B=$SP/base/dist; N=$D/fix-dist; O=$D/a2; rm -rf $O; mkdir -p $O
G="python3 $HOME/.agents/tools/gate-slot.py -- timeout 590"

M=$O/mut; mkdir -p $M
python3 - "$N" "$M" <<'PY'
import re,shutil,sys
N,M=sys.argv[1:]
def seed(name,fn):
    root=f"{M}/{name}"; shutil.copytree(N,root); p=f"{root}/index.html"; s=open(p).read(); t,n=fn(s); assert n,name; open(p,"w").write(t); print("seed",name,"sites",n)
seed("duration",lambda s:re.subn(r"\.56s",".96s",s))
KF=re.compile(r"(@keyframes _[\w-]+\{(?:[^{}]*\{[^{}]*\})*\})")
def kf(s):
    c=[0]
    def block(m):
        body,n=re.subn(r"transform:","transform:translateX(3px) ",m.group(1)); c[0]+=n; return body
    return KF.sub(block,s),c[0]
seed("keyframe",kf)
seed("token",lambda s:re.subn(r"--text:#f4f4f8","--text:#f4f4f0",s))
PY
[ $? -eq 0 ] || exit 1
$G vp node $L/motion2.mjs $B $M/duration $O/seed-duration.json conc=1 "only=home rows" widths=1440 themes=dark >/dev/null 2>&1; echo "seed motion duration $?"
$G vp node $L/motion2.mjs $B $M/keyframe $O/seed-keyframe.json conc=1 "only=home hero loop" widths=1440 themes=dark >/dev/null 2>&1; echo "seed motion keyframe $?"
$G vp node $L/motion2.mjs $B $N $O/seed-clean-rows.json conc=1 "only=home rows" widths=1440 themes=dark >/dev/null 2>&1; echo "seed clean rows $?"
$G vp node $L/motion2.mjs $B $N $O/seed-clean-hero.json conc=1 "only=home hero loop" widths=1440 themes=dark >/dev/null 2>&1; echo "seed clean hero $?"
$G vp node $L/site-diff.mjs $B $M/token $O/seed-ff-token.json engine=firefox routes=/ widths=1440 themes=dark motion=reduce pointer=fine conc=1 >/dev/null 2>&1; echo "seed firefox token $?"
$G vp node $L/site-diff.mjs $B $M/token $O/seed-wk-token.json engine=webkit routes=/ widths=1440 themes=dark motion=reduce pointer=fine conc=1 >/dev/null 2>&1; echo "seed webkit token $?"
$G vp node $L/ffprobe.mjs $B $M/token > $O/seed-ffprobe.txt 2>&1; echo "seed ffprobe $?"
$G vp node $L/firstpaint.mjs $B $M/token > $O/seed-firstpaint.txt 2>&1; echo "seed firstpaint $?"
rm -rf $M

for rt in dialog-design:959:dark table-design:961:light; do
  IFS=: read r w t <<< "$rt"
  for i in 1 2 3; do
    $G vp node $L/site-diff.mjs $B $N $O/ff-new-$r-$i.json engine=firefox routes=/rule-of-thumb/$r widths=$w themes=$t motion=reduce pointer=fine,coarse conc=1 >/dev/null 2>&1; echo "firefox new $r $i $?"
    $G vp node $L/site-diff.mjs $B $B $O/ff-ctl-$r-$i.json engine=firefox routes=/rule-of-thumb/$r widths=$w themes=$t motion=reduce pointer=fine,coarse conc=1 >/dev/null 2>&1; echo "firefox ctl $r $i $?"
  done
done

for i in 1 2 3 4 5; do
  $G vp node $L/motion2.mjs $B $N $O/ts-new-$i.json conc=1 "only=ts code" widths=1440 >/dev/null 2>&1; echo "ts new $i $?"
  $G vp node $L/motion2.mjs $B $B $O/ts-ctl-$i.json conc=1 "only=ts code" widths=1440 >/dev/null 2>&1; echo "ts ctl $i $?"
  $G vp node $L/dots.mjs $B $N $O/dots-cv-$i.json routes=/cv widths=1440 themes=light >/dev/null 2>&1; echo "dots cv $i $?"
done

for s in "quiz proximity-principle" "quiz data-loading" "quiz handling-timestamps" "quiz button-design" "palette full /blog" "palette full /rule-of-thumb/button-design"; do
  k=$(echo "$s" | tr ' /' '--')
  for i in 1 2; do
    $G vp node $L/motion2.mjs $B $N $O/rep-new-$k-$i.json conc=2 "only=$s" >/dev/null 2>&1; echo "rep new $k $i $?"
    $G vp node $L/motion2.mjs $B $B $O/rep-ctl-$k-$i.json conc=2 "only=$s" >/dev/null 2>&1; echo "rep ctl $k $i $?"
  done
done
echo DONE
