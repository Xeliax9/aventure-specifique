// Route checker for season 2: a frame-accurate copy of the player physics with gravity orbs/lines,
// upside-down floors, wall slide / wall jump, dash, ice walls (dash-breakable), slick walls, ice floors.
// Nodes = places where XELIAX can stop (standing on a surface, either gravity) or cling (sliding on a wall).
// usage: node route2.js chapters.js [roomTag] [--gates] [--verbose]
const fs = require('fs');
const NOLONE = !!process.env.NOLONE;   // forbid climbing a single wall (jump away, come back to the same face)
const C = {G:0.55, MAXF:12, JV:-10.6, DJV:-9.2, SV:-15, RUN:3.6, AG:0.35, AA:0.2, COY:6, BUF:7, PW:22, PH:28,
  WALL_SLIDE:2.2, WJ_VX:4.8, WJ_VY:-9.9, WALL_LOCK:11, WALL_COY:6, DASH_V:8.6, DASH_T:11, DASH_CD:18, ICE:0.06};
const ov = (ax, ay, aw, ah, b) => ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y;

// ---------------------------------------------------------------- geometry with a spatial grid
const CELL = 128;
function buildGeo(room, abil, removed = new Set()){
  const W = room.width || 640, H = room.height || 360;
  const plats = [];
  room.platforms.forEach((p, i) => {
    if(removed.has(i)) return;
    const h = p.h || 14;
    if(p.move){
      for(let k = 0; k < 3; k++){
        const v = p.move.min + (p.move.max - p.move.min) * k / 2;
        plats.push({id:i, x:p.move.axis === 'x' ? v : p.x, y:p.move.axis === 'y' ? v : p.y, w:p.w, h, solid:false, ice:!!p.ice});
      }
    } else plats.push({id:i, x:p.x, y:p.y, w:p.w, h, solid:!!p.solid, ice:!!p.ice, slick:!!p.slick, crumble:!!p.crumble});
  });
  (room.walls || []).forEach((w, k) => {
    if(removed.has('w' + k)) return;
    if(w.hp) return;                       // wooden gates get shot down
    plats.push({id:'w' + k, x:w.x, y:w.y, w:w.w, h:w.h, solid:true, glass:!!w.glass, slick:!!w.slick, ice:!!w.ice});
  });
  const hz = [];
  for(const s of (room.spikes || [])){
    if(s.side) hz.push({x:s.side === 'left' ? s.x - 8 : s.x, y:s.y + 3, w:8, h:s.h - 6});
    else if(s.lava) hz.push({x:s.x, y:s.y - 8, w:s.w, h:30});
    else if(s.down) hz.push({x:s.x + 3, y:s.y, w:s.w - 6, h:8});
    else hz.push({x:s.x + 3, y:s.y - 8, w:s.w - 6, h:8});
  }
  const springs = (room.springs || []).map(s => ({x:s.x, y:s.y - 10, w:20, h:10}));
  const orbs = (room.flips || []).map((f, i) => ({f, i})).filter(o => !removed.has('f' + o.i)).map(({f, i}) => f.w ? {i, x:f.x, y:f.y, w:f.w, h:f.h, set:f.set || 0} : {i, x:f.x - 12, y:f.y - 12, w:24, h:24, set:f.set || 0});
  const boxes = {};
  if(room.door) boxes.door = {x:room.door.x, y:room.door.y, w:26, h:40};
  if(room.keyAt) boxes.key = {x:room.keyAt.x - 17, y:room.keyAt.y - 8, w:34, h:16};
  if(room.keySpot && room.finale) boxes.goal = {x:room.keySpot.x - 17, y:room.keySpot.y - 8, w:34, h:16};
  const gem = (room.powerUps || []).find(p => p.type === 'gem');
  if(gem) boxes.gem = {x:gem.x, y:gem.y, w:20, h:20};
  const geo = {W, H, plats, walls:plats.filter(p => p.solid), hz, springs, orbs, boxes, abil, grid:new Map()};
  const add = (kind, o) => {
    const x0 = Math.floor((o.x - 40) / CELL), x1 = Math.floor((o.x + o.w + 40) / CELL);
    const y0 = Math.floor((o.y - 40) / CELL), y1 = Math.floor((o.y + o.h + 40) / CELL);
    for(let cx = x0; cx <= x1; cx++) for(let cy = y0; cy <= y1; cy++){
      const k = cx * 10007 + cy;
      let c = geo.grid.get(k);
      if(!c){ c = {plats:[], walls:[], hz:[], springs:[], orbs:[]}; geo.grid.set(k, c); }
      c[kind].push(o);
    }
  };
  plats.forEach(p => add('plats', p)); geo.walls.forEach(w => add('walls', w)); hz.forEach(h => add('hz', h));
  springs.forEach(s => add('springs', s)); orbs.forEach(o => add('orbs', o));
  geo.empty = {plats:[], walls:[], hz:[], springs:[], orbs:[]};
  return geo;
}
const cellAt = (geo, x, y) => geo.grid.get(Math.floor((x + 11) / CELL) * 10007 + Math.floor((y + 14) / CELL)) || geo.empty;

// ---------------------------------------------------------------- one frame of player physics (mirrors updatePlayer)
function frameStep(geo, s, dir, pressed, held, dashPress, broken){
  const A = geo.abil, G = s.g;
  if(dir && s.dashT <= 0) s.facing = dir;
  let accel = s.onGround ? (s.ice ? C.ICE : C.AG) : C.AA;
  if(s.wallLock > 0){ s.wallLock--; accel = s.wallLock > 3 ? 0 : C.AA * 0.4; }
  if(s.dashT > 0){
    s.dashT--; s.vx = s.dashDir * C.DASH_V; s.vy = 0;
    if(s.dashT === 0) s.vx = s.dashDir * C.RUN * 1.1;
  } else { s.vx += (dir * C.RUN - s.vx) * accel; if(Math.abs(s.vx) < 0.05) s.vx = 0; }
  if(s.dashCD > 0) s.dashCD--;
  // dash, with the same 6-frame buffer as the game (a press while cooling down fires as soon as it can)
  if(dashPress && A.dash) s.dashBuf = 6;
  if(s.dashBuf > 0){
    s.dashBuf--;
    if(A.dash && s.dashT <= 0 && s.dashReady && s.dashCD <= 0){
      s.dashBuf = 0;
      const d = dir || s.facing;
      s.dashT = C.DASH_T; s.dashDir = d; s.dashCD = C.DASH_CD; s.facing = d;
      if(!s.onGround) s.dashReady = false;
      s.vy = 0; s.noCut = true; s.wallLock = 0; s.dashes++;
    }
  }
  const doJump = () => { s.vy = C.JV * G; s.coyote = 0; s.buffer = 0; s.dashT = 0; s.onGround = false; s.noCut = false; s.jumps++; };
  const wallJump = () => { const sd = s.wallSide; if(NOLONE){ s.banWall = s.curWall; s.banSide = sd; s.banX = s.curWall ? (sd > 0 ? s.curWall.x : s.curWall.x + s.curWall.w) : null; } s.vx = -sd * C.WJ_VX; s.vy = C.WJ_VY * G; s.wallLock = C.WALL_LOCK; s.wallT = 0; s.sliding = false;
    s.usedDJ = false; s.dashReady = true; s.noCut = false; s.dashT = 0; s.facing = -sd; s.buffer = 0; s.coyote = 0; s.wjumps++; };
  if(pressed){
    if(s.coyote > 0) doJump();
    else if(A.wall && s.wallT > 0) wallJump();
    else if(A.dj && !s.usedDJ){ s.vy = (C.DJV + Math.min(0, s.vy * G) * 0.3) * G; s.usedDJ = true; s.noCut = true; s.dashT = 0; s.djs++; }
    else s.buffer = C.BUF;
  }
  if(s.buffer > 0){ s.buffer--; if(s.onGround) doJump(); else if(A.wall && s.sliding) wallJump(); }
  if(s.dashT <= 0){
    let g = C.G;
    const rise = s.vy * G;
    if(rise >= 0) s.noCut = false;
    if(rise < 0 && !held && !s.noCut) g *= 2.2;
    else if(held && Math.abs(s.vy) < 1.3 && !s.onGround) g *= 0.65;
    s.vy += g * G;
    if(s.vy * G > C.MAXF) s.vy = C.MAXF * G;
    if(s.sliding && s.vy * G > C.WALL_SLIDE) s.vy = C.WALL_SLIDE * G;
  }
  const prevBottom = s.y + C.PH, prevTop = s.y, prevX = s.x;
  s.x += s.vx;
  if(s.x < 0) s.x = 0; if(s.x > geo.W - C.PW) s.x = geo.W - C.PW;
  let cell = cellAt(geo, s.x, s.y);
  for(const w of cell.walls){
    if(broken.has(w) || !ov(s.x, s.y, C.PW, C.PH, w)) continue;
    if(w.glass && s.dashT > 0){ broken.add(w); s.broke++; continue; }
    if(prevX + C.PW <= w.x + 0.5) s.x = w.x - C.PW; else if(prevX >= w.x + w.w - 0.5) s.x = w.x + w.w;
    s.vx = 0;
    if(s.dashT > 0) s.dashT = 0;
  }
  s.y += s.vy;
  cell = cellAt(geo, s.x, s.y);
  for(const w of cell.walls){
    if(broken.has(w) || !ov(s.x, s.y, C.PW, C.PH, w)) continue;
    if(G > 0 && s.vy < 0 && prevTop >= w.y + w.h - 0.5){ s.y = w.y + w.h; s.vy = 0; }
    else if(G < 0 && s.vy > 0 && prevBottom <= w.y + 0.5){ s.y = w.y - C.PH; s.vy = 0; }
  }
  if(s.vy > 0 && G > 0) for(const sp of cell.springs){
    if(s.x + C.PW > sp.x && s.x < sp.x + sp.w && prevBottom <= sp.y + 4 && s.y + C.PH >= sp.y){
      s.y = sp.y - C.PH; s.vy = C.SV; s.noCut = true; s.usedDJ = false; s.dashReady = true; s.dashT = 0; s.left = true; break;
    }
  }
  s.onGround = false; s.land = null; s.ice = false;
  if(G > 0 && s.vy >= 0){
    for(const p of cell.plats){
      if(broken.has(p)) continue;
      if(s.x + C.PW > p.x + 2 && s.x < p.x + p.w - 2 && prevBottom <= p.y + 1 && s.y + C.PH >= p.y){ s.y = p.y - C.PH; s.vy = 0; s.onGround = true; s.land = p; s.usedDJ = false; s.ice = p.ice; }
    }
  } else if(G < 0 && s.vy <= 0){
    for(const p of cell.plats){
      if(broken.has(p)) continue;
      const pb = p.y + p.h;
      if(s.x + C.PW > p.x + 2 && s.x < p.x + p.w - 2 && prevTop >= pb - 1 && s.y <= pb){ s.y = pb; s.vy = 0; s.onGround = true; s.land = p; s.usedDJ = false; s.ice = p.ice; }
    }
  }
  if(s.onGround){ s.dashReady = true; s.wallT = 0; s.banWall = null; s.banX = null; s.banSide = 0; }
  s.coyote = s.onGround ? C.COY : Math.max(0, s.coyote - 1);
  s.sliding = false; s.wallObj = null;
  if(A.wall && !s.onGround && s.dashT <= 0){
    const touch = sd => { const px = sd > 0 ? s.x + C.PW : s.x - 2, py = s.y + 6, pw = 2, ph = C.PH - 12;
      for(const w of cell.walls){ if(!broken.has(w) && !w.slick && !w.glass && ov(px, py, pw, ph, w) && !(NOLONE && s.banSide && sd === s.banSide)) return w; } return null; };
    const R = touch(1), L = touch(-1);
    const side = dir && (dir > 0 ? R : L) ? dir : R ? 1 : L ? -1 : 0;
    if(side){
      s.curWall = side > 0 ? R : L;
      s.wallSide = side; s.wallT = C.WALL_COY;
      if(dir === side && s.vy * G > 0){ s.sliding = true; s.dashReady = true; s.wallObj = side > 0 ? R : L; }
    } else if(s.wallT > 0) s.wallT--;
  } else if(s.wallT > 0) s.wallT--;
  for(const o of cell.orbs){
    const hit = ov(s.x, s.y, C.PW, C.PH, o);
    if(hit && !s.disarmed.has(o.i)){
      s.disarmed.add(o.i);
      const want = o.set || -s.g;
      if(want !== s.g){ s.g = want; s.vy = want * 1.5; s.onGround = false; s.coyote = 0; s.buffer = 0; s.usedDJ = false; s.dashReady = true; s.noCut = true; s.sliding = false; s.wallT = 0; s.flipped = true; }
    } else if(!hit) s.disarmed.delete(o.i);
  }
}

// ---------------------------------------------------------------- programs
const R3 = C.RUN;
function makeProgs(abil, multi){
  const out = [];
  const pats = [];
  for(const d of [-1, 0, 1]) pats.push({d1:d, k:999, d2:d});
  for(const d of [-1, 1]) for(const k of [8, 20]) pats.push({d1:d, k, d2:0});
  for(const d of [-1, 1]) for(const k of [12, 24]) pats.push({d1:d, k, d2:-d});
  for(const vx0 of [-R3, 0, R3]) for(const pt of pats) for(const jump of ['walk', 'tap', 'full']) for(const dj of (abil.dj ? [-1, 4, 10, 16, 24, 34] : [-1])){
    if(jump === 'walk' && pt.d1 === 0 && vx0 === 0) continue;
    if(jump === 'walk' && Math.sign(vx0) !== 0 && Math.sign(vx0) !== pt.d1 && pt.d1 !== 0) continue;
    out.push({vx0, ...pt, jump, dj, dash:-1});
  }
  if(abil.dash){
    for(const vx0 of [-R3, 0, R3]) for(const d of [-1, 1]) for(const pt of [{d1:d, k:999, d2:d}, {d1:d, k:20, d2:0}, {d1:d, k:30, d2:-d}])
      for(const jump of ['walk', 'full']) for(const df of [0, 6, 12, 20, 30, 42, 54, 66, 78]) for(const dj of (abil.dj ? [-1, 4, 16, 28, 40] : [-1])){
        if(Math.sign(vx0) && Math.sign(vx0) !== d) continue;
        if(jump === 'walk' && df === 0 && dj >= 0) continue;
        out.push({vx0, ...pt, jump, dj, dash:df, ddir:d});
      }
    // chains: orbs give the dash back in mid-air, so try a second (and third) dash
    if(multi) for(const vx0 of [-R3, 0, R3]) for(const d of [-1, 1]) for(const jump of ['tap', 'full']) for(const df of [0, 6, 12, 20]) for(const dj of (abil.dj ? [-1, 4, 16] : [-1]))
      for(const g2 of [18, 24]) for(const g3 of [0, 18, 24]){
        if(Math.sign(vx0) && Math.sign(vx0) !== d) continue;
        out.push({vx0, d1:d, k:999, d2:d, jump, dj, dash:df, ddir:d, dash2:df + g2, dash3:g3 ? df + g2 + g3 : -1});
      }
  }
  return out;
}
// from a wall: side = which side the wall is on (1 = wall to the right)
function makeWallProgs(abil, side, multi){
  const out = [];
  const away = -side;
  const pats = [];
  for(const d1 of [away, 0, side]) for(const k of [6, 14, 999]) for(const d2 of [away, 0, side]){ if(k === 999 && d2 !== d1) continue; pats.push({d1, k, d2}); }
  for(const pt of pats) for(const jump of ['walk', 'tap', 'full']) for(const dj of (abil.dj ? [-1, 6, 14, 24, 34] : [-1])) for(const dash of (abil.dash ? [-1, 4, 12, 22, 34] : [-1])) for(const ddir of (dash >= 0 ? [away, side] : [0])){
    if(jump === 'walk' && pt.d1 === side && pt.d2 === side) continue;    // that just keeps sliding
    out.push({vx0:0, ...pt, jump, dj, dash, ddir});
  }
  if(multi && abil.dash) for(const jump of ['tap', 'full']) for(const dash of [4, 12]) for(const g2 of [18, 24]) for(const g3 of [0, 18]) for(const dj of (abil.dj ? [-1, 6] : [-1]))
    out.push({vx0:0, d1:-side, k:999, d2:-side, jump, dj, dash, ddir:-side, dash2:dash + g2, dash3:g3 ? dash + g2 + g3 : -1});
  return out;
}

// run a program from a start state until XELIAX stops somewhere new
function sim(geo, st, prog, start, pre){
  const s = Object.assign({x:0, y:0, vx:0, vy:0, onGround:true, coyote:C.COY, buffer:0, usedDJ:false, noCut:false, g:1, facing:1,
    wallSide:0, wallT:0, wallLock:0, sliding:false, dashT:0, dashDir:1, dashReady:true, dashCD:0, dashBuf:0, ice:false,
    jumps:0, wjumps:0, djs:0, dashes:0, broke:0, flipped:false, left:false}, st);
  s.disarmed = new Set(geo.orbs.filter(o => ov(s.x, s.y, C.PW, C.PH, o)).map(o => o.i));
  s.vx = prog.vx0;
  const broken = new Set(pre || []);
  let touched = 0, startWall = start.wall || null, leftWall = !startWall;
  for(let f = 0; f < 240; f++){
    const dir = f < prog.k ? prog.d1 : prog.d2;
    let pressed = false, held = false;
    if(prog.jump !== 'walk'){ if(f === 0) pressed = true; held = f < (prog.jump === 'tap' ? 2 : 45); }
    if(prog.dj >= 0){ if(f === prog.dj) pressed = true; if(f >= prog.dj && f < prog.dj + 45) held = true; }
    const dashPress = (prog.dash >= 0 && f === prog.dash) || (prog.dash2 > 0 && f === prog.dash2) || (prog.dash3 > 0 && f === prog.dash3);
    const dd = dashPress && prog.ddir ? prog.ddir : dir;
    frameStep(geo, s, dashPress ? dd : dir, pressed, held, dashPress, broken);
    if(!s.onGround) s.left = true;
    // hazards & goals
    if(s.g > 0 && s.y > geo.H + 30) return {dead:true, touched};
    if(s.g < 0 && s.y + C.PH < -40) return {dead:true, touched};
    if(s.g < 0 && s.y > geo.H) return {dead:true, touched};
    const cell = cellAt(geo, s.x, s.y);
    for(const h of cell.hz) if(ov(s.x, s.y, C.PW, C.PH, h)) return {dead:true, touched};
    const B = geo.boxes;
    if(s.onGround && B.door && ov(s.x, s.y, C.PW, C.PH, B.door)) touched |= 1;
    if(B.key && ov(s.x, s.y, C.PW, C.PH, B.key)) touched |= 2;
    if(B.goal && ov(s.x, s.y, C.PW, C.PH, B.goal)) touched |= 4;
    if(B.gem && ov(s.x, s.y, C.PW, C.PH, B.gem)) touched |= 8;
    if(startWall && !leftWall && (s.wallT <= 0 || s.onGround)) leftWall = true;
    if(s.onGround && s.left) return {stand:true, land:s.land, x:s.x, g:s.g, touched, s};
    if(s.sliding && leftWall && f > 1 && !(s.wallObj === startWall && Math.abs(s.y - start.y) < 24)) return {wall:true, w:s.wallObj, side:s.wallSide, y:s.y, g:s.g, touched, s};
    if(s.onGround && prog.jump === 'walk' && f > 70 && prog.dash < 0) return {stay:true, touched};
  }
  return {timeout:true, touched};
}

// ---------------------------------------------------------------- nodes
// standing ranges on top (g=1) or under (g=-1) each surface
function ranges(geo, room){
  const R = [];
  const both = (room.flips && room.flips.length) || room.startG === -1;
  for(const p of geo.plats){
    for(const g of (both ? [1, -1] : [1])){
      const y = g > 0 ? p.y - C.PH : p.y + p.h;
      let cur = null;
      for(let x = Math.ceil(p.x - C.PW + 2.01); x <= p.x + p.w - 2.01; x += 2){
        // standing inside an orb or a gravity band is impossible: walking into it flips you
        let bad = x < 0 || x > geo.W - C.PW || geo.hz.some(h => ov(x, y, C.PW, C.PH, h)) || geo.walls.some(w => w !== p && !w.glass && ov(x, y, C.PW, C.PH, w)) || geo.orbs.some(o => ov(x, y, C.PW, C.PH, o));
        if(g < 0 && y + C.PH > geo.H + 30) bad = true;
        if(!bad){ if(!cur) cur = {kind:'stand', p, g, lo:x, hi:x, y}; else cur.hi = x; }
        else if(cur){ R.push(cur); cur = null; }
      }
      if(cur) R.push(cur);
    }
  }
  return R;
}
function standSamples(r){
  const xs = new Set([r.lo, r.hi]);
  const stepX = r.hi - r.lo > 400 ? 32 : 16;
  for(let x = r.lo; x < r.hi; x += stepX) xs.add(x);
  return [...xs];
}
function findStand(R, land, x, g){
  let best = -1, bd = 1e9;
  R.forEach((r, i) => { if(r.kind !== 'stand' || r.p !== land || r.g !== g) return; const d = x < r.lo ? r.lo - x : x > r.hi ? x - r.hi : 0; if(d < bd){ bd = d; best = i; } });
  return bd <= 6 ? best : -1;
}
const WB = 16;   // wall nodes every 16 px
function wallNode(R, idx, w, side, y, g){
  const by = Math.round(y / WB) * WB;
  const key = `${w.id}|${side}|${g}|${by}`;
  // the node keeps the real height of the first arrival (a rounded height could sit inside a ceiling)
  if(!idx.has(key)){ idx.set(key, R.length); R.push({kind:'wall', w, side, g, y, key}); }
  return idx.get(key);
}

function analyse(room, abil, removed){
  if(room.noDJ) abil = {...abil, dj:false};      // Gaston keeps the double jump in these rooms
  const geo = buildGeo(room, abil, removed);
  const R = ranges(geo, room);
  const widx = new Map();
  const multi = !!abil.dash && !!(room.flips && room.flips.length);
  const PROGS = makeProgs(abil, multi);
  const WP = {1:makeWallProgs(abil, 1, multi), '-1':makeWallProgs(abil, -1, multi)};
  // start
  let sx = room.start.x, sy = room.start.y, svy = 0, g0 = room.startG || 1, start = -1;
  for(let f = 0; f < 300 && start < 0; f++){
    svy = g0 > 0 ? Math.min(svy + C.G, C.MAXF) : Math.max(svy - C.G, -C.MAXF);
    const pb = sy + C.PH, pt = sy; sy += svy;
    for(const p of geo.plats){
      if(sx + C.PW > p.x + 2 && sx < p.x + p.w - 2){
        if(g0 > 0 && pb <= p.y + 1 && sy + C.PH >= p.y){ start = findStand(R, p, sx, 1); break; }
        if(g0 < 0 && pt >= p.y + p.h - 1 && sy <= p.y + p.h){ start = findStand(R, p, sx, -1); break; }
      }
    }
  }
  if(start < 0) return {err:'start not on a surface'};
  const dist = new Map([[start, 0]]), par = new Map(), edgeInfo = new Map();
  const reach = {door:Infinity, key:Infinity, goal:Infinity, gem:Infinity};
  const keyNodes = [];
  const q = [start];
  const note = (d, t, node) => {
    if(t & 1) reach.door = Math.min(reach.door, d);
    if(t & 2){ reach.key = Math.min(reach.key, d); keyNodes.push(node); }
    if(t & 4) reach.goal = Math.min(reach.goal, d);
    if(t & 8) reach.gem = Math.min(reach.gem, d);
  };
  let sims = 0;
  const B = geo.boxes;
  while(q.length){
    const i = q.shift(), d = dist.get(i), r = R[i];
    const out = new Map();
    const push = (res, info) => {
      let j = -1;
      if(res.stand) j = findStand(R, res.land, res.x, res.g);
      else if(res.wall) j = wallNode(R, widx, res.w, res.side, res.y, res.g);
      if(res.touched) note(d + 1, res.touched, j >= 0 ? j : i);
      if(j < 0) return;
      if(!out.has(j)) out.set(j, info);
    };
    if(r.kind === 'stand'){
      // standing in the range may already touch a goal
      for(let x = r.lo; x <= r.hi; x += 2){
        let t = 0;
        if(B.door && r.g > 0 && ov(x, r.y, C.PW, C.PH, B.door)) t |= 1;
        if(B.key && ov(x, r.y, C.PW, C.PH, B.key)) t |= 2;
        if(B.goal && ov(x, r.y, C.PW, C.PH, B.goal)) t |= 4;
        if(B.gem && ov(x, r.y, C.PW, C.PH, B.gem)) t |= 8;
        if(t) note(d, t, i);
      }
      for(const x of standSamples(r)) for(const prog of PROGS){
        if(prog.jump === 'walk' && prog.dash < 0){
          if(prog.d1 < 0 && x > r.lo + 12) continue;
          if(prog.d1 > 0 && x < r.hi - 12) continue;
        }
        sims++;
        const res = sim(geo, {x, y:r.y, g:r.g, onGround:true, ice:!!r.p.ice}, prog, {});
        if(res.dead || res.timeout || res.stay){ if(res.touched) note(d + 1, res.touched, i); continue; }
        push(res, {prog, x});
      }
      // a crumbling platform: wait on it until it gives way, then fall (steering or not)
      if(r.p.crumble) for(const x of standSamples(r)) for(const dd of [-1, 0, 1]){
        const prog = {vx0:0, d1:dd, k:999, d2:dd, jump:'walk', dj:-1, dash:-1, crumble:true};
        sims++;
        const res = sim(geo, {x, y:r.y, g:r.g, onGround:true}, prog, {}, [r.p]);
        if(res.dead || res.timeout || res.stay){ if(res.touched) note(d + 1, res.touched, i); continue; }
        push(res, {prog, x, crumble:r.p.id});
      }
    } else {
      const x = r.side > 0 ? r.w.x - C.PW : r.w.x + r.w.w;
      for(const prog of WP[r.side]){
        sims++;
        const res = sim(geo, {x, y:r.y, g:r.g, onGround:false, coyote:0, vy:C.WALL_SLIDE * r.g, sliding:true, wallSide:r.side, wallT:C.WALL_COY, usedDJ:true, dashReady:true, facing:r.side, curWall:r.w}, prog, {wall:r.w, y:r.y});
        if(res.dead || res.timeout || res.stay){ if(res.touched) note(d + 1, res.touched, i); continue; }
        push(res, {prog, x});
      }
    }
    for(const [j, info] of out){
      if(!dist.has(j)){ dist.set(j, d + 1); par.set(j, i); edgeInfo.set(j, info); q.push(j); }
    }
  }
  return {geo, R, dist, par, reach, keyNodes, start, sims, edgeInfo};
}

function goalCost(room, a){
  if(a.err) return Infinity;
  if(room.finale && !room.boss) return a.reach.goal;
  return a.reach.door;
}

if(require.main === module){
  const file = process.argv[2];
  const filter = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : null;
  const wantGates = process.argv.includes('--gates');
  const CH = new Function(fs.readFileSync(file, 'utf8') + '; return CHAPTERS2;')();
  CH.forEach((c, ci) => {
    const base = Object.assign({dj:false, wall:false, dash:false}, c.grants || {});
    const abil = {...base};
    c.rooms.forEach((room, ri) => {
      for(const n of (room.npcs || [])) if(n.gives === 'wall') abil.wall = true;
      for(const pu of (room.powerUps || [])){ if(pu.type === 'wall') abil.wall = true; if(pu.type === 'dash') abil.dash = true; if(pu.type === 'doubleJump') abil.dj = true; }
      if(process.argv.includes('--nodash')) abil.dash = false;
      if(process.argv.includes('--nowall')) abil.wall = false;
      if(room.boss && !room.checkRoute) return;
      const tag = `${c.num}-${ri + 1}`;
      if(filter && tag !== filter) return;
      const t0 = Date.now();
      const a = analyse(room, abil, new Set());
      if(a.err){ console.log(tag, room.name, a.err); return; }
      const cost = goalCost(room, a);
      const reachedP = new Set([...a.dist.keys()].map(i => a.R[i]).filter(r => r.kind === 'stand').map(r => r.p.id));
      const unreached = [...new Set(room.platforms.map((p, i) => i))].filter(i => !reachedP.has(i));
      let line = `${tag.padEnd(4)} ${room.name.padEnd(28)} w${room.width || 640} h${room.height || 360}  steps to exit: ${cost === Infinity ? 'UNREACHABLE' : cost}`;
      const gem = (room.powerUps || []).some(p => p.type === 'gem');
      if(gem) line += `  gem ${a.reach.gem === Infinity ? 'UNREACHABLE' : a.reach.gem}`;
      if(unreached.length) line += `  never stood on: ${unreached.join(',')}`;
      line += `  [${a.R.length} nodes, ${a.sims} sims, ${((Date.now() - t0) / 1000).toFixed(1)}s] abil:${Object.keys(abil).filter(k => abil[k]).join('+')}`;
      console.log(line);
      if(process.argv.includes('--verbose')) for(const [j, d] of [...a.dist].sort((x, y) => x[1] - y[1])){ const r = a.R[j]; console.log('   ', d, r.kind, r.kind === 'stand' ? `plat ${r.p.id} g${r.g} x${r.lo}-${r.hi} y${r.y}` : `wall ${r.w.id} side${r.side} y${r.y|0}`); }
      if(wantGates && cost < Infinity){
        const gates = [], longer = [], skip = [];
        const cand = room.platforms.map((p, i) => i).filter(i => { const p = room.platforms[i]; return i > 0 && !p.opt && !((p.h || 14) >= 20 && !p.solid) && !(p.solid && p.w >= 200); });
        for(const i of cand){
          const c2 = goalCost(room, analyse(room, abil, new Set([i])));
          if(c2 === Infinity) gates.push(i); else if(c2 > cost) longer.push(`${i}(+${c2 - cost})`); else skip.push(i);
        }
        const og = [], oskip = [];
        (room.flips || []).forEach((f, i) => { const c2 = goalCost(room, analyse(room, abil, new Set(['f' + i]))); if(c2 === Infinity) og.push(i); else oskip.push(i + (c2 > cost ? `(+${c2 - cost})` : '')); });
        (room.walls || []).forEach((w, i) => { if(w.glass){ const c2 = goalCost(room, analyse(room, abil, new Set(['w' + i]))); if(c2 <= cost) skip.push('glass w' + i + ' (removing it does not shorten)'); } });
        console.log(`      mandatory: [${gates.join(',')}]  detour: [${longer.join(',')}]  SKIPPABLE: [${skip.join(',')}]  orbs needed: [${og.join(',')}] orbs optional: [${oskip.join(',')}]`);
      }
    });
  });
}
module.exports = {C, buildGeo, sim, frameStep, analyse, goalCost, makeProgs};
