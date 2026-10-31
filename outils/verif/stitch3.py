import json, sys
from PIL import Image
meta = json.load(open('pv/meta.json'))
for m in meta:
    k = None
    for s in m['shots']:
        im = Image.open(s['f']).convert('RGB')
        if k is None:
            k = im.width / 640
            P = Image.new('RGB', (int(m['w'] * k), int(m['h'] * k)))
        P.paste(im, (int(s['cx'] * k), int(s['cy'] * k)))
    # keep the panorama a sensible size for viewing
    scale = min(1.0, 2400 / P.width, 2000 / P.height)
    P = P.resize((int(P.width * scale), int(P.height * scale)))
    P.save(f"pv/{m['tag']}.png")
    print(m['tag'], P.size)
