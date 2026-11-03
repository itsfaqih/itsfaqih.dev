#!/bin/bash
set -e
SP="$(cd "$(dirname "$0")/.." && pwd)"
W="$SP/../.."
N=$(mktemp -d)/lab-new
rm -rf $N; mkdir -p $N
cd $W
rsync -a --exclude node_modules --exclude dist --exclude .git --exclude .audit --exclude .astro --exclude tests/visual/__screenshots__ --exclude tests/visual/__behavior__ ./ $N/
ln -s $W/node_modules $N/node_modules
cd $N
vp node $SP/lever/lab-page.mjs $N new $SP/lever/raw.json $SP/lever/overlap.json $SP/lever/rename.json
python3 ~/.agents/tools/gate-slot.py -- vp exec astro build > $SP/lab/new-build.txt 2>&1 || true
tail -3 $SP/lab/new-build.txt | cut -c1-200
cp dist/lab.html $SP/lab/out/new.html
