import re,sys,os,hashlib
d=sys.argv[1]
for r,_,fs in os.walk(d):
  for f in fs:
    if f.endswith('.html'):
      s=open(os.path.join(r,f)).read()
      st=re.findall(r'<style[^>]*>(.*?)</style>',s,flags=re.S)
      print(os.path.relpath(os.path.join(r,f),d),[ (len(x),hashlib.md5(x.encode()).hexdigest()[:6]) for x in st])
