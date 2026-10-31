# draw schem/<tag>.json as schem/<tag>.png (1 px = 1 game px, scaled down if huge)
import json, sys
from PIL import Image, ImageDraw
tag = sys.argv[1]
d = json.load(open(f'schem/{tag}.json'))
r = d['room']
W, H = r.get('width', 640), r.get('height', 360)
im = Image.new('RGB', (W, H), (24, 26, 38))
dr = ImageDraw.Draw(im, 'RGBA')
for x in range(0, W, 40): dr.line([(x, 0), (x, H)], fill=(40, 44, 60) if x % 200 else (60, 66, 90))
for y in range(0, H, 40): dr.line([(0, y), (W, y)], fill=(40, 44, 60) if y % 200 else (60, 66, 90))
for f in r.get('flips', []):
    if f.get('w'):
        col = (255, 90, 210, 70) if not f.get('set') else ((255, 150, 60, 80) if f['set'] > 0 else (140, 90, 255, 80))
        dr.rectangle([f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']], fill=col)
for i, p in enumerate(r['platforms']):
    h = p.get('h', 14)
    xs = [p['x']] if not p.get('move') else ([p['move']['min'], p['move']['max']] if p['move']['axis'] == 'x' else [p['x']])
    ys = [p['y']] if not p.get('move') or p['move']['axis'] == 'x' else [p['move']['min'], p['move']['max']]
    for x in xs:
        for y in ys:
            if p.get('solid'):
                dr.rectangle([x, y, x + p['w'], y + h], fill=(120, 110, 160) if not p.get('slick') else (150, 170, 200), outline=(230, 230, 255))
            elif p.get('crumble'):
                dr.rectangle([x, y, x + p['w'], y + h], fill=(200, 150, 90), outline=(255, 220, 160))
            elif p.get('move'):
                dr.rectangle([x, y, x + p['w'], y + h], fill=(90, 200, 160, 160), outline=(180, 255, 220))
            else:
                dr.rectangle([x, y, x + p['w'], y + h], fill=(90, 100, 130), outline=(200, 210, 240))
            if p.get('ice'): dr.line([(x, y), (x + p['w'], y)], fill=(170, 230, 255), width=3)
    if p.get('move'):
        a = p['move']
        if a['axis'] == 'x': dr.line([(a['min'], p['y'] + 7), (a['max'] + p['w'], p['y'] + 7)], fill=(180, 255, 220), width=1)
        else: dr.line([(p['x'] + p['w'] / 2, a['min']), (p['x'] + p['w'] / 2, a['max'] + h)], fill=(180, 255, 220), width=1)
    dr.text((p['x'] + 2, p.get('y', 0) + 1), str(i), fill=(255, 255, 255))
for k, w in enumerate(r.get('walls', [])):
    col = (140, 210, 255, 200) if w.get('glass') else (170, 190, 220) if w.get('slick') else (150, 120, 90)
    dr.rectangle([w['x'], w['y'], w['x'] + w['w'], w['y'] + w['h']], fill=col, outline=(255, 255, 255))
    dr.text((w['x'] + 2, max(0, w['y']) + 2), 'w' + str(k), fill=(0, 0, 0))
for s in r.get('spikes', []):
    if s.get('side'):
        x = s['x'] - 8 if s['side'] == 'left' else s['x']
        dr.rectangle([x, s['y'], x + 8, s['y'] + s['h']], fill=(255, 60, 60))
    elif s.get('down'):
        dr.rectangle([s['x'], s['y'], s['x'] + s['w'], s['y'] + 8], fill=(255, 60, 60))
    else:
        dr.rectangle([s['x'], s['y'] - 8, s['x'] + s['w'], s['y']], fill=(255, 60, 60))
for f in r.get('flips', []):
    if not f.get('w'):
        dr.ellipse([f['x'] - 12, f['y'] - 12, f['x'] + 12, f['y'] + 12], fill=(255, 120, 230), outline=(255, 255, 255))
for s in r.get('springs', []): dr.rectangle([s['x'], s['y'] - 10, s['x'] + 20, s['y']], fill=(255, 200, 60))
for c in r.get('coins', []): dr.ellipse([c[0] - 4, c[1] - 4, c[0] + 4, c[1] + 4], fill=(255, 215, 70))
for p in r.get('powerUps', []):
    col = {'gem': (80, 240, 255), 'life': (255, 100, 140), 'wall': (120, 255, 120), 'dash': (255, 255, 120)}.get(p['type'], (255, 255, 255))
    dr.rectangle([p['x'], p['y'], p['x'] + 20, p['y'] + 20], fill=col, outline=(255, 255, 255))
for e in r.get('enemies', []):
    p = r['platforms'][e['on']]
    y = p['y'] + p.get('h', 14) if e.get('ceil') else p['y'] - 18
    dr.rectangle([p['x'] + e['from'], y, p['x'] + min(e['to'], p['w']), y + 18], outline=(255, 140, 0), width=2)
for b in r.get('bats', []): dr.rectangle([b['x'] - b['ax'], b['y'] - b['ay'], b['x'] + b['ax'] + 24, b['y'] + b['ay'] + 16], outline=(255, 80, 200), width=1)
for t in r.get('turrets', []): dr.rectangle([t['x'], t['y'], t['x'] + 24, t['y'] + 24], fill=(255, 120, 0))
for c in r.get('checkpoints', []):
    y0 = c['y'] if c.get('ceil') else c['y'] - 40
    dr.rectangle([c['x'], y0, c['x'] + 6, y0 + 40], fill=(120, 255, 140))
for s in r.get('signs', []):
    y0 = s['y'] if s.get('ceil') else s['y'] - 20
    dr.rectangle([s['x'], y0, s['x'] + 20, y0 + 20], fill=(200, 160, 100))
for n in r.get('npcs', []): dr.rectangle([n['x'], n['y'] - 30, n['x'] + 26, n['y']], fill=(255, 255, 255))
st = r['start']; dr.rectangle([st['x'], st['y'], st['x'] + 22, st['y'] + 28], outline=(80, 160, 255), width=3)
if r.get('door'):
    dd = r['door']; dr.rectangle([dd['x'], dd['y'], dd['x'] + 26, dd['y'] + 40], fill=(90, 255, 120), outline=(255, 255, 255))
if r.get('keySpot'): k = r['keySpot']; dr.rectangle([k['x'] - 17, k['y'] - 8, k['x'] + 17, k['y'] + 8], fill=(255, 230, 90))
# reached nodes (thin lines for standing ranges, dots for wall clings); orange = upside down
for n in d.get('nodes', []):
    col = (120, 255, 120, 150) if n['g'] > 0 else (255, 170, 60, 170)
    if n['k'] == 's':
        y = n['y'] + 28 if n['g'] > 0 else n['y']
        dr.line([(n['lo'] + 11, y - 2), (n['hi'] + 11, y - 2)], fill=col, width=2)
    else:
        dr.ellipse([n['x'] + 11 - 3, n['y'] + 14 - 3, n['x'] + 11 + 3, n['y'] + 14 + 3], fill=col)
# route
for e in d['path']:
    pts = e['pts']
    for i in range(1, len(pts)):
        a, b = pts[i - 1], pts[i]
        col = (255, 255, 0) if b[2] else ((80, 255, 255) if b[3] > 0 else (255, 120, 255))
        dr.line([(a[0], a[1]), (b[0], b[1])], fill=col, width=2)
    if pts: dr.ellipse([pts[-1][0] - 3, pts[-1][1] - 3, pts[-1][0] + 3, pts[-1][1] + 3], fill=(255, 255, 255))
sc = min(1.0, 2400 / W, 1800 / H)
if sc < 1: im = im.resize((int(W * sc), int(H * sc)))
im.save(f'schem/{tag}.png')
print('schem', tag, im.size, 'path edges', len(d['path']), 'err', d['err'])
