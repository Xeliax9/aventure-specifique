// =====================================================================
//  DRAW: BOSSES
// =====================================================================
function drawEyeBoss(b){
  const x = ix(b), y = iy(b), cx = x + b.w / 2, cy = y + b.h / 2;
  const angry = b.hp <= b.enrage, hit = b.hitT > 0;
  const aura = ctx.createRadialGradient(cx, cy, 10, cx, cy, 52);
  aura.addColorStop(0, `rgba(255,60,120,${angry ? 0.45 + 0.15 * Math.sin(frame * 0.3) : 0.25})`); aura.addColorStop(1, 'rgba(255,60,120,0)');
  ctx.fillStyle = aura; ctx.fillRect(cx - 52, cy - 52, 104, 104);
  for(let i = 0; i < 10; i++){
    const a = i * TAU / 10 + frame * (angry ? 0.05 : 0.025);
    const len = 30 + Math.sin(frame * 0.1 + i) * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
    ctx.lineTo(cx + Math.cos(a + 0.22) * 18, cy + Math.sin(a + 0.22) * 18);
    ctx.lineTo(cx + Math.cos(a - 0.22) * 18, cy + Math.sin(a - 0.22) * 18);
    ctx.closePath();
    ctx.fillStyle = hit ? '#ffffff' : '#4a0f30'; ctx.fill();
    ctx.strokeStyle = '#1a0510'; ctx.lineWidth = 1.2; ctx.stroke();
  }
  const g = ctx.createRadialGradient(cx - 6, cy - 6, 4, cx, cy, 22);
  g.addColorStop(0, hit ? '#ffffff' : '#c3418a'); g.addColorStop(1, hit ? '#ffd6e6' : (angry ? '#7a0f2e' : '#5b1660'));
  ctx.beginPath(); ctx.arc(cx, cy, 21, 0, TAU); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = '#1a0510'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, 13.5, 0, TAU); ctx.fillStyle = '#fff3ea'; ctx.fill();
  ctx.strokeStyle = 'rgba(220,40,60,0.55)'; ctx.lineWidth = 0.8;
  for(let i = 0; i < 6; i++){ const a = i * 1.05 + 0.3; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 13, cy + Math.sin(a) * 13); ctx.quadraticCurveTo(cx + Math.cos(a + 0.2) * 9, cy + Math.sin(a + 0.2) * 9, cx + Math.cos(a - 0.1) * 7, cy + Math.sin(a - 0.1) * 7); ctx.stroke(); }
  const a = Math.atan2(player.y + player.h / 2 - cy, player.x + player.w / 2 - cx);
  const px = cx + Math.cos(a) * 5, py = cy + Math.sin(a) * 5;
  ctx.fillStyle = angry ? '#ff1f3d' : '#ff3d6e'; ctx.beginPath(); ctx.arc(px, py, 7, 0, TAU); ctx.fill();
  ctx.fillStyle = '#14030a'; ctx.beginPath(); ctx.ellipse(px, py, angry ? 1.6 : 3.4, 4.8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px - 2.4, py - 2.6, 1.6, 0, TAU); ctx.fill();
  const lid = angry ? 0.42 : 0.15 + (frame % 240 < 8 ? 0.8 : 0);
  if(lid > 0.05){
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 13.6, 0, TAU); ctx.clip();
    ctx.fillStyle = angry ? '#7a0f2e' : '#5b1660';
    ctx.fillRect(cx - 15, cy - 15, 30, 30 * lid);
    ctx.strokeStyle = '#1a0510'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(cx - 15, cy - 15 + 30 * lid); ctx.lineTo(cx + 15, cy - 15 + 30 * lid - (angry ? 3 : 0)); ctx.stroke();
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(cx, cy, 13.5, 0, TAU); ctx.strokeStyle = '#1a0510'; ctx.lineWidth = 1.4; ctx.stroke();
  // shield bubble while the last hit is still protecting it (shots bounce off)
  if(b.inv > 0 || b.shieldT > 0){
    const k = Math.max(b.inv / 60, (b.shieldT || 0) / 12);
    ctx.beginPath(); ctx.arc(cx, cy, 36 + Math.sin(frame * 0.4) * 1.5, 0, TAU);
    ctx.fillStyle = `rgba(200,220,255,${0.06 + 0.12 * k})`; ctx.fill();
    ctx.strokeStyle = `rgba(210,226,255,${0.25 + 0.55 * k})`; ctx.lineWidth = 2; ctx.stroke();
  }
}

function drawSlime(b){
  const x = ix(b), y = iy(b);
  const p2 = b.phase === 2;
  const col = p2 ? '#a24be0' : '#4fd66b', dark = p2 ? '#3e0f66' : '#1e6b32', light = p2 ? '#d7a6ff' : '#b8f5c4';
  const flash = b.hitT > 0 || (b.inv > 0 && Math.floor(b.inv / 4) % 2 === 0);
  const sq = b.squash + Math.sin(frame * 0.12) * 0.03;
  const w = b.w * (1 + sq), h = b.h * (1 - sq);
  const cx = x + b.w / 2, base = y + b.h;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  const sh = clamp(1 - (FLOOR - base) / 140, 0.3, 1);
  ctx.beginPath(); ctx.ellipse(cx, FLOOR, 30 * sh, 4 * sh, 0, 0, TAU); ctx.fill();
  const body = () => {
    ctx.beginPath();
    ctx.moveTo(cx - w / 2, base);
    ctx.bezierCurveTo(cx - w / 2 - 4, base - h * 0.75, cx - w * 0.28, base - h, cx, base - h);
    ctx.bezierCurveTo(cx + w * 0.28, base - h, cx + w / 2 + 4, base - h * 0.75, cx + w / 2, base);
    ctx.quadraticCurveTo(cx + w * 0.3, base + 2.5, cx + w * 0.15, base);
    ctx.quadraticCurveTo(cx, base + 3.5, cx - w * 0.15, base);
    ctx.quadraticCurveTo(cx - w * 0.3, base + 2.5, cx - w / 2, base);
    ctx.closePath();
  };
  body();
  const g = ctx.createLinearGradient(0, base - h, 0, base);
  g.addColorStop(0, flash ? '#ffffff' : light); g.addColorStop(0.45, flash ? '#ffffff' : col); g.addColorStop(1, flash ? '#ffe0f0' : shade(col, -0.25));
  ctx.fillStyle = g; ctx.fill();
  ctx.save(); body(); ctx.clip();
  for(let i = 0; i < 4; i++){
    const bx = cx + Math.sin(frame * 0.02 + i * 1.7) * w * 0.3, byy = base - h * (0.25 + 0.15 * i) + Math.sin(frame * 0.03 + i) * 3;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(bx, byy, 1.5 + i * 0.6, 0, TAU); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(cx - w * 0.22, base - h * 0.72, 7, 3.6, -0.5, 0, TAU); ctx.fill();
  ctx.restore();
  body(); ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.stroke();
  ctx.save();
  ctx.translate(cx, base - h + 2); ctx.rotate(sq * 0.6 + Math.sin(frame * 0.1) * 0.05);
  ctx.beginPath();
  ctx.moveTo(-14, 0); ctx.lineTo(-15, -12); ctx.lineTo(-7, -6); ctx.lineTo(0, -15); ctx.lineTo(7, -6); ctx.lineTo(15, -12); ctx.lineTo(14, 0); ctx.closePath();
  ctx.fillStyle = '#ffcc33'; ctx.fill(); ctx.strokeStyle = '#6a4600'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = '#ff4d6d'; ctx.beginPath(); ctx.arc(0, -5, 2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#2ee6ff'; ctx.beginPath(); ctx.arc(-8, -3, 1.4, 0, TAU); ctx.arc(8, -3, 1.4, 0, TAU); ctx.fill();
  ctx.restore();
  const ey = base - h * 0.52, lk = clamp((player.x - cx) * 0.03, -2.2, 2.2);
  for(const s of [-1, 1]){
    const ex = cx + s * 9;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(ex, ey, 5, 6, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 1.2; ctx.stroke();
    if(b.hitT > 0){
      ctx.strokeStyle = dark; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(ex - 2.5, ey - 2.5); ctx.lineTo(ex + 2.5, ey + 2.5); ctx.moveTo(ex + 2.5, ey - 2.5); ctx.lineTo(ex - 2.5, ey + 2.5); ctx.stroke();
    } else {
      ctx.fillStyle = '#14082a'; ctx.beginPath(); ctx.arc(ex + lk, ey + 1, 2.4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex + lk - 0.8, ey, 0.7, 0, TAU); ctx.fill();
    }
    if(p2 || b.hp <= b.enrage){
      ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ex - s * 6, ey - 8); ctx.lineTo(ex + s * 3, ey - 5.5); ctx.stroke();
    }
  }
  ctx.strokeStyle = dark; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  if(!b.onGround){
    ctx.fillStyle = '#2a0a1a'; ctx.beginPath(); ctx.ellipse(cx, base - h * 0.22, 5, 4, 0, 0, TAU); ctx.fill(); ctx.stroke();
  } else if(p2){
    ctx.fillStyle = '#2a0a1a'; ctx.beginPath(); ctx.moveTo(cx - 9, base - h * 0.27); ctx.quadraticCurveTo(cx, base - h * 0.08, cx + 9, base - h * 0.27); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff';
    for(const tx of [-5, 0, 5]){ ctx.beginPath(); ctx.moveTo(cx + tx - 1.8, base - h * 0.26); ctx.lineTo(cx + tx, base - h * 0.2); ctx.lineTo(cx + tx + 1.8, base - h * 0.26); ctx.fill(); }
  } else {
    ctx.beginPath(); ctx.moveTo(cx - 10, base - h * 0.3); ctx.quadraticCurveTo(cx, base - h * 0.15, cx + 10, base - h * 0.3); ctx.stroke();
  }
}

function drawSwoop(b){
  const x = ix(b), y = iy(b);
  const p2 = b.phase === 2;
  const body = p2 ? '#b0335a' : '#4057b8', dark = p2 ? '#4a0f24' : '#18245a', belly = p2 ? '#ffc2d2' : '#cdd9ff';
  const cx = x + b.w / 2, cy = y + b.h / 2;
  const warn = b.state === 'warn' || b.state === 'sweepWarn', stunned = b.state === 'stunned', dive = b.state === 'dive' || b.state === 'sweep' || b.state === 'sweepDown';
  if(b.state === 'sweep'){
    ctx.strokeStyle = 'rgba(255,255,255,0.65)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for(let i = 0; i < 4; i++){ const ly = cy - 12 + i * 8, lx = cx - Math.sign(b.vx) * (30 + (frame * 3 + i * 11) % 22); ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx - Math.sign(b.vx) * 16, ly); ctx.stroke(); }
  }
  const hit = b.hitT > 0;
  if(warn){
    const r = 42 + Math.sin(frame * 0.6) * 4;
    softGlow(cx, cy, r, r, '255,60,60', 0.42 + 0.2 * Math.sin(frame * 0.6));
    outlined('!', cx, y - 14, 20, '#ff3d3d', '#ffffff', 4, FD, 400, 'center');
  }
  if(b.cineGlow) softGlow(cx, cy, 66, 66, '255,214,120', 0.38 + 0.15 * Math.sin(frame * 0.5));
  if(!stunned && !dive){
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.ellipse(cx, FLOOR, 18, 3, 0, 0, TAU); ctx.fill();
  }
  const flap = stunned ? 0.35 : dive ? -1.0 : Math.sin(frame * 0.28) * 0.7;
  for(const s of [-1, 1]){
    ctx.save(); ctx.translate(cx + s * 12, cy - 2); ctx.rotate(s * flap);
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(s * 20, -18, s * 34, -6);
    ctx.lineTo(s * 30, -1); ctx.lineTo(s * 33, 3); ctx.lineTo(s * 26, 5); ctx.lineTo(s * 27, 10); ctx.lineTo(s * 18, 9);
    ctx.quadraticCurveTo(s * 8, 10, 0, 6);
    ctx.closePath();
    ctx.fillStyle = hit ? '#ffffff' : shade(body, -0.2); ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
  ctx.fillStyle = hit ? '#ffffff' : body;
  ctx.beginPath();
  ctx.moveTo(cx - 12, cy - 16); ctx.lineTo(cx - 16, cy - 26); ctx.lineTo(cx - 4, cy - 19);
  ctx.moveTo(cx + 12, cy - 16); ctx.lineTo(cx + 16, cy - 26); ctx.lineTo(cx + 4, cy - 19);
  ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx, cy, 22, 20, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = hit ? '#ffffff' : belly;
  ctx.beginPath(); ctx.ellipse(cx, cy + 6, 13, 11, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = rgba(dark.startsWith('#') ? dark : '#18245a', 0.35); ctx.lineWidth = 1;
  for(let r = 0; r < 2; r++) for(let i = -1; i <= 1; i++){
    const vx = cx + i * 6 + (r ? 3 : 0), vy = cy + 3 + r * 6;
    ctx.beginPath(); ctx.moveTo(vx - 2.5, vy); ctx.lineTo(vx, vy + 2.5); ctx.lineTo(vx + 2.5, vy); ctx.stroke();
  }
  for(const s of [-1, 1]){
    const ex = cx + s * 8.5, ey = cy - 6;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex, ey, 7, 0, TAU); ctx.fill();
    ctx.strokeStyle = dark; ctx.lineWidth = 1.4; ctx.stroke();
    if(stunned){
      ctx.strokeStyle = dark; ctx.lineWidth = 1.2; ctx.beginPath();
      for(let k = 0; k < 18; k++){ const aa = k * 0.7 + frame * 0.2 * s, rr2 = k * 0.32; ctx.lineTo(ex + Math.cos(aa) * rr2, ey + Math.sin(aa) * rr2); }
      ctx.stroke();
    } else {
      const a = Math.atan2(player.y - ey, player.x - ex);
      ctx.fillStyle = warn ? '#ff3d3d' : (p2 ? '#ffb000' : '#ffcc33');
      ctx.beginPath(); ctx.arc(ex + Math.cos(a) * 2, ey + Math.sin(a) * 2, 4, 0, TAU); ctx.fill();
      ctx.fillStyle = '#14082a'; ctx.beginPath(); ctx.arc(ex + Math.cos(a) * 2.6, ey + Math.sin(a) * 2.6, 2.2, 0, TAU); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex + Math.cos(a) * 2 - 1.5, ey + Math.sin(a) * 2 - 1.5, 0.9, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = dark; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ex - s * 7, ey - (p2 ? 7 : 9)); ctx.lineTo(ex + s * 4, ey - (p2 ? 10 : 9)); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(cx - 4, cy); ctx.lineTo(cx + 4, cy); ctx.lineTo(cx, cy + 7); ctx.closePath();
  ctx.fillStyle = '#ffb02e'; ctx.fill(); ctx.strokeStyle = '#6a3a00'; ctx.lineWidth = 1; ctx.stroke();
  if(stunned || dive){
    ctx.strokeStyle = '#ffb02e'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for(const s of [-1, 1]){ ctx.beginPath(); ctx.moveTo(cx + s * 7, cy + 18); ctx.lineTo(cx + s * 7, cy + 22); ctx.lineTo(cx + s * 4, cy + 24); ctx.moveTo(cx + s * 7, cy + 22); ctx.lineTo(cx + s * 10, cy + 24); ctx.stroke(); }
  }
  if(stunned){
    for(let i = 0; i < 3; i++){
      const a = frame * 0.12 + i * TAU / 3;
      ctx.fillStyle = '#ffe066'; star(cx + Math.cos(a) * 24, y - 6 + Math.sin(a) * 5, 3.4, frame * 0.1);
    }
  }
}

function drawBoss(){
  if(!boss || !boss.alive) return;
  const ap = boss.appear === undefined ? 1 : boss.appear;
  if(ap <= 0.01) return;
  ctx.save();
  if(ap < 1){
    // materialising during its entrance
    const s = Math.max(0.01, easeOutBack(ap)), cx = ix(boss) + boss.w / 2, cy = iy(boss) + boss.h / 2;
    ctx.globalAlpha = Math.min(1, ap * 1.6);
    ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy);
  }
  if(boss.dying){
    // the death scene: it shakes harder and harder, swells, then bursts (the magpie spins instead)
    const k = boss.dying, cx = ix(boss) + boss.w / 2, cy = iy(boss) + boss.h / 2;
    ctx.translate(cx, cy);
    if(boss.mode === 'magpie') ctx.rotate(k < 40 ? k * 0.32 : Math.sin(k * 0.35) * 0.35);
    else {
      const amp = REDUCED ? 0 : Math.min(4, k / 12);
      ctx.translate((Math.random() - 0.5) * amp * 2, (Math.random() - 0.5) * amp);
      const sw = k > BOSS_DIE - 22 ? 1 + easeInCubic((k - (BOSS_DIE - 22)) / 22) * 0.4 : 1;
      ctx.scale(sw, sw);
      if(k > BOSS_DIE - 6) ctx.globalAlpha *= (BOSS_DIE - k) / 6;
    }
    ctx.translate(-cx, -cy);
  }
  if(boss.mode === 'slime') drawSlime(boss);
  else if(boss.mode === 'swoop') drawSwoop(boss);
  else if(boss.mode === 'gecko') drawGecko(boss);
  else if(boss.mode === 'yeti'){
    // shadows where icicles are about to fall
    for(const w of boss.warn || []){ const a = 0.3 + 0.3 * Math.sin(frame * 0.5); ctx.fillStyle = `rgba(30,60,120,${a})`; ctx.beginPath(); ctx.ellipse(w.x, FLOOR, 12, 3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = `rgba(200,236,255,${a + 0.3})`; ctx.beginPath(); ctx.moveTo(w.x - 5, 2); ctx.lineTo(w.x, 16); ctx.lineTo(w.x + 5, 2); ctx.closePath(); ctx.fill(); }
    drawYeti(boss);
  }
  else if(boss.mode === 'magpie') drawMagpie(boss);
  else drawEyeBoss(boss);
  ctx.restore();
  if(boss.dying) drawKO(boss);
}
// "K.O. !" pops above the beaten boss while little stars spin around its head
function drawKO(b){
  const k = b.dying, cx = ix(b) + b.w / 2, top = iy(b) - 8;
  const life = b.mode === 'magpie' ? 90 : BOSS_DIE;
  if(k > life) return;
  const fade = clamp((life - k) / 14, 0, 1);
  ctx.save(); ctx.globalAlpha = fade;
  for(let i = 0; i < 3; i++){
    const a = k * 0.16 + i * TAU / 3;
    ctx.fillStyle = i === 1 ? '#ffffff' : '#ffe066'; star(cx + Math.cos(a) * (b.w * 0.45 + 6), top + Math.sin(a) * 5, 3.6, k * 0.12 + i);
  }
  const s = REDUCED ? 1 : easeOutBack(clamp(k / 12, 0, 1)) * (1 + 0.05 * Math.sin(k * 0.3));
  ctx.translate(cx, top - 26); ctx.rotate(-0.08); ctx.scale(s, s);
  outlined('K.O. !', 0, 0, 26, '#ffe066', '#3a1030', 6, FD, 400, 'center');
  ctx.restore();
}

// a patch of burning floor: it flares up, flickers, then dies down
function drawFire(f){
  const grow = Math.min(1, f.t / 10) * Math.min(1, (f.max - f.t) / 20);
  if(grow <= 0) return;
  if(f.acid){
    // a bubbling puddle of green acid
    softGlow(f.x + f.w / 2, FLOOR - 4, f.w * 0.8, 12 * grow, '120,230,70', 0.45 * grow);
    ctx.fillStyle = 'rgba(110,220,60,' + (0.85 * grow) + ')';
    ctx.beginPath(); ctx.ellipse(f.x + f.w / 2, FLOOR - 2, f.w / 2 + 2, 6 * grow, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(200,255,140,' + (0.8 * grow) + ')';
    for(let i = 0; i < 3; i++){ const ph = frame * 0.12 + f.seed + i * 2.1, bx = f.x + 8 + i * (f.w - 16) / 2, by = FLOOR - 5 - Math.abs(Math.sin(ph)) * 6 * grow; ctx.beginPath(); ctx.arc(bx, by, 2.2 * grow, 0, TAU); ctx.fill(); }
    return;
  }
  softGlow(f.x + f.w / 2, FLOOR - 6, f.w * 0.8, 16 * grow, '255,140,40', 0.45 * grow);
  const n = 5;
  for(let i = 0; i < n; i++){
    const x = f.x + 4 + (i + 0.5) * (f.w - 8) / n, ph = frame * 0.32 + f.seed + i * 1.7;
    const h = (12 + Math.sin(ph) * 4 + (i % 2) * 5) * grow, w = 6.5 * grow;
    ctx.fillStyle = '#ff6a1f';
    ctx.beginPath(); ctx.moveTo(x - w, FLOOR); ctx.quadraticCurveTo(x - w * 0.9, FLOOR - h * 0.5, x + Math.sin(ph * 1.3) * 2, FLOOR - h); ctx.quadraticCurveTo(x + w * 0.9, FLOOR - h * 0.5, x + w, FLOOR); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffd25a';
    ctx.beginPath(); ctx.moveTo(x - w * 0.5, FLOOR); ctx.quadraticCurveTo(x - w * 0.4, FLOOR - h * 0.35, x + Math.sin(ph * 1.3), FLOOR - h * 0.6); ctx.quadraticCurveTo(x + w * 0.4, FLOOR - h * 0.35, x + w * 0.5, FLOOR); ctx.closePath(); ctx.fill();
  }
}

function drawRisingLava(){
  const top = lavaY;
  if(top > camY + H + 20) return;
  const wave = x => top + Math.sin(x * 0.045 + frame * 0.08) * 4 + Math.sin(x * 0.11 - frame * 0.05) * 2;
  const g = ctx.createLinearGradient(0, top - 6, 0, top + 140);
  g.addColorStop(0, '#fff1a8'); g.addColorStop(0.08, '#ffb03a'); g.addColorStop(0.3, '#ff5a1f'); g.addColorStop(1, '#6a0f08');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, camY + H + 40);
  for(let x = 0; x <= W; x += 8) ctx.lineTo(x, wave(x));
  ctx.lineTo(W, camY + H + 40); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,245,200,0.85)'; ctx.lineWidth = 2;
  ctx.beginPath(); for(let x = 0; x <= W; x += 8){ if(x === 0) ctx.moveTo(x, wave(x)); else ctx.lineTo(x, wave(x)); } ctx.stroke();
  lavaBubbles(12, i => { const bx = 10 + hash(i * 11) * (W - 20); return [bx, wave(bx) + 1]; }, 77);
}

function drawBarrier(){
  const y = room.barrierY;
  const gl = ctx.createLinearGradient(0, y - 14, 0, y + 14);
  gl.addColorStop(0, 'rgba(255,60,120,0)'); gl.addColorStop(0.5, `rgba(255,60,120,${0.4 + 0.15 * Math.sin(frame * 0.3)})`); gl.addColorStop(1, 'rgba(255,60,120,0)');
  ctx.fillStyle = gl; ctx.fillRect(0, y - 14, room.w, 28);
  for(const [col, lw, amp] of [['rgba(255,120,180,0.9)', 3, 4], ['#ffffff', 1.2, 2.5]]){
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for(let x = 0; x <= room.w; x += 10) ctx.lineTo(x, y + (hash(x * 3 + Math.floor(frame / 3) * 101) - 0.5) * amp * 2);
    ctx.stroke();
  }
}

function drawParticles(){
  for(const p of particles){
    const a = Math.max(0, p.life / p.max);
    const x = ix(p), y = iy(p);
    switch(p.type){
      case 'star':
        ctx.globalAlpha = Math.min(1, a * 1.5); ctx.fillStyle = p.color; star(x, y, p.size * (0.4 + 0.6 * a), p.rot); break;
      case 'ring':
        ctx.globalAlpha = a; ctx.strokeStyle = p.color; ctx.lineWidth = 2.5 * a + 0.5;
        ctx.beginPath(); ctx.arc(x, y, lerp(p.r1, p.r0, a), 0, TAU); ctx.stroke(); break;
      case 'goo':
        ctx.globalAlpha = 1; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(x, y, p.size * Math.min(1, a * 3), 0, TAU); ctx.fill(); break;
      case 'eye':
        ctx.globalAlpha = Math.min(1, a * 2);
        ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot);
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(0, 0, p.size * 0.85, p.size, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = HERO.line; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = HERO.line; ctx.beginPath(); ctx.arc(1.2, 1.2, 1.6, 0, TAU); ctx.fill();
        ctx.restore(); break;
      case 'crumb':
        ctx.globalAlpha = Math.min(1, a * 2); ctx.fillStyle = p.color;
        ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot); ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size); ctx.restore(); break;
      case 'puff':
        ctx.globalAlpha = a * 0.55; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(x, y, p.size * (1.5 - a * 0.7), 0, TAU); ctx.fill(); break;
      case 'confetti':
        ctx.globalAlpha = Math.min(1, a * 3); ctx.fillStyle = p.color;
        ctx.save(); ctx.translate(x, y); ctx.rotate(p.rot); ctx.fillRect(-1.5, -2.5 * Math.abs(Math.cos(p.rot * 2)), 3, 5 * Math.abs(Math.cos(p.rot * 2)) + 0.5); ctx.restore(); break;
      case 'soul': {
        // a little ghost drifting up and away, wobbling, with two dazed eyes
        const wob = Math.sin((p.max - p.life) * 0.12) * 6, sz = p.size;
        ctx.globalAlpha = Math.min(1, a * 1.4) * 0.85;
        ctx.save(); ctx.translate(x + wob, y);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(0, 0, sz, Math.PI, 0);
        for(let i = 0; i <= 4; i++) ctx.lineTo(sz - i * sz / 2, sz * 0.9 + (i % 2 ? -3 : 2));
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = p.color; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.strokeStyle = '#3a2a5a'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        for(const s of [-1, 1]){ const ex = s * 4, ey = -2; ctx.beginPath(); ctx.moveTo(ex - 2, ey - 2); ctx.lineTo(ex + 2, ey + 2); ctx.moveTo(ex + 2, ey - 2); ctx.lineTo(ex - 2, ey + 2); ctx.stroke(); }
        ctx.restore(); break;
      }
      case 'splat':
        ctx.globalAlpha = a; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.ellipse(x, y - 1.5, p.size * (1 + (1 - a) * 0.25), 3, 0, 0, TAU); ctx.fill(); break;
      default:
        ctx.globalAlpha = a; ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(x, y, p.size * (0.35 + 0.65 * a), 0, TAU); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

function drawPopups(){
  for(const p of popups){
    const k = p.t / 50;
    const s = p.t < 8 ? easeOutBack(p.t / 8) : 1;
    const a = p.t > 35 ? 1 - (p.t - 35) / 15 : 1;
    ctx.save();
    ctx.globalAlpha = Math.max(0, a);
    ctx.font = `700 11.5px ${FU}`;
    const half = ctx.measureText(p.text).width / 2 + 6;
    ctx.translate(clamp(p.x, viewX + half, viewX + W - half), p.y - easeOutCubic(Math.min(1, k * 1.6)) * 16);
    ctx.scale(s, s);
    outlined(p.text, 0, 0, 11.5, p.color, '#1d1442', 3, FU, 700, 'center');
    ctx.restore();
  }
}

function drawHotFloor(hf){
  const y = hf.y, w = hf.x1 - hf.x0, pulse = 0.55 + 0.25 * Math.sin(frame * 0.12);
  const g = ctx.createLinearGradient(0, y - 18, 0, y + 6);
  g.addColorStop(0, 'rgba(255,90,40,0)'); g.addColorStop(1, `rgba(255,120,40,${pulse})`);
  ctx.fillStyle = g; ctx.fillRect(hf.x0, y - 18, w, 24);
  ctx.fillStyle = `rgba(255,200,90,${pulse})`; ctx.fillRect(hf.x0, y, w, 3);
  if(fxTick && frame % 4 === 0) particles.push({x:hf.x0 + Math.random() * w, y:y - 2, vx:(Math.random() - 0.5) * 0.4, vy:-0.7 - Math.random(), life:28, max:28, color:Math.random() < 0.5 ? '#ffb347' : '#ff6a3c', grav:-0.01, size:2.4, type:'dot'});
}

function drawWorld(){
  for(const p of platforms) if(p.move) drawRail(p);
  for(const s of signs) drawSign(s);
  for(const c of checkpoints) drawCheckpoint(c);
  if(door) drawDoor();
  for(const p of platforms) drawPlatform(p);
  for(const s of springs) drawSpring(s);
  for(const s of spikes) drawSpikes(s);
  for(const f of fires) drawFire(f);
  if(room.hotFloor && boss && boss.alive) drawHotFloor(room.hotFloor);
  for(const n of npcs) drawNpc(n, n.x + 13, n.y, 1, !!(talk && talk.npc === n && talk.chars < talk.data.lines[talk.line].length), state === 'title' || player.x + player.w / 2 >= n.x + 13 ? 1 : -1);
  for(const c of coins) if(!c.got) drawCoin(c);
  for(const p of powerUps) if(!p.got) drawPowerUp(p);
  for(const o of flips) drawFlip(o);
  if(key && !key.got) drawKey(key);
  for(const t of turrets) if(t.alive) drawTurret(t);
  for(const e of enemies) if(e.alive) drawEnemy(e);
  for(const b of bats) if(b.alive) drawBat(b);
  drawBoss();
  for(const s of shots) drawShot(s);
  for(const b of bullets) drawBullet(b);
  drawPlayer();
  drawSteal();
  if(room.lava) drawRisingLava();
  if(barrierOn()) drawBarrier();
  drawParticles();
  drawPopups();
  if(state === 'play'){ for(const s of signs) drawSignBubble(s); for(const n of npcs) drawNpcPrompt(n); }
  drawIdleBubble();
}

