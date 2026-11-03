import sys,glob,numpy as np
from PIL import Image
from scipy import ndimage
# line width ≈ 2*median of distance-transform maxima on ridge
def width_px(a):
    d=ndimage.distance_transform_edt(a)
    ridge=(d==ndimage.maximum_filter(d,size=3))&(d>0)
    return 2*np.median(d[ridge])
b=sys.argv[1]; maxw,maxh=7*72,9.4*72
ws=[];dp=[]
for f in sorted(glob.glob(f'{b}/art/d*.png'))[:: int(sys.argv[2]) if len(sys.argv)>2 else 1]:
    im=Image.open(f); a=np.array(im.convert('L'))<128; iw,ih=im.size; s=min(maxw/iw,maxh/ih) # pt per px
    ws.append(width_px(a)*s); dp.append(72/s)
print(b,'line pt median %.2f min %.2f max %.2f | eff dpi median %.0f min %.0f'%(np.median(ws),min(ws),max(ws),np.median(dp),min(dp)))
