import sys,glob,os,subprocess
from PIL import Image
b=sys.argv[1]; os.makedirs(f'{b}/art300',exist_ok=True); BW,BH=2100,2520
for f in sorted(glob.glob(f'{b}/art/d*.png')):
    im=Image.open(f).convert('1'); iw,ih=im.size; n=os.path.basename(f)
    im.save('/tmp/v_%s.pbm'%b)
    opt=['-W',f'{BW}pt'] if iw/ih>BW/BH else ['-H',f'{BH}pt']
    subprocess.run(['potrace','-b','pgm',*opt,'-t','10','-O','0.4','/tmp/v_%s.pbm'%b,'-o','/tmp/v_%s.pgm'%b],check=True)
    g=Image.open('/tmp/v_%s.pgm'%b).point(lambda v:255 if v>127 else 0).convert('1')
    g.save(f'{b}/art300/{n}',dpi=(300,300))
print(b,len(glob.glob(f'{b}/art300/*')))
