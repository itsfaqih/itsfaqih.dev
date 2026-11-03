import re,os,sys,collections,json
root=sys.argv[1]
def parse(css,ctx=()):
    """yield (ctx tuple of at-rules, selector, [(prop,val)])"""
    i=0;n=len(css);out=[]
    while i<n:
        j=i;d=0;q=None;p=0
        while j<n:
            c=css[j]
            if q:
                if c=='\\': j+=1
                elif c==q: q=None
            elif c in '"\'': q=c
            elif c=='(': p+=1
            elif c==')': p-=1
            elif p==0 and c in '{;}': break
            j+=1
        if j>=n: break
        head=css[i:j].strip()
        if css[j] in ';}': i=j+1; continue
        k=j+1;d=1;q=None
        while k<n and d:
            c=css[k]
            if q:
                if c=='\\': k+=1
                elif c==q: q=None
            elif c in '"\'': q=c
            elif c=='{': d+=1
            elif c=='}': d-=1
            k+=1
        body=css[j+1:k-1]
        if head.startswith('@media') or head.startswith('@layer') or head.startswith('@supports') or head.startswith('@container'):
            out+=parse(body,ctx+(head,))
        elif head.startswith('@'):
            pass
        else:
            decls=[]
            for m in re.finditer(r'(-?[\w-]+)\s*:((?:[^;"\'()]|"[^"]*"|\'[^\']*\'|\((?:[^()]|\([^()]*\))*\))+)',body):
                decls.append((m[1],m[2].strip()))
            out.append((ctx,head,decls))
        i=k
    return out
FAM={'padding','margin','border','background','transition','animation','font','inset','overflow','outline','gap','grid-template','flex','mask','text-decoration'}
def fam(p):
    return p
report=collections.Counter();ex={}
pages=0
for d,_,fs in os.walk(root):
  for f in fs:
    if not f.endswith('.html'): continue
    pages+=1
    s=open(os.path.join(d,f)).read()
    css=''.join(re.findall(r'<style[^>]*>(.*?)</style>',s,flags=re.S))
    by=collections.defaultdict(list)
    for ctx,sel,decls in parse(css):
        layer=next((c for c in ctx if c.startswith('@layer')),'')
        media=tuple(c for c in ctx if not c.startswith('@layer'))
        for one in sel.split(','):
            m=re.fullmatch(r'\s*\.([\w-]+)((?::[\w-]+(?:\([^()]*\))?|\[[^\]]*\])*)\s*',one)
            if not m: continue
            by[m[1]].append((layer,media,m[2],dict(decls)))
    seen=set()
    for attr in set(re.findall(r'class="([^"]*)"',s)):
        cl=[c for c in attr.split() if c in by]
        for i,a in enumerate(cl):
            for b in cl[i+1:]:
                if (a,b) in seen: continue
                seen.add((a,b))
                for la,ma,sa,da in by[a]:
                    for lb,mb,sb,db in by[b]:
                        if la!=lb or ma!=mb or sa!=sb: continue
                        for p in set(da)&set(db):
                            if da[p]!=db[p]:
                                key=(la,str(ma)[:40],sa,p)
                                report[(a,b,p)]+=1
                                ex.setdefault((a,b,p),(f,la,ma,sa,da[p][:50],db[p][:50]))
print('pages',pages,'conflicting pairs',len(report))
for k,v in list(report.items())[:40]: print(k,v,ex[k])
