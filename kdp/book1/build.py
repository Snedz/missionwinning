from gen import *
N=48; TITLE="Optical Illusion Coloring Book for Adults"; SUB="48 Mind-Bending Op Art Patterns: Warped Grids, Tunnels, Spirals & 3D Illusions"
AUTH="Mission Winning"
c=canvas.Canvas("interior.pdf",pagesize=(W,H)); c.setTitle(TITLE); c.setAuthor(AUTH)
pg=[0]
def nxt(): c.showPage(); pg[0]+=1
def ctext(t,yy,f="Helvetica-Bold",sz=24,odd=True):
    off=0 if odd else 0.125*inch; c.setFont(f,sz); c.drawCentredString(off+4.25*inch,yy,t)
# p1 title (recto)
ctext(TITLE,7.4*inch,sz=26); ctext(SUB.split(':')[0],6.9*inch,"Helvetica",16); ctext(SUB.split(':')[1].strip(),6.6*inch,"Helvetica",13); ctext(AUTH,5.6*inch,"Helvetica",14); nxt()
# p2 copyright (verso)
c.setFont("Helvetica",9)
for i,l in enumerate(["Copyright (c) 2026 Mission Winning. All rights reserved.","No part of this book may be reproduced without permission, except for personal coloring use.","Designs are original, generated with custom code.","Tip: place a sheet of card behind the page when using markers to prevent bleed-through."]):
    c.drawString(0.125*inch+0.9*inch,2.2*inch-i*14,l)
nxt()
# p3 color test page
b=frame_box(c,True); ctext("Color Test Page",b[1]+b[3]-0.5*inch,sz=20)
for i in range(5):
    for j in range(6): c.setLineWidth(1.6); c.rect(b[0]+0.4*inch+i*1.25*inch,b[1]+0.6*inch+j*1.25*inch,1.0*inch,1.0*inch)
nxt(); nxt()  # p4 blank
for k in range(N):
    b=frame_box(c,True); art(c,b,k*7+k//10)
    c.setFont("Helvetica",8); c.drawCentredString(b[0]+b[2]/2,b[1]-14,f"{k+1}. {NAMES[(k*7+k//10)%10]}")
    nxt(); nxt()
# closing page + back
ctext("Thank you for coloring!",6*inch,sz=20); ctext("If you enjoyed this book, a short review helps a lot.",5.6*inch,"Helvetica",12); nxt(); nxt()
c.save(); print("pages",pg[0])
