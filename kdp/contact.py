import sys,glob
from PIL import Image,ImageDraw
b=sys.argv[1]; fs=sorted(glob.glob(f'{b}/art300/d*.png')); cols=8; S=260
rows=(len(fs)+cols-1)//cols; sheet=Image.new('L',(cols*S,rows*S),255); d=ImageDraw.Draw(sheet)
for i,f in enumerate(fs):
    im=Image.open(f).convert('L'); im.thumbnail((S-20,S-30)); sheet.paste(im,((i%cols)*S+10,(i//cols)*S+20)); d.text(((i%cols)*S+4,(i//cols)*S+2),f[-7:-4],fill=0)
sheet.save(f'{b}/contact_sheet.png')
