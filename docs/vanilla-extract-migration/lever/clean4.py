import re
def rep(p,pairs):
    s=open(p).read()
    for a,b in pairs:
        assert a in s,(p,a); s=s.replace(a,b)
    open(p,'w').write(s)
rep('src/arcade.css',[
 ('each where StyleX cannot reach:','each where a class cannot reach:'),
 ('Everything else styles itself with StyleX.','Everything else styles itself with vanilla-extract.'),
 ('which StyleX cannot target.','which a class cannot target.'),
 ('/* Global: @property has no StyleX form. --hue','/* Global: @property registers for the whole document. --hue'),
])
for p,w in (('src/components/command-palette.css.ts','hover'),('src/rules/rule-landing.css.ts','hover'),('src/components/header.css.ts','press')):
    s=open(p).read()
    s,n=re.subn(r"// `background: none` minifies to a 0 0 position at rest, and the (hover|press)'s background shorthand\n(\s*)// resets it to 0% 0%\. StyleX would minify a literal 0% 0% back to 0 0, so (?:hover|the press) sets initial\.",
      lambda m:f"// The rest position is 0 0. The {m[1]} sets initial, which computes to 0% 0%, as a\n{m[2]}// background shorthand would.",s)
    assert n==1,p
    open(p,'w').write(s)
rep('src/components/header.css.ts',[("// Each sets its own timing whole: a later StyleX key replaces the glyph's, conditions and all.","// Each sets its own timing whole, so none of the glyph's conditions carry over.")])
rep('src/cv/cv-page.css.ts',[("// queries they share a property with, because StyleX lets a media query beat a bare selector.","// queries they share a property with, because a style's media queries come after its selectors.")])
rep('src/styles.css',[
 ('/* The only global CSS. Components style themselves with StyleX; what is left here is what StyleX\n   cannot express, each rule with its reason. */','/* The only global CSS. Components style themselves with vanilla-extract; what is left here is what\n   a class cannot express, each rule with its reason. */'),
 ('/* Global: @font-face has no StyleX form. */','/* Global: @font-face belongs to the whole document. */'),
 ('userSelect in their own StyleX.','userSelect in their own style.'),
])
rep('scripts/fonts.py',[('Global: @font-face has no StyleX form.','Global: @font-face belongs to the whole document.')])
rep('src/fonts.css',[('Global: @font-face has no StyleX form.','Global: @font-face belongs to the whole document.')])
# one source for the shared chip count
for p in ('src/sections/rule-select.view.ts','src/sections/stack-showcase.view.ts'):
    s=open(p).read()
    s=re.sub(r'(/\*\*[^\n]*\*/\n)?export const countClass = [^\n]*\n\n?','',s)
    s=s.replace('import { chips } from "./chips.css";\n','')
    open(p,'w').write(s)
open('src/sections/chips.view.ts','w').write('''import { cx } from "../cx";
import { chips } from "./chips.css";

/** A topic chip's count, brighter on the pressed chip. The first frame renders it, the client updates it. */
export const countClass = (on: boolean) => cx(chips.count, on && chips.countOn);
''')
imp='import { countClass } from "./chips.view";\n'
rep('src/sections/rule-select.astro',[('import { beamClass, countClass } from "./rule-select.view";\n',imp+'import { beamClass } from "./rule-select.view";\n')])
rep('src/sections/rule-select.client.ts',[('import { beamClass, countClass } from "./rule-select.view";\n',imp+'import { beamClass } from "./rule-select.view";\n')])
for p in ('src/sections/stack-showcase.astro','src/sections/stack-showcase.client.ts'):
    s=open(p).read()
    s,n=re.subn(r'import \{ countClass, groupLabelClass',imp+'import { groupLabelClass',s); assert n==1
    open(p,'w').write(s)
# one source for the layer order
open('src/layers.ts','w').write('''/** Earlier layers lose to later ones and every layer loses to unlayered CSS, so under1 beats under2. */
export const LAYER_ORDER = ["base", "global", "under5", "under4", "under3", "under2", "under1"] as const;
''')
rep('src/layouts/site.astro',[('set:html="@layer base, global, under5, under4, under3, under2, under1;"','set:html={`@layer ${LAYER_ORDER.join(", ")};`}')])
s=open('src/layouts/site.astro').read(); i=s.index('import '); s=s[:i]+'import { LAYER_ORDER } from "../layers";\n'+s[i:]; open('src/layouts/site.astro','w').write(s)
rep('src/layers.css.ts',[("// site.astro's first <style> declares these in order: base, global, under5 to under1.","// site.astro's first <style> declares these in the order of LAYER_ORDER.")])
# dots
rep('src/theme.tokens.ts',[('const dots =\n','export const dots =\n')])
s=open('src/theme.vars.css.ts').read()
print(re.findall(r'"--halftone": `(.{70})',s))
