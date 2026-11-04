import re,subprocess
def rd(p): return open(p).read()
def wr(p,s): open(p,'w').write(s)
# aliases
for p,names in (('src/cv/cv-page.astro','heading section entry entryTitle text label list point link designOnly atsOnly'.split()),('src/sections/home.astro',['footerLink']),('src/rules/button-hierarchy.astro',['inRow'])):
    s=rd(p); head,tmpl=s.split('\n---\n',1) if s.startswith('---\n') else (None,None)
    tgt={}
    for n in names:
        m=re.search(rf'^const {n} = (styles\.\w+);\n?',head,flags=re.M); assert m,n
        tgt[n]=m[1]; head=head.replace(m[0],'')
    def expr(m):
        return re.sub(r'(?<![\w."\'-])('+'|'.join(names)+r')(?![\w:"\'-])',lambda k:tgt[k[1]],m[0])
    tmpl2=re.sub(r'(?<=class=)\{[^{}]*\}|(?<=class:list=)\{[^{}]*\}',expr,tmpl)
    # and in frontmatter compositions
    head2=re.sub(r'(cx\([^()]*\))',expr,head)
    wr(p,head2.rstrip('\n')+'\n---\n'+tmpl2)
    left=[n for n in names if re.search(rf'\{{\s*{n}\s*\}}|[\[, ]{n}[\], ]\}}?',tmpl2) and False]
# class props
def rename_decl(p,old):
    s=rd(p)
    s=s.replace(f'  {old}?: ClassValue;','  class?: ClassValue;').replace(f'{old}?: ClassValue','class?: ClassValue')
    def destr(m):
        return re.sub(rf'\b{old}\b','class: className',m[0])
    s=re.sub(r'const \{[^}]*\} = Astro\.props',destr,s)
    fm,t=s[4:].split('\n---\n',1)
    t=re.sub(rf'(?<![\w.-]){old}(?!\w)(?=[\]\),}}])','className',t)
    wr(p,'---\n'+fm+'\n---\n'+t)
for p,o in (('src/sections/tech-icon.astro','xstyle'),('src/sections/company-logo.astro','xstyle'),('src/components/page-container.astro','style'),('src/rules/lesson-text.astro','style'),('src/rules/code.astro','style'),('src/sections/rule-thumb.astro','style')):
    rename_decl(p,o)
for p in ('src/sections/tech-icon.astro','src/sections/company-logo.astro'):
    s=rd(p); s=s.replace('`xstyle` can tint','`class` can tint'); wr(p,s)
s=rd('src/rules/rule-lesson.astro').replace('costsStyle','costsClass'); wr('src/rules/rule-lesson.astro',s)
TAG=re.compile(r'<(Code|PageContainer|LessonText|RuleThumb)\b[^<]*?>',re.S)
for f in subprocess.run(['git','ls-files','src/*.astro'],capture_output=True,text=True).stdout.split():
    s=rd(f); o=s
    s=s.replace('costsStyle=','costsClass=')
    s=re.sub(r'\bxstyle=','class=',s)
    s=TAG.sub(lambda m:re.sub(r'\bstyle=\{','class={',m[0]),s)
    if s!=o: wr(f,s)
