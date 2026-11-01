// =====================================================================
//  BOSS DEMOS: before the first fight against each boss, a little panel
//  shows how to beat it, step by step (the boss in the right pose, XELIAX,
//  the move to make). Admin: test any room or any boss, and replay a demo.
// =====================================================================

// each step: the text, the boss pose (state, phase…), where XELIAX stands, and the move to make
const BOSS_DEMO = {
  slime:[
    {t:'Le Roi Gluant saute partout : reste loin de lui quand il retombe.', pose:{}, hero:'left', move:'Esquive'},
    {t:'Saute-lui sur la tête ! Il faut le toucher 3 fois.', pose:{}, hero:'top', move:'Saute dessus'},
    {t:'Phase 2 : il est plus rapide. Continue de lui sauter sur la tête.', pose:{phase:2}, hero:'top', move:'Saute dessus'},
  ],
  swoop:[
    {t:'Le Gardien plonge vers toi depuis le ciel : écarte-toi au bon moment.', pose:{state:'hover'}, hero:'left', move:'Esquive'},
    {t:'Quand il s\'écrase au sol, il est sonné : saute-lui dessus !', pose:{state:'stun', ground:true}, hero:'top', move:'Saute dessus'},
    {t:'Phase 2 : des piques sortent au milieu. S\'il rase le sol, monte sur une plateforme, puis saute-lui dessus.', pose:{state:'hover', phase:2}, hero:'top', move:'Plateforme'},
  ],
  arena:[
    {t:'Le Seigneur Pourpre vole et lance des boules de feu : bouge sans arrêt.', pose:{}, hero:'left', move:'Esquive'},
    {t:'Tire-lui dessus ! Il ne prend qu\'un tir par seconde : 8 tirs en tout.', pose:{}, hero:'left', move:'Tire ×8'},
    {t:'À mi-combat, un cœur apparaît sur la plateforme du haut.', pose:{}, hero:'left', move:'+1 vie'},
  ],
  ascent:[
    {t:'L\'Ascension : grimpe sans t\'arrêter, le sol brûle sous tes pieds !', pose:{}, hero:'left', move:'Grimpe'},
    {t:'Toutes les 10 secondes, il lance une attaque spéciale : cherche le trou dans la pluie de feu, les anneaux ou la spirale.', pose:{}, hero:'left', move:'Esquive'},
    {t:'Tire-lui dessus dès que tu peux : 12 tirs pour le battre.', pose:{}, hero:'left', move:'Tire ×12'},
  ],
  gecko:[
    {t:'Le Gecko Géant colle aux murs et crache de l\'acide : esquive les gouttes vertes.', pose:{state:'crawl', side:-1, wall:true}, hero:'right', move:'Esquive'},
    {t:'Phase 1 : après deux bonds d\'un mur à l\'autre, il tombe au sol, sonné. Saute-lui dessus !', pose:{state:'stun', ground:true}, hero:'top', move:'Saute dessus'},
    {t:'Phase 2 : quand il est sur un mur, tire-lui dessus 5 fois pour le sonner.', pose:{state:'crawl', side:-1, wall:true, phase:2, shots:3}, hero:'right', move:'Tire ×5'},
    {t:'Sonné, il reste collé en haut du mur : grimpe le mur en sauts de mur et saute-lui dessus !', pose:{state:'stuck', side:-1, wall:true, phase:2, high:true}, hero:'wall', move:'Saut de mur'},
    {t:'Toutes les 15 secondes, il descend et laisse de l\'acide 5 secondes : accroche-toi aux murs ou monte sur une plateforme.', pose:{state:'run', ground:true, phase:2, rdir:1}, hero:'high', move:'En hauteur !'},
  ],
  yeti:[
    {t:'Le Yéti rugit, puis charge vers toi : saute par-dessus !', pose:{state:'roar'}, hero:'right', move:'Saute'},
    {t:'Il s\'assomme contre le mur. Mais ses boucliers de glace le protègent : casse-les au tir (3 tirs, ou 1 super tir).', pose:{state:'dizzy', shields:2}, hero:'right', move:'Tire'},
    {t:'Plus de bouclier ? Fonce-lui dedans avec le dash pendant qu\'il est sonné !', pose:{state:'dizzy', shields:0}, hero:'right', move:'Dash !'},
    {t:'Phase 2 (5 points de vie) : il saute sur ta plateforme et des stalactites tombent. Regarde les ombres au sol.', pose:{state:'walk', phase:2}, hero:'high', move:'Esquive'},
  ],
  magpie:[
    {t:'Phase 1 : le foin est trop mou. Retourne la gravité (bords, orbes) pour qu\'elle plonge vers le plafond et s\'y coince.', pose:{state:'stuck', ceil:true}, hero:'ceil', move:'Gravité'},
    {t:'Quand elle est coincée, fonce-lui dedans avec le dash : elle va s\'écraser contre le bord du nid.', pose:{state:'pushed', ceil:true}, hero:'ceil', move:'Dash !'},
    {t:'Elle est sonnée : tire-lui dessus ! 10 tirs = 1 point de vie. Lui sauter dessus ne sert à rien.', pose:{state:'dazed', ceil:true, shots:6}, hero:'ceil', move:'Tire ×10'},
    {t:'Si elle reprend ses esprits avant, pas grave : les tirs déjà mis comptent encore la fois suivante.', pose:{state:'dazed', ceil:true, shots:3}, hero:'ceil', move:'Recommence'},
    {t:'Phase 2 : elle plonge du côté opposé au tien. Phase 3 : elle enchaîne les plongeons, très vite !', pose:{state:'hover', phase:3}, hero:'left', move:'Courage !'},
  ],
};

let bossDemo = null;
const demoHero = makeCharAnim();
function startBossDemo(mode){
  if(!BOSS_DEMO[mode]) return;
  bossDemo = {mode, i:0, t:0, steps:BOSS_DEMO[mode]};
  demoHero.appear = 1;
  SFX.menu();
}
// the first time a boss is met (and from the admin page): show its demo before the fight
function maybeBossDemo(force){
  if(!room || !room.boss) return;
  const m = room.boss.mode;
  if(!save.demoSeen) save.demoSeen = {};
  if(!force && save.demoSeen[m]) return;
  save.demoSeen[m] = true; persist();
  startBossDemo(m);
}
function updateBossDemo(){
  const d = bossDemo;
  d.t++;
  stepCharAnim(demoHero, {ground:true, vx:0});
  if(d.t < 12) return;
  if(input.jumpPressed || input.shootPressed || input.dashPressed || input.demoNext){
    input.demoNext = false;
    d.i++; d.t = 0; SFX.menu();
    if(d.i >= d.steps.length){ bossDemo = null; }
  }
}

function demoBossObject(mode, pose, k){
  const real = room.boss || {};
  const w = real.w || 40, h = real.h || 40;
  const b = {mode, w, h, alive:true, appear:1, phase:pose.phase || 1, hp:3, maxHp:3, inv:0, hitT:0, t:frame, face:pose.face || -1,
    state:pose.state || 'hover', side:pose.side || -1, rdir:pose.rdir || 1, ceil:!!pose.ceil, shotsLeft:pose.shots !== undefined ? MAGPIE_SHOTS - pose.shots : MAGPIE_SHOTS,
    shots:pose.state === 'crawl' ? (pose.shots || 0) : 0, shL:pose.shields === undefined ? YETI_SHIELD : pose.shields, shR:pose.shields === undefined ? YETI_SHIELD : pose.shields,
    stT:120, fireT:40, spin:frame * 0.45, squash:0, onGround:true, enrage:1, warn:[], vx:0, vy:0, lost:false};
  // placed in the little stage (screen coordinates)
  const S = DEMO_STAGE;
  if(pose.wall){ b.x = S.x + 6; b.y = pose.high ? S.y + 14 : S.y + S.h / 2 - h / 2; }
  else if(pose.ceil){ b.x = pose.state === 'dazed' ? S.x + S.w - w - 34 : S.x + S.w / 2 - w / 2 + (pose.state === 'pushed' ? Math.sin(frame * 0.05) * 30 : 0); b.y = S.y + 6; }
  else if(pose.ground || mode === 'slime' || mode === 'yeti'){ b.x = S.x + S.w / 2 - w / 2 + 20; b.y = S.y + S.h - 8 - h; }
  else { b.x = S.x + S.w / 2 - w / 2 + 30; b.y = S.y + 30 + Math.sin(frame * 0.05) * 6; }
  return b;
}
const DEMO_STAGE = {x:84, y:96, w:236, h:168};

function drawBossDemo(){
  if(!bossDemo) return;
  const d = bossDemo, st = d.steps[d.i], k = easeOutCubic(clamp(d.t / 14, 0, 1)), S = DEMO_STAGE;
  ctx.save();
  // darken the arena behind
  ctx.fillStyle = 'rgba(8,4,24,0.62)'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = Math.min(1, d.t / 8 + (d.i > 0 ? 1 : 0));
  // the panel
  const px = 64, py = 46, pw = W - 128, ph = 268;
  rr(px, py, pw, ph, 18); ctx.fillStyle = 'rgba(24,16,58,0.97)'; ctx.fill(); ctx.strokeStyle = '#ffd54a'; ctx.lineWidth = 2; ctx.stroke();
  txt('Comment battre ' + (room.boss.name || 'le boss'), W / 2, py + 30, 17, '#ffd54a', 700);
  // the little stage
  ctx.save();
  rr(S.x, S.y, S.w, S.h, 12); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(S.x, S.y + S.h - 8, S.w, 8);
  if(st.pose.wall || st.hero === 'wall'){ ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(S.x, S.y, 6, S.h); }
  if(st.pose.ceil || st.hero === 'ceil'){ ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(S.x, S.y, S.w, 6); }
  if(d.mode === 'gecko' && st.pose.state === 'run'){
    // the acid trail
    for(let i = 0; i < 5; i++){ ctx.fillStyle = 'rgba(110,220,60,0.8)'; ctx.beginPath(); ctx.ellipse(S.x + 30 + i * 40, S.y + S.h - 9, 18, 4, 0, 0, TAU); ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,0.22)'; rr(S.x + 140, S.y + 70, 70, 8, 4); ctx.fill();
  }
  // the boss
  const fake = demoBossObject(d.mode, st.pose, k), real = boss;
  boss = fake; try { drawBoss(); } catch(e){} boss = real;
  // XELIAX
  let hx = S.x + 60, hy = S.y + S.h - 8, flip = false;
  if(st.hero === 'right'){ hx = S.x + S.w - 50; }
  if(st.hero === 'top'){ hx = fake.x + fake.w / 2; hy = fake.y - 6 - Math.abs(Math.sin(frame * 0.08)) * 24; }
  if(st.hero === 'wall'){ hx = S.x + 20; hy = fake.y + 120 - Math.abs(Math.sin(frame * 0.07)) * 34; }
  if(st.hero === 'high'){ hx = S.x + 175; hy = S.y + 70; }
  if(st.hero === 'ceil'){ hx = st.pose.state === 'dazed' ? S.x + 90 : S.x + 50 + (st.pose.state === 'pushed' ? Math.sin(frame * 0.05) * 30 : 0); hy = S.y + 6; flip = true; }
  ctx.save(); ctx.translate(hx, hy); if(flip) ctx.scale(1, -1);
  drawHero(demoHero, 0, 0, 1, {armed:true});
  ctx.restore();
  ctx.restore();
  // the move to make
  outlined(st.move, S.x + S.w / 2, S.y + S.h + 26, 18, '#ffffff', '#3a2a80', 5, FD, 400, 'center');
  // the explanation bubble, wrapped
  const bx = S.x + S.w + 22, bw = px + pw - 22 - bx, by = S.y;
  rr(bx, by, bw, 150, 14); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#1d1442'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + 1, by + 40); ctx.lineTo(bx - 12, by + 52); ctx.lineTo(bx + 1, by + 62); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
  txt('Étape ' + (d.i + 1) + ' / ' + d.steps.length, bx + 14, by + 24, 12.5, '#7a62d8', 700, 'left');
  ctx.font = `600 14px ${FU}`;
  const words = st.t.split(' '), lines = []; let line = '';
  for(const w of words){ const tst = line ? line + ' ' + w : w; if(ctx.measureText(tst).width > bw - 28 && line){ lines.push(line); line = w; } else line = tst; }
  if(line) lines.push(line);
  lines.slice(0, 6).forEach((l, i) => txt(l, bx + 14, by + 48 + i * 18 + (1 - k) * 6, 14, '#1d1442', 600, 'left'));
  // progress dots and the hint
  for(let i = 0; i < d.steps.length; i++){ ctx.fillStyle = i <= d.i ? '#ffd54a' : 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(bx + bw / 2 - (d.steps.length - 1) * 7 + i * 14, by + 168, 4, 0, TAU); ctx.fill(); }
  const blink = 0.6 + 0.4 * Math.sin(frame * 0.12);
  txt(d.i + 1 < d.steps.length ? 'Saut / clic : étape suivante' : 'Saut / clic : au combat !', bx + bw / 2, by + 196, 12.5, `rgba(255,213,74,${blink})`, 600, 'center');
  ctx.restore();
}

// ---------------------------------------------------------------- admin: test a room or a boss
const testSel = {ch:0, room:0, boss:0};
function bossList(){
  const out = [];
  CHAPTERS.forEach((c, ci) => c.rooms.forEach((r, ri) => { if(r.boss) out.push({ci, ri, name:r.boss.name + (r.boss.mode === 'ascent' ? ' (Ascension)' : ''), mode:r.boss.mode, tag:chapterTag(ci, ri)}); }));
  return out;
}
function chapterTag(ci, ri){
  const c = CHAPTERS[ci];
  if(c.bonus) return 'Bonus ' + (ri + 1);
  return (c.season === 2 ? 'S2 ' + c.num : 'S1 ' + (ci + 1)) + '-' + (ri + 1);
}
// start a run straight into one room, with every power the player would have by then
function testRoom(ci, ri, demo){
  if(fadeDir !== 0) return;
  initAudio();
  newRun(ci);
  const c = CHAPTERS[ci];
  for(let k = 0; k < ri; k++) for(const p of (c.rooms[k].powerUps || [])){
    if(p.type === 'doubleJump') hasDJ = true; if(p.type === 'shoot') canShoot = true;
    if(p.type === 'wall') hasWall = true; if(p.type === 'dash'){ hasDash = true; hasDJ = true; }
  }
  if(ri > 0) loadRoom(ci, ri);
  if(demo) maybeBossDemo(true);
  showToast('Test admin : ' + chapterTag(ci, ri) + ' ' + c.rooms[ri].name, 120);
}
function testRows(){
  const chs = CHAPTERS.map((c, i) => i);
  testSel.ch = clamp(testSel.ch, 0, CHAPTERS.length - 1);
  const rooms = CHAPTERS[testSel.ch].rooms;
  testSel.room = clamp(testSel.room, 0, rooms.length - 1);
  const bl = bossList(); testSel.boss = clamp(testSel.boss, 0, bl.length - 1);
  const bs = bl[testSel.boss];
  return [
    {kind:'choice', id:'tch', label:'Chapitre', options:chs, get:() => testSel.ch, set:v => { testSel.ch = v; testSel.room = 0; },
      fmt:v => { const c = CHAPTERS[v]; return (c.bonus ? 'Bonus' : c.season === 2 ? 'S2 ' + c.num : 'S1 ' + (v + 1)) + ' · ' + c.name; }},
    {kind:'choice', id:'troom', label:'Salle', options:rooms.map((r, i) => i), get:() => testSel.room, set:v => { testSel.room = v; },
      fmt:v => (v + 1) + ' · ' + rooms[v].name},
    {kind:'action', id:'tgo', label:'Lancer cette salle', act:() => testRoom(testSel.ch, testSel.room, false)},
    {kind:'choice', id:'tboss', label:'Boss', options:bl.map((b, i) => i), get:() => testSel.boss, set:v => { testSel.boss = v; }, fmt:v => bl[v].tag + ' · ' + bl[v].name},
    {kind:'action', id:'tfight', label:'Combattre ce boss', act:() => testRoom(bs.ci, bs.ri, false)},
    {kind:'action', id:'tdemo', label:'Voir sa démo, puis le combattre', act:() => testRoom(bs.ci, bs.ri, true)},
  ];
}
