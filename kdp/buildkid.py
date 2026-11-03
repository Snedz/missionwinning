import sys,glob,json
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.utils import ImageReader
from PIL import Image,ImageFilter,ImageEnhance
cfg=json.load(open(sys.argv[1])); B=cfg['dir']; arts=sorted(glob.glob(f'{B}/art300/d*.png')); labels=cfg.get('labels',[]); assert not labels or len(labels)==len(arts),(len(labels),len(arts))
W,H=8.5*inch,11*inch; c=canvas.Canvas(f'{B}/interior.pdf',pagesize=(W,H)); c.setTitle(cfg['title']); c.setAuthor('Mission Winning')
def cs(t,y,f='Helvetica-Bold',s=24): c.setFont(f,s); c.drawCentredString(W/2,y,t)
# p1 belongs-to
cs(cfg['title'],8.2*inch,s=26); cs(cfg['sub1'],7.7*inch,'Helvetica',15)
c.setLineWidth(3); c.roundRect(1.25*inch,3.2*inch,6*inch,3.2*inch,30)
cs('This book belongs to:',5.6*inch,s=28); c.setLineWidth(2); c.line(2*inch,4.1*inch,6.5*inch,4.1*inch); c.showPage()
# p2 copyright
c.setFont('Helvetica',9)
for i,l in enumerate(['Copyright (c) 2026 Mission Winning. All rights reserved.','No part of this book may be reproduced without permission, except for personal coloring use.','Every picture is printed on one side only. Tip: slip a sheet of card behind the page when using markers.']):
    c.drawString(1*inch,2*inch-i*14,l)
c.showPage()
for i,a in enumerate(arts):
    im=Image.open(a); iw,ih=im.size; dw,dh=iw/300*inch,ih/300*inch  # exact 300 dpi
    top=H-0.75*inch; x=(W-dw)/2; y=top-dh if not labels else max(1.9*inch,top-dh)
    if not labels: y=(H-dh)/2
    c.drawImage(ImageReader(im.convert('L')),x,y,dw,dh)
    if labels:
        t=labels[i]
        if cfg.get('outline_labels'):
            to=c.beginText(); to.setTextRenderMode(1); c.setLineWidth(1.8); to.setFont('Helvetica-Bold',48)
            tw=c.stringWidth(t,'Helvetica-Bold',48); to.setTextOrigin((W-tw)/2,0.95*inch); to.textLine(t); c.drawText(to)
        else:
            c.setFont('Helvetica-Bold',30); c.drawCentredString(W/2,1.0*inch,t)
    c.showPage(); c.showPage()
cs('Great job, artist!',6*inch,s=26); cs('You colored the whole book.',5.5*inch,'Helvetica',16); c.showPage(); c.showPage()
c.save(); P=2+2*len(arts)+2; print('pages',P)
# cover
sp=P*0.002252*inch; bl=0.125*inch; CW=2*bl+2*W+sp; CH=H+2*bl
c=canvas.Canvas(f'{B}/cover.pdf',pagesize=(CW,CH)); fx=bl+W+sp; fw=W+bl
art=Image.open(cfg.get('cover_up',f'{B}/cover_art.jpg')).convert('RGB'); aw,ah=art.size
# upscale for print
tw=int(fw/inch*300); th=int(CH/inch*300); sc=max(tw/aw,th/ah)
big=art.resize((int(aw*sc),int(ah*sc)),Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,80,2))
l=(big.width-tw)//2; big=big.crop((l,0,l+tw,th)); big.save(f'{B}/cover_front_300dpi.jpg',quality=92)
c.drawImage(f'{B}/cover_front_300dpi.jpg',fx,0,fw,CH)
col=cfg['color']
def panel(x,y,w,h,fill=(1,1,1)):
    c.setFillColorRGB(*fill); c.setStrokeColorRGB(0,0,0); c.setLineWidth(4); c.roundRect(x,y,w,h,24,stroke=1,fill=1)
px,py,pw,ph=cfg.get('panel',[0.55,7.55,7.4,2.95]); panel(fx+px*inch,bl+py*inch,pw*inch,ph*inch,col)
c.setFillColorRGB(1,1,1); cx=fx+W/2
for i,(t,s) in enumerate(cfg['front']):
    c.setFont('Helvetica-Bold',s); c.drawCentredString(cx,bl+9.75*inch-i*0.62*inch,t)
c.setFillColorRGB(1,1,1); c.roundRect(fx+2.6*inch,bl+0.45*inch,3.3*inch,0.55*inch,12,stroke=1,fill=1)
c.setFillColorRGB(0,0,0); c.setFont('Helvetica-Bold',15); c.drawCentredString(cx,bl+0.63*inch,'MISSION WINNING')
# spine
c.setFillColorRGB(*col); c.rect(bl+W,0,sp,CH,stroke=0,fill=1)
# back: solid color + sample thumbnails + text
c.setFillColorRGB(*col); c.rect(0,0,bl+W,CH,stroke=0,fill=1)
panel(bl+0.6*inch,bl+5.3*inch,7.3*inch,5.1*inch)
c.setFillColorRGB(0,0,0); c.setFont('Helvetica-Bold',22); c.drawCentredString(bl+W/2,bl+9.75*inch,cfg['back_head'])
c.setFont('Helvetica',12.5)
for i,t in enumerate(cfg['back']): c.drawString(bl+0.95*inch,bl+9.2*inch-i*0.36*inch,t)
for j,k in enumerate(cfg['thumbs']):
    x=bl+0.6*inch+j*2.5*inch; y=bl+2.0*inch
    c.setFillColorRGB(1,1,1); c.setLineWidth(3); c.roundRect(x,y,2.2*inch,2.9*inch,14,stroke=1,fill=1)
    im=Image.open(arts[k]).convert('L'); iw,ih=im.size; s=min(1.9*inch/iw,2.6*inch/ih)
    c.drawImage(ImageReader(im),x+(2.2*inch-iw*s)/2,y+(2.9*inch-ih*s)/2,iw*s,ih*s)
# barcode area stays white
c.setFillColorRGB(1,1,1); c.rect(bl+W-0.25*inch-2.0*inch,bl+0.25*inch,2.0*inch,1.2*inch,stroke=0,fill=1)
c.save(); print('cover',round(CW/inch,4),round(CH/inch,4),'spine',round(sp/inch,4))
