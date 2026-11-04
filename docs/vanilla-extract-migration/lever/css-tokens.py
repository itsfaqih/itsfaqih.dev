import os,re,sys,collections as C
def css(root):
    out=[]
    for d,_,fs in os.walk(root):
        for f in fs:
            if f.endswith('.html'):
                s=open(os.path.join(d,f),errors='ignore').read()
                out+=re.findall(r'<style[^>]*>(.*?)</style>',s,re.S)
    return '\n'.join(out)
def inv(s):
    props=C.Counter(re.findall(r'[{;]\s*(-{0,2}[a-zA-Z][\w-]*)\s*:',s))
    props={k:v for k,v in props.items() if not k.startswith('--')}
    fn=C.Counter(re.findall(r'[\s:,(]([a-z-]+)\(',s))
    at=C.Counter(re.findall(r'@([a-z-]+)',s))
    sup=C.Counter(re.findall(r'@supports\s*([^{]+)\{',s))
    vp=C.Counter(re.findall(r':(-webkit-[\w-]+|-moz-[\w-]+|-ms-[\w-]+)',s))
    vals=C.Counter(re.findall(r':\s*(-webkit-[\w-]+|-moz-[\w-]+)',s))
    return dict(props=props,fn=fn,at=at,sup=sup,vp=vp,vals=vals)
a,b=inv(css(sys.argv[1])),inv(css(sys.argv[2]))
for k in a:
    print('==',k)
    keys=set(a[k])|set(b[k])
    rows=[(x,a[k].get(x,0),b[k].get(x,0)) for x in sorted(keys)]
    if k in('props','fn'):
        rows=[r for r in rows if r[0].startswith('-') or (r[1]>0)!=(r[2]>0)]
    for r in rows: print(f'  {r[0][:60]:60} {r[1]:6} {r[2]:6}')
