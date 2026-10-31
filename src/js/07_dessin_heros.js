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
    ctx.beginPath();
    ctx.moveTo(-10.2, by - 1.6);
    ctx.bezierCurveTo(-7, by + 8.4, 7, by + 8.8, 10.6, by - 0.6);
    ctx.quadraticCurveTo(0, by + 1.8, -10.2, by - 1.6);
    ctx.closePath();
    ctx.fillStyle = HERO.mouth; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = HERO.tongue; ctx.beginPath(); ctx.ellipse(1, by + 6.4, 4.4, 2.6, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.stroke();
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
  heroFill = o.flash ? '#ffffff' : (o.tint || HERO.body);

  limb(-6, by + 6.2, a.legs[0], 13, 'leg', 3.1);
  limb(6.2, by + 6.2, a.legs[1], 13, 'leg', 3.1);
  limb(-12.2, by + 1.4, a.arms[0], 10, 'arm', 3, -1);
  const tip = limb(12.2, by - 0.8, a.arms[1], 12.5, 'arm', 3, 1);

  bodyPath(0, by, HB.a, HB.b, a.wob, a.t);
  ctx.fillStyle = heroFill; ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(16,0,60,0.28)';
  ctx.beginPath(); ctx.ellipse(1.5, by + 7.5, HB.a + 2, 5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.ellipse(-7.5, by - 3.4, 4, 1.7, -0.35, 0, TAU); ctx.fill();
  ctx.restore();
  bodyPath(0, by, HB.a, HB.b, a.wob, a.t);
  ctx.strokeStyle = HERO.deep; ctx.lineWidth = 1.7; ctx.stroke();

  drawMouth(a, by);
  drawEyes(a, by);
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
  if(o.ficelle) drawFicelle(tip.x + 7, tip.y - 3, 26, -0.45, false, 5.5, o.ficelle === true ? false : o.ficelle);
  ctx.restore();
  heroFill = HERO.body;
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
  drawPlayerBody(x, y);
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
  drawHero(anim, x, y + 0.5, 1, {alpha, flash, armed:canShoot && !knocked, ficelle:finaleT > 0 && !(steal && steal.got) ? (key && key.gold ? key.gold : true) : false,
    rot:idle.rot, rest:idle.phase === 'ko' && player.onGround, bandage:idle.bandage > 0 || idle.phase === 'up'});
}

