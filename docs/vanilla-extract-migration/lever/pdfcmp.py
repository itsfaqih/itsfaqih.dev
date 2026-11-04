import glob,os,sys
from PIL import Image, ImageChops
O=sys.argv[1]
for b in sorted(glob.glob(O+'/*.B-*.png')):
    n=b.replace('.B-','.N-')
    A=Image.open(b).convert('RGB');C=Image.open(n).convert('RGB')
    print(os.path.basename(b),A.size,C.size,ImageChops.difference(A,C).getbbox())
