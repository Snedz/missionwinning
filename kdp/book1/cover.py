from gen import *
import random
P=102; sp=P*0.002252*inch; bl=0.125*inch
CW=2*bl+2*8.5*inch+sp; CH=11.25*inch
c=canvas.Canvas("cover.pdf",pagesize=(CW,CH))
fx=bl+8.5*inch+sp  # front panel left at trim
# full-bleed art front & back
for x0,seed in ((0,3),(fx,8)):
    w=8.5*inch+bl if x0==0 else 8.5*inch+bl
    c.saveState(); p=c.beginPath(); p.rect(x0,0,w,CH); c.clipPath(p,stroke=0,fill=0)
    r=random.Random(seed); c.setLineWidth(2.2); c.setStrokeColorRGB(.1,.1,.35)
    c.setFillColorRGB(1,1,1); c.rect(x0,0,w,CH,stroke=0,fill=1)
    if x0==0: D[seed%10](c,(x0,0,w,CH),r)
    else:
        cx0,cy0=x0+w/2,CH*0.36; R=w*0.5; st=w/14
        def f(px,py):
            dx,dy=px-cx0,py-cy0; d=math.hypot(dx,dy); s2=1+0.9*math.exp(-(d/R)**2); return cx0+dx*s2,cy0+dy*s2
        for i in range(-8,24):
            for j in range(-8,30):
                q=[f(x0+i*st,j*st),f(x0+(i+1)*st,j*st),f(x0+(i+1)*st,(j+1)*st),f(x0+i*st,(j+1)*st)]
                if (i+j)%2: c.setFillColorRGB(.08,.08,.3)
                else: c.setFillColorRGB(.2,.75,.95) if (i//3+j//3)%2 else c.setFillColorRGB(.95,.3,.55)
                pp=c.beginPath(); pp.moveTo(*q[0]); [pp.lineTo(*z) for z in q[1:]]; pp.close(); c.drawPath(pp,stroke=0,fill=1)
    c.restoreState()
# front title panel
c.setFillColorRGB(0.98,0.85,0.1); c.setStrokeColorRGB(0,0,0); c.setLineWidth(4)
c.rect(fx+0.6*inch,7.3*inch,7.3*inch,2.9*inch,stroke=1,fill=1)
c.setFillColorRGB(0,0,0); cx=fx+4.25*inch
c.setFont("Helvetica-Bold",40); c.drawCentredString(cx,9.3*inch,"OPTICAL ILLUSION")
c.setFont("Helvetica-Bold",30); c.drawCentredString(cx,8.65*inch,"Coloring Book for Adults")
c.setFont("Helvetica",16); c.drawCentredString(cx,8.05*inch,"48 Mind-Bending Op Art Patterns")
c.drawCentredString(cx,7.6*inch,"Warped Grids - Tunnels - Spirals - 3D Illusions")
c.rect(fx+2.4*inch,0.7*inch,3.7*inch,0.6*inch,stroke=1,fill=0)
c.setFillColorRGB(1,1,1); c.rect(fx+2.4*inch,0.7*inch,3.7*inch,0.6*inch,stroke=1,fill=1)
c.setFillColorRGB(0,0,0); c.setFont("Helvetica-Bold",16); c.drawCentredString(cx,0.9*inch,"MISSION WINNING")
# spine
c.setFillColorRGB(0,0,0); c.rect(bl+8.5*inch,0,sp,CH,stroke=0,fill=1)
c.saveState(); c.translate(bl+8.5*inch+sp/2+3,CH/2); c.rotate(-90); c.setFillColorRGB(1,1,1); c.setFont("Helvetica-Bold",9)
c.drawCentredString(0,0,"OPTICAL ILLUSION COLORING BOOK  -  MISSION WINNING"); c.restoreState()
# back panel text box
c.setFillColorRGB(1,1,1); c.setLineWidth(3); c.rect(bl+0.7*inch,4.6*inch,7.1*inch,5.4*inch,stroke=1,fill=1)
c.setFillColorRGB(0,0,0); c.setFont("Helvetica-Bold",22); c.drawCentredString(bl+4.25*inch,9.3*inch,"Trick your eyes. Calm your mind.")
lines=["48 original op art designs that seem to bulge, twist, spin and","pop off the page as you color them.","","- 48 single-sided designs (no bleed-through onto other art)","- Large 8.5 x 11 inch pages","- Bulging grids, spheres, tunnels, moire rings, tumbling blocks","- Bold, clean lines with closed shapes - great with pencils or markers","- A color test page to try your palette first","","Alternate two colors in neighboring shapes and watch the illusion appear."]
c.setFont("Helvetica",13)
for i,l in enumerate(lines): c.drawString(bl+1.0*inch,8.6*inch-i*0.36*inch,l)
# barcode zone (left blank white, KDP places barcode)
c.setFillColorRGB(1,1,1); c.rect(bl+8.5*inch-0.25*inch-2.0*inch,bl+0.25*inch,2.0*inch,1.2*inch,stroke=0,fill=1)
c.save(); print(CW/inch,CH/inch,sp/inch)
