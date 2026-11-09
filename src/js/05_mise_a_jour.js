// =====================================================================
//  UPDATE
// =====================================================================
function clearPresses(){ input.jumpPressed = input.shootPressed = input.dashPressed = false; }

// remember where everything was before this step, so frames between steps can be interpolated
function snapshot(){
  prevCamX = camX; prevCamY = camY;
  player.px = player.x; player.py = player.y;
  for(const list of [platforms, enemies, bats, bullets, shots, particles]) for(const e of list){ e.px = e.x; e.py = e.y; }
  if(boss){ boss.px = boss.x; boss.py = boss.y; }
}
const ix = e => e.px === undefined ? e.x : e.px + (e.x - e.px) * ALPHA;
const iy = e => e.py === undefined ? e.y : e.py + (e.y - e.py) * ALPHA;

function step(){
  snapshot();
  frame++; stateT++;
  updateParticles();
  updatePopups();
  updateAmbient();
  updateHud();
  if(shake > 0){ shake *= 0.86; if(shake < 0.25) shake = 0; }
  if(toast.t > 0) toast.t--;
  if(bannerT > 0 && state === 'play') bannerT--;

  if(fadeDir !== 0){
    fade += fadeDir * 0.045;
    if(fade >= 1 && fadeDir > 0){
      fade = 1;
      const f = pendingAction; pendingAction = null;
      if(f) f();
      fadeDir = -1;
    } else if(fade <= 0 && fadeDir < 0){ fade = 0; fadeDir = 0; }
    if(fadeDir > 0){
      if(state === 'play'){ if(exitT > 0) updateExit(); stepHero(); }
      clearPresses();
      return;
    }
  }

  if(state === 'title'){ updateMenu(); clearPresses(); return; }
  if(state === 'pet'){ updatePet(); clearPresses(); return; }
  if(state === 'ending'){ updateEnding(); clearPresses(); return; }
  if(state === 'opening'){ updateOpening(); clearPresses(); return; }
  if(state === 'talk'){ stepTalk(); stepHero(); clearPresses(); return; }
  if(state === 'chapter' && clearInfo && clearInfo.teaser) updateTeaser();
  if(state !== 'play'){ updateUiHero(); clearPresses(); return; }
  // a boss demo is on screen: everything waits until it is closed
  if(bossDemo){ updateBossDemo(); clearPresses(); return; }

  // the final blow freezes the action for a split second
  if(hitStop > 0){ hitStop--; updateCamera(); clearPresses(); return; }
  if(djTake > 0 && --djTake === 0){
    showToast('La pie t\'a pris ton double saut : ici, on grimpe !', 190);
    ring(player.x + player.w / 2, player.y + player.h / 2, POWER_COLORS.doubleJump, 6, 46, 26);
    burst(player.x + player.w / 2, player.y + player.h / 2, 10, POWER_COLORS.doubleJump, 2.4, 30, 0.02, 3, 'star');
    SFX.warn();
  }
  if(cine) updateCine();
  if(launch){ updateLaunch(); clearPresses(); return; }
  if(!timerRunning && !cine && (input.left || input.right || input.jumpPressed || input.shootPressed)){ timerRunning = true; if(chapter.bonus && chapter.parTime && rIndex === 0 && elapsed - chStartTime < 100) showToast(`Temps à battre : ${fmt(chapter.parTime)} — fonce !`, 200); }
  if(timerRunning && !cine) elapsed += STEP;        // the clock waits during cinematics
  if(phaseT > 0 && --phaseT === 0) transition(() => loadRoom(chIndex, rIndex + 1));

  updateWorld();
  notePowers();   // v54 : un pouvoir reçu reste visible dans les menus

  if(exitT > 0){ updateExit(); updateCamera(); stepHero(); clearPresses(); return; }
  if(finaleT > 0){
    // a little celebration, then XELIAX waits with the ficelle until Space is pressed
    const go = finaleT >= finaleEnd() && input.jumpPressed;
    finaleT++;
    updateCamera();
    updatePlayer();           // controls are ignored during the finale
    stepCharAnim(anim, {vx:player.vx, vy:player.vy, onGround:player.onGround, facing:player.facing, cheer:!steal || finaleT < 200});
    anim.sx = player.sx; anim.sy = player.sy;
    if(!room.ending2) updateFireworks(finaleT);
    if(steal) updateSteal(finaleT);
    else if(frame % 22 === 0) confetti(player.x + player.w / 2, player.y - 6, finaleT < finaleEnd() ? 12 : 4);
    if(go){ SFX.menu(); if(room.ending2) startEnding(); else chapterClear(); }
    clearPresses();
    return;
  }
  updateCamera();

  if(player.dead){
    if(--respawnT <= 0){
      resetPlayer();
      // a climb against rising lava starts again from the bottom
      if(room.lava && !room.boss){ lavaY = room.lava.start; lavaDelay = room.lava.delay; }
      player.invuln = 90;
      anim.appear = 0;
      ring(player.x + player.w/2, player.y + player.h/2, HERO.light, 4, 36, 24);
      sparkle(player.x + player.w/2, player.y + 6, 10, '#ffffff');
      SFX.bloop();
    }
    clearPresses();
    return;
  }
  updatePlayer();
  srTick();
  if(state === 'play') updateIdle();
  stepHero();
  clearPresses();
}

// t 1-100 cheering, 100-190 little hops of joy, 200 he's about to eat it, 205-245 the magpie swoops in, 245 snatch, then she's off
function updateSteal(t){
  const S = steal, hx = player.x + player.w / 2 + player.facing * 14, hy = player.y + 6;
  S.px = S.x; S.py = S.y;
  if(t < 100 && frame % 22 === 0) confetti(player.x + player.w / 2, player.y - 6, 10);
  if(t >= 100 && t < 190 && (t - 100) % 30 === 0 && player.onGround){
    player.vy = -6; player.onGround = false; player.standingOn = null; player.sy = 0.8; player.sx = 1.2;
    tone(660 + (t - 100) * 4, 0.08, 'triangle', 0.04); confetti(player.x + player.w / 2, player.y - 6, 6);
  }
  if(t === 200){ setFace(anim, 'smile', 30); showToast('Miam… enfin ma ficelle aux olives !', 70); }
  if(t === 228){ setFace(anim, 'open', 40); tone(520, 0.08, 'sine', 0.04); }
  if(t === 205){ S.on = true; S.x0 = camX + W + 70; S.y0 = camY - 60; SFX.warn(); }
  if(S.on && !S.got){
    // down from the top right in a curve, straight to the ficelle
    const q = clamp((t - 205) / 40, 0, 1), e = q * q, cx = hx + 140, cy = hy - 170;
    S.x = (1 - e) * (1 - e) * S.x0 + 2 * (1 - e) * e * cx + e * e * hx - S.w / 2;
    S.y = (1 - e) * (1 - e) * S.y0 + 2 * (1 - e) * e * cy + e * e * hy - S.h / 2;
    S.state = q > 0.55 ? 'dive' : 'hover'; S.vx = -3; S.vy = 3;
    if(t === 245){
      S.got = true; S.lost = false; S.state = 'hover'; S.x1 = S.x; S.y1 = S.y;
      SFX.crack(); addShake(5); setFace(anim, 'o', 140);
      player.vy = -3.5; player.onGround = false; player.standingOn = null; player.sx = 0.75; player.sy = 1.3;
      burst(hx, hy, 12, '#1a1430', 2.2, 30, 0.04, 3, 'puff');
      for(let i = 0; i < 8; i++) particles.push({x:hx, y:hy, vx:(Math.random() - 0.5) * 3, vy:-1 - Math.random() * 2, life:60, max:60, color:'#f4f2ff', grav:0.04, size:3, type:'dot'});
      showToast('La pie ! Elle a volé la ficelle aux olives !', 85);
    }
  } else if(S.got){
    // and off she goes, up and away to the left, cackling
    const k = t - 245, q = clamp(k / 70, 0, 1);
    S.x = S.x1 - k * 4.6 - q * q * 60; S.y = S.y1 - k * 0.9 - Math.sin(k * 0.2) * 8;
    S.face = -1; S.state = 'hover';
    if(k % 14 === 0 && k < 60) tone(1200 - k * 6, 0.06, 'square', 0.025, 900 - k * 4);
    if(k === 1){ hitStop = REDUCED ? 0 : 20; tone(880, 0.12, 'square', 0.04, 220); tone(110, 0.6, 'sawtooth', 0.05, 55); addShake(10); }
    if(k === 30){ setFace(anim, 'hurt', 120); player.vy = -6.5; player.onGround = false; player.standingOn = null; }
    if(k === 50){ player.vy = -6.5; player.onGround = false; player.standingOn = null; }
    if(k > 100) S.on = false;
  }
}
// fireworks over the end of season 1: rockets rise from below the screen and burst into stars
let fireworks = [];
const FW_COLORS = ['#ff5c9a', '#ffd54a', '#7df9ff', '#c8ff6a', '#b98cff', '#ff8a3c'];
function updateFireworks(t){
  if(t === 1) fireworks = [];
  const until = steal ? 200 : 100000;
  if(t < until && t % (t < 60 ? 12 : 20) === 1){
    fireworks.push({x:camX + 50 + Math.random() * (W - 100), y:camY + H + 10, vy:-6.6 - Math.random() * 1.8,
                    col:FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)], fuse:38 + Math.random() * 22});
    tone(320 + Math.random() * 200, 0.18, 'triangle', 0.015, 900);
  }
  for(const f of fireworks){
    f.y += f.vy; f.vy += 0.09; f.fuse--;
    if(frame % 2 === 0) particles.push({x:f.x + (Math.random() - 0.5) * 2, y:f.y + 4, vx:0, vy:0.6, life:16, max:16, color:'#ffe9a8', grav:0.02, size:2, type:'dot'});
    if(f.fuse <= 0 || f.vy >= -0.6){
      f.dead = true;
      burst(f.x, f.y, 34, f.col, 4.2, 55, 0.04, 3, 'star');
      burst(f.x, f.y, 14, '#ffffff', 2, 30, 0.02, 2, 'dot');
      ring(f.x, f.y, f.col, 6, 70, 22);
      tone(150 + Math.random() * 60, 0.25, 'sawtooth', 0.025, 60); addShake(1.2);
    }
  }
  fireworks = fireworks.filter(f => !f.dead);
}
// screen overlay: the big VICTOIRE !, the snatch (flash + QUOI ?!), and the « À suivre » title card
function drawFinaleOverlay(cx, cy){
  if(finaleT <= 0 || !room || room.ending2) return;
  const t = finaleT;
  if(t > 8 && t < 200){
    const a = clamp((t - 8) / 10, 0, 1) * clamp((200 - t) / 16, 0, 1), s = 1 + 0.7 * Math.max(0, 1 - (t - 8) / 12);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 150); ctx.scale(s, s); ctx.rotate(Math.sin(t * 0.05) * 0.03);
    outlined('VICTOIRE !', 0, 0, 46, '#ffe066', '#4a1a6a', 7);
    txt(steal ? 'Le Seigneur Pourpre est vaincu !' : 'Une ficelle de plus !', 0, 30, 14, '#ffffff', 700);
    ctx.restore();
  }
  if(!steal) return;
  if(t >= 245 && t < 265){ ctx.fillStyle = 'rgba(255,255,255,' + ((265 - t) / 20 * 0.85) + ')'; ctx.fillRect(0, 0, W, H); }
  if(t >= 247 && t < 335){
    const a = clamp((t - 247) / 5, 0, 1) * clamp((335 - t) / 12, 0, 1), pop = 1 + 0.5 * Math.max(0, 1 - (t - 247) / 8);
    const px = player.x + player.w / 2 - cx + 30, py = player.y - cy - 34;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(clamp(px, 70, W - 70), clamp(py, 40, H - 40)); ctx.scale(pop, pop); ctx.rotate(-0.12);
    ctx.beginPath();
    for(let i = 0; i < 18; i++){ const r = i % 2 ? 30 : 44, an = i * Math.PI / 9; ctx.lineTo(Math.cos(an) * r * 1.5, Math.sin(an) * r * 0.85); }
    ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#1a1430'; ctx.lineWidth = 3; ctx.stroke();
    outlined('QUOI ?!', 0, 8, 26, '#ff3d5a', '#1a1430', 5);
    ctx.restore();
  }
  if(t >= 330){
    // the title card: letterbox, darkness, a big moon with the magpie flying across it
    const k = clamp((t - 330) / 30, 0, 1), e = k * k * (3 - 2 * k);
    ctx.save();
    ctx.fillStyle = 'rgba(8,4,20,' + (0.62 * e) + ')'; ctx.fillRect(0, 0, W, H);
    const mx = W * 0.72, my = H * 0.38, mr = 64;
    ctx.globalAlpha = e;
    const g = ctx.createRadialGradient(mx, my, mr * 0.2, mx, my, mr * 1.8);
    g.addColorStop(0, 'rgba(255,240,200,0.5)'); g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g; ctx.fillRect(mx - mr * 2, my - mr * 2, mr * 4, mr * 4);
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fillStyle = '#fff3d0'; ctx.fill();
    // the magpie's silhouette crossing the moon, the ficelle dangling from her beak
    const q = clamp((t - 340) / 120, 0, 1), bx = mx + 120 - q * 240, by = my + 10 - Math.sin(q * Math.PI) * 30, fl = Math.sin(t * 0.4) * 0.8;
    ctx.save(); ctx.translate(bx, by); ctx.scale(-1, 1); ctx.fillStyle = '#0c0818';
    ctx.beginPath(); ctx.ellipse(0, 0, 18, 11, 0, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(15, -7, 8, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-40, -5); ctx.lineTo(-40, 5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(14, -7); ctx.lineTo(28, -5); ctx.lineTo(14, -3); ctx.fill();
    ctx.save(); ctx.rotate(-fl); ctx.beginPath(); ctx.ellipse(-6, -10, 18, 6, -0.5, 0, TAU); ctx.fill(); ctx.restore();
    ctx.strokeStyle = '#0c0818'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(26, -5); ctx.quadraticCurveTo(30, 6, 22, 14); ctx.stroke();
    ctx.restore();
    // bars
    const bh = 26 * e;
    ctx.globalAlpha = 1; ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, bh); ctx.fillRect(0, H - bh, W, bh);
    const ta = clamp((t - 360) / 25, 0, 1);
    ctx.globalAlpha = ta;
    txt('À suivre…', W * 0.3, H * 0.4, 16, '#e9e2ff', 600);
    heading('Saison 2', W * 0.3, H * 0.4 + 36 + (1 - ta) * 8, 34, '#ffffff');
    txt('La Pie Voleuse', W * 0.3, H * 0.4 + 62, 17, '#ffd27a', 700);
    ctx.restore();
  }
}

function drawSteal(){
  drawDJOrb();
  if(!steal || !steal.on) return;
  drawMagpie(steal);
}
function finaleEnd(){ return room && room.ending2 ? 80 : steal ? STEAL_END : 150; }
const STEAL_END = 470;
function drawFinalePrompt(){
  if(state !== 'play' || finaleT < finaleEnd() || fadeDir !== 0) return;
  const a = Math.min(1, (finaleT - finaleEnd() + 1) / 14) * (REDUCED ? 1 : 0.88 + 0.12 * Math.sin(frame * 0.12));
  ctx.save(); ctx.globalAlpha = a;
  // au-dessus de la bande noire de cinématique du bas (22 px), pour ne plus être coupée
  rr(W / 2 - 86, H - 62, 172, 28, 14); ctx.fillStyle = 'rgba(13,8,32,0.86)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,224,102,' + (0.45 + 0.35 * Math.sin(frame * 0.12)) + ')'; ctx.lineWidth = 1.5; ctx.stroke();
  promptLine(TOUCH ? [{key:'▲'}, {text:'continuer'}] : [{key:'Espace'}, {text:'continuer'}], H - 48);
  ctx.restore();
}

function startExit(){
  if(exitT > 0) return;
  exitT = 1;
  exitKind = rIndex < chapter.rooms.length - 1 ? 'room' : 'chapter';
  score += 100;
  SFX.door();
  door.glow = 1;
  sparkle(door.x + door.w/2, door.y + 16, 14, '#fff3c4');
  setFace(anim, 'open', 60);
}
// the hero waddles into the doorway and shrinks away before the next room
function updateExit(){
  exitT++;
  const tx = door.x + door.w/2 - player.w/2, ty = door.ceil ? door.y : door.y + door.h - player.h;
  player.x += (tx - player.x) * 0.18;
  player.y += (ty - player.y) * 0.18;
  player.vx = 0; player.vy = 0;
  anim.exit = clamp(exitT / 24, 0, 1);
  if(exitT === 18 && exitKind === 'room') transition(() => loadRoom(chIndex, rIndex + 1));
  if(exitT === 34 && exitKind === 'chapter') chapterClear();
}

function updateUiHero(){
  const cheer = state === 'chapter' || state === 'win';
  stepCharAnim(uiHero, {vx:0, vy:cheer ? Math.cos(frame * 0.16) * 4 : 0, onGround:!cheer, facing:1, cheer, sad:state === 'over'});
}

function updateHud(){
  if(fightPop > 0 && state === 'play') fightPop--;
  if(hud.coinBump > 0) hud.coinBump = Math.max(0, hud.coinBump - 0.07);
  if(lives < hud.lastLives){ hud.lostIdx = lives; hud.lostT = 1; }
  else if(lives > hud.lastLives){ hud.gainIdx = lives - 1; hud.gainT = 1; }
  hud.lastLives = lives;
  if(hud.lostT > 0) hud.lostT = Math.max(0, hud.lostT - 0.035);
  if(hud.gainT > 0) hud.gainT = Math.max(0, hud.gainT - 0.045);
  if(hud.flash > 0) hud.flash = Math.max(0, hud.flash - 0.05);
  for(const f of flyers){ f.t += 1 / 32; if(f.t >= 1 && !f.done){ f.done = true; hud.coinBump = 1; } }
  flyers = flyers.filter(f => f.t < 1);
  if(boss && boss.alive){
    const target = boss.hp / boss.maxHp;
    hud.bossShown += (target - hud.bossShown) * 0.25;
    if(hud.bossTrail < hud.bossShown) hud.bossTrail = hud.bossShown;
    else hud.bossTrail += (hud.bossShown - hud.bossTrail) * 0.05;
  }
}

function updatePopups(){
  for(const p of popups) p.t++;
  popups = popups.filter(p => p.t < 50);
}

// moving scenery without the player (title preview)
function updateDecor(){
  for(const p of platforms){
    p.dx = p.dy = 0;
    if(!p.move) continue;
    const a = p.move.axis;
    p[a] += p.move.speed * p.move.dir;
    if(p[a] < p.move.min){ p[a] = p.move.min; p.move.dir = 1; }
    if(p[a] > p.move.max){ p[a] = p.move.max; p.move.dir = -1; }
  }
  updateWalkers();
  updateBats();
}

// the final boss's special attacks (season 1, last phase): 50 frames of charging (he glows and trembles), then the attack
function updateAscentSpecial(b){
  const s = b.special, t = ++s.t, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const angry = b.hp <= b.enrage;
  b.y += (room.barrierY + 70 - b.y) * 0.05;
  b.x += (W / 2 - b.w / 2 - b.x) * 0.04;
  if(t < 50){
    b.hitT = t % 10 < 5 ? 2 : 0;
    if(t % 3 === 0) particles.push({x:cx + (Math.random() - 0.5) * 70, y:cy + (Math.random() - 0.5) * 70, vx:0, vy:0, tx:cx, ty:cy, life:20, max:20, color:'#ff5c9a', grav:0, size:3, type:'dot', drag:0.9});
    if(t === 49){ ring(cx, cy, '#ff5c9a', 8, 80, 24); SFX.bossFlee(); }
    return;
  }
  b.hitT = 0;
  const fire = (x, y, a, v) => bullets.push({x:x - 5, y:y - 5, w:10, h:10, vx:Math.cos(a) * v, vy:Math.sin(a) * v, kind:'boss'});
  if(s.kind === 'pluie'){
    // fireballs fall from the top of the screen, a gap always left somewhere
    if(t % (angry ? 9 : 12) === 0 && t < 230){
      const x = 20 + Math.random() * (W - 40);
      bullets.push({x:x - 5, y:camY - 20, w:10, h:10, vx:0, vy:2.6, kind:'boss'});
    }
    if(t % 30 === 0 && t < 230) SFX.bossShot();
  } else if(s.kind === 'anneau'){
    if(t === 50 || t === 100 || t === 150 || (angry && t === 200)){
      const n = 14, off = (t / 50) % 2 ? Math.PI / n : 0;
      for(let i = 0; i < n; i++) fire(cx, cy, off + i * TAU / n, 2.3);
      SFX.bossShot(); ring(cx, cy, '#ff8a3c', 6, 60, 18);
    }
  } else if(s.kind === 'spirale'){
    if(t % 6 === 0 && t < 230){
      const a = t * 0.11;
      fire(cx, cy, a, 2.4); fire(cx, cy, a + Math.PI, 2.4);
      if(angry) fire(cx, cy, a + Math.PI / 2, 2.4);
      if(t % 18 === 0) SFX.bossShot();
    }
  }
  if(t >= 260){ b.special = null; b.fireT = 60; }
}

const PLANK_SHAKE = 26, PLANK_G = 0.42, PLANK_MAX = 9;
// lift planks (lift:true) hang from a little parachute: they let go almost at once and drift down slowly, carrying XELIAX
const LIFT_SHAKE = 10, LIFT_G = 0.1, LIFT_MAX = 2.2;
function updatePlank(p){
  p.px = p.x; p.py = p.y;
  // again:true planks drift back home a little after they have landed (so a missed throw can be tried again)
  if(p.again && p.landT > 0 && ++p.landT > 80){
    p.landT = 0; p.gone = true; p.rT = 40;
    burst(p.x + p.w / 2, p.y + p.h / 2, 8, '#ffffff', 1.5, 22, -0.01, 3, 'puff');
    if(player.standingOn === p){ player.standingOn = null; player.onGround = false; }
    return;
  }
  if(p.gone){
    if(--p.rT <= 0){ p.gone = false; p.x = p.ox; p.y = p.oy; p.px = p.x; p.py = p.y; p.loose = !!p.free; p.fT = 0; p.fvy = 0; p.landT = 0; p.appear = 0; sparkle(p.x + p.w / 2, p.y + p.h / 2, 6, '#fff3c4'); }
    return;
  }
  if(!p.loose){
    if(p.fT > 0){
      if(frame % 5 === 0) crumbs(p.x + Math.random() * p.w, gdir > 0 ? p.y + p.h : p.y, 1, '#9a6234');
      if(++p.fT > (p.lift ? LIFT_SHAKE : PLANK_SHAKE)){ p.loose = true; p.fvy = 0; tone(p.lift ? 260 : 140, 0.12, p.lift ? 'triangle' : 'sawtooth', 0.03, p.lift ? 200 : 90); }
    }
    return;
  }
  // loose: it falls the way gravity pulls, and lands on whatever is in the way
  const g = gdir, y0 = p.y, top = p.lift ? LIFT_MAX : PLANK_MAX;
  p.fvy = clamp(p.fvy + (p.lift ? LIFT_G : PLANK_G) * g, -top, top);
  let ny = p.y + p.fvy, hit = null;
  const across = q => p.x + p.w > q.x + 2 && p.x < q.x + q.w - 2;
  if(p.fvy > 0){
    for(const q of platforms){ if(q === p || q.gone || !across(q)) continue; if(p.y + p.h <= q.y + 0.5 && ny + p.h >= q.y && (!hit || q.y < hit)) hit = q.y; }
    for(const t of spikes){ if(t.down || t.side || t.lava || t.pending || !across(t)) continue; const top = t.y - 10; if(p.y + p.h <= top + 0.5 && ny + p.h >= top && (hit === null || top < hit)) hit = top; }
    if(hit !== null) ny = hit - p.h;
  } else if(p.fvy < 0){
    for(const q of platforms){ if(q === p || q.gone || !across(q)) continue; const b = q.y + q.h; if(p.y >= b - 0.5 && ny <= b && (hit === null || b > hit)) hit = b; }
    for(const t of spikes){ if(!t.down || t.pending || !across(t)) continue; const bt = t.y + 10; if(p.y >= bt - 0.5 && ny <= bt && (hit === null || bt > hit)) hit = bt; }
    if(hit !== null) ny = hit;
  }
  if(hit !== null){
    if(Math.abs(p.fvy) > 3.5){
      SFX.thud(); addShake(Math.min(4, Math.abs(p.fvy) * 0.4));
      for(let i = 0; i < 6; i++) particles.push({x:p.x + Math.random() * p.w, y:g > 0 ? ny + p.h : ny, vx:(Math.random() - 0.5) * 2.4, vy:-g * Math.random() * 1.6, life:22, max:22, color:'#e8d6b0', grav:0.05 * g, size:3, type:'dot'});
    }
    if(p.again && !p.landT) p.landT = 1;
    p.fvy = 0;
  }
  p.y = ny; p.dy = p.y - y0;
  // a falling plank squashes the walkers and bats in its way
  if(Math.abs(p.dy) > 2){
    for(const e of [...enemies, ...bats]){
      if(!e.alive || (e.on !== undefined && platforms[e.on] === p) || !overlap(p, e)) continue;
      e.alive = false; score += 25; killFx(e); SFX.thud();
      showToast('Écrasé par la planche !', 70);
    }
  }
  // too far: it's lost, a new one appears where it was a little later
  if(p.y > room.h + 80 || p.y + p.h < -80){ p.gone = true; p.rT = 150; if(player.standingOn === p){ player.standingOn = null; player.onGround = false; } }
}

function updateWalkers(){
  for(const e of enemies){
    if(!e.alive) continue;
    const p = platforms[e.on];
    e.t += 0.15;
    e.off += e.speed * e.dir;
    const maxOff = Math.min(e.to, p.w) - e.w;
    if(e.off < e.from){ e.off = e.from; e.dir = 1; }
    if(e.off > maxOff){ e.off = maxOff; e.dir = -1; }
    e.x = p.x + e.off;
    e.y = e.ceil ? p.y + p.h : p.y - e.h;
  }
}
function updateBats(){
  for(const b of bats){
    if(!b.alive) continue;
    b.t += b.speed;
    b.x = b.x0 + Math.sin(b.t) * b.ax;
    b.y = b.y0 + Math.sin(b.t * 2) * b.ay;
    b.face = Math.cos(b.t) >= 0 ? 1 : -1;
  }
}

// the final escape: the lava surges and throws XELIAX up onto a ledge, then the race begins

function startLaunch(){
  const t = room.launchTo;
  launch = {t:0, dur:46, x0:player.x, y0:player.y, x1:t.x - player.w / 2, y1:t.y - player.h};
  lavaY = room.hotFloor ? room.hotFloor.y + 4 : lavaY;
  player.invuln = Math.max(player.invuln, 90); player.vx = player.vy = 0;
  addShake(10); SFX.thud();
  burst(player.x + player.w / 2, player.y + player.h, 24, '#ff8a3c', 4, 40, 0.1, 4);
}
function updateLaunch(){
  const L = launch, k = Math.min(1, ++L.t / L.dur);
  player.x = lerp(L.x0, L.x1, k); player.y = lerp(L.y0, L.y1, k) - Math.sin(k * Math.PI) * 120;
  player.vx = 0; player.vy = 0; player.onGround = false; anim.spin = k * TAU;
  if(frame % 2 === 0) particles.push({x:player.x + player.w / 2, y:player.y + player.h, vx:(Math.random() - 0.5), vy:1.5, life:24, max:24, color:'#ffb347', grav:0.05, size:3, type:'dot'});
  stepHero(); updateCamera();
  if(k >= 1){ launch = null; anim.spin = 0; player.vy = 0; showToast('La lave monte vite ! Cours, grimpe !', 120); }
}

function updateWorld(){
  // rising lava
  if(room.lava){
    if(boss && boss.alive){ /* the lava waits until the boss is beaten */ }
    else if(lavaDelay > 0){ if(--lavaDelay === 0) showToast('La lave monte ! Grimpe !', 100); }
    else lavaY = Math.max(room.lava.min, lavaY - room.lava.speed);
    if(frame % 6 === 0) particles.push({x:Math.random()*W, y:lavaY, vx:0, vy:-0.8 - Math.random(), life:30, max:30, color:'#ffb347', grav:0.02, size:2.5, type:'dot'});
  }

  // platforms (moving + crumbling)
  for(const p of platforms){
    p.dx = p.dy = 0;
    if(p.appear < 1) p.appear = Math.min(1, p.appear + 0.07);
    if(p.crumble){
      if(p.gone){
        if(--p.rT <= 0 && !overlap(player, {x:p.x, y:p.y - 4, w:p.w, h:p.h + 4})){
          p.gone = false; p.cT = 0; p.appear = 0;
          sparkle(p.x + p.w/2, p.y + p.h/2, 6, '#fff3c4');
        }
      } else if(p.cT > 0){
        if(frame % 4 === 0) crumbs(p.x + Math.random() * p.w, p.y + p.h, 1, '#b8844f');
        if(++p.cT > 40){
          breakPlatform(p);
        }
      }
    }
    if(p.fall){ updatePlank(p); continue; }
    if(!p.move) continue;
    const a = p.move.axis, prev = p[a];
    p[a] += p.move.speed * p.move.dir;
    if(p[a] < p.move.min){ p[a] = p.move.min; p.move.dir = 1; }
    if(p[a] > p.move.max){ p[a] = p.move.max; p.move.dir = -1; }
    if(a === 'x') p.dx = p[a] - prev; else p.dy = p[a] - prev;
  }
  for(const s of springs){ if(s.t > 0) s.t--; if(s.anim > 0) s.anim = Math.max(0, s.anim - 0.035); }
  for(const g of solids) if(g.flash > 0) g.flash--;
  for(const c of checkpoints) c.raise = c.active ? Math.min(1, c.raise + 0.05) : Math.max(0, c.raise - 0.05);
  for(const s of spikes) if(s.appear !== undefined && s.appear < 1 && !s.pending) s.appear = Math.min(1, s.appear + 0.05);
  // people: the closest one within reach can be talked to
  animNpcs();
  for(const n of npcs) if(n.gives === 'wall' && !hasWall && player.x > n.x + 110 && !n.told){ n.told = true; showToast('Parle d\'abord à Gaston (touche ' + KEYS_TXT.talk + ') : il a quelque chose pour toi !', 170); }
  nearNpc = null;
  if(!player.dead && !cine){
    let bn = 34;
    for(const n of npcs){
      const d = Math.abs(player.x + player.w/2 - (n.x + 13));
      if(d < bn && Math.abs(player.y + player.h - n.y) < 24){ bn = d; nearNpc = n; }
    }
  }
  for(const n of npcs) n.near = clamp(n.near + (n === nearNpc ? 0.12 : -0.12), 0, 1);
  // only the closest sign talks (none while someone is in reach), so bubbles never pile up
  let nearest = null, best = 61;
  for(const sg of signs){
    const d = Math.abs(player.x + player.w/2 - (sg.x + 10));
    if(d < best && Math.abs((sg.ceil ? player.y : player.y + player.h) - sg.y) < 70 && !player.dead){ best = d; nearest = sg; }
  }
  if(nearNpc || cine || idle.phase) nearest = null;
  for(const sg of signs) sg.show = clamp(sg.show + (sg === nearest ? 0.12 : -0.12), 0, 1);
  if(door){ if(door.shake > 0) door.shake = Math.max(0, door.shake - 0.04); if(door.glow > 0) door.glow = Math.max(0, door.glow - 0.02); }

  updateWalkers();
  updateBats();

  // turrets fire only when on screen; they glow while charging
  for(const t of turrets){
    if(!t.alive) continue;
    if(t.flash > 0) t.flash--;
    const onScreen = t.x > camX - 40 && t.x < camX + W + 40 && t.y > camY - 40 && t.y < camY + H + 40;
    if(!onScreen) continue;
    if(++t.t >= t.rate){
      t.t = 0;
      const cx = t.x + 12, cy = t.y + 12;
      let vx = 0, vy = 0;
      if(t.dir === 'left') vx = -3;
      else if(t.dir === 'right') vx = 3;
      else if(t.dir === 'down') vy = 3;
      else {
        const a = Math.atan2(player.y + player.h/2 - cy, player.x + player.w/2 - cx);
        vx = Math.cos(a) * 2.8; vy = Math.sin(a) * 2.8;
      }
      bullets.push({x:cx - 5, y:cy - 5, w:10, h:10, vx, vy, kind:'turret'});
      t.flash = 6;
      burst(cx + Math.sign(vx || 0.001) * 12 * (vx ? 1 : 0), cy + (vy ? 12 : 0), 4, '#ffd27a', 1.5, 14, 0, 2.2, 'puff');
      SFX.turret();
    }
  }

  updateBoss();
  if(key && key.fall && !key.got){
    key.vy += 0.22; key.y += key.vy; key.rot = (key.rot || 0) + 0.16;
    if(key.y + key.h >= FLOOR - 4 && key.vy > 0){
      key.y = FLOOR - 4 - key.h;
      if(key.vy > 2.5){ key.vy *= -0.4; dust(key.x + key.w / 2, FLOOR, 6); SFX.land(); }
      else { key.fall = false; key.vy = 0; key.rot = 0; sparkle(key.x + key.w / 2, key.y, 10, '#ffe066'); }
    }
  }

  for(const b of bullets){
    if(b.grav) b.vy += b.grav;
    b.x += b.vx; b.y += b.vy;
    if(solids.some(w => overlap(b, w))){ b.dead = true; burst(b.x + b.w / 2, b.y + b.h / 2, 6, '#ffd27a', 1.5, 16, 0.05, 2.4, 'puff'); continue; }
    if((b.kind === 'acid' || b.kind === 'snow' || b.kind === 'icicle') && b.y + b.h >= FLOOR){
      b.dead = true;
      const col = b.kind === 'acid' ? '#7ae04a' : '#e8f6ff';
      burst(b.x + b.w / 2, FLOOR - 2, 8, col, 2.2, 22, 0.12, 3, b.kind === 'acid' ? 'goo' : 'crumb');
      if(b.kind === 'icicle'){ SFX.glass(); addShake(2); }
      continue;
    }
    if(b.kind === 'bomb'){
      // a bomb bursts on the first ledge it falls onto (so a ledge is a roof), or on the floor, which catches fire
      const ledge = platforms.find(p => !p.gone && !p.solid && p.y < FLOOR - 2 && b.vy > 0 && b.x + b.w > p.x && b.x < p.x + p.w && b.y + b.h >= p.y && b.y + b.h - b.vy <= p.y + 1);
      const gy = ledge ? ledge.y : b.y + b.h >= FLOOR ? FLOOR : null;
      if(gy !== null){
        b.dead = true;
        burst(b.x + 6, gy - 2, 10, '#ff8a3c', 2.5, 22, 0.1, 3);
        burst(b.x + 6, gy - 4, 6, '#ffffff', 1.4, 26, -0.01, 4, 'puff');
        ring(b.x + 6, gy - 4, '#ffb347', 2, 18, 14);
        if(ledge && ledge.p2crumble && ledge.crumble) breakPlatform(ledge);   // phase 2 du Gardien : la bombe casse la plateforme fragile
        if(!ledge && boss && boss.mode === 'swoop'){
          const hot = boss.phase === 2 || boss.hp <= boss.enrage;
          const fw = hot ? 60 : 44;
          fires.push({x:clamp(b.x + 6 - fw / 2, 0, room.w - fw), w:fw, t:0, max:hot ? 190 : 150, seed:Math.random() * 10});
          if(!fireTold){ fireTold = true; showToast('Le sol brûle ! Grimpe sur une plateforme', 130); }
        }
      }
    }
  }
  bullets = bullets.filter(b => !b.dead && b.x > camX - 40 && b.x < camX + W + 40 && b.y > camY - 40 && b.y < camY + H + 40);
  for(const f of fires){ f.t++; if(f.t % 9 === 0 && f.t < f.max - 20) particles.push({x:f.x + 6 + Math.random() * (f.w - 12), y:FLOOR - 10, vx:(Math.random() - 0.5) * 0.4, vy:-0.8 - Math.random(), life:26, max:26, color:f.acid ? (Math.random() < 0.5 ? '#9dff5a' : '#d8ffa8') : Math.random() < 0.5 ? '#ffb347' : '#ffe08a', grav:-0.01, size:2.4, type:'dot'}); }
  fires = fires.filter(f => f.t < f.max);
}

// une plateforme fragile se casse : back = délai de retour propre à la plateforme (images)
function breakPlatform(p){
  p.gone = true; p.cT = 0; p.rT = p.back || 200;
  crumbs(p.x + p.w/2, p.y + p.h/2, 14, '#c99a62');
  burst(p.x + p.w/2, p.y + p.h/2, 8, '#ffffff', 1.5, 22, -0.01, 3, 'puff');
  SFX.crumble();
  if(player.standingOn === p){ player.standingOn = null; player.onGround = false; }
}

function updateBoss(){
  const b = boss;
  if(!b || !b.alive) return;
  if(cine) return;            // the cinematic moves the boss itself
  if(b.dying){ updateBossDeath(b); return; }
  if(b.hitT > 0) b.hitT--;
  if(b.inv > 0) b.inv--;
  if(b.shieldT > 0) b.shieldT--;

  if(b.fleeing){
    b.y -= 5; b.x += Math.sin(frame * 0.3) * 2;
    if(frame % 3 === 0) burst(b.x + b.w/2, b.y + b.h, 3, '#ff8a3c', 1.5, 20, 0.05, 3);
    return;
  }
  const angry = b.hp <= b.enrage;
  if(S2_BOSS.has(b.mode)){ updateS2Boss(b); return; }

  if(b.mode === 'arena' || b.mode === 'ascent'){
    const spd = angry ? (b.mode === 'arena' ? 1 : 1.45) : 1;
    if(b.mode === 'ascent' && room.barrierY){
      // every 10 seconds he stops in mid-air and unleashes a different attack: rain of fire, rings, spiral
      if(b.special){ updateAscentSpecial(b); return; }
      if(b.spT === undefined) b.spT = 600;
      if(--b.spT <= 0){
        const kinds = ['pluie', 'anneau', 'spirale'];
        b.special = {kind:kinds[(b.spN = (b.spN || 0) + 1) % 3], t:0};
        b.spT = angry ? 480 : 600;
        SFX.warn(); addShake(5);
        showToast({pluie:'Pluie de feu ! Regarde en haut', anneau:'Anneaux de feu ! Trouve le trou', spirale:'Spirale de feu ! Tourne avec elle'}[b.special.kind], 110);
        return;
      }
    }
    if(b.mode === 'ascent'){
      b.x += b.vx * spd * 1.15;
      if(b.x < 20){ b.x = 20; b.vx = Math.abs(b.vx); }
      if(b.x > W - 20 - b.w){ b.x = W - 20 - b.w; b.vx = -Math.abs(b.vx); }
      const ty = (room.barrierY ? clamp(player.y - 150, room.barrierY + 30, room.barrierY + 170)
                                : Math.max(20, Math.min(camY + 40, player.y - 150))) + Math.sin(frame * 0.05) * 10;
      b.y += (ty - b.y) * 0.06;
    } else if(b.cross){
      // phase 1: he flies across to the other side of the arena
      const tx = (b.minX + b.maxX) / 2, d = tx - b.x;
      b.x += Math.sign(d) * Math.min(Math.abs(d), 4.2); b.y += (150 - b.y) * 0.05;
      if(frame % 3 === 0) burst(b.x + b.w / 2, b.y + b.h / 2, 1, '#ff5c9a', 1, 18, 0, 3, 'puff');
      if(Math.abs(d) < 2){ b.cross = false; b.fireT = Math.min(b.fireT, 30); }
    } else {
      b.x += b.vx * spd; b.y += b.vy * spd;
      if(b.x < b.minX){ b.x = b.minX; b.vx = Math.abs(b.vx); }
      if(b.x > b.maxX){ b.x = b.maxX; b.vx = -Math.abs(b.vx); }
      if(b.mode === 'arena'){
        if(b.sideT === undefined){ b.sideT = 420; b.zone = 1; b.zw = b.maxX - b.minX; b.zr = b.minX; }
        if(--b.sideT <= 0){
          b.zone = 1 - b.zone; b.sideT = angry ? 330 : 420;
          b.minX = b.zone ? b.zr : 10; b.maxX = b.minX + b.zw;
          b.cross = true; SFX.warn(); popup(b.x + b.w / 2, b.y - 10, 'Il change de côté !', '#ff9ac0');
        }
      }
      if(b.y < b.minY){ b.y = b.minY; b.vy = Math.abs(b.vy); }
      if(b.y > b.maxY){ b.y = b.maxY; b.vy = -Math.abs(b.vy); }
    }
    if(--b.fireT <= 0){
      // the first fight stays readable to the end: slower volleys, and a wide fan with big gaps when he's angry
      b.fireT = b.mode === 'ascent' ? (angry ? 50 : 75) : (angry ? 92 : 105);
      const bx = b.x + b.w/2, by = b.y + b.h/2;
      const ang = Math.atan2(player.y + player.h/2 - by, player.x + player.w/2 - bx);
      const v = angry ? (b.mode === 'arena' ? 2.6 : 3.4) : (b.mode === 'arena' ? 2.5 : 2.7);
      for(const s of (angry ? (b.mode === 'arena' ? [-0.5, 0, 0.5] : [-0.28, 0, 0.28]) : [0]))
        bullets.push({x:bx - 5, y:by - 5, w:10, h:10, vx:Math.cos(ang + s)*v, vy:Math.sin(ang + s)*v, kind:'boss'});
      SFX.bossShot();
    }
    return;
  }

  if(b.mode === 'slime'){
    // v51, phase 2 : tous les 2 coups reçus, attaque spéciale = 3 sauts d'affilée qui visent XELIAX,
    // annoncée par un tremblement + un son (une demi-seconde) pour qu'on la voie venir (voir le coup sur la tête)
    if(b.phase === 2 && b.burstNext && b.onGround && !b.burst && !b.warnT){ b.burstNext = false; b.warnT = 30; SFX.warn(); }
    if(b.onGround && b.warnT > 0){
      b.squash = Math.sin(b.warnT * 1.3) * 0.18;
      if(--b.warnT === 0){ b.burst = 3; b.hopT = 1; }
    } else if(b.onGround){
      b.squash += (0 - b.squash) * 0.2;
      if(--b.hopT <= 0){
        const dir = Math.sign((player.x + player.w/2) - (b.x + b.w/2)) || 1;
        if(b.burst > 0){
          // saut de l'attaque spéciale : il vise l'endroit où est XELIAX au moment de sauter (bouger = esquiver)
          b.big = false;
          b.vy = -8.5;
          b.vx = clamp((player.x + player.w/2 - b.w/2 - b.x) / (2 * 8.5 / 0.5), -4.5, 4.5);
          b.burst--;
          b.inBurst = true;
        } else if(b.phase === 2){
          // phase 2: every other jump is aimed to land right on the player
          b.big = b.hops % 2 === 0;
          b.vy = b.big ? -12 : -7;
          const flight = 2 * -b.vy / 0.5;
          b.vx = b.big ? clamp((player.x + player.w/2 - b.w/2 - b.x) / flight, -4.5, 4.5) : dir * 3.6;
        } else {
          b.big = b.hops % 3 === 2;
          b.vy = b.big ? -12 : -8;
          b.vx = dir * (b.big ? 2.2 : 2.6 + (angry ? 1 : 0));
        }
        b.onGround = false; b.hops++;
        b.squash = -0.25;
      }
    } else {
      b.vy += 0.5;
      b.x += b.vx; b.y += b.vy;
      b.squash += (0 - b.squash) * 0.1;
      if(b.x < 0){ b.x = 0; b.vx = Math.abs(b.vx); }
      if(b.x + b.w > room.w){ b.x = room.w - b.w; b.vx = -Math.abs(b.vx); }
      if(b.y + b.h >= FLOOR){
        b.y = FLOOR - b.h; b.onGround = true; b.vx = b.vy = 0;
        b.hopT = b.phase === 2 ? (angry ? 26 : 38) : (angry ? 32 : 55);
        if(b.inBurst){ b.inBurst = false; b.hopT = b.burst > 0 ? 10 : 50; }   // sauts spéciaux enchaînés, puis une pause pour le toucher
        b.squash = 0.35;
        addShake(b.big ? 9 : 4);
        dust(b.x + b.w/2, FLOOR, 12);
        SFX.thud();
        // phase 2: spits out little slimes (max 3 at once) — v51 : seulement en retombant d'un GRAND saut
        if(b.phase === 2 && b.big && enemies.filter(e => e.alive).length < 3){
          enemies.push({on:0, from:0, to:room.w, speed:1.5, off:clamp(b.x + b.w/2 - 12, 0, room.w - 24),
            dir:Math.random() < .5 ? -1 : 1, w:24, h:18, x:0, y:0, alive:true, t:0});
          burst(b.x + b.w/2, FLOOR - 10, 12, '#b45be3', 2.5, 25, 0.15, 3, 'goo');
        }
        if(b.big || angry || b.phase === 2){
          bullets.push({x:b.x - 12, y:FLOOR - 14, w:16, h:14, vx:-3.2, vy:0, kind:'wave'});
          bullets.push({x:b.x + b.w - 4, y:FLOOR - 14, w:16, h:14, vx:3.2, vy:0, kind:'wave'});
        }
      }
    }
    return;
  }

  if(b.mode === 'swoop'){
    const tx = player.x + player.w/2 - b.w/2;
    if(b.state === 'hover' || b.state === 'warn'){
      const k = b.state === 'warn' ? 0.12 : (b.phase === 2 ? 0.05 : 0.03);
      b.x += clamp((tx - b.x) * k, -4, 4);
      b.x = clamp(b.x, 10, room.w - b.w - 10);
      b.y += (55 + Math.sin(frame * 0.06) * 12 - b.y) * 0.1;
      if(b.state === 'hover'){
        if(--b.fireT <= 0){
          const p2 = b.phase === 2;
          b.fireT = p2 ? (angry ? 35 : 45) : (angry ? 40 : 65);
          const n = p2 ? 3 : (angry ? 2 : 1);
          for(let i = 0; i < n; i++){
            const vx = n === 3 ? (i - 1) * 1.8 : n === 2 ? (i ? 1.3 : -1.3) : 0;
            bullets.push({x:b.x + b.w/2 - 6, y:b.y + b.h - 4, w:12, h:12, vx, vy:1, grav:0.12, kind:'bomb'});
          }
          SFX.bossShot();
        }
        if(--b.stT <= 0){
          // le plongeon d'abord, puis au hasard, jamais plus de deux fois de suite la même attaque
          let nx = !b.next ? 'dive' : Math.random() < 0.5 ? 'dive' : 'sweep';
          if(nx === b.next && b.same >= 2) nx = nx === 'dive' ? 'sweep' : 'dive';
          b.same = nx === b.next ? b.same + 1 : 1;
          b.next = nx;
          if(b.next === 'dive'){ b.state = 'warn'; b.stT = b.phase === 2 ? 30 : 45; SFX.warn(); }
          else {
            // the sweep: it flies to one side (au hasard), screeches, then skims the floor all the way across
            b.state = 'sweepGo'; b.stT = 0; b.turned = false; b.turnT = 0;
            b.sx = Math.random() < 0.5 ? W - b.w - 6 : 6;
          }
        }
      } else if(--b.stT <= 0){ b.state = 'dive'; b.vy = 2; }
    } else if(b.state === 'dive'){
      b.vy = b.phase === 2 ? Math.min(b.vy + 1, 14) : Math.min(b.vy + 0.8, 12);
      b.y += b.vy;
      if(b.y + b.h >= FLOOR){
        b.y = FLOOR - b.h; b.state = 'stunned';
        b.stT = b.phase === 2 ? (angry ? 55 : 70) : (angry ? 75 : 110);
        addShake(10); dust(b.x + b.w/2, FLOOR, 14); SFX.thud();
        if(angry || b.phase === 2){
          bullets.push({x:b.x - 12, y:FLOOR - 14, w:16, h:14, vx:-3.4, vy:0, kind:'wave'});
          bullets.push({x:b.x + b.w - 4, y:FLOOR - 14, w:16, h:14, vx:3.4, vy:0, kind:'wave'});
        }
      }
    } else if(b.state === 'stunned'){
      if(--b.stT <= 0) b.state = 'rise';
    } else if(b.state === 'sweepGo'){
      b.x += clamp((b.sx - b.x) * 0.14, -9, 9);
      b.y += (70 - b.y) * 0.14;
      if(Math.abs(b.sx - b.x) < 3){ b.x = b.sx; b.state = 'sweepWarn'; b.stT = b.phase === 2 ? 24 : 32; SFX.warn();
        if(!b.toldSweep){ b.toldSweep = true; showToast('Il va raser le sol : monte sur une plateforme !', 140); } }
    } else if(b.state === 'sweepWarn'){
      b.y += (70 + Math.sin(frame * 0.5) * 2 - b.y) * 0.2;
      if(--b.stT <= 0){ b.state = 'sweepDown'; b.vy = 0; }
    } else if(b.state === 'sweepDown'){
      b.vy = Math.min(b.vy + 1.4, 16); b.y += b.vy;
      if(b.y >= FLOOR - b.h - 6){
        b.y = FLOOR - b.h - 6; b.state = 'sweep';
        b.vx = (b.x < W / 2 ? 1 : -1) * (b.phase === 2 ? 9 : 7);
        addShake(4); dust(b.x + b.w / 2, FLOOR, 10); SFX.bossFlee();
      }
    } else if(b.state === 'sweep'){
      if(b.turnT > 0){ if(--b.turnT === 0) SFX.bossFlee(); }   // demi-tour : il s'arrête un court instant contre le mur
      else {
        b.x += b.vx;
        if(frame % 3 === 0) dust(b.x + b.w / 2 - Math.sign(b.vx) * 18, FLOOR, 2);
        if((b.vx > 0 && b.x >= W - b.w - 6) || (b.vx < 0 && b.x <= 6)){
          b.x = clamp(b.x, 6, W - b.w - 6);
          // phase 2 : une fois sur deux, il repart aussitôt dans l'autre sens
          if(b.phase === 2 && !b.turned && Math.random() < 0.5){ b.turned = true; b.turnT = 16; b.vx = -b.vx; addShake(3); SFX.warn(); }
          else b.state = 'rise';
        }
      }
    } else if(b.state === 'grab'){
      // XELIAX a voulu lui sauter dessus en plein vol : il le tient un instant, puis le jette au sol
      b.y += (40 - b.y) * 0.12;
      if(--b.stT <= 0){
        player.held = false; player.slam = true; player.vx = 0; player.vy = 13;
        b.state = 'rise'; addShake(5); SFX.bossFlee();
      }
    } else if(b.state === 'rise'){
      b.y -= 3;
      if(b.y <= 55){ b.state = 'hover'; b.stT = (b.phase === 2 ? 140 : (angry ? 150 : 220)) * (0.6 + Math.random() * 0.6); b.fireT = 40; }   // attente variable : on ne peut pas compter
    }
  }
}

function updatePlayer(){
  const knocked = idle.phase === 'flip' || idle.phase === 'ko' || idle.phase === 'up';
  if(knocked && input.jumpPressed) idleWake();
  if(finaleT > 0 || cine || knocked || player.held || player.slam){ input.jumpPressed = false; input.shootPressed = false; input.dashPressed = false; player.buffer = 0; }
  if(player.held){   // dans les serres du Gardien
    player.x = boss.x + boss.w / 2 - player.w / 2; player.y = boss.y + boss.h - 6;
    player.vx = player.vy = 0; player.onGround = false; player.standingOn = null;
    return;
  }
  const G = gdir;          // 1: normal gravity, -1: upside down (feet on the ceiling)
  // ride moving platforms
  if(player.standingOn){
    if(player.standingOn.gone) player.standingOn = null;
    else { player.x += player.standingOn.dx; player.y += player.standingOn.dy; }
  }

  let dir = finaleT > 0 || knocked || player.slam ? 0 : (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if(player.pushT > 0){ player.pushT--; dir = Math.sign(player.vx); }   // poussé sur le côté après un coup sur le Roi Gluant
  if(cine){
    // during a cinematic XELIAX only walks out of danger, then faces the boss
    dir = 0;
    if(cine.walkTo !== null){
      const d = cine.walkTo - (player.x + player.w / 2);
      if(Math.abs(d) > 4) dir = Math.sign(d); else cine.walkTo = null;
    }
    if(!dir && boss && player.onGround) player.facing = boss.x + boss.w / 2 > player.x + player.w / 2 ? 1 : -1;
  }
  if(dir && player.dashT <= 0) player.facing = dir;
  let accel = player.onGround ? (player.standingOn && player.standingOn.ice ? ICE_ACCEL : ACCEL_GROUND) : ACCEL_AIR;
  // just after a wall jump you are kicked away from the wall for a moment
  if(player.wallLock > 0){ player.wallLock--; accel = player.wallLock > 3 ? 0 : ACCEL_AIR * 0.4; }
  if(player.dashT > 0){
    // dashing: straight, fast, no gravity
    player.dashT--;
    player.vx = player.dashDir * DASH_V; player.vy = 0;
    if(player.dashT % 2 === 0) player.ghosts.push({x:player.x, y:player.y, t:16, f:player.facing, g:G});
    if(player.dashT === 0) player.vx = player.dashDir * RUN * 1.1;
  } else {
    player.vx += (dir * RUN - player.vx) * accel;
    if(Math.abs(player.vx) < 0.05) player.vx = 0;
  }
  if(player.dashCD > 0) player.dashCD--;
  for(const gh of player.ghosts) gh.t--;
  player.ghosts = player.ghosts.filter(gh => gh.t > 0);

  // dash (season 2, chapter 3 onwards)
  if(input.dashPressed){
    if(!hasDash){ if(toast.t <= 0 && CHAPTERS[chIndex].season === 2) showToast('Pas encore de dash !', 50); }
    else player.dashBuf = DASH_BUF;
  }
  if(player.dashBuf > 0){
    player.dashBuf--;
    if(hasDash && player.dashT <= 0 && player.dashReady && player.dashCD <= 0){ player.dashBuf = 0; startDash(dir || player.facing); }
  }

  // option « saut automatique » : saut gardé appuyé = XELIAX ressaute dès qu'il touche le sol (jamais de double saut tout seul)
  if(SET.autoJump && input.jumpHeld && !input.jumpPressed && player.onGround && state === 'play' && !finaleT && !cine) input.jumpPressed = true;
  // jump: coyote time + buffer + wall jump + double jump
  if(input.jumpPressed){
    if(player.coyote > 0) doJump();
    else if(hasWall && player.wallT > 0) wallJump();
    else if(hasDJ && !player.usedDJ){
      // forgiving double jump: always its full height (even when the key is only tapped),
      // and pressing it early, while still rising, never loses height
      player.vy = (DJ_V + Math.min(0, player.vy * G) * 0.3) * G; player.usedDJ = true; player.noCut = true; player.dashT = 0;
      player.sx = 0.8; player.sy = 1.2;
      anim.spin = 0.001;
      const fy = G > 0 ? player.y + player.h : player.y;
      ring(player.x + player.w/2, fy, POWER_COLORS.doubleJump, 3, 22, 16);
      burst(player.x + player.w/2, fy, 8, POWER_COLORS.doubleJump, 2, 22, 0.05, 2.5, 'star');
      SFX.flip();
    } else player.buffer = BUFFER;
  }
  if(player.buffer > 0){
    player.buffer--;
    if(player.onGround) doJump();
    else if(hasWall && player.sliding) wallJump();
  }

  // variable jump height (unless launched by a spring / stomp), with a little hang time at the apex
  if(player.dashT <= 0){
    let g = GRAVITY;
    const rise = player.vy * G;          // negative while going away from the floor
    if(rise >= 0) player.noCut = false;
    if(rise < 0 && !input.jumpHeld && !player.noCut) g *= 2.2;
    else if(input.jumpHeld && Math.abs(player.vy) < 1.3 && !player.onGround) g *= 0.65;
    player.vy += g * G;
    if(player.vy * G > MAX_FALL) player.vy = MAX_FALL * G;
    if(player.sliding && player.vy * G > WALL_SLIDE) player.vy = WALL_SLIDE * G;
  }

  const prevBottom = player.y + player.h;
  const wasGround = player.onGround;
  const impact = player.vy * G;
  const prevX = player.x, prevTop = player.y;
  player.x += player.vx;
  player.x = clamp(player.x, 0, room.w - player.w);
  // solid walls: they stop you sideways (a dash smashes through ice walls)
  for(const w of solids){
    if(w.gone || !overlap(player, w)) continue;
    if(w.glass && player.dashT > 0){ breakGlass(w); continue; }
    if(prevX + player.w <= w.x + 0.5) player.x = w.x - player.w;
    else if(prevX >= w.x + w.w - 0.5) player.x = w.x + w.w;
    player.vx = 0;
    if(player.dashT > 0){ player.dashT = 0; addShake(2); dust(player.x + (player.dashDir > 0 ? player.w : 0), player.y + player.h / 2, 5); SFX.thud(); }
  }
  player.y += player.vy;
  // ...and you bump your head on them (the ceiling is on the other side when gravity is flipped)
  for(const w of solids){
    if(w.gone || !overlap(player, w)) continue;
    if(G > 0 && player.vy < 0 && prevTop >= w.y + w.h - 0.5){ player.y = w.y + w.h; player.vy = 0; }
    else if(G < 0 && player.vy > 0 && prevBottom <= w.y + 0.5){ player.y = w.y - player.h; player.vy = 0; }
  }
  if(barrierOn() && player.y < room.barrierY + 2){
    player.y = room.barrierY + 2;
    if(player.vy < 0) player.vy = 0;
    if(toast.t <= 0) showToast('Bats-le d\'abord !', 50);
  }

  // springs
  if(player.vy > 0 && G > 0){
    for(const s of springs){
      if(player.x + player.w > s.x && player.x < s.x + s.w && prevBottom <= s.y + 4 && player.y + player.h >= s.y){
        player.y = s.y - player.h;
        player.vy = SPRING_V; player.noCut = true; player.usedDJ = false; player.dashReady = true; player.dashT = 0;
        player.sx = 0.7; player.sy = 1.35;
        s.t = 12; s.anim = 1;
        anim.wobV -= 0.5; setFace(anim, 'open', 30);
        dust(s.x + 10, s.y, 8);
        SFX.spring();
        break;
      }
    }
  }

  // one-way platforms: you land on their top, or on their underside when gravity is flipped
  player.onGround = false; player.standingOn = null;
  const flipping = idle.phase === 'flip' || idle.phase === 'up';
  if(G > 0 && player.vy >= 0){
    for(const p of platforms){
      if(p.gone) continue;
      if(flipping && p.y < idle.groundY - 2) continue;
      if(player.slam && p.y < FLOOR - 2) continue;   // jeté par le Gardien : il traverse les plateformes jusqu'au sol
      if(player.x + player.w > p.x + 2 && player.x < p.x + p.w - 2 &&
         prevBottom <= p.y + 1 + Math.max(0, p.dy) && player.y + player.h >= p.y){
        player.y = p.y - player.h;
        player.vy = 0;
        player.onGround = true;
        player.standingOn = p;
        player.usedDJ = false;
        if(p.crumble && p.cT === 0) p.cT = 1;
        if(p.fall && !p.loose && p.fT === 0) p.fT = 1;
      }
    }
  } else if(G < 0 && player.vy <= 0){
    for(const p of platforms){
      if(p.gone) continue;
      const pb = p.y + p.h;
      if(player.x + player.w > p.x + 2 && player.x < p.x + p.w - 2 &&
         prevTop >= pb - 1 + Math.min(0, p.dy) && player.y <= pb){
        player.y = pb;
        player.vy = 0;
        player.onGround = true;
        player.standingOn = p;
        player.usedDJ = false;
        if(p.crumble && p.cT === 0) p.cT = 1;
        if(p.fall && !p.loose && p.fT === 0) p.fT = 1;
      }
    }
  }
  for(const w of solids){
    if(w.gone || !overlap(player, w)) continue;
    const up = player.y + player.h - w.y, down = w.y + w.h - player.y, left = player.x + player.w - w.x, right = w.x + w.w - player.x;
    const m = Math.min(up, down, left, right);
    if(m === up){ player.y = w.y - player.h; if(player.vy > 0) player.vy = 0; if(G > 0){ player.onGround = true; player.standingOn = w; player.usedDJ = false; } }
    else if(m === down){ player.y = w.y + w.h; if(player.vy < 0) player.vy = 0; if(G < 0){ player.onGround = true; player.standingOn = w; player.usedDJ = false; } }
    else if(m === left){ player.x = w.x - player.w; player.vx = Math.min(0, player.vx); }
    else { player.x = w.x + w.w; player.vx = Math.max(0, player.vx); }
  }
  if(player.onGround){ player.dashReady = true; player.wallT = 0; }
  if(player.onGround && !wasGround){
    const k = Math.min(impact / 12, 1);
    player.sx = 1 + 0.35*k; player.sy = 1 - 0.3*k;
    anim.wobV += Math.min(impact, 12) * 0.05;
    if(impact > 4) dust(player.x + player.w/2, G > 0 ? player.y + player.h : player.y, 6);
    if(impact > 6) SFX.land();
  }
  player.coyote = player.onGround ? COYOTE : Math.max(0, player.coyote - 1);

  // walls: touching one in the air lets you wall-jump; pushing into it while falling slows you down
  player.sliding = false;
  if(hasWall && !player.onGround && player.dashT <= 0){
    const touch = s => { const pr = {x:s > 0 ? player.x + player.w : player.x - 2, y:player.y + 6, w:2, h:player.h - 12}; return solids.some(w => !w.gone && !w.slick && !w.glass && overlap(pr, w)); };
    const R = touch(1), L = touch(-1);
    const side = dir && (dir > 0 ? R : L) ? dir : R ? 1 : L ? -1 : 0;
    if(side){
      player.wallSide = side; player.wallT = WALL_COY;
      if(dir === side && player.vy * G > 0){
        player.sliding = true; player.dashReady = true;
        if(frame % 5 === 0) particles.push({x:player.x + (side > 0 ? player.w : 0), y:player.y + player.h * (G > 0 ? 0.3 : 0.7), vx:-side * 0.4, vy:-G * 0.3, life:18, max:18, color:'#ffffff', grav:0, size:2, type:'puff', drag:0.94});
        if(frame % 14 === 0) tone(170 + Math.random() * 40, 0.05, 'triangle', 0.012);
      }
    } else if(player.wallT > 0) player.wallT--;
  } else if(player.wallT > 0) player.wallT--;

  player.sx += (1 - player.sx) * 0.2;
  player.sy += (1 - player.sy) * 0.2;
  if(player.onGround && Math.abs(player.vx) > 0.5 && frame % 9 === 0) dust(player.x + player.w/2, G > 0 ? player.y + player.h : player.y, 1);
  if(player.invuln > 0) player.invuln--;
  if(player.hurtT > 0) player.hurtT--;
  if(player.shotCD > 0) player.shotCD--;

  // gravity orbs and gravity lines: touch one and the world turns upside down
  for(const o of flips){
    if(o.t > 0) o.t = Math.max(0, o.t - 0.04);
    if(o.cd > 0) o.cd--;
    const hit = overlap(player, o);
    if(hit && o.armed && !(o.cd > 0)){
      o.armed = false; o.t = 1; if(!o.w) o.cd = 24;
      const want = o.set || -gdir;
      if(want !== gdir) setGravity(want);
    } else if(!hit) o.armed = true;
  }

  // pits (or the open sky, upside down)
  if(gdir > 0 && player.y > room.h + 30){ killPlayer(); return; }
  if(gdir < 0 && player.y + player.h < -40){ killPlayer(); return; }
  if(gdir < 0 && player.y > room.h){ killPlayer(); return; }       // upside down, below the bottom of the screen: no sneaking under the floor

  // spikes and lava pools
  for(const s of spikes){
    if(s.pending) continue;          // still coming out of the floor
    const hb = s.side ? {x:s.side === 'left' ? s.x - 8 : s.x, y:s.y + 3, w:8, h:s.h - 6}
             : s.lava ? {x:s.x, y:s.y - 8, w:s.w, h:30}
             : s.down ? {x:s.x + 3, y:s.y, w:s.w - 6, h:8}
             : {x:s.x + 3, y:s.y - 8, w:s.w - 6, h:8};
    if(overlap(player, hb)){ killPlayer(); return; }
  }

  // the burning floor of the last fight: stay on the ledges
  const hf = room.hotFloor;
  if(hf && boss && boss.alive && !boss.dying && !cine && player.onGround && player.y + player.h >= hf.y - 1
     && player.x + player.w / 2 > hf.x0 && player.x + player.w / 2 < hf.x1){
    if(player.invuln <= 0){ hurt(player.x + player.w / 2 + player.facing); if(state !== 'play') return; }
    player.vy = -11.5; player.noCut = true; player.usedDJ = false; player.onGround = false;
    burst(player.x + player.w / 2, hf.y, 10, '#ff8a3c', 3, 25);
    if(!fireTold){ fireTold = true; showToast('Le sol brûle ! Reste sur les plateformes', 130); }
  }

  // rising lava bounces you back up
  if(room.lava && player.y + player.h > lavaY + 6){
    if(player.invuln <= 0){
      hurt(player.x + player.w/2 + player.facing);
      if(state !== 'play') return;
    }
    player.vy = -12.5; player.noCut = true; player.usedDJ = false;
    burst(player.x + player.w/2, lavaY, 10, '#ff8a3c', 3, 25);
  }

  // checkpoints (some hang from the ceiling, for the upside-down parts)
  for(const c of checkpoints){
    const box = c.ceil ? {x:c.x - 6, y:c.y, w:24, h:40} : {x:c.x - 6, y:c.y - 40, w:24, h:40};
    if(!c.active && overlap(player, box)){
      checkpoints.forEach(o => o.active = false);
      c.active = true;
      srSplit();
      checkpoint = c.ceil ? {x:c.x, y:c.y + 1, g:-1} : {x:c.x, y:c.y - player.h - 1, g:1};
      sparkle(c.x + 12, c.ceil ? c.y + 30 : c.y - 30, 12, '#7dff9a');
      confetti(c.x + 4, c.ceil ? c.y + 36 : c.y - 36, 16);
      setFace(anim, 'open', 40);
      SFX.checkpoint();
      showToast('Checkpoint !', 60);
    }
  }

  // shooting
  if(input.shootPressed){
    if(!canShoot) showToast("Pas encore d'arme !", 50);
    else if(player.shotCD <= 0){
      player.shotCD = SHOT_COOLDOWN;
      anim.shootT = 12;
      if(room.shootUp){
        shots.push({x:player.x + player.w/2 - 3, y:player.y - 12, w:6, h:12, vx:0, vy:-9});
      } else {
        shots.push({x:player.facing > 0 ? player.x + player.w : player.x - 10, y:G > 0 ? player.y + 12 : player.y + player.h - 17, w:10, h:5, vx:player.facing * SHOT_SPEED, vy:0});
        player.vx -= player.facing * 0.6;
      }
      SFX.shoot();
    }
  }
  // charged shot: keep the shoot key down, let go when XELIAX glows
  if(canShoot && input.shootHeld && !cine && finaleT === 0){
    player.charge = (player.charge || 0) + 1;
    if(player.charge === CHARGE_FULL){ tone(880, 0.12, 'triangle', 0.04, 1320); sparkle(player.x + player.w / 2, player.y + player.h / 2, 10, '#ffd54a'); }
    if(player.charge > 12 && frame % 4 === 0){
      const a = Math.random() * TAU, r = 22;
      particles.push({x:player.x + player.w / 2 + Math.cos(a) * r, y:player.y + player.h / 2 + Math.sin(a) * r, vx:-Math.cos(a) * 1.4, vy:-Math.sin(a) * 1.4, life:14, max:14,
        color:player.charge >= CHARGE_FULL ? '#ffd54a' : '#b9a2ff', grav:0, size:2.4, type:'dot'});
    }
  } else {
    if((player.charge || 0) >= CHARGE_FULL && canShoot && state === 'play'){
      anim.shootT = 14; addShake(3); SFX.shoot(); tone(220, 0.2, 'sawtooth', 0.04, 90);
      if(room.shootUp) shots.push({x:player.x + player.w / 2 - 7, y:player.y - 20, w:14, h:22, vx:0, vy:-10, big:true, hits:new Set()});
      else {
        shots.push({x:player.facing > 0 ? player.x + player.w : player.x - 22, y:G > 0 ? player.y + 8 : player.y + player.h - 20, w:22, h:12, vx:player.facing * 9, vy:0, big:true, hits:new Set()});
        player.vx -= player.facing * 2.2;
      }
    }
    player.charge = 0;
  }
  for(const s of shots){
    s.x += s.vx; s.y += s.vy;
    // a shot catches the coins it flies through
    for(const c of coins) if(!c.got && overlap(s, {x:c.x - 8, y:c.y - 8, w:16, h:16})){
      c.got = true; score += 10; chCoins++; collected.add(c.id); addBank(1);
      sparkle(c.x, c.y, 5, '#ffe066'); popup(c.x, c.y - 8, '+10', '#ffe066'); flyCoin(c.x, c.y); SFX.coin();
    }
    const hitWall = solids.find(w => !w.gone && overlap(s, w));
    if(hitWall){
      s.dead = true; burst(s.x + s.w / 2, s.y + s.h / 2, 5, '#d9d0ff', 1.6, 14, 0, 2.2, 'star');
      if(hitWall.gate) hitGate(hitWall, s);
      else if(hitWall.glass){ hitWall.flash = 6; SFX.ting(); }
    }
  }

  // walkers & bats: stomp them, dash through them, or get hurt
  const stompable = [...enemies.filter(e => e.alive), ...bats.filter(b => b.alive)];
  for(const e of stompable){
    if(!overlap(player, e)) continue;
    const onTop = G > 0 ? (player.vy > 0 && prevBottom <= e.y + 8) : (player.vy < 0 && prevTop >= e.y + e.h - 8);
    // a hedgehog (spiky:true) can't be stomped or dashed through: only a falling plank beats it
    if(e.spiky){ hurt(e.x + e.w/2); if(state !== 'play') return; continue; }
    if(onTop || player.dashT > 0){
      e.alive = false;
      if(onTop){
        player.vy = -8 * G; player.usedDJ = false;
        player.sx = 0.8; player.sy = 1.25;
      } else addShake(2);
      player.dashReady = true;
      anim.wobV -= 0.3; setFace(anim, 'open', 20);
      score += 25;
      killFx(e);
      addShake(3);
      SFX.stomp();
    } else hurt(e.x + e.w/2);
    if(state !== 'play') return;
  }
  for(const t of turrets){
    if(t.alive && overlap(player, t)){ hurt(t.x + 12); if(state !== 'play') return; }
  }

  // shots vs everything
  for(const s of shots){
    // a shot cancels a boss's fireball
    for(const bl of bullets){
      if(!s.dead && !bl.dead && bl.kind === 'boss' && overlap(s, bl)){
        s.dead = true; bl.dead = true;
        burst(bl.x + bl.w / 2, bl.y + bl.h / 2, 8, '#ffb0d0', 2, 18, 0, 2.6, 'star');
        SFX.ting();
      }
    }
    for(const e of stompable){
      if(e.alive && !s.dead && overlap(s, e)){
        if(e.spiky){
          s.dead = true; burst(s.x, s.y, 6, '#ffffff', 2, 15, 0.05, 2.5, 'star'); SFX.ting();
          if(toast.t <= 0) showToast('Ses piques arrêtent les tirs… une planche ?', 90);
          continue;
        }
        e.alive = false; score += 25; addBank(1);
        if(s.big) s.hits.add(e); else s.dead = true;
        popup(e.x + e.w / 2, e.y - 6, '+1 🪙', '#ffe066');
        killFx(e); SFX.stomp();
      }
    }
    for(const t of turrets){
      if(t.alive && !s.dead && overlap(s, t)){
        s.dead = true; t.hp -= s.big ? 3 : 1; t.flash = 8;
        burst(s.x, s.y, 6, '#ffd54a', 2, 15, 0.05, 2.5, 'star');
        if(t.hp <= 0){
          t.alive = false; score += 50; addBank(3);
          popup(t.x + 12, t.y, '+3 🪙', '#ffd54a');
          burst(t.x + 12, t.y + 12, 18, '#ffb27a', 4, 35, 0.15, 3);
          burst(t.x + 12, t.y + 12, 10, '#ffffff', 2, 30, -0.02, 5, 'puff');
          addShake(5); SFX.stomp();
        }
      }
    }
    if(!s.dead && boss && boss.alive && !boss.fleeing && !boss.dying && (boss.mode === 'arena' || boss.mode === 'ascent') && overlap(s, boss)){
      s.dead = true;
      if(boss.inv > 0){
        // still shielded from the last hit: the shot glances off
        boss.shieldT = 12;
        burst(s.x + s.w / 2, s.y + s.h / 2, 6, '#d9e4ff', 2.5, 14, 0, 2.5, 'star');
        SFX.ting();
      } else bossDamage();
    }
    if(!s.dead && boss && boss.alive && !boss.dying && S2_BOSS.has(boss.mode) && overlap(s, boss)){
      // the season 2 bosses shrug off shots… except the yeti's ice shields
      s.dead = true;
      if(boss.mode === 'yeti' && (s.vx > 0 ? boss.shL : boss.shR) > 0){
        const k = s.vx > 0 ? 'shL' : 'shR';
        boss[k] = Math.max(0, boss[k] - (s.big ? 3 : 1));
        SFX.glass(); addShake(2);
        burst(s.x + s.w / 2, s.y + s.h / 2, 10, '#bfe6ff', 2.6, 22, 0.1, 3, 'crumb');
        if(boss[k] === 0) popup(boss.x + boss.w / 2, boss.y - 12, 'Bouclier brisé !', '#bfe6ff');
        continue;
      }
      // the magpie, dazed against the side: every shot counts (a super shot counts for 3)
      if(boss.mode === 'magpie' && boss.state === 'dazed' && boss.inv <= 0){
        magpieShot(boss, s.big ? 3 : 1);
        burst(s.x + s.w / 2, s.y + s.h / 2, 8, '#ffd54a', 2.4, 18, 0, 3, 'star');
        continue;
      }
      // phase 2: the gecko is dazed after 5 hits while it is on the walls (a super shot counts for 3)
      if(boss.mode === 'gecko' && boss.phase === 2 && (boss.state === 'crawl' || boss.state === 'climb') && boss.inv <= 0){
        geckoShot(boss, s.big ? 3 : 1);
        burst(s.x + s.w / 2, s.y + s.h / 2, 8, '#9dff5a', 2.4, 18, 0.1, 3, 'goo');
        continue;
      }
      boss.shieldT = 12;
      burst(s.x + s.w / 2, s.y + s.h / 2, 6, '#d9e4ff', 2.5, 14, 0, 2.5, 'star');
      SFX.ting();
    }
  }
  shots = shots.filter(s => !s.dead && s.x > camX - 30 && s.x < camX + W + 30 && s.y > camY - 30 && s.y < camY + H + 30);

  // jeté au sol par le Gardien : l'atterrissage coûte un cœur
  if(player.slam && player.onGround){
    player.slam = false;
    addShake(12); dust(player.x + player.w / 2, FLOOR, 14); SFX.thud();
    hurt(player.x + player.w / 2);
    if(state !== 'play') return;
  }

  // boss contact: landing on top of the slime or the owl always bounces you (it only scores when
  // they're vulnerable), and the owl is harmless while stunned or flying back up after a hit
  if(boss && boss.alive && !boss.fleeing && !boss.dying && !cine && S2_BOSS.has(boss.mode)){
    if(bossContact2(prevBottom, prevTop)) return;
  } else if(boss && boss.alive && !boss.fleeing && !boss.dying && !cine && overlap(player, boss)){
    const sw = boss.mode === 'swoop', calm = sw && (boss.state === 'stunned' || boss.state === 'rise');
    const fromAbove = player.vy > 0 && prevBottom <= boss.y + 16;
    // sauter sur le Gardien en plein vol ne marche pas : il attrape XELIAX et le jette au sol
    if(sw && fromAbove && player.invuln <= 0 && ['hover', 'warn', 'sweepGo', 'sweepWarn'].includes(boss.state)){
      boss.state = 'grab'; boss.stT = 36;
      player.held = true; player.vx = player.vy = 0;
      setFace(anim, 'hurt', 70); SFX.warn(); addShake(4);
      showToast('Il t\'attrape ! Attends qu\'il s\'écrase au sol pour le frapper', 130);
      return;
    }
    if((boss.mode === 'slime' || sw) && fromAbove){
      if(boss.inv <= 0 && (!sw || boss.state === 'stunned' || boss.state === 'sweep')){
        const phaseBefore = boss.phase;
        bossDamage();
        // v51 : en phase 2, tous les 2 coups (2e et 4e), il riposte avec l'attaque des 3 sauts
        if(boss.mode === 'slime' && phaseBefore === 2 && boss.phase === 2 && boss.alive && !boss.dying && !cine
           && (boss.maxHp - boss.hp) % 2 === 0){
          boss.burst = 0; boss.warnT = 0; boss.inBurst = false; boss.burstNext = true;   // part dès qu'il touche le sol
        }
        if(sw && boss.alive && !boss.dying && !cine) boss.state = 'rise';
        if(boss.mode === 'slime'){
          // v51 : Roi Gluant touché → ses petits slimes disparaissent, et XELIAX est poussé un peu sur le côté
          // (pour ne pas enchaîner les coups) ; le boss est protégé 2 s (voir bossDamage)
          for(const e of enemies) if(e.alive){ e.alive = false; killFx(e); }
          let side = Math.sign(player.x + player.w/2 - (boss.x + boss.w/2)) || (Math.random() < 0.5 ? -1 : 1);
          if((side < 0 && player.x < 80) || (side > 0 && player.x + player.w > room.w - 80)) side = -side;   // pas contre un mur : vers le côté libre
          player.vx = side * 4.2; player.pushT = 16;
        }
      }
      player.y = boss.y - player.h;
      player.vy = -11; player.noCut = true; player.usedDJ = false;
      player.sx = 0.75; player.sy = 1.3;
      anim.wobV -= 0.4; setFace(anim, 'open', 30);
    } else if(!calm && (boss.inv <= 0 || boss.mode === 'arena' || boss.mode === 'ascent')){
      hurt(boss.x + boss.w/2);
      if(state !== 'play') return;
    }
  }

  // the floor the owl set alight
  for(const f of fires){
    if(f.t > 10 && f.t < f.max - 14 && overlap(player, {x:f.x + 5, y:FLOOR - 12, w:f.w - 10, h:12})){ hurt(f.x + f.w / 2); if(state !== 'play') return; }
  }
  // enemy bullets
  for(const b of bullets){
    if(overlap(player, {x:b.x + 2, y:b.y + 2, w:b.w - 4, h:b.h - 4})){
      b.dead = true; hurt(b.x + b.w/2);
      if(state !== 'play') return;
    }
  }

  // coins fly to the counter
  for(const c of coins){
    if(c.got) continue;
    if(overlap(player, {x:c.x - 8, y:c.y - 8, w:16, h:16})){
      c.got = true; score += 10; chCoins++; collected.add(c.id); addBank(1);
      sparkle(c.x, c.y, 5, '#ffe066');
      popup(c.x, c.y - 8, '+10', '#ffe066');
      flyCoin(c.x, c.y);
      SFX.coin();
    }
  }

  // power-ups
  for(const p of powerUps){
    if(p.got || !overlap(player, p)) continue;
    p.got = true; collected.add(p.id);
    SFX.power();
    ring(p.x + 10, p.y + 10, POWER_COLORS[p.type], 6, 40, 24);
    sparkle(p.x + 10, p.y + 10, 16, POWER_COLORS[p.type]);
    setFace(anim, 'open', 45);
    if(p.type === 'doubleJump'){ hasDJ = true; showToast(chapter.season === 2 ? 'Double saut récupéré !' : 'Double saut débloqué !', 130); }
    if(p.type === 'life'){ lives++; showToast('+1 vie !', 90); }
    if(p.type === 'shoot'){ canShoot = true; showToast('Arme débloquée ! Touche ' + KEYS_TXT.shoot, 140); }
    if(p.type === 'gem'){ chGem = true; score += 100; popup(p.x + 10, p.y, '+100', '#9fe8ff'); showToast('Gemme secrète trouvée !', 130); }
    if(p.type === 'wall'){ hasWall = true; showToast('Tentacules-ventouses ! Saute contre un mur', 170); }
    if(p.type === 'dash'){ hasDash = true; hasDJ = true; player.dashReady = true; showToast('Le dash ! Touche ' + KEYS_TXT.dash + ' : fonce et brise la glace', 200); }
  }

  // key, or the ficelle aux olives in the very last room
  if(key && !key.got && key.kind === 'ficelle' && overlap(player, key)){ startFinale(); return; }
  if(key && !key.got && overlap(player, key)){
    key.got = true; hasKey = true; score += 50;
    sparkle(key.x + 9, key.y + 9, 16, '#ffe066');
    ring(key.x + 9, key.y + 9, '#ffe066', 6, 36, 22);
    setFace(anim, 'open', 45);
    SFX.key();
    showToast('Clé récupérée ! Vers la sortie', 110);
  }

  // door
  if(door && player.onGround && overlap(player, door)){
    if(doorLocked()){
      if(toast.t <= 0){
        door.shake = 1;
        if(room.needsKey) showToast(boss && boss.alive ? 'Bats le boss pour la clé !' : 'Ramasse la clé !', 60);
        else if(!door.told){ door.told = true; showToast('Bats le boss pour ouvrir !', 60); }
      }
    } else startExit();
  }
}

// a jump off the wall you are touching: kicked away from it, double jump and dash back
function wallJump(){
  const s = player.wallSide;
  player.vx = -s * WJ_VX; player.vy = WJ_VY * gdir;
  player.wallLock = WALL_LOCK; player.wallT = 0; player.sliding = false;
  player.usedDJ = false; player.dashReady = true; player.noCut = false; player.dashT = 0;
  player.facing = -s; player.buffer = 0; player.coyote = 0;
  player.sx = 0.8; player.sy = 1.2; anim.wobV -= 0.3; anim.spin = 0;
  dust(player.x + (s > 0 ? player.w : 0), player.y + player.h / 2, 5);
  SFX.walljump();
}

function startDash(d){
  player.dashT = DASH_T; player.dashDir = d; player.dashCD = DASH_CD; player.facing = d;
  if(!player.onGround) player.dashReady = false;
  player.vy = 0; player.noCut = true; player.wallLock = 0;
  player.sx = 1.35; player.sy = 0.72;
  anim.wobV += 0.4;
  ring(player.x + player.w / 2, player.y + player.h / 2, POWER_COLORS.dash, 4, 26, 14);
  burst(player.x + player.w / 2 - d * 8, player.y + player.h / 2, 6, '#ffffff', 2, 18, 0, 3, 'puff');
  addShake(1.5);
  SFX.dash();
}

// flip the world: XELIAX falls towards the other side
function setGravity(g){
  gdir = g;
  player.vy = g * 1.5;
  player.onGround = false; player.standingOn = null; player.coyote = 0; player.buffer = 0;
  player.usedDJ = false; player.dashReady = true; player.noCut = true; player.sliding = false; player.wallT = 0;
  anim.wobV += 0.8; setFace(anim, 'o', 30);
  ring(player.x + player.w / 2, player.y + player.h / 2, POWER_COLORS.gravity, 6, 44, 22);
  sparkle(player.x + player.w / 2, player.y + player.h / 2, 10, POWER_COLORS.gravity);
  addShake(2.5);
  SFX.gravity(g);
}

// an ice wall shatters when you dash into it
function breakGlass(w){
  w.gone = true;
  solids = solids.filter(o => o !== w);
  for(let i = 0; i < 22; i++) particles.push({x:w.x + Math.random() * w.w, y:w.y + Math.random() * w.h, vx:(Math.random() - 0.5) * 5 + player.dashDir * 2, vy:-1.5 - Math.random() * 3,
    life:45, max:45, color:i % 3 ? '#cfefff' : '#ffffff', grav:0.22, size:2.5 + Math.random() * 3, type:'crumb', rot:Math.random() * TAU, vr:(Math.random() - 0.5) * 0.6});
  burst(w.x + w.w / 2, w.y + w.h / 2, 10, '#e8f8ff', 2, 26, -0.01, 4, 'puff');
  addShake(6); SFX.glass();
  score += 30; popup(w.x + w.w / 2, w.y + 10, '+30', '#bff1ff');
  if(player.standingOn === w){ player.standingOn = null; player.onGround = false; }
}

