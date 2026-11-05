// =====================================================================
//  STATE
// =====================================================================
let state = 'title', stateT = 0;   // title (every menu page) | play | talk | pet | pause | over | chapter | win | ending
let menuSel = 0;
let chIndex = 0, rIndex = 0, chapter = null, room = null;
let platforms = [], solids = [], enemies = [], bats = [], turrets = [], springs = [], spikes = [];
let fires = [], fireTold = false;     // the owl's bombs set the floor alight for a few seconds
let hitStop = 0;                      // a short freeze on the final blow
let djTake = 0;                       // Gaston takes the double jump away (season 2, gorges): countdown to the message
let checkpoints = [], signs = [], coins = [], powerUps = [];
let boss = null, bullets = [], shots = [], key = null, door = null, checkpoint = null;
let particles = [], popups = [], flyers = [], ambient = [];
let score = 0, lives = startLives(), hasDJ = false, canShoot = false, hasKey = false, hasWall = false, hasDash = false;
let gdir = 1, flips = [];       // gravity: 1 = normal, -1 = upside down; gravity orbs and lines
let elapsed = 0, timerRunning = false, runFromStart = false, continues = 0;
let chStartTime = 0, chCoins = 0, chCoinsTotal = 0, chGem = false, clearInfo = null;
let frame = 0, shake = 0, fade = 0, fadeDir = 0, pendingAction = null;
let bannerT = 0, toast = {text:'', t:0, max:1}, respawnT = 0;
let camX = 0, camY = 0, prevCamX = 0, prevCamY = 0, camFocusY = 0, lookX = 0, viewX = 0, viewY = 0;
let lavaY = 1e9, lavaDelay = 0, phaseT = 0, launch = null;   // launch: the lava throws XELIAX onto a ledge (final escape)
let collected = new Set();
let exitT = 0, exitKind = null, finaleT = 0;
let steal = null;                     // end of season 1: the magpie that snatches the ficelle
let ALPHA = 1, fxTick = true, lastRenderFrame = -1;
const hud = { coinBump:0, lastLives:startLives(), lostT:0, lostIdx:-1, gainT:0, gainIdx:-1, flash:0, coinX:120, coinY:20, bossShown:1, bossTrail:1 };

const player = {
  x:0, y:0, w:22, h:28, vx:0, vy:0, facing:1,
  onGround:false, standingOn:null, coyote:0, buffer:0, noCut:false,
  usedDJ:false, invuln:0, hurtT:0, sx:1, sy:1, shotCD:0, dead:false,
  wallSide:0, wallT:0, wallLock:0, sliding:false, dashT:0, dashDir:1, dashReady:true, dashCD:0, ghosts:[],
};
const input = { left:false, right:false, jumpHeld:false, jumpPressed:false, shootPressed:false, dashPressed:false };

const decoOf = () => room.deco || chapter.deco;
const theme = () => THEMES[decoOf()] || THEMES.hills;
function setState(s){ state = s; stateT = 0; }

// =====================================================================
//  HERO ANIMATION
//  The hero is the player's own drawing: an indigo bean with googly eyes,
//  a wide grin and four wobbly tentacle limbs. Everything here is driven
//  by small springs so it reacts to running, jumping and landing.
// =====================================================================
function makeLimb(a, c, amp){ return {a, c, amp, ph:Math.random() * 6}; }
function makeCharAnim(){
  return {
    t:0, fx:1, lean:0, bob:0, breath:0, wob:0, wobV:0, spin:0, sx:1, sy:1,
    legPhase:0, idleT:0, look:{x:0.4, y:0, t:0},
    eyes:[{x:0.4, y:-0.35, vx:0, vy:0, k:0.075, d:0.8}, {x:0.3, y:0.35, vx:0, vy:0, k:0.05, d:0.85}],
    blinkP:0, blinkT:80,
    arms:[makeLimb(0.5, -1.7, 0.22), makeLimb(-0.2, 0.9, 0.32)],
    legs:[makeLimb(-0.12, 0.55, 0.08), makeLimb(0.1, -0.6, 0.08)],
    face:'smile', faceT:0, curFace:'smile',
    shootT:0, appear:1, exit:0, hop:0, pvx:0, pvy:0,
  };
}
const anim = makeCharAnim(), titleHero = makeCharAnim(), uiHero = makeCharAnim();

function setFace(a, f, t){ a.face = f; a.faceT = t; }
function blendLimb(l, t){
  l.a += (t.a - l.a) * 0.22;
  l.c += (t.c - l.c) * 0.2;
  l.amp += (t.amp - l.amp) * 0.15;
  l.ph += t.spd;
}

function stepCharAnim(a, s){
  a.t++;
  const facing = s.facing || 1;
  a.fx += (facing - a.fx) * 0.32;
  const running = s.onGround && Math.abs(s.vx) > 0.4;
  const leanT = s.dash ? clamp(s.vx * 0.04, -0.32, 0.32) : s.onGround ? clamp(s.vx * 0.04, -0.15, 0.15) : clamp(s.vx * 0.025, -0.1, 0.1);
  a.lean += ((REDUCED ? leanT * 0.5 : leanT) - a.lean) * 0.2;
  if(running) a.legPhase += Math.abs(s.vx) * 0.17;
  a.bob += ((running ? Math.abs(Math.sin(a.legPhase)) * 1.6 : 0) - a.bob) * 0.4;
  a.breath = Math.sin(a.t * 0.06);
  a.wobV += -a.wob * 0.22; a.wobV *= 0.84; a.wob += a.wobV;
  if(a.spin > 0){ a.spin += 1 / 22; if(a.spin >= 1) a.spin = 0; }
  if(a.shootT > 0) a.shootT--;
  if(a.faceT > 0) a.faceT--;
  if(a.appear < 1) a.appear = Math.min(1, a.appear + 1 / 20);
  if(a.hop > 0) a.hop = Math.max(0, a.hop - 0.05);

  let face = a.faceT > 0 ? a.face : 'smile';
  if(s.ko) face = 'ko';
  else if(a.faceT <= 0){
    if(s.sad) face = 'sad';
    else if(s.hurt) face = 'hurt';
    else if(s.cheer) face = 'open';
    else if(!s.onGround && s.vy < -3) face = 'open';
    else if(!s.onGround && s.vy > 7.5) face = 'o';
  }
  a.curFace = face;

  // googly eyes: pupils swing with inertia, then drift back to where the hero looks
  const still = s.onGround && Math.abs(s.vx) < 0.2 && !s.cheer;
  a.idleT = still ? a.idleT + 1 : 0;
  if(a.idleT > 150 && --a.look.t <= 0){
    a.look.t = 50 + Math.random() * 100;
    const ang = Math.random() * TAU, r = 0.35 + Math.random() * 0.55;
    a.look.x = Math.cos(ang) * r; a.look.y = Math.sin(ang) * r;
  }
  const ax = (s.vx - a.pvx) * facing, ay = s.vy - a.pvy;
  a.pvx = s.vx; a.pvy = s.vy;
  for(let i = 0; i < 2; i++){
    const e = a.eyes[i];
    let tx = 0.42, ty = 0;
    if(s.look){ tx = s.look.x; ty = s.look.y; }
    else if(a.idleT > 150){ tx = a.look.x; ty = a.look.y; }
    tx += i ? -0.12 : 0.02;
    ty += i ? 0.36 : -0.36;                    // one eye up, one eye down, as in the drawing
    ty += clamp(s.vy * 0.07, -0.45, 0.5);
    if(s.sad) ty = 0.75;
    if(s.sleep) ty = 0.55;
    if(s.think){ tx = -0.55 + Math.sin(a.t * 0.02) * 0.2; ty = -0.85; }
    if(s.shooting){ tx = s.up ? 0.05 : 0.85; ty = s.up ? -0.85 : 0.05; }
    e.vx += -ax * 0.1 + (tx - e.x) * e.k;
    e.vy += -ay * 0.06 + (ty - e.y) * e.k + 0.012;
    e.vx *= e.d; e.vy *= e.d;
    e.x += e.vx; e.y += e.vy;
    const d = Math.hypot(e.x, e.y);
    if(d > 1){
      e.x /= d; e.y /= d;
      const dot = e.vx * e.x + e.vy * e.y;
      if(dot > 0){ e.vx -= 1.5 * dot * e.x; e.vy -= 1.5 * dot * e.y; }
    }
  }
  if(a.blinkP > 0){ a.blinkP += 1 / 9; if(a.blinkP >= 1.2) a.blinkP = 0; }
  else if(--a.blinkT <= 0){ a.blinkP = 0.001; a.blinkT = 110 + Math.random() * 220; }

  // tentacle poses: angles (a), curl along the length (c), wave amplitude and speed
  const lp = a.legPhase, t = a.t;
  let A0, A1, L0, L1;
  if(s.cheer){
    A0 = {a:-1.25 + Math.sin(t * 0.3) * 0.35, c:0.6, amp:0.3, spd:0.3};
    A1 = {a:-1.3 - Math.sin(t * 0.3) * 0.35, c:0.6, amp:0.3, spd:0.3};
    L0 = {a:-0.3, c:0.9, amp:0.2, spd:0.2}; L1 = {a:0.2, c:-0.7, amp:0.2, spd:0.2};
  } else if(s.sad){
    A0 = {a:1.2, c:0.25, amp:0.1, spd:0.04}; A1 = {a:1.15, c:0.25, amp:0.1, spd:0.04};
    L0 = {a:-0.1, c:0.4, amp:0.05, spd:0.03}; L1 = {a:0.1, c:-0.4, amp:0.05, spd:0.03};
  } else if(s.onGround){
    if(running){
      const k = Math.min(1, Math.abs(s.vx) / RUN);
      A0 = {a:-0.45 + Math.sin(lp) * 0.45 * k, c:-0.5, amp:0.22, spd:0.25};
      A1 = {a:0.35 - Math.sin(lp) * 0.45 * k, c:0.6, amp:0.22, spd:0.25};
      L0 = {a:Math.sin(lp) * 0.8 * k, c:0.45 + Math.max(0, Math.cos(lp)) * 0.7, amp:0.12, spd:0.2};
      L1 = {a:-Math.sin(lp) * 0.8 * k, c:0.45 + Math.max(0, -Math.cos(lp)) * 0.7, amp:0.12, spd:0.2};
    } else {
      A0 = {a:0.5, c:-1.7, amp:0.22, spd:0.06};
      A1 = {a:-0.2, c:0.9, amp:0.32, spd:0.07};
      L0 = {a:-0.18, c:0.5, amp:0.3, spd:0.045};    // wavy S-shaped legs, like the drawing
      L1 = {a:0.14, c:-0.55, amp:0.3, spd:0.05};
    }
  } else if(s.vy < 0){
    A0 = {a:-1.05, c:0.7, amp:0.35, spd:0.3}; A1 = {a:-1.15, c:0.7, amp:0.35, spd:0.3};
    L0 = {a:-0.45, c:1.0, amp:0.2, spd:0.25}; L1 = {a:-0.3, c:0.9, amp:0.2, spd:0.25};
  } else {
    const fl = Math.sin(t * 0.45) * 0.35;
    A0 = {a:-0.85 + fl, c:0.4, amp:0.55, spd:0.45}; A1 = {a:-0.95 - fl, c:0.4, amp:0.55, spd:0.45};
    L0 = {a:-0.2, c:0.4, amp:0.35, spd:0.3}; L1 = {a:0.05, c:0.3, amp:0.35, spd:0.3};
  }
  if(s.hurt){ A0 = {a:-0.3, c:0, amp:0.8, spd:0.6}; A1 = {a:-0.3, c:0, amp:0.8, spd:0.6}; }
  if(s.sleep){
    A0 = {a:1.15, c:0.3, amp:0.05, spd:0.02}; A1 = {a:1.1, c:-0.3, amp:0.05, spd:0.02};
    L0 = {a:-0.25, c:0.6, amp:0.06, spd:0.02}; L1 = {a:0.2, c:-0.6, amp:0.06, spd:0.02};
  }
  if(s.stretch){ A0 = {a:-1.5, c:0.15, amp:0.04, spd:0.05}; A1 = {a:-1.55, c:-0.15, amp:0.04, spd:0.05}; }
  if(s.think) A1 = {a:-2.05 + Math.sin(t * 0.45) * 0.12, c:1.5, amp:0.1, spd:0.35};        // scratching his head
  if(s.akimbo){ A0 = {a:0.9, c:-2.4, amp:0.03, spd:0.04}; A1 = {a:0.9, c:-2.4, amp:0.03, spd:0.04}; }
  if(s.wall){
    // stuck to the wall with both tentacles, legs bracing against it
    A0 = {a:-1.15, c:0.9, amp:0.05, spd:0.08}; A1 = {a:-0.55, c:-0.5, amp:0.05, spd:0.09};
    L0 = {a:-0.55, c:0.3, amp:0.08, spd:0.1}; L1 = {a:-0.75, c:0.2, amp:0.08, spd:0.1};
  }
  if(s.dash){
    // streamlined: tentacles swept back
    A0 = {a:0.15, c:0.1, amp:0.12, spd:0.5}; A1 = {a:2.75, c:-0.1, amp:0.12, spd:0.5};
    L0 = {a:1.05, c:0.2, amp:0.15, spd:0.5}; L1 = {a:1.25, c:0.1, amp:0.15, spd:0.5};
  }
  if(s.phone) A1 = {a:-1.3, c:1.85, amp:0.03, spd:0.06};
  if(s.ko){
    A0 = {a:0.2, c:0.5, amp:0.25, spd:0.08}; A1 = {a:0.4, c:-0.5, amp:0.25, spd:0.09};
    L0 = {a:-0.5, c:1.2, amp:0.55, spd:0.22}; L1 = {a:0.5, c:-1.2, amp:0.55, spd:0.25};
  }
  if(s.shooting) A1 = s.up ? {a:-Math.PI / 2 + 0.05, c:0, amp:0.04, spd:0.1} : {a:-0.05, c:0, amp:0.04, spd:0.1};
  if(s.wave) A1 = {a:-1.3 + Math.sin(t * 0.28) * 0.5, c:0.5, amp:0.2, spd:0.15};
  blendLimb(a.arms[0], A0); blendLimb(a.arms[1], A1);
  blendLimb(a.legs[0], L0); blendLimb(a.legs[1], L1);
}

function stepHero(){
  stepCharAnim(anim, {
    vx:player.vx, vy:player.vy * gdir, onGround:player.onGround, facing:player.facing,
    hurt:player.hurtT > 0, shooting:anim.shootT > 0, up:!!(room && room.shootUp),
    think:idle.phase === 'think', ko:idle.phase === 'ko', wall:player.sliding, dash:player.dashT > 0,
  });
  anim.sx = player.sx; anim.sy = player.sy;
  anim.gv = (anim.gv === undefined ? 1 : anim.gv) + (gdir - (anim.gv === undefined ? 1 : anim.gv)) * 0.28;
}

// =====================================================================
//  LOADING
// =====================================================================
function loadRoom(ci, ri){
  chIndex = ci; rIndex = ri;
  if(ri > 0 && CHAPTERS[ci].bonus && state === 'play' && timerRunning) srSplit();   // speedrun: a split at each new room
  chapter = CHAPTERS[ci];
  room = chapter.rooms[ri];
  room.w = room.width || W;
  room.h = room.height || H;
  // season 2: in the first rooms of the gorges Gaston keeps the double jump (he gives it back in La Faille)
  let djScene = false;
  if(room.noDJ){ if(hasDJ){ if(room.djSteal) djScene = true; else djTake = 100; } if(!djScene) hasDJ = false; }

  platforms = room.platforms.map((p, i) => ({
    ...p, h: p.h || (p.fall ? 16 : 14), dx:0, dy:0, cT:0, gone:false, rT:0, appear:1, ox:p.x, oy:p.y, fT:0, fvy:0, loose:!!p.free,
    seed: (ci * 1000 + ri * 100 + i) * 7919,
    move: p.move ? {...p.move, dir:1} : null,
  }));
  (room.walls || []).forEach((w, k) => platforms.push({x:w.x, y:w.y, w:w.w, h:w.h, solid:true, dx:0, dy:0, cT:0, gone:false, rT:0, appear:1,
    seed:(ci * 1000 + ri * 100 + 60 + k) * 7919, move:null, gate:!!w.hp, hp:w.hp || 0, maxHp:w.hp || 0, flash:0, glass:!!w.glass, slick:!!w.slick, ice:!!w.ice}));
  // gravity orbs (a point) and gravity lines (a band); 'set' forces a direction instead of toggling
  flips = (room.flips || []).map(f => f.w ? {...f, armed:true, t:0, line:true} : {...f, cx:f.x, cy:f.y, x:f.x - 12, y:f.y - 12, w:24, h:24, armed:true, t:0, line:false});
  solids = platforms.filter(p => p.solid);
  enemies = (room.enemies || []).map(e => ({...e, off:e.from, dir:1, w:24, h:18, x:0, y:0, alive:true, t:Math.random()*6}));
  bats = (room.bats || []).map(b => ({...b, x0:b.x, y0:b.y, t:Math.random()*6, w:24, h:16, alive:true, face:1}));
  turrets = (room.turrets || []).map(t => ({...t, w:24, h:24, t:Math.floor(Math.random()*t.rate), hp:t.hp || 3, maxHp:t.hp || 3, alive:true, flash:0}));
  springs = (room.springs || []).map(s => ({x:s.x, y:s.y - 10, w:20, h:10, base:s.y, t:0, anim:0}));
  spikes = (room.spikes || []).map(s => ({...s}));
  fires = []; fireTold = false;
  checkpoints = (room.checkpoints || []).map(c => ({x:c.x, y:c.y, active:false, raise:0, ceil:!!c.ceil}));
  signs = (room.signs || []).map(s => ({...s, show:0}));
  npcs = (room.npcs || []).map(n => ({...n, t:Math.random() * 6, blink:0, near:0}));
  nearNpc = null; talk = null; cine = null; fightPop = 0;
  // already-collected coins / power-ups stay collected when a room is reloaded after a game over
  coins = (room.coins || []).map(([x, y], i) => ({x, y, id:`c${ci}-${ri}-${i}`, got:collected.has(`c${ci}-${ri}-${i}`), t:Math.random()*6}));
  powerUps = (room.powerUps || [])
    .map((p, i) => ({...p, id:`p${ci}-${ri}-${i}`, w:20, h:20, got:false}))
    .filter(p => !collected.has(p.id))
    .filter(p => !(p.type === 'doubleJump' && hasDJ) && !(p.type === 'shoot' && canShoot) && !(p.type === 'gem' && chGem) && !(p.type === 'wall' && hasWall) && !(p.type === 'dash' && hasDash));
  door = room.door ? {...room.door, w:26, h:40, shake:0, glow:0} : null;
  boss = room.boss ? makeBoss(room.boss) : null;
  bullets = []; shots = []; key = null; hasKey = false;
  if(room.keyAt) key = {x:room.keyAt.x - 17, y:room.keyAt.y - 8, w:34, h:16, got:false, kind:'key'};
  if(room.finale && !room.boss) key = {x:room.keySpot.x - 17, y:room.keySpot.y - 8, w:34, h:16, got:false, kind:'ficelle', gold:room.gold || false};
  idleReset();
  if(room.armed) canShoot = true;
  lavaY = room.lava ? room.lava.start : 1e9; launch = null;
  lavaDelay = room.lava ? room.lava.delay : 0;
  phaseT = 0;
  gdir = room.startG || 1;
  checkpoint = {x:room.start.x, y:room.start.y, g:gdir};
  particles = []; popups = [];
  exitT = 0; exitKind = null; anim.exit = 0; finaleT = 0; steal = null;
  hud.bossShown = hud.bossTrail = 1;
  makeAmbient();

  resetPlayer();
  snapCamera();
  bannerT = ri === 0 ? 240 : 150;
  if(room.shootUp && !room.boss) showToast('Tes tirs partent vers le haut !', 170);
  if(boss) startCine('intro');   // every boss makes an entrance before the fight starts
  if(boss && state === 'play') maybeBossDemo(false);   // the first time: how to beat it
  if(djScene){ bannerT = 0; startCine('dj'); }    // the magpie snatches the double jump and drops it into the gorge
}

function makeBoss(def){
  const b = {...def, maxHp:def.hp, hitT:0, inv:0, alive:true, fleeing:false, vx:1.8, vy:1.4, phase:1};
  b.enrage = (def.mode === 'slime' || def.mode === 'swoop') ? 1 : def.mode === 'arena' ? 2 : Math.round(def.hp * 0.35);
  if(def.mode === 'arena') b.fireT = 90;
  if(def.mode === 'ascent') b.fireT = 160;
  if(def.mode === 'slime'){ b.y = FLOOR - b.h; b.onGround = true; b.hopT = 90; b.hops = 0; b.squash = 0; b.vx = 0; b.vy = 0; }
  if(def.mode === 'swoop'){ b.state = 'hover'; b.stT = 200; b.fireT = 80; b.vy = 0; }
  if(S2_BOSS.has(def.mode)){ b.enrage = 2; setupS2Boss(b); }
  return b;
}

function resetPlayer(){
  gdir = checkpoint.g || 1;
  Object.assign(player, {
    x:checkpoint.x, y:checkpoint.y, vx:0, vy:0, onGround:false, standingOn:null,
    coyote:0, buffer:0, usedDJ:false, sx:1, sy:1, dead:false, noCut:false, hurtT:0, held:false, slam:false,
    wallSide:0, wallT:0, wallLock:0, sliding:false, dashT:0, dashReady:true, dashCD:0, dashBuf:0, ghosts:[],
  });
  for(const o of flips){ o.armed = !overlap(player, o); }
  for(const p of platforms) if(p.fall){ p.x = p.ox; p.y = p.oy; p.fT = 0; p.fvy = 0; p.loose = !!p.free; p.landT = 0; p.gone = false; p.appear = 0; p.px = p.x; p.py = p.y; }
  anim.gv = gdir;
  player.px = player.x; player.py = player.y;
  anim.pvx = 0; anim.pvy = 0; anim.spin = 0;
}

function startChapter(ci, advancing){
  const g = CHAPTERS[ci].grants || {};
  hasDJ = advancing ? (hasDJ || !!g.dj) : !!g.dj;
  canShoot = !!g.shoot;
  hasWall = advancing ? (hasWall || !!g.wall) : !!g.wall;
  hasDash = advancing ? (hasDash || !!g.dash) : !!g.dash;
  lives = advancing ? Math.max(lives, startLives()) : startLives();
  chStartTime = elapsed; chCoins = 0; chGem = false;
  if(CHAPTERS[ci].bonus){ srReset(); lives = 99; }
  collected = new Set();
  chCoinsTotal = CHAPTERS[ci].rooms.reduce((a, r) => a + (r.coins || []).length, 0);
  loadRoom(ci, 0);
}

function newRun(ci){
  save.seen[ci] = true;
  score = 0; elapsed = 0; timerRunning = false; continues = 0;
  runFromStart = ci === 0 || ci === S2_FIRST;
  save.lastSeason = seasonOf(ci);
  if(seasonOf(ci) === 2 && !save.s2Seen) save.s2Seen = true;
  persist();
  particles = [];
  hasDJ = false; hasWall = false; hasDash = false; lives = startLives(); hud.lastLives = lives;
  startChapter(ci, false);
  setState('play');
  fade = 1; fadeDir = -1;
}

function transition(fn){ if(fadeDir > 0) return; pendingAction = fn; fadeDir = 1; }

function toMenu(){
  setState('title');
  timerRunning = false;
  const c = CHAPTERS[chIndex];
  if(c && c.bonus){ menu.page = 'bonus'; menu.sel.bonus = Math.max(0, BONUS_CH.indexOf(chIndex)); menuSel = defaultChapter(); }
  else { refreshMainCh(); menu.page = 'chapters'; menuSel = c && isUnlocked(chIndex) && MAIN_CH.includes(chIndex) ? chIndex : defaultChapter(); }
  menu.from = null; menu.t = 1; menu.drag = null; menu.down = null; menu.splash = null;
  loadRoom(menuSel, 0);
  menu.scroll = appPos(appIndex(menuSel));
  if(clearInfo && clearInfo.bonusNew){ clearInfo.bonusNew = false; showToast('Psst… un bonus secret t\'attend dans les Paramètres !', 220); }
  fade = 1; fadeDir = -1;
}

function chapterClear(){
  const t = elapsed - chStartTime;
  const prev = save.bestCh[chIndex];
  clearInfo = {time:t, coins:chCoins, total:chCoinsTotal, gem:chGem, newBest: prev == null || t < prev, bonus:!!chapter.bonus};
  if(clearInfo.newBest) save.bestCh[chIndex] = t;
  if(chGem && !chapter.bonus) save.gems[chIndex] = true;
  if(chapter.bonus){
    timerRunning = false;
    srFinish(t);
    clearInfo.fast = !chapter.parTime || t <= chapter.parTime;
    if(clearInfo.fast){ if(chapter.bonus2) save.crystalFicelle = true; else save.goldFicelle = true; }
    clearInfo.bonus2 = !!chapter.bonus2;
    score += 500;
    setState('chapter');
    SFX.win();
    persist();
    return;
  }
  const s2 = chapter.season === 2;
  if(chIndex === STORY_END) clearInfo.bonusNew = prev == null;
  if(s2) save.unlocked2 = Math.max(save.unlocked2, Math.min(4, chapter.num + 1));
  else save.unlocked = Math.max(save.unlocked, Math.min(STORY_END + 2, chIndex + 2));
  if(chIndex === STORY_END || chIndex === S2_END){
    timerRunning = false;
    score += 500;
    clearInfo.season = s2 ? 2 : 1;
    if(runFromStart){
      const rk = s2 ? 'bestRun2' : 'bestRun';
      clearInfo.runBest = save[rk] == null || elapsed < save[rk];
      if(clearInfo.runBest) save[rk] = elapsed;
    }
    if(s2){ clearInfo.bonusNew = !save.s2Done; save.s2Done = true; }
    setState('win');
  } else {
    score += 250;
    setState('chapter');
  }
  SFX.win();
  persist();
}

