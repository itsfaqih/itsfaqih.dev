import re,subprocess
SPECS=[
 ('src/rules/table-design.view.ts','view','./table-design.css','styles',['flash','reel','strip','digit']),
 ('src/rules/data-loading.view.ts','view','./data-loading.css','styles',['mailText','histAmount','time']),
 ('src/rules/handling-timestamps.view.ts','tsView','./handling-timestamps.css','styles',['should']),
 ('src/rules/null-vs-undefined.view.ts','flowView','./null-vs-undefined.css','styles',['wire','verb','idle','record','name']),
]
def add_import(s,line):
    m=re.search(r'^(---\n)?',s)
    i=s.index('import ')
    return s[:i]+line+'\n'+s[i:]
for path,obj,mod,bind,entries in SPECS:
    view=open(path).read()
    for e in entries:
        view,n=re.subn(rf'^  {e}: styles\.{e},\n','',view,flags=re.M); assert n==1,(path,e)
    open(path,'w').write(view)
    base=path.split('/')[-1][:-3]
    files=subprocess.run(['git','grep','-l',f'{base}"','--','src'],capture_output=True,text=True).stdout.split()
    for f in files:
        if f==path: continue
        s=open(f).read(); o=s
        s=re.sub(rf'\b{obj}\.({"|".join(entries)})\b',lambda m:f'styles.{m[1]}',s)
        if s==o: continue
        if not re.search(rf'import \{{[^}}]*\bstyles\b[^}}]*\}} from "{re.escape(mod)}"',s):
            assert not re.search(r'\bstyles\b',o),('styles bound',f)
            s=add_import(s,f'import {{ styles }} from "{mod}";')
        if not re.search(rf'\b{obj}\.',s):
            s,n=re.subn(rf'import \{{ {obj} \}} from "[^"]*{base}";\n','',s)
            if n==0:
                s,n=re.subn(rf'(import \{{[^}}]*?)\b{obj}, ',r'\1',s); assert n==1 or f,f
        open(f,'w').write(s)
# srOnly: arcade helpers
p='src/rules/null-vs-undefined.view.ts'; s=open(p).read()
s=s.replace('  srOnly: arcade.srOnly,\n','')
if 'arcade.' not in s: s=s.replace('import { arcade } from "../components/arcade.css";\n','')
s=s.replace('class: cx(kind)','class: cx(kind)')
open(p,'w').write(s)
p='src/rules/handling-timestamps.view.ts'; s=open(p).read()
s=s.replace('  srOnly: arcade.srOnly,\n','').replace('import { arcade } from "../components/arcade.css";\n','')
open(p,'w').write(s)
for f in ('src/rules/ts-readers.astro','src/rules/ts-readers.client.ts'):
    s=open(f).read(); s=s.replace('tsView.srOnly','arcade.srOnly')
    if not re.search(r'import \{[^}]*\barcade\b',s):
        i=s.index('import '); s=s[:i]+'import { arcade } from "../components/arcade.css";\n'+s[i:]
    open(f,'w').write(s)
# table-design.row is the marker
p='src/rules/table-design.view.ts'; s=open(p).read()
s=s.replace('  row: cx(row),\n','').replace('import { row, tipped } from "./table-design.markers";','import { tipped } from "./table-design.markers";')
open(p,'w').write(s)
for f in subprocess.run(['git','grep','-l',r'view\.row\b','--','src/rules'],capture_output=True,text=True).stdout.split():
    s=open(f).read(); assert not re.search(r'\b(const|let) row\b|\brow =>|\(row\b|\brow\)',s),('row bound',f)
    s=s.replace('view.row','row'); 
    if not re.search(r'import \{[^}]*\brow\b[^}]*\} from "./table-design.markers"',s):
        i=s.index('import '); s=s[:i]+'import { row } from "./table-design.markers";\n'+s[i:]
    if not re.search(r'\bview\.',s): s=re.sub(r'import \{ view \} from "[^"]*table-design.view";\n','',s)
    open(f,'w').write(s)
