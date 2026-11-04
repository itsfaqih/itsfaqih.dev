import re,sys,glob,json,os
def rules(html):
    out=set()
    for b in re.findall(r'<style[^>]*>(.*?)</style>',html,re.S):
        depth=0;i=0;start=0;stack=[]
        for k,ch in enumerate(b):
            if ch=='{': 
                stack.append(b[start:k].strip()); start=k+1
            elif ch=='}':
                body=b[start:k].strip()
                if body: out.add(' > '.join(stack)+' {'+body+'}')
                stack.pop(); start=k+1
            elif ch==';' and not stack: start=k+1
    return out
d=sys.argv[1]
res={}
for f in sorted(glob.glob(d+'/**/*.html',recursive=True)):
    if f.endswith('lab.html'): continue
    res[os.path.relpath(f,d)]=sorted(rules(open(f).read()))
json.dump(res,open(sys.argv[2],'w'))
print({k:len(v) for k,v in list(res.items())[:4]})
