// =====================================================================
//  DRAW: BACKGROUNDS (parallax, one world per chapter)
// =====================================================================
function drawBackground(cx, cy){
  const deco = decoOf(), th = theme();
  const by = (room.h - H - cy) * 0.35;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, th.sky[0]); g.addColorStop(0.55, th.sky[1]); g.addColorStop(1, th.sky[2]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if(deco === 'hills') bgHills(cx, by, th);
  else if(deco === 'cave') bgCave(cx, by, th);
  else if(deco === 'tower') bgTower(cx, by, th);
  else if(deco === 'night') bgNight(cx, cy, by, th);
  else if(deco === 'sky') bgSky(cx, cy, by, th);
  else if(deco === 'canyon') bgCanyon(cx, cy, by, th);
  else if(deco === 'ice') bgIce(cx, cy, by, th);
  else if(deco === 'nest') bgNest(cx, cy, by, th);
  else if(deco === 'cosmos') bgCosmos(cx, cy, by, th);
  else bgFortress(cx, cy, by, th, deco === 'ascent');
}

// ---- secret bonus 2: deep space, a ringed planet, nebulas and drifting asteroids
function ringedPlanet(x, y, r){
  ctx.save();
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,214,170,0.45)'; ctx.lineWidth = r * 0.16;
  ctx.beginPath(); ctx.ellipse(x, y, r * 1.9, r * 0.5, -0.3, Math.PI, TAU); ctx.stroke();
  softGlow(x, y, r * 2.6, r * 2.6, '255,140,170', 0.2);
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  g.addColorStop(0, '#ffc488'); g.addColorStop(0.55, '#e0607a'); g.addColorStop(1, '#4a1a66');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.lineWidth = r * 0.12;
  for(const dy of [-0.45, 0.02, 0.48]){ ctx.beginPath(); ctx.ellipse(x, y + dy * r, r * 1.25, r * 0.2, -0.3, 0, TAU); ctx.stroke(); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,226,196,0.85)'; ctx.lineWidth = r * 0.16;
  ctx.beginPath(); ctx.ellipse(x, y, r * 1.9, r * 0.5, -0.3, 0, Math.PI); ctx.stroke();
  ctx.restore();
}
function asteroid(x, y, r, rot){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.beginPath();
  for(let k = 0; k < 8; k++){ const a = k / 8 * TAU, rr2 = r * (0.75 + hash(k * 7 + Math.round(r)) * 0.35); ctx.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2); }
  ctx.closePath(); ctx.fillStyle = '#2e2560'; ctx.fill();
  ctx.strokeStyle = 'rgba(160,220,255,0.35)'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(10,6,30,0.45)'; ctx.beginPath(); ctx.arc(r * 0.25, r * 0.1, r * 0.25, 0, TAU); ctx.fill();
  ctx.restore();
}
function bgCosmos(cx, cy, by, th){
  for(const [x0, y0, rx, ry, rgb, a] of [[150, 90, 230, 120, '255,80,200', 0.15], [470, 220, 270, 140, '80,200,255', 0.13], [340, 50, 210, 90, '170,120,255', 0.14]]){
    const x = ((x0 - cx * 0.03) % (W + 320) + W + 320) % (W + 320) - 160;
    softGlow(x, y0 + by * 0.1 - cy * 0.02, rx, ry, rgb, a);
  }
  for(let i = 0; i < 110; i++){
    const z = 0.015 + hash(i * 7 + 1) * 0.05;
    const x = ((hash(i * 13 + 5) * (W + 40) - cx * z) % (W + 40) + W + 40) % (W + 40) - 20;
    const y = ((hash(i * 17 + 3) * (H + 40) - cy * z) % (H + 40) + H + 40) % (H + 40) - 20;
    const tw = 0.55 + 0.45 * Math.sin(frame * (0.02 + hash(i * 5) * 0.05) + i * 1.7);
    const r = 0.5 + hash(i * 3 + 9) * 1.2;
    const col = i % 5 === 0 ? '255,190,240' : i % 3 === 0 ? '170,230,255' : '255,250,240';
    ctx.fillStyle = `rgba(${col},${(0.3 + 0.7 * hash(i * 29)) * tw})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if(r > 1.45 && tw > 0.82){ ctx.fillStyle = `rgba(${col},${(tw - 0.82) * 3})`; star(x, y, r * 3.4, 0); }
  }
  const st = frame % 380;
  if(st < 40 && !REDUCED){
    const k = st / 40, sx = 580 - k * 380 + hash(Math.floor(frame / 380)) * 60, sy = 26 + k * 80;
    const g = ctx.createLinearGradient(sx, sy, sx + 60, sy - 15);
    g.addColorStop(0, `rgba(190,245,255,${0.9 * (1 - k)})`); g.addColorStop(1, 'rgba(190,245,255,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 60, sy - 15); ctx.stroke();
  }
  ringedPlanet(486 - cx * 0.012, 92 + by * 0.15, 32);
  const mx = 120 - cx * 0.02, my = 70 + by * 0.12;
  softGlow(mx, my, 30, 30, '170,230,255', 0.25);
  ctx.fillStyle = '#bfe8ff'; ctx.beginPath(); ctx.arc(mx, my, 9, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(80,120,170,0.4)'; ctx.beginPath(); ctx.arc(mx + 3, my - 2, 2.6, 0, TAU); ctx.arc(mx - 3, my + 3, 1.8, 0, TAU); ctx.fill();
  for(let i = 0; i < 7; i++){
    const z = 0.08 + hash(i * 11) * 0.08, dir = i % 2 ? 1 : -1;
    const x = ((hash(i * 19 + 2) * (W + 120) - cx * z + frame * 0.05 * dir) % (W + 120) + W + 120) % (W + 120) - 60;
    const y = 70 + hash(i * 23 + 7) * 230 - cy * z * 0.4 + by * 0.1;
    asteroid(x, y, 5 + hash(i * 3) * 9, frame * 0.004 * dir + i);
  }
}

// ---- season 2, chapter 1: a pastel sky where some islands float upside down
function skyIsland(x, y, s, col, grass, flip){
  ctx.save(); ctx.translate(x, y); if(flip) ctx.scale(1, -1); ctx.scale(s, s);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(-50, 0); ctx.quadraticCurveTo(-36, -8, 0, -9); ctx.quadraticCurveTo(36, -8, 50, 0);
  ctx.quadraticCurveTo(28, 16, 10, 44); ctx.quadraticCurveTo(2, 22, -12, 26); ctx.quadraticCurveTo(-30, 14, -50, 0);
  ctx.fill();
  ctx.fillStyle = grass;
  ctx.beginPath(); ctx.moveTo(-50, 0); ctx.quadraticCurveTo(-36, -8, 0, -9); ctx.quadraticCurveTo(36, -8, 50, 0); ctx.quadraticCurveTo(0, 5, -50, 0); ctx.fill();
  // a little tree and a crystal
  ctx.fillStyle = col; ctx.fillRect(-23, -22, 3, 14);
  ctx.fillStyle = grass; ctx.beginPath(); ctx.arc(-21.5, -25, 8, 0, TAU); ctx.arc(-27, -19, 5.5, 0, TAU); ctx.arc(-16, -19, 5.5, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,140,224,0.85)'; ctx.beginPath(); ctx.moveTo(18, -8); ctx.lineTo(22, -22); ctx.lineTo(26, -8); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function bgSky(cx, cy, by, th){
  const sx = 150 - cx * 0.02, sy = 70 + by * 0.2;
  softGlow(sx, sy, 150, 150, '255,246,220', 0.55);
  ctx.fillStyle = '#fff8e6'; ctx.beginPath(); ctx.arc(sx, sy, 28, 0, TAU); ctx.fill();
  const span = W + 260;
  for(let i = 0; i < 7; i++){
    const f = 0.06 + hash(i * 17 + 9) * 0.12;
    const x = (((hash(i * 7 + 4) * span - cx * f + frame * (0.05 + f * 0.2)) % span) + span) % span - 130;
    const y = 30 + hash(i * 13 + 2) * 230 + by * 0.25 - cy * f * 0.3;
    cloud(x, ((y % (H + 60)) + H + 60) % (H + 60) - 30, 0.55 + hash(i * 19 + 1) * 0.6, th);
  }
  // islands at two depths, some of them upside down
  const lay = (f, step, base, sc, col, grass, seed) => {
    const off = cx * f, first = Math.floor(off / step) - 1;
    for(let k = first; k < first + W / step + 3; k++){
      const flip = hash(k * 5 + seed) < 0.45;
      const x = k * step - off + hash(k * 7 + seed) * step * 0.4;
      const y = (flip ? base - 90 : base) + hash(k * 11 + seed) * 50 + by * f * 1.2 - cy * f * 0.25 + Math.sin(frame * 0.012 + k) * 4;
      skyIsland(x, y, sc * (0.8 + hash(k * 3 + seed) * 0.4), col, grass, flip);
    }
  };
  lay(0.1, 260, 200, 0.7, th.far, '#f8e6ff', 3);
  lay(0.22, 360, 260, 1.15, th.mid, '#f2d8ff', 8);
  // a soft sea of clouds below
  const cyb = H - 30 + by;
  const cg = ctx.createLinearGradient(0, cyb - 40, 0, cyb + 50);
  cg.addColorStop(0, 'rgba(255,255,255,0)'); cg.addColorStop(1, 'rgba(255,255,255,0.65)');
  ctx.fillStyle = cg; ctx.fillRect(0, cyb - 40, W, 400);
}

// ---- season 2, chapter 2: sunset canyon walls with strata
function canyonWall(x, y0, w, col, seed, flipX){
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(x, -10);
  for(let yy = -10; yy <= H + 20; yy += 20){ const j = (hash(Math.floor((yy + y0) / 20) * 13 + seed) - 0.5) * 18; ctx.lineTo(x + (flipX ? -1 : 1) * (w + j), yy); }
  ctx.lineTo(x, H + 20); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(80,24,10,0.18)'; ctx.lineWidth = 3;
  for(let yy = ((-y0 * 1) % 34 + 34) % 34 - 34; yy < H + 20; yy += 34){
    ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + (flipX ? -1 : 1) * (w - 8), yy + 4); ctx.stroke();
  }
}
function bgCanyon(cx, cy, by, th){
  const sx = 470 - cx * 0.02, sy = 150 + by * 0.3;
  softGlow(sx, sy, 180, 120, '255,236,190', 0.6);
  ctx.fillStyle = '#fff2c8'; ctx.beginPath(); ctx.arc(sx, sy, 34, 0, TAU); ctx.fill();
  // far mesas
  const off = cx * 0.08, step = 230, first = Math.floor(off / step) - 1;
  ctx.fillStyle = th.far;
  for(let k = first; k < first + W / step + 3; k++){
    const x = k * step - off, h = 60 + hash(k * 7) * 70, w = 120 + hash(k * 3) * 90, base = H - 70 + by * 0.6;
    ctx.beginPath(); ctx.moveTo(x - 20, base + 300); ctx.lineTo(x, base - h); ctx.lineTo(x + w, base - h); ctx.lineTo(x + w + 24, base + 300); ctx.closePath(); ctx.fill();
  }
  // canyon walls left and right, scrolling with the climb
  const yo = cy * 0.3;
  for(const [f, col, ww, seed] of [[0.18, th.mid, 120, 3], [0.32, th.near, 90, 7]]){
    const o2 = cx * f, st = 520, fst = Math.floor(o2 / st) - 1;
    for(let k = fst; k < fst + W / st + 3; k++){
      const x = k * st - o2;
      canyonWall(x, yo * (f / 0.18), ww * (0.8 + hash(k * 5 + seed) * 0.5), col, k * 31 + seed, false);
      canyonWall(x + st * 0.62, yo * (f / 0.18), ww * 0.6, col, k * 17 + seed, true);
    }
  }
  // birds gliding across
  for(let i = 0; i < 3; i++){
    const x = ((hash(i * 3 + 1) * W * 1.5 + frame * 0.5 * (1 + i * 0.3) - cx * 0.2) % (W + 100) + W + 100) % (W + 100) - 50;
    const y = 60 + hash(i * 11 + 4) * 80 + Math.sin(frame * 0.03 + i) * 6;
    const fl = Math.sin(frame * 0.2 + i * 2) * 3;
    ctx.strokeStyle = 'rgba(90,30,20,0.7)'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 7, y - fl); ctx.quadraticCurveTo(x - 3, y - 2, x, y); ctx.quadraticCurveTo(x + 3, y - 2, x + 7, y - fl); ctx.stroke();
  }
}

// ---- season 2, chapter 3: a glacier under the northern lights
function bgIce(cx, cy, by, th){
  for(let k = 0; k < 2; k++){
    const base = 70 + k * 40 + by * 0.1, amp = 18 + k * 6, col = k ? '140,190,255' : '120,255,200';
    const yAt = x => base + Math.sin(x * 0.006 + frame * 0.005 + k * 2.4 + cx * 0.0004) * amp + Math.sin(x * 0.017 - frame * 0.007) * 7;
    const g = ctx.createLinearGradient(0, base - amp - 34, 0, base + amp + 34);
    g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, `rgba(${col},${0.2 + 0.06 * Math.sin(frame * 0.012 + k)})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-10, yAt(-10) - 30);
    for(let x = -10; x <= W + 10; x += 16) ctx.lineTo(x, yAt(x) - 30);
    for(let x = W + 10; x >= -10; x -= 16) ctx.lineTo(x, yAt(x) + 30);
    ctx.closePath(); ctx.fill();
  }
  for(let i = 0; i < 40; i++){
    const x = ((hash(i * 13 + 2) * (W + 40) - cx * 0.02) % (W + 40) + W + 40) % (W + 40) - 20, y = hash(i * 7 + 5) * 150;
    ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.5 * Math.abs(Math.sin(frame * 0.03 + i))})`; ctx.fillRect(x, y, 1.4, 1.4);
  }
  // snowy mountains
  const mount = (f, base, hmax, col, snow, seed) => {
    const off = cx * f, step = 200, first = Math.floor(off / step) - 1;
    for(let k = first; k < first + W / step + 3; k++){
      const x = k * step - off + hash(k * 3 + seed) * 60, h = hmax * (0.6 + hash(k * 7 + seed) * 0.5), w = 150 + hash(k * 11 + seed) * 80, b = base + by * f * 2;
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x - w / 2, b + 300); ctx.lineTo(x, b - h); ctx.lineTo(x + w / 2, b + 300); ctx.closePath(); ctx.fill();
      ctx.fillStyle = snow; ctx.beginPath(); ctx.moveTo(x, b - h); ctx.lineTo(x + w * 0.16, b - h * 0.7); ctx.lineTo(x + w * 0.05, b - h * 0.74); ctx.lineTo(x - w * 0.04, b - h * 0.66); ctx.lineTo(x - w * 0.16, b - h * 0.72); ctx.closePath(); ctx.fill();
    }
  };
  mount(0.08, H - 40, 160, '#8fb4dc', '#f4fbff', 2);
  mount(0.18, H + 10, 150, '#6f94c4', '#e6f4ff', 9);
  // ice spires in front
  const off = cx * 0.32, step = 140, first = Math.floor(off / step) - 1;
  for(let k = first; k < first + W / step + 3; k++){
    if(hash(k * 19) < 0.4) continue;
    const x = k * step - off + hash(k * 5) * 50, h = 70 + hash(k * 9) * 110, b = H + 20 + by * 0.7;
    const g = ctx.createLinearGradient(x - 14, 0, x + 14, 0);
    g.addColorStop(0, 'rgba(220,244,255,0.75)'); g.addColorStop(1, 'rgba(120,170,220,0.75)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 16, b); ctx.lineTo(x - 3, b - h); ctx.lineTo(x + 2, b - h * 0.96); ctx.lineTo(x + 16, b); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - 3, b - h); ctx.lineTo(x - 8, b); ctx.stroke();
  }
}

// ---- season 2, chapter 4: the magpie's nest in a storm at sunset
function bgNest(cx, cy, by, th){
  // storm clouds
  for(let k = 0; k < 3; k++){
    const y = 40 + k * 46 + by * 0.1;
    ctx.fillStyle = `rgba(30,14,48,${0.35 - k * 0.06})`;
    ctx.beginPath(); ctx.moveTo(-10, y - 30);
    for(let x = -10; x <= W + 10; x += 20) ctx.lineTo(x, y + Math.sin((x + cx * (0.05 + k * 0.03) + frame * (0.3 + k * 0.2)) * 0.02) * 12);
    ctx.lineTo(W + 10, y - 60); ctx.lineTo(-10, y - 60); ctx.closePath(); ctx.fill();
  }
  // lightning now and then
  const lt = frame % 520;
  if(lt < 14 && !REDUCED){
    const seedL = Math.floor(frame / 520), lx = 80 + hash(seedL * 7) * (W - 160);
    ctx.strokeStyle = `rgba(255,246,210,${0.9 * (1 - lt / 14)})`; ctx.lineWidth = 2.2; ctx.lineJoin = 'round';
    ctx.beginPath(); let yy = 0, xx = lx; ctx.moveTo(xx, yy);
    for(let i = 0; i < 7; i++){ yy += 24; xx += (hash(seedL * 31 + i) - 0.5) * 34; ctx.lineTo(xx, yy); }
    ctx.stroke();
    ctx.fillStyle = `rgba(255,240,220,${0.14 * (1 - lt / 14)})`; ctx.fillRect(0, 0, W, H);
  }
  // giant branches
  const branch = (f, baseY, col, seed, thick) => {
    const off = cx * f, step = 420, first = Math.floor(off / step) - 1;
    ctx.strokeStyle = col; ctx.lineCap = 'round';
    for(let k = first; k < first + W / step + 3; k++){
      const x = k * step - off, y = baseY + hash(k * 7 + seed) * 120 + by * f * 1.5 - cy * f * 0.2, dir = hash(k * 3 + seed) < 0.5 ? 1 : -1;
      ctx.lineWidth = thick;
      ctx.beginPath(); ctx.moveTo(x - dir * 260, y + 40); ctx.quadraticCurveTo(x, y - 20, x + dir * 220, y + 10); ctx.stroke();
      ctx.lineWidth = thick * 0.35;
      for(let i = 0; i < 4; i++){ const t = 0.2 + i * 0.2, bx = x - dir * 260 + (dir * 480) * t, bb = y + 40 - 60 * t + 30 * t * t; ctx.beginPath(); ctx.moveTo(bx, bb); ctx.lineTo(bx + dir * 30, bb - 26 - hash(i + k) * 20); ctx.stroke(); }
      ctx.fillStyle = col;
      for(let i = 0; i < 5; i++){ const t = hash(k * 11 + i + seed), lx = x - dir * 200 + dir * 400 * t, ly = y - 30 + hash(i * 7 + k) * 40; ctx.beginPath(); ctx.ellipse(lx, ly, 9, 4, t * 3, 0, TAU); ctx.fill(); }
    }
  };
  branch(0.12, 180, th.far, 3, 18);
  // the hoard: shiny things glinting in a far nest
  const nx = 470 - cx * 0.06, ny = 120 + by * 0.25;
  ctx.fillStyle = th.far;
  ctx.beginPath(); ctx.ellipse(nx, ny, 70, 20, 0, 0, Math.PI); ctx.fill();
  for(let i = 0; i < 9; i++){ const tw = Math.max(0, Math.sin(frame * 0.05 + i * 1.9)); ctx.fillStyle = `rgba(255,230,150,${0.25 + 0.6 * tw})`; star(nx - 50 + i * 12, ny + 2 + hash(i) * 6, 1.5 + tw * 2.2, frame * 0.02); }
  branch(0.26, 250, th.mid, 9, 26);
}

function cloud(x, y, s, th){
  const blobs = [[0, 0, 14], [15, -6, 17], [33, 0, 13], [17, 4, 15], [-10, 4, 9], [44, 5, 9]];
  ctx.fillStyle = th.cloudShade;
  ctx.beginPath(); for(const [bx, b2, r] of blobs){ ctx.moveTo(x + (bx + r) * s, y + (b2 + 3) * s); ctx.arc(x + bx * s, y + (b2 + 3) * s, r * s, 0, TAU); } ctx.fill();
  ctx.fillStyle = th.cloud;
  ctx.beginPath(); for(const [bx, b2, r] of blobs){ ctx.moveTo(x + (bx + r) * s, y + b2 * s); ctx.arc(x + bx * s, y + b2 * s, r * s, 0, TAU); } ctx.fill();
}

function hillsLayer(off, base, amp, f1, f2, col, trees, th){
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-10, H + 400);
  for(let x = -10; x <= W + 10; x += 8){ const wx = x + off; ctx.lineTo(x, base + Math.sin(wx * f1) * amp + Math.sin(wx * f2 + 1.3) * amp * 0.45); }
  ctx.lineTo(W + 10, H + 400); ctx.closePath(); ctx.fill();
  if(!trees) return;
  const first = Math.floor(off / 90) - 1;
  for(let k = first; k < first + W / 90 + 3; k++){
    if(hash(k * 31) < 0.45) continue;
    const wx = k * 90 + hash(k * 7) * 40, x = wx - off;
    const y = base + Math.sin(wx * f1) * amp + Math.sin(wx * f2 + 1.3) * amp * 0.45 + 2;
    const s = 0.7 + hash(k * 3) * 0.6;
    const sway = Math.sin(frame * 0.02 + k) * 0.8 * s;
    ctx.fillStyle = shade(th.tree, -0.3); ctx.fillRect(x - 1.5 * s, y - 11 * s, 3 * s, 12 * s);
    ctx.fillStyle = th.tree;
    ctx.beginPath();
    ctx.arc(x + sway, y - 16 * s, 8 * s, 0, TAU);
    ctx.arc(x - 5 * s + sway * 0.7, y - 11 * s, 6 * s, 0, TAU);
    ctx.arc(x + 5 * s + sway * 0.7, y - 11 * s, 6 * s, 0, TAU);
    ctx.fill();
  }
}

function bgHills(cx, by, th){
  const sx = 520 - cx * 0.02, sy = 66 + by * 0.25;
  const halo = ctx.createRadialGradient(sx, sy, 8, sx, sy, 95);
  halo.addColorStop(0, 'rgba(255,250,215,0.95)'); halo.addColorStop(1, 'rgba(255,250,215,0)');
  ctx.fillStyle = halo; ctx.fillRect(sx - 95, sy - 95, 190, 190);
  ctx.fillStyle = '#fff6c9'; ctx.beginPath(); ctx.arc(sx, sy, 24, 0, TAU); ctx.fill();
  const span = W + 240;
  for(let i = 0; i < 6; i++){
    const f = 0.08 + hash(i * 17 + 3) * 0.12;
    const x = (((hash(i * 7 + 1) * span - cx * f + frame * (0.06 + f * 0.25)) % span) + span) % span - 120;
    const y = 34 + hash(i * 13 + 5) * 90 + by * 0.2;
    cloud(x, y, 0.65 + hash(i * 19) * 0.55, th);
  }
  hillsLayer(cx * 0.18, 236 + by, 26, 0.011, 0.027, th.far);
  hillsLayer(cx * 0.38, 278 + by, 18, 0.017, 0.041, th.mid, true, th);
}

// bonus world: a starry night above the clouds, with floating islands, a big moon and aurora ribbons
function bgNight(cx, cy, by, th){
  // aurora ribbons, very soft
  for(let k = 0; k < 2; k++){
    const base = 82 + k * 46 + by * 0.12, amp = 16 + k * 6;
    const col = k ? '186,140,255' : '120,255,214';
    const yAt = x => base + Math.sin(x * 0.0075 + frame * 0.004 + k * 2.1 + cx * 0.0004) * amp + Math.sin(x * 0.019 - frame * 0.006 + k) * 6;
    const g = ctx.createLinearGradient(0, base - amp - 28, 0, base + amp + 28);
    g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.5, `rgba(${col},${0.13 + 0.04 * Math.sin(frame * 0.01 + k)})`); g.addColorStop(1, `rgba(${col},0)`);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(-10, yAt(-10) - 26);
    for(let x = -10; x <= W + 10; x += 16) ctx.lineTo(x, yAt(x) - 26);
    for(let x = W + 10; x >= -10; x -= 16) ctx.lineTo(x, yAt(x) + 26);
    ctx.closePath(); ctx.fill();
  }
  // stars at three depths, twinkling
  for(let i = 0; i < 95; i++){
    const z = 0.015 + hash(i * 7 + 1) * 0.05;
    const x = ((hash(i * 13 + 5) * (W + 40) - cx * z) % (W + 40) + W + 40) % (W + 40) - 20;
    const y = ((hash(i * 17 + 3) * (H + 40) - cy * z) % (H + 40) + H + 40) % (H + 40) - 20;
    const tw = 0.55 + 0.45 * Math.sin(frame * (0.02 + hash(i * 5) * 0.05) + i * 1.7);
    const r = 0.5 + hash(i * 3 + 9) * 1.2;
    ctx.fillStyle = `rgba(255,246,220,${(0.3 + 0.7 * hash(i * 29)) * tw})`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
    if(r > 1.45 && tw > 0.82){ ctx.fillStyle = `rgba(255,246,220,${(tw - 0.82) * 3})`; star(x, y, r * 3.4, 0); }
  }
  // a shooting star now and then
  const st = frame % 420;
  if(st < 46 && !REDUCED){
    const k = st / 46, sx = 560 - k * 360 + hash(Math.floor(frame / 420)) * 60, sy = 30 + k * 90;
    const g = ctx.createLinearGradient(sx, sy, sx + 60, sy - 15);
    g.addColorStop(0, `rgba(255,248,226,${0.9 * (1 - k)})`); g.addColorStop(1, 'rgba(255,248,226,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 60, sy - 15); ctx.stroke();
  }
  // the moon
  const mx = 500 - cx * 0.015, my = 72 + by * 0.18;
  softGlow(mx, my, 90, 90, '255,236,190', 0.22);
  ctx.fillStyle = '#fff3d2'; ctx.beginPath(); ctx.arc(mx, my, 24, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(214,196,160,0.45)';
  for(const [dx, dy, r] of [[-8, -5, 5], [6, 7, 4], [9, -9, 2.6], [-3, 11, 2.2]]){ ctx.beginPath(); ctx.arc(mx + dx, my + dy, r, 0, TAU); ctx.fill(); }
  // far floating islands
  const island = (x, y, s, col, lamp) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(x - 46 * s, y);
    ctx.quadraticCurveTo(x - 30 * s, y - 9 * s, x, y - 10 * s);
    ctx.quadraticCurveTo(x + 32 * s, y - 9 * s, x + 46 * s, y);
    ctx.quadraticCurveTo(x + 22 * s, y + 18 * s, x + 6 * s, y + 46 * s);
    ctx.quadraticCurveTo(x - 4 * s, y + 24 * s, x - 18 * s, y + 20 * s);
    ctx.quadraticCurveTo(x - 34 * s, y + 12 * s, x - 46 * s, y);
    ctx.fill();
    // little pines and a house
    for(const px of [-30, -22, 24]){ ctx.beginPath(); ctx.moveTo(x + px * s, y - 22 * s); ctx.lineTo(x + (px + 5) * s, y - 8 * s); ctx.lineTo(x + (px - 5) * s, y - 8 * s); ctx.fill(); }
    ctx.fillRect(x - 6 * s, y - 20 * s, 14 * s, 11 * s);
    ctx.beginPath(); ctx.moveTo(x - 9 * s, y - 20 * s); ctx.lineTo(x + 1 * s, y - 28 * s); ctx.lineTo(x + 11 * s, y - 20 * s); ctx.fill();
    if(lamp){
      softGlow(x + 1 * s, y - 15 * s, 14 * s, 14 * s, '255,214,120', 0.5);
      ctx.fillStyle = '#ffd98a'; ctx.fillRect(x - 1 * s, y - 17 * s, 4 * s, 4 * s);
    }
  };
  const off = cx * 0.1, step = 300, first = Math.floor(off / step) - 1;
  for(let k = first; k < first + W / step + 3; k++){
    const x = k * step - off + hash(k * 7 + 3) * 120, y = 196 + hash(k * 11 + 1) * 60 + by * 0.45 + Math.sin(frame * 0.012 + k) * 3;
    island(x, y, 0.75 + hash(k * 3) * 0.35, th.far, hash(k * 5) < 0.6);
  }
  const off2 = cx * 0.24, step2 = 420, first2 = Math.floor(off2 / step2) - 1;
  for(let k = first2; k < first2 + W / step2 + 3; k++){
    const x = k * step2 - off2 + hash(k * 13 + 7) * 160, y = 300 + hash(k * 17 + 2) * 40 + by * 0.8 + Math.sin(frame * 0.01 + k * 2) * 4;
    island(x, y, 1.25 + hash(k * 9) * 0.4, th.mid, hash(k * 19) < 0.5);
  }
  // a sea of clouds far below
  const cyb = H - 26 + by;
  const cg = ctx.createLinearGradient(0, cyb - 30, 0, cyb + 40);
  cg.addColorStop(0, 'rgba(160,140,220,0)'); cg.addColorStop(1, 'rgba(160,140,220,0.35)');
  ctx.fillStyle = cg; ctx.fillRect(0, cyb - 30, W, 400);
}

function drawNightCard(w, h){
  for(let i = 0; i < 22; i++){
    const x = hash(i * 13 + 4) * w, y = hash(i * 7 + 2) * h * 0.8, tw = 0.5 + 0.5 * Math.sin(frame * 0.05 + i);
    ctx.fillStyle = `rgba(255,246,220,${0.4 + 0.5 * tw})`;
    ctx.beginPath(); ctx.arc(x, y, 0.6 + hash(i) * 0.9, 0, TAU); ctx.fill();
  }
  softGlow(w * 0.74, 22, 30, 30, '255,236,190', 0.3);
  ctx.fillStyle = '#fff3d2'; ctx.beginPath(); ctx.arc(w * 0.74, 22, 10, 0, TAU); ctx.fill();
  ctx.fillStyle = '#241f58';
  ctx.beginPath(); ctx.moveTo(14, h - 20); ctx.quadraticCurveTo(40, h - 30, 70, h - 22); ctx.quadraticCurveTo(54, h - 4, 44, h + 6); ctx.quadraticCurveTo(30, h - 8, 14, h - 20); ctx.fill();
  softGlow(w * 0.5, h - 40, 30, 30, '255,214,120', 0.55 + 0.15 * Math.sin(frame * 0.06));
  ctx.save(); ctx.translate(w * 0.5, h - 40 + Math.sin(frame * 0.05) * 2);
  drawFicelle(0, 0, 40, -0.25, false, 7, true);
  ctx.restore();
}

function spikesRow(off, baseY, col, step, maxH, dir, seed){
  ctx.fillStyle = col;
  const first = Math.floor(off / step) - 1;
  ctx.beginPath();
  for(let k = first; k < first + W / step + 3; k++){
    const x = k * step - off, h = 15 + hash(k * 13 + seed) * maxH, w = step * (0.55 + hash(k * 7 + seed) * 0.5);
    const sgn = dir === 'down' ? 1 : -1;
    ctx.moveTo(x, baseY - 2 * sgn);
    ctx.quadraticCurveTo(x + w * 0.35, baseY + h * 0.5 * sgn, x + w / 2, baseY + h * sgn);
    ctx.quadraticCurveTo(x + w * 0.65, baseY + h * 0.5 * sgn, x + w, baseY - 2 * sgn);
  }
  ctx.fill();
}

function crystalCluster(x, y, s, col, alpha){
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04 + x * 0.01);
  const gr = ctx.createRadialGradient(x, y - 14 * s, 2, x, y - 14 * s, 42 * s);
  gr.addColorStop(0, rgba(col, 0.38 * alpha * (0.6 + 0.4 * pulse))); gr.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = gr; ctx.fillRect(x - 42 * s, y - 56 * s, 84 * s, 84 * s);
  const shards = [[0, 28, 7, 0], [-8, 18, 5, -0.35], [8, 20, 5, 0.3]];
  for(const [dx, h, w, rot] of shards){
    ctx.save(); ctx.translate(x + dx * s, y); ctx.rotate(rot);
    ctx.beginPath(); ctx.moveTo(-w * s, 0); ctx.lineTo(-w * 0.6 * s, -h * s * 0.75); ctx.lineTo(0, -h * s); ctx.lineTo(w * 0.6 * s, -h * s * 0.75); ctx.lineTo(w * s, 0); ctx.closePath();
    ctx.fillStyle = rgba(col, 0.55 * alpha); ctx.fill();
    ctx.strokeStyle = rgba('#ffffff', 0.35 * alpha); ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
}

function bgCave(cx, by, th){
  for(let i = 0; i < 3; i++){
    const x = ((hash(i * 5 + 2) * 900 - cx * 0.15) % 900 + 900) % 900 - 130;
    const gr = ctx.createLinearGradient(x, 0, x + 90, H);
    gr.addColorStop(0, 'rgba(127,246,230,0.10)'); gr.addColorStop(1, 'rgba(127,246,230,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 50, 0); ctx.lineTo(x + 160, H); ctx.lineTo(x + 70, H); ctx.closePath(); ctx.fill();
  }
  spikesRow(cx * 0.2, 0, th.far, 46, 70, 'down', 3);
  spikesRow(cx * 0.2, H + by, th.far, 40, 60, 'up', 5);
  const off = cx * 0.32, step = 150, first = Math.floor(off / step) - 1;
  for(let k = first; k < first + W / step + 3; k++){
    if(hash(k * 41) < 0.35) continue;
    const x = k * step + hash(k * 9) * 60 - off;
    crystalCluster(x, H - 14 + by * 0.6, 0.9 + hash(k * 3) * 0.8, th.crystal[Math.floor(hash(k * 5) * 3)], 0.9);
  }
  spikesRow(cx * 0.45, 0, th.mid, 64, 46, 'down', 9);
}

function towersLayer(off, base, col, scale, seed, windows){
  const step = 110 * scale, first = Math.floor(off / step) - 1;
  for(let k = first; k < first + W / step + 3; k++){
    const x = k * step - off + hash(k * 7 + seed) * 30, w = (24 + hash(k * 3 + seed) * 26) * scale, h = (60 + hash(k * 11 + seed) * 110) * scale;
    ctx.fillStyle = col;
    ctx.fillRect(x, base - h, w, h + 400);
    if(hash(k * 5 + seed) < 0.5){ for(let i = 0; i < 3; i++) ctx.fillRect(x + i * w * 0.4, base - h - 6 * scale, w * 0.22, 6 * scale); }
    else { ctx.beginPath(); ctx.moveTo(x - 4 * scale, base - h); ctx.lineTo(x + w / 2, base - h - 26 * scale); ctx.lineTo(x + w + 4 * scale, base - h); ctx.closePath(); ctx.fill(); }
    if(windows){
      ctx.fillStyle = '#ffd98a';
      for(let i = 0; i < 2; i++) if(hash(k * 13 + i + seed) < 0.6) rr(x + w * 0.4, base - h + 14 * scale + i * 22 * scale, 4 * scale, 7 * scale, 2 * scale), ctx.fill();
    }
  }
}

function bgTower(cx, by, th){
  const sx = 430 - cx * 0.03, sy = 214 + by * 0.4;
  const halo = ctx.createRadialGradient(sx, sy, 20, sx, sy, 150);
  halo.addColorStop(0, 'rgba(255,236,190,0.75)'); halo.addColorStop(1, 'rgba(255,236,190,0)');
  ctx.fillStyle = halo; ctx.fillRect(sx - 150, sy - 150, 300, 300);
  ctx.fillStyle = '#fff1c6'; ctx.beginPath(); ctx.arc(sx, sy, 46, 0, TAU); ctx.fill();
  ctx.fillStyle = th.sky[2];
  for(let i = 0; i < 4; i++) ctx.fillRect(sx - 50, sy + 10 + i * 8, 100, 2 + i * 0.8);
  const span = W + 300;
  for(let i = 0; i < 5; i++){
    const f = 0.06 + hash(i * 23) * 0.1;
    const x = (((hash(i * 3 + 8) * span - cx * f + frame * 0.05) % span) + span) % span - 150;
    const y = 40 + hash(i * 29) * 110 + by * 0.2, s = 0.7 + hash(i * 31) * 0.6;
    ctx.fillStyle = rgba(th.cloud, 0.85); rr(x, y, 130 * s, 9 * s, 4.5 * s); ctx.fill();
    rr(x + 24 * s, y - 6 * s, 60 * s, 9 * s, 4.5 * s); ctx.fill();
  }
  towersLayer(cx * 0.15, H - 64 + by, th.far, 0.55, 3, false);
  towersLayer(cx * 0.3, H - 22 + by, th.mid, 0.8, 7, true);
  for(let i = 0; i < 3; i++){
    const x = ((hash(i * 3) * W * 1.5 + frame * 0.35 * (1 + i * 0.2) - cx * 0.25) % (W + 100) + W + 100) % (W + 100) - 50;
    const y = 72 + hash(i * 11) * 60 + Math.sin(frame * 0.03 + i) * 6;
    const f = Math.sin(frame * 0.25 + i * 2) * 3;
    ctx.strokeStyle = rgba(th.near, 0.85); ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 6, y - f); ctx.quadraticCurveTo(x - 3, y - 2, x, y); ctx.quadraticCurveTo(x + 3, y - 2, x + 6, y - f); ctx.stroke();
  }
}

function bgFortress(cx, cy, by, th, ascent){
  if(!ascent){
    const off = cx * 0.12, step = 300, first = Math.floor(off / step) - 1;
    for(let k = first; k < first + W / step + 3; k++){
      const x = k * step - off + hash(k * 3) * 80, base = H - 40 + by, h = 120 + hash(k * 7) * 70, w = 180 + hash(k * 11) * 80;
      ctx.fillStyle = th.far;
      ctx.beginPath(); ctx.moveTo(x - w / 2, base + 400); ctx.lineTo(x - w / 2, base); ctx.lineTo(x - 18, base - h); ctx.lineTo(x + 18, base - h); ctx.lineTo(x + w / 2, base); ctx.lineTo(x + w / 2, base + 400); ctx.closePath(); ctx.fill();
      const pulse = 0.6 + 0.4 * Math.sin(frame * 0.05 + k);
      // smoke drifts up behind the soft glow of the crater
      for(let i = 0; i < 4; i++){
        const tt = ((frame * 0.004 + i * 0.25 + hash(k)) % 1);
        ctx.fillStyle = `rgba(60,30,40,${0.22 * Math.sin(tt * Math.PI)})`;
        ctx.beginPath(); ctx.arc(x + Math.sin(tt * 6 + k) * 10 + tt * 30, base - h - 10 - tt * 90, 8 + tt * 18, 0, TAU); ctx.fill();
      }
      softGlow(x, base - h, 48, 48, '255,140,60', 0.5 * pulse);
      ctx.strokeStyle = `rgba(255,120,40,${0.5 * pulse})`; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - 6, base - h + 2); ctx.quadraticCurveTo(x - 14, base - h + 40, x - 24, base - h + 80); ctx.stroke();
    }
    const off2 = cx * 0.35, step2 = 34, first2 = Math.floor(off2 / step2) - 1;
    ctx.fillStyle = th.mid;
    ctx.fillRect(0, 236 + by, W, H + 400);
    for(let k = first2; k < first2 + W / step2 + 3; k++){
      const x = k * step2 - off2;
      ctx.fillStyle = th.mid; ctx.fillRect(x, 224 + by, 20, 14);
      if(hash(k * 17) < 0.25){ ctx.fillStyle = `rgba(255,170,80,${0.6 + 0.3 * Math.sin(frame * 0.08 + k)})`; rr(x + 6, 254 + by, 7, 11, 3); ctx.fill(); }
    }
  } else {
    const off = ((-cy * 0.4) % 30 + 30) % 30;
    for(const px of [30, 160, 452, 584]){
      const g = ctx.createLinearGradient(px, 0, px + 28, 0);
      g.addColorStop(0, th.near); g.addColorStop(0.5, th.mid); g.addColorStop(1, th.near);
      ctx.fillStyle = g; ctx.fillRect(px, 0, 28, H);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      for(let y = off - 30; y < H; y += 30) ctx.fillRect(px, y, 28, 3);
    }
  }
  const lvl = room.lava ? clamp(lavaY - cy, 0, H) : H;
  const gl = ctx.createLinearGradient(0, lvl - 180, 0, lvl);
  gl.addColorStop(0, 'rgba(255,106,42,0)'); gl.addColorStop(1, 'rgba(255,106,42,0.3)');
  ctx.fillStyle = gl; ctx.fillRect(0, lvl - 180, W, 180);
}

function drawAmbient(cx, cy){
  const deco = decoOf();
  for(const p of ambient){
    const x = ((p.x - cx * 0.15 * p.z) % W + W) % W, y = ((p.y - cy * 0.15 * p.z) % H + H) % H;
    if(deco === 'hills'){
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(p.ph) * 1.2);
      ctx.fillStyle = 'rgba(146,214,104,0.85)';
      ctx.beginPath(); ctx.ellipse(0, 0, 2.6 * p.s, 1.3 * p.s, 0, 0, TAU); ctx.fill();
      ctx.restore();
    } else if(deco === 'cave'){
      const a = 0.4 + 0.4 * Math.sin(p.ph * 2);
      ctx.fillStyle = `rgba(160,255,240,${a * 0.25})`; ctx.beginPath(); ctx.arc(x, y, 3.5 * p.s, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(200,255,248,${a})`; ctx.beginPath(); ctx.arc(x, y, 1.1 * p.s, 0, TAU); ctx.fill();
    } else if(deco === 'night'){
      const a = 0.45 + 0.45 * Math.sin(p.ph * 1.7);
      ctx.fillStyle = `rgba(255,214,120,${a * 0.22})`; ctx.beginPath(); ctx.arc(x, y, 3.6 * p.s, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(255,236,170,${a})`; ctx.beginPath(); ctx.arc(x, y, 1 * p.s, 0, TAU); ctx.fill();
    } else if(deco === 'fortress' || deco === 'ascent'){
      ctx.fillStyle = `rgba(255,${150 + (p.s * 60 | 0)},70,${0.5 + 0.4 * Math.sin(p.ph * 3)})`;
      ctx.fillRect(x, y, 1.6 * p.s, 1.6 * p.s);
    } else if(deco === 'sky'){
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.ph);
      ctx.fillStyle = 'rgba(255,160,220,0.8)'; ctx.beginPath(); ctx.ellipse(0, 0, 2.6 * p.s, 1.4 * p.s, 0, 0, TAU); ctx.fill();
      ctx.restore();
    } else if(deco === 'canyon'){
      ctx.fillStyle = `rgba(255,220,170,${0.35 + 0.3 * Math.sin(p.ph * 2)})`; ctx.beginPath(); ctx.arc(x, y, 1.3 * p.s, 0, TAU); ctx.fill();
    } else if(deco === 'ice'){
      ctx.fillStyle = `rgba(255,255,255,${0.55 + 0.35 * p.z})`; ctx.beginPath(); ctx.arc(x, y, (0.9 + p.z * 1.2) * p.s, 0, TAU); ctx.fill();
    } else if(deco === 'cosmos'){
      const a = 0.45 + 0.45 * Math.sin(p.ph * 1.7), col = p.s > 1 ? '255,150,230' : '140,236,255';
      ctx.fillStyle = `rgba(${col},${a * 0.22})`; ctx.beginPath(); ctx.arc(x, y, 3.8 * p.s, 0, TAU); ctx.fill();
      ctx.fillStyle = `rgba(${col},${a})`; ctx.beginPath(); ctx.arc(x, y, 1 * p.s, 0, TAU); ctx.fill();
    } else if(deco === 'nest'){
      ctx.strokeStyle = `rgba(190,200,255,${0.18 + 0.2 * p.z})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 9 * p.z + 4); ctx.stroke();
    }
  }
}

function drawLighting(hx, hy){
  const th = theme();
  // a soft vignette around XELIAX: no visible spotlight edge
  const g = ctx.createRadialGradient(hx, hy, th.dark ? 110 : 200, hx, hy, th.dark ? 430 : 560);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, th.dark ? th.darkness : 'rgba(20,10,60,0.12)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if(hud.flash > 0){
    const f = ctx.createRadialGradient(W/2, H/2, 120, W/2, H/2, 420);
    f.addColorStop(0, 'rgba(255,40,80,0)'); f.addColorStop(1, `rgba(255,40,80,${0.4 * hud.flash})`);
    ctx.fillStyle = f; ctx.fillRect(0, 0, W, H);
  }
}

// =====================================================================
//  DRAW: LEVEL PIECES
// =====================================================================
function drawRail(p){
  const th = theme();
  ctx.fillStyle = th.dark ? 'rgba(255,255,255,0.18)' : rgba(th.line, 0.22);
  if(p.move.axis === 'x'){
    const y = p.y + p.h / 2;
    for(let x = p.move.min + p.w / 2; x <= p.move.max + p.w / 2; x += 9){ ctx.beginPath(); ctx.arc(x, y, 1.3, 0, TAU); ctx.fill(); }
  } else {
    const x = p.x + p.w / 2;
    for(let y = p.move.min + p.h / 2; y <= p.move.max + p.h / 2; y += 9){ ctx.beginPath(); ctx.arc(x, y, 1.3, 0, TAU); ctx.fill(); }
  }
}

function grassTufts(p, x, y, w, th){
  ctx.strokeStyle = th.topDark; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
  for(let i = 0; i < w / 10; i++){
    const r = hash(p.seed + i * 7);
    if(r > 0.55) continue;
    const bx = x + 5 + i * 10 + r * 4;
    if(bx + 5 > x + w) continue;          // never past the edge of the ledge
    const sw = Math.sin(frame * 0.05 + (p.x + i * 10) * 0.05) * 1.2;
    ctx.beginPath();
    ctx.moveTo(bx - 2, y - 1); ctx.quadraticCurveTo(bx - 2.5, y - 4, bx - 3.5 + sw, y - 6);
    ctx.moveTo(bx, y - 1); ctx.quadraticCurveTo(bx, y - 5, bx + sw, y - 8);
    ctx.moveTo(bx + 2, y - 1); ctx.quadraticCurveTo(bx + 2.5, y - 4, bx + 3.5 + sw, y - 6);
    ctx.stroke();
    if(r < 0.1){
      ctx.fillStyle = r < 0.05 ? '#ffffff' : '#ff9ad0';
      ctx.beginPath(); ctx.arc(bx + sw, y - 9, 2, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffd54a'; ctx.beginPath(); ctx.arc(bx + sw, y - 9, 0.8, 0, TAU); ctx.fill();
    }
  }
}
function crystalsOn(p, x, y, w, th){
  for(let i = 0; i < w / 22; i++){
    const r = hash(p.seed + i * 13);
    if(r > 0.3) continue;
    const bx = x + 8 + i * 22 + r * 8, col = th.crystal[Math.floor(hash(p.seed + i) * 3)];
    if(bx + 7 > x + w - 2) continue;      // keep every crystal on its ledge
    const glow = 0.6 + 0.4 * Math.sin(frame * 0.06 + i + p.seed);
    const gr = ctx.createRadialGradient(bx + 1, y - 4, 0, bx + 1, y - 4, 11);
    gr.addColorStop(0, rgba(col, 0.32 * glow)); gr.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = gr; ctx.fillRect(bx - 10, y - 15, 22, 22);
    ctx.fillStyle = col; ctx.strokeStyle = th.line; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx - 3, y); ctx.lineTo(bx - 1, y - 8); ctx.lineTo(bx + 1.5, y - 9); ctx.lineTo(bx + 3, y); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + 2, y); ctx.lineTo(bx + 5, y - 5); ctx.lineTo(bx + 6, y); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}
function ivy(p, x, y, w, h, th){
  ctx.strokeStyle = '#4f8f4a'; ctx.lineWidth = 1.1; ctx.lineCap = 'round';
  for(let i = 0; i < w / 26; i++){
    const r = hash(p.seed + i * 17);
    if(r > 0.4) continue;
    const bx = x + 8 + i * 26 + r * 10, len = 6 + r * 14;
    if(bx > x + w - 6) continue;
    const sw = Math.sin(frame * 0.04 + i + p.seed) * 1.5;
    ctx.beginPath(); ctx.moveTo(bx, y + h - 1); ctx.quadraticCurveTo(bx + sw, y + h + len * 0.5, bx + sw * 1.5, y + h + len); ctx.stroke();
    ctx.fillStyle = '#6fb85f';
    for(let k = 1; k <= 3; k++){
      const t = k / 3;
      ctx.beginPath(); ctx.ellipse(bx + sw * 1.5 * t + (k % 2 ? 2 : -2), y + h + len * t, 2, 1.2, k % 2 ? 0.5 : -0.5, 0, TAU); ctx.fill();
    }
  }
}

function drawSolid(p, x, y, w, h, th){
  const deco = decoOf();
  const r = Math.min(7, h / 2);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, th.body[0]); g.addColorStop(1, th.body[1]);
  rr(x, y, w, h, r); ctx.fillStyle = g; ctx.fill();
  ctx.save();
  rr(x, y, w, h, r); ctx.clip();
  if(deco === 'hills'){
    ctx.fillStyle = rgba(th.line, 0.18);
    for(let i = 0; i < w / 14; i++){ const q = hash(p.seed + i); ctx.beginPath(); ctx.ellipse(x + 6 + i * 14 + q * 6, y + 7 + q * (h - 9), 1.6 + q, 1.1, 0, 0, TAU); ctx.fill(); }
  } else if(deco === 'tower'){
    ctx.strokeStyle = rgba(th.line, 0.22); ctx.lineWidth = 1;
    const rows = Math.max(1, Math.round((h - 4) / 7));
    for(let rw = 0; rw < rows; rw++){
      const yy = y + 4 + rw * 7;
      ctx.beginPath(); ctx.moveTo(x, yy + 0.5); ctx.lineTo(x + w, yy + 0.5); ctx.stroke();
      for(let xx = x + (rw % 2 ? 6 : 14); xx < x + w; xx += 16){ ctx.beginPath(); ctx.moveTo(xx + 0.5, yy); ctx.lineTo(xx + 0.5, yy + 7); ctx.stroke(); }
    }
  } else if(deco === 'cave'){
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    for(let i = 0; i < w / 18; i++){ const q = hash(p.seed + i * 3); ctx.beginPath(); ctx.moveTo(x + i * 18 + q * 8, y + h); ctx.lineTo(x + i * 18 + q * 8 + 6, y + 5 + q * 4); ctx.lineTo(x + i * 18 + q * 8 + 12, y + h); ctx.fill(); }
  } else if(deco === 'sky'){
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for(let i = 0; i < w / 22; i++){ const q = hash(p.seed + i * 5); ctx.beginPath(); ctx.arc(x + 8 + i * 22 + q * 8, y + h * 0.55, 3 + q * 2, 0, TAU); ctx.fill(); }
  } else if(deco === 'canyon'){
    ctx.strokeStyle = 'rgba(90,30,10,0.25)'; ctx.lineWidth = 1.2;
    for(let yy = y + 6; yy < y + h; yy += 5){ ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy + Math.sin(yy + p.seed) * 1.2); ctx.stroke(); }
  } else if(deco === 'ice'){
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for(let i = 0; i < w / 20; i++){ const q = hash(p.seed + i * 3); ctx.fillRect(x + 4 + i * 20 + q * 6, y + 4 + q * (h - 8), 6, 1.4); }
  } else if(deco === 'nest'){
    ctx.strokeStyle = 'rgba(30,14,6,0.4)'; ctx.lineWidth = 1.4;
    for(let i = -2; i < w / 9; i++){ const xx = x + i * 9; ctx.beginPath(); ctx.moveTo(xx, y + h); ctx.lineTo(xx + h * 0.9, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,220,160,0.18)';
    for(let i = 0; i < w / 13; i++){ const xx = x + i * 13; ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(xx + h * 0.7, y + h); ctx.stroke(); }
  } else if(deco === 'cosmos'){
    for(let i = 0; i < w / 15; i++){
      const q = hash(p.seed + i * 7), tw = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.045 + q * 9));
      ctx.fillStyle = q > 0.5 ? `rgba(140,240,255,${0.6 * tw})` : `rgba(255,160,235,${0.55 * tw})`;
      star(x + 6 + i * 15 + q * 6, y + 6 + q * Math.max(1, h - 10), 1.5 + q * 1.4, q * 3);
    }
  } else if(deco === 'night'){
    // little golden stars set in the stone
    for(let i = 0; i < w / 16; i++){
      const q = hash(p.seed + i * 7), tw = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.04 + q * 9));
      ctx.fillStyle = `rgba(255,224,140,${0.55 * tw})`;
      star(x + 6 + i * 16 + q * 6, y + 6 + q * Math.max(1, h - 10), 1.6 + q * 1.4, q * 3);
    }
  } else {
    const glow = 0.45 + 0.35 * Math.sin(frame * 0.05 + p.seed);
    ctx.strokeStyle = rgba(th.crack, glow); ctx.lineWidth = 1.4;
    for(let i = 0; i < w / 30; i++){ const q = hash(p.seed + i * 5), cxx = x + 10 + i * 30 + q * 10; ctx.beginPath(); ctx.moveTo(cxx, y + 5); ctx.lineTo(cxx + 3, y + h * 0.5); ctx.lineTo(cxx - 2, y + h - 1); ctx.stroke(); }
  }
  ctx.restore();
  rr(x, y, w, h, r); ctx.strokeStyle = th.line; ctx.lineWidth = 1.6; ctx.stroke();
  rr(x - 1, y - 2, w + 2, 6, 3); ctx.fillStyle = th.top; ctx.fill(); ctx.strokeStyle = th.line; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x + 3, y - 1, w - 6, 1.2);
  if(deco === 'hills') grassTufts(p, x, y, w, th);
  else if(deco === 'cave') crystalsOn(p, x, y, w, th);
  else if(deco === 'tower') ivy(p, x, y, w, h, th);
  else if(deco === 'sky') cloudFringe(p, x, y, w, h);
  else if(deco === 'ice') icicles(p, x, y, w, h);
  else if(deco === 'cosmos') crystalsOn(p, x, y, w, th);
}
// puffs of cloud under the sky ledges (their underside is a floor when gravity flips)
function cloudFringe(p, x, y, w, h){
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  for(let i = 0; i < w / 14; i++){ const q = hash(p.seed + i * 7); if(x + 7 + i * 14 > x + w - 4) continue; ctx.beginPath(); ctx.arc(x + 7 + i * 14, y + h + 1, 4 + q * 3, 0, Math.PI); ctx.fill(); }
}
function icicles(p, x, y, w, h){
  ctx.fillStyle = 'rgba(214,240,255,0.95)'; ctx.strokeStyle = 'rgba(70,120,170,0.6)'; ctx.lineWidth = 0.8;
  for(let i = 0; i < w / 16; i++){
    const q = hash(p.seed + i * 11); if(q > 0.6) continue;
    const ix0 = x + 6 + i * 16 + q * 6; if(ix0 > x + w - 6) continue;
    const L = 4 + q * 10;
    ctx.beginPath(); ctx.moveTo(ix0 - 2.5, y + h - 1); ctx.lineTo(ix0, y + h + L); ctx.lineTo(ix0 + 2.5, y + h - 1); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}

function drawMover(p, x, y, w, h, th){
  const t = frame * 0.2 + p.seed;
  ctx.fillStyle = rgba(th.jet, 0.35 + 0.15 * Math.sin(t));
  ctx.beginPath(); ctx.ellipse(x + w / 2, y + h + 3, w * 0.32, 3 + Math.sin(t) * 0.8, 0, 0, TAU); ctx.fill();
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, th.mover[0]); g.addColorStop(1, th.mover[1]);
  rr(x, y, w, h, h / 2); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = th.line; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; rr(x + 4, y + 2, w - 8, 2, 1); ctx.fill();
  const dir = p.move.dir;
  for(let i = 0; i < 3; i++){
    const lit = ((Math.floor(frame / 8) + (dir > 0 ? -i : i)) % 3 + 3) % 3 === 0;
    ctx.fillStyle = lit ? '#ffffff' : rgba(th.line, 0.35);
    ctx.beginPath(); ctx.arc(x + w / 2 + (i - 1) * 8, y + h / 2 + 1, 1.6, 0, TAU); ctx.fill();
  }
}

function drawCrumble(p, x, y, w, h){
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#ecc893'); g.addColorStop(1, '#b8844f');
  rr(x, y, w, h, 5); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = '#5e3a1c'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = 'rgba(94,58,28,0.35)';
  for(let i = 0; i < 4; i++){ ctx.beginPath(); ctx.arc(x + 6 + hash(p.seed + i * 11) * (w - 12), y + 4 + hash(p.seed + i * 13) * (h - 7), 1.1, 0, TAU); ctx.fill(); }
  const k = p.cT > 0 ? Math.min(1, p.cT / 40) : 0;
  ctx.strokeStyle = '#5e3a1c'; ctx.lineWidth = 1.2 + k * 1.2;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.32, y); ctx.lineTo(x + w * 0.4, y + h * 0.55); ctx.lineTo(x + w * 0.3, y + h);
  ctx.moveTo(x + w * 0.7, y); ctx.lineTo(x + w * 0.6, y + h * 0.6); ctx.lineTo(x + w * 0.72, y + h);
  ctx.stroke();
  if(k > 0){ ctx.fillStyle = `rgba(255,240,200,${0.25 * k})`; rr(x, y, w, h, 5); ctx.fill(); }
}

function drawPlank(p, x, y, w, h){
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#c98a52'); g.addColorStop(1, '#8a5530');
  rr(x, y, w, h, 4); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = '#4a2a14'; ctx.lineWidth = 1.6; ctx.stroke();
  // wood grain and the joints between the boards
  ctx.strokeStyle = 'rgba(74,42,20,0.4)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 4, y + h * 0.4); ctx.lineTo(x + w - 4, y + h * 0.45); ctx.stroke();
  for(let xx = x + 26; xx < x + w - 10; xx += 26){ ctx.beginPath(); ctx.moveTo(xx, y + 2); ctx.lineTo(xx, y + h - 2); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,230,190,0.35)'; ctx.fillRect(x + 4, y + 2, w - 8, 2);
  // a pink gravity bolt at each end
  const glow = p.loose ? 0.6 + 0.4 * Math.sin(frame * 0.2) : 0.35;
  for(const bx of [x + 8, x + w - 8]){
    ctx.fillStyle = rgba(POWER_COLORS.gravity, glow); ctx.beginPath(); ctx.arc(bx, y + h / 2, 3.4, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#4a2a14'; ctx.lineWidth = 1; ctx.stroke();
  }
  // loose: little chevrons show which way it is falling
  if(p.loose && w >= 50){
    const d = gdir, cx = x + w / 2, cy = y + h / 2;
    ctx.strokeStyle = rgba(POWER_COLORS.gravity, 0.85); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for(const o of [-3, 2]){ ctx.beginPath(); ctx.moveTo(cx - 5, cy + (o - 2) * d); ctx.lineTo(cx, cy + (o + 1) * d); ctx.lineTo(cx + 5, cy + (o - 2) * d); ctx.stroke(); }
  }
}

// thick stone blocks: walls and ceilings you cannot pass through
function drawWall(p, x, y, w, h, th){
  const deco = decoOf();
  const g = ctx.createLinearGradient(0, y, 0, y + Math.min(h, 220));
  g.addColorStop(0, shade(th.body[0], -0.08)); g.addColorStop(1, shade(th.body[1], -0.3));
  rr(x, y, w, h, 6); ctx.fillStyle = g; ctx.fill();
  ctx.save();
  rr(x, y, w, h, 6); ctx.clip();
  // staggered masonry
  const bh = deco === 'tower' ? 12 : 16, bw = deco === 'tower' ? 22 : 30, off = hash(p.seed) * bw;
  ctx.strokeStyle = rgba(th.line, deco === 'night' ? 0.45 : 0.3); ctx.lineWidth = 1;
  if(!['sky', 'canyon', 'ice', 'nest', 'cosmos'].includes(deco)) for(let r = 0, yy = y + 5; yy < y + h; r++, yy += bh){
    ctx.beginPath(); ctx.moveTo(x, yy + 0.5); ctx.lineTo(x + w, yy + 0.5); ctx.stroke();
    for(let xx = x - bw + ((off + (r % 2) * bw / 2) % bw); xx < x + w; xx += bw){ ctx.beginPath(); ctx.moveTo(xx + 0.5, yy); ctx.lineTo(xx + 0.5, yy + bh); ctx.stroke(); }
  }
  if(deco === 'canyon'){
    ctx.fillStyle = 'rgba(255,214,160,0.16)';
    for(let yy = y + 10; yy < y + h; yy += 26) ctx.fillRect(x, yy, w, 7);
  } else if(deco === 'ice'){
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.2;
    for(let i = 0; i < h / 50; i++){ const q = hash(p.seed + i * 5), cy = y + 14 + i * 50; ctx.beginPath(); ctx.moveTo(x + 4, cy); ctx.lineTo(x + w * q, cy + 10); ctx.lineTo(x + w - 4, cy + 4); ctx.stroke(); }
  } else if(deco === 'sky'){
    ctx.fillStyle = 'rgba(255,140,224,0.55)';
    for(let i = 0; i < h / 46; i++){ const q = hash(p.seed + i * 7); if(q > 0.55) continue; const cx = x + 5 + q * (w - 10), cy = y + 18 + i * 46; ctx.beginPath(); ctx.moveTo(cx - 3, cy + 4); ctx.lineTo(cx, cy - 6); ctx.lineTo(cx + 3, cy + 4); ctx.closePath(); ctx.fill(); }
  } else if(deco === 'cosmos'){
    for(let i = 0; i < h / 42; i++){ const q = hash(p.seed + i * 17); if(q > 0.65) continue;
      const col = th.crystal[Math.floor(q * 7) % 3], cx = x + 5 + q * (w - 10), cy = y + 12 + i * 42;
      ctx.fillStyle = rgba(col, 0.7); ctx.beginPath(); ctx.moveTo(cx - 3, cy + 4); ctx.lineTo(cx, cy - 6); ctx.lineTo(cx + 3, cy + 4); ctx.closePath(); ctx.fill(); }
    for(let i = 0; i < (w * h) / 1100; i++){ const q = hash(p.seed + i * 7), q2 = hash(p.seed + i * 11 + 3);
      ctx.fillStyle = `rgba(200,240,255,${0.2 + 0.3 * Math.abs(Math.sin(frame * 0.03 + q * 9))})`; ctx.beginPath(); ctx.arc(x + 4 + q * (w - 8), y + 8 + q2 * (h - 12), 0.9 + q, 0, TAU); ctx.fill(); }
  } else if(deco === 'nest'){
    ctx.strokeStyle = 'rgba(255,214,150,0.16)'; ctx.lineWidth = 2;
    for(let i = 0; i < w / 10; i++){ const xx = x + 5 + i * 10 + hash(p.seed + i) * 4; ctx.beginPath(); ctx.moveTo(xx, y); ctx.quadraticCurveTo(xx + 4, y + h / 2, xx - 2, y + h); ctx.stroke(); }
  }
  if(deco === 'fortress' || deco === 'ascent'){
    const glow = 0.4 + 0.3 * Math.sin(frame * 0.05 + p.seed);
    ctx.strokeStyle = rgba(th.crack, glow); ctx.lineWidth = 1.3;
    for(let i = 0; i < h / 60; i++){ const q = hash(p.seed + i * 13), cx = x + 6 + q * (w - 12), cy = y + 10 + i * 60; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + 4, cy + 12); ctx.lineTo(cx - 2, cy + 24); ctx.stroke(); }
  } else if(deco === 'cave'){
    for(let i = 0; i < h / 50; i++){ const q = hash(p.seed + i * 17); if(q > 0.6) continue;
      const col = th.crystal[Math.floor(q * 5) % 3], cx = x + 5 + q * (w - 10), cy = y + 14 + i * 50;
      ctx.fillStyle = rgba(col, 0.75); ctx.beginPath(); ctx.moveTo(cx - 3, cy + 4); ctx.lineTo(cx, cy - 6); ctx.lineTo(cx + 3, cy + 4); ctx.closePath(); ctx.fill(); }
  } else if(deco === 'night'){
    for(let i = 0; i < (w * h) / 900; i++){ const q = hash(p.seed + i * 7), q2 = hash(p.seed + i * 11 + 3);
      ctx.fillStyle = `rgba(255,224,140,${0.25 + 0.35 * Math.abs(Math.sin(frame * 0.03 + q * 9))})`; star(x + 4 + q * (w - 8), y + 8 + q2 * (h - 12), 1.3 + q * 1.2, q * 3); }
  } else if(deco === 'hills'){
    ctx.fillStyle = rgba(th.line, 0.16);
    for(let i = 0; i < (w * h) / 700; i++){ const q = hash(p.seed + i * 5), q2 = hash(p.seed + i * 9 + 1); ctx.beginPath(); ctx.ellipse(x + 4 + q * (w - 8), y + 10 + q2 * (h - 14), 2 + q, 1.3, 0, 0, TAU); ctx.fill(); }
  }
  // light from the left, shade on the right
  const sg = ctx.createLinearGradient(x, 0, x + w, 0);
  sg.addColorStop(0, 'rgba(255,255,255,0.1)'); sg.addColorStop(0.35, 'rgba(255,255,255,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.2)');
  ctx.fillStyle = sg; ctx.fillRect(x, y, w, h);
  ctx.restore();
  rr(x, y, w, h, 6); ctx.strokeStyle = th.line; ctx.lineWidth = 1.7; ctx.stroke();
  rr(x - 1, y - 2, w + 2, 6, 3); ctx.fillStyle = th.top; ctx.fill(); ctx.strokeStyle = th.line; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(x + 3, y - 1, w - 6, 1.2);
  if(deco === 'hills') grassTufts(p, x, y, w, th);
  else if(deco === 'cave' || deco === 'cosmos') crystalsOn(p, x, y, w, th);
  else if(deco === 'sky') cloudFringe(p, x, y, w, h);
  else if(deco === 'ice') icicles(p, x, y, w, h);
}

// wooden gate: planks with iron bands, cracks as it takes hits
function drawGate(p, x, y, w, h){
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, '#b0743a'); g.addColorStop(1, '#7c4a22');
  rr(x, y, w, h, 3); ctx.fillStyle = p.flash > 0 ? '#ffe2b8' : g; ctx.fill();
  ctx.strokeStyle = '#3a1f0e'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.save(); rr(x, y, w, h, 3); ctx.clip();
  ctx.strokeStyle = 'rgba(58,31,14,0.55)'; ctx.lineWidth = 1;
  for(let xx = x + 8; xx < x + w - 2; xx += 9){ ctx.beginPath(); ctx.moveTo(xx + 0.5, y); ctx.lineTo(xx + 0.5, y + h); ctx.stroke(); }
  ctx.fillStyle = '#4a4d6a';
  for(let yy = y + 14; yy < y + h - 6; yy += 34){ ctx.fillRect(x, yy, w, 5); ctx.fillStyle = '#8d91ad'; for(let xx = x + 4; xx < x + w - 2; xx += 9){ ctx.beginPath(); ctx.arc(xx, yy + 2.5, 1.2, 0, TAU); ctx.fill(); } ctx.fillStyle = '#4a4d6a'; }
  const dmg = 1 - p.hp / Math.max(1, p.maxHp);
  if(dmg > 0){
    ctx.strokeStyle = '#2a1408'; ctx.lineWidth = 1.4 + dmg;
    ctx.beginPath(); ctx.moveTo(x + w * 0.3, y + h * 0.2); ctx.lineTo(x + w * 0.55, y + h * 0.42); ctx.lineTo(x + w * 0.35, y + h * 0.6);
    if(dmg > 0.5){ ctx.moveTo(x + w * 0.7, y + h * 0.5); ctx.lineTo(x + w * 0.45, y + h * 0.72); ctx.lineTo(x + w * 0.62, y + h * 0.9); }
    ctx.stroke();
  }
  ctx.restore();
  // a target mark so it reads as "shoot me"
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.12);
  ctx.strokeStyle = `rgba(255,214,90,${0.45 + 0.4 * pulse})`; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 6 + pulse, 0, TAU); ctx.moveTo(x + w / 2 - 10, y + h / 2); ctx.lineTo(x + w / 2 + 10, y + h / 2); ctx.moveTo(x + w / 2, y + h / 2 - 10); ctx.lineTo(x + w / 2, y + h / 2 + 10); ctx.stroke();
}

function drawPlatform(p){
  if(p.gone) return;
  const th = theme();
  let x = ix(p);
  const y = iy(p), w = p.w, h = p.h;
  if(p.crumble && p.cT > 0) x += (hash(frame * 7 + (p.x | 0)) - 0.5) * (1 + p.cT / 14);
  if(p.fall && !p.loose && p.fT > 0) x += (hash(frame * 7 + (p.x | 0)) - 0.5) * (1.5 + p.fT / 8);
  ctx.save();
  if(p.appear < 1){
    const s = Math.max(0.01, easeOutBack(p.appear));
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-(x + w / 2), -(y + h / 2));
  }
  if(p.gate) drawGate(p, x, y, w, h);
  else if(p.glass) drawGlass(p, x, y, w, h);
  else if(p.slick) drawSlick(p, x, y, w, h, th);
  else if(p.solid){
    // a pillar hanging from above is drawn upside down: its cap is on its free (lower) end
    if(p.hang){ ctx.save(); ctx.translate(0, y + h / 2); ctx.scale(1, -1); ctx.translate(0, -(y + h / 2)); drawWall(p, x, y, w, h, th); ctx.restore(); }
    else drawWall(p, x, y, w, h, th);
    if(p.ice) iceTop(x, y, w);
  }
  else if(p.move) drawMover(p, x, y, w, h, th);
  else if(p.crumble) drawCrumble(p, x, y, w, h);
  else if(p.fall) drawPlank(p, x, y, w, h);
  else { drawSolid(p, x, y, w, h, th); if(p.ice) iceTop(x, y, w); }
  ctx.restore();
}

// slippery ice on top of a ledge
function iceTop(x, y, w){
  rr(x - 1, y - 3, w + 2, 7, 3); ctx.fillStyle = '#dff6ff'; ctx.fill();
  ctx.strokeStyle = '#5a8fb8'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for(let i = 0; i < w / 26; i++){ const sx = x + 6 + i * 26 + ((frame * 0.4 + i * 9) % 18); if(sx < x + w - 8) ctx.fillRect(sx, y - 1.5, 6, 1.3); }
  for(let i = 0; i < w / 40; i++){ const ix0 = x + 14 + i * 40; ctx.beginPath(); ctx.moveTo(ix0 - 3, y + 4); ctx.lineTo(ix0, y + 9 + (i % 2) * 3); ctx.lineTo(ix0 + 3, y + 4); ctx.closePath(); ctx.fillStyle = 'rgba(214,240,255,0.85)'; ctx.fill(); }
}

// an ice wall: translucent, cracked, it shatters when you dash into it
function drawGlass(p, x, y, w, h){
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, 'rgba(214,244,255,0.92)'); g.addColorStop(0.5, 'rgba(140,206,240,0.85)'); g.addColorStop(1, 'rgba(96,160,214,0.9)');
  rr(x, y, w, h, 4); ctx.fillStyle = p.flash > 0 ? '#ffffff' : g; ctx.fill();
  ctx.strokeStyle = '#2f6a9a'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.save(); rr(x, y, w, h, 4); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2;
  for(let yy = y - w; yy < y + h; yy += 46){ ctx.beginPath(); ctx.moveTo(x, yy + w); ctx.lineTo(x + w, yy); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(47,106,154,0.55)'; ctx.lineWidth = 1;
  for(let i = 0; i < h / 40; i++){ const q = hash(p.seed + i * 7), cy = y + 12 + i * 40; ctx.beginPath(); ctx.moveTo(x + w * q, cy); ctx.lineTo(x + w * 0.5, cy + 9); ctx.lineTo(x + w * (1 - q), cy + 20); ctx.stroke(); }
  ctx.restore();
  // a dash arrow so it reads as "dash into me"
  const pulse = 0.5 + 0.5 * Math.sin(frame * 0.12);
  const cx = x + w / 2, cy = y + Math.min(h / 2, 44);
  ctx.strokeStyle = `rgba(255,210,63,${0.5 + 0.45 * pulse})`; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for(const dx of [-4, 3]){ ctx.beginPath(); ctx.moveTo(cx + dx - 3, cy - 5); ctx.lineTo(cx + dx + 2, cy); ctx.lineTo(cx + dx - 3, cy + 5); ctx.stroke(); }
}

// polished stone: the tentacles can't stick to it
function drawSlick(p, x, y, w, h, th){
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  g.addColorStop(0, shade(th.slick || '#7a8aa8', 0.2)); g.addColorStop(0.5, th.slick || '#7a8aa8'); g.addColorStop(1, shade(th.slick || '#7a8aa8', -0.35));
  rr(x, y, w, h, 6); ctx.fillStyle = g; ctx.fill();
  ctx.save(); rr(x, y, w, h, 6); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  for(let yy = y - 60 + ((frame * 0.3) % 90); yy < y + h + 60; yy += 90){ ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy - 26); ctx.lineTo(x + w, yy - 14); ctx.lineTo(x, yy + 12); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  rr(x, y, w, h, 6); ctx.strokeStyle = th.line; ctx.lineWidth = 1.7; ctx.stroke();
  rr(x - 1, y - 2, w + 2, 6, 3); ctx.fillStyle = th.top; ctx.fill(); ctx.strokeStyle = th.line; ctx.lineWidth = 1.3; ctx.stroke();
}

// gravity orbs (touch: the world turns over) and gravity lines
function drawFlip(o){
  const k = o.t, col = POWER_COLORS.gravity;
  if(o.line && o.w > o.h){
    // a horizontal band: it pushes you away, towards the side its arrows point to
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.1);
    const g = ctx.createLinearGradient(0, o.y - 6, 0, o.y + o.h + 6);
    g.addColorStop(0, 'rgba(255,122,224,0)'); g.addColorStop(0.5, `rgba(255,122,224,${0.28 + 0.12 * pulse + 0.4 * k})`); g.addColorStop(1, 'rgba(255,122,224,0)');
    ctx.fillStyle = g; ctx.fillRect(o.x, o.y - 6, o.w, o.h + 12);
    ctx.strokeStyle = `rgba(255,190,240,${0.6 + 0.3 * pulse})`; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const cy = o.y + o.h / 2, d = o.set ? (o.set > 0 ? 1 : -1) : 0;
    for(let xx = o.x + 16; xx < o.x + o.w - 8; xx += 38){
      const ph = Math.sin(frame * 0.12 + xx * 0.05) * 1.5, dd = d || (Math.floor((xx - o.x) / 38) % 2 ? 1 : -1);
      ctx.beginPath(); ctx.moveTo(xx - 5, cy - dd * 2.5 + ph * dd); ctx.lineTo(xx, cy + dd * 2.5 + ph * dd); ctx.lineTo(xx + 5, cy - dd * 2.5 + ph * dd); ctx.stroke();
    }
    return;
  }
  if(o.line){
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.1);
    const g = ctx.createLinearGradient(o.x, 0, o.x + o.w, 0);
    g.addColorStop(0, 'rgba(255,122,224,0)'); g.addColorStop(0.5, `rgba(255,90,210,${0.42 + 0.12 * pulse + 0.4 * k})`); g.addColorStop(1, 'rgba(255,122,224,0)');
    ctx.fillStyle = g; ctx.fillRect(o.x - 6, o.y, o.w + 12, o.h);
    ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.3 * pulse})`; ctx.fillRect(o.x + o.w / 2 - 0.75, o.y, 1.5, o.h);
    for(let i = 0; i < o.h / 60; i++){ const sy = o.y + ((i * 60 + frame * 1.2) % o.h); ctx.fillStyle = 'rgba(255,230,250,0.8)'; star(o.x + o.w / 2 + Math.sin(sy * 0.05) * 6, sy, 2.2, frame * 0.05); }
    ctx.strokeStyle = `rgba(120,10,90,${0.55 + 0.3 * pulse})`; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const cx = o.x + o.w / 2;
    for(let yy = o.y + 14; yy < o.y + o.h - 8; yy += 34){
      const up = o.set ? o.set < 0 : Math.floor((yy - o.y) / 34) % 2 === 0, ph = Math.sin(frame * 0.1 + yy * 0.05) * 2;
      ctx.beginPath();
      if(up){ ctx.moveTo(cx - 5, yy + 3 + ph); ctx.lineTo(cx, yy - 2 + ph); ctx.lineTo(cx + 5, yy + 3 + ph); }
      else { ctx.moveTo(cx - 5, yy - 3 + ph); ctx.lineTo(cx, yy + 2 + ph); ctx.lineTo(cx + 5, yy - 3 + ph); }
      ctx.stroke();
    }
    return;
  }
  const cx = o.cx, cy = o.cy + Math.sin(frame * 0.06 + o.cx) * 2;
  softGlow(cx, cy, 30, 30, '255,122,224', 0.35 + 0.35 * k + 0.1 * Math.sin(frame * 0.08));
  ctx.save(); ctx.translate(cx, cy);
  ctx.rotate(frame * 0.02);
  ctx.strokeStyle = rgba(col, 0.7); ctx.lineWidth = 1.4; ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.arc(0, 0, 14 + k * 8, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  const g = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, 10);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, '#ffb8f0'); g.addColorStop(1, '#c43fa8');
  ctx.beginPath(); ctx.arc(cx, cy, 9.5 + k * 2, 0, TAU); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = '#5a0f4a'; ctx.lineWidth = 1.3; ctx.stroke();
  // arrows: up and down (or only the direction it forces)
  ctx.strokeStyle = '#5a0f4a'; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const arrow = d => { ctx.beginPath(); ctx.moveTo(cx - 3.2, cy + d * 1.2); ctx.lineTo(cx, cy + d * 4.6); ctx.lineTo(cx + 3.2, cy + d * 1.2); ctx.stroke(); };
  if(!o.set || o.set > 0) arrow(1);
  if(!o.set || o.set < 0) arrow(-1);
  if(!o.armed){ ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(cx, cy, 11, 0, TAU); ctx.fill(); }
}

// an elliptical glow that fades out on every side (no hard edges)
function softGlow(cx, cy, rx, ry, rgb, a){
  if(a <= 0.003) return;
  ctx.save();
  ctx.translate(cx, cy); ctx.scale(rx / ry, 1);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, ry);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(0.45, `rgba(${rgb},${a * 0.5})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.fillRect(-ry, -ry, ry * 2, ry * 2);
  ctx.restore();
}

// lava bubbles swell on the surface, then pop into two droplets
function lavaBubbles(n, at, seed){
  for(let i = 0; i < n; i++){
    const ph = (frame * 0.012 + hash(i * 31 + seed)) % 1;
    const [bx, by] = at(i);
    if(ph < 0.82){
      const r = 0.8 + ph * 3.2;
      ctx.fillStyle = `rgba(255,214,120,${0.75 - ph * 0.4})`;
      ctx.beginPath(); ctx.arc(bx, by + 1 - r * 0.4, r, Math.PI, 0); ctx.fill();
      ctx.fillStyle = 'rgba(255,250,220,0.75)';
      ctx.beginPath(); ctx.arc(bx - r * 0.35, by - r * 0.55, Math.max(0.5, r * 0.25), 0, TAU); ctx.fill();
    } else {
      const k = (ph - 0.82) / 0.18;
      ctx.fillStyle = `rgba(255,236,170,${0.8 * (1 - k)})`;
      for(const s of [-1, 1]){ ctx.beginPath(); ctx.arc(bx + s * (2 + k * 5), by - 2 - k * 6 + k * k * 4, 1.1, 0, TAU); ctx.fill(); }
    }
  }
}

function drawLavaPool(s){
  const top = s.y + 1;
  const pulse = 0.85 + 0.15 * Math.sin(frame * 0.05 + s.x * 0.01);
  softGlow(s.x + s.w / 2, top, s.w / 2 + 34, 52, '255,120,40', 0.32 * pulse);
  // the pit cut into the ground, lit from below
  const bottom = room.h + 30;
  ctx.fillStyle = '#2b0d0a'; ctx.fillRect(s.x, s.y - 3, s.w, bottom - s.y + 3);
  const x0 = s.x + 2, x1 = s.x + s.w - 2;
  const xs = []; for(let x = x0; x < x1; x += 5) xs.push(x); xs.push(x1);
  const wave = x => top + Math.sin(x * 0.06 + frame * 0.08) * 1.6 + Math.sin(x * 0.13 - frame * 0.05) * 1;
  const g = ctx.createLinearGradient(0, top - 3, 0, top + 40);
  g.addColorStop(0, '#fff1a8'); g.addColorStop(0.12, '#ffb03a'); g.addColorStop(0.4, '#ff5a1f'); g.addColorStop(1, '#8a1408');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x0, bottom);
  for(const x of xs) ctx.lineTo(x, wave(x));
  ctx.lineTo(x1, bottom); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,243,192,0.8)'; ctx.lineWidth = 1.4;
  ctx.beginPath(); xs.forEach((x, i) => i ? ctx.lineTo(x, wave(x)) : ctx.moveTo(x, wave(x))); ctx.stroke();
  ctx.fillStyle = 'rgba(255,170,90,0.55)';
  ctx.fillRect(s.x, s.y - 3, 2, top - s.y + 4); ctx.fillRect(s.x + s.w - 2, s.y - 3, 2, top - s.y + 4);
  const n = Math.max(1, Math.floor(s.w / 40));
  lavaBubbles(n, i => { const bx = s.x + 12 + (i + hash(i * 7 + (s.x | 0)) * 0.6) * (s.w - 24) / n; return [bx, wave(bx) + 1]; }, s.x | 0);
}

function drawSpikes(s){
  if(s.lava){ drawLavaPool(s); return; }
  if(s.side){
    // spikes on the face of a wall, pointing sideways
    const d = s.side === 'left' ? -1 : 1, n = Math.max(1, Math.round(s.h / 10)), sh = s.h / n;
    ctx.fillStyle = '#4a4d6a'; rr(s.x - 1.5, s.y, 3, s.h, 1.5); ctx.fill();
    for(let i = 0; i < n; i++){
      const y = s.y + i * sh;
      ctx.beginPath(); ctx.moveTo(s.x, y + 0.5); ctx.lineTo(s.x + d * 11, y + sh / 2); ctx.lineTo(s.x, y + sh - 0.5); ctx.closePath();
      const g = ctx.createLinearGradient(0, y, 0, y + sh);
      g.addColorStop(0, '#f6f8ff'); g.addColorStop(0.5, '#c3c8e0'); g.addColorStop(1, '#868cad');
      ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#2b2d45'; ctx.lineWidth = 1.1; ctx.stroke();
    }
    return;
  }
  if(s.pending){
    // a blinking warning strip where spikes are about to come out
    const blink = 0.35 + 0.3 * Math.sin(frame * 0.3);
    softGlow(s.x + s.w / 2, s.y, s.w / 2 + 12, 18, '255,70,70', blink * 0.7);
    ctx.fillStyle = `rgba(255,80,80,${0.5 + blink * 0.6})`; rr(s.x, s.y - 2, s.w, 3, 1.5); ctx.fill();
    for(let x = s.x + 22; x < s.x + s.w - 10; x += 45){
      ctx.beginPath(); ctx.moveTo(x, s.y - 17); ctx.lineTo(x + 7.5, s.y - 4); ctx.lineTo(x - 7.5, s.y - 4); ctx.closePath();
      ctx.fillStyle = `rgba(255,214,90,${0.55 + blink * 0.5})`; ctx.fill(); ctx.strokeStyle = 'rgba(80,20,10,0.8)'; ctx.lineWidth = 1; ctx.stroke();
      txt('!', x, s.y - 5.5, 9, '#3a1408', 700);
    }
  }
  const ap = s.appear === undefined ? 1 : easeOutBack(s.appear);
  if(ap <= 0.01) return;
  const n = Math.max(1, Math.round(s.w / 10)), sw = s.w / n;
  const len = 11 * ap;
  if(s.down && !solids.some(w => s.x + s.w / 2 > w.x && s.x + s.w / 2 < w.x + w.w && s.y - 4 > w.y && s.y - 4 < w.y + w.h)){
    // a beam hanging from two chains holds ceiling spikes (unless they grow out of a rock ceiling)
    ctx.strokeStyle = 'rgba(30,22,30,0.85)'; ctx.lineWidth = 1.6; ctx.setLineDash([3, 2]);
    ctx.beginPath(); for(const cx of [s.x + 10, s.x + s.w - 10]){ ctx.moveTo(cx, s.y - 7); ctx.lineTo(cx, s.y - 140); } ctx.stroke();
    ctx.setLineDash([]);
    rr(s.x - 3, s.y - 8, s.w + 6, 9, 3); ctx.fillStyle = '#4a3a44'; ctx.fill(); ctx.strokeStyle = '#1e1418'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  ctx.fillStyle = '#4a4d6a'; rr(s.x, s.y - 1.5, s.w, 3, 1.5); ctx.fill();
  for(let i = 0; i < n; i++){
    const x = s.x + i * sw;
    const tipY = s.down ? s.y + len : s.y - len;
    ctx.beginPath(); ctx.moveTo(x + 0.5, s.y); ctx.lineTo(x + sw / 2, tipY); ctx.lineTo(x + sw - 0.5, s.y); ctx.closePath();
    const g = ctx.createLinearGradient(x, 0, x + sw, 0);
    g.addColorStop(0, '#f6f8ff'); g.addColorStop(0.5, '#c3c8e0'); g.addColorStop(1, '#868cad');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = '#2b2d45'; ctx.lineWidth = 1.1; ctx.stroke();
  }
}

function drawSpring(s){
  const comp = Math.sin((1 - s.anim) * Math.PI * 3) * s.anim * 5;
  const topY = s.y + 2 + Math.max(-3, comp);
  rr(s.x - 1, s.base - 3, s.w + 2, 3, 1.5); ctx.fillStyle = '#3a3d58'; ctx.fill();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  for(let i = 0; i <= 4; i++){ const yy = lerp(topY + 3, s.base - 3, i / 4); ctx.lineTo(i % 2 ? s.x + 16 : s.x + 4, yy); }
  ctx.strokeStyle = '#2b2d45'; ctx.lineWidth = 3.2; ctx.stroke();
  ctx.strokeStyle = '#dfe2f3'; ctx.lineWidth = 1.6; ctx.stroke();
  rr(s.x - 2, topY - 1, s.w + 4, 5, 2.5); ctx.fillStyle = '#ff4f7b'; ctx.fill();
  ctx.strokeStyle = '#7a1230'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(s.x + 1, topY, s.w - 2, 1);
}

function drawCheckpoint(c){
  if(c.ceil){ ctx.save(); ctx.translate(0, c.y); ctx.scale(1, -1); ctx.translate(0, -c.y); drawCheckpointBody(c); ctx.restore(); return; }
  drawCheckpointBody(c);
}
function drawCheckpointBody(c){
  const x = c.x + 3, base = c.y, top = c.y - 38;
  rr(x - 1.5, top, 3, 38, 1.5); ctx.fillStyle = '#efeaff'; ctx.fill();
  ctx.strokeStyle = '#3a3158'; ctx.lineWidth = 1; ctx.stroke();
  const fy = lerp(base - 16, top + 3, easeOutBack(c.raise));
  const col = c.active ? '#3fd16b' : '#d0566f';
  const seg = 6, len = 18, hgt = 11;
  ctx.beginPath();
  for(let i = 0; i <= seg; i++){ const t = i / seg; ctx.lineTo(x + 1.5 + t * len, fy + Math.sin(frame * 0.16 - t * 3) * 1.6 * t); }
  for(let i = seg; i >= 0; i--){ const t = i / seg; ctx.lineTo(x + 1.5 + t * len, fy + hgt - t * 2 + Math.sin(frame * 0.16 - t * 3 + 0.5) * 1.6 * t); }
  ctx.closePath();
  ctx.fillStyle = col; ctx.fill();
  ctx.strokeStyle = shade(col, -0.5); ctx.lineWidth = 1.1; ctx.stroke();
  if(c.active){ ctx.fillStyle = '#ffffff'; star(x + 10, fy + 5, 3.4, -Math.PI / 2); }
  ctx.fillStyle = c.active ? '#ffd54a' : '#bdb6d9';
  ctx.beginPath(); ctx.arc(x, top, 2.6, 0, TAU); ctx.fill(); ctx.strokeStyle = '#3a3158'; ctx.stroke();
  rr(x - 5, base - 3, 10, 3, 1.5); ctx.fillStyle = '#3a3158'; ctx.fill();
}

function drawSign(sg){
  if(sg.ceil){ ctx.save(); ctx.translate(0, sg.y); ctx.scale(1, -1); ctx.translate(0, -sg.y); drawSignBody(sg); ctx.restore(); return; }
  drawSignBody(sg);
}
function drawSignBody(sg){
  rr(sg.x + 8, sg.y - 16, 4, 16, 1); ctx.fillStyle = '#7a4f2a'; ctx.fill();
  rr(sg.x - 1, sg.y - 31, 22, 16, 3); ctx.fillStyle = '#e0a764'; ctx.fill();
  ctx.strokeStyle = '#5a3418'; ctx.lineWidth = 1.4; ctx.stroke();
  outlined('!', sg.x + 10, sg.y - 18.5, 12, '#ffffff', '#5a3418', 3, FD, 400, 'center');
}
const KEYS_TXT = TOUCH ? {move:'◀ ▶', jump:'▲', shoot:'●', talk:'●', dash:'»'} : {move:'A / D', jump:'W', shoot:'J', talk:'E', dash:'K'};
const signText = t => t.replace(/\{(\w+)\}/g, (m, k) => KEYS_TXT[k] || m);
function drawSignBubble(sg){
  if(sg.show <= 0.01) return;
  ctx.font = `600 10px ${FU}`;
  const text = signText(sg.text);
  const tw = ctx.measureText(text).width + 18, bh = 20;
  const cx = sg.x + 10;
  const bx = clamp(cx - tw / 2, viewX + 6, viewX + W - 6 - tw), by = sg.ceil ? sg.y + 46 : sg.y - 66;
  const s = Math.max(0.01, easeOutBack(sg.show));
  ctx.save();
  ctx.globalAlpha = Math.min(1, sg.show * 1.5);
  // the tail points at the sign: down for a sign on the floor, up for a sign hanging from the ceiling
  const ty = sg.ceil ? by : by + bh, td = sg.ceil ? -1 : 1;
  ctx.translate(cx, ty); ctx.scale(s, s); ctx.translate(-cx, -ty);
  rr(bx, by, tw, bh, 9); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.strokeStyle = '#1d1442'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 5, ty - td * 0.8); ctx.lineTo(cx, ty + td * 7); ctx.lineTo(cx + 5, ty - td * 0.8); ctx.closePath();
  ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx - 5, ty); ctx.lineTo(cx, ty + td * 7); ctx.lineTo(cx + 5, ty); ctx.stroke();
  ctx.fillStyle = '#1d1442'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(text, bx + 9, by + bh / 2 + 0.5);
  ctx.textBaseline = 'alphabetic';
  ctx.restore();
}

function drawDoor(){
  if(door.ceil){ ctx.save(); const my = door.y + door.h / 2; ctx.translate(0, my); ctx.scale(1, -1); ctx.translate(0, -my); drawDoorBody(); ctx.restore(); return; }
  drawDoorBody();
}
function drawDoorBody(){
  const d = door, locked = doorLocked(), th = theme();
  const x = d.x, y = d.y, w = d.w, h = d.h;
  const arch = () => { ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + 9); ctx.arc(x + w / 2, y + 9, w / 2, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath(); };
  ctx.beginPath(); ctx.moveTo(x - 5, y + h); ctx.lineTo(x - 5, y + 9); ctx.arc(x + w / 2, y + 9, w / 2 + 5, Math.PI, 0); ctx.lineTo(x + w + 5, y + h); ctx.closePath();
  ctx.fillStyle = th.doorFrame; ctx.fill(); ctx.strokeStyle = th.line; ctx.lineWidth = 1.6; ctx.stroke();
  if(locked){
    arch();
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, '#8a5530'); g.addColorStop(1, '#6b3f22');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#3a1f0e'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.save(); arch(); ctx.clip();
    ctx.strokeStyle = 'rgba(40,20,8,0.45)'; ctx.lineWidth = 1;
    for(let i = 1; i < 4; i++){ ctx.beginPath(); ctx.moveTo(x + i * w / 4, y); ctx.lineTo(x + i * w / 4, y + h); ctx.stroke(); }
    ctx.strokeStyle = '#8d91ad'; ctx.lineWidth = 2.2; ctx.setLineDash([3, 2]);
    ctx.beginPath(); ctx.moveTo(x, y + 12); ctx.lineTo(x + w, y + h - 6); ctx.moveTo(x + w, y + 12); ctx.lineTo(x, y + h - 6); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    const sh = d.shake > 0 ? Math.sin(frame * 1.3) * d.shake * 2.5 : 0;
    const lx = x + w / 2 + sh, ly = y + 22;
    ctx.strokeStyle = '#8a6a00'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(lx, ly - 2, 4.2, Math.PI, 0); ctx.stroke();
    rr(lx - 6.5, ly - 2, 13, 10, 2.5); ctx.fillStyle = '#ffcc33'; ctx.fill(); ctx.strokeStyle = '#6a4600'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = '#6a4600'; ctx.beginPath(); ctx.arc(lx, ly + 2, 1.4, 0, TAU); ctx.fill(); ctx.fillRect(lx - 0.6, ly + 2, 1.2, 3.5);
  } else {
    arch();
    const g = ctx.createRadialGradient(x + w / 2, y + h, 2, x + w / 2, y + h * 0.6, h);
    g.addColorStop(0, '#fff6cf'); g.addColorStop(0.45, '#ffc76a'); g.addColorStop(1, '#a8501c');
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); arch(); ctx.clip();
    for(let i = 0; i < 4; i++){
      const a = -Math.PI / 2 + Math.sin(frame * 0.02 + i * 1.7) * 0.6;
      ctx.fillStyle = `rgba(255,255,230,${0.18 + 0.1 * Math.sin(frame * 0.05 + i)})`;
      ctx.beginPath(); ctx.moveTo(x + w / 2, y + h); ctx.lineTo(x + w / 2 + Math.cos(a - 0.12) * 60, y + h + Math.sin(a - 0.12) * 60); ctx.lineTo(x + w / 2 + Math.cos(a + 0.12) * 60, y + h + Math.sin(a + 0.12) * 60); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    ctx.strokeStyle = '#3a1f0e'; ctx.lineWidth = 1.4; arch(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y + 9); ctx.lineTo(x - 7, y + 12); ctx.lineTo(x - 7, y + h - 2); ctx.lineTo(x, y + h); ctx.closePath();
    ctx.fillStyle = '#7a4a28'; ctx.fill(); ctx.strokeStyle = '#3a1f0e'; ctx.stroke();
    const glow = 0.25 + 0.15 * Math.sin(frame * 0.08) + d.glow * 0.5;
    const gg = ctx.createRadialGradient(x + w / 2, y + h * 0.6, 4, x + w / 2, y + h * 0.6, 50);
    gg.addColorStop(0, `rgba(255,220,140,${glow})`); gg.addColorStop(1, 'rgba(255,220,140,0)');
    ctx.fillStyle = gg; ctx.fillRect(x + w / 2 - 50, y + h * 0.6 - 50, 100, 100);
    if(fxTick && frame % 14 === 0) particles.push({x:x + Math.random() * w, y:y + h - 4, vx:0, vy:-0.5, life:40, max:40, color:'#fff3c4', grav:0, size:2, type:'star', rot:0, vr:0.1});
  }
}

function drawCoin(c){
  const bob = Math.sin(frame * 0.06 + c.t) * 1.5;
  const x = c.x, y = c.y + bob;
  const sp = Math.cos(frame * 0.07 + c.t);
  coinIcon(x, y, 7, sp);
  const g = (frame + c.t * 40) % 120;
  if(g < 14 && Math.abs(sp) > 0.5){ ctx.fillStyle = `rgba(255,255,255,${1 - g / 14})`; star(x + 2, y - 3, 3.5 * (1 - g / 14) + 1, 0); }
}

// a tentacle with its suckers (wall slide) and a double chevron (dash)
function wallIcon(cx, cy, s){
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.lineCap = 'round';
  ctx.strokeStyle = HERO.deep; ctx.lineWidth = 5.4;
  ctx.beginPath(); ctx.moveTo(-5, 7); ctx.quadraticCurveTo(-6, -2, 2, -6); ctx.stroke();
  ctx.strokeStyle = HERO.body; ctx.lineWidth = 3.6; ctx.stroke();
  ctx.fillStyle = POWER_COLORS.wall;
  for(const [x, y] of [[-4.6, 3], [-3.6, -1.5], [-0.5, -4.5]]){ ctx.beginPath(); ctx.arc(x + 1.6, y + 0.6, 1.4, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#e8ffe8'; ctx.fillRect(5, -8, 2.4, 16);
  ctx.restore();
}
function dashIcon(cx, cy, s, col){
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for(const dx of [-3.5, 2.5]){
    ctx.beginPath(); ctx.moveTo(dx - 3, -5); ctx.lineTo(dx + 2.5, 0); ctx.lineTo(dx - 3, 5);
    ctx.strokeStyle = '#5a3a00'; ctx.lineWidth = 4; ctx.stroke();
    ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.stroke();
  }
  ctx.restore();
}

function drawPowerUp(p){
  const bob = Math.sin(frame * 0.07 + p.x * 0.1) * 2.5;
  const cx = p.x + 10, cy = p.y + 10 + bob, col = POWER_COLORS[p.type];
  if(p.type === 'gem'){
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(frame * 0.01);
    ctx.fillStyle = 'rgba(159,232,255,0.22)';
    for(let i = 0; i < 6; i++){ ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-3, -22); ctx.lineTo(3, -22); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    gemIcon(cx, cy, 9, col);
    if(frame % 40 < 10){ ctx.fillStyle = '#ffffff'; star(cx + 5, cy - 6, 3, frame * 0.1); }
    return;
  }
  const gl = ctx.createRadialGradient(cx, cy, 4, cx, cy, 20);
  gl.addColorStop(0, rgba(col, 0.35)); gl.addColorStop(1, rgba(col, 0));
  ctx.fillStyle = gl; ctx.fillRect(cx - 20, cy - 20, 40, 40);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(cx, cy, 11.5, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgba(col, 0.9); ctx.lineWidth = 1.6; ctx.stroke();
  if(p.type === 'life') heartIcon(cx, cy - 5.5, 12, col, '#5a0d24');
  else if(p.type === 'doubleJump'){
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for(const dy of [2.5, -2.5]){
      ctx.beginPath(); ctx.moveTo(cx - 5, cy + dy + 2.5); ctx.lineTo(cx, cy + dy - 2.5); ctx.lineTo(cx + 5, cy + dy + 2.5);
      ctx.strokeStyle = '#0d4a5a'; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = col; ctx.lineWidth = 2.2; ctx.stroke();
    }
  } else if(p.type === 'wall'){
    wallIcon(cx, cy, 1);
  } else if(p.type === 'dash'){
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = col; ctx.lineWidth = 2;
    for(const dy of [-3.5, 0, 3.5]){ ctx.beginPath(); ctx.moveTo(cx - 9 + Math.abs(dy) * 0.4, cy + dy); ctx.lineTo(cx - 4.5, cy + dy); ctx.stroke(); }
    for(const dy of [2.5, -2.5]){
      ctx.beginPath(); ctx.moveTo(cx - 3, cy + dy + 2.5); ctx.lineTo(cx + 2, cy + dy - 2.5); ctx.lineTo(cx + 7, cy + dy + 2.5);
      ctx.strokeStyle = '#0d4a5a'; ctx.lineWidth = 4; ctx.stroke();
      ctx.strokeStyle = POWER_COLORS.doubleJump; ctx.lineWidth = 2.2; ctx.stroke();
    }
  } else if(p.type === 'shoot'){
    ctx.beginPath(); ctx.moveTo(cx + 1.5, cy - 7); ctx.lineTo(cx - 4.5, cy + 1); ctx.lineTo(cx - 0.5, cy + 1); ctx.lineTo(cx - 2, cy + 7); ctx.lineTo(cx + 4.5, cy - 1.5); ctx.lineTo(cx + 0.5, cy - 1.5); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = '#5a2008'; ctx.lineWidth = 1.1; ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(cx, cy, 8.5, -2.6, -1.9); ctx.stroke();
}

// the ficelle aux olives: a thin baguette with olives baked into the crust
function drawFicelle(x, y, len=32, rot=0, glow=true, th=6.5, gold=false){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  if(glow){
    const gr = ctx.createRadialGradient(0, 0, 2, 0, 0, len * 0.9);
    gr.addColorStop(0, gold === 'crystal' ? 'rgba(140,240,255,0.7)' : gold ? 'rgba(255,214,90,0.7)' : 'rgba(255,226,150,0.55)'); gr.addColorStop(1, gold === 'crystal' ? 'rgba(140,240,255,0)' : 'rgba(255,226,150,0)');
    ctx.fillStyle = gr; ctx.fillRect(-len, -len, len * 2, len * 2);
  }
  const g = ctx.createLinearGradient(0, -th / 2, 0, th / 2);
  if(gold === 'crystal'){ g.addColorStop(0, '#f2fdff'); g.addColorStop(0.45, '#8fe8ff'); g.addColorStop(1, '#3a8fd0'); }
  else if(gold){ g.addColorStop(0, '#fff6c0'); g.addColorStop(0.5, '#ffd23f'); g.addColorStop(1, '#b37a0c'); }
  else { g.addColorStop(0, '#f2c27a'); g.addColorStop(0.55, '#d18d45'); g.addColorStop(1, '#9a5a24'); }
  rr(-len / 2, -th / 2, len, th, th / 2); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = gold === 'crystal' ? '#1d4f7c' : '#4e2c10'; ctx.lineWidth = Math.max(1, th * 0.16); ctx.stroke();
  const n = Math.max(3, Math.round(len / 12));
  ctx.lineCap = 'round';
  for(let i = 0; i < n; i++){
    const cx = -len / 2 + len * (i + 0.5) / n;
    ctx.fillStyle = '#2d3a19'; ctx.beginPath(); ctx.ellipse(cx + th * 0.35, th * 0.05, th * 0.22, th * 0.17, 0.3, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(190,210,120,0.6)'; ctx.beginPath(); ctx.arc(cx + th * 0.3, -th * 0.03, th * 0.06, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#f8dfaa'; ctx.lineWidth = Math.max(0.8, th * 0.13);
    ctx.beginPath(); ctx.moveTo(cx - th * 0.45, th * 0.18); ctx.lineTo(cx + th * 0.05, -th * 0.28); ctx.stroke();
  }
  ctx.fillStyle = gold ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.28)'; rr(-len / 2 + th * 0.6, -th * 0.38, len - th * 1.2, th * 0.18, th * 0.09); ctx.fill();
  if(gold && frame % 50 < 14){ ctx.fillStyle = '#ffffff'; star(len * 0.25, -th * 0.3, th * 0.7 * (1 - (frame % 50) / 14), frame * 0.1); }
  ctx.restore();
}

function drawKey(k){
  if(k.kind === 'ficelle'){
    const cx = k.x + k.w / 2, cy = k.y + k.h / 2 + Math.sin(frame * 0.07) * 3;
    softGlow(cx, cy - 46, 24, 78, k.gold === 'crystal' ? '140,240,255' : k.gold ? '255,214,90' : '255,236,170', k.gold ? 0.42 : 0.3);
    drawFicelle(cx, cy, 34, k.fall ? k.rot : Math.sin(frame * 0.05) * 0.12, true, 7, k.gold || false);
    if(frame % 30 < 10){ ctx.fillStyle = '#ffffff'; star(cx + 10, cy - 7, 3, frame * 0.1); }
    return;
  }
  const bob = Math.sin(frame * 0.1) * 2, x = k.x, y = k.y + bob;
  const gl = ctx.createRadialGradient(x + 9, y + 9, 2, x + 9, y + 9, 22);
  gl.addColorStop(0, 'rgba(255,224,102,0.5)'); gl.addColorStop(1, 'rgba(255,224,102,0)');
  ctx.fillStyle = gl; ctx.fillRect(x - 13, y - 13, 44, 44);
  ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#6a4600'; ctx.lineWidth = 1.3;
  ctx.beginPath(); ctx.arc(x + 5, y + 9, 5, 0, TAU); ctx.arc(x + 5, y + 9, 2.2, 0, TAU, true); ctx.fill('evenodd'); ctx.stroke();
  rr(x + 9, y + 7.5, 10, 3, 1); ctx.fill(); ctx.stroke();
  ctx.fillRect(x + 13, y + 10, 2.2, 4); ctx.strokeRect(x + 13, y + 10, 2.2, 4);
  ctx.fillRect(x + 16.5, y + 10, 2.2, 5); ctx.strokeRect(x + 16.5, y + 10, 2.2, 5);
  if(frame % 50 < 12){ ctx.fillStyle = '#ffffff'; star(x + 3, y + 5, 3, 0); }
}

function drawEnemy(e){
  if(e.ceil){
    ctx.save(); const my = iy(e) + e.h / 2; ctx.translate(0, my); ctx.scale(1, -1); ctx.translate(0, -my);
    drawEnemyBody(e); ctx.restore(); return;
  }
  drawEnemyBody(e);
}
function drawEnemyBody(e){
  const x = ix(e), y = iy(e);
  const col = CRITTER[chIndex] || '#ff8a3d', dark = shade(col, -0.55);
  const step = Math.sin(e.t * 1.2), bounce = Math.abs(step) * 1.6;
  const cx = x + e.w / 2, base = y + e.h;
  ctx.fillStyle = dark;
  ctx.beginPath(); ctx.ellipse(cx - 6 + step * 2, base - 1.6, 3.6, 2.1, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 6 - step * 2, base - 1.6, 3.6, 2.1, 0, 0, TAU); ctx.fill();
  const rx = 12 * (1 + step * 0.04), ry = 9.2 * (1 - step * 0.04), cy = base - 11.5 - bounce;
  ctx.fillStyle = dark;
  for(let i = -1; i <= 1; i++){ ctx.beginPath(); ctx.moveTo(cx + i * 6 - 3, cy - ry + 2); ctx.lineTo(cx + i * 6 + e.dir * 1.5, cy - ry - 4.5); ctx.lineTo(cx + i * 6 + 3, cy - ry + 2); ctx.closePath(); ctx.fill(); }
  const g = ctx.createLinearGradient(0, cy - ry, 0, cy + ry);
  g.addColorStop(0, shade(col, 0.25)); g.addColorStop(1, col);
  ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, TAU); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = dark; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(cx, cy + 4, 7, 3.4, 0, 0, TAU); ctx.fill();
  const lx = clamp((player.x + player.w / 2 - cx) * 0.05, -1.2, 1.2), ly = clamp((player.y + player.h / 2 - cy) * 0.05, -1, 1);
  for(const s of [-1, 1]){
    const ex = cx + s * 4.2 + e.dir * 1.5, ey = cy - 1.5;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(ex, ey, 3.1, 3.5, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.fillStyle = '#14082a'; ctx.beginPath(); ctx.arc(ex + lx, ey + ly + 0.4, 1.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ex - 3 * s, ey - 5.2); ctx.lineTo(ex + 2.5 * s, ey - 3.6); ctx.stroke();
  }
  ctx.strokeStyle = dark; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(cx - 4 + e.dir, cy + 4); ctx.quadraticCurveTo(cx + e.dir, cy + 2.4, cx + 4 + e.dir, cy + 4); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(cx + e.dir + 1, cy + 3.3); ctx.lineTo(cx + e.dir + 2.2, cy + 5.2); ctx.lineTo(cx + e.dir + 3.2, cy + 3.5); ctx.closePath(); ctx.fill();
}

function drawBat(b){
  const x = ix(b) + b.w / 2, y = iy(b) + b.h / 2;
  const batCol = theme().bat || ['#5a3592', '#6b44a8', '#9b7bd6'];
  const flap = Math.sin(frame * 0.38 + b.t * 3);
  for(const s of [-1, 1]){
    ctx.save(); ctx.translate(x + s * 5, y - 1); ctx.rotate(s * (-0.35 + flap * 0.55));
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 8, -9, s * 17, -3);
    ctx.quadraticCurveTo(s * 14, 0, s * 13, 3);
    ctx.quadraticCurveTo(s * 10, 1, s * 8, 4);
    ctx.quadraticCurveTo(s * 5, 2, s * 2, 4);
    ctx.closePath();
    ctx.fillStyle = batCol[0]; ctx.fill(); ctx.strokeStyle = '#1e0f3a'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = batCol[1]; ctx.strokeStyle = '#1e0f3a'; ctx.lineWidth = 1.2;
  for(const s of [-1, 1]){ ctx.beginPath(); ctx.moveTo(x + s * 2, y - 5); ctx.lineTo(x + s * 5, y - 11); ctx.lineTo(x + s * 6, y - 4); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(x, y, 7.5, 7, 0, 0, TAU); ctx.fill(); ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = batCol[2]; ctx.beginPath(); ctx.ellipse(x, y + 2.5, 4, 3, 0, 0, TAU); ctx.fill();
  for(const s of [-1, 1]){
    ctx.fillStyle = '#ffe14d'; ctx.beginPath(); ctx.ellipse(x + s * 2.8 + b.face, y - 1.5, 1.9, 2.2, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#1e0f3a'; ctx.beginPath(); ctx.arc(x + s * 2.8 + b.face * 1.6, y - 1.2, 0.9, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.moveTo(x - 2, y + 3); ctx.lineTo(x - 1.2, y + 5.5); ctx.lineTo(x - 0.4, y + 3); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 0.4, y + 3); ctx.lineTo(x + 1.2, y + 5.5); ctx.lineTo(x + 2, y + 3); ctx.fill();
}

function drawTurret(t){
  const th = theme(), x = t.x, y = t.y, cx = x + 12, cy = y + 13;
  const charge = clamp((t.t - (t.rate - 26)) / 26, 0, 1);
  let a = 0;
  if(t.dir === 'left') a = Math.PI; else if(t.dir === 'down') a = Math.PI / 2;
  else if(t.dir === 'aim') a = Math.atan2(player.y + player.h / 2 - cy, player.x + player.w / 2 - cx);
  const recoil = t.flash > 0 ? (t.flash / 6) * 4 : 0;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
  rr(3 - recoil, -3.6, 13, 7.2, 3); ctx.fillStyle = '#2b2d45'; ctx.fill();
  rr(13 - recoil, -4.6, 4.5, 9.2, 2); ctx.fillStyle = '#4a4d6a'; ctx.fill(); ctx.strokeStyle = '#15162a'; ctx.lineWidth = 1; ctx.stroke();
  if(charge > 0){
    const gr = ctx.createRadialGradient(19 - recoil, 0, 0, 19 - recoil, 0, 3 + charge * 6);
    gr.addColorStop(0, `rgba(255,230,150,${charge})`); gr.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(19 - recoil, 0, 3 + charge * 6, 0, TAU); ctx.fill();
  }
  ctx.restore();
  const g = ctx.createLinearGradient(0, y + 4, 0, y + 24);
  g.addColorStop(0, th.turret[0]); g.addColorStop(1, th.turret[1]);
  rr(x, y + 5, 24, 19, 5); ctx.fillStyle = t.flash > 4 ? '#ffffff' : g; ctx.fill();
  ctx.strokeStyle = th.line; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, y + 9, 7.5, Math.PI, 0); ctx.closePath();
  ctx.fillStyle = shade(th.turret[1], -0.2); ctx.fill(); ctx.stroke();
  const lx = clamp((player.x - x) * 0.02, -1.4, 1.4), ly = clamp((player.y - y) * 0.02, -0.8, 1);
  for(const s of [-1, 1]){
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(cx + s * 4.5, y + 15, 2.6, 2.8, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = charge > 0.5 ? '#ff3d3d' : '#14082a'; ctx.beginPath(); ctx.arc(cx + s * 4.5 + lx, y + 15 + ly, 1.3, 0, TAU); ctx.fill();
  }
  if(t.hp < t.maxHp){
    for(let i = 0; i < t.maxHp; i++){ ctx.fillStyle = i < t.hp ? '#7dff9a' : 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(cx - (t.maxHp - 1) * 3 + i * 6, y + 1, 1.8, 0, TAU); ctx.fill(); }
  }
}

function drawBullet(b){
  const x = ix(b), y = iy(b);
  if(b.kind === 'wave'){
    const cx = x + b.w / 2, base = y + b.h;
    ctx.fillStyle = 'rgba(255,190,110,0.85)';
    ctx.beginPath(); ctx.ellipse(cx, base, b.w / 2 + 3, b.h, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(cx, base, b.w / 4, b.h * 0.55, 0, Math.PI, TAU); ctx.fill();
    if(fxTick && frame % 3 === 0) particles.push({x:cx, y:base - 2, vx:-b.vx * 0.2, vy:-1, life:16, max:16, color:'#ffffff', grav:0.05, size:2.5, type:'puff', drag:0.9});
    return;
  }
  if(b.kind === 'acid'){
    const cx = x + 6, cy = y + 6;
    ctx.fillStyle = 'rgba(157,255,90,0.3)'; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, TAU); ctx.fill();
    ctx.fillStyle = '#7ae04a'; ctx.beginPath(); ctx.ellipse(cx, cy, 6, 5.5 + Math.sin(frame * 0.4) * 0.8, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#2a6a10'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(cx - 2, cy - 2, 1.6, 0, TAU); ctx.fill();
    return;
  }
  if(b.kind === 'snow'){
    const cx = x + 7, cy = y + 7;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#7a9ac8'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = 'rgba(160,190,230,0.6)'; ctx.beginPath(); ctx.arc(cx + 2, cy + 2, 3, 0, TAU); ctx.fill();
    return;
  }
  if(b.kind === 'icicle'){
    ctx.fillStyle = '#d6f2ff'; ctx.strokeStyle = '#3a6a9a'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + b.w, y); ctx.lineTo(x + b.w / 2, y + b.h); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.fillRect(x + 3, y + 2, 2, b.h * 0.5);
    return;
  }
  if(b.kind === 'trinket'){
    // shiny loot from the magpie's hoard: a spoon, a ring, a coin
    const cx = x + 6, cy = y + 6, kind = (b.seed = b.seed || 1 + Math.floor(Math.random() * 3));
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(frame * 0.3);
    ctx.fillStyle = '#ffd23f'; ctx.strokeStyle = '#7a5200'; ctx.lineWidth = 1;
    if(kind === 1){ ctx.beginPath(); ctx.ellipse(-3, 0, 4, 3, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillRect(0, -1, 8, 2); }
    else if(kind === 2){ ctx.lineWidth = 2.4; ctx.strokeStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.stroke(); ctx.fillStyle = '#7fe8ff'; ctx.beginPath(); ctx.arc(0, -4.5, 2, 0, TAU); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    if(frame % 10 < 4){ ctx.fillStyle = '#ffffff'; star(cx + 3, cy - 4, 2.5, 0); }
    return;
  }
  if(b.kind === 'bomb'){
    const cx = x + 6, cy = y + 6, blink = (FLOOR - y) < 60 && frame % 6 < 3;
    ctx.fillStyle = blink ? '#ff3d3d' : '#1a1430';
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#000000'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(cx - 2, cy - 2, 1.8, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#8a6a40'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(cx + 2, cy - 5); ctx.quadraticCurveTo(cx + 4, cy - 9, cx + 6, cy - 8); ctx.stroke();
    ctx.fillStyle = frame % 4 < 2 ? '#ffd54a' : '#ff6a2a'; star(cx + 6, cy - 8, 2.6, frame * 0.4);
    return;
  }
  const col = b.kind === 'turret' ? '#ffb02e' : '#ff3d7a';
  const cx = x + 5, cy = y + 5;
  for(let i = 3; i >= 1; i--){
    ctx.fillStyle = rgba(col, 0.14 * (4 - i));
    ctx.beginPath(); ctx.arc(cx - b.vx * i * 1.7, cy - b.vy * i * 1.7, 5 - i * 0.9, 0, TAU); ctx.fill();
  }
  ctx.fillStyle = rgba(col, 0.32); ctx.beginPath(); ctx.arc(cx, cy, 8, 0, TAU); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#fff6e0'; ctx.beginPath(); ctx.arc(cx - 1, cy - 1, 2.2, 0, TAU); ctx.fill();
}

function drawShot(s){
  const x = ix(s), y = iy(s);
  const vert = s.vy !== 0;
  for(let i = 3; i >= 1; i--){
    ctx.fillStyle = `rgba(185,162,255,${0.12 * (4 - i)})`;
    if(vert) rr(x - 1, y + i * 5, s.w + 2, s.h, 3); else rr(x - Math.sign(s.vx) * i * 5, y - 1, s.w, s.h + 2, 3);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(185,162,255,0.45)'; rr(x - 2, y - 2, s.w + 4, s.h + 4, 4); ctx.fill();
  ctx.fillStyle = '#ffffff'; rr(x, y, s.w, s.h, 2.5); ctx.fill();
}

