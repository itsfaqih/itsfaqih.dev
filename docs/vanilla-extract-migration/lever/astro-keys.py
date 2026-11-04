"""Checks each member an .astro file reads from a .css.ts export against the export's top-level keys, since the typecheck never reads .astro."""
import pathlib
import re
import subprocess
import sys

root = pathlib.Path(sys.argv[1])
files = subprocess.run(["git", "ls-files", "src/**/*.astro", "src/*.astro"], cwd=root, capture_output=True, text=True).stdout.split()
IMPORT = re.compile(r'import\s*\{([^}]*)\}\s*from\s*["\']([^"\']+\.css(?:\.ts)?)["\']', re.S)
STAR = re.compile(r'import\s*\*\s*as\s*(\w+)\s*from\s*["\']([^"\']+\.css(?:\.ts)?)["\']')


def module(astro, spec):
    base = spec if spec.endswith(".ts") else spec + ".ts"
    if spec.startswith("."):
        return (astro.parent / base).resolve()
    return (root / "src" / base.split("/", 1)[-1]).resolve()


def top_keys(src, name):
    m = re.search(rf"export const {name}\b[^=]*=\s*", src)
    if not m:
        return None
    i = m.end()
    j = src.find("{", i)
    if j < 0 or "\n" in src[i:j] and ";" in src[i:j]:
        return None
    head = src[i:j]
    if head.strip() not in ("", "styleVariants(", "(") and not head.strip().endswith("("):
        return None
    depth, keys, spread = 0, set(), False
    k = j
    while k < len(src):
        c = src[k]
        if c in "\"'`":
            q = c
            k += 1
            while src[k] != q:
                k += 2 if src[k] == "\\" else 1
        elif src.startswith("//", k):
            k = src.index("\n", k)
        elif c in "{[(":
            depth += 1
            if depth == 1 and c == "{":
                pass
        elif c in "}])":
            depth -= 1
            if depth == 0:
                break
        elif depth == 1:
            if src.startswith("...", k):
                spread = True
            m2 = re.compile(r"(?:\"([\w-]+)\"|'([\w-]+)'|([A-Za-z_$][\w$]*))\s*[:,(}]").match(src, k)
            if m2 and re.match(r"[\s,{]", src[k - 1]):
                keys.add(m2.group(1) or m2.group(2) or m2.group(3))
                k = m2.end() - 2
        k += 1
    return None if spread else keys


checked = bad = skipped = 0
for f in files:
    astro = root / f
    text = astro.read_text()
    uses = []
    for names, spec in IMPORT.findall(text):
        for raw in names.split(","):
            raw = raw.strip()
            if not raw:
                continue
            orig, _, alias = raw.partition(" as ")
            uses.append((orig.strip(), (alias or orig).strip(), spec))
    for local, spec in STAR.findall(text):
        mod = module(astro, spec)
        for member in set(re.findall(rf"\b{local}\.(\w+)", text)):
            checked += 1
            if not re.search(rf"export const {member}\b", mod.read_text()):
                bad += 1
                print("MISSING", f, f"{local}.{member}", mod.name)
    for orig, local, spec in uses:
        mod = module(astro, spec)
        if not mod.exists():
            print("NO MODULE", f, spec)
            bad += 1
            continue
        src = mod.read_text()
        if not re.search(rf"export (?:const|function) {orig}\b", src) and not re.search(rf"export \{{[^}}]*\b{orig}\b", src):
            print("NO EXPORT", f, orig, mod.name)
            bad += 1
            continue
        keys = top_keys(src, orig)
        members = set(re.findall(rf"(?<![\w.$/-]){local}\.([A-Za-z_$][\w$]*)", text))
        if keys is None:
            skipped += len(members)
            continue
        for member in members:
            checked += 1
            if member not in keys:
                bad += 1
                print("MISSING", f, f"{local}.{member}", mod.name)
print("astro files", len(files), "members checked", checked, "not resolvable statically", skipped, "missing", bad)
