NEW=/Users/itsfaqih/.t3/worktrees/itsfaqih.dev/refactor-vanilla-extract
BASE=$SP/wt-base
OUT=$SP/diff/f3/buildtime.tsv; : > $OUT
run() { # side dir round
  cd "$2" && rm -rf dist .astro node_modules/.astro node_modules/.vite
  python3 ~/.agents/tools/gate-slot.py -- bash -c 'S=$(python3 -c "import time;print(time.time())"); vp exec astro build >/tmp/b.$$.log 2>&1; C=$?; E=$(python3 -c "import time;print(time.time())"); echo "$1 $2 $C $(python3 -c "print(round($E-$S,2))") $(tail -5 /tmp/b.$$.log | grep -o "in [0-9.]*s" | tail -1)"; rm -f /tmp/b.$$.log' _ "$1" "$3" >> $OUT
}
for i in 1 2 3 4 5 6; do
  if [ $((i%2)) = 1 ]; then run base "$BASE" $i; run new "$NEW" $i; else run new "$NEW" $i; run base "$BASE" $i; fi
done
cat $OUT
