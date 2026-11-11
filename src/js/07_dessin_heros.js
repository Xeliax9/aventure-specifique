// =====================================================================
//  DRAW HELPERS
// =====================================================================
function fmt(ms){
  if(ms == null) return '--:--.--';
  const cs = Math.floor(ms / 10) % 100, s = Math.floor(ms / 1000), m = Math.floor(s / 60);
  return m + ':' + String(s % 60).padStart(2,'0') + '.' + String(cs).padStart(2,'0');
}
function rr(x, y, w, h, r){
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
function star(x, y, r, rot){
  ctx.beginPath();
  for(let i = 0; i < 8; i++){
    const a = rot + i * Math.PI / 4, rad = i % 2 ? r * 0.38 : r;
    ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath(); ctx.fill();
}
function txt(text, x, y, size, color, weight=600, align='center', fam=FU){
  ctx.font = `${weight} ${size}px ${fam}`;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color; ctx.fillText(text, x, y);
}
function outlined(text, x, y, size, fill, stroke=HERO.deep, lw=5, fam=FD, weight=400, align='center'){
  ctx.font = `${weight} ${size}px ${fam}`;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round'; ctx.lineWidth = lw; ctx.strokeStyle = stroke;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fill; ctx.fillText(text, x, y);
}
// digits drawn on a fixed grid so the timer never jitters
function monoText(str, xRight, y, adv){
  ctx.textAlign = 'center';
  let x = xRight - str.length * adv;
  for(const ch of str){ ctx.fillText(ch, x + adv / 2, y); x += ch === ':' || ch === '.' ? adv : adv; }
}
function smoothStroke(pts){
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for(let i = 1; i < pts.length - 1; i++){
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const l = pts[pts.length - 1];
  ctx.lineTo(l[0], l[1]);
  ctx.stroke();
}
function heartIcon(x, y, s, fill, outline){
  ctx.beginPath();
  ctx.moveTo(x, y + s * 0.3);
  ctx.bezierCurveTo(x, y, x - s * 0.5, y - s * 0.02, x - s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x - s * 0.5, y + s * 0.58, x - s * 0.12, y + s * 0.74, x, y + s * 0.95);
  ctx.bezierCurveTo(x + s * 0.12, y + s * 0.74, x + s * 0.5, y + s * 0.58, x + s * 0.5, y + s * 0.3);
  ctx.bezierCurveTo(x + s * 0.5, y - s * 0.02, x, y, x, y + s * 0.3);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if(outline){ ctx.strokeStyle = outline; ctx.lineWidth = 1.2; ctx.stroke(); }
}
function gemIcon(x, y, s, color, outline='#1d4f66'){
  ctx.beginPath();
  ctx.moveTo(x - s * 0.8, y - s * 0.25); ctx.lineTo(x - s * 0.4, y - s * 0.8); ctx.lineTo(x + s * 0.4, y - s * 0.8);
  ctx.lineTo(x + s * 0.8, y - s * 0.25); ctx.lineTo(x, y + s); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  ctx.strokeStyle = outline; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath(); ctx.moveTo(x - s * 0.4, y - s * 0.8); ctx.lineTo(x, y - s * 0.25); ctx.lineTo(x - s * 0.8, y - s * 0.25); ctx.closePath(); ctx.fill();
}
function coinIcon(x, y, r, spin=1){
  const w = Math.max(1, r * Math.abs(spin));
  ctx.fillStyle = '#b07a00'; ctx.beginPath(); ctx.ellipse(x + 0.7, y + 0.4, w, r, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffcc33'; ctx.beginPath(); ctx.ellipse(x, y, w, r, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#8a5a00'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.ellipse(x, y, w * 0.58, r * 0.62, 0, 0, TAU); ctx.fill();
}

// =====================================================================
//  DRAW: HERO
// =====================================================================
const HB = { a:14.2, b:7.7, cy:-19.3 };   // body half-width, half-height, centre above the feet
let heroFill = HERO.body;

function bodyPath(cx, cy, a, b, wob, t){
  ctx.beginPath();
  const N = 30;
  for(let i = 0; i <= N; i++){
    const th = (i / N) * TAU;
    const c = Math.cos(th), s = Math.sin(th);
    const px = Math.sign(c) * Math.pow(Math.abs(c), 0.78);
    const py = Math.sign(s) * Math.pow(Math.abs(s), 0.78);
    const j = 1 + wob * 0.11 * Math.cos(2 * th) + 0.018 * Math.sin(3 * th + t * 0.07);
    const X = cx + px * a * j;
    const Y = cy + py * b * (2 - j) * (s > 0 ? 0.96 : 1) - (s < 0 && c < -0.2 ? 0.6 * -s : 0);
    if(i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
  }
  ctx.closePath();
}

function limb(ax, ay, L, len, kind, thick, side=1){
  const n = 8, pts = [[ax, ay]];
  let x = ax, y = ay;
  for(let i = 1; i <= n; i++){
    const t = i / n;
    const ang = L.a + L.c * t + Math.sin(L.ph - t * 3.2) * L.amp * t;
    if(kind === 'arm'){ x += side * Math.cos(ang) * len / n; y += Math.sin(ang) * len / n; }
    else { x += Math.sin(ang) * len / n; y += Math.cos(ang) * len / n; }
    pts.push([x, y]);
  }
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = HERO.deep; ctx.lineWidth = thick + 1.8; smoothStroke(pts);
  ctx.strokeStyle = heroFill; ctx.lineWidth = thick; smoothStroke(pts);
  const p1 = pts[n - 1], p2 = pts[n];
  return {x:p2[0], y:p2[1], ang:Math.atan2(p2[1] - p1[1], p2[0] - p1[0])};
}

function drawMouth(a, by){
  const f = a.curFace;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = HERO.line; ctx.lineWidth = 1.15;
  if(f === 'open'){
    const mouthPath = () => {
      ctx.beginPath();
      ctx.moveTo(-10.2, by - 1.6);
      ctx.bezierCurveTo(-7, by + 8.4, 7, by + 8.8, 10.6, by - 0.6);
      ctx.quadraticCurveTo(0, by + 1.8, -10.2, by - 1.6);
      ctx.closePath();
    };
    mouthPath();
    ctx.fillStyle = HERO.mouth; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = HERO.tongue; ctx.beginPath(); ctx.ellipse(1, by + 6.4, 4.4, 2.6, 0, 0, TAU); ctx.fill();
    ctx.restore();
    // v54 : retracer la bouche avant le contour (sinon on cernait la langue : un rond « oh » qui dépassait sous le sourire)
    mouthPath(); ctx.stroke();
  } else if(f === 'o'){
    ctx.beginPath(); ctx.ellipse(1.5, by + 2.6, 2.4, 3, 0, 0, TAU);
    ctx.fillStyle = HERO.mouth; ctx.fill(); ctx.stroke();
  } else if(f === 'ko'){
    ctx.beginPath(); ctx.moveTo(-8, by + 2.6);
    for(let i = 1; i <= 8; i++) ctx.lineTo(-8 + i * 2, by + 2.6 + (i % 2 ? -1.1 : 1.1));
    ctx.stroke();
    ctx.fillStyle = HERO.tongue; ctx.beginPath(); ctx.ellipse(3.5, by + 5.2, 2.2, 2.8, 0.3, 0, TAU); ctx.fill(); ctx.stroke();
  } else if(f === 'hurt'){
    ctx.beginPath(); ctx.moveTo(-7, by + 2.4);
    for(let i = 1; i <= 6; i++) ctx.lineTo(-7 + i * 2.4, by + 2.4 + (i % 2 ? -1.4 : 1.4));
    ctx.stroke();
  } else if(f === 'sad'){
    ctx.beginPath(); ctx.moveTo(-7.5, by + 4.6); ctx.bezierCurveTo(-4, by + 0.6, 4, by + 0.6, 7.8, by + 4.8); ctx.stroke();
  } else {
    // the wide grin from the drawing, with its little cheek dimples
    ctx.beginPath(); ctx.moveTo(-11.2, by - 2.0); ctx.bezierCurveTo(-8, by + 7.4, 7.6, by + 7.8, 11.4, by - 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12.6, by - 3.6); ctx.quadraticCurveTo(-11.0, by - 2.4, -11.4, by - 0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(12.7, by - 2.4); ctx.quadraticCurveTo(11.2, by - 1.0, 11.8, by + 1.0); ctx.stroke();
  }
}

function drawEyes(a, by){
  const E = [{x:-3.6, y:by - 5.0, rx:4.2, ry:5.9}, {x:4.0, y:by - 5.6, rx:4.1, ry:6.3}];
  for(let i = 0; i < 2; i++){
    const e = E[i], p = a.eyes[i];
    let open = 1;
    const bp = a.blinkP - i * 0.15;
    if(a.blinkP > 0 && bp > 0 && bp < 1) open = 1 - Math.sin(Math.PI * bp) * 0.92;
    if(a.curFace === 'hurt') open = Math.min(open, 0.35);
    if(a.lid > 0.01) open = Math.min(open, 1 - a.lid * 0.93);
    if(a.wink && i === 1){
      // a wink: one happy closed eye
      ctx.beginPath(); ctx.ellipse(e.x, e.y, e.rx, e.ry, 0, 0, TAU); ctx.fillStyle = heroFill; ctx.fill();
      ctx.beginPath(); ctx.arc(e.x, e.y + e.ry * 0.25, e.rx * 0.75, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.strokeStyle = HERO.line; ctx.lineWidth = 1.3; ctx.lineCap = 'round'; ctx.stroke();
      continue;
    }
    if(a.lid > 0.72){
      ctx.beginPath(); ctx.ellipse(e.x, e.y, e.rx, e.ry, 0, 0, TAU);
      ctx.fillStyle = heroFill; ctx.fill(); ctx.strokeStyle = HERO.line; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(e.x, e.y - e.ry * 0.05, e.rx * 0.72, 0.18 * Math.PI, 0.82 * Math.PI);
      ctx.lineWidth = 1.15; ctx.lineCap = 'round'; ctx.stroke();
      continue;
    }
    if(a.curFace === 'ko'){
      // dizzy spirals instead of pupils
      ctx.save(); ctx.translate(e.x, e.y);
      ctx.beginPath(); ctx.ellipse(0, 0, e.rx, e.ry, 0, 0, TAU); ctx.fillStyle = HERO.eye; ctx.fill();
      ctx.strokeStyle = HERO.line; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath();
      for(let k = 0; k <= 22; k++){ const an = k * 0.6 + a.t * 0.25 * (i ? -1 : 1), rr2 = k * 0.17; ctx.lineTo(Math.cos(an) * rr2 * (e.rx / 4), Math.sin(an) * rr2 * (e.ry / 4)); }
      ctx.lineWidth = 0.9; ctx.stroke();
      ctx.restore();
      continue;
    }
    ctx.save();
    ctx.translate(e.x, e.y); ctx.scale(1, open);
    ctx.beginPath(); ctx.ellipse(0, 0, e.rx, e.ry, 0, 0, TAU);
    ctx.fillStyle = HERO.eye; ctx.fill();
    ctx.lineWidth = 1 / Math.max(open, 0.35); ctx.strokeStyle = HERO.line; ctx.stroke();
    if(open > 0.3){
      const px = p.x * (e.rx - 1.9), py = p.y * (e.ry - 2.3);
      ctx.fillStyle = HERO.line;
      ctx.beginPath(); ctx.ellipse(px, py, 1.55, 1.9, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(px - 0.5, py - 0.7, 0.45, 0, TAU); ctx.fill();
    }
    ctx.restore();
    if(a.curFace === 'sad'){
      ctx.beginPath(); ctx.ellipse(e.x, e.y - e.ry * 0.3, e.rx + 0.7, e.ry * 0.72, 0, Math.PI, TAU); ctx.closePath();
      ctx.fillStyle = heroFill; ctx.fill(); ctx.strokeStyle = HERO.line; ctx.lineWidth = 1; ctx.stroke();
    }
  }
}

function drawBlaster(tip, a){
  ctx.save();
  ctx.translate(tip.x, tip.y); ctx.rotate(tip.ang);
  rr(-1.5, -2.4, 7, 4.8, 1.8); ctx.fillStyle = '#ff8a3d'; ctx.fill();
  ctx.strokeStyle = '#5a2008'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#5a2008'; ctx.fillRect(4.5, -1.2, 2.2, 2.4);
  if(a.shootT > 7){
    ctx.fillStyle = 'rgba(255,240,170,0.9)';
    star(9, 0, 4 + (a.shootT - 7) * 0.8, frame * 0.3);
  }
  ctx.restore();
}

function drawHero(a, x, y, sc=1, o={}){
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
  const ap = a.appear < 1 ? Math.max(0.01, easeOutBack(a.appear)) : 1;
  const ex = 1 - easeInCubic(a.exit || 0);
  const s = Math.max(0.01, ap * ex);
  ctx.scale(s, s);
  ctx.scale(a.sx || 1, a.sy || 1);
  ctx.rotate(a.lean + (a.exit || 0) * 0.7);
  const by = HB.cy - a.bob + a.breath * 0.35;
  if(a.spin > 0){
    ctx.translate(0, by);
    ctx.rotate(easeInOutCubic(a.spin) * TAU * (a.fx >= 0 ? 1 : -1));
    ctx.translate(0, -by);
  }
  if(o.rot){
    // lying on the floor (KO): rest the turned body on the ground
    if(o.rest) ctx.translate(0, -by - Math.hypot(HB.a * Math.sin(o.rot), HB.b * Math.cos(o.rot)) * 0.92);
    ctx.translate(0, by); ctx.rotate(o.rot); ctx.translate(0, -by);
  }
  const fx = Math.abs(a.fx) < 0.2 ? 0.2 * (a.fx >= 0 ? 1 : -1) : a.fx;
  ctx.scale(fx, 1);
  // o.skin : dessiner XELIAX dans une autre couleur (aperçu de la boutique), sans changer la sienne
  const sk = o.skin || HERO.skin || {}, keep = o.skin ? [HERO.body, HERO.deep, HERO.light] : null;
  if(o.skin){ HERO.body = sk.body; HERO.deep = sk.deep; HERO.light = sk.light; }
  const plain = !o.tint && !o.flash;
  if(plain && sk.ghost) ctx.globalAlpha *= 0.78;
  // o.tint = silhouette (tout d'une couleur, sans motif ni couleurs d'accessoire) ; o.recolor = seul le corps change
  // de couleur (piment, malade), le motif et l'accessoire de la couleur gardent les leurs
  heroFill = o.flash ? '#ffffff' : (o.tint || o.recolor || HERO.body);
  if(plain && sk.legend) drawLegendBack(sk.pat, by);   // Émeraude, Galaxie : halo (et planète quand elle passe derrière)

  limb(-6, by + 6.2, a.legs[0], 13, 'leg', 3.1);
  limb(6.2, by + 6.2, a.legs[1], 13, 'leg', 3.1);
  limb(-12.2, by + 1.4, a.arms[0], 10, 'arm', 3, -1);
  const tip = limb(12.2, by - 0.8, a.arms[1], 12.5, 'arm', 3, 1);

  bodyPath(0, by, HB.a, HB.b, a.wob, a.t);
  ctx.fillStyle = heroFill; ctx.fill();
  ctx.save();
  ctx.clip();
  if(plain && sk.pat) drawSkinPattern(sk.pat, by, a.t);
  ctx.fillStyle = 'rgba(16,0,60,0.28)';
  ctx.beginPath(); ctx.ellipse(1.5, by + 7.5, HB.a + 2, 5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.ellipse(-7.5, by - 3.4, 4, 1.7, -0.35, 0, TAU); ctx.fill();
  ctx.restore();
  bodyPath(0, by, HB.a, HB.b, a.wob, a.t);
  ctx.strokeStyle = HERO.deep; ctx.lineWidth = 1.7; ctx.stroke();

  drawMouth(a, by);
  drawEyes(a, by);
  if(!o.flash && sk.acc) drawSkinAcc(sk.acc, by, a.t, o.tint, a.wob);
  if(o.bandage){
    // a little plaster after the backflip
    ctx.save(); ctx.translate(7.5, by - 6.8); ctx.rotate(0.55);
    rr(-6, -2.1, 12, 4.2, 1.4); ctx.fillStyle = '#fbe7cf'; ctx.fill(); ctx.strokeStyle = '#b89a80'; ctx.lineWidth = 0.7; ctx.stroke();
    ctx.fillStyle = 'rgba(184,154,128,0.55)'; for(const dx of [-3.6, 3.6]) for(const dy of [-0.8, 0.8]){ ctx.beginPath(); ctx.arc(dx, dy, 0.35, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-1.6, -1.6, 3.2, 3.2);
    ctx.restore();
  }
  if(o.armed && !o.ficelle) drawBlaster(tip, a);
  if(o.phone) drawHandset(tip);
  if(o.ficelle){ const fp = finEatPos(o.eat || 0, tip, by); drawFicelle(fp.x, fp.y, 26, fp.rot, false, 5.5, o.ficelle === true ? false : o.ficelle); }   // o.eat : il l'approche de sa bouche (fin de la saison 1)
  ctx.restore();
  if(keep){ HERO.body = keep[0]; HERO.deep = keep[1]; HERO.light = keep[2]; }
  heroFill = HERO.body;
}

// v54 : les couleurs à acheter ont un motif sur le corps (dessiné dans le corps)...
function drawSkinPattern(pat, by, t){
  ctx.save();
  if(pat === 'pois'){
    ctx.fillStyle = 'rgba(255,250,190,0.6)';
    for(const [x, y, r] of [[-10, -2, 1.7], [-6, 4, 1.4], [9, 3, 1.6], [11, -3, 1.3], [-1, 6, 1.5], [5, 6.5, 1.2], [-12, 4, 1.2]]){ ctx.beginPath(); ctx.arc(x, by + y, r, 0, TAU); ctx.fill(); }
  } else if(pat === 'fleurs'){
    for(const [x, y] of [[-10, 2], [10, 3], [1, 6.5]]){
      ctx.fillStyle = 'rgba(250,240,255,0.75)';
      for(let k = 0; k < 5; k++){ const an = k / 5 * TAU; ctx.beginPath(); ctx.arc(x + Math.cos(an) * 1.5, by + y + Math.sin(an) * 1.5, 1.05, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#ffd54a'; ctx.beginPath(); ctx.arc(x, by + y, 0.8, 0, TAU); ctx.fill();
    }
  } else if(pat === 'rayures'){
    ctx.strokeStyle = 'rgba(255,240,235,0.6)'; ctx.lineWidth = 1.7;
    for(const y of [0.5, 4.2, 7.9]){ ctx.beginPath(); ctx.moveTo(-16, by + y); ctx.quadraticCurveTo(0, by + y + 1.2, 16, by + y); ctx.stroke(); }
  } else if(pat === 'brume'){
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
    for(const [y, ph] of [[3, 0], [6.5, 2]]){
      ctx.beginPath();
      for(let x = -15; x <= 15; x += 1.5){ const yy = by + y + Math.sin(x * 0.45 + t * 0.08 + ph) * 1.1; if(x === -15) ctx.moveTo(x, yy); else ctx.lineTo(x, yy); }
      ctx.stroke();
    }
  } else if(pat === 'ninja'){
    // le bandeau rouge, au niveau des yeux (on le voit de chaque côté)
    ctx.fillStyle = '#d0202e'; ctx.fillRect(-16, by - 6.2, 32, 3.6);
    ctx.fillStyle = 'rgba(255,140,140,0.5)'; ctx.fillRect(-16, by - 6.2, 32, 0.9);
    ctx.fillStyle = 'rgba(70,0,10,0.55)'; ctx.fillRect(-16, by - 3.3, 32, 0.7);
  } else if(pat === 'fissures'){
    const glow = 0.55 + 0.35 * Math.sin(t * 0.09);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    // un trait large et pâle (la lueur) puis un trait fin et vif
    for(const [lw, al] of [[3.6, 0.28 * glow], [1.6, 0.35 + glow * 0.65]]){
      ctx.strokeStyle = `rgba(255,150,60,${al})`; ctx.lineWidth = lw;
      for(const line of [[[-14, -1], [-10, 1], [-8, -2], [-5, 2]], [[4, 5], [7, 1.5], [10, 3.5], [14, 0]], [[-5, 8], [-2, 5], [1, 8]]]){
        ctx.beginPath(); line.forEach(([x, y], k) => k ? ctx.lineTo(x, by + y) : ctx.moveTo(x, by + y)); ctx.stroke();
      }
    }
  } else if(pat === 'or') shineGold(by);
  else if(pat === 'cristal') shineCrystal(by);
  else if(pat === 'gemme') shineEmerald(by);
  else if(pat === 'cosmos') shineGalaxy(by);
  ctx.restore();
}

// v54 : Or et Cristal scintillent. Horloge = frame + ALPHA (60 pas par seconde, lissée entre deux pas) :
// même vitesse à 60 et à 240 Hz. Rien que des formes simples avec globalAlpha ; les deux dégradés sont gardés en cache.
const shineT = () => REDUCED ? 0 : frame + ALPHA;
let shineCache = null;
function shineGrads(){
  if(shineCache) return shineCache;
  const band = ctx.createLinearGradient(-5, 0, 5, 0);
  band.addColorStop(0, 'rgba(255,246,190,0)'); band.addColorStop(0.5, 'rgba(255,252,225,0.95)'); band.addColorStop(1, 'rgba(255,246,190,0)');
  const prism = ctx.createLinearGradient(-6, 0, 6, 0);
  ['#ff6a9a', '#ffb84a', '#fff27a', '#7affa8', '#6ad8ff', '#b48aff'].forEach((c, i) => prism.addColorStop(i / 5, c));
  return shineCache = {band, prism};
}
// une étincelle à quatre branches
function glint(x, y, r){
  const q = r * 0.2;
  ctx.beginPath(); ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + q, y - q, x + r, y); ctx.quadraticCurveTo(x + q, y + q, x, y + r);
  ctx.quadraticCurveTo(x - q, y + q, x - r, y); ctx.quadraticCurveTo(x - q, y - q, x, y - r); ctx.fill();
}
// 0 la plupart du temps, puis une bosse douce (0 → 1 → 0) pendant la part « on » de chaque période
function twinkle(T, period, on, off = 0){ const u = ((T + off) % period) / period; return u < on ? Math.sin(Math.PI * u / on) : 0; }
// Or (dans le corps) : une bande de lumière passe en biais toutes les 2,5 s, et des paillettes s'allument
function shineGold(by){
  const T = shineT(), ga = ctx.globalAlpha;
  // un reflet de métal poli, fixe, qui respire un peu
  ctx.fillStyle = '#ffe9a0'; ctx.globalAlpha = ga * (0.3 + 0.1 * Math.sin(T * 0.05));
  ctx.beginPath(); ctx.ellipse(-3, by - 3.6, 9, 2.4, -0.12, 0, TAU); ctx.fill();
  const u = (T % 150) / 42;
  if(u < 1 && !REDUCED){
    ctx.save(); ctx.translate(-26 + u * 52, by); ctx.transform(1, 0, -0.5, 1, 0, 0); ctx.scale(1.3, 1);
    ctx.fillStyle = shineGrads().band; ctx.globalAlpha = ga; ctx.fillRect(-5, -12, 10, 24);
    ctx.translate(-8, 0); ctx.scale(0.35, 1); ctx.globalAlpha = ga * 0.6; ctx.fillRect(-5, -12, 10, 24);
    ctx.restore();
  }
  ctx.fillStyle = '#fffbe0';
  for(const [x, y, p, o] of [[-10, 2, 97, 0], [9, 4.5, 113, 40], [-2, 6, 131, 80], [5, -1, 89, 25]]){
    const s = twinkle(T, p, 0.32, o);
    if(s > 0.02){ ctx.globalAlpha = ga * s; glint(x, by + y, 2.8 * s); }
  }
  ctx.globalAlpha = ga;
}
// Cristal (dans le corps) : des facettes qui brillent tour à tour, un éclat blanc aux sommets, un reflet d'arc-en-ciel
const CRYSTAL_V = [[-14, -1], [-7, -7.5], [-5, 3], [-11, 8], [2, 9], [6, 1], [14, -3], [14, 5], [8, 9]];
const CRYSTAL_F = [[0, 1, 2], [0, 2, 3], [2, 3, 4], [2, 5, 4], [5, 6, 7], [5, 7, 8], [5, 8, 4]];
const CRYSTAL_GLINT = [1, 5, 3, 6, 2, 8];
function shineCrystal(by){
  const T = shineT(), ga = ctx.globalAlpha, V = CRYSTAL_V;
  ctx.save(); ctx.translate(0, by);
  CRYSTAL_F.forEach((f, i) => {
    const c = Math.cos(T * 0.03 - i * 0.9), lit = c > 0 ? c * c * c * c * c * c : 0;
    ctx.globalAlpha = ga * (0.08 + 0.5 * lit);
    ctx.fillStyle = i % 2 ? '#9fe6ff' : '#effcff';
    ctx.beginPath(); ctx.moveTo(V[f[0]][0], V[f[0]][1]); ctx.lineTo(V[f[1]][0], V[f[1]][1]); ctx.lineTo(V[f[2]][0], V[f[2]][1]); ctx.closePath(); ctx.fill();
  });
  // les arêtes, fines et claires
  ctx.globalAlpha = ga * 0.4; ctx.strokeStyle = '#e4fbff'; ctx.lineWidth = 0.6; ctx.lineJoin = 'round';
  ctx.beginPath();
  for(const f of CRYSTAL_F){ ctx.moveTo(V[f[0]][0], V[f[0]][1]); ctx.lineTo(V[f[1]][0], V[f[1]][1]); ctx.lineTo(V[f[2]][0], V[f[2]][1]); ctx.closePath(); }
  ctx.stroke();
  // reflet prismatique : une fine bande arc-en-ciel qui glisse de temps en temps
  const u = (T % 200) / 70;
  if(u < 1 && !REDUCED){
    ctx.save(); ctx.translate(-22 + u * 44, 0); ctx.transform(1, 0, -0.6, 1, 0, 0); ctx.scale(0.55, 1);
    ctx.globalAlpha = ga * 0.38 * Math.sin(Math.PI * u); ctx.fillStyle = shineGrads().prism; ctx.fillRect(-6, -12, 12, 24);
    ctx.restore();
  }
  // un éclat blanc saute d'un sommet à l'autre
  const k = Math.floor(T / 26) % CRYSTAL_GLINT.length, s = Math.sin(Math.PI * (T % 26) / 26), [gx, gy] = V[CRYSTAL_GLINT[k]];
  ctx.globalAlpha = ga * s; ctx.fillStyle = '#ffffff'; glint(gx, gy, 3 * s);
  ctx.restore();
}
// ... et autour du corps (pas dans la silhouette) : quelques étincelles qui apparaissent çà et là puis s'éteignent
const SHINE_PRISM = ['#ff9ad0', '#fff08a', '#8af0ff'];
function shineAround(kind, by){
  if(REDUCED) return;
  const T = shineT(), ga = ctx.globalAlpha, gold = kind === 'or';
  const n = gold ? 3 : 2;
  for(let i = 0; i < n; i++){
    const P = (gold ? 74 : 58) + i * 17, o = i * 31, s = twinkle(T, P, 0.45, o);
    if(s < 0.02) continue;
    const c = Math.floor((T + o) / P) * 7 + i * 101, an = hash(c) * TAU, d = 3 + hash(c + 1) * 5;
    const x = Math.cos(an) * (HB.a + d), y = by - 2 + Math.sin(an) * (HB.b + d + 2);
    ctx.globalAlpha = ga * s;
    if(gold){ ctx.fillStyle = '#ffd84a'; glint(x, y, 3.4 * s); ctx.fillStyle = '#ffffff'; glint(x, y, 1.6 * s); }
    else { ctx.fillStyle = '#e6faff'; glint(x, y, 2.8 * s); }
  }
  // Cristal : de temps en temps, un minuscule éclat coloré (rose, jaune ou bleu)
  if(!gold){
    const P = 90, s = twinkle(T, P, 0.3, 45);
    if(s > 0.02){
      const c = Math.floor((T + 45) / P), an = hash(c * 13 + 5) * TAU;
      ctx.globalAlpha = ga * s * 0.9; ctx.fillStyle = SHINE_PRISM[c % 3];
      glint(Math.cos(an) * (HB.a + 4), by - 2 + Math.sin(an) * (HB.b + 6), 2.2 * s);
    }
  }
  ctx.globalAlpha = ga;
}
// un point du bord du corps (même calcul que bodyPath), pour y poser un accessoire
function bodyEdge(th, by, wob, t){
  const c = Math.cos(th), s = Math.sin(th);
  const j = 1 + wob * 0.11 * Math.cos(2 * th) + 0.018 * Math.sin(3 * th + t * 0.07);
  return [Math.sign(c) * Math.pow(Math.abs(c), 0.78) * HB.a * j,
    by + Math.sign(s) * Math.pow(Math.abs(s), 0.78) * HB.b * (2 - j) * (s > 0 ? 0.96 : 1) - (s < 0 && c < -0.2 ? 0.6 * -s : 0)];
}
// les flammes de Lave : deux de chaque côté, en miroir (centrées sur XELIAX quel que soit son sens), posées sur le bord
const LAVA_FLAMES = [[0.78 - Math.PI, 1, 0, -0.12], [-0.78, 1, 1.7, 0.12], [0.37 - Math.PI, 0.8, 3.1, -0.38], [-0.37, 0.8, 4.4, 0.38]];
// ... et un accessoire (en ombre si XELIAX est dessiné en silhouette)
function drawSkinAcc(acc, by, t, tint, wob = 0){
  if(acc === 'or' || acc === 'cristal'){ if(!tint) shineAround(acc, by); return; }
  if(acc === 'gemme' || acc === 'cosmos'){ drawLegendAcc(acc, by, t, tint, wob); return; }
  ctx.save();
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const col = c => tint || c;
  if(acc === 'noeud'){
    // le nœud du bandeau, à l'arrière, et ses deux pans qui flottent au vent
    const kx = -14.2, ky = by - 4.4;
    for(const [len, ph, dy] of [[11, 0, -1], [9, 1.3, 1.6]]){
      ctx.strokeStyle = col('#b0141f'); ctx.lineWidth = 2.1;
      ctx.beginPath(); ctx.moveTo(kx, ky);
      ctx.quadraticCurveTo(kx - len * 0.5, ky + dy + Math.sin(t * 0.18 + ph) * 2.2, kx - len, ky + dy * 2 + 2 + Math.sin(t * 0.18 + ph + 1.2) * 2.6);
      ctx.stroke();
    }
    ctx.fillStyle = col('#d0202e'); ctx.beginPath(); ctx.ellipse(kx, ky, 2.2, 1.9, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = col('#5a0610'); ctx.lineWidth = 0.7; ctx.stroke();
  } else if(acc === 'feuille'){
    ctx.strokeStyle = col('#5a3a1a'); ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-9, by - 6.5); ctx.quadraticCurveTo(-10, by - 9.5, -11.5, by - 11); ctx.stroke();
    ctx.save(); ctx.translate(-14.5, by - 12); ctx.rotate(-0.5 + Math.sin(t * 0.05) * 0.12);
    ctx.fillStyle = col('#4cbf3a'); ctx.beginPath(); ctx.ellipse(0, 0, 4.6, 2.1, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = col('#1f5a14'); ctx.lineWidth = 0.8; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-3.6, 0); ctx.lineTo(3.6, 0); ctx.stroke();
    ctx.restore();
  } else if(acc === 'beret'){
    ctx.save(); ctx.translate(-6.5, by - 10.8); ctx.rotate(-0.28);
    ctx.fillStyle = col('#4a2a8a'); ctx.beginPath(); ctx.ellipse(0, 0, 8.6, 3.3, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = col('#1e0f40'); ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = col('#6c46c0'); ctx.beginPath(); ctx.ellipse(-2, -1.1, 4.5, 1.2, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = col('#1e0f40'); ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(0.5, -3.2); ctx.lineTo(1.2, -5.4); ctx.stroke();
    ctx.restore();
  } else if(acc === 'etoile'){
    ctx.save(); ctx.translate(-11.5, by - 7.5); ctx.rotate(-0.3 + Math.sin(t * 0.04) * 0.08);
    ctx.beginPath();
    for(let k = 0; k < 10; k++){ const an = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 2 : 4.8; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
    ctx.closePath(); ctx.fillStyle = col('#ff9a4a'); ctx.fill(); ctx.strokeStyle = col('#8a3a10'); ctx.lineWidth = 0.9; ctx.stroke();
    if(!tint){ ctx.fillStyle = 'rgba(255,240,200,0.9)'; for(let k = 0; k < 5; k++){ const an = -Math.PI / 2 + k * TAU / 5; ctx.beginPath(); ctx.arc(Math.cos(an) * 2.6, Math.sin(an) * 2.6, 0.5, 0, TAU); ctx.fill(); } }
    ctx.restore();
  } else if(acc === 'follet'){
    const fx = -15 + Math.sin(t * 0.04) * 2, fy = by - 15 + Math.sin(t * 0.07) * 2;
    if(!tint){ const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 8); g.addColorStop(0, 'rgba(170,230,255,0.6)'); g.addColorStop(1, 'rgba(170,230,255,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, 8, 0, TAU); ctx.fill(); }
    const fl = Math.sin(t * 0.3) * 0.6;
    ctx.fillStyle = col('#bfeaff'); ctx.beginPath(); ctx.moveTo(fx, fy - 5 - fl); ctx.quadraticCurveTo(fx + 3.4, fy, fx, fy + 3); ctx.quadraticCurveTo(fx - 3.4, fy, fx, fy - 5 - fl); ctx.fill();
    if(!tint){ ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(fx, fy + 0.6, 1.3, 0, TAU); ctx.fill(); }
  } else if(acc === 'flammes'){
    for(const [th, s, ph, tilt] of LAVA_FLAMES){
      const [x, y] = bodyEdge(th, by, wob, t);
      const h = (5.4 + Math.sin(t * 0.35 + ph) * 1.1) * s;
      ctx.save(); ctx.translate(x, y + 1.3); ctx.rotate(tilt + Math.sin(t * 0.2 + ph) * 0.06);
      // base arrondie, enfoncée dans le corps : la flamme sort du bord au lieu d'être posée à côté
      ctx.fillStyle = col('#ff6a2a'); ctx.beginPath(); ctx.moveTo(-2.3 * s, 0); ctx.quadraticCurveTo(-2.1 * s, -h * 0.6, 0, -h); ctx.quadraticCurveTo(2.1 * s, -h * 0.6, 2.3 * s, 0); ctx.quadraticCurveTo(0, 1.6 * s, -2.3 * s, 0); ctx.closePath(); ctx.fill();
      if(!tint){ ctx.fillStyle = '#ffd54a'; ctx.beginPath(); ctx.moveTo(-1.1 * s, 0); ctx.quadraticCurveTo(0, -h * 0.6, 1.1 * s, 0); ctx.quadraticCurveTo(0, 0.9 * s, -1.1 * s, 0); ctx.closePath(); ctx.fill(); }
      if(!tint && lavaGlowRec){ const m = ctx.getTransform(), py = -h * 0.4; lavaGlow.push(m.c * py + m.e, m.d * py + m.f, Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)), ctx.globalAlpha); }
      ctx.restore();
    }
  }
  ctx.restore();
}

// =====================================================================
//  v54 : Émeraude et Galaxie, les deux couleurs LÉGENDAIRES (sk.legend)
//  Même horloge que l'Or et le Cristal (shineT : 60 pas par seconde, lissée → même vitesse à 60 et à 240 Hz).
//  Tout ce qui est dégradé ou plein de détails (facettes, nébuleuse, poussière d'étoiles, halos) est dessiné UNE
//  seule fois dans de petites images hors écran (legendTex), puis simplement recopié (drawImage) à chaque image.
// =====================================================================
const LEGEND_K = 12;   // 12 pixels d'image par pixel du jeu : net même en très gros dans la boutique
const legendCache = {};
function legendTex(id, w, h, draw){
  let c = legendCache[id];
  if(c) return c;
  c = document.createElement('canvas'); c.width = Math.ceil(w * LEGEND_K); c.height = Math.ceil(h * LEGEND_K);
  const g = c.getContext('2d'); g.scale(LEGEND_K, LEGEND_K); draw(g, w, h);
  return legendCache[id] = c;
}
const rgbaOf = (hex, a) => { const [r, g, b] = hexRGB(hex); return `rgba(${r},${g},${b},${a})`; };
// un halo rond et doux (8 × 8), à étirer où l'on veut
function legendHalo(col){
  return legendTex('halo' + col, 8, 8, g => {
    const gr = g.createRadialGradient(4, 4, 0, 4, 4, 4);
    gr.addColorStop(0, rgbaOf(col, 1)); gr.addColorStop(0.4, rgbaOf(col, 0.4)); gr.addColorStop(1, rgbaOf(col, 0));
    g.fillStyle = gr; g.fillRect(0, 0, 8, 8);
  });
}
// une bande de lumière (reflet) et une queue d'étoile filante
const legendBand = () => legendTex('band', 10, 24, g => {
  const gr = g.createLinearGradient(0, 0, 10, 0);
  gr.addColorStop(0, 'rgba(220,255,235,0)'); gr.addColorStop(0.5, 'rgba(240,255,245,0.95)'); gr.addColorStop(1, 'rgba(220,255,235,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 10, 24);
});
const legendStreak = () => legendTex('streak', 12, 2, g => {
  const gr = g.createLinearGradient(0, 0, 12, 0);
  gr.addColorStop(0, 'rgba(255,200,250,0)'); gr.addColorStop(0.7, 'rgba(255,230,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,1)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, 1); g.lineTo(12, 0.25); g.lineTo(12, 1.75); g.closePath(); g.fill();
});

// --- Émeraude : une taille « émeraude » (octogones emboîtés), éclairée d'en haut à gauche
function emeraldFacets(){
  return legendTex('emeraude', 36, 22, g => {
    g.translate(18, 11);
    const oct = s => { const rx = 15.5 * s, ry = 9 * s, cx = rx * 0.32, cy = ry * 0.42;
      return [[-rx + cx, -ry], [rx - cx, -ry], [rx, -ry + cy], [rx, ry - cy], [rx - cx, ry], [-rx + cx, ry], [-rx, ry - cy], [-rx, -ry + cy]]; };
    const R = [oct(1.15), oct(0.8), oct(0.56), oct(0.33)];
    const poly = P => { g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); };
    for(let r = 0; r < 3; r++) for(let i = 0; i < 8; i++){
      const A = R[r], B = R[r + 1], j = (i + 1) % 8;
      const mx = (A[i][0] + A[j][0]) / 2, my = (A[i][1] + A[j][1]) * 0.85, L = Math.hypot(mx, my) || 1;
      const lit = clamp(0.5 + 0.5 * (-0.55 * mx - 0.85 * my) / L, 0, 1);   // facette tournée vers la lumière = claire
      g.fillStyle = mixHex('#013a1c', '#6dffb0', clamp(lit * 0.82 + [0, 0.1, 0.04][r], 0, 1));
      poly([A[i], A[j], B[j], B[i]]); g.fill();
    }
    // la table (le plat du milieu) : un vert profond qui s'éclaire en haut
    const tg = g.createLinearGradient(-5, -3, 5, 3);
    tg.addColorStop(0, '#46f095'); tg.addColorStop(0.5, '#0fa452'); tg.addColorStop(1, '#055a2c');
    g.fillStyle = tg; poly(R[3]); g.fill();
    // les arêtes, fines et claires
    g.strokeStyle = 'rgba(205,255,228,0.5)'; g.lineWidth = 0.32; g.lineJoin = 'round';
    for(const P of R){ poly(P); g.stroke(); }
    g.beginPath(); for(let i = 0; i < 8; i++){ g.moveTo(R[0][i][0], R[0][i][1]); g.lineTo(R[3][i][0], R[3][i][1]); } g.stroke();
  });
}
const EMERALD_GLINT = [[-8.6, -5.9, 101, 0], [11.4, -2.4, 83, 30], [-4.3, 3.2, 127, 64], [6.4, 5.2, 109, 15], [0.5, -2.8, 139, 90]];
function shineEmerald(by){
  const T = shineT(), ga = ctx.globalAlpha;
  ctx.drawImage(emeraldFacets(), -18, by - 11, 36, 22);
  // le cœur de la pierre respire : une lueur claire au milieu
  ctx.globalAlpha = ga * (0.3 + 0.3 * Math.sin(T * 0.05));
  ctx.drawImage(legendHalo('#c8ffdc'), -9, by - 5, 18, 11);
  // un reflet glisse en biais sur les facettes (toutes les 3 s)
  const u = (T % 180) / 48;
  if(u < 1 && !REDUCED){
    ctx.save(); ctx.translate(-24 + u * 48, by); ctx.transform(1, 0, -0.6, 1, 0, 0);
    ctx.globalAlpha = ga * 0.75 * Math.sin(Math.PI * u); ctx.drawImage(legendBand(), -4, -12, 8, 24);
    ctx.restore();
  }
  // des éclats blancs s'allument aux coins des facettes
  ctx.fillStyle = '#f0fff6';
  for(const [x, y, p, o] of EMERALD_GLINT){
    const s = twinkle(T, p, 0.3, o);
    if(s > 0.02){ ctx.globalAlpha = ga * s; glint(x, by + y, 3 * s); }
  }
  ctx.globalAlpha = ga;
}

// --- Galaxie : une nébuleuse qui se répète tous les 40 px (pour dériver sans couture) + de la poussière d'étoiles
function galaxyNebula(){
  return legendTex('galaxie', 40, 22, g => {
    g.fillStyle = '#140a40'; g.fillRect(0, 0, 40, 22);
    g.globalCompositeOperation = 'lighter';
    for(const [x, y, r, col, a] of [[6, 8, 10, '#7a3cff', 0.95], [17, 14, 8, '#ff3fbf', 0.85], [27, 7, 9, '#3f7bff', 0.9], [34, 15, 8, '#c04cff', 0.8],
      [12, 4, 5, '#56e0ff', 0.6], [22, 18, 6, '#ff8ad8', 0.55], [2, 17, 6, '#4a5dff', 0.65], [31, 2, 5, '#ff6ae0', 0.5], [20, 10, 3, '#ffd0f4', 0.45]]){
      for(const dx of [-40, 0, 40]){
        const gr = g.createRadialGradient(x + dx, y, 0, x + dx, y, r);
        gr.addColorStop(0, rgbaOf(col, a)); gr.addColorStop(0.5, rgbaOf(col, a * 0.35)); gr.addColorStop(1, rgbaOf(col, 0));
        g.fillStyle = gr; g.fillRect(x + dx - r, y - r, r * 2, r * 2);
      }
    }
    g.globalCompositeOperation = 'source-over';
    let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    for(let i = 0; i < 80; i++){
      const x = rnd() * 40, y = rnd() * 22, r = 0.1 + rnd() * rnd() * 0.42;
      g.fillStyle = `rgba(255,${230 + (rnd() * 25 | 0)},255,${(0.3 + rnd() * 0.65).toFixed(2)})`;
      for(const dx of [-40, 0, 40]){ g.beginPath(); g.arc(x + dx, y, r, 0, TAU); g.fill(); }
    }
  });
}
const GALAXY_STARS = [[-10, -1, 80, 0, 1.9], [8, 3, 95, 2, 2.2], [-3, 5.5, 70, 4, 1.5], [12, -2, 110, 1, 1.6], [3, -3.5, 88, 3, 1.4], [-7, 6, 101, 5, 1.3]];
function shineGalaxy(by){
  const T = shineT(), ga = ctx.globalAlpha, neb = galaxyNebula();
  const off = (T * 0.025) % 40;   // la nébuleuse dérive lentement (1,5 px par seconde)
  ctx.drawImage(neb, -20 - off, by - 11, 40, 22); ctx.drawImage(neb, 20 - off, by - 11, 40, 22);
  // des étoiles qui scintillent (fixes : la nébuleuse passe derrière)
  ctx.fillStyle = '#ffffff';
  for(const [x, y, p, o, r] of GALAXY_STARS){
    const s = 0.3 + 0.7 * Math.max(0, Math.sin(T * TAU / p + o));
    ctx.globalAlpha = ga * s; glint(x, by + y, r * (0.55 + 0.45 * s));
  }
  // de temps en temps (toutes les 4 s), une étoile filante traverse le corps
  const u = (T % 240) / 34;
  if(u < 1 && !REDUCED){
    const c = Math.floor(T / 240), y0 = -5 + hash(c * 3 + 1) * 6, sl = 0.12 + hash(c * 3 + 2) * 0.2;
    ctx.save(); ctx.translate(-17 + u * 36, by + y0 + u * 36 * sl); ctx.rotate(Math.atan(sl));
    ctx.globalAlpha = ga * Math.sin(Math.PI * u); ctx.drawImage(legendStreak(), -12, -1, 12, 2); glint(0, 0, 1.6);
    ctx.restore();
  }
  ctx.globalAlpha = ga;
}
// la petite planète à anneau qui tourne autour de XELIAX (front = la moitié devant lui)
function galaxyPlanet(by, T, front, tint){
  const an = T * 0.032, s = Math.sin(an);   // un tour en un peu plus de 3 s
  if(!tint && (s > 0) !== front) return;
  const ga = ctx.globalAlpha;
  ctx.save(); ctx.translate(0, by - 1); ctx.rotate(-0.2);
  if(!tint){
    ctx.globalAlpha = ga * 0.32; ctx.strokeStyle = '#e8d2ff'; ctx.lineWidth = 0.5;   // le chemin de l'orbite, à peine visible
    ctx.beginPath(); ctx.ellipse(0, 0, 21, 5.5, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); ctx.stroke();
  }
  const k = 0.82 + 0.18 * s;   // devant = un peu plus grosse
  ctx.translate(Math.cos(an) * 21, s * 5.5); ctx.scale(k, k);
  if(!tint){ ctx.globalAlpha = ga * 0.7; ctx.drawImage(legendHalo('#ffb8f0'), -5.5, -5.5, 11, 11); }
  ctx.globalAlpha = ga; ctx.rotate(0.2);
  ctx.lineWidth = 0.75; ctx.strokeStyle = tint || '#ffd9f6';
  ctx.beginPath(); ctx.ellipse(0, 0, 4.2, 1.3, -0.35, Math.PI, TAU); ctx.stroke();       // l'anneau, derrière
  ctx.fillStyle = tint || '#6fc8ff'; ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, TAU); ctx.fill();
  if(!tint){ ctx.fillStyle = '#3b55d8'; ctx.beginPath(); ctx.arc(0.6, 0.5, 1.7, -0.3, Math.PI * 0.9); ctx.fill();
    ctx.fillStyle = '#e8f8ff'; ctx.beginPath(); ctx.arc(-0.8, -0.8, 0.55, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.ellipse(0, 0, 4.2, 1.3, -0.35, 0, Math.PI); ctx.stroke();           // l'anneau, devant
  ctx.restore();
}
// derrière le corps : un halo qui pulse (et la planète quand elle passe derrière)
function drawLegendBack(pat, by){
  const T = shineT(), ga = ctx.globalAlpha;
  if(pat === 'gemme'){
    ctx.globalAlpha = ga * (0.42 + 0.14 * Math.sin(T * 0.05)); ctx.drawImage(legendHalo('#3dff8e'), -30, by - 24, 60, 44);
  } else {
    ctx.globalAlpha = ga * (0.45 + 0.1 * Math.sin(T * 0.04)); ctx.drawImage(legendHalo('#9a5cff'), -30, by - 24, 60, 44);
    ctx.globalAlpha = ga; galaxyPlanet(by, T, false);
  }
  ctx.globalAlpha = ga;
}
// trois cristaux d'émeraude qui poussent à l'arrière de la tête : [angle sur le bord, hauteur, demi-largeur]
const EMERALD_SHARDS = [[0.12 - Math.PI, 4.4, 1.5], [0.42 - Math.PI, 7.2, 1.9], [0.72 - Math.PI, 5, 1.5]];
function drawLegendAcc(acc, by, t, tint, wob){
  const T = shineT(), ga = ctx.globalAlpha;
  ctx.save(); ctx.lineJoin = 'round';
  if(acc === 'gemme'){
    for(const [th, h, w] of EMERALD_SHARDS){
      const [x, y] = bodyEdge(th, by, wob, t);
      ctx.save(); ctx.translate(x, y + 1.8); ctx.rotate((th + Math.PI / 2) * 0.7);
      ctx.beginPath(); ctx.moveTo(-w, 0.4); ctx.lineTo(-w, -h * 0.62); ctx.lineTo(0, -h); ctx.lineTo(w, -h * 0.62); ctx.lineTo(w, 0.4); ctx.closePath();
      ctx.fillStyle = tint || '#0c9a4c'; ctx.fill();
      if(!tint){
        ctx.fillStyle = '#5effa8'; ctx.beginPath(); ctx.moveTo(-w, 0.4); ctx.lineTo(-w, -h * 0.62); ctx.lineTo(0, -h); ctx.lineTo(0, 0.4); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#d8ffe9'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(-w * 0.5, -0.2); ctx.lineTo(-w * 0.5, -h * 0.6); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(-w, 0.4); ctx.lineTo(-w, -h * 0.62); ctx.lineTo(0, -h); ctx.lineTo(w, -h * 0.62); ctx.lineTo(w, 0.4);
      ctx.strokeStyle = tint || '#01331a'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.restore();
    }
    if(!tint && !REDUCED){
      // de petits éclats verts s'échappent doucement de la pierre et montent en s'éteignant
      for(let i = 0; i < 4; i++){
        const P = 96, o = i * 24, u = ((T + o) % P) / P, c = Math.floor((T + o) / P) * 4 + i;
        const s = Math.sin(Math.PI * u), x = -13 + hash(c) * 18 + Math.sin(u * 5 + i) * 1.6, y = by - 5 - u * 15;
        ctx.globalAlpha = ga * s; ctx.fillStyle = i % 2 ? '#c4ffdc' : '#4dff98'; glint(x, y, 1 + 1.3 * s);
      }
      // et une étincelle s'allume de temps en temps au bout du grand cristal
      const s = twinkle(T, 130, 0.3, 20);
      if(s > 0.02){ const [x, y] = bodyEdge(EMERALD_SHARDS[1][0], by, wob, t); ctx.globalAlpha = ga * s; ctx.fillStyle = '#ffffff'; glint(x - 3.6, y - 5.4, 3.2 * s); }
    }
  } else {
    galaxyPlanet(by, T, true, tint);
    if(!tint && !REDUCED){
      // deux petites étoiles roses et bleues s'allument autour de lui
      for(let i = 0; i < 2; i++){
        const P = 70 + i * 23, s = twinkle(T, P, 0.5, i * 35);
        if(s < 0.02) continue;
        const c = Math.floor((T + i * 35) / P) * 5 + i * 77, an = hash(c) * TAU, d = 4 + hash(c + 1) * 5;
        ctx.globalAlpha = ga * s; ctx.fillStyle = i ? '#9fd8ff' : '#ffb3f0';
        glint(Math.cos(an) * (HB.a + d), by - 2 + Math.sin(an) * (HB.b + d + 2), 2.4 * s);
      }
    }
  }
  ctx.globalAlpha = ga;
  ctx.restore();
}
// boutique (drawLook) : derrière l'aperçu d'une couleur légendaire, des rayons dorés qui tournent lentement,
// un halo, et l'étiquette « ✦ LÉGENDAIRE ✦ » qui brille
const legendRays = () => legendTex('rays', 40, 40, g => {
  const gr = g.createRadialGradient(20, 20, 2, 20, 20, 20);
  gr.addColorStop(0, 'rgba(255,226,120,0.9)'); gr.addColorStop(0.45, 'rgba(255,200,80,0.35)'); gr.addColorStop(1, 'rgba(255,190,60,0)');
  g.fillStyle = gr; g.beginPath();
  for(let i = 0; i < 14; i++){ const a = i / 14 * TAU, b = a + TAU / 14 * 0.42; g.moveTo(20, 20); g.lineTo(20 + Math.cos(a) * 20, 20 + Math.sin(a) * 20); g.lineTo(20 + Math.cos(b) * 20, 20 + Math.sin(b) * 20); g.closePath(); }
  g.fill();
});
function legendShowcase(px, py){
  const T = shineT(), cy = py - 70;
  ctx.save();
  ctx.globalAlpha = 0.55; ctx.drawImage(legendHalo('#ffd54a'), px - 120, cy - 105, 240, 210);
  ctx.translate(px, cy); ctx.rotate(T * 0.004);
  ctx.globalAlpha = 0.5; ctx.drawImage(legendRays(), -125, -125, 250, 250);
  ctx.rotate(-T * 0.0075); ctx.globalAlpha = 0.25; ctx.drawImage(legendRays(), -95, -95, 190, 190);
  ctx.restore();
  // l'étiquette dorée, avec un reflet qui la traverse
  const lx = px - 58, ly = 84, lw = 116, lh = 22;
  ctx.save();
  rr(lx, ly + 2, lw, lh, 11); ctx.fillStyle = 'rgba(40,20,0,0.35)'; ctx.fill();
  rr(lx, ly, lw, lh, 11); ctx.fillStyle = '#ffcf3a'; ctx.fill(); ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.clip();
  const u = (T % 150) / 50;
  if(u < 1 && !REDUCED){ ctx.globalAlpha = 0.8; ctx.translate(lx - 12 + u * (lw + 24), ly); ctx.transform(1, 0, -0.5, 1, 0, 0); ctx.drawImage(legendBand(), -6, -1, 12, lh + 2); }
  ctx.restore();
  txt('✦ LÉGENDAIRE ✦', px, ly + 15.5, 11.5, '#5a2c00', 800);
  const s = twinkle(T, 110, 0.35, 30);
  if(s > 0.02){ ctx.save(); ctx.globalAlpha = s; ctx.fillStyle = '#ffffff'; glint(lx + lw - 6, ly + 3, 5 * s); ctx.restore(); }
}
// dans la grille des couleurs : un anneau doré, et une étincelle qui en fait le tour
function legendSwatch(sx, sy, j){
  const T = shineT();
  ctx.save();
  ctx.strokeStyle = '#ffd54a'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(sx, sy, 18.4, 0, TAU); ctx.stroke();
  const an = T * 0.045 + j;
  ctx.fillStyle = '#fff6c8'; glint(sx + Math.cos(an) * 18.4, sy + Math.sin(an) * 18.4, 3.4);
  ctx.restore();
}

// v54 : dans les salles sombres, une petite lueur douce autour des flammes de Lave, dessinée PAR-DESSUS l'obscurité.
// drawPlayer note où sont les flammes (en pixels de l'écran) ; à appeler juste après drawLighting.
const lavaGlow = [];
let lavaGlowRec = false;
function drawSkinGlowOver(){
  if(!lavaGlow.length) return;
  const th = theme();
  if(th.dark && state !== 'title'){
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    const fl = 0.85 + 0.15 * Math.sin(frame * 0.21);
    for(let i = 0; i < lavaGlow.length; i += 4){
      const x = lavaGlow[i], y = lavaGlow[i + 1], r = 7 * lavaGlow[i + 2];
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(255,140,50,${0.32 * fl * lavaGlow[i + 3]})`);
      g.addColorStop(1, 'rgba(255,90,30,0)');
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    ctx.restore();
  }
  lavaGlow.length = 0;
}

// a red telephone handset held at the tentacle tip
function drawHandset(tip){
  ctx.save(); ctx.translate(tip.x - 1, tip.y - 2); ctx.rotate(-1.15);
  ctx.lineJoin = 'round';
  ctx.fillStyle = '#e5352f'; ctx.strokeStyle = '#5a0a0e'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.moveTo(-8, -1); ctx.quadraticCurveTo(0, -4.2, 8, -1); ctx.lineTo(8, 1.6); ctx.quadraticCurveTo(0, -1.4, -8, 1.6); ctx.closePath(); ctx.fill(); ctx.stroke();
  rr(-10.5, -1.5, 5.5, 5.5, 2); ctx.fill(); ctx.stroke();
  rr(5, -1.5, 5.5, 5.5, 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(-4, -2.2, 6, 0.9);
  ctx.restore();
}

function drawPlayer(){
  if(player.dead || state === 'title') return;
  const x = ix(player) + player.w/2, y = iy(player) + player.h;
  drawHeroTrail(x, iy(player) + player.h / 2 + 2);
  // dash afterimages
  for(const gh of player.ghosts){
    const a = gh.t / 16;
    ctx.save();
    const gcy = gh.y + player.h / 2;
    if(gh.g < 0){ ctx.translate(0, gcy); ctx.scale(1, -1); ctx.translate(0, -gcy); }
    ctx.globalAlpha = 0.32 * a;
    ctx.fillStyle = POWER_COLORS.dash;
    ctx.beginPath(); ctx.ellipse(gh.x + player.w / 2, gh.y + player.h - 19, 14 * (0.7 + a * 0.3), 8 * (0.7 + a * 0.3), 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.save();
  const gv = anim.gv === undefined ? 1 : anim.gv;
  if(gv < 0.999){
    // upside down: mirror XELIAX around his middle (he flips over when gravity changes)
    const mid = iy(player) + player.h / 2;
    ctx.translate(0, mid); ctx.scale(1, Math.abs(gv) < 0.12 ? 0.12 * Math.sign(gv || 1) : gv); ctx.translate(0, -mid);
  }
  lavaGlow.length = 0; lavaGlowRec = true;   // les flammes de Lave notent où elles sont (pour drawSkinGlowOver)
  drawPlayerBody(x, y);
  lavaGlowRec = false;
  ctx.restore();
}
// v54 : Émeraude et Galaxie laissent une fine traînée derrière XELIAX quand il bouge
const heroTrail = [];
let heroTrailF = -1;
function drawHeroTrail(x, y){
  const sk = HERO.skin;
  if(!sk || !sk.trail || REDUCED){ heroTrail.length = 0; return; }
  if(frame !== heroTrailF){
    if(heroTrailF >= 0 && frame - heroTrailF > 2) heroTrail.length = 0;   // salle changée, pause… : on repart à zéro
    heroTrailF = frame;
    const l = heroTrail[heroTrail.length - 1];
    if(l && Math.hypot(l.x - x, l.y - y) > 80) heroTrail.length = 0;       // téléportation : pas de long trait
    heroTrail.push({x, y});
    if(heroTrail.length > 14) heroTrail.shift();
    // légendaires : quand XELIAX court, il sème quelques éclats d'émeraude ou de petites étoiles (une fois par pas, avec parcimonie)
    const m = heroTrail[heroTrail.length - 2];
    if(sk.legend && m && Math.abs(x - m.x) + Math.abs(y - m.y) > 1.5 && frame % (sk.stars ? 5 : 8) === 0 && particles.length < 300){
      const gal = !!sk.stars, c = gal ? ['#ffffff', '#ffb3f0', '#9fd8ff'][frame % 3] : (frame & 8 ? '#c4ffdc' : '#4dff98');
      particles.push({x:x + (Math.random() - 0.5) * 12, y:y + (Math.random() - 0.5) * 8, vx:(Math.random() - 0.5) * 0.4, vy:gal ? (Math.random() - 0.5) * 0.3 : -0.5 - Math.random() * 0.4,
        life:gal ? 44 : 34, max:gal ? 44 : 34, color:c, grav:gal ? 0 : -0.004, size:gal ? 2.2 : 2.6, type:'star', rot:Math.random() * TAU, vr:0.08, drag:0.96});
    }
  }
  const n = heroTrail.length;
  if(n < 3) return;
  const h0 = heroTrail[0], hn = heroTrail[n - 1];
  if(Math.hypot(hn.x - h0.x, hn.y - h0.y) < 6) return;                    // immobile : pas de traînée
  ctx.save();
  ctx.lineCap = 'round';
  // une seule couleur, la transparence avec globalAlpha (pas de nouvelle chaîne rgba à chaque segment)
  const ga = ctx.globalAlpha;
  ctx.strokeStyle = sk.trailRGB || (sk.trailRGB = `rgb(${sk.trail})`);
  for(let i = 1; i < n; i++){
    const k = i / n, a = heroTrail[i - 1], b = heroTrail[i];
    ctx.globalAlpha = ga * 0.8 * k; ctx.lineWidth = 1 + k * 2.4;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  if(sk.stars){
    ctx.fillStyle = '#fff0ff';
    for(let i = 1; i < n - 2; i += 3){
      const p = heroTrail[i], tw = 0.5 + 0.5 * Math.sin(frame * 0.3 + i);
      ctx.globalAlpha = ga * (0.35 + 0.5 * tw * i / n);
      star(p.x + Math.sin(i * 2.1) * 4, p.y + Math.cos(i * 1.7) * 4, 1.6 + tw * 1.4, frame * 0.05 + i);
    }
  }
  ctx.restore();
}
function drawPlayerBody(x, y){
  if(player.onGround && exitT === 0){
    ctx.fillStyle = theme().dark ? 'rgba(0,0,0,0.32)' : 'rgba(30,20,60,0.18)';
    ctx.beginPath(); ctx.ellipse(x, y, 12, 2.6, 0, 0, TAU); ctx.fill();
  }
  let alpha = 1;
  if(player.invuln > 0 && player.hurtT <= 0 && finaleT === 0) alpha = 0.55 + 0.45 * Math.abs(Math.cos(player.invuln * 0.22));
  const flash = player.hurtT > 0 && Math.floor(player.hurtT / 3) % 2 === 0;
  const knocked = idle.phase === 'ko' || idle.phase === 'up';
  drawHero(anim, x, y + 0.5, 1, {alpha, flash, armed:canShoot && !knocked && !(finaleT > 0 && steal), ficelle:finaleT > 0 && !(steal && steal.got) ? (key && key.gold ? key.gold : true) : false, eat:finaleT > 0 && steal ? steal.eat || 0 : 0,
    rot:idle.rot, rest:idle.phase === 'ko' && player.onGround, bandage:idle.bandage > 0 || idle.phase === 'up'});
}

