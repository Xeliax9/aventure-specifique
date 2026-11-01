// =====================================================================
//  BOSS DEMOS: before the first fight against each boss, a little panel
//  shows how to beat it, step by step. Each step is a small looping
//  animated scene: the boss really moves, XELIAX jumps, dashes and shoots,
//  the shots fly, the hits flash. Admin: test any room or boss, replay a demo.
// =====================================================================
// stage coordinates: 236 x 168, the floor at y 160. Keys: [time, x, y, extra]
//  boss keys give its top-left corner; extra = {s:state, side, f:face, sh:shields, n:count, ph:phase, ceil}
//  hero keys give his feet; extra = {c:1} upside down on the ceiling, {d:1} dashing
//  fx: ['shot', t0, t1, x0, y0, x1, y1, colour] · ['hit', t, x, y, text] · ['pop', t, x, y, text]
//      ['acid', t, x] · ['plat', x, y, w] · ['lava', y0, y1] · ['heart', t, x, y] · ['wall'] · ['ceil']
const DY = '#ffd54a', DR = '#ff4f5e', DG = '#8be04a', DW = '#e8f6ff';
const shotsAt = (ts, x0, y0, x1, y1, col = DY, fly = 14) => ts.map(t => ['shot', t, t + fly, x0, y0, x1, y1, col]);
const BOSS_DEMO = {
  slime:[
    {t:'Le Roi Gluant saute partout : écarte-toi quand il retombe.', move:'Esquive', dur:200,
      boss:[[0,140,112],[20,120,52],[40,100,112],[60,80,52],[80,60,112],[110,80,52],[130,100,112],[150,120,52],[170,140,112],[200,140,112]],
      hero:[[0,30,160],[30,30,160],[70,200,160],[130,200,160],[170,30,160],[200,30,160]]},
    {t:'Saute-lui sur la tête ! Il faut le toucher 3 fois.', move:'Saute dessus', dur:180,
      boss:[[0,100,112],[180,100,112]],
      hero:[[0,30,160],[20,40,160],[42,90,60],[58,132,112],[76,160,40],[100,200,160],[180,200,160]],
      fx:[['hit',58,132,112,'Touché !']]},
    {t:'Phase 2 : il saute plus vite et plus loin. Attends qu\'il retombe, puis saute-lui dessus.', move:'Saute dessus', dur:200, base:{ph:2},
      boss:[[0,30,112],[18,70,40],[36,110,112],[54,150,40],[72,170,112],[200,170,112]],
      hero:[[0,20,160],[95,30,160],[112,120,40],[124,202,112],[142,150,30],[170,70,160],[200,70,160]],
      fx:[['hit',124,202,112,'Touché !']]},
  ],
  swoop:[
    {t:'Le Gardien plonge vers toi depuis le ciel : écarte-toi au bon moment.', move:'Esquive', dur:200,
      boss:[[0,140,16,{s:'hover'}],[40,140,16,{s:'warn'}],[60,140,16,{s:'dive'}],[85,40,120,{s:'dive'}],[100,40,120,{s:'stunned'}],[150,40,120,{s:'stunned'}],[180,140,16,{s:'hover'}],[200,140,16,{s:'hover'}]],
      hero:[[0,60,160],[55,60,160],[78,190,160],[200,190,160]]},
    {t:'Quand il s\'écrase au sol, il est sonné : saute-lui dessus !', move:'Saute dessus', dur:200,
      boss:[[0,150,16,{s:'hover'}],[30,90,120,{s:'dive'}],[40,90,120,{s:'stunned'}],[120,90,120,{s:'stunned'}],[150,150,16,{s:'hover'}],[200,150,16,{s:'hover'}]],
      hero:[[0,200,160],[50,190,160],[68,150,70],[82,118,120],[96,170,60],[116,200,160],[200,200,160]],
      fx:[['hit',82,118,120,'Touché !']]},
    {t:'Phase 2 : des piques sortent au milieu. Quand il rase le sol, monte sur une plateforme, puis saute-lui dessus.', move:'Plateforme', dur:220, base:{ph:2},
      boss:[[0,240,120,{s:'sweep',f:-1}],[60,-70,120,{s:'sweep',f:-1}],[90,150,16,{s:'hover'}],[110,120,120,{s:'dive'}],[120,120,120,{s:'stunned'}],[200,120,120,{s:'stunned'}],[220,240,120,{s:'sweep'}]],
      hero:[[0,65,64],[125,65,64],[140,110,30],[156,148,120],[172,180,60],[195,200,160],[220,200,160]],
      fx:[['plat',30,64,70],['hit',156,148,120,'Touché !']]},
  ],
  arena:[
    {t:'Le Seigneur Pourpre vole et lance des boules de feu : bouge sans arrêt.', move:'Esquive', dur:200,
      boss:[[0,180,30],[50,170,60],[100,180,30],[150,170,60],[200,180,30]],
      hero:[[0,40,160],[35,40,160],[60,100,160],[100,100,160],[125,40,160],[200,40,160]],
      fx:[...shotsAt([10],190,50,45,150,DR,36),...shotsAt([80],190,70,105,150,DR,36),...shotsAt([150],190,50,45,150,DR,36)]},
    {t:'Monte sur une plateforme à sa hauteur et tire-lui dessus ! Il ne prend qu\'un tir par seconde : 8 tirs en tout.', move:'Tire ×8', dur:200,
      boss:[[0,175,40],[100,180,55],[200,175,40]],
      hero:[[0,90,80],[200,90,80]],
      fx:[['plat',50,80,90],...shotsAt([10,70,130],102,64,176,64),['hit',24,182,64,'Touché !'],['hit',84,182,64,'Touché !'],['hit',144,182,64,'Touché !']]},
    {t:'De temps en temps, il change de côté : suis-le. À mi-combat, un cœur apparaît sur la plateforme du haut.', move:'Suis-le', dur:220,
      boss:[[0,180,40],[60,180,40],[110,20,40],[220,20,40]],
      hero:[[0,40,160],[100,40,160],[140,190,160],[220,190,160]],
      fx:[['pop',62,180,30,'Il change de côté !'],['plat',90,60,60],['heart',150,112,40]]},
  ],
  ascent:[
    {t:'Phase 2 : tu commences sur la petite plateforme du milieu, au-dessus d\'un sol de lave. Va à gauche ou à droite pour esquiver.', move:'Esquive', dur:220,
      boss:[[0,100,10],[60,140,20],[120,60,10],[220,100,10]],
      hero:[[0,118,140],[40,118,140],[60,70,95],[75,40,130],[120,40,130],[140,90,95],[160,118,140],[180,170,95],[195,196,130],[220,196,130]],
      fx:[['lava',158,158],['plat',100,140,36],['plat',15,130,50],['plat',172,130,50],...shotsAt([30],120,30,118,130,DR,30),...shotsAt([150],80,30,40,120,DR,30)]},
    {t:'Tes tirs partent vers le haut : place-toi sous lui et tire ! Toutes les 10 secondes, il lance une attaque spéciale : trouve le trou.', move:'Tire en haut', dur:200,
      boss:[[0,100,10],[200,100,10]],
      hero:[[0,118,140],[200,118,140]],
      fx:[['lava',158,158],['plat',100,140,36],['plat',15,130,50],['plat',172,130,50],...shotsAt([10,60,110],118,110,118,40),['hit',24,120,40,'Touché !'],['hit',74,120,40,'Touché !'],
        ...[0,1,2,3,4,5].filter(i => i !== 2).map(i => ['shot',140,195,20 + i * 40,0,20 + i * 40,165,DR])]},
    {t:'Vaincu ! La lave déborde et te propulse sur une plateforme : grimpe vite, elle monte très vite jusqu\'à la ficelle !', move:'Grimpe !', dur:220,
      hero:[[0,118,140],[20,118,140],[50,60,70],[80,60,70],[100,150,40],[130,150,40],[150,90,10],[220,90,10]],
      fx:[['lava',160,40],['plat',100,140,36],['plat',35,70,50],['plat',125,40,50],['plat',65,10,50]]},
  ],
  gecko:[
    {t:'Le Gecko Géant colle aux murs et crache de l\'acide : esquive les gouttes vertes.', move:'Esquive', dur:200, base:{s:'crawl',side:-1},
      boss:[[0,6,40],[100,6,90],[200,6,40]],
      hero:[[0,150,160],[40,200,160],[100,120,160],[160,200,160],[200,150,160]],
      fx:[['wall'],...shotsAt([20],46,60,150,160,DG,28),...shotsAt([90],46,110,200,160,DG,28),...shotsAt([150],46,70,120,160,DG,28)]},
    {t:'Phase 1 : il bondit d\'un mur à l\'autre, puis tombe au sol, sonné. Saute-lui dessus !', move:'Saute dessus', dur:220,
      boss:[[0,6,60,{s:'crawl',side:-1}],[25,6,60,{s:'runDrop',side:-1,rdir:1}],[50,190,40,{s:'crawl',side:1}],[85,190,40,{s:'crawl',side:1}],[86,190,40,{s:'drop',side:1}],[110,150,120,{s:'stun',side:1}],[220,150,120,{s:'stun',side:1}]],
      hero:[[0,60,160],[115,60,160],[135,120,80],[150,170,120],[168,200,60],[190,215,160],[220,215,160]],
      fx:[['wall'],['hit',150,170,120,'Touché !']]},
    {t:'Phase 2 : quand il est sur un mur, tire-lui dessus 5 fois pour le sonner (les points au-dessus de lui comptent).', move:'Tire ×5', dur:210, base:{ph:2,side:-1},
      boss:[[0,6,62,{s:'crawl',n:0}],[34,6,62,{s:'crawl',n:1}],[64,6,62,{s:'crawl',n:2}],[94,6,62,{s:'crawl',n:3}],[124,6,62,{s:'crawl',n:4}],[154,6,62,{s:'stuckUp',n:0}],[175,6,30,{s:'stuck'}],[210,6,30,{s:'stuck'}]],
      hero:[[0,150,100],[210,150,100]],
      fx:[['wall'],['plat',110,100,90],...shotsAt([20,50,80,110,140],138,84,48,84),['pop',156,30,40,'Il est sonné !']]},
    {t:'Sonné, il reste collé en haut du mur : grimpe le mur en sauts de mur, puis saute-lui dessus !', move:'Saut de mur', dur:200, base:{ph:2,side:-1},
      boss:[[0,6,30,{s:'stuck'}],[200,6,30,{s:'stuck'}]],
      hero:[[0,80,160],[15,17,150],[32,52,118],[49,17,104],[66,52,72],[83,17,58],[100,26,30],[116,80,4],[140,120,160],[200,120,160]],
      fx:[['wall'],['hit',100,26,30,'Touché !']]},
    {t:'Toutes les 15 secondes, il descend et laisse de l\'acide 5 secondes sur le sol : accroche-toi aux murs ou monte sur une plateforme.', move:'En hauteur !', dur:220, base:{ph:2},
      boss:[[0,6,60,{s:'prep',side:-1}],[45,6,60,{s:'prep',side:-1}],[46,6,60,{s:'runDrop',side:-1}],[60,6,120,{s:'run',rdir:1}],[115,190,120,{s:'run',rdir:1}],[116,190,120,{s:'climb',side:1}],[200,190,50,{s:'climb',side:1}],[220,190,50,{s:'crawl',side:1}]],
      hero:[[0,130,160],[30,130,160],[45,130,90],[220,130,90]],
      fx:[['wall'],['plat',95,90,70],['pop',2,26,40,'Il va descendre !'],...[0,1,2,3,4].map(i => ['acid',60 + i * 11,20 + i * 40])]},
  ],
  yeti:[
    {t:'Le Yéti rugit, puis charge vers toi : saute par-dessus !', move:'Saute', dur:200,
      boss:[[0,170,106,{s:'roar',f:-1}],[40,170,106,{s:'charge',f:-1}],[95,26,106,{s:'charge',f:-1}],[96,26,106,{s:'dizzy',f:-1}],[200,26,106,{s:'dizzy',f:-1}]],
      hero:[[0,90,160],[60,90,160],[72,100,70],[86,110,160],[200,110,160]],
      fx:[['hit',96,14,130,'Boum !']]},
    {t:'Il s\'assomme contre le mur. Ses boucliers de glace le protègent : casse-les au tir (3 tirs, ou 1 super tir).', move:'Tire ×3', dur:180, base:{s:'dizzy',f:-1},
      boss:[[0,30,106,{sh:3}],[34,30,106,{sh:2}],[64,30,106,{sh:1}],[94,30,106,{sh:0}],[180,30,106,{sh:0}]],
      hero:[[0,170,160],[180,170,160]],
      fx:[...shotsAt([20,50,80],160,140,96,140),['pop',96,56,96,'Bouclier brisé !']]},
    {t:'Plus de bouclier ? Fonce-lui dedans avec le dash pendant qu\'il est sonné !', move:'Dash !', dur:180, base:{s:'dizzy',f:-1,sh:0},
      boss:[[0,30,106],[180,30,106]],
      hero:[[0,180,160],[40,180,160],[41,175,160,{d:1}],[56,88,160,{d:1}],[57,88,160],[75,130,110],[95,170,160],[180,170,160]],
      fx:[['hit',56,82,130,'Touché !']]},
    {t:'Phase 2 (5 points de vie) : il saute sur ta plateforme et des stalactites tombent. Regarde leurs ombres au sol !', move:'Esquive', dur:220, base:{ph:2},
      boss:[[0,30,106,{s:'walk',f:1}],[50,30,106,{s:'walk',f:1}],[80,150,36,{s:'walk',f:1}],[140,150,36,{s:'perch',f:-1}],[170,40,106,{s:'walk',f:1}],[220,30,106,{s:'walk',f:1}]],
      hero:[[0,175,90],[35,175,90],[50,130,40],[70,80,160],[220,80,160]],
      fx:[['plat',140,90,70],['shot',120,160,60,-20,60,160,DW],['shot',140,180,200,-20,200,160,DW]]},
  ],
  magpie:[
    {t:'Phase 1 : le foin est trop mou. Retourne la gravité avec les bords ou les orbes : elle plongera vers le plafond et s\'y coincera.', move:'Gravité', dur:220,
      boss:[[0,110,60,{s:'hover'}],[90,110,60,{s:'hover'}],[120,120,6,{s:'dive',ceil:true}],[121,120,6,{s:'stuck',ceil:true}],[220,120,6,{s:'stuck',ceil:true}]],
      hero:[[0,60,160],[30,12,160],[55,12,6,{c:1}],[80,40,6,{c:1}],[220,40,6,{c:1}]],
      fx:[['ceil'],['pop',40,12,90,'Gravité !'],['pop',122,140,40,'Coincée !']]},
    {t:'Quand elle est coincée, fonce-lui dedans avec le dash : elle est poussée jusqu\'au bord du nid et s\'y écrase.', move:'Dash !', dur:200, base:{ceil:true},
      boss:[[0,100,6,{s:'stuck'}],[40,100,6,{s:'stuck'}],[41,100,6,{s:'pushed'}],[70,182,6,{s:'pushed'}],[71,182,6,{s:'dazed'}],[200,182,6,{s:'dazed'}]],
      hero:[[0,30,6,{c:1}],[30,30,6,{c:1}],[31,34,6,{c:1,d:1}],[41,78,6,{c:1,d:1}],[42,78,6,{c:1}],[60,60,6,{c:1}],[200,60,6,{c:1}]],
      fx:[['ceil'],['hit',41,100,26],['hit',71,230,26,'Sonnée !']]},
    {t:'Elle est sonnée : tire-lui dessus ! 10 tirs = 1 point de vie. Lui sauter dessus ne sert à rien.', move:'Tire ×10', dur:200, base:{ceil:true,s:'dazed'},
      boss:[[0,182,6,{n:10}],...[1,2,3,4,5,6,7,8,9,10].map(i => [10 + i * 16,182,6,{n:10 - i}]),[200,182,6,{n:10}]],
      hero:[[0,110,6,{c:1}],[200,110,6,{c:1}]],
      fx:[['ceil'],...shotsAt([0,1,2,3,4,5,6,7,8,9].map(i => i * 16 + 12),122,18,182,18,DY,12),['hit',172,206,26,'Touché !']]},
    {t:'Si elle reprend ses esprits avant, pas grave : les tirs déjà mis comptent encore la fois suivante.', move:'Recommence', dur:200, base:{ceil:true},
      boss:[[0,182,6,{s:'dazed',n:10}],[26,182,6,{s:'dazed',n:9}],[42,182,6,{s:'dazed',n:8}],[58,182,6,{s:'dazed',n:7}],[74,182,6,{s:'dazed',n:6}],[100,182,6,{s:'dazed',n:6}],[101,182,6,{s:'hover',ceil:false}],[140,150,60,{s:'hover',ceil:false}],[200,150,60,{s:'hover',ceil:false}]],
      hero:[[0,110,6,{c:1}],[200,110,6,{c:1}]],
      fx:[['ceil'],...shotsAt([12,28,44,60],122,18,182,18),['pop',102,190,40,'Elle se réveille…'],['pop',150,160,110,'Encore 6 tirs !']]},
    {t:'Phase 2 : elle plonge du côté opposé au tien. Phase 3 : elle enchaîne les plongeons, très vite. Courage !', move:'Courage !', dur:200, base:{ph:3,s:'dive'},
      boss:[[0,90,40,{s:'hover'}],[30,90,40,{s:'aim'}],[50,20,120],[70,180,10],[90,60,120],[110,120,6,{s:'stuck',ceil:true}],[200,120,6,{s:'stuck',ceil:true}]],
      hero:[[0,200,160],[40,200,160],[60,150,160],[100,150,160],[200,150,160]]},
  ],
};

// sample a list of keys at time t: smooth position, the extra of the last key passed
function demoSample(keys, t){
  if(!keys || !keys.length) return null;
  let i = 0;
  while(i < keys.length - 1 && keys[i + 1][0] <= t) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const k = b[0] > a[0] ? clamp((t - a[0]) / (b[0] - a[0]), 0, 1) : 0, e = k * k * (3 - 2 * k);
  return {x:lerp(a[1], b[1], e), y:lerp(a[2], b[2], e), ex:a[3] || {}, vx:b[1] - a[1]};
}

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

const DEMO_STAGE = {x:84, y:96, w:236, h:168};
function demoBoss(mode, st, T){
  const real = room.boss || {}, w = real.w || 40, h = real.h || 40, S = DEMO_STAGE;
  const p = demoSample(st.boss, T);
  if(!p) return null;
  const ex = Object.assign({}, st.base || {}, p.ex);
  const b = {mode, w, h, alive:true, appear:1, phase:ex.ph || 1, hp:3, maxHp:3, inv:0, hitT:0, t:frame, face:ex.f || (p.vx < 0 ? -1 : 1),
    state:ex.s || 'hover', side:ex.side || -1, rdir:ex.rdir || 1, ceil:!!ex.ceil, cdir:ex.f || -1,
    shotsLeft:mode === 'magpie' ? (ex.n === undefined ? MAGPIE_SHOTS : ex.n || MAGPIE_SHOTS) : MAGPIE_SHOTS,
    shots:mode === 'gecko' ? (ex.n || 0) : 0, shL:ex.sh === undefined ? YETI_SHIELD : ex.sh, shR:ex.sh === undefined ? YETI_SHIELD : ex.sh,
    stT:120, fireT:40, spin:frame * 0.45, squash:ex.sq || 0, onGround:true, enrage:1, warn:[], vx:p.vx, vy:0, lost:false, tx:S.x + 120, ty:S.y + 6};
  b.x = S.x + p.x; b.y = S.y + p.y;
  if(mode === 'slime'){ b.onGround = p.y >= 111; b.squash = b.onGround ? 0.12 * Math.sin(frame * 0.3) : -0.1; }
  return b;
}

function drawBossDemo(){
  if(!bossDemo) return;
  const d = bossDemo, st = d.steps[d.i], k = easeOutCubic(clamp(d.t / 14, 0, 1)), S = DEMO_STAGE;
  const T = d.t % (st.dur || 200);
  ctx.save();
  ctx.fillStyle = 'rgba(8,4,24,0.62)'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = Math.min(1, d.t / 8 + (d.i > 0 ? 1 : 0));
  const px = 64, py = 46, pw = W - 128, ph = 268;
  rr(px, py, pw, ph, 18); ctx.fillStyle = 'rgba(24,16,58,0.97)'; ctx.fill(); ctx.strokeStyle = '#ffd54a'; ctx.lineWidth = 2; ctx.stroke();
  txt('Comment battre ' + (room.boss.name || 'le boss'), W / 2, py + 30, 17, '#ffd54a', 700);
  // ---- the little stage
  ctx.save();
  rr(S.x, S.y, S.w, S.h, 12); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.clip();
  const fx = st.fx || [], X = x => S.x + x, Y = y => S.y + y;
  const lava = fx.find(f => f[0] === 'lava');
  if(!lava){ ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(S.x, S.y + S.h - 8, S.w, 8); }
  if(fx.some(f => f[0] === 'wall')){ ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(S.x, S.y, 6, S.h); ctx.fillRect(S.x + S.w - 6, S.y, 6, S.h); }
  if(fx.some(f => f[0] === 'ceil')){ ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(S.x, S.y, S.w, 6); ctx.fillStyle = 'rgba(255,120,200,0.35)'; ctx.fillRect(S.x, S.y, 4, S.h); ctx.fillRect(S.x + S.w - 4, S.y, 4, S.h); }
  for(const f of fx) if(f[0] === 'plat'){ ctx.fillStyle = '#c9a26a'; rr(X(f[1]), Y(f[2]), f[3], 7, 3); ctx.fill(); ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 1; ctx.stroke(); }
  for(const f of fx) if(f[0] === 'acid' && T >= f[1]){ const g = Math.min(1, (T - f[1]) / 8); ctx.fillStyle = `rgba(110,220,60,${0.85 * g})`; ctx.beginPath(); ctx.ellipse(X(f[2]) + 20, Y(160) - 1, 20, 4 * g, 0, 0, TAU); ctx.fill(); }
  for(const f of fx) if(f[0] === 'heart' && T >= f[1]){ ctx.fillStyle = '#ff5c7a'; const hx = X(f[2]), hy = Y(f[3]) + Math.sin(frame * 0.1) * 2; ctx.beginPath(); ctx.arc(hx - 4, hy, 5, 0, TAU); ctx.arc(hx + 4, hy, 5, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.moveTo(hx - 9, hy + 2); ctx.lineTo(hx, hy + 11); ctx.lineTo(hx + 9, hy + 2); ctx.fill(); }
  // the boss
  const fake = demoBoss(d.mode, st, T), real = boss;
  if(fake){ boss = fake; try { drawBoss(); } catch(e){} boss = real; }
  // XELIAX
  const hp = demoSample(st.hero, T);
  if(hp){
    const hx = X(hp.x), hy = Y(hp.y), up = !!hp.ex.c;
    if(hp.ex.d){ ctx.fillStyle = 'rgba(160,220,255,0.5)'; for(let i = 1; i < 4; i++){ ctx.beginPath(); ctx.ellipse(hx - Math.sign(hp.vx || 1) * i * 10, hy + (up ? 14 : -14), 9, 7, 0, 0, TAU); ctx.fill(); } }
    ctx.save(); ctx.translate(hx, hy); if(up) ctx.scale(1, -1); if(hp.vx < 0) ctx.scale(-1, 1);
    drawHero(demoHero, 0, 0, 1, {armed:true});
    ctx.restore();
  }
  // shots, hits and words
  for(const f of fx){
    if(f[0] === 'shot' && T >= f[1] && T <= f[2]){
      const q = (T - f[1]) / Math.max(1, f[2] - f[1]), sx = lerp(X(f[3]), X(f[5]), q), sy = lerp(Y(f[4]), Y(f[6]), q);
      ctx.fillStyle = f[7] || DY; ctx.beginPath(); ctx.arc(sx, sy, f[7] === DY || !f[7] ? 3 : 4.5, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 1; ctx.stroke();
    }
    if(f[0] === 'hit' && T >= f[1] && T < f[1] + 22){
      const q = (T - f[1]) / 22; ctx.strokeStyle = `rgba(255,255,255,${1 - q})`; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(X(f[2]), Y(f[3]), 6 + q * 22, 0, TAU); ctx.stroke();
      for(let i = 0; i < 5; i++){ const a = i * TAU / 5 + q; ctx.fillStyle = `rgba(255,228,90,${1 - q})`; star(X(f[2]) + Math.cos(a) * q * 20, Y(f[3]) + Math.sin(a) * q * 20, 3.5, a); }
    }
    if((f[0] === 'hit' || f[0] === 'pop') && f[4] && T >= f[1] && T < f[1] + 50){
      const q = (T - f[1]) / 50; ctx.globalAlpha = 1 - q * q;
      outlined(f[4], clamp(X(f[2]), S.x + 50, S.x + S.w - 50), Y(f[3]) - 14 - q * 14, 12, '#ffe58a', '#2a1a4a', 4, FU, 700, 'center');
      ctx.globalAlpha = 1;
    }
  }
  if(lava){
    const ly = Y(lerp(lava[1], lava[2], T / (st.dur || 200)));
    const g = ctx.createLinearGradient(0, ly, 0, ly + 40); g.addColorStop(0, '#ffd27a'); g.addColorStop(0.2, '#ff7a2a'); g.addColorStop(1, '#a8200c');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(S.x, S.y + S.h);
    for(let x = 0; x <= S.w; x += 8) ctx.lineTo(S.x + x, ly + Math.sin(x * 0.08 + frame * 0.1) * 2);
    ctx.lineTo(S.x + S.w, S.y + S.h); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  // loop progress under the stage, and the move to make
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; rr(S.x, S.y + S.h + 4, S.w, 3, 1.5); ctx.fill();
  ctx.fillStyle = '#ffd54a'; rr(S.x, S.y + S.h + 4, S.w * T / (st.dur || 200), 3, 1.5); ctx.fill();
  outlined(st.move, S.x + S.w / 2, S.y + S.h + 28, 18, '#ffffff', '#3a2a80', 5, FD, 400, 'center');
  // ---- the explanation bubble
  const bx = S.x + S.w + 22, bw = px + pw - 22 - bx, by = S.y;
  rr(bx, by, bw, 150, 14); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#1d1442'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + 1, by + 40); ctx.lineTo(bx - 12, by + 52); ctx.lineTo(bx + 1, by + 62); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
  txt('Étape ' + (d.i + 1) + ' / ' + d.steps.length, bx + 14, by + 24, 12.5, '#7a62d8', 700, 'left');
  ctx.font = `600 13.5px ${FU}`;
  const words = st.t.split(' '), lines = []; let line = '';
  for(const w of words){ const tst = line ? line + ' ' + w : w; if(ctx.measureText(tst).width > bw - 28 && line){ lines.push(line); line = w; } else line = tst; }
  if(line) lines.push(line);
  lines.slice(0, 6).forEach((l, i) => txt(l, bx + 14, by + 46 + i * 17 + (1 - k) * 6, 13.5, '#1d1442', 600, 'left'));
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
