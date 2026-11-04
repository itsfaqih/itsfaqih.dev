"""Copies two builds and reshuffles their modulepreload tags per seed, so a shared chunk name gets the same relative place in both."""
import hashlib
import os
import re
import shutil
import sys

SP, seeds = sys.argv[1], sys.argv[2:]
ROUTES = ["index.html", "blog/hello-world.html", "cv.html", "rule-of-thumb/button-design.html"]
TAG = r'<link rel="modulepreload" href="/_astro/[^"]+">'


def stem(tag):
    return re.search(r"/_astro/(.+?)\.[\w-]+\.js", tag).group(1)


def rewrite(path, seed):
    html = open(path).read()
    head = html[: html.find("</head>")]
    tags = re.findall(TAG, head)
    assert tags, path
    first, last = head.find(tags[0]), head.find(tags[-1]) + len(tags[-1])
    assert re.sub(TAG, "", head[first:last]).strip() == "", path
    order = sorted(tags, key=lambda t: hashlib.sha256(f"{seed}:{stem(t)}".encode()).hexdigest())
    open(path, "w").write(html[:first] + "".join(order) + html[last:])
    return len(tags)


for seed in seeds:
    for name, src in (("base", f"{SP}/base/dist"), ("new", f"{SP}/diff/fix-dist")):
        out = f"{SP}/diff/orders/{name}-{seed}"
        shutil.rmtree(out, ignore_errors=True)
        shutil.copytree(src, out)
        counts = [rewrite(os.path.join(out, r), seed) for r in ROUTES]
        print(name, seed, "tags per route", counts)
