// =====================================================================
//  SEASON 2 ENDING: a close-up cinematic once XELIAX has the ficelle back
//   A  the camera closes in on him, in slow motion
//   B  extreme close-up: sparkling eyes, tears of joy
//   C  a picnic at sunset with all his friends (and the magpie)
//   D  the first bite, a wink, a heart-shaped iris
//   E  "Fin"
// =====================================================================
const END = {t:0, hero:makeCharAnim(), parts:[], skippable:false, friends:[], pieces:[], pie:null};
const END_LEN = 980;
const END_SHOTS = {A:0, B:170, C:370, D:680, E:860};
function startEnding(){
  setState('ending');
  const E = END;
  E.t = 0; E.parts = []; E.pieces = [];
  E.fx = player.x + player.w / 2; E.fy = player.y + player.h / 2;
  E.cx0 = camX; E.cy0 = camY;
  E.hero = makeCharAnim(); E.hero.fx = 1;
  E.skippable = !!save.endingSeen;
  save.endingSeen = true; persist();
  E.friends = [
    {who:'farine', x0:-40, tx:190, t:0, blink:0, near:0},
    {who:'gaston', x0:-90, tx:118, t:1, blink:0, near:0},
    {who:'olivia', x0:W + 40, tx:452, t:2, blink:0, near:0},
    {who:'levain', x0:W + 90, tx:526, t:3, blink:0, near:0},
  ];
  E.pie = {x:W + 60, y:-60, w:48, h:40, phase:1, state:'hover', face:-1, t:0, hitT:0, inv:0, lost:true, happy:0};
  timerRunning = false;
}
function endPart(o){ END.parts.push(Object.assign({vx:0, vy:0, g:0.1, life:60, max:60, s:1, rot:0, vr:0}, o)); }
function endTune(notes, gap, type='triangle', v=0.045){ notes.forEach((f, i) => { if(f) tone(f, gap * 0.9, type, v, null, i * gap); }); }

function updateEnding(){
  const E = END, t = ++E.t, h = E.hero;
  if(E.skippable && t > 30 && t < END_SHOTS.E && input.jumpPressed){ E.t = END_SHOTS.E; E.parts = []; }
  // ---- A: slow motion in the arena
  if(t < END_SHOTS.B){
    if(t % 2 === 0){ updateParticles(); }
    stepCharAnim(anim, {vx:0, vy:0, onGround:true, facing:player.facing, cheer:true});
    if(t === 1) endTune([392, 523, 659, 784], 0.22, 'sine', 0.05);
    if(t % 18 === 0) confetti(player.x + player.w / 2, player.y - 10, 6);
    if(t === 150){ SFX.key(); }
  }
  // ---- B: close-up
  else if(t < END_SHOTS.C){
    const k = t - END_SHOTS.B;
    if(k === 1){ SFX.win(); setFace(h, 'open', 400); E.parts = []; }
    stepCharAnim(h, {vx:0, vy:0, onGround:true, facing:1, look:{x:0.55, y:-0.45}});
    h.sx = 1 + Math.sin(k * 0.25) * 0.03; h.sy = 1 - Math.sin(k * 0.25) * 0.03;
    if(k % 7 === 0) for(const ex of [-28, 26]) endPart({type:'tear', x:W / 2 + ex, y:178, vx:(ex > 0 ? 1 : -1) * (0.6 + Math.random()), vy:-1.5 - Math.random(), g:0.22, life:50, max:50});
    if(k % 12 === 0) endPart({type:'heart', x:W / 2 + (Math.random() - 0.5) * 300, y:330, vx:(Math.random() - 0.5) * 0.8, vy:-1.4 - Math.random(), g:-0.01, life:110, max:110, s:0.8 + Math.random() * 0.8});
    if(k === 40){ tone(880, 0.3, 'sine', 0.05, 1320); }
  }
  // ---- C: the picnic
  else if(t < END_SHOTS.D){
    const k = t - END_SHOTS.C;
    if(k === 1){ E.parts = []; setFace(h, 'smile', 0); endTune([523, 659, 784, 659, 698, 880, 784, 0, 659, 784, 1047], 0.2); }
    for(const f of E.friends){ f.t += 0.05; if(f.blink > 0) f.blink--; else if(Math.random() < 0.01) f.blink = 7; }
    const share = k >= 120 && k < 150;
    stepCharAnim(h, {vx:0, vy:k > 95 && k < 125 ? -2 : 0, onGround:true, facing:k > 230 ? 1 : (Math.floor(k / 60) % 2 ? -1 : 1), cheer:share, wave:k < 60});
    if(k === 100){ SFX.power(); }
    if(k === 130){
      // the ficelle in five pieces: one for each friend, one for later
      SFX.crack();
      for(let i = 0; i < 4; i++){ const f = E.friends[i]; E.pieces.push({x:W / 2 + 14, y:258, x1:f.tx, y1:276, t:0, d:40 + i * 6, to:i}); }
      for(let i = 0; i < 12; i++) endPart({type:'star', x:W / 2 + 14, y:256, vx:(Math.random() - 0.5) * 4, vy:-1 - Math.random() * 2, g:0.05, life:40, max:40, s:1});
    }
    if(k === 170){ SFX.warn(); }
    const P = E.pie;
    if(k >= 170){
      // the magpie comes down, ashamed
      const q = clamp((k - 170) / 60, 0, 1);
      P.x = lerp(W + 60, 560, easeOutCubic(q)); P.y = lerp(-60, 248, easeOutCubic(q)) - Math.sin(q * Math.PI) * 30;
      P.t++; P.state = q < 1 ? 'hover' : 'perch';
    }
    if(k === 236){ E.pieces.push({x:W / 2 + 14, y:258, x1:584, y1:262, t:0, d:44, to:'pie'}); SFX.menu(); }
    for(const p of E.pieces){
      p.t++;
      if(p.t === p.d){
        if(p.to === 'pie'){ P.happy = 1; SFX.coin(); for(let i = 0; i < 8; i++) endPart({type:'heart', x:584, y:250, vx:(Math.random() - 0.5) * 1.6, vy:-1 - Math.random(), g:-0.01, life:80, max:80, s:0.8}); }
        else { tone(660 + p.to * 110, 0.1, 'triangle', 0.04); }
      }
    }
    if(k > 250 && k % 9 === 0){ tone(150 + Math.random() * 80, 0.05, 'square', 0.02); endPart({type:'crumb', x:[190, 118, 452, 526, W / 2, 584][Math.floor(Math.random() * 6)] + (Math.random() - 0.5) * 10, y:262, vx:(Math.random() - 0.5) * 2, vy:-1.5, g:0.2, life:30, max:30}); }
    if(k % 6 === 0) endPart({type:'firefly', x:Math.random() * W, y:180 + Math.random() * 140, vx:(Math.random() - 0.5) * 0.4, vy:-0.2, g:0, life:120, max:120});
  }
  // ---- D: the bite, close up
  else if(t < END_SHOTS.E){
    const k = t - END_SHOTS.D;
    stepCharAnim(h, {vx:0, vy:0, onGround:true, facing:1, look:{x:0.4, y:0.1}});
    if(k === 1){ setFace(h, 'open', 40); E.parts = []; }
    if(k === 44){ SFX.crack(); addShake(6); for(let i = 0; i < 26; i++) endPart({type:'crumb', x:W / 2 + 40, y:246, vx:(Math.random() - 0.3) * 5, vy:-2 - Math.random() * 3, g:0.25, life:60, max:60}); }
    if(k > 44 && k < 110){ setFace(h, Math.floor(k / 8) % 2 ? 'o' : 'smile', 3); if(k % 8 === 0) tone(150 + Math.random() * 60, 0.05, 'square', 0.03); }
    if(k === 116){ h.wink = 1; setFace(h, 'smile', 200); tone(1320, 0.1, 'triangle', 0.05); tone(1760, 0.14, 'triangle', 0.04, null, 0.08); }
  }
  // ---- E: the end
  else {
    const k = t - END_SHOTS.E;
    if(k === 1){ h.wink = 0; endTune([523, 659, 784, 1047, 784, 1047, 1319], 0.18, 'triangle', 0.05); }
    // the end card stays up until Space is pressed
    if(t >= END_LEN){
      E.t = END_LEN;
      if(input.jumpPressed){ SFX.menu(); chapterClear(); return; }
    }
  }
  for(const p of E.parts){ p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--; }
  E.parts = E.parts.filter(p => p.life > 0);
}

function drawEndParts(){
  for(const p of END.parts){
    const a = clamp(p.life / p.max, 0, 1);
    ctx.save(); ctx.globalAlpha = Math.min(1, a * 2);
    if(p.type === 'tear'){ ctx.fillStyle = '#9fe0ff'; ctx.beginPath(); ctx.ellipse(p.x, p.y, 3.2 * p.s, 4.4 * p.s, 0, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(p.x - 1, p.y - 1.5, 1, 0, TAU); ctx.fill(); }
    else if(p.type === 'heart') heartIcon(p.x, p.y, 13 * p.s, '#ff5d8f', '#7a1236');
    else if(p.type === 'star'){ ctx.fillStyle = '#ffe066'; star(p.x, p.y, 4 * p.s, frame * 0.1); }
    else if(p.type === 'crumb'){ ctx.fillStyle = '#d9a05a'; ctx.fillRect(p.x - 1.8, p.y - 1.8, 3.6, 3.6); }
    else if(p.type === 'firefly'){ ctx.globalAlpha = a * (0.5 + 0.5 * Math.sin(frame * 0.2 + p.x)); softGlow(p.x, p.y, 8, 8, '255,236,140', 0.7); ctx.fillStyle = '#fff6c0'; ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
}
function endBars(k){ const bar = 26 * k; ctx.fillStyle = '#07040f'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar); }
function endCaption(text, y, t0, size=30, col='#ffffff'){
  const t = END.t - t0; if(t < 0) return;
  const s = easeOutBack(clamp(t / 16, 0, 1));
  ctx.save(); ctx.translate(W / 2, y); ctx.scale(s, s);
  outlined(text, 0, 0, size, col, '#1d1442', 6, FD, 400, 'center');
  ctx.restore();
}

function drawEnding(){
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  const E = END, t = E.t, h = E.hero;
  if(t < END_SHOTS.B){
    // A: the arena, the camera slowly closing in on XELIAX
    const k = easeInOutCubic(clamp(t / 140, 0, 1)), z = 1 + 1.7 * k;
    const fx = player.x + player.w / 2, fy = player.y + player.h / 2 - 8;
    const cx = lerp(E.cx0, fx - W / 2, k), cy = lerp(E.cy0, fy - H / 2, k);
    viewX = cx; viewY = cy;
    drawBackground(cx, cy);
    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-(cx + W / 2), -(cy + H / 2));
    drawWorld();
    ctx.restore();
    drawLighting(W / 2, H / 2);
    endBars(clamp(t / 20, 0, 1));
    if(t > 150){ ctx.fillStyle = `rgba(255,255,255,${(t - 150) / 20})`; ctx.fillRect(0, 0, W, H); }
    return;
  }
  if(t < END_SHOTS.C){
    // B: extreme close-up on a burst of light
    const k = t - END_SHOTS.B;
    const g = ctx.createRadialGradient(W / 2, 170, 20, W / 2, 170, 420);
    g.addColorStop(0, '#fff3c4'); g.addColorStop(0.45, '#ffb36b'); g.addColorStop(1, '#c2457a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, 170); ctx.rotate(k * 0.004);
    for(let i = 0; i < 18; i++){ ctx.rotate(TAU / 18); ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.13)' : 'rgba(255,230,160,0.12)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-40, -500); ctx.lineTo(40, -500); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    const zoomIn = 6.2 + easeOutCubic(clamp(k / 60, 0, 1)) * 0.8;
    drawHero(h, W / 2, 330 + (1 - easeOutCubic(clamp(k / 24, 0, 1))) * 60, zoomIn, {ficelle:true});
    // the ficelle shines in his eyes
    for(const [ex, ey] of [[-3.6 * zoomIn, -24.3 * zoomIn], [4 * zoomIn, -24.9 * zoomIn]]){
      const tw = 0.6 + 0.4 * Math.sin(frame * 0.3 + ex);
      ctx.fillStyle = `rgba(255,255,255,${0.9 * tw})`; star(W / 2 + ex - 6, 330 + ey - 10, 7 * tw + 3, frame * 0.05);
      ctx.fillStyle = `rgba(255,236,150,${0.7 * tw})`; star(W / 2 + ex + 7, 330 + ey + 6, 4 * tw + 2, -frame * 0.05);
    }
    drawEndParts();
    endBars(1);
    endCaption('MA FICELLE AUX OLIVES !!!', 64, END_SHOTS.B + 30, 30, '#ffe58a');
    if(k < 12){ ctx.fillStyle = `rgba(255,255,255,${1 - k / 12})`; ctx.fillRect(0, 0, W, H); }
    return;
  }
  if(t < END_SHOTS.D){
    // C: a picnic at sunset with everybody
    const k = t - END_SHOTS.C;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#3a2a7a'); g.addColorStop(0.45, '#e0708a'); g.addColorStop(0.8, '#ffc27a'); g.addColorStop(1, '#ffe0a0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const sunY = 210 + k * 0.08;
    softGlow(W / 2, sunY, 170, 120, '255,220,150', 0.6);
    ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(W / 2, sunY, 46, 0, TAU); ctx.fill();
    for(let i = 0; i < 14; i++){ ctx.fillStyle = `rgba(255,255,255,${0.4 + 0.4 * Math.sin(frame * 0.05 + i)})`; ctx.fillRect(hash(i * 7) * W, hash(i * 3) * 120, 1.5, 1.5); }
    // far islands of the sky world, and the hill
    ctx.fillStyle = 'rgba(90,50,110,0.55)'; skyIsland(110, 150, 0.6, 'rgba(90,50,110,0.55)', 'rgba(120,70,130,0.6)', false); skyIsland(540, 120, 0.5, 'rgba(90,50,110,0.5)', 'rgba(120,70,130,0.55)', true);
    ctx.fillStyle = '#5a3a6a'; ctx.beginPath(); ctx.ellipse(W / 2, 400, 520, 130, 0, Math.PI, TAU); ctx.fill();
    ctx.fillStyle = '#7a4a6a'; ctx.beginPath(); ctx.ellipse(W / 2, 420, 420, 128, 0, Math.PI, TAU); ctx.fill();
    // the blanket
    ctx.save(); ctx.translate(W / 2, 300); ctx.scale(1, 0.32);
    ctx.beginPath(); ctx.arc(0, 0, 170, 0, TAU); ctx.clip();
    for(let i = -9; i < 9; i++) for(let j = -9; j < 9; j++){ ctx.fillStyle = (i + j) % 2 ? '#ff6a6a' : '#fff2e8'; ctx.fillRect(i * 20, j * 20, 20, 20); }
    ctx.restore();
    // friends walking in
    for(const f of E.friends){
      const q = easeOutCubic(clamp((k - 10 - E.friends.indexOf(f) * 12) / 70, 0, 1));
      const x = lerp(f.x0, f.tx, q), walking = q < 1;
      const n = {who:f.who, t:f.t + (walking ? k * 0.2 : 0), blink:f.blink};
      drawNpc(n, x, 300 - (walking ? Math.abs(Math.sin(k * 0.3)) * 3 : 0), 1.9, k > 250 && Math.sin(k * 0.3 + f.t) > 0, f.tx < W / 2 ? 1 : -1);
    }
    // XELIAX in the middle, with the ficelle
    const hasF = k < 130;
    drawHero(h, W / 2, 300, 2.3, {ficelle:hasF});
    // flying pieces
    for(const p of E.pieces){
      if(p.t >= p.d){ if(p.to === 'pie' || true){ /* eaten */ } continue; }
      const q = p.t / p.d;
      const x = lerp(p.x, p.x1, q), y = lerp(p.y, p.y1, q) - Math.sin(q * Math.PI) * 70;
      drawFicelle(x, y, 14, q * 8, false, 5);
    }
    // the magpie
    if(k >= 170){
      const P = E.pie;
      ctx.save();
      if(P.state === 'perch' && !P.happy){ ctx.translate(P.x + 24, P.y + 20); ctx.rotate(Math.sin(frame * 0.05) * 0.05); ctx.translate(-P.x - 24, -P.y - 20); }
      if(P.happy){ const hop = Math.abs(Math.sin(frame * 0.18)) * 6; ctx.translate(0, -hop); }
      drawMagpie(P);
      ctx.restore();
      if(P.state === 'perch' && !P.happy){ ctx.fillStyle = 'rgba(160,200,255,0.9)'; ctx.beginPath(); ctx.ellipse(P.x + 40, P.y + 6 + (frame % 40) * 0.4, 1.8, 2.6, 0, 0, TAU); ctx.fill(); }
    }
    drawEndParts();
    endBars(1);
    if(k > 95 && k < 175){ ctx.save(); ctx.globalAlpha = clamp((k - 95) / 10, 0, 1) * clamp((175 - k) / 10, 0, 1); bubbleAt('On partage !', W / 2 + 10, 196); ctx.restore(); }
    if(k > 236 && k < 300){ ctx.save(); ctx.globalAlpha = clamp((k - 236) / 10, 0, 1) * clamp((300 - k) / 10, 0, 1); bubbleAt('Tiens, pour toi aussi !', W / 2 + 40, 196); ctx.restore(); }
    if(k > 300) endCaption('Tout le monde a goûté !', 66, END_SHOTS.C + 300, 28, '#ffe58a');
    if(k < 14){ ctx.fillStyle = `rgba(7,4,15,${1 - k / 14})`; ctx.fillRect(0, 0, W, H); }
    return;
  }
  if(t < END_SHOTS.E){
    // D: the first bite, very close
    const k = t - END_SHOTS.D;
    const g = ctx.createRadialGradient(W / 2, 180, 30, W / 2, 180, 380);
    g.addColorStop(0, '#ffd9a8'); g.addColorStop(1, '#9a4a7a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    drawHero(h, W / 2 - 30, 340, 5.6, {});
    // his piece of ficelle, getting shorter
    const len = k < 44 ? 76 : 52;
    const bx = (k < 44 ? lerp(W / 2 + 150, W / 2 + 70, easeInOutCubic(clamp(k / 40, 0, 1))) : W / 2 + 82), by = 248;
    drawFicelle(bx, by, len, -0.1, true, 22);
    if(k >= 44){ ctx.fillStyle = '#f4d9a0'; for(const dy of [-8, 0, 8]){ ctx.beginPath(); ctx.arc(bx - len / 2 + 2, by + dy, 5, 0, TAU); ctx.fill(); } }
    if(k >= 44 && k < 70) endCaption('CRUNCH !', 92, END_SHOTS.D + 44, 42, '#ffffff');
    drawEndParts();
    // heart-shaped iris closing on his face
    if(k > 140){
      const q = easeInCubic(clamp((k - 140) / 40, 0, 1)), s = lerp(900, 0, q);
      ctx.save();
      ctx.fillStyle = '#07040f';
      ctx.beginPath(); ctx.rect(0, 0, W, H);
      const hx = W / 2 - 30, hy = 200 - s * 0.45;
      ctx.moveTo(hx, hy + s * 0.3);
      ctx.bezierCurveTo(hx, hy, hx - s * 0.5, hy - s * 0.02, hx - s * 0.5, hy + s * 0.3);
      ctx.bezierCurveTo(hx - s * 0.5, hy + s * 0.58, hx - s * 0.12, hy + s * 0.74, hx, hy + s * 0.95);
      ctx.bezierCurveTo(hx + s * 0.12, hy + s * 0.74, hx + s * 0.5, hy + s * 0.58, hx + s * 0.5, hy + s * 0.3);
      ctx.bezierCurveTo(hx + s * 0.5, hy - s * 0.02, hx, hy, hx, hy + s * 0.3);
      ctx.fill('evenodd');
      ctx.restore();
    }
    endBars(1);
    return;
  }
  // E: the end card
  const k = t - END_SHOTS.E;
  ctx.fillStyle = '#07040f'; ctx.fillRect(0, 0, W, H);
  for(let i = 0; i < 40; i++){ ctx.fillStyle = `rgba(255,246,220,${0.2 + 0.5 * Math.abs(Math.sin(frame * 0.03 + i))})`; ctx.fillRect(hash(i * 13) * W, hash(i * 7) * H, 1.5, 1.5); }
  const a = clamp(k / 30, 0, 1);
  ctx.save(); ctx.globalAlpha = a;
  heading('Fin', W / 2, 160, 64, '#ffe58a');
  txt('Saison 2 : La pie voleuse', W / 2, 196, 15, '#e9e2ff', 500);
  drawFicelle(W / 2, 222, 180, -0.02, true, 9);
  txt('Merci d\'avoir joué avec XELIAX !', W / 2, 262, 13, '#bfb6f0', 500);
  ctx.restore();
  if(t >= END_LEN - 20 && (Math.floor(frame / 30) % 2 === 0 || REDUCED)) promptLine(TOUCH ? [{key:'▲'}, {text:'continuer'}] : [{key:'Espace'}, {text:'continuer'}], 318);
}
function drawEndSkip(){
  if(!END.skippable || END.t < 30 || END.t >= END_SHOTS.E) return;
  const keyLabel = TOUCH ? '▲' : 'Espace';
  ctx.font = `700 11px ${FU}`;
  const kw = Math.max(19, ctx.measureText(keyLabel).width + 13);
  keycap(keyLabel, W - 70 - kw, H - 8);
  txt('passer', W - 62, H - 8.5, 12, '#bfb6f0', 500, 'left');
}
function bubbleAt(text, x, y){
  ctx.font = `600 14px ${FU}`;
  const tw = ctx.measureText(text).width + 24, th = 30;
  rr(x, y - th, tw, th, 14); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#1d1442'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + 12, y - 1); ctx.lineTo(x - 2, y + 12); ctx.lineTo(x + 28, y - 1); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
  txt(text, x + 12, y - 10, 14, '#1d1442', 600, 'left');
}

