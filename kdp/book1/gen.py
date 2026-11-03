import math, random
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
W,H=8.625*inch,11.25*inch
M=0.75*inch  # art inset from trim
LW=1.6
def frame_box(c,odd):
    # trim area: x from 0 (inside edge, no bleed on inside) for right pages.. KDP: bleed only on outside/top/bottom
    x0=(0 if odd else 0.125*inch)+M; y0=0.125*inch+M
    return x0,y0,8.5*inch-2*M,11*inch-2*M
def poly(c,pts,close=False):
    p=c.beginPath(); p.moveTo(*pts[0])
    for q in pts[1:]: p.lineTo(*q)
    if close: p.close()
    c.drawPath(p,stroke=1,fill=0)
# ---- designs: each draws inside box (x,y,w,h) with clip; lines extend past frame so regions close on frame
def warped_grid(c,b,r):
    x,y,w,h=b; n=r.randint(14,24); cx,cy=x+w*r.uniform(.3,.7),y+h*r.uniform(.3,.7); k=r.uniform(.6,1.0)
    R=max(w,h)*0.55
    def f(px,py):
        dx,dy=px-cx,py-cy; d=math.hypot(dx,dy); s=1+k*math.exp(-(d/R)**2)
        return cx+dx*s,cy+dy*s
    st=max(w,h)/n
    for i in range(-n,2*n):
        poly(c,[f(x+i*st,y-h+j*h/60*3) for j in range(61)])
        poly(c,[f(x-w+j*w/60*3,y+i*st) for j in range(61)])
def wave_lines(c,b,r):
    x,y,w,h=b; n=r.randint(26,40); a=r.uniform(8,22); fr=r.uniform(1.5,4); ph=r.uniform(0,6)
    for i in range(-2,n+3):
        yy=y+i*h/n
        poly(c,[(x-10+j*(w+20)/120, yy+a*math.sin(fr*2*math.pi*j/120+ph+i*0.25)) for j in range(121)])
    m=r.randint(4,8)
    for i in range(1,m): xx=x+i*w/m; c.line(xx,y,xx,y+h)
def moire_circles(c,b,r):
    x,y,w,h=b; st=r.uniform(26,36); D=math.hypot(w,h)
    for _ in range(r.choice([2,3])):
        cx,cy=x+w*r.uniform(.2,.8),y+h*r.uniform(.2,.8); k=st
        while k<D: c.circle(cx,cy,k,stroke=1,fill=0); k+=st
def polar_web(c,b,r):
    x,y,w,h=b; cx,cy=x+w/2,y+h/2; sp=r.choice([20,24,28]); tw=r.uniform(-1.2,1.2); D=math.hypot(w,h)
    for i in range(sp):
        a0=2*math.pi*i/sp; poly(c,[(cx+t*math.cos(a0+tw*t/D*3),cy+t*math.sin(a0+tw*t/D*3)) for t in [D*j/80 for j in range(81)]])
    g=r.uniform(1.14,1.22); k=36
    while k<D: c.circle(cx,cy,k,stroke=1,fill=0); k*=g
    c.setFillGray(1); c.circle(cx,cy,36,stroke=1,fill=1)
def tumbling_blocks(c,b,r):
    x,y,w,h=b; s=r.uniform(26,40); hx=s*math.sqrt(3)
    for row in range(-1,int(h/(1.5*s))+3):
        for col in range(-1,int(w/hx)+3):
            cx=x+col*hx+(hx/2 if row%2 else 0); cy=y+row*1.5*s
            hexp=[(cx+s*math.cos(math.pi/6+k*math.pi/3),cy+s*math.sin(math.pi/6+k*math.pi/3)) for k in range(6)]
            poly(c,hexp,True)
            for k in (1,3,5): c.line(cx,cy,*hexp[k])
def square_spiral(c,b,r):
    x,y,w,h=b; cols=r.choice([2,3]); rows=r.choice([3,4]); cw,ch=w/cols,h/rows; rot=r.uniform(7,11)*r.choice([-1,1])
    for i in range(cols):
        for j in range(rows):
            cx,cy=x+cw*(i+.5),y+ch*(j+.5); s=min(cw,ch)*0.5*1.4142; a=0
            c.saveState(); cp=c.beginPath(); cp.rect(x+cw*i,y+ch*j,cw,ch); c.clipPath(cp,stroke=0,fill=0)
            if (i+j)%2: rr=-rot
            else: rr=rot
            it=0
            while s>14 and it<14:
                it+=1
                pts=[(cx+s*math.cos(math.radians(a+45+90*k)),cy+s*math.sin(math.radians(a+45+90*k))) for k in range(4)]
                poly(c,pts,True); a+=rr; s*=1/(math.cos(math.radians(abs(rr)))+math.sin(math.radians(abs(rr))))
            c.restoreState(); c.rect(x+cw*i,y+ch*j,cw,ch,stroke=1,fill=0)
def checker_sphere(c,b,r):
    x,y,w,h=b; cx,cy=x+w/2,y+h/2; R=min(w,h)*r.uniform(.3,.42); n=r.randint(14,22)
    st=max(w,h)/n
    for i in range(-n,2*n):
        c.line(x+i*st,y-h,x+i*st,y+2*h); c.line(x-w,y+i*st,x+2*w,y+i*st)
    c.saveState(); c.setFillGray(1); c.circle(cx,cy,R,stroke=1,fill=1)
    p=c.beginPath(); p.circle(cx,cy,R); c.clipPath(p,stroke=0,fill=0)
    m=r.randint(8,14)
    for i in range(-m,m+1):
        u=i/m
        phi=u*math.pi/2; poly(c,[(cx+R*math.sin(phi)*math.cos(t), cy+R*math.sin(t)) for t in [ -math.pi/2+math.pi*j/60 for j in range(61)]])
        poly(c,[(cx+R*math.cos(t)*math.cos(math.asin(u)), cy+R*u) for t in [math.pi*j/30 for j in range(61)]])
    c.restoreState()
def interlace_circles(c,b,r):
    x,y,w,h=b; R=r.uniform(40,70); st=R*r.choice([1.0,1.2,1.414])
    for i in range(-1,int(w/st)+3):
        for j in range(-1,int(h/st)+3):
            c.circle(x+i*st,y+j*st,R,stroke=1,fill=0)
            if r.random()<0.0: pass
    for i in range(-1,int(w/st)+3):
        for j in range(-1,int(h/st)+3):
            c.circle(x+(i+.5)*st,y+(j+.5)*st,R*0.5,stroke=1,fill=0)
def tunnel(c,b,r):
    x,y,w,h=b; cx,cy=x+w*r.uniform(.35,.65),y+h*r.uniform(.35,.65); n=r.randint(18,30); g=r.uniform(.86,.9); rot=r.uniform(-6,6)
    s=max(w,h); a=0; sides=r.choice([4,6,8,3])
    while s>30:
        poly(c,[(cx+s*math.cos(math.radians(a+360*k/sides)),cy+s*math.sin(math.radians(a+360*k/sides))) for k in range(sides)],True)
        s*=g; a+=rot
    for k in range(sides*2):
        t=2*math.pi*k/(sides*2); c.line(cx,cy,cx+2*max(w,h)*math.cos(t),cy+2*max(w,h)*math.sin(t))
    c.setFillGray(1); poly2=[(cx+s/g*math.cos(math.radians(a-rot+360*k/sides)),cy+s/g*math.sin(math.radians(a-rot+360*k/sides))) for k in range(sides)]
    p=c.beginPath(); p.moveTo(*poly2[0]); [p.lineTo(*q) for q in poly2[1:]]; p.close(); c.drawPath(p,stroke=1,fill=1)
def ribbons(c,b,r):
    x,y,w,h=b; n=r.randint(10,16); fr=r.uniform(1,2.5)
    for i in range(-3,n+4):
        base=x+i*w/n
        for off in (0,w/n*0.5):
            poly(c,[(base+off+w/n*1.2*math.sin(2*math.pi*fr*j/120+i*.4), y-10+j*(h+20)/120) for j in range(121)])
    for i in range(1,r.randint(5,9)): yy=y+i*h/8; c.line(x,yy,x+w,yy)
D=[warped_grid,wave_lines,moire_circles,polar_web,tumbling_blocks,square_spiral,checker_sphere,interlace_circles,tunnel,ribbons]
NAMES=["Bulging Grid","Wave Field","Moire Rings","Twisting Web","Tumbling Blocks","Square Vortex","Sphere on Checks","Interlocked Circles","Infinite Tunnel","Ribbon Weave"]
def art(c,b,seed):
    r=random.Random(seed); d=D[seed%len(D)]
    x,y,w,h=b; c.saveState(); c.setLineWidth(LW); c.setLineJoin(1); c.setLineCap(1)
    p=c.beginPath(); p.rect(x,y,w,h); c.clipPath(p,stroke=0,fill=0)
    d(c,b,r); c.restoreState(); c.setLineWidth(3); c.rect(x,y,w,h,stroke=1,fill=0)
