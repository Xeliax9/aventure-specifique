// =====================================================================
//  SEASON 2 BOSSES: the giant gecko (walls), the yeti (dash), the magpie (gravity)
// =====================================================================
const ARENA_WALL = 40;
function geckoWallX(b, side){ return side < 0 ? ARENA_WALL : W - ARENA_WALL - b.w; }

function setupS2Boss(b){
  b.t = 0; b.vx = 0; b.vy = 0; b.face = -1;
  if(b.mode === 'gecko'){ b.side = -1; b.state = 'crawl'; b.stT = 150; b.fireT = 70; b.leaps = 0; }
  if(b.mode === 'yeti'){ b.y = FLOOR - b.h; b.state = 'walk'; b.stT = 160; b.fireT = 90; b.warn = []; }
  if(b.mode === 'magpie'){ b.state = 'hover'; b.stT = 150; b.fireT = 120; b.hx = b.x; }
}

function updateS2Boss(b){
  const p2 = b.phase === 2;
  b.t++;
  if(b.mode === 'gecko'){
    if(b.state === 'crawl'){
      const ty = clamp(player.y - 10, 50, FLOOR - b.h - 40);
      b.y += clamp((ty - b.y) * 0.03, -1.6, 1.6) * (p2 ? 1.5 : 1);
      b.x = geckoWallX(b, b.side);
      if(--b.fireT <= 0){ b.fireT = p2 ? 60 : 90; spitAcid(b, p2 ? 3 : b.hp <= b.enrage ? 2 : 1); }
      if(--b.stT <= 0){
        if(p2 && (b.runNext = !b.runNext)){ b.state = 'runDrop'; b.vy = 0; SFX.warn(); popup(b.x + b.w / 2, b.y - 10, 'Il descend !', '#9dff5a'); }
        else startLeap(b);
      }
    } else if(b.state === 'runDrop'){
      b.vy += 0.6; b.y += b.vy;
      if(b.y >= FLOOR - b.h){
        b.y = FLOOR - b.h; b.vy = 0; b.state = 'run'; b.rdir = -b.side; b.lastAcid = b.x;
        addShake(5); SFX.thud(); dust(b.x + b.w / 2, FLOOR, 10);
        if(!b.toldRun){ b.toldRun = true; showToast('Il court au sol et laisse de l\'acide : monte sur les plateformes !', 160); }
      }
    } else if(b.state === 'run'){
      b.x += b.rdir * 4.6; b.face = b.rdir;
      if(Math.abs(b.x - b.lastAcid) >= 34){
        b.lastAcid = b.x;
        fires.push({x:clamp(b.x + b.w / 2 - 20, ARENA_WALL, W - ARENA_WALL - 40), w:40, t:0, max:300, seed:Math.random() * 10, acid:true});
        burst(b.x + b.w / 2, FLOOR - 4, 4, '#7ae04a', 1.6, 20, 0.1, 3, 'goo');
      }
      if(frame % 3 === 0) dust(b.x + b.w / 2 - b.rdir * 18, FLOOR, 2);
      if(b.x <= ARENA_WALL || b.x + b.w >= W - ARENA_WALL){
        b.x = clamp(b.x, ARENA_WALL, W - ARENA_WALL - b.w);
        b.side = b.rdir; b.state = 'climb'; addShake(4); SFX.thud();
      }
    } else if(b.state === 'leap'){
      b.lt++;
      const k = Math.min(1, b.lt / b.ldur);
      b.x = lerp(b.lx0, b.lx1, k); b.y = lerp(b.ly0, b.ly1, k) - Math.sin(k * Math.PI) * 80;
      if(k >= 1){
        b.side = -b.side; b.state = 'crawl'; b.leaps++;
        addShake(4); SFX.thud(); dust(b.side < 0 ? ARENA_WALL : W - ARENA_WALL, b.y + b.h / 2, 8);
        if(b.leaps >= (p2 ? 3 : 2)){
          b.leaps = 0;
          if(p2){ b.state = 'stuck'; b.stT = 180; popup(b.x + b.w / 2, b.y - 8, 'Il est sonné !', '#ffe58a'); SFX.warn(); }
          else { b.state = 'drop'; b.vy = 0; }
        } else b.stT = p2 ? 70 : 110;
      }
    } else if(b.state === 'drop'){
      b.vy += 0.5; b.y += b.vy;
      if(b.y >= FLOOR - b.h){ b.y = FLOOR - b.h; b.vy = 0; b.state = 'stun'; b.stT = 160; addShake(8); SFX.thud(); dust(b.x + b.w / 2, FLOOR, 12); popup(b.x + b.w / 2, b.y - 8, 'Saute-lui dessus !', '#ffe58a'); }
    } else if(b.state === 'stun' || b.state === 'stuck'){
      if(--b.stT <= 0){ b.state = b.state === 'stun' ? 'climb' : 'crawl'; b.stT = 90; b.fireT = 40; }
    } else if(b.state === 'climb'){
      b.x = geckoWallX(b, b.side);
      b.y -= 2.6;
      if(b.y <= 170){ b.state = 'crawl'; b.stT = p2 ? 80 : 120; b.fireT = 40; }
    }
    return;
  }
  if(b.mode === 'yeti'){
    // falling icicles announced by a shadow on the floor
    for(const w of b.warn) if(--w.t === 0) bullets.push({x:w.x - 6, y:-30, w:12, h:26, vx:0, vy:2, grav:0.42, kind:'icicle'});
    b.warn = b.warn.filter(w => w.t > 0);
    if(b.state === 'walk'){
      const dir = Math.sign(player.x + player.w / 2 - (b.x + b.w / 2)) || b.face;
      b.face = dir;
      b.x = clamp(b.x + dir * (p2 ? 1.3 : 0.9), 32, W - 32 - b.w);
      if(--b.fireT <= 0){
        b.fireT = p2 ? 75 : 105;
        const cx = b.x + b.w / 2, cy = b.y + 10, dx = player.x + player.w / 2 - cx;
        bullets.push({x:cx - 7, y:cy - 7, w:14, h:14, vx:clamp(dx / 55, -5.5, 5.5), vy:-6, grav:0.2, kind:'snow'});
        SFX.bossShot();
      }
      if(--b.stT <= 0){ b.state = 'roar'; b.stT = 46; SFX.warn(); }
    } else if(b.state === 'roar'){
      b.face = Math.sign(player.x + player.w / 2 - (b.x + b.w / 2)) || b.face;
      if(--b.stT <= 0){ b.state = 'charge'; b.cdir = b.face; SFX.bossFlee(); addShake(4); }
    } else if(b.state === 'charge'){
      b.x += b.cdir * (p2 ? 7.4 : 6.2);
      if(frame % 3 === 0) dust(b.x + b.w / 2 - b.cdir * 20, FLOOR, 2);
      if(b.x <= 32 || b.x + b.w >= W - 32){
        b.x = clamp(b.x, 32, W - 32 - b.w);
        b.state = 'dizzy'; b.stT = p2 ? 115 : 150;
        addShake(13); SFX.thud(); SFX.crumble();
        burst(b.cdir > 0 ? W - 32 : 32, b.y + 20, 16, '#e8f8ff', 3, 30, 0.1, 3, 'puff');
        popup(b.x + b.w / 2, b.y - 10, 'Fonce dedans : dash !', '#ffe58a');
        if(p2) for(let i = 0; i < 4; i++) b.warn.push({x:60 + Math.random() * (W - 120), t:30 + i * 14});
      }
    } else if(b.state === 'dizzy'){
      if(--b.stT <= 0){ b.state = 'walk'; b.stT = p2 ? 130 : 190; b.fireT = 50; }
    }
    return;
  }
  if(b.mode === 'magpie'){
    const top = 34, bottom = FLOOR - b.h, p3 = b.phase === 3;
    // after each hit she shakes the nest: in phase 1 everyone falls back onto the hay, in phase 2 the world turns over
    if(b.nestT > 0){
      if(b.nestT === 50) popup(b.x + b.w / 2, b.y - 10, 'Le nid tremble !', '#ffe58a');
      if(--b.nestT === 0){
        const want = b.phase >= 2 ? -gdir : 1;
        addShake(9); SFX.thud();
        if(want !== gdir){ setGravity(want); showToast(p2 ? 'Elle retourne le nid !' : 'Elle secoue le nid : tout le monde retombe !', 110); }
      }
    }
    if(b.state === 'hover'){
      const tx = clamp(player.x + player.w / 2 - b.w / 2 + Math.sin(b.t * 0.03) * 120, 40, W - 40 - b.w);
      b.x += clamp((tx - b.x) * 0.025, -2.6, 2.6) * (p2 ? 1.4 : 1);
      b.y += (150 + Math.sin(b.t * 0.05) * 30 - b.y) * 0.06;
      b.face = player.x + player.w / 2 > b.x + b.w / 2 ? 1 : -1;
      if(!p2 && --b.fireT <= 0){
        // phase 1: a single shiny trinket thrown at XELIAX now and then
        b.fireT = 120;
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2, a = Math.atan2(player.y + player.h / 2 - cy, player.x + player.w / 2 - cx);
        bullets.push({x:cx - 6, y:cy - 6, w:12, h:12, vx:Math.cos(a) * 2.6, vy:Math.sin(a) * 2.6, kind:'trinket', rot:0});
        SFX.bossShot();
      }
      if(b.phase >= 2 && --b.fireT <= 0){
        b.fireT = p3 ? 85 : 70;
        const cx = b.x + b.w / 2, cy = b.y + b.h / 2, a = Math.atan2(player.y + player.h / 2 - cy, player.x + player.w / 2 - cx);
        for(const s of (p3 ? [-0.5, -0.25, 0, 0.25, 0.5] : [-0.3, 0, 0.3])) bullets.push({x:cx - 6, y:cy - 6, w:12, h:12, vx:Math.cos(a + s) * 3.2, vy:Math.sin(a + s) * 3.2, kind:'trinket', rot:0});
        SFX.bossShot();
      }
      if(--b.stT <= 0){
        b.state = 'aim'; b.stT = p3 ? 30 : p2 ? 34 : 42; SFX.warn();
        b.tx = clamp(player.x + player.w / 2 - b.w / 2, 30, W - 30 - b.w);
        // phase 3: two dives straight at XELIAX, wherever he is, then a last one at the other side, where she gets stuck
        if(p3){ b.chain = 2; b.ty = clamp(player.y + player.h / 2 - b.h / 2, top, bottom); }
        else
        // phase 1: she dives at the side you're standing on (only the ceiling holds her);
        // phase 2: she's wary and dives at the OTHER side, so you have to flip over (orbs, edges) and dash into her
        b.ty = b.phase === 2 ? (gdir > 0 ? top : bottom) : (gdir > 0 ? bottom : top);
      }
    } else if(b.state === 'aim'){
      b.y += (b.ty > 150 ? -0.6 : 0.6);
      if(--b.stT <= 0){ b.state = 'dive'; const d = Math.hypot(b.tx - b.x, b.ty - b.y) || 1; const sp = p3 ? 10.5 : p2 ? 10 : 8.5; b.vx = (b.tx - b.x) / d * sp; b.vy = (b.ty - b.y) / d * sp; SFX.bossFlee(); }
    } else if(b.state === 'dive'){
      b.x += b.vx; b.y += b.vy;
      if((b.tx - b.x) * b.vx + (b.ty - b.y) * b.vy <= 0){
        if(p3 && b.chain > 0){
          // she brakes in mid-air, turns round and aims again
          b.x = clamp(b.tx, 30, W - 30 - b.w); b.y = b.ty; b.chain--;
          b.state = 'aim'; b.stT = 26; SFX.warn();
          b.tx = clamp(player.x + player.w / 2 - b.w / 2, 30, W - 30 - b.w);
          b.ty = b.chain > 0 ? clamp(player.y + player.h / 2 - b.h / 2, top, bottom) : (gdir > 0 ? top : bottom);
          b.face = b.tx > b.x ? 1 : -1;
          burst(b.x + b.w / 2, b.y + b.h / 2, 8, '#ffffff', 2, 20, 0, 3, 'puff');
          return;
        }
        b.x = clamp(b.x, 30, W - 30 - b.w); b.y = b.ty;
        if(!p2 && b.ty > 150){
          // phase 1: the hay is far too soft, she bounces straight back up
          b.state = 'bounce'; b.stT = 22; b.vy = -6.5; b.vx *= 0.25;
          addShake(5); SFX.spring(); dust(b.x + b.w / 2, FLOOR, 14);
          for(let i = 0; i < 10; i++) particles.push({x:b.x + Math.random() * b.w, y:FLOOR - 4, vx:(Math.random() - 0.5) * 4, vy:-2 - Math.random() * 2.5, life:40, max:40, color:i % 2 ? '#e8c26a' : '#c9973e', grav:0.15, size:3, type:'crumb', rot:Math.random() * TAU, vr:0.3});
          popup(b.x + b.w / 2, b.y - 8, 'Le foin amortit !', '#ffe58a');
          if(!b.toldHay){ b.toldHay = true; showToast('Le foin est trop mou : fais-la plonger vers le plafond !', 160); }
          return;
        }
        b.state = 'stuck'; b.ceil = b.ty < 150; b.stT = p3 ? 150 : p2 ? 170 : 135;
        if(b.phase === 2 && !b.toldFlip){ b.toldFlip = true; showToast('Elle se cache de l\'autre côté : retourne-toi et dash !', 170); }
        addShake(10); SFX.thud();
        const sy = b.ceil ? top - 4 : FLOOR;
        burst(b.x + b.w / 2, sy, 12, '#e8d8ff', 3, 30, b.ceil ? -0.1 : 0.1, 3, 'puff');
        popup(b.x + b.w / 2, b.ceil ? b.y + b.h + 18 : b.y - 8, b.phase === 2 ? 'Coincée ! Dash !' : 'Coincée ! Saute-lui dessus !', '#ffe58a');
        if(p2 && !b.ceil){
          bullets.push({x:b.x - 12, y:FLOOR - 14, w:16, h:14, vx:-3.4, vy:0, kind:'wave'});
          bullets.push({x:b.x + b.w - 4, y:FLOOR - 14, w:16, h:14, vx:3.4, vy:0, kind:'wave'});
        }
      }
    } else if(b.state === 'bounce'){
      b.x = clamp(b.x + b.vx, 30, W - 30 - b.w); b.y += b.vy; b.vy += 0.3;
      if(--b.stT <= 0) b.state = 'rise';
    } else if(b.state === 'stuck'){
      if(frame % 10 === 0) b.shakeX = (Math.random() - 0.5) * 3;
      if(--b.stT <= 0){ b.state = 'rise'; }
    } else if(b.state === 'rise'){
      b.y += (150 - b.y) * 0.08;
      if(Math.abs(b.y - 150) < 4){ b.state = 'hover'; b.stT = p3 ? 60 : p2 ? 75 : 95; b.fireT = 45; }
    }
  }
}

function startLeap(b){
  b.state = 'leap'; b.lt = 0; b.ldur = b.phase === 2 ? 42 : 54;
  b.lx0 = b.x; b.ly0 = b.y; b.lx1 = geckoWallX(b, -b.side); b.ly1 = clamp(player.y - 20, 60, 230);
  SFX.flip();
}
function spitAcid(b, n){
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2, dx = player.x + player.w / 2 - cx;
  for(let i = 0; i < n; i++){
    const spread = (i - (n - 1) / 2) * 1.1;
    bullets.push({x:cx - 6, y:cy - 6, w:12, h:12, vx:clamp(dx / 60, -5, 5) + spread, vy:-4 - Math.random() * 0.6, grav:0.16, kind:'acid'});
  }
  SFX.bossShot();
}

// when can it be hit, and when is it harmless
// the magpie can be stomped only in phase 1 (stuck in the ceiling); in phase 2 her trinket armour only gives way to a dash
function bossWeak(b){ return (b.mode === 'gecko' && (b.state === 'stun' || b.state === 'stuck')) || (b.mode === 'magpie' && b.state === 'stuck' && b.phase !== 2); }
function bossDashWeak(b){ return bossWeak(b) || (b.mode === 'yeti' && b.state === 'dizzy') || (b.mode === 'magpie' && b.state === 'stuck'); }
function bossHarmless(b){ return bossDashWeak(b) || (S2_BOSS.has(b.mode) && b.inv > 0); }
function bossHitReact(b){
  if(!b.alive || cine || b.dying) return;
  if(b.mode === 'gecko'){ b.state = b.state === 'stun' ? 'climb' : 'crawl'; b.stT = 90; b.fireT = 60; }
  if(b.mode === 'yeti'){ b.state = 'walk'; b.stT = 170; b.fireT = 70; }
  if(b.mode === 'magpie'){ b.state = 'rise'; b.nestT = 50; }   // ...then she shakes the nest
}

// touching a season 2 boss: stomp it (gecko, magpie), dash into it (all three, when dazed), or get hurt
function bossContact2(prevBottom, prevTop){
  const b = boss;
  if(!overlap(player, b)) return false;
  const G = gdir;
  const onTop = G > 0 ? (player.vy > 0 && prevBottom <= b.y + 16) : (player.vy < 0 && prevTop >= b.y + b.h - 16);
  if(player.dashT > 0 && bossDashWeak(b)){
    if(b.inv <= 0){ bossDamage(); bossHitReact(b); }
    player.dashT = 0; player.vx = -player.dashDir * 3.5; player.vy = -5 * G; player.noCut = true;
    return false;
  }
  if(onTop){
    if(bossWeak(b) && b.inv <= 0){ bossDamage(); bossHitReact(b); }
    else if(b.mode === 'yeti'){ SFX.ting(); if(toast.t <= 0) showToast('Son casque de glace protège sa tête : utilise le dash !', 110); }
    else if(b.mode === 'magpie' && b.phase === 2){ SFX.ting(); if(toast.t <= 0) showToast('Son armure de babioles la protège : fonce-lui dedans avec le dash !', 120); }
    player.y = G > 0 ? b.y - player.h : b.y + b.h;
    player.vy = -10.5 * G; player.noCut = true; player.usedDJ = false; player.dashReady = true;
    player.sx = 0.75; player.sy = 1.3;
    anim.wobV -= 0.4; setFace(anim, 'open', 30);
    return false;
  }
  if(bossHarmless(b)) return false;
  hurt(b.x + b.w / 2);
  return state !== 'play';
}

// the magpie lets go of the ficelle: it tumbles down, XELIAX has to catch it
function dropFicelle(b){
  key = {x:b.x + b.w / 2 - 17, y:b.y + b.h / 2, w:34, h:16, got:false, kind:'ficelle', fall:true, vy:-5, rot:0};
  sparkle(b.x + b.w / 2, b.y + b.h / 2, 20, '#ffe066');
  for(let i = 0; i < 16; i++) particles.push({x:b.x + b.w / 2, y:b.y + b.h / 2, vx:(Math.random() - 0.5) * 5, vy:-2 - Math.random() * 3, life:90, max:90, color:i % 2 ? '#1a1430' : '#ffffff', grav:0.08, size:3, type:'confetti', rot:Math.random() * TAU, vr:0.3, drag:0.97});
  showToast('La pie lâche la ficelle aux olives ! Attrape-la !', 170);
  SFX.key();
}

// ---------------------------------------------------------------- drawing
function drawGecko(b){
  const x = ix(b), y = iy(b), cx = x + b.w / 2, cy = y + b.h / 2;
  const p2 = b.phase === 2, hit = b.hitT > 0 || (b.inv > 0 && Math.floor(b.inv / 4) % 2 === 0);
  const body = hit ? '#ffffff' : p2 ? '#ef7a3c' : '#5fd36a', dark = p2 ? '#6a2410' : '#1f6a2c', belly = p2 ? '#ffd2a0' : '#e8f59a';
  const dazed = b.state === 'stun' || b.state === 'stuck';
  ctx.save(); ctx.translate(cx, cy);
  // orientation: along the wall (head up, feet on the wall), on the floor, or following the leap
  if(b.state === 'leap'){
    const vx = (b.lx1 - b.lx0) / b.ldur, k = b.lt / b.ldur, vy = (b.ly1 - b.ly0) / b.ldur - Math.cos(k * Math.PI) * Math.PI * 80 / b.ldur;
    ctx.rotate(Math.atan2(vy, vx)); if(vx < 0) ctx.scale(1, -1);
  } else if(b.state === 'run' || b.state === 'runDrop'){ if((b.state === 'run' ? b.rdir : -b.side) < 0) ctx.scale(-1, 1); }
  else if(b.state === 'stun' || b.state === 'drop'){ if(b.side > 0) ctx.scale(-1, 1); }
  else { ctx.rotate(-Math.PI / 2); if(b.side < 0) ctx.scale(1, -1); }
  const wig = Math.sin(b.t * 0.3) * (b.state === 'crawl' || b.state === 'climb' ? 1 : 0.2);
  // tail
  ctx.strokeStyle = dark; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-14, 2); ctx.quadraticCurveTo(-30, 4 + wig * 6, -34, -6 + wig * 4); ctx.quadraticCurveTo(-36, -14, -28, -14); ctx.stroke();
  ctx.strokeStyle = body; ctx.lineWidth = 4.5; ctx.stroke();
  // legs with sticky toe pads
  for(const [lx, s] of [[-8, 1], [10, -1]]) for(const side of [-1, 1]){
    const sw = side * wig * s * 3;
    ctx.strokeStyle = dark; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(lx, 6); ctx.lineTo(lx + 6 * side + sw, 15); ctx.stroke();
    ctx.fillStyle = belly; ctx.beginPath(); ctx.arc(lx + 6 * side + sw, 16, 3, 0, TAU); ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 1; ctx.stroke();
  }
  // body
  ctx.fillStyle = body; ctx.strokeStyle = dark; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.ellipse(0, 2, 18, 11, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = belly; ctx.beginPath(); ctx.ellipse(0, 7, 12, 4.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = rgba(dark, 0.55);
  for(const [sx, sy, r] of [[-8, -3, 2.6], [1, -5, 2.2], [9, -2, 2], [-2, 0, 1.6]]){ ctx.beginPath(); ctx.arc(sx, sy, r, 0, TAU); ctx.fill(); }
  // head
  ctx.fillStyle = body; ctx.strokeStyle = dark; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.ellipse(20, -1, 11, 9, 0, 0, TAU); ctx.fill(); ctx.stroke();
  for(const ey of [-5, 4]){
    ctx.fillStyle = '#ffe14d'; ctx.beginPath(); ctx.arc(23, ey, 4.4, 0, TAU); ctx.fill(); ctx.strokeStyle = dark; ctx.lineWidth = 1.2; ctx.stroke();
    if(dazed){
      ctx.strokeStyle = dark; ctx.lineWidth = 1; ctx.beginPath();
      for(let k = 0; k < 14; k++){ const a = k * 0.7 + frame * 0.25, r = k * 0.28; ctx.lineTo(23 + Math.cos(a) * r, ey + Math.sin(a) * r); }
      ctx.stroke();
    } else { ctx.fillStyle = '#14082a'; ctx.fillRect(22.4, ey - 3.4, 1.6, 6.8); }
  }
  ctx.strokeStyle = dark; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(30, 2); ctx.quadraticCurveTo(26, 6, 21, 5); ctx.stroke();
  if(b.state === 'crawl' && b.fireT < 14){ ctx.fillStyle = '#9dff5a'; ctx.beginPath(); ctx.arc(31, 2, 3 + (14 - b.fireT) * 0.2, 0, TAU); ctx.fill(); }
  ctx.restore();
  if(dazed) for(let i = 0; i < 3; i++){ const a = frame * 0.12 + i * TAU / 3; ctx.fillStyle = '#ffe066'; star(cx + Math.cos(a) * 22, y - 8 + Math.sin(a) * 5, 3.4, frame * 0.1); }
}

function drawYeti(b){
  const x = ix(b), y = iy(b), cx = x + b.w / 2, base = y + b.h;
  const p2 = b.phase === 2, hit = b.hitT > 0 || (b.inv > 0 && Math.floor(b.inv / 4) % 2 === 0);
  const fur = hit ? '#ffffff' : '#eef6ff', shadeC = '#a8c4e6', face = p2 ? '#7a8ad8' : '#6aa6e0';
  const charging = b.state === 'charge', roar = b.state === 'roar', dizzy = b.state === 'dizzy';
  ctx.save(); ctx.translate(cx, base);
  ctx.scale(b.face || 1, 1);
  if(charging) ctx.rotate(0.18);
  if(roar) ctx.translate((Math.random() - 0.5) * 3, 0);
  const step = b.state === 'walk' ? Math.sin(b.t * 0.15) : charging ? Math.sin(b.t * 0.6) : 0;
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 30, 5, 0, 0, TAU); ctx.fill();
  // feet
  ctx.fillStyle = shadeC;
  for(const s of [-1, 1]){ ctx.beginPath(); ctx.ellipse(s * 12 + step * s * 3, -4, 10, 6, 0, 0, TAU); ctx.fill(); }
  // body: a big furry blob
  const g = ctx.createLinearGradient(0, -b.h, 0, 0);
  g.addColorStop(0, fur); g.addColorStop(1, hit ? '#ffffff' : '#c8dcf4');
  ctx.fillStyle = g; ctx.strokeStyle = '#3a5a86'; ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-26, -6);
  ctx.bezierCurveTo(-34, -40, -22, -62, 0, -62);
  ctx.bezierCurveTo(22, -62, 34, -40, 26, -6);
  for(let i = 0; i <= 6; i++){ const xx = 26 - i * 52 / 6; ctx.lineTo(xx + 4, -2 - (i % 2) * 5); }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  // fur tufts
  ctx.strokeStyle = 'rgba(90,130,180,0.45)'; ctx.lineWidth = 1.2;
  for(let i = 0; i < 7; i++){ const tx = -18 + i * 6, ty = -18 - (i % 3) * 9; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 2, ty + 5); ctx.stroke(); }
  // arms
  const armA = charging ? -0.9 : roar ? -2.2 : 0.3 + step * 0.2;
  for(const s of [-1, 1]){
    ctx.save(); ctx.translate(s * 22, -38); ctx.rotate(s > 0 ? -armA : armA * 0.7);
    ctx.fillStyle = fur; ctx.strokeStyle = '#3a5a86'; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.ellipse(s * 4, 14, 7, 15, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  // face
  ctx.fillStyle = face; ctx.strokeStyle = '#2a3a6a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(6, -40, 15, 12, 0, 0, TAU); ctx.fill(); ctx.stroke();
  for(const ex of [0, 12]){
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(ex, -43, 3.6, 4, 0, 0, TAU); ctx.fill();
    if(dizzy){ ctx.strokeStyle = '#14082a'; ctx.lineWidth = 0.9; ctx.beginPath(); for(let k = 0; k < 12; k++){ const a = k * 0.7 + frame * 0.25, r = k * 0.28; ctx.lineTo(ex + Math.cos(a) * r, -43 + Math.sin(a) * r); } ctx.stroke(); }
    else { ctx.fillStyle = p2 || charging || roar ? '#ff3d3d' : '#14082a'; ctx.beginPath(); ctx.arc(ex + 1, -42.5, 1.8, 0, TAU); ctx.fill(); }
  }
  ctx.strokeStyle = '#1a2450'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -50); ctx.lineTo(4, -47); ctx.moveTo(16, -50); ctx.lineTo(9, -47); ctx.stroke();
  if(roar || charging){ ctx.fillStyle = '#2a0a1a'; ctx.beginPath(); ctx.ellipse(7, -32, 7, 4.5, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffffff'; for(const tx of [2, 7, 12]){ ctx.beginPath(); ctx.moveTo(tx - 1.6, -35.5); ctx.lineTo(tx, -32.5); ctx.lineTo(tx + 1.6, -35.5); ctx.fill(); } }
  else { ctx.strokeStyle = '#1a2450'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(1, -33); ctx.quadraticCurveTo(7, -30, 13, -33); ctx.stroke(); }
  // the ice helmet with its spikes (that's why stomping does nothing)
  ctx.fillStyle = 'rgba(170,226,255,0.88)'; ctx.strokeStyle = '#2f6a9a'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(2, -56, 22, 10, 0, Math.PI, TAU); ctx.closePath(); ctx.fill(); ctx.stroke();
  for(const sx of [-12, 2, 16]){ ctx.beginPath(); ctx.moveTo(sx - 4, -62); ctx.lineTo(sx, -76); ctx.lineTo(sx + 4, -62); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-10, -63, 10, 2);
  ctx.restore();
  if(roar) outlined('!', cx, y - 26, 20, '#ff3d3d', '#ffffff', 4, FD, 400, 'center');
  if(dizzy) for(let i = 0; i < 3; i++){ const a = frame * 0.12 + i * TAU / 3; ctx.fillStyle = '#ffe066'; star(cx + Math.cos(a) * 24, y - 22 + Math.sin(a) * 5, 3.6, frame * 0.1); }
  if(p2 && frame % 8 === 0 && fxTick) particles.push({x:cx + (Math.random() - 0.5) * 30, y:y - 10, vx:0, vy:-0.6, life:30, max:30, color:'#ffffff', grav:-0.01, size:3, type:'puff', drag:0.95});
}

function drawMagpie(b){
  const x = ix(b) + (b.state === 'stuck' ? (b.shakeX || 0) : 0), y = iy(b), cx = x + b.w / 2, cy = y + b.h / 2;
  const p2 = b.phase === 2, hit = b.hitT > 0 || (b.inv > 0 && Math.floor(b.inv / 4) % 2 === 0);
  const p3 = b.phase === 3, black = hit ? '#ffffff' : '#1a1430', blue = hit ? '#ffffff' : p3 ? '#e0242a' : p2 ? '#b8306a' : '#2f5ad8';
  if(p3){ softGlow(cx, cy, 44, 34, '255,60,60', 0.25 + 0.1 * Math.sin(frame * 0.2)); if(frame % 5 === 0) particles.push({x:cx + (Math.random() - 0.5) * 36, y:cy + (Math.random() - 0.5) * 24, vx:(Math.random() - 0.5) * 1.2, vy:-0.8, life:26, max:26, color:Math.random() < 0.5 ? '#ff3d3d' : '#ffb03d', grav:-0.02, size:2.6, type:'dot'}); }
  const stuck = b.state === 'stuck', dive = b.state === 'dive', aim = b.state === 'aim';
  if(aim){
    // a dotted line to where she's about to dive
    ctx.strokeStyle = `rgba(255,80,80,${0.5 + 0.4 * Math.sin(frame * 0.5)})`; ctx.lineWidth = 2; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(b.tx + b.w / 2, b.ty + b.h / 2); ctx.stroke(); ctx.setLineDash([]);
    const my = b.ty > 150 ? FLOOR : 34;
    softGlow(b.tx + b.w / 2, my, 30, 10, '255,60,60', 0.5);
    outlined('!', cx, y - 12, 20, '#ff3d3d', '#ffffff', 4, FD, 400, 'center');
  }
  ctx.save(); ctx.translate(cx, cy);
  let ang = 0;
  if(dive) ang = Math.atan2(b.vy, Math.abs(b.vx) + 0.001) * (b.vx < 0 ? -1 : 1);
  if(stuck) ang = b.ceil ? -1.25 : 1.25;
  ctx.scale(b.face || 1, 1);
  ctx.rotate(ang);
  const flap = stuck ? Math.sin(frame * 0.8) * 0.9 : dive ? -0.9 : Math.sin(frame * 0.3) * 0.8;
  // tail
  ctx.fillStyle = black; ctx.strokeStyle = '#000000'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-42, -6 + Math.sin(frame * 0.1) * 2); ctx.lineTo(-44, 0); ctx.lineTo(-42, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = rgba(p2 ? '#ff6aa0' : '#3fe0c0', 0.75); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-40, -2); ctx.stroke();
  // back wing
  ctx.save(); ctx.translate(-2, -4); ctx.rotate(-flap);
  ctx.fillStyle = blue; ctx.beginPath(); ctx.ellipse(-10, -6, 16, 7, -0.4, 0, TAU); ctx.fill(); ctx.strokeStyle = '#0a0820'; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(-4, -6, 5, 3, -0.4, 0, TAU); ctx.fill();
  ctx.restore();
  // body
  ctx.fillStyle = black; ctx.beginPath(); ctx.ellipse(0, 0, 18, 13, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#000000'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = hit ? '#ffffff' : '#f4f2ff'; ctx.beginPath(); ctx.ellipse(2, 5, 11, 7, 0, 0, TAU); ctx.fill();
  if(p2){
    // phase 2: an armour of stolen trinkets (stomping only goes ting, a dash breaks through)
    const cols = ['#ffd54a', '#7df9ff', '#ff6aa0', '#c8ff6a', '#ffd54a'];
    for(let i = 0; i < 5; i++){
      const a = -2.55 + i * 0.42, px = Math.cos(a) * 17, py = Math.sin(a) * 12.5, s = 4.2;
      ctx.save(); ctx.translate(px, py); ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = hit ? '#ffffff' : cols[i];
      ctx.beginPath(); ctx.moveTo(0, -s * 1.5); ctx.lineTo(s, 0); ctx.lineTo(0, s * 0.6); ctx.lineTo(-s, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2a1a40'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    }
    if(Math.floor(frame / 6 + b.t) % 9 === 0){ ctx.fillStyle = '#ffffff'; star(Math.cos(-1.7) * 17, Math.sin(-1.7) * 12.5 - 4, 2.6, frame * 0.2); }
  }
  // front wing
  ctx.save(); ctx.translate(0, -2); ctx.rotate(flap * 0.8);
  ctx.fillStyle = blue; ctx.beginPath(); ctx.ellipse(-8, -2, 15, 7, -0.25, 0, TAU); ctx.fill(); ctx.strokeStyle = '#0a0820'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(-2, -2, 5, 3, -0.25, 0, TAU); ctx.fill();
  ctx.restore();
  // head and the stolen ficelle in her beak
  ctx.fillStyle = black; ctx.beginPath(); ctx.arc(16, -7, 9, 0, TAU); ctx.fill(); ctx.strokeStyle = '#000000'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(19, -9, 3.3, 0, TAU); ctx.fill();
  if(stuck){ ctx.strokeStyle = '#14082a'; ctx.lineWidth = 1; ctx.beginPath(); for(let k = 0; k < 12; k++){ const a = k * 0.7 + frame * 0.25, r = k * 0.25; ctx.lineTo(19 + Math.cos(a) * r, -9 + Math.sin(a) * r); } ctx.stroke(); }
  else { ctx.fillStyle = p2 ? '#ff2d5a' : '#14082a'; ctx.beginPath(); ctx.arc(20, -9, 1.6, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(14, -15); ctx.lineTo(22, -13); ctx.stroke();
  if(!b.lost) drawFicelle(30, -3, 26, 0.15, false, 5);
  ctx.fillStyle = '#4a4a5a'; ctx.beginPath(); ctx.moveTo(23, -8); ctx.lineTo(34, -5); ctx.lineTo(23, -3); ctx.closePath(); ctx.fill();
  ctx.restore();
  if(stuck) for(let i = 0; i < 3; i++){ const a = frame * 0.12 + i * TAU / 3; ctx.fillStyle = '#ffe066'; star(cx + Math.cos(a) * 22, (b.ceil ? y + b.h + 10 : y - 8) + Math.sin(a) * 5, 3.4, frame * 0.1); }
}


// a wooden gate takes a few shots, then bursts into planks
function hitGate(g, s){
  g.hp--; g.flash = 8;
  SFX.stomp(); addShake(2);
  crumbs(s.x + s.w / 2, s.y + s.h / 2, 4, '#c9874a');
  if(g.hp > 0) return;
  g.gone = true;
  solids = solids.filter(w => w !== g);
  for(let i = 0; i < 14; i++) particles.push({x:g.x + Math.random() * g.w, y:g.y + Math.random() * g.h, vx:(Math.random() - 0.5) * 4, vy:-2 - Math.random() * 3,
    life:50, max:50, color:i % 3 ? '#a8692e' : '#5e3517', grav:0.25, size:3 + Math.random() * 3, type:'crumb', rot:Math.random() * TAU, vr:(Math.random() - 0.5) * 0.5});
  burst(g.x + g.w / 2, g.y + g.h / 2, 10, '#ffffff', 2, 26, -0.01, 4, 'puff');
  addShake(7); SFX.crumble(); SFX.door();
  score += 50; popup(g.x + g.w / 2, g.y + 10, '+50', '#ffd54a');
  if(player.standingOn === g){ player.standingOn = null; player.onGround = false; }
}

function killFx(e){
  const bat = e.ax !== undefined;
  const col = bat ? '#6b44a8' : (CRITTER[chIndex] || '#ff8a3d');
  burst(e.x + e.w/2, e.y + e.h/2, 12, col, 3, 32, 0.18, 3, 'goo');
  burst(e.x + e.w/2, e.y + e.h/2, 6, '#ffffff', 2, 22, 0.05, 2.5, 'star');
  if(!bat) particles.push({type:'splat', x:e.x + e.w/2, y:e.y + e.h, vx:0, vy:0, life:40, max:40, color:col, grav:0, size:14});
  popup(e.x + e.w/2, e.y - 4, '+25', '#ffffff');
}

function doJump(){
  player.vy = JUMP_V * gdir;
  player.coyote = 0; player.buffer = 0; player.dashT = 0;
  player.onGround = false; player.standingOn = null; player.noCut = false;
  player.sx = 0.75; player.sy = 1.25;
  anim.wobV -= 0.35;
  dust(player.x + player.w/2, gdir > 0 ? player.y + player.h : player.y, 5);
  SFX.jump();
}

function updateParticles(){
  for(const p of particles){
    p.x += p.vx; p.y += p.vy; p.vy += p.grav;
    p.vx *= p.drag || 0.97;
    if(p.vr) p.rot += p.vr;
    p.life--;
  }
  particles = particles.filter(p => p.life > 0);
}

// floating pollen, spores or embers drawn over the scene
function makeAmbient(){
  ambient = [];
  const deco = decoOf();
  const n = deco === 'cave' ? 26 : deco === 'hills' ? 12 : deco === 'night' ? 22 : (deco === 'fortress' || deco === 'ascent') ? 34
          : deco === 'sky' ? 18 : deco === 'canyon' ? 16 : deco === 'ice' ? 46 : deco === 'nest' ? 40 : deco === 'cosmos' ? 28 : 0;
  for(let i = 0; i < n; i++) ambient.push({x:Math.random()*W, y:Math.random()*H, ph:Math.random()*6, s:0.5 + Math.random(), z:0.3 + Math.random()*0.7});
}
function updateAmbient(){
  if(!room) return;
  const deco = decoOf();
  for(const p of ambient){
    p.ph += 0.03;
    if(deco === 'hills'){ p.x += 0.35 * p.z + Math.sin(p.ph) * 0.3; p.y += 0.3 * p.z; }
    else if(deco === 'cave'){ p.x += Math.sin(p.ph) * 0.15; p.y -= 0.15 * p.z; }
    else if(deco === 'night'){ p.x += Math.sin(p.ph) * 0.2; p.y -= 0.12 * p.z; }
    else if(deco === 'sky'){ p.x += Math.sin(p.ph) * 0.3; p.y -= 0.25 * p.z * (gdir > 0 ? 1 : -1); }
    else if(deco === 'canyon'){ p.x += 0.5 + 0.6 * p.z; p.y += Math.sin(p.ph) * 0.2; }
    else if(deco === 'ice'){ p.x += Math.sin(p.ph) * 0.35 - 0.1; p.y += 0.45 + 0.5 * p.z; }
    else if(deco === 'nest'){ p.x -= 1.2 + p.z; p.y += 4 + 3 * p.z; }
    else if(deco === 'cosmos'){ p.x += Math.sin(p.ph) * 0.18 - 0.06; p.y -= 0.1 * p.z; }
    else { p.x += Math.sin(p.ph * 1.3) * 0.4; p.y -= (0.6 + p.z) * 0.8; }
    if(p.y < -10){ p.y = H + 10; p.x = Math.random() * W; }
    if(p.y > H + 10){ p.y = -10; p.x = Math.random() * W; }
    if(p.x > W + 10) p.x = -10;
    if(p.x < -10) p.x = W + 10;
  }
}

