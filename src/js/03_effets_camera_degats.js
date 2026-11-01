// =====================================================================
//  EFFECTS
// =====================================================================
function burst(x, y, n, color, spd=3, life=30, grav=0.15, size=3, type='dot'){
  for(let i = 0; i < n; i++){
    const a = Math.random() * TAU, s = Math.random() * spd;
    particles.push({x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s - spd*0.3, life, max:life, color, grav, size:size*(0.6 + Math.random()*0.8), type, rot:Math.random()*TAU, vr:(Math.random() - .5)*0.3});
  }
}
function dust(x, y, n=6){
  for(let i = 0; i < n; i++){
    particles.push({x:x + (Math.random() - .5)*14, y:y - 1, vx:(Math.random() - .5)*1.6, vy:-Math.random()*0.9,
      life:22 + Math.random()*8, max:30, color:'#ffffff', grav:-0.01, size:2.2 + Math.random()*2.4, type:'puff', drag:0.94});
  }
}
function sparkle(x, y, n, color){
  for(let i = 0; i < n; i++){
    const a = Math.random() * TAU, s = 0.8 + Math.random()*2.6;
    particles.push({x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:26 + Math.random()*14, max:40, color, grav:0.02, size:2.5 + Math.random()*2.5, type:'star', rot:Math.random()*TAU, vr:0.15, drag:0.93});
  }
}
function ring(x, y, color, r0, r1, life){ particles.push({x, y, vx:0, vy:0, life, max:life, color, grav:0, size:2.5, type:'ring', r0, r1}); }
function crumbs(x, y, n, color){
  for(let i = 0; i < n; i++) particles.push({x:x + (Math.random() - .5)*10, y, vx:(Math.random() - .5)*1.2, vy:Math.random()*0.5, life:30, max:30, color, grav:0.18, size:1.6 + Math.random()*1.6, type:'crumb', rot:Math.random()*TAU, vr:(Math.random() - .5)*0.4});
}
function confetti(x, y, n){
  const cols = ['#ffd54a', '#2ee6ff', '#ff6fa5', '#8cff7a', '#ff8a3d', '#b48cff'];
  for(let i = 0; i < n; i++){
    const a = -Math.PI/2 + (Math.random() - .5)*1.6, s = 3 + Math.random()*4;
    particles.push({x, y, vx:Math.cos(a)*s, vy:Math.sin(a)*s, life:80 + Math.random()*40, max:120, color:cols[i % cols.length], grav:0.12, size:3, type:'confetti', rot:Math.random()*TAU, vr:(Math.random() - .5)*0.5, drag:0.97});
  }
}
function popup(x, y, text, color='#ffffff'){ popups.push({x, y, text, color, t:0}); }
function flyCoin(wx, wy){ flyers.push({sx:wx - viewX, sy:wy - viewY, t:0, done:false}); }

function heroPop(){
  const cx = player.x + player.w/2, cy = player.y + player.h/2;
  for(let i = 0; i < 18; i++){
    const a = Math.random() * TAU, s = 1.5 + Math.random()*3.5;
    particles.push({type:'goo', x:cx, y:cy, vx:Math.cos(a)*s, vy:Math.sin(a)*s - 2, life:50 + Math.random()*20, max:70, color:i % 3 ? HERO.body : HERO.light, grav:0.18, size:2 + Math.random()*2.5, drag:0.98});
  }
  for(const s of [-1, 1]) particles.push({type:'eye', x:cx + s*3, y:cy - 6, vx:s*(1.5 + Math.random()), vy:-5 - Math.random()*2, life:90, max:90, grav:0.25, size:4.2, rot:0, vr:s*0.2, drag:0.99, color:'#ffffff'});
  ring(cx, cy, HERO.light, 4, 34, 22);
  SFX.splat();
}

function showToast(text, t=90){ toast = {text, t, max:t}; }
function addShake(v){ if(!SET.shake) return; shake = Math.max(shake, REDUCED ? v * 0.3 : v); }
function overlap(a, b){ return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

// =====================================================================
//  CAMERA (eases ahead of the run, follows platform height, not every hop)
// =====================================================================
function camTargets(){
  const tx = player.x + player.w/2 - W/2 + lookX;
  let ty = camFocusY - H * camOff;
  if(barrierOn()) ty = room.h - H;   // camera stays on the arena until the boss is beaten
  return [clamp(tx, 0, room.w - W), clamp(ty, 0, room.h - H)];
}
let camOff = 0.56;
function snapCamera(){
  camFocusY = player.y; lookX = 0; camOff = gdir > 0 ? 0.56 : 0.4;
  [camX, camY] = camTargets();
  prevCamX = camX; prevCamY = camY;
}
function updateCamera(){
  lookX += (clamp(player.vx * 18, -60, 60) - lookX) * 0.05;
  camOff += ((gdir > 0 ? 0.56 : 0.4) - camOff) * 0.06;
  if(player.onGround || player.dead) camFocusY = player.y;
  else if(gdir > 0){
    if(player.y > camFocusY) camFocusY = player.y;
    else if(player.y < camFocusY - 110) camFocusY = player.y + 110;
  } else {
    if(player.y < camFocusY) camFocusY = player.y;
    else if(player.y > camFocusY + 110) camFocusY = player.y - 110;
  }
  const [tx, ty] = camTargets();
  camX += (tx - camX) * 0.09;
  camY += (ty - camY) * 0.1;
}

function doorLocked(){
  return (room.needsKey && !hasKey) || (room.needsBoss && boss && boss.alive);
}

// =====================================================================
//  DAMAGE
// =====================================================================
function hurt(fromX){
  if(player.invuln > 0 || player.dead || cine) return;
  if(idle.phase) idleReset();
  lives--;
  SFX.hurt();
  addShake(8);
  hud.flash = 1;
  burst(player.x + player.w/2, player.y + player.h/2, 14, HERO.light, 4, 30);
  if(lives <= 0){ die(); return; }
  player.invuln = 90; player.hurtT = 40;
  player.vy = -6;
  player.vx = (player.x + player.w/2 < fromX ? -1 : 1) * 4.5;
  anim.wobV += 0.6;
  showToast('Aïe !', 40);
}

// spikes, pits, lava pools: lose a life and respawn at the last checkpoint
function killPlayer(){
  if(player.dead) return;
  idleReset();
  lives--;
  addShake(7);
  hud.flash = 1;
  heroPop();
  if(lives <= 0){ die(); return; }
  player.dead = true;
  respawnT = 45;
}

function die(){
  if(!player.dead) heroPop();
  player.dead = true;
  setState('over');
  SFX.over();
}

function bossDamage(){
  const b = boss;
  if(b.dying) return;              // already beaten: the death scene is playing
  b.hp--; b.hitT = 12;
  b.inv = (b.mode === 'arena' || b.mode === 'ascent') ? 60 : 50;   // the final boss can only be hit once per second
  addShake(6);
  SFX.bossHit();
  burst(b.x + b.w/2, b.y + b.h/2, 14, '#ffffff', 3, 24, 0.1, 3, 'star');
  popup(b.x + b.w/2, b.y - 6, 'Touché !', '#ffd54a');
  if(b.hp <= 0) bossDefeated();
  else if(b.hp === b.enrage) showToast(b.name + ' enrage !', 90);
  // halfway through the first fight against the Seigneur Pourpre, a heart appears on the high ledge
  if(b.mode === 'arena' && b.hp === 4 && !b.heart){
    b.heart = true;
    powerUps.push({x:300, y:158, type:'life', id:'arena-heart', w:20, h:20, got:false});
    sparkle(310, 168, 16, POWER_COLORS.life); ring(310, 168, POWER_COLORS.life, 5, 40, 22);
    showToast('Un cœur est apparu en haut !', 120);
  }
}

function bossDefeated(){
  const b = boss;
  addShake(14);
  bullets = [];
  burst(b.x + b.w/2, b.y + b.h/2, 30, '#ffd54a', 5, 50, 0.1, 3, 'star');
  ring(b.x + b.w/2, b.y + b.h/2, '#ffffff', 10, 90, 30);
  if(b.phase === 1 && room.boss.hp2){ enterPhase2(true); return; }
  if(b.phase === 2 && room.boss.hp3){ enterPhase3(true); return; }
  score += 300;
  if(b.mode === 'arena'){
    b.fleeing = true;
    phaseT = 120;
    SFX.bossFlee();
    showToast("Il s'enfuit vers le haut ! Poursuis-le", 130);
    return;
  }
  // the last hit: a little death scene before the door opens (the magpie spins, drops the ficelle and flies off)
  b.dying = 1; b.inv = 0; b.hitT = 0; b.vy = 0;
  hitStop = REDUCED ? 0 : 16;
  fires = [];
  player.invuln = Math.max(player.invuln, 150);
  if(b.mode === 'magpie' && gdir < 0) setGravity(1);   // the nest settles: XELIAX falls back onto the hay
  if(b.mode === 'gecko' && b.state !== 'stun') b.state = 'drop';
  SFX.bossFlee();
}

const BOSS_DIE = 100;
const DIE_FX = {slime:['#b45be3', 'goo'], swoop:['#8da2ff', 'crumb'], gecko:['#5fd36a', 'goo'], yeti:['#e8f6ff', 'crumb'], ascent:['#ff6b6b', 'goo']};
function updateBossDeath(b){
  const k = ++b.dying, cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  b.hitT = Math.floor(k / 4) % 2 ? 2 : 0;          // flashes white
  if(b.mode === 'magpie'){
    // dizzy, she spins in place, lets go of the ficelle, then flutters away for good
    b.state = 'hover';
    if(k === 40){ b.lost = true; dropFicelle(b); }
    if(k > 40){ if(!b.fx) b.fx = cx < W / 2 ? -1 : 1; b.face = b.fx; b.x += b.fx * (1.4 + (k - 40) * 0.05); b.y -= 1 + (k - 40) * 0.05; }
    if(k % 4 === 0) particles.push({x:cx + (Math.random() - 0.5) * 30, y:cy + (Math.random() - 0.5) * 20, vx:(Math.random() - 0.5) * 2, vy:-0.4 - Math.random(), life:70, max:70,
      color:Math.random() < 0.5 ? '#1a1430' : '#ffffff', grav:0.04, size:3.5, type:'confetti', rot:Math.random() * TAU, vr:0.2, drag:0.97});
    if(k % 10 === 0 && k < 60) tone(760 - k * 4, 0.07, 'triangle', 0.03);
    if(b.y + b.h < -30 || b.x > W + 30 || b.x + b.w < -30 || k > 240){ b.alive = false; b.dying = 0; }
    return;
  }
  // grounded bosses drop to the floor first
  if((b.mode === 'slime' || b.mode === 'gecko' || b.mode === 'yeti') && b.y + b.h < FLOOR){
    b.vy = (b.vy || 0) + 0.5; b.y = Math.min(FLOOR - b.h, b.y + b.vy);
    if(b.y + b.h >= FLOOR){ b.vy = 0; addShake(5); SFX.thud(); dust(cx, FLOOR, 10); if(b.mode === 'gecko') b.state = 'stun'; if(b.mode === 'slime') b.onGround = true; }
  }
  if(k % 5 === 0){
    burst(b.x + Math.random() * b.w, b.y + Math.random() * b.h, 5, Math.random() < 0.5 ? '#ffffff' : '#ffd54a', 2, 18, 0, 2.6, 'star');
    if(k < BOSS_DIE - 20) tone(560 - k * 3.5, 0.05, 'square', 0.025);
  }
  if(k === BOSS_DIE - 20) tone(300, 0.35, 'sine', 0.05, 1200);
  if(k >= BOSS_DIE) finishBoss(b);
}
function finishBoss(b){
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, fx = DIE_FX[b.mode] || ['#ff6b6b', 'goo'];
  b.alive = false; b.dying = 0;
  burst(cx, cy, 46, fx[0], 6, 60, 0.15, 4, fx[1]);
  burst(cx, cy, 20, '#ffffff', 3, 40, -0.02, 6, 'puff');
  ring(cx, cy, '#ffffff', 12, 100, 30);
  confetti(cx, cy, 40);
  particles.push({x:cx, y:cy, vx:0, vy:-0.7, grav:-0.004, drag:1, life:120, max:120, color:fx[0], size:11, type:'soul', rot:0});
  addShake(12); SFX.stomp();
  if(b.mode === 'ascent') startEscape(true);
  else {
    SFX.key();
    showToast(b.name + (b.fem ? ' est vaincue' : ' est vaincu') + ' ! Porte ouverte', 150);
    spikes = spikes.filter(s => !(room.phase2Spikes || []).some(z => z.x === s.x && z.y === s.y));
  }
}

// slime / swoop bosses come back stronger for a second phase
function enterPhase2(announce){
  const b = boss;
  b.phase = 2;
  b.hp = b.maxHp = room.boss.hp2;
  b.inv = 90; b.hitT = 0;
  if(b.mode === 'slime'){ b.onGround = true; b.y = FLOOR - b.h; b.vx = b.vy = 0; b.hopT = 70; b.hops = 0; }
  // the phase-2 spikes are only announced here: they come out during the cinematic, never under XELIAX
  if(b.mode === 'swoop'){ b.state = 'rise'; for(const s of (room.phase2Spikes || [])) spikes.push({...s, appear:0, pending:true}); }
  if(S2_BOSS.has(b.mode)){
    for(const s of (room.phase2Spikes || [])) spikes.push({...s, appear:0, pending:true});
    if(b.mode === 'gecko'){ b.state = b.state === 'stun' ? 'climb' : 'crawl'; b.stT = 120; b.leaps = 0; }
    if(b.mode === 'yeti'){ b.state = 'walk'; b.stT = 140; b.y = FLOOR - b.h; }
    if(b.mode === 'magpie'){ b.state = 'rise'; }
  }
  if(announce){
    score += 150;
    burst(b.x + b.w/2, b.y + b.h/2, 50, '#ff6b6b', 6, 55);
  }
  startCine('phase2');
}

// phase 3 (the magpie only, hp3): furious, she chains her dives straight at XELIAX
function enterPhase3(announce){
  const b = boss;
  b.phase = 3;
  b.hp = b.maxHp = room.boss.hp3;
  b.inv = 90; b.hitT = 0; b.state = 'rise'; b.chain = 0; b.nestT = 0;
  if(gdir < 0) setGravity(1);
  if(announce){ score += 200; burst(b.x + b.w/2, b.y + b.h/2, 60, '#ff3d3d', 7, 60); }
  startCine('phase3');
}

// final boss beaten at the bottom of the shaft: barrier drops, lava rises, key waits at the top
function startEscape(announce){
  key = {x:room.keySpot.x - 17, y:room.keySpot.y - 8, w:34, h:16, got:false, kind:room.finale ? 'ficelle' : 'key'};
  lavaDelay = room.lava.delay;
  if(announce){
    sparkle(room.keySpot.x, room.keySpot.y, 14, '#ffe066');
    SFX.bossFlee();
    showToast(room.finale ? 'Vaincu ! La ficelle aux olives est au sommet : grimpe !' : 'Vaincu ! Fuis vers le haut, la clé est au sommet', 170);
  }
}

// XELIAX grabs the ficelle aux olives: a short celebration, then the ending
function startFinale(){
  finaleT = 1;
  key.got = true;
  player.invuln = 9999; player.hurtT = 0;
  for(const e of [...enemies, ...bats]) if(e.alive){ e.alive = false; burst(e.x + e.w / 2, e.y + e.h / 2, 8, '#ffffff', 1.6, 26, -0.01, 4, 'puff'); }
  score += 1000;
  bullets = [];
  lavaDelay = 1e9;
  const cx = key.x + key.w / 2, cy = key.y + key.h / 2;
  sparkle(cx, cy, 24, '#ffe066'); ring(cx, cy, '#ffe066', 6, 60, 30); confetti(cx, cy, 40);
  setFace(anim, 'open', 200);
  SFX.key();
  if(chIndex === STORY_END && !key.gold && !room.ending2) steal = {x:0, y:0, w:48, h:40, state:'hover', phase:1, face:-1, hitT:0, inv:0, lost:true, got:false, on:false};
  showToast(key.gold === 'crystal' ? 'La ficelle de cristal ! Défi bonus réussi !' : key.gold ? 'La ficelle dorée ! Défi bonus réussi !' : 'XELIAX a retrouvé la ficelle aux olives !', 170);
}

function barrierOn(){ return !!(room && room.barrierY && boss && boss.alive); }

function currentPhase(){
  if(!boss) return 1;
  if(boss.mode === 'ascent') return boss.alive ? 1 : 'escape';
  return boss.phase;
}

// game over in a boss room: retry only the phase you were on
function restartPhase(){
  continues++;
  const ph = currentPhase();
  lives = startLives();
  loadRoom(chIndex, rIndex);          // the boss entrance plays again (it can be skipped by now)
  if((ph === 2 || ph === 3) && boss.mode === "magpie"){ boss.x = boss.tx = room.boss.x; boss.y = 150; }   // back in the arena, not off-screen
  if(ph === 2){ cine = null; enterPhase2(false); }
  if(ph === 3){ cine = null; enterPhase2(false); cine = null; enterPhase3(false); }
  if(ph === 'escape'){ cine = null; boss.alive = false; startEscape(false); }
  bannerT = 0;
  player.invuln = 60;
  anim.appear = 0;
  setState('play');
  showToast(ph === 'escape' ? 'Reprends la fuite !' : ph === 3 ? 'On reprend la phase 3' : ph === 2 ? 'On reprend la phase 2' : 'On reprend le combat', 100);
}

// =====================================================================
//  IDLE: leave XELIAX alone for 10 s and he starts wondering about things;
//  at 20 s he tries a backflip, lands on his head and needs 3 presses
//  of the jump key to get back up.
// =====================================================================
const IDLE_THINK = 600, IDLE_FLIP = 1200;
const IDLE_Q = [
  'Pourquoi les olives n\'ont pas de jambes ?',
  'Et si la ficelle était au fromage ?',
  'Est-ce que les boss mangent du pain ?',
  'Je suis un haricot ou un bonbon ?',
  'Qui a inventé les pics, franchement ?',
  'Mes yeux regardent chacun ailleurs…',
  'Une baguette, c\'est une ficelle qui a grandi ?',
  'Il y a quelqu\'un derrière l\'écran ?',
  'J\'ai mis le four à préchauffer, moi ?',
  'Pourquoi je ne bouge plus, déjà ?',
];
const idle = {t:0, phase:'', q:0, qT:0, presses:0, rot:0, land:0, koT:0, upT:0, bandage:0, groundY:0};

function idleReset(){
  idle.t = 0; idle.phase = ''; idle.rot = 0; idle.presses = 0; idle.koT = 0; idle.upT = 0;
}
function idleBlocked(){
  const sp = player.standingOn;
  return state !== 'play' || player.dead || !!cine || finaleT > 0 || exitT > 0 || fadeDir !== 0 ||
         (boss && boss.alive) || !player.onGround || gdir < 0 || player.dashT > 0 || (sp && (sp.move || sp.crumble));
}
function updateIdle(){
  if(idle.bandage > 0) idle.bandage--;
  if(idle.phase === '' || idle.phase === 'think'){
    const pressing = input.left || input.right || input.jumpHeld || input.jumpPressed || input.shootPressed;
    if(pressing || idleBlocked()){ idle.t = 0; idle.phase = ''; return; }
    idle.t++;
    if(idle.t >= IDLE_THINK && idle.phase === ''){
      idle.phase = 'think'; idle.q = Math.floor(Math.random() * IDLE_Q.length); idle.qT = 0;
      tone(520, 0.12, 'triangle', 0.03, 760);
    }
    if(idle.phase === 'think'){
      idle.qT++;
      if(idle.qT >= 200 && idle.t < IDLE_FLIP - 130){
        idle.q = (idle.q + 1 + Math.floor(Math.random() * (IDLE_Q.length - 1))) % IDLE_Q.length; idle.qT = 0;
        tone(520, 0.12, 'triangle', 0.03, 760);
      }
      if(idle.t === IDLE_FLIP - 130) idle.qT = 0;
      if(idle.t >= IDLE_FLIP) startBackflip();
    }
    return;
  }
  if(idle.phase === 'flip'){
    idle.land++;
    idle.rot = -player.facing * Math.PI * easeInOutCubic(Math.min(1, idle.land / 32));
    if(player.onGround && idle.land > 6) neckCrack();
    return;
  }
  if(idle.phase === 'ko'){
    idle.koT++;
    // on his back, legs in the air, rocking a little
    idle.rot = -player.facing * (Math.PI + Math.sin(idle.koT * 0.06) * 0.07 * Math.min(1, idle.koT / 40));
    if(idle.koT > 60 && idle.koT % 70 === 0) anim.wobV += 0.35;      // little twitches
    return;
  }
  if(idle.phase === 'up'){
    idle.upT++;
    idle.rot *= 0.8;
    if(idle.upT > 8 && player.onGround){ idle.phase = ''; idle.t = 0; idle.rot = 0; }
  }
}
function startBackflip(){
  idle.phase = 'flip'; idle.rot = 0; idle.land = 0; idle.groundY = player.y + player.h;
  player.vy = -9.6; player.onGround = false; player.standingOn = null; player.noCut = true;
  player.vx = -player.facing * 0.7;
  setFace(anim, 'open', 40);
  SFX.flip();
}
function neckCrack(){
  idle.phase = 'ko'; idle.koT = 0; idle.presses = 0;
  idle.rot = -player.facing * Math.PI;
  player.vx = 0;
  const hx = player.x + player.w / 2, hy = player.y + player.h;
  addShake(9);
  burst(hx, hy - 4, 12, '#ffffff', 2.6, 24, 0.1, 3, 'star');
  dust(hx, hy, 10);
  popup(hx, player.y - 16, 'CRAC !', '#ffffff');
  SFX.crack();
}
// each press of the jump key (or a tap) helps him back up
function idleWake(){
  if(idle.phase !== 'ko' || idle.koT < 30) return;
  idle.presses++;
  anim.wobV += 0.9;
  tone(300 + idle.presses * 170, 0.1, 'triangle', 0.05, 520 + idle.presses * 200);
  const hx = player.x + player.w / 2;
  if(idle.presses < 3){ popup(hx, player.y - 12, `${idle.presses} sur 3`, '#ffe58a'); return; }
  popup(hx, player.y - 12, 'Debout !', '#9dffb0');
  idle.phase = 'up'; idle.upT = 0; idle.groundY = player.y + player.h;
  player.vy = -6.5; player.onGround = false; player.standingOn = null; player.noCut = true;
  anim.faceT = 0; setFace(anim, 'open', 45);
  idle.bandage = 900;
  sparkle(hx, player.y + 4, 10, '#ffffff');
  SFX.power();
}

// thought bubble with a question (world space, above XELIAX)
function drawIdleBubble(){
  if(state !== 'play') return;
  if(idle.phase === 'think'){
    const text = idle.t >= IDLE_FLIP - 130 ? 'Bon… et si je faisais un salto ?' : IDLE_Q[idle.q];
    const pop = easeOutBack(clamp(idle.qT / 14, 0, 1));
    const px = ix(player) + player.w / 2, top = iy(player) - 4;
    ctx.font = `600 11px ${FU}`;
    const lines = wrapLines(text, 150);
    const tw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 24, th = lines.length * 14 + 14;
    const bx = clamp(px + 6, viewX + 6, viewX + W - 6 - tw);
    const by = Math.max(viewY + 44, top - 30 - th);
    ctx.save();
    ctx.globalAlpha = clamp(idle.qT / 8, 0, 1) * 0.97;
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1d1442'; ctx.lineWidth = 1.3;
    for(const [dx, dy, r] of [[2, -4, 2.2], [6, -12, 3.2], [11, -22, 4.2]]){ ctx.beginPath(); ctx.arc(px + dx, top + dy, r, 0, TAU); ctx.fill(); ctx.stroke(); }
    ctx.translate(bx + tw / 2, by + th / 2); ctx.scale(pop, pop); ctx.translate(-(bx + tw / 2), -(by + th / 2));
    // a puffy cloud: rounded box with bumps
    ctx.beginPath();
    rr(bx, by, tw, th, 12);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#1d1442';
    lines.forEach((ln, i) => txt(ln, bx + tw / 2, by + 18 + i * 14, 11, '#1d1442', 600));
    const q = Math.sin(frame * 0.12);
    outlined('?', bx + tw - 4, by - 2 + q * 2, 15, '#ffd54a', '#1d1442', 3, FD, 400, 'center');
    ctx.restore();
  } else if(idle.phase === 'ko'){
    // stars spinning over the poor head, and how to get him up
    const px = ix(player) + player.w / 2, py = iy(player) + player.h;
    for(let i = 0; i < 3; i++){
      const a = frame * 0.12 + i * TAU / 3;
      ctx.fillStyle = i % 2 ? '#ffffff' : '#ffe066'; star(px + Math.cos(a) * 15, py - 36 + Math.sin(a) * 4.5, 3.6, frame * 0.1);
    }
    if(idle.koT > 30){
      const a = clamp((idle.koT - 30) / 12, 0, 1);
      const keyLabel = TOUCH ? '▲' : 'Espace';
      ctx.save(); ctx.globalAlpha = a;
      ctx.font = `700 11px ${FU}`;
      const kw = Math.max(19, ctx.measureText(keyLabel).width + 13);
      ctx.font = `600 11px ${FU}`;
      const label = 'XELIAX est sonné : 3 fois';
      const lw = ctx.measureText(label).width, tw = lw + kw + 16 + 50;
      const bx = clamp(px - tw / 2, viewX + 6, viewX + W - 6 - tw), by = Math.max(viewY + 44, py - 70);
      rr(bx, by, tw, 26, 13); ctx.fillStyle = 'rgba(14,9,34,0.88)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,229,138,0.7)'; ctx.lineWidth = 1.2; ctx.stroke();
      txt(label, bx + 10, by + 17, 11, '#ffffff', 600, 'left');
      keycap(keyLabel, bx + 14 + lw, by + 17);
      for(let i = 0; i < 3; i++){
        ctx.fillStyle = i < idle.presses ? '#ffe58a' : 'rgba(255,255,255,0.25)';
        ctx.beginPath(); ctx.arc(bx + tw - 38 + i * 12, by + 13, 3.6, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
  }
}

// =====================================================================
//  BOSS CINEMATICS: 5 s before a fight starts, 4 s when a boss turns furious.
//  XELIAX can't be hurt meanwhile, the boss doesn't attack, the timer pauses.
// =====================================================================
const BOSS_EPITHET = {
  slime:'Souverain gélatineux des Grottes',
  gecko:'Il colle à toutes les parois',
  yeti:'Rien ne l\'arrête… sauf un mur',
  magpie:'Elle ne rendra pas la ficelle sans se battre',
  swoop:'Sentinelle des remparts',
  arena:'Le voleur de la ficelle aux olives',
  ascent:'Il ne lâchera pas la ficelle aux olives',
};
let cine = null, fightPop = 0;
const seenCine = new Set();

function startCine(kind){
  const id = `${chIndex}-${rIndex}-${kind}`;
  const b = boss;
  cine = {kind, t:0, dur:kind === 'intro' ? 300 : 240, skippable:seenCine.has(id), skip:false, walkTo:null,
          bandY:kind === 'intro' && b && (b.mode === 'slime' || b.mode === 'yeti') ? 150 : 238};
  seenCine.add(id);
  bullets = []; shots = [];
  fightPop = 0;
  if(!b) return;
  player.facing = b.x + b.w / 2 > player.x + player.w / 2 ? 1 : -1;
  if(kind === 'intro'){
    bannerT = 0;
    if(b.mode === 'slime'){ b.y = -150; b.vy = 0; b.onGround = false; b.squash = 0; }
    else if(b.mode === 'swoop'){ b.cx0 = W + 70; b.cy0 = -70; b.tx = b.x; b.x = b.cx0; b.y = b.cy0; b.state = 'hover'; }
    else if(b.mode === 'arena'){ b.appear = 0; }
    else if(b.mode === 'ascent'){ b.y = room.h + 80; }
    else if(b.mode === 'gecko'){ b.side = -1; b.x = geckoWallX(b, -1); b.y = -90; b.state = 'climb'; }
    else if(b.mode === 'yeti'){ b.y = -140; b.vy = 0; b.state = 'walk'; b.face = -1; }
    else if(b.mode === 'magpie'){ b.cx0 = W + 70; b.cy0 = -60; b.tx = b.x; b.x = b.cx0; b.y = b.cy0; b.state = 'hover'; }
  }
  b.px = b.x; b.py = b.y;
}

function updateCine(){
  const c = cine, b = boss;
  c.t++;
  if(c.skippable && !c.skip && c.t > 20 && input.jumpPressed){ c.skip = true; c.dur = Math.min(c.dur, c.t + 18); }
  input.jumpPressed = false;
  if(b && b.alive && c.kind === 'intro'){
    if(b.mode === 'slime'){
      if(!b.onGround){
        if(c.t > 40){
          b.vy += 0.5; b.y += b.vy;
          if(b.y + b.h >= FLOOR){
            b.y = FLOOR - b.h; b.onGround = true; b.vy = 0; b.squash = 0.45;
            addShake(12); dust(b.x + b.w / 2, FLOOR, 20); ring(b.x + b.w / 2, FLOOR - 4, '#ffffff', 6, 80, 26); SFX.thud();
          }
        }
      } else {
        if(c.t === 150){ SFX.bossFlee(); addShake(6); }
        b.squash = c.t > 150 && c.t < 210 ? Math.sin((c.t - 150) * 0.5) * 0.2 * (1 - (c.t - 150) / 60) : b.squash + (0 - b.squash) * 0.12;
      }
    } else if(b.mode === 'swoop'){
      const k = easeInOutCubic(clamp((c.t - 20) / 130, 0, 1));
      b.x = lerp(b.cx0, b.tx, k) - Math.sin(k * Math.PI) * 120;
      b.y = lerp(b.cy0, 55, k) + Math.sin(k * Math.PI) * 90;
      if(c.t === 170){ SFX.warn(); addShake(5); burst(b.x + b.w / 2, b.y + b.h / 2, 14, '#cdd9ff', 3, 40, 0.05, 4, 'puff'); }
      b.cineGlow = c.t > 170 && c.t < 215;
    } else if(b.mode === 'arena'){
      b.appear = clamp((c.t - 30) / 70, 0, 1);
      if(c.t === 30) ring(b.x + b.w / 2, b.y + b.h / 2, '#ff5c9a', 70, 4, 30);
      if(c.t === 150){ SFX.bossFlee(); addShake(6); ring(b.x + b.w / 2, b.y + b.h / 2, '#ff5c9a', 8, 90, 30); }
    } else if(b.mode === 'gecko'){
      // it crawls down the left wall, then hisses
      b.t++;
      b.y = lerp(-90, 150, easeOutCubic(clamp((c.t - 20) / 120, 0, 1)));
      if(c.t === 150){ SFX.bossFlee(); addShake(6); b.fireT = 5; }
      if(c.t > 150 && c.t < 200 && c.t % 10 === 0) burst(b.x + b.w, b.y + b.h / 2, 3, '#9dff5a', 2, 20, 0.1, 3, 'goo');
    } else if(b.mode === 'yeti'){
      b.t++;
      if(b.y < FLOOR - b.h && c.t > 40){
        b.vy += 0.55; b.y += b.vy;
        if(b.y >= FLOOR - b.h){ b.y = FLOOR - b.h; b.vy = 0; addShake(14); dust(b.x + b.w / 2, FLOOR, 22); ring(b.x + b.w / 2, FLOOR - 4, '#ffffff', 6, 90, 26); SFX.thud(); }
      }
      if(c.t === 160){ b.state = 'roar'; SFX.bossFlee(); addShake(8); }
      if(c.t === 230) b.state = 'walk';
    } else if(b.mode === 'magpie'){
      b.t++;
      const k = easeInOutCubic(clamp((c.t - 20) / 130, 0, 1));
      b.x = lerp(b.cx0, b.tx, k) - Math.sin(k * Math.PI) * 140;
      b.y = lerp(b.cy0, 150, k) + Math.sin(k * Math.PI) * 70;
      b.face = -1;
      if(c.t === 165){ SFX.warn(); addShake(5); sparkle(b.x + b.w + 10, b.y + b.h / 2 - 4, 12, '#ffe066'); }
    } else if(b.mode === 'ascent'){
      const k = easeOutCubic(clamp((c.t - 30) / 110, 0, 1));
      b.y = lerp(room.h + 80, 880, k);
      b.x += (W / 2 - b.w / 2 - b.x) * 0.05;
      if(c.t % 4 === 0 && k < 1) burst(b.x + b.w / 2, b.y + b.h, 3, '#ff8a3c', 1.5, 22, 0.05, 3);
      if(c.t === 150){ SFX.bossFlee(); addShake(8); ring(b.x + b.w / 2, b.y + b.h / 2, '#ff5c9a', 8, 90, 30); }
    }
  } else if(b && b.alive){
    // turning furious: the boss shudders and flashes, then the arena changes
    b.hitT = c.t < 120 && c.t % 16 < 8 ? 2 : 0;
    if(b.mode === 'swoop'){ b.x += (b.tx - b.x) * 0.04; b.y += (55 - b.y) * 0.06; b.state = 'hover'; }
    if(b.mode === 'slime') b.squash = c.t < 120 ? Math.sin(c.t * 0.4) * 0.12 : b.squash * 0.85;
    if(c.t === 2){ addShake(8); SFX.bossFlee(); }
    if(c.t === 120){ addShake(10); ring(b.x + b.w / 2, b.y + b.h / 2, '#ff6b6b', 8, 100, 30); burst(b.x + b.w / 2, b.y + b.h / 2, 30, '#ff6b6b', 5, 45); }
    if(c.t === 150 && spikes.some(s => s.pending)) SFX.crumble();
    for(const s of spikes) if(s.pending && c.t >= 150) s.appear = clamp((c.t - 150) / 60, 0, 1);
  }
  // phase 2: XELIAX walks off the strip where the spikes are about to come out
  if(c.kind === 'phase2' && c.walkTo === null){
    const zone = (room.phase2Spikes || [])[0];
    if(zone && player.onGround && player.y + player.h >= FLOOR - 2){
      const pc = player.x + player.w / 2;
      if(pc > zone.x - 16 && pc < zone.x + zone.w + 16) c.walkTo = pc - zone.x < zone.x + zone.w - pc ? zone.x - 26 : zone.x + zone.w + 26;
    }
  }
  if(c.t >= c.dur && player.onGround && c.walkTo === null) finishCine();
}

function finishCine(){
  const b = boss, k = cine ? cine.kind : null;
  cine = null;
  if(b && b.alive){
    b.appear = 1; b.cineGlow = false; b.hitT = 0;
    if(k === 'intro'){
      if(b.mode === 'slime'){ b.y = FLOOR - b.h; b.onGround = true; b.vx = 0; b.vy = 0; b.squash = 0; b.hopT = 50; }
      else if(b.mode === 'swoop'){ b.x = b.tx; b.y = 55; b.state = 'hover'; b.stT = 200; b.fireT = 70; }
      else if(b.mode === 'arena'){ b.fireT = 80; }
      else if(b.mode === 'ascent'){ b.y = 880; b.fireT = 100; }
      else if(b.mode === 'gecko'){ b.y = 150; b.x = geckoWallX(b, -1); b.side = -1; b.state = 'crawl'; b.stT = 130; b.fireT = 50; }
      else if(b.mode === 'yeti'){ b.y = FLOOR - b.h; b.state = 'walk'; b.stT = 150; b.fireT = 70; }
      else if(b.mode === 'magpie'){ b.x = b.tx; b.y = 150; b.state = 'hover'; b.stT = 80; b.fireT = 60; }
    } else {
      b.inv = 30;
      if(b.mode === 'slime'){ b.squash = 0; b.hopT = 40; }
      if(b.mode === 'swoop'){ b.state = 'hover'; b.stT = 140; b.fireT = 50; }
      if(b.mode === 'magpie'){ b.state = 'rise'; }
    }
  }
  for(const s of spikes) if(s.pending) s.pending = false;
  fightPop = 60;
  SFX.power();
  if(k === 'intro' && room.shootUp) showToast('Tes tirs partent vers le haut !', 170);
}

// how far the letterbox bars are in (0 to 1)
function cineBars(){
  if(!cine) return 0;
  return easeOutCubic(clamp(Math.min(cine.t / 18, (cine.dur - cine.t) / 18), 0, 1));
}

