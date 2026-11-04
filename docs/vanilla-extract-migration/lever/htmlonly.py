import os,re,sys,difflib
a,b=sys.argv[1:3]
OLD=re.compile(r'var themes\s*=\s*\{"light":\["light"\],"dark":\["dark"\]\};\s*doc\.classList\.remove\.apply\(doc\.classList,themes\.light\.concat\(themes\.dark\)\);\s*doc\.classList\.add\.apply\(doc\.classList,themes\[theme\]\);')
def norm(s):
    s=re.sub(r'<link rel="modulepreload"[^>]*>','',s)
    s=re.sub(r'\.[\w-]{8}\.(js|css)',r'.\1',s)
    return s
bad=0;n=0
for d,_,fs in os.walk(a):
    for f in fs:
        if not f.endswith('.html'): continue
        r=os.path.relpath(os.path.join(d,f),a); n+=1
        x,y=norm(open(os.path.join(a,r)).read()),norm(open(os.path.join(b,r)).read())
        if x==y: continue
        i=next((k for k,(p,q) in enumerate(zip(x,y)) if p!=q),min(len(x),len(y)))
        j=0
        while x[-1-j]==y[-1-j]: j+=1
        print(r,'A:',repr(x[i-20:len(x)-j+10])[:260]); print(' B:',repr(y[i-20:len(y)-j+10])[:200]); bad+=1
print('pages',n,'differing',bad)
