import sys,glob,os,numpy as np
from PIL import Image,ImageFilter
from scipy import ndimage
book,thick,reject=sys.argv[1],int(sys.argv[2]),set(sys.argv[3].split(',')) if len(sys.argv)>3 else set()
os.makedirs(f'{book}/art',exist_ok=True); n=0
for f in sorted(glob.glob(f'{book}/raw/s*.jpg')):
    s=os.path.basename(f)[1:3]; g=np.array(Image.open(f).convert('L')); H,W=g.shape
    def cut(prof,lo,hi):
        z=prof[lo:hi]; best=(z.min(),0,lo)
        idx=[i for i in range(len(z)) if z[i]<=z.min()+1]
        # longest run of near-min
        runs=[];st=idx[0];pv=idx[0]
        for i in idx[1:]:
            if i!=pv+1: runs.append((st,pv)); st=i
            pv=i
        runs.append((st,pv)); a,b=max(runs,key=lambda r:r[1]-r[0]); return lo+(a+b)//2
    D=g<170; ry=cut(D.sum(1),H*35//100,H*65//100)
    cx=[cut(D[:ry].sum(0),W*35//100,W*65//100),cut(D[ry:].sum(0),W*35//100,W*65//100)]
    for t,(r,c) in enumerate([(0,0),(0,1),(1,0),(1,1)]):
        if f'{s}-{t}' in reject: continue
        ys_=(4,ry-2) if r==0 else (ry+2,H-4); xs_=(4,cx[r]-2) if c==0 else (cx[r]+2,W-4); tile=g[ys_[0]:ys_[1],xs_[0]:xs_[1]]
        b=tile<170; lab,k=ndimage.label(b)
        edge=set(np.unique(np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])))-{0}
        hh,ww=tile.shape
        for e in edge:
            m=lab==e; ys,xs=np.where(m)
            near=((ys<18)|(ys>hh-19)|(xs<18)|(xs>ww-19)).mean()
            if near>0.6 or m.sum()<0.04*b.sum(): tile=np.where(m,255,tile)
        b=tile<170
        L=ndimage.binary_opening(b,structure=np.ones((int(0.55*b.shape[0]),1)))|ndimage.binary_opening(b,structure=np.ones((1,int(0.55*b.shape[1]))))
        if L.any(): tile=np.where(ndimage.binary_dilation(L,iterations=2),255,tile)
        b=tile<170; lab,k=ndimage.label(b)
        for sl_i,sl in enumerate(ndimage.find_objects(lab)):
            h_=sl[0].stop-sl[0].start; w_=sl[1].stop-sl[1].start
            if (h_<14 and w_>0.4*tile.shape[1]) or (w_<14 and h_>0.4*tile.shape[0]): tile=np.where(lab==sl_i+1,255,tile)
            elif h_>0.85*tile.shape[0] and w_>0.85*tile.shape[1] and (lab==sl_i+1).sum()<0.25*b.sum(): tile=np.where(lab==sl_i+1,255,tile)
        b=tile<170; ys,xs=np.where(b)
        # drop tiny specks
        lab,k=ndimage.label(b); sz=ndimage.sum(b,lab,range(1,k+1))
        for i,z in enumerate(sz):
            if z<6: tile=np.where(lab==i+1,255,tile)
        y0,y1,x0,x1=ys.min(),ys.max(),xs.min(),xs.max()
        crop=tile[max(0,y0-6):y1+7,max(0,x0-6):x1+7]
        im=Image.fromarray(crop).resize((crop.shape[1]*5,crop.shape[0]*5),Image.BICUBIC).filter(ImageFilter.GaussianBlur(2))
        a=np.array(im)<150
        if thick: a=ndimage.binary_dilation(a,iterations=thick)
        out=Image.fromarray(np.where(a,0,255).astype('uint8')).convert('1')
        n+=1; out.save(f'{book}/art/d{n:02d}.png')
print(book,n)
