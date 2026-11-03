import re,sys
def sub(f,a,b,count=1,rx=False):
    s=open(f).read()
    n=(len(re.findall(a,s)) if rx else s.count(a))
    if not n: sys.exit(f"no match {f}: {a[:60]}")
    s=re.sub(a,b,s,count=count) if rx else s.replace(a,b) if count==0 else s.replace(a,b,count)
    open(f,'w').write(s)
# astro.config
f='astro.config.ts'
sub(f,'import stylex from "@stylexjs/unplugin";\nimport { Features } from "lightningcss";\n','import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";\n')
s=open(f).read()
s=re.sub(r'// StyleX collects every module.*?\n\}\);\n\n(?=async function inlineCoreAssets)','',s,flags=re.S)
s=s.replace('  // Quoted or not: StyleX\'s sheet is printed after Vite\'s minify pass.\n','')
s=re.sub(r'        // SAFETY: the Vite plugin object keeps.*?const sheet = [^\n]*\n','',s,flags=re.S)
s=s.replace('          html = html.replace("</head>", () => `${sheet}</head>`);\n','')
s=s.replace('''    plugins: [
      roundIconPaths(),
      { ...stylexPlugin, generateBundle: undefined, writeBundle: undefined },
    ],''','''    plugins: [roundIconPaths(), vanillaExtractPlugin()],''')
open(f,'w').write(s)
# vitest
f='vitest.config.ts'
sub(f,'import stylex from "@stylexjs/unplugin";','import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";')
s=open(f).read()
s=re.sub(r'        // Components style themselves with StyleX.*?plugins: \[[^\n]*\n','        plugins: [vanillaExtractPlugin()],\n',s,flags=re.S)
open(f,'w').write(s)
# site.astro
f='src/layouts/site.astro'
s=open(f).read()
s=re.sub(r'    \{\n      import\.meta\.env\.DEV && \(.*?\n      \)\n    \}\n','',s,flags=re.S)
s=s.replace('    <meta charset="utf-8" />\n','    <meta charset="utf-8" />\n    <style is:inline set:html="@layer base, global, under5, under4, under3, under2, under1;"></style>\n',1)
open(f,'w').write(s)
# og card
f='scripts/og/card.tsx'
s=open(f).read()
s=re.sub(r'async function loadTokens\(\) \{.*?\n\}\n\n','',s,flags=re.S)
s=s.replace('''  assets ??= Promise.all([loadFonts(), loadTokens()]).then(([fonts, tokens]) => ({
    fonts,
    tokens,
  }));
  const { fonts, tokens } = await assets;
''','''  fontsLoaded ??= loadFonts();
  const fonts = await fontsLoaded;
''')
s=s.replace('let assets: Promise<{ fonts: Font[]; tokens: Map<string, string> }> | undefined;','let fontsLoaded: Promise<Font[]> | undefined;')
s=s.replace('''    const value = tokens.get(token);
    if (!value) throw new Error(`src/theme.stylex.ts has no --${token} hex for the share card`);
    return value;''','''    const value = palette[`--${token}` as keyof typeof palette];
    if (!/^#[0-9a-f]{3,8}$/i.test(value ?? ""))
      throw new Error(`src/theme.tokens.ts has no --${token} hex for the share card`);
    return value;''')
open(f,'w').write(s)
sub('scripts/og/card.tsx','import { SLIDES } from "../../src/data/home";\n','import { SLIDES } from "../../src/data/home";\nimport { palette } from "../../src/theme.tokens";\n')
import os
os.remove('src/layouts/site.view.ts')
sub('src/layouts/site.css.ts','export const styles = {','export const site = {')
sub('src/layouts/site.css.ts','const styles = {','export const site = {') if False else None
sub('src/layouts/site.astro','"./site.view"','"./site.css"')
sub('src/pages/404.astro','"../layouts/site.view"','"../layouts/site.css"')
sub('src/layouts/site.css.ts','overflowX: "clip !important",','// SAFETY: the value is valid CSS, and the property type has no member with a priority.\n    overflowX: "clip !important" as "clip",',count=0)
sub('src/components/print-cursor.css.ts','"shape-rendering": "crispEdges",','["shapeRendering"]: "crispEdges",')
sub('src/components/print-cursor.css.ts','// Kebab-case: the anti-slop','// A computed key: the anti-slop')
sub('src/sections/rule-spread.css.ts','WebkitUserDrag: "none",','...undraggable,',count=0)
sub('src/rules/data-loading.view.ts','import { fresh, sweep, styles }','import { styles }')
sub('src/rules/rule-landing.view.ts',r'import \{\s*said,\s*','import { ',rx=True)

sub('src/sections/hero/hero-scene.astro','...draw(','class: draw(',count=0)
sub('scripts/og/card.tsx','const value = palette[`--${token}` as keyof typeof palette];','const value = new Map(Object.entries(palette)).get(`--${token}`);')
sub('scripts/og/card.tsx','if (!/^#[0-9a-f]{3,8}$/i.test(value ?? ""))','if (!value || !/^#[0-9a-f]{3,8}$/i.test(value))')

def before_export(f,decl):
    s=open(f).read()
    i=s.index('export const ')
    open(f,'w').write(s[:i]+decl+'\n\n'+s[i:])
before_export('src/sections/rule-spread.css.ts','// The style type has no member for this non-standard property.\nconst undraggable = { WebkitUserDrag: "none" };')

f='astro.config.ts'
sub(f,'plugins: [roundIconPaths(), vanillaExtractPlugin()],','plugins: [roundIconPaths(), vanillaExtractPlugin(), serverOwnsCss()],')
s=open(f).read()
i=s.index('async function inlineCoreAssets')
s=s[:i]+"""// A client script reads class names from a .css.ts module, and its component's frontmatter imports
// the same module. Left alone, every page would carry that module's rules a second time.
const serverOwnsCss = (): Plugin => ({
  name: "server-owns-css",
  enforce: "pre",
  apply: "build",
  applyToEnvironment: (environment) => environment.name === "client",
  load: (id) => (id.includes(".vanilla.css") ? "" : undefined),
});

"""+s[i:]
open(f,'w').write(s)
sub('scripts/og/DIRECTION.md','`src/theme.stylex.ts`','`src/theme.tokens.ts`')

# Fold one-off cx aliases and single-argument cx calls, then drop imports they leave unused.
import pathlib
for p in pathlib.Path('src').rglob('*'):
    if p.suffix not in ('.ts', '.astro') or p.name == 'cx.ts':
        continue
    s = o = p.read_text()
    s = re.sub(r'^const cls = \(\.\.\.\w+: ClassValue\[\]\) => cx\(\.\.\.\w+\);\n', '', s, flags=re.M)
    s = re.sub(r'\bcls\(', 'cx(', s)
    s = re.sub(r'\bcx\(([A-Za-z_]\w*(?:\.\w+|\["[^"]+"\])+)\)', r'\1', s)
    if s == o:
        continue
    code = re.sub(r'^import .*$', '', s, flags=re.M)
    uses_cx = re.search(r'\bcx\(', code)
    uses_cv = re.search(r'\bClassValue\b', code)
    names = ([] if not uses_cx else ['cx']) + ([] if not uses_cv else ['type ClassValue'])
    line = f'import {{ {", ".join(names)} }} from' if names else None
    s = re.sub(r'^import \{[^}]*\bcx\b[^}]*\} from ("[^"]*cx");\n', (lambda m: f'{line} {m.group(1)};\n' if line else ''), s, flags=re.M)
    p.write_text(s)
