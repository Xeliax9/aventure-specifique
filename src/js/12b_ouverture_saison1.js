// =====================================================================
//  OUVERTURE DE LA SAISON 1 : 10 s de cinématique au lancement du chapitre 1
//   A  l'aube sur les Plaines : XELIAX dort, une ombre pourpre vole la ficelle
//   B  il se réveille, s'étire et voit le coussin vide
//   C  très gros plan : « MA FICELLE AUX OLIVES ?! »
//   D  il part en courant à toute vitesse
//   E  le titre du jeu, puis le chapitre 1 commence
//  Comme la fin de la saison 2 : on ne peut la passer qu'après l'avoir vue une fois.
// =====================================================================
const OP = {t:0, hero:makeCharAnim(), skippable:false, done:false};
const OP_LEN = 600;
const OP_SHOTS = {A:0, B:210, C:320, D:420, E:510};
const OP_THEFT = 147;                 // l'image où l'ombre attrape la ficelle
const OP_BED = {x:352, y:296};        // le coussin, sur le plan large
function startOpening(){
  setState('opening');
  OP.t = 0; OP.done = false;
  OP.hero = makeCharAnim();
  OP.skippable = !!save.openingSeen;
  save.openingSeen = true; persist();
  END.parts = [];
  timerRunning = false;
}
function endOpening(){
  if(OP.done) return;
  OP.done = true; END.parts = [];
  transition(() => { anim.appear = 0; setState('play'); });
}

function updateOpening(){
  const E = OP, h = E.hero;
  if(E.done) return;
  const t = ++E.t;
  if(E.skippable && t > 30 && input.jumpPressed){ SFX.menu(); endOpening(); return; }
  if(t >= OP_LEN){ endOpening(); return; }
  // ---- A : l'aube, le vol
  if(t < OP_SHOTS.B){
    stepCharAnim(h, {vx:0, vy:0, onGround:true, facing:1, sleep:true});
    h.blinkP = 0.55;
    if(t === 1) endTune([392, 494, 587, 494, 659, 587], 0.3, 'sine', 0.04);
    if(t === 120) SFX.warn();
    if(t === OP_THEFT){
      tone(880, 0.25, 'sawtooth', 0.04, 220);
      for(let i = 0; i < 16; i++) endPart({type:'star', x:OP_BED.x, y:OP_BED.y - 12, vx:(Math.random() - 0.5) * 4, vy:-1 - Math.random() * 2.4, g:0.06, life:44, max:44});
    }
  }
  // ---- B : le réveil
  else if(t < OP_SHOTS.C){
    const k = t - OP_SHOTS.B;
    if(k === 1){ END.parts = []; setFace(h, 'open', 44); tone(300, 0.4, 'sine', 0.04, 520); }
    stepCharAnim(h, {vx:0, vy:0, onGround:true, facing:1, stretch:k < 46, look:k < 46 ? {x:0.1, y:-0.5} : {x:0.9, y:0.25}});
    if(k < 34) h.blinkP = 0.55;
    if(k === 62){ setFace(h, 'o', 60); h.wobV = 3; tone(520, 0.12, 'triangle', 0.05); tone(392, 0.2, 'triangle', 0.05, null, 0.12); }
  }
  // ---- C : le cri
  else if(t < OP_SHOTS.D){
    const k = t - OP_SHOTS.C;
    if(k === 1){ END.parts = []; setFace(h, 'open', 120); addShake(9); SFX.crack(); endTune([196, 185, 175, 165], 0.14, 'sawtooth', 0.04); }
    stepCharAnim(h, {vx:0, vy:0, onGround:true, facing:1, look:{x:0.5, y:-0.5}});
    h.sx = 1 + Math.sin(k * 0.6) * 0.03; h.sy = 1 - Math.sin(k * 0.6) * 0.03;
    if(k % 6 === 0) for(const ex of [-34, 34]) endPart({type:'tear', x:W / 2 + ex, y:176, vx:(ex > 0 ? 1 : -1) * (1.2 + Math.random() * 1.4), vy:-2.4 - Math.random(), g:0.2, life:44, max:44});
  }
  // ---- D : la course
  else if(t < OP_SHOTS.E){
    const k = t - OP_SHOTS.D;
    if(k === 1){ END.parts = []; h.sx = 1; h.sy = 1; setFace(h, 'open', 100); SFX.power(); endTune([392, 523, 659, 784, 659, 784, 1047], 0.11, 'triangle', 0.05); }
    stepCharAnim(h, {vx:7, vy:0, onGround:true, facing:1});
  }
  // ---- E : le titre
  else {
    const k = t - OP_SHOTS.E;
    if(k === 1){ END.parts = []; SFX.win(); }
    if(k === 26) SFX.key();
  }
  for(const p of END.parts){ p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--; }
  END.parts = END.parts.filter(p => p.life > 0);
}

// un texte qui surgit, puis s'efface à l'image t1
function opCaption(text, y, t0, t1, size=24, col='#ffffff'){
  const t = OP.t - t0; if(t < 0 || OP.t > t1) return;
  const s = easeOutBack(clamp(t / 16, 0, 1));
  ctx.save(); ctx.globalAlpha = clamp((t1 - OP.t) / 12, 0, 1); ctx.translate(W / 2, y); ctx.scale(s, s);
  outlined(text, 0, 0, size, col, '#1d1442', 6, FD, 400, 'center');
  ctx.restore();
}
function opSky(top, mid, low){
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top); g.addColorStop(0.55, mid); g.addColorStop(1, low);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function opSun(x, y, r){
  softGlow(x, y, r * 4, r * 3, '255,214,150', 0.6);
  ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}
function opHills(off, far, mid, near, base=296){
  const th = {tree:shade(near, -0.12)};
  hillsLayer(off * 0.25, 216, 18, 0.008, 0.019, far, false, th);
  hillsLayer(off * 0.55, 254, 13, 0.011, 0.026, mid, true, th);
  hillsLayer(off, base, 2, 0.01, 0.023, near, false, th);
}
// le coussin rouge (avec la ficelle tant qu'elle n'est pas volée)
function opBed(x, y, s, full){
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(16,0,40,0.28)'; ctx.beginPath(); ctx.ellipse(0, 3, 30, 5, 0, 0, TAU); ctx.fill();
  rr(-27, -11, 54, 13, 6); ctx.fillStyle = '#d8434f'; ctx.fill(); ctx.strokeStyle = '#6a1422'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#ffd54a'; for(const dx of [-27, 27]){ ctx.beginPath(); ctx.arc(dx, -4, 2.6, 0, TAU); ctx.fill(); }
  if(full) drawFicelle(0, -15, 40, -0.05, true, 6.5);
  else { ctx.fillStyle = 'rgba(106,20,34,0.55)'; ctx.beginPath(); ctx.ellipse(0, -8, 19, 2.6, 0, 0, TAU); ctx.fill(); }
  ctx.restore();
}
// l'ombre qui vole la ficelle : on ne voit que sa cape et ses yeux
function opShadow(x, y, face, carry){
  ctx.save(); ctx.translate(x, y); ctx.scale(face, 1);
  softGlow(0, 0, 70, 50, '150,60,220', 0.45);
  ctx.fillStyle = '#1a0a33';
  ctx.beginPath(); ctx.moveTo(26, -6);
  ctx.quadraticCurveTo(10, -26, -12, -18);
  ctx.quadraticCurveTo(-40, -14, -74, -28 + Math.sin(frame * 0.4) * 5);
  ctx.quadraticCurveTo(-52, -2, -82, 8 + Math.sin(frame * 0.4 + 1) * 5);
  ctx.quadraticCurveTo(-46, 8, -60, 28 + Math.sin(frame * 0.4 + 2) * 5);
  ctx.quadraticCurveTo(-16, 22, 26, -6); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff4f5e'; for(const [ex, ey] of [[6, -11], [15, -8]]){ ctx.beginPath(); ctx.ellipse(ex, ey, 3, 1.9, 0.3, 0, TAU); ctx.fill(); }
  if(carry) drawFicelle(12, 14, 34, 0.25, true, 5.5);
  ctx.restore();
}

function drawOpening(){
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  const E = OP, t = E.t, h = E.hero;
  if(t < OP_SHOTS.B){
    // A : plan large, le soleil se lève
    const up = easeOutCubic(clamp(t / 200, 0, 1));
    opSky('#1a1f5e', '#b4507e', '#ffb56b');
    for(let i = 0; i < 26; i++){ ctx.fillStyle = `rgba(255,246,220,${(0.25 + 0.5 * Math.abs(Math.sin(frame * 0.03 + i))) * (1 - up * 0.7)})`; ctx.fillRect(hash(i * 13) * W, hash(i * 7) * 150, 1.5, 1.5); }
    opSun(150, lerp(250, 176, up), 34);
    cloud(420 + t * 0.12, 74, 0.8, {cloud:'rgba(255,214,232,0.75)', cloudShade:'rgba(214,150,200,0.7)'});
    cloud(40 + t * 0.08, 112, 0.6, {cloud:'rgba(255,214,232,0.55)', cloudShade:'rgba(214,150,200,0.5)'});
    opHills(0, '#6a3f86', '#3f6a6a', '#2f7a4a');
    opBed(OP_BED.x, OP_BED.y, 1, t < OP_THEFT);
    drawHero(h, 262, 298, 1.7, {rot:-1.5, rest:true});
    if(t < OP_THEFT + 20) for(let i = 0; i < 3; i++){
      const q = (t * 0.011 + i / 3) % 1;
      ctx.save(); ctx.globalAlpha = Math.sin(q * Math.PI); txt('z', 244 - q * 16, 258 - q * 48, 10 + q * 11, '#ffffff', 700); ctx.restore();
    }
    // l'ombre plonge sur le coussin et repart avec la ficelle
    const q = (t - 118) / 64;
    if(q > 0 && q < 1){
      const dark = Math.sin(q * Math.PI);
      ctx.fillStyle = `rgba(30,6,60,${0.4 * dark})`; ctx.fillRect(0, 0, W, H);
      opShadow(lerp(W + 60, -80, q), 60 + 230 * Math.sin(q * Math.PI) - 16, -1, t >= OP_THEFT);
    }
    drawEndParts();
    endBars(clamp(t / 20, 0, 1));
    opCaption('Un matin, dans les Plaines…', 62, 18, 108, 24, '#ffe58a');
    if(t > OP_SHOTS.B - 10){ ctx.fillStyle = `rgba(7,4,15,${(t - OP_SHOTS.B + 10) / 10})`; ctx.fillRect(0, 0, W, H); }
    return;
  }
  if(t < OP_SHOTS.C){
    // B : plus près, XELIAX et le coussin vide
    const k = t - OP_SHOTS.B;
    opSky('#3f4fa8', '#e8859a', '#ffcf8a');
    opSun(96, 150, 42);
    opHills(40, '#7a5a9a', '#4f8a6a', '#3a9a58', 268);
    const z = 1 + 0.08 * easeInOutCubic(clamp(k / 90, 0, 1));
    ctx.save(); ctx.translate(W / 2, 270); ctx.scale(z, z); ctx.translate(-W / 2, -270);
    opBed(470, 276, 2.2, false);
    drawHero(h, 216, 274, 3.2, {});
    ctx.restore();
    endBars(1);
    if(k > 70){ ctx.save(); ctx.globalAlpha = clamp((k - 70) / 8, 0, 1); bubbleAt('Hein ?', 286, 120); ctx.restore(); }
    if(k < 10){ ctx.fillStyle = `rgba(7,4,15,${1 - k / 10})`; ctx.fillRect(0, 0, W, H); }
    return;
  }
  if(t < OP_SHOTS.D){
    // C : très gros plan sur un fond qui tourne
    const k = t - OP_SHOTS.C;
    const sx = shake * Math.sin(frame * 1.7), sy = shake * Math.cos(frame * 2.1);
    const g = ctx.createRadialGradient(W / 2, 170, 20, W / 2, 170, 420);
    g.addColorStop(0, '#ffb3a0'); g.addColorStop(0.45, '#c2457a'); g.addColorStop(1, '#2a0f5c');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, 170); if(!REDUCED) ctx.rotate(k * 0.012);
    for(let i = 0; i < 18; i++){ ctx.rotate(TAU / 18); ctx.fillStyle = i % 2 ? 'rgba(20,4,50,0.2)' : 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-40, -500); ctx.lineTo(40, -500); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    ctx.save(); ctx.translate(sx, sy);
    drawHero(h, W / 2, 336 + (1 - easeOutCubic(clamp(k / 18, 0, 1))) * 60, 6.6, {});
    drawEndParts();
    ctx.restore();
    endBars(1);
    opCaption('MA FICELLE AUX OLIVES ?!', 66, OP_SHOTS.C + 12, OP_SHOTS.D + 12, 30, '#ffe58a');
    if(k < 12 && !REDUCED){ ctx.fillStyle = `rgba(255,255,255,${1 - k / 12})`; ctx.fillRect(0, 0, W, H); }
    return;
  }
  if(t < OP_SHOTS.E){
    // D : la course, le décor défile
    const k = t - OP_SHOTS.D;
    opSky('#2e7ac0', '#8fd0ec', '#ffe2a8');
    opSun(520, 66, 26);
    const off = k * (REDUCED ? 4 : 12);
    cloud(W - ((off * 0.2 + 120) % (W + 120)), 70, 0.9, {cloud:'#ffffff', cloudShade:'#d6ecff'});
    cloud(W - ((off * 0.14 + 420) % (W + 120)), 112, 0.65, {cloud:'#ffffff', cloudShade:'#d6ecff'});
    opHills(off, '#b7e6a8', '#88d07e', '#4fb35a', 292);
    if(!REDUCED) for(let i = 0; i < 9; i++){
      const lx = W - ((off * 1.6 + hash(i * 5) * W) % (W + 90)), ly = 196 + hash(i * 11) * 92;
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(lx, ly, 34 + hash(i * 3) * 40, 1.6);
    }
    const q = easeOutCubic(clamp(k / 26, 0, 1)), out = easeInCubic(clamp((k - 62) / 26, 0, 1));
    drawHero(h, lerp(-50, 250, q) + out * 460, 292, 2.2, {});
    endBars(1);
    opCaption('En route !', 66, OP_SHOTS.D + 12, OP_SHOTS.E - 4, 30, '#ffffff');
    if(k < 10 && !REDUCED){ ctx.fillStyle = `rgba(255,255,255,${1 - k / 10})`; ctx.fillRect(0, 0, W, H); }
    return;
  }
  // E : le titre
  const k = t - OP_SHOTS.E;
  ctx.fillStyle = '#0d0820'; ctx.fillRect(0, 0, W, H);
  for(let i = 0; i < 44; i++){ ctx.fillStyle = `rgba(255,246,220,${0.2 + 0.5 * Math.abs(Math.sin(frame * 0.03 + i))})`; ctx.fillRect(hash(i * 13) * W, hash(i * 7) * H, 1.5, 1.5); }
  softGlow(W / 2, 170, 300, 150, '90,50,200', 0.3);
  const a = easeOutCubic(clamp(k / 18, 0, 1));
  ctx.save(); ctx.globalAlpha = a; heading('L\'aventure', W / 2, 118 + (1 - a) * 10, 26, '#f3ead6'); ctx.restore();
  // le titre de l'accueil : ses lettres arrivent une à une, réglées par menu.introT
  const intro = menu.introT; menu.introT = (k - 2) * 1.8;
  waveTitle('spécifique', W / 2, 172, 54, '#ffffff');
  menu.introT = intro;
  const f = easeOutCubic(clamp((k - 24) / 22, 0, 1));
  if(f > 0){ ctx.save(); ctx.globalAlpha = f; drawFicelle(W / 2, 194, 236 * (0.4 + 0.6 * f), -0.015, false, 9); ctx.restore(); }
  const c = clamp((k - 38) / 16, 0, 1);
  if(c > 0){
    ctx.save(); ctx.globalAlpha = c;
    txt('Saison 1 : La ficelle disparue', W / 2, 234, 15, '#e9e2ff', 500);
    txt('Chapitre 1 : Les Plaines', W / 2, 258, 13, '#bfb6f0', 500);
    ctx.restore();
  }
}
