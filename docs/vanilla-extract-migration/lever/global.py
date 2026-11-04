import re
s=open('src/arcade.css').read()
# everything but at-rules that have no layered form moves below the components; the motion blanket stays out.
head,rest=s.split('/* Global: color-scheme on html',1)
rest='/* Global: color-scheme on html'+rest
body=rest
out=[];i=0
tok=re.compile(r'(?m)^(@view-transition|@keyframes [\w-]+|@property [\w-]+)\s*\{')
blanket_at=body.index('/* Global: reaches every element and pseudo-element under an .arc root')
blanket_end=body.index('/* Global: a pseudo-element keyed on the attribute the CV page')
blanket=body[blanket_at:blanket_end]
blanket=blanket.replace('''  .arc *,
  .arc *::before,
  .arc *::after {''','''  :where(.arc *),
  :where(.arc *)::before,
  :where(.arc *)::after {''')
def bal(t,o):
    d=1;j=o
    while d:
        c=t[j]
        if c=='{':d+=1
        elif c=='}':d-=1
        j+=1
    return j
pre=body[:blanket_at]; post=body[blanket_end:]
outside=[]
def strip(t):
    res='';k=0
    for m in tok.finditer(t):
        e=bal(t,m.end())
        res+=t[k:m.start()]
        outside.append(t[m.start():e])
        k=e
    return res+t[k:]
pre2=strip(pre)
inner=(pre2+post).rstrip()
inner=re.sub(r'\n{3,}','\n\n',inner)
new=head+'@layer global {\n'+'\n'.join(('  '+l if l else l) for l in inner.split('\n'))+'\n}\n\n'+'/* Global: at-rules that belong to no layer. */\n'+'\n'.join(outside)+'\n\n'+blanket.rstrip()+'\n'
open('src/arcade.css','w').write(new)
s=open('src/styles.css').read()
s=s.replace('@import "lenis/dist/lenis.css";','@import "lenis/dist/lenis.css" layer(global);')
open('src/styles.css','w').write(s)
