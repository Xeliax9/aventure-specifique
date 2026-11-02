// =====================================================================
//  DRAW: INTERFACE
// =====================================================================
const STORY = [
  'La ficelle aux olives a disparu. XELIAX part à sa recherche.',
  'Des miettes de pain mènent sous la terre.',
  "Une odeur d'olive flotte en haut de la Tour.",
  'La ficelle aux olives est au sommet de la Forteresse.',
  'Le défi des étoiles : une ficelle dorée attend au sommet.',
  'Une pie voleuse a chipé la ficelle aux olives ! Elle file vers le ciel.',
  'La pie s\'est cachée au fond des gorges. Il va falloir grimper !',
  'Des plumes noires sur la glace… elle n\'est plus très loin.',
  'Le nid de la pie est là-haut, au cœur de l\'orage.',
  'Gravité, murs et dash : une ficelle de cristal flotte au bout du cosmos.',
];
const chName = i => CHAPTERS[i].bonus ? 'Bonus secret' : CHAPTERS[i].season === 2 ? `Saison 2 · Chapitre ${CHAPTERS[i].num}` : `Chapitre ${i + 1}`;
const roomTag = () => CHAPTERS[chIndex].bonus ? `${CHAPTERS[chIndex].bonus2 ? 'B2' : 'B'}-${rIndex + 1}` : CHAPTERS[chIndex].season === 2 ? `S2 ${CHAPTERS[chIndex].num}-${rIndex + 1}` : `${chIndex + 1}-${rIndex + 1}`;
// how much of the ficelle recipe the people of the world have taught XELIAX
function recipeCount(){ return save.recipe.filter(Boolean).length; }
function gemsOf(season){ return (season === 2 ? save.gems.slice(S2_FIRST, S2_END + 1) : save.gems.slice(0, 4)).filter(Boolean).length; }
function recipeShort(){ const n = recipeCount(); return n === 4 ? 'complète !' : `${n} étape${n > 1 ? 's' : ''} sur 4`; }
function recipeText(){ const n = recipeCount(); return n === 4 ? 'recette complète' : `recette : ${n} étape${n > 1 ? 's' : ''} sur 4`; }

function heading(text, x, y, size, color, align='center', shadow=true){
  ctx.font = `400 ${size}px ${FD}`;
  ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  if(shadow){ ctx.fillStyle = 'rgba(8,4,24,0.5)'; ctx.fillText(text, x + 1.2, y + 2.2); }
  ctx.fillStyle = color; ctx.fillText(text, x, y);
}

function pill(x, y, w, h){
  rr(x, y, w, h, h / 2);
  ctx.fillStyle = 'rgba(14,9,34,0.62)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.lineWidth = 1; ctx.stroke();
}

function drawHUD(){
  if(isSpeedrun() && state === 'play'){ drawSrHud(); return; }   // speedrun: the big timer, no hearts
  const top = 8, hh = 24;
  const slots = Math.min(8, Math.max(startLives(), lives));
  const heartsW = 14 + slots * 15 + (lives > 8 ? 24 : 0);
  pill(8, top, heartsW, hh);
  for(let i = 0; i < slots; i++){
    const cx = 22 + i * 15, cy = top + 6;
    let s = 12;
    if(i === hud.gainIdx && hud.gainT > 0) s *= 1 + Math.sin(hud.gainT * Math.PI) * 0.6;
    if(lives === 1 && i === 0) s *= 1 + Math.max(0, Math.sin(frame * 0.2)) * 0.18;
    const full = i < lives;
    heartIcon(cx, cy + (12 - s) / 2, s, full ? '#ff4d6d' : 'rgba(255,255,255,0.14)', full ? '#5a0d24' : 'rgba(255,255,255,0.18)');
    if(full){ ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(cx - 2.6, cy + 2.4, 1.5, 1, -0.5, 0, TAU); ctx.fill(); }
    if(i === hud.lostIdx && hud.lostT > 0){
      const k = 1 - hud.lostT;
      ctx.save(); ctx.globalAlpha = hud.lostT;
      ctx.translate(cx, cy + 6 + k * 10); ctx.rotate(k * 0.8);
      heartIcon(-2, -6, 12, '#ff4d6d', '#5a0d24');
      ctx.restore();
    }
  }
  if(lives > 8) txt('x' + lives, 22 + slots * 15, top + 16.5, 12, '#ffffff', 700, 'left');

  let x = 8 + heartsW + 6;
  ctx.font = `700 12.5px ${FU}`;
  const coinText = `${chCoins}/${chCoinsTotal}`;
  const cw = 34 + ctx.measureText(coinText).width;
  pill(x, top, cw, hh);
  const bump = 1 + Math.sin(hud.coinBump * Math.PI) * 0.35;
  hud.coinX = x + 13; hud.coinY = top + hh / 2;
  ctx.save(); ctx.translate(hud.coinX, hud.coinY); ctx.scale(bump, bump);
  coinIcon(0, 0, 6.5, Math.cos(frame * 0.05));
  ctx.restore();
  ctx.save(); ctx.translate(x + 24, top + 16.5); ctx.scale(1 + hud.coinBump * 0.12, 1 + hud.coinBump * 0.12);
  txt(coinText, 0, 0, 12.5, '#ffffff', 700, 'left');
  ctx.restore();
  x += cw + 6;

  const badges = [];
  if(hasDJ) badges.push('dj');
  else if(room && room.noDJ) badges.push('djx');
  if(canShoot) badges.push('shoot');
  if(hasWall) badges.push('wall');
  if(hasDash) badges.push('dash');
  if(gdir < 0) badges.push('grav');
  if(hasKey) badges.push('key');
  if(chGem) badges.push('gem');
  if(badges.length){
    const bw = 8 + badges.length * 20;
    pill(x, top, bw, hh);
    badges.forEach((b, i) => {
      const bx = x + 14 + i * 20, by = top + hh / 2;
      if(b === 'dj' || b === 'djx'){
        ctx.save(); if(b === 'djx') ctx.globalAlpha = 0.35;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for(const dy of [2.2, -2.2]){ ctx.beginPath(); ctx.moveTo(bx - 4, by + dy + 2); ctx.lineTo(bx, by + dy - 2); ctx.lineTo(bx + 4, by + dy + 2); ctx.strokeStyle = POWER_COLORS.doubleJump; ctx.lineWidth = 2; ctx.stroke(); }
        ctx.restore();
        if(b === 'djx'){ ctx.strokeStyle = '#ff5d6c'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx - 6, by + 6); ctx.lineTo(bx + 6, by - 6); ctx.stroke(); }
      } else if(b === 'shoot'){
        ctx.beginPath(); ctx.moveTo(bx + 1, by - 6); ctx.lineTo(bx - 4, by + 1); ctx.lineTo(bx, by + 1); ctx.lineTo(bx - 1.5, by + 6); ctx.lineTo(bx + 4, by - 1); ctx.lineTo(bx, by - 1); ctx.closePath();
        ctx.fillStyle = POWER_COLORS.shoot; ctx.fill();
      } else if(b === 'wall'){
        wallIcon(bx, by, 0.85);
      } else if(b === 'dash'){
        ctx.save(); ctx.globalAlpha = player.dashReady && player.dashCD <= 0 ? 1 : 0.35; dashIcon(bx, by, 0.85, POWER_COLORS.dash); ctx.restore();
      } else if(b === 'grav'){
        ctx.strokeStyle = POWER_COLORS.gravity; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(bx, by + 6); ctx.lineTo(bx, by - 5); ctx.moveTo(bx - 4, by - 1); ctx.lineTo(bx, by - 6); ctx.lineTo(bx + 4, by - 1); ctx.stroke();
      } else if(b === 'key'){
        ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(bx - 3, by, 3.4, 0, TAU); ctx.fill(); ctx.fillRect(bx - 1, by - 1.2, 7, 2.4); ctx.fillRect(bx + 3.5, by, 1.6, 3);
      } else gemIcon(bx, by, 5.5, POWER_COLORS.gem);
    });
  }

  const label = roomTag();
  const timeStr = SET.timer ? fmt(elapsed) : '';
  ctx.font = `700 12px ${FU}`;
  const lw = ctx.measureText(label).width;
  const tw = 19 + lw + 10 + timeStr.length * 6.6 + (SET.timer ? 8 : 0) + (muted ? 16 : 0);
  const tx = W - 8 - tw;
  pill(tx, top, tw, hh);
  ctx.fillStyle = CH_ACCENT[chIndex]; ctx.beginPath(); ctx.arc(tx + 12, top + hh / 2, 3.5, 0, TAU); ctx.fill();
  txt(label, tx + 19, top + 16.5, 12, '#ffffff', 700, 'left');
  ctx.font = `600 12.5px ${FU}`; ctx.fillStyle = timerRunning || elapsed > 0 ? '#ffffff' : 'rgba(255,255,255,0.45)';
  if(SET.timer) monoText(timeStr, W - 16, top + 16.5, 6.6);
  if(muted){
    const mx = tx + 19 + lw + 10, my = top + hh / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.moveTo(mx - 4, my - 2); ctx.lineTo(mx - 1, my - 2); ctx.lineTo(mx + 2, my - 5); ctx.lineTo(mx + 2, my + 5); ctx.lineTo(mx - 1, my + 2); ctx.lineTo(mx - 4, my + 2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ff6b8a'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(mx - 5, my + 5); ctx.lineTo(mx + 5, my - 5); ctx.stroke();
  }

  if(boss && boss.alive && !boss.fleeing){
    const bw = 236, bx = W / 2 - bw / 2, by = top + hh + 8;
    pill(bx - 10, by - 3, bw + 20, 32);
    const phaseTag = boss.mode === 'ascent' ? 'Phase 2' : 'Phase ' + (boss.phase || 1);
    txt(boss.name, bx + 2, by + 10, 11.5, '#ffd6e0', 700, 'left');
    txt(phaseTag, bx + bw - 2, by + 10, 10.5, 'rgba(255,214,224,0.75)', 600, 'right');
    rr(bx, by + 15, bw, 8, 4); ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fill();
    if(hud.bossTrail > 0.001){ rr(bx, by + 15, bw * hud.bossTrail, 8, 4); ctx.fillStyle = '#ffffff'; ctx.fill(); }
    if(hud.bossShown > 0.001){
      rr(bx, by + 15, bw * hud.bossShown, 8, 4);
      const g = ctx.createLinearGradient(0, by + 15, 0, by + 23);
      g.addColorStop(0, boss.inv > 0 && (boss.mode === 'arena' || boss.mode === 'ascent') ? '#c9d6ff' : '#ff7a90');
      g.addColorStop(1, boss.inv > 0 && (boss.mode === 'arena' || boss.mode === 'ascent') ? '#8ea2e0' : '#e0244a');
      ctx.fillStyle = g; ctx.fill();
    }
    ctx.fillStyle = 'rgba(14,9,34,0.75)';
    for(let i = 1; i < boss.maxHp; i++) ctx.fillRect(bx + bw * i / boss.maxHp - 0.75, by + 15, 1.5, 8);
  }
}

function drawFlyers(){
  for(const f of flyers){
    const t = easeInCubic(f.t);
    const tx = hud.coinX, ty = hud.coinY;
    const mx = (f.sx + tx) / 2, my = Math.min(f.sy, ty) - 60;
    const x = (1 - t) * (1 - t) * f.sx + 2 * (1 - t) * t * mx + t * t * tx;
    const y = (1 - t) * (1 - t) * f.sy + 2 * (1 - t) * t * my + t * t * ty;
    coinIcon(x, y, 6 * (1 - 0.35 * t), Math.cos(frame * 0.3));
  }
}

function drawBanner(){
  if(state !== 'play' || bannerT <= 0) return;
  const max = rIndex === 0 ? 240 : 150, t = max - bannerT;
  if(rIndex === 0){
    const a = Math.min(clamp(t / 20, 0, 1), clamp(bannerT / 24, 0, 1));
    ctx.save();
    ctx.globalAlpha = a;
    const band = ctx.createLinearGradient(0, 0, W, 0);
    band.addColorStop(0, 'rgba(10,6,26,0)'); band.addColorStop(0.18, 'rgba(10,6,26,0.62)'); band.addColorStop(0.82, 'rgba(10,6,26,0.62)'); band.addColorStop(1, 'rgba(10,6,26,0)');
    ctx.fillStyle = band; ctx.fillRect(0, 84, W, 144);
    txt(chName(chIndex), W / 2, 110, 13, CH_ACCENT[chIndex], 600);
    // the chapter name rises into place letter by letter
    const name = chapter.name;
    ctx.font = `400 38px ${FD}`;
    const ws = [...name].map(ch => ctx.measureText(ch).width);
    let x = W / 2 - ws.reduce((p, c) => p + c, 0) / 2;
    [...name].forEach((ch, i) => {
      const k = easeOutCubic(clamp((t - 6 - i * 1.5) / 18, 0, 1));
      ctx.save(); ctx.globalAlpha = a * k;
      heading(ch, x + ws[i] / 2, 152 + (1 - k) * 12, 38, '#ffffff');
      ctx.restore();
      x += ws[i];
    });
    txt(room.name, W / 2, 176, 13, '#ddd6ff', 500);
    const k2 = clamp((t - 30) / 20, 0, 1);
    ctx.globalAlpha = a * k2;
    txt(STORY[chIndex] || '', W / 2, 203, 13.5, '#f3ead6', 500);
    if(chIndex === 0 && !timerRunning){ ctx.globalAlpha = a * k2 * 0.85; txt('Le chrono démarre à ton premier mouvement', W / 2, 221, 11.5, '#bfb6f0', 500); }
    ctx.restore();
  } else {
    const inP = easeOutCubic(clamp(t / 18, 0, 1)), outP = easeInCubic(clamp(1 - bannerT / 18, 0, 1));
    const bx = lerp(-290, 16, inP) - outP * 310, by = 78;
    ctx.save();
    rr(bx, by, 268, 46, 14); ctx.fillStyle = 'rgba(14,8,34,0.74)'; ctx.fill();
    ctx.strokeStyle = rgba(CH_ACCENT[chIndex], 0.7); ctx.lineWidth = 1.2; ctx.stroke();
    txt(room.label || `Salle ${roomTag()}`, bx + 16, by + 18, 11.5, CH_ACCENT[chIndex], 600, 'left');
    heading(room.name, bx + 16, by + 38, 17, '#ffffff', 'left');
    ctx.restore();
  }
}

function drawToast(){
  if(toast.t <= 0 || state !== 'play') return;
  const el = toast.max - toast.t;
  const inP = clamp(el / 14, 0, 1), outA = clamp(toast.t / 12, 0, 1);
  ctx.font = `600 13px ${FU}`;
  const tw = ctx.measureText(toast.text).width + 36;
  // messages drop in under the HUD (or under the boss bar) so they never cover XELIAX
  const baseY = state === 'play' && boss && boss.alive && !boss.fleeing ? 94 : 52;
  const y = baseY - 22 * (1 - easeOutCubic(inP));
  ctx.save();
  ctx.globalAlpha = outA * Math.min(1, inP * 2);
  rr(W / 2 - tw / 2, y - 16, tw, 26, 13); ctx.fillStyle = 'rgba(14,9,34,0.86)'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = CH_ACCENT[chIndex];
  ctx.beginPath(); ctx.arc(W / 2 - tw / 2 + 13, y - 3, 3.5, 0, TAU); ctx.fill();
  txt(toast.text, W / 2 + 7, y + 1.5, 13, '#ffffff', 600);
  ctx.restore();
}

function keycap(label, x, y){
  ctx.font = `700 11px ${FU}`;
  const w = Math.max(19, ctx.measureText(label).width + 13);
  rr(x, y - 14, w, 19, 5); ctx.fillStyle = '#f4f1ff'; ctx.fill();
  ctx.strokeStyle = '#b9aee8'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = 'rgba(29,20,66,0.25)'; rr(x, y + 2, w, 3, 2); ctx.fill();
  txt(label, x + w / 2, y, 11, '#1d1442', 700);
  return w;
}
const PROMPT_KEY = {'◀':'arrowleft', '▶':'arrowright', '▲':'arrowup', '▼':'arrowdown', 'Espace':' ', 'Échap':'escape'};
// a centred row of keycaps and words, e.g. [Espace] jouer
function promptLine(items, y, color='#ffffff'){
  const kw = it => { ctx.font = `700 11px ${FU}`; return Math.max(19, ctx.measureText(it.key).width + 13); };
  const tw = it => { ctx.font = `500 12.5px ${FU}`; return ctx.measureText(it.text).width; };
  const widths = items.map(it => it.key ? kw(it) : it.gap ? it.gap : tw(it));
  const total = widths.reduce((a, b) => a + b, 0) + (items.length - 1) * 6;
  let x = W / 2 - total / 2;
  items.forEach((it, i) => {
    if(it.key){
      keycap(it.key, x, y);
      // dans les menus, les touches dessinées sont de vrais boutons : un clic fait comme la touche
      const k = PROMPT_KEY[it.key];
      if(k && state === 'title' && menu.t >= 1 && !menu.splash) hit(x - 3, y - 17, widths[i] + 6, 25, {id:'pk:' + it.key, click:() => menuKey(k)});
    }
    else if(it.text) txt(it.text, x, y, 12.5, color, 500, 'left');
    x += widths[i] + 6;
  });
}

// =====================================================================
//  MENUS
//  A home page with the big title and XELIAX, the chapters laid out like
//  apps on a phone (swipe left and right), settings like a phone's
//  settings app, rolling credits, and a secret bonus folder hidden in the
//  settings. Every menu page lives in the 'title' state.
// =====================================================================
const ALL_MAIN = CHAPTERS.map((c, i) => i).filter(i => !CHAPTERS[i].bonus);
// la saison 2 n'apparaît dans le menu qu'une fois la saison 1 finie (ou si on l'a déjà commencée, ou en mode créateur)
const s2Visible = () => SET.creator || save.bestCh[STORY_END] != null || save.unlocked2 > 1 || ALL_MAIN.some(i => CHAPTERS[i].season === 2 && save.bestCh[i] != null);
const MAIN_CH = [];
function refreshMainCh(){ MAIN_CH.length = 0; for(const i of ALL_MAIN) if(CHAPTERS[i].season !== 2 || s2Visible()) MAIN_CH.push(i); }
refreshMainCh();
const BONUS_CH = CHAPTERS.map((c, i) => i).filter(i => CHAPTERS[i].bonus);
const PAGE_PARENT = {chapters:'home', settings:'home', son:'settings', jeu:'settings', look:'settings', controls:'settings', bonus:'settings', test:'settings'};
const PAGE_DIM = {home:0, settings:0.5, son:0.56, jeu:0.56, look:0.44, controls:0.58, credits:0.62, bonus:0.4, test:0.56};
const PAGE_NAME = {home:'Accueil', chapters:'Chapitres', settings:'Paramètres', son:'Son', jeu:'Jeu', look:'Couleur de XELIAX', controls:'Commandes', credits:'Crédits', bonus:'Bonus secret', test:'Tester (admin)'};
const TAGLINE = ['Là où tout commence', 'Le Roi Gluant t\'attend sous terre', 'Grimpe jusqu\'au Gardien', 'La ficelle est tout en haut',
  'Le défi des étoiles', 'La gravité s\'inverse !', 'Glisse et saute sur les murs', 'Le dash, enfin !', 'Rattrape la pie voleuse', 'Le défi des pouvoirs'];
const menu = {
  page:'home', from:null, t:1, dir:1,
  sel:{home:0, settings:0, son:0, jeu:0, look:0, controls:0, bonus:0, test:0}, bindWait:null,
  scroll:0, drag:null, down:null, hits:[], wheel:0, wheelT:-99, bgFlash:0, nudge:0, shakeT:0,
  introT:0, mx:470, my:200, pointerT:999, knobs:{}, fx:[],
  bubble:null, bubbleT:80, saidHi:false, fly:null, flyT:420,
  resetT:0, creditsFrom:'home', credY:0, credFast:false, secret:'', taps:0, tapT:0,
};
const homeHero = makeCharAnim(), creditsHero = makeCharAnim();
const creditNpcs = ['farine', 'gaston', 'olivia', 'levain'].map((who, i) => ({who, t:i * 1.7, blink:0}));
const APP = {size:92, step:136, seasonGap:0, y:166};
const appIndex = i => MAIN_CH.indexOf(i);
const appPos = k => k * APP.step + (MAIN_CH[k] >= S2_FIRST ? APP.seasonGap : 0);
const HOME_BTN = [{label:'Jouer', y:184, h:46}, {label:'Paramètres', y:242, h:36}, {label:'Crédits', y:288, h:36}];
const HOME_X = 176, HOME_BW = 212, HERO_X = 470, HERO_Y = 292;
const LIST = {x:150, y:80, w:340, rh:34};
const LIVES_NAME = {3:'3 (difficile)', 5:'5 (normal)', 7:'7 (facile)', 9:'9 (très facile)'};
const PAGE_FOOT = {
  settings:() => 'L\'aventure spécifique, un jeu de xeliax9',
  son:() => 'Le son démarre dès que tu appuies sur une touche.',
  test:() => 'Gauche / droite pour choisir, Entrée pour lancer.',
  jeu:() => SET.creatorFound ? 'Le mode créateur ouvre tout, sans toucher à ta vraie progression.' : 'Les vies et le chrono comptent dès la prochaine partie.',
};

function defaultChapter(){
  return save.lastSeason === 2 && s2Visible() ? S2_FIRST + Math.min(3, save.unlocked2 - 1) : Math.min(save.unlocked - 1, STORY_END);
}
function nearestApp(s){
  let best = 0, bd = 1e9;
  MAIN_CH.forEach((c, k) => { const d = Math.abs(appPos(k) - s); if(d < bd){ bd = d; best = k; } });
  return best;
}

// ---------------------------------------------------------------- navigation
function goPage(p, dir = 1){
  menu.splash = null;
  if(menu.page === p) return;
  menu.from = menu.page; menu.page = p; menu.t = REDUCED ? 1 : 0; menu.dir = dir;
  menu.drag = null; menu.down = null; menu.hits = []; menu.credFast = false; menu.bindWait = null;
  if(p === 'chapters'){
    refreshMainCh();
    if(!MAIN_CH.includes(menuSel)) menuSel = defaultChapter();
    if(chIndex !== menuSel || rIndex !== 0) loadRoom(menuSel, 0);
    menu.scroll = appPos(appIndex(menuSel)) + dir * 150;
  }
  if(p === 'bonus' && !save.bonusFolderSeen){ save.bonusFolderSeen = true; persist(); }
  if(p === 'credits'){ menu.credY = 190; if(dir > 0) menu.creditsFrom = menu.from; menu.taps = 0; menu.secret = ''; }
  if(p === 'look'){ menu.sel.look = Math.max(0, SKINS.indexOf(skinOf())); titleHero.appear = 0; }
  if(p === 'jeu') menu.resetT = 0;
  if(menu.t >= 1) menu.from = null;
  SFX.menu();
}
function goBack(){
  const p = menu.page === 'credits' ? menu.creditsFrom : PAGE_PARENT[menu.page];
  if(p) goPage(p, -1);
}

// ---------------------------------------------------------------- home page
function homeFocus(d){ menu.sel.home = (menu.sel.home + d + 4) % 4; SFX.menu(); }
// démo en ligne : ce qui n'est pas dans la démo le dit, sans ouvrir la page
function demoNo(){ showToast('Pas disponible dans la démo', 110); SFX.hurt(); menu.shakeT = 12; }
function homeActivate(i){
  if(demoOn() && i > 1){ demoNo(); return; }   // démo : Paramètres s'ouvre (Son, Jeu, Commandes), pas Crédits ni XELIAX
  if(i === 0){ homeHero.hop = 1; goPage('chapters'); }
  else if(i === 1) goPage('settings');
  else if(i === 2) goPage('credits');
  else openPetFromHome();
}
function openPetFromHome(){
  if(fadeDir !== 0) return;
  if(demoOn()){ demoNo(); return; }
  homeHero.hop = 1; homeHero.wobV += 0.8; setFace(homeHero, 'open', 30);
  SFX.bloop(); transition(openPet);
}
const HOME_LINES = ['Prêt pour l\'aventure ?', 'J\'ai une faim… d\'olives.', 'Clique sur moi, pour voir !', 'La pie n\'a qu\'à bien se tenir !',
  'Coucou xeliax9 !', 'Allez, encore une partie !', 'Tu as fouillé les paramètres ?', 'Des ressorts, des orbes, des murs… j\'adore !'];
function homeLine(){
  if(!menu.saidHi){ menu.saidHi = true; return 'Salut ! On joue ?'; }
  if(bonusVisible() && !save.bonusFolderSeen && Math.random() < 0.6) return 'Psst… les paramètres cachent un secret !';
  const pool = HOME_LINES.slice();
  if(SET.skin !== 'indigo') pool.push('Tu aimes ma nouvelle couleur ?');
  if(save.s2Done) pool.push('Ma ficelle est bien rangée. Personne n\'y touche !');
  return pick(pool);
}

// ---------------------------------------------------------------- chapters page (the apps)
function selectApp(i, quiet){
  if(i === menuSel) return;
  menuSel = i; loadRoom(i, 0); menu.bgFlash = 1;
  if(quiet) tone(1100, 0.025, 'triangle', 0.02); else SFX.menu();
}
function menuMove(d){
  const k = appIndex(menuSel), n = clamp(k + d, 0, MAIN_CH.length - 1);
  if(k < 0){ selectApp(defaultChapter()); return; }
  if(n === k){ menu.nudge = d * 30; SFX.thud(); return; }     // a little bounce at the ends, like a phone
  selectApp(MAIN_CH[n]);
}
function switchSeason(s){
  if(seasonOf(menuSel) === s) return;
  if(s === 2 && !s2Visible()){ menu.nudge = 30; SFX.thud(); return; }   // pas encore de saison 2
  selectApp(s === 2 ? S2_FIRST + Math.min(3, save.unlocked2 - 1) : Math.min(save.unlocked - 1, STORY_END));
}
function lockText(i){
  const c = CHAPTERS[i];
  if(demoOn() && (c.bonus || c.season === 2 || i > 1)) return 'Pas disponible dans la démo';
  if(c.bonus) return c.bonus2 ? 'Finis la saison 2 pour débloquer ce bonus' : 'Finis la saison 1 pour débloquer ce bonus';
  return 'Termine le chapitre précédent pour le débloquer';
}
function playChapter(i){
  if(fadeDir !== 0) return;
  if(isUnlocked(i)){ initAudio(); newRun(i); return; }
  showToast(lockText(i), 110); SFX.hurt(); menu.shakeT = 18;
}

// ---------------------------------------------------------------- settings
function settingsRows(){
  const rows = [
    {kind:'link', id:'son', label:'Son', icon:'sound', tile:'#ff4f7b', to:'son', value:SET.sound ? `${SET.vol * 10} %` : 'coupé'},
    {kind:'link', id:'jeu', label:'Jeu', icon:'game', tile:'#2fbf62', to:'jeu', value:`${SET.lives} vies`},
    {kind:'link', id:'look', label:'Couleur de XELIAX', icon:'hero', tile:skinOf().light, to:'look', value:skinOf().name},
    {kind:'link', id:'controls', label:'Commandes', icon:'keys', tile:'#3a8dff', to:'controls'},
    {kind:'link', id:'credits', label:'Crédits', icon:'star', tile:'#ff9f0a', to:'credits', value:'xeliax9'},
  ];
  rows.push({kind:'action', id:'admin', icon:'keys', tile:'#55507a', label:SET.creator ? 'Admin connecté : se déconnecter' : 'Connexion admin', act:() => {
    if(SET.creator){ setSetting('creator', false); showToast('Admin déconnecté', 90); SFX.menu(); } else openAdmin();
  }});
  if(SET.creator) rows.push({kind:'link', id:'test', label:'Tester une salle ou un boss', icon:'game', tile:'#ffb020', to:'test'});
  if(bonusVisible()) rows.push({kind:'link', id:'bonus', label:'Bonus secret', icon:'secret', tile:'#c9930e', to:'bonus',
    value:`${BONUS_CH.filter(isUnlocked).length * 2} défis`, badge:!save.bonusFolderSeen});
  // démo : seuls Son, Jeu et Commandes s'ouvrent ; le reste dit « Pas disponible dans la démo »
  if(demoOn()) for(const r of rows) if(!['son', 'jeu', 'controls', 'admin'].includes(r.id)){ r.demoOff = true; r.value = 'Démo 🔒'; r.badge = false; }
  return rows;
}
function sonRows(){
  return [
    {kind:'toggle', id:'sound', label:'Effets sonores', get:() => SET.sound, set:v => { setSetting('sound', v); if(v){ initAudio(); SFX.coin(); } }},
    {kind:'slider', id:'vol', label:'Volume', min:0, max:10, get:() => SET.vol, set:v => { setSetting('vol', v); if(!SET.sound) setSetting('sound', true); initAudio(); SFX.coin(); }, fmt:v => `${v * 10} %`},
    {kind:'action', id:'test', label:'Écouter un petit air', act:() => { initAudio(); if(!SET.sound) setSetting('sound', true); SFX.win(); }},
  ];
}
function jeuRows(){
  const rows = [
    {kind:'choice', id:'lives', label:'Vies au départ', options:[3, 5, 7, 9], get:() => SET.lives, set:v => setSetting('lives', v), fmt:v => LIVES_NAME[v]},
    {kind:'toggle', id:'timer', label:'Chronomètre à l\'écran', get:() => SET.timer, set:v => setSetting('timer', v)},
    {kind:'toggle', id:'shake', label:'L\'écran tremble', get:() => SET.shake, set:v => { setSetting('shake', v); if(v) addShake(5); }},
    {kind:'toggle', id:'reduced', label:'Animations réduites', get:() => SET.reduced, set:v => setSetting('reduced', v)},
    {kind:'toggle', id:'fps', label:'Afficher les images par seconde', get:() => !!SET.fps, set:v => setSetting('fps', v)},
    {kind:'toggle', id:'autoJump', label:'Garder le saut appuyé : saute en boucle', get:() => !!SET.autoJump, set:v => setSetting('autoJump', v)},
  ];
  if(SET.creatorFound) rows.push({kind:'toggle', id:'creator', label:'Mode créateur : tout ouvrir', accent:'#ffd54a', get:() => SET.creator,
    set:v => { setSetting('creator', v); showToast(v ? 'Mode créateur : tout est ouvert !' : 'Mode créateur coupé', 100); if(v) SFX.power(); }});
  rows.push({kind:'action', id:'reset', danger:true, label:menu.resetT > 0 ? 'Sûr ? Appuie encore pour tout effacer' : 'Effacer la progression', act:resetProgress});
  return rows;
}
function pageRows(p){ return p === 'settings' ? settingsRows() : p === 'son' ? sonRows() : p === 'jeu' ? jeuRows() : p === 'test' ? testRows() : []; }
function rowActivate(r){
  if(!r) return;
  if(r.demoOff){ demoNo(); return; }
  if(r.kind === 'link') goPage(r.to, 1);
  else if(r.kind === 'toggle'){ r.set(!r.get()); SFX.menu(); }
  else if(r.kind === 'choice') rowAdjust(r, 1);
  else if(r.kind === 'action') r.act();
}
function rowAdjust(r, d){
  if(!r) return;
  if(r.demoOff){ if(d > 0) demoNo(); return; }
  if(r.kind === 'toggle'){ const v = d > 0; if(r.get() !== v){ r.set(v); SFX.menu(); } }
  else if(r.kind === 'slider'){ const v = clamp(r.get() + d, r.min, r.max); if(v !== r.get()) r.set(v); }
  else if(r.kind === 'choice'){ const o = r.options, j = o.indexOf(r.get()); r.set(o[((j < 0 ? 0 : j) + d + o.length) % o.length]); SFX.menu(); }
  else if(r.kind === 'link' && d > 0) goPage(r.to, 1);
}
const sliderX = () => [LIST.x + LIST.w - 172, LIST.x + LIST.w - 64];
function sliderSet(r, px){
  const [a, b] = sliderX();
  if(px < a - 14 || px > b + 14) return false;
  const v = Math.round(clamp((px - a) / (b - a), 0, 1) * r.max);
  if(v !== r.get()) r.set(v);
  return true;
}
function rowClick(r, px){
  if(r.kind === 'slider'){ sliderSet(r, px); return; }
  rowActivate(r);
}
function resetProgress(){
  if(menu.resetT <= 0){ menu.resetT = 220; SFX.warn(); return; }
  menu.resetT = 0;
  const keep = save.settings;
  for(const k of Object.keys(save)) delete save[k];
  Object.assign(save, freshSave());
  save.settings = keep;
  persist(); applySettings();
  menuSel = defaultChapter(); loadRoom(menuSel, 0);
  showToast('Progression effacée : on repart de zéro !', 130);
  SFX.crumble(); addShake(6);
}
const skinHint = s => s.price ? `${s.price} pièces : clique pour l'acheter (tu en as ${save.bank})` : s.gems ? `Trouve ${s.gems} gemmes 💎 pour la débloquer (tu en as ${gemCount()})` : s.lock === 'gold' ? 'Gagne la ficelle dorée (bonus « Les Étoiles »)' : 'Gagne la ficelle de cristal (bonus « Le Cosmos »)';
function buySkin(s){
  if(!s.price || skinOpen(s)) return false;
  if(save.bank < s.price){ showToast(`Il te faut ${s.price} pièces (tu en as ${save.bank}). Ramasse-en dans les niveaux !`, 130); SFX.hurt(); return true; }
  save.bank -= s.price; save.owned = save.owned || {}; save.owned[s.id] = true; persist();
  setSetting('skin', s.id); titleHero.hop = 1; titleHero.wobV += 0.6;
  showToast(`${s.name} achetée ! XELIAX adore sa nouvelle couleur`, 130); SFX.key(); confetti(196, 200, 30);
  return true;
}
function lookPick(d){
  const n = SKINS.length;
  menu.sel.look = (menu.sel.look + d + n) % n;
  const s = SKINS[menu.sel.look];
  if(skinOpen(s) && s.id !== skinOf().id){ setSetting('skin', s.id); titleHero.hop = 1; titleHero.wobV += 0.5; }
  SFX.menu();
}
function lookClick(j){
  menu.sel.look = j;
  const s = SKINS[j];
  if(skinOpen(s)){ if(s.id !== skinOf().id){ setSetting('skin', s.id); titleHero.hop = 1; titleHero.wobV += 0.5; } SFX.coin(); }
  else if(!buySkin(s)){ showToast(skinHint(s), 110); SFX.hurt(); }
}

// ---------------------------------------------------------------- credits (and the creator's secret)
const CREDITS = [
  {k:'logo', h:96}, {k:'small', t:'Créé par', h:22}, {k:'name', h:70},
  {k:'role', r:'Idée, héros et histoire', w:'xeliax9', h:52}, {k:'role', r:'Chef testeur', w:'xeliax9', h:70},
  {k:'hero', h:132}, {k:'friends', h:128},
  {k:'role', r:'Les méchants', w:'Le Roi Gluant, Le Gardien, Le Seigneur Pourpre', h:50}, {k:'line', t:'Le Gecko Géant, Le Yéti des Glaces', h:26},
  {k:'magpie', h:116}, {k:'treasure', h:96}, {k:'end', h:130},
];
const CRED_TOTAL = CREDITS.reduce((a, c) => a + c.h, 0);
const credMax = () => CRED_TOTAL - CREDITS[CREDITS.length - 1].h / 2 + 18 + H / 2;
function creatorSecret(){
  menu.taps = 0; menu.secret = '';
  if(SET.creatorFound){ showToast('Le mode créateur t\'attend dans Paramètres, Jeu', 120); SFX.menu(); return; }
  SET.creatorFound = true; persist();
  showToast('Secret trouvé ! Mode créateur dans Paramètres, Jeu', 170);
  SFX.power(); menuFx(W / 2, H / 2, 46);
}
function creditsTap(x, y){
  menu.taps++; menu.tapT = 100;
  tone(660 + menu.taps * 130, 0.07, 'triangle', 0.04);
  menuFx(x, y, 6);
  if(menu.taps >= 5) creatorSecret();
}
function creditsType(k){ menu.secret = (menu.secret + k).slice(-7); if(menu.secret === 'xeliax9') creatorSecret(); }

// ---------------------------------------------------------------- little sparkles drawn over the menus
function menuFx(x, y, n){
  const cols = ['#ffd54a', '#2ee6ff', '#ff6fa5', '#8cff7a', '#ff8a3d', '#b48cff'];
  for(let i = 0; i < n; i++){
    const a = Math.random() * TAU, s = 1 + Math.random() * 3.5;
    menu.fx.push({x, y, vx:Math.cos(a) * s, vy:Math.sin(a) * s - 1.5, g:0.08, life:50 + Math.random() * 30, max:80, col:cols[i % cols.length], rot:Math.random() * TAU, vr:(Math.random() - 0.5) * 0.4, star:i % 3 === 0});
  }
}
function drawMenuFx(){
  for(const f of menu.fx){
    ctx.save(); ctx.globalAlpha = clamp(f.life / 25, 0, 1); ctx.fillStyle = f.col;
    if(f.star) star(f.x, f.y, 4, f.rot);
    else { ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.fillRect(-2, -3, 4, 6); }
    ctx.restore();
  }
}

// ---------------------------------------------------------------- update
function updateMenu(){
  if(menu.t < 1){ menu.t = Math.min(1, menu.t + 1 / 16); if(menu.t >= 1) menu.from = null; }
  if(!(menu.splash && !menu.splash.open)) menu.introT += REDUCED ? 1 : 0.42;   // the home intro lasts about 3 s
  menu.pointerT++;
  if(menu.splash && menu.splash.open && ++menu.splash.t >= 54) menu.splash = null;
  if(menu.bgFlash > 0) menu.bgFlash = Math.max(0, menu.bgFlash - 0.05);
  if(menu.shakeT > 0) menu.shakeT--;
  if(menu.resetT > 0) menu.resetT--;
  if(menu.tapT > 0 && --menu.tapT === 0) menu.taps = 0;
  menu.nudge *= 0.8;
  const p = menu.page;
  // the apps glide to the selected chapter (unless a finger is dragging them)
  if(!(menu.drag && menu.drag.moved && !menu.drag.credits) && appIndex(menuSel) >= 0){
    const target = appPos(appIndex(menuSel)) + menu.nudge;
    menu.scroll += (target - menu.scroll) * (REDUCED ? 0.5 : 0.17);
  }
  // behind the apps: a slow drift over the selected chapter's first room
  if((p === 'chapters' || menu.from === 'chapters') && room){
    const span = Math.max(0, room.w - W);
    const tx = span * (0.5 - 0.5 * Math.cos(frame * 0.0025));
    const ty = clamp(room.start.y - H * 0.6, 0, room.h - H);
    camX += (tx - camX) * 0.05; camY += (ty - camY) * 0.05;
    updateDecor(); animNpcs();
  }
  if(p === 'credits' && !(menu.drag && menu.drag.credits && menu.drag.moved))
    menu.credY = Math.min(credMax(), menu.credY + (menu.credFast ? 3.4 : 0.62));
  for(const r of pageRows(p)) if(r.kind === 'toggle'){ const v = r.get() ? 1 : 0, k = menu.knobs[r.id]; menu.knobs[r.id] = k === undefined ? v : k + (v - k) * 0.3; }
  // XELIAX follows the pointer with his eyes, or looks at the focused button
  if(menu.introT >= 16 && !menu.heroIn){ menu.heroIn = true; homeHero.appear = 0; }
  const ex = HERO_X, ey = HERO_Y - 128;
  let lx, ly;
  if(menu.pointerT < 240){ lx = menu.mx - ex; ly = menu.my - ey; }
  else if(menu.sel.home < 3){ lx = HOME_X - ex; ly = HOME_BTN[menu.sel.home].y + 20 - ey; }
  let look;
  if(lx !== undefined){ const len = Math.hypot(lx, ly) || 1, m = Math.min(1, len / 80) * 0.95; look = {x:lx / len * m, y:ly / len * m}; }
  stepCharAnim(homeHero, {vx:0, vy:0, onGround:true, facing:1, look, wave:menu.sel.home === 3 || (frame % 520) < 100});
  if(menu.splash) stepCharAnim(creditsHero, {vx:0, vy:0, onGround:true, facing:1, wave:!menu.splash.open});
  if(p === 'look' || menu.from === 'look') stepCharAnim(titleHero, {vx:0, vy:0, onGround:true, facing:1, wave:(frame % 320) < 80});
  if(p === 'credits' || menu.from === 'credits'){
    stepCharAnim(creditsHero, {vx:0, vy:0, onGround:true, facing:1, wave:true});
    for(const n of creditNpcs){ n.t += 0.05; if(n.blink > 0) n.blink--; else if(Math.random() < 0.006) n.blink = 7; }
  }
  // what XELIAX says on the home page
  if(menu.bubble){ if(--menu.bubble.t <= 0) menu.bubble = null; }
  else if(p === 'home' && --menu.bubbleT <= 0){ const t = frTypo(homeLine()); menu.bubble = {text:t, t:230, max:230}; menu.bubbleT = 520 + Math.random() * 380; }
  // now and then the magpie crosses the sky
  if(menu.fly){ menu.fly.x += menu.fly.vx; menu.fly.t++; if(menu.fly.x < -100) menu.fly = null; }
  else if(--menu.flyT <= 0){ menu.fly = {x:W + 70, y:44 + Math.random() * 46, vx:-1.6 - Math.random() * 0.6, t:0}; menu.flyT = 1100 + Math.random() * 900; }
  for(const f of menu.fx){ f.x += f.vx; f.y += f.vy; f.vy += f.g; f.vx *= 0.98; f.rot += f.vr; f.life--; }
  menu.fx = menu.fx.filter(f => f.life > 0);
}

// ---------------------------------------------------------------- input
function menuKey(k, rep = false){
  if(fadeDir !== 0) return;
  if(menu.splash){ if(!menu.splash.open && !rep && (k === ' ' || k === 'enter')) openSplash(); return; }
  const up = k === 'w' || k === 'arrowup', down = k === 's' || k === 'arrowdown';
  const left = k === 'a' || k === 'arrowleft', right = k === 'd' || k === 'arrowright';
  const ok = k === ' ' || k === 'enter', back = k === 'escape' || k === 'q' || k === 'backspace' || k === 'p';
  const p = menu.page;
  if(p === 'credits' && !rep && /^[a-z0-9]$/.test(k)) creditsType(k);
  if(back){ if(!rep) goBack(); return; }
  if(p === 'home'){
    if(up || left) homeFocus(-1); else if(down || right) homeFocus(1);
    else if(ok && !rep) homeActivate(menu.sel.home);
    return;
  }
  if(p === 'chapters'){
    if(rep) return;
    if(left) menuMove(-1); else if(right) menuMove(1);
    else if(ok || up) playChapter(menuSel);
    else if(down || k === 'e') switchSeason(seasonOf(menuSel) === 1 ? 2 : 1);
    return;
  }
  if(p === 'bonus'){
    if(rep) return;
    if(left || right){ const n = clamp(menu.sel.bonus + (left ? -1 : 1), 0, BONUS_CH.length - 1); if(n !== menu.sel.bonus){ menu.sel.bonus = n; SFX.menu(); } }
    else if(ok || up) playChapter(BONUS_CH[menu.sel.bonus]);
    return;
  }
  if(p === 'credits'){ if(ok || up) menu.credFast = true; return; }
  if(p === 'look'){ if(left || right) lookPick(left ? -1 : 1); else if(ok && !rep){ const s = SKINS[menu.sel.look]; if(!(s && buySkin(s))) goBack(); } return; }
  if(p === 'controls'){
    const n = KEY_ROWS.length + 1, s = clamp(menu.sel.controls || 0, 0, n - 1);
    if(up){ menu.sel.controls = (s - 1 + n) % n; SFX.menu(); }
    else if(down){ menu.sel.controls = (s + 1) % n; SFX.menu(); }
    else if(ok && !rep) controlsActivate(s);
    return;
  }
  const rows = pageRows(p), n = rows.length;
  if(!n) return;
  const s = clamp(menu.sel[p] || 0, 0, n - 1);
  if(up){ menu.sel[p] = (s - 1 + n) % n; SFX.menu(); }
  else if(down){ menu.sel[p] = (s + 1) % n; SFX.menu(); }
  else if(left || right) rowAdjust(rows[s], left ? -1 : 1);
  else if(ok && !rep) rowActivate(rows[s]);
}
function menuWheel(d){
  if(fadeDir !== 0 || menu.t < 1) return;
  if(menu.page === 'credits'){ menu.credY = clamp(menu.credY + d * 0.5, -60, credMax()); return; }
  menu.wheel += d;
  if(Math.abs(menu.wheel) < 30 || frame - menu.wheelT < 7) return;
  const s = Math.sign(menu.wheel); menu.wheel = 0; menu.wheelT = frame;
  if(menu.page === 'chapters') menuMove(s);
  else if(menu.page === 'bonus' || menu.page === 'look') menuKey(s > 0 ? 'arrowright' : 'arrowleft');
  else if(menu.page === 'settings' || menu.page === 'son' || menu.page === 'jeu' || menu.page === 'test') menuKey(s > 0 ? 'arrowdown' : 'arrowup');
}
function hit(x, y, w, h, o){ menu.hits.push({x, y, w, h, ...o}); }
function hitAt(x, y){
  for(let i = menu.hits.length - 1; i >= 0; i--){ const h = menu.hits[i]; if(x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h) return h; }
  return null;
}
const inCarousel = y => menu.page === 'chapters' && y > 96 && y < 254;
function menuPointerDown(x, y){
  menu.mx = x; menu.my = y; menu.pointerT = 0;
  if(menu.splash){ if(!menu.splash.open) openSplash(); return; }
  if(fadeDir !== 0 || menu.t < 1) return;
  const h = hitAt(x, y);
  menu.down = {x, y, id:h ? h.id : null, moved:false, sliding:false};
  if(inCarousel(y)) menu.drag = {x0:x, s0:menu.scroll, lx:x, v:0, moved:false};
  else if(menu.page === 'credits' && !(h && h.id === 'back')) menu.drag = {credits:true, y0:y, c0:menu.credY, moved:false};
  if(h && h.drag && h.drag(x, y)) menu.down.sliding = true;
}
function menuPointerMove(x, y, pressed){
  menu.mx = x; menu.my = y; menu.pointerT = 0;
  const d = menu.drag;
  if(d && pressed){
    if(d.credits){ if(Math.abs(y - d.y0) > 6) d.moved = true; if(d.moved) menu.credY = clamp(d.c0 - (y - d.y0), -60, credMax()); }
    else {
      if(Math.abs(x - d.x0) > 6) d.moved = true;
      if(d.moved){
        menu.scroll = d.s0 - (x - d.x0); d.v = d.v * 0.6 + (x - d.lx) * 0.4; d.lx = x;
        const k = nearestApp(menu.scroll);
        if(MAIN_CH[k] !== menuSel) selectApp(MAIN_CH[k], true);
      }
    }
  }
  if(menu.down){
    if(Math.hypot(x - menu.down.x, y - menu.down.y) > 8) menu.down.moved = true;
    if(menu.down.sliding && pressed){ const h = menu.hits.find(q => q.id === menu.down.id); if(h && h.drag) h.drag(x, y); }
  }
  const h = menu.t >= 1 && fadeDir === 0 ? hitAt(x, y) : null;
  if(h && h.hover && !(d && d.moved)) h.hover();
  canvas.style.cursor = d && d.moved ? 'grabbing' : h && h.click ? 'pointer' : inCarousel(y) ? 'grab' : '';
}
function menuPointerUp(x, y){
  const d = menu.drag, dn = menu.down;
  menu.drag = null; menu.down = null;
  if(d && d.moved){
    if(!d.credits) selectApp(MAIN_CH[nearestApp(menu.scroll - d.v * 7)], true);
    return;
  }
  if(!dn || dn.moved || dn.sliding) return;
  const h = hitAt(x, y);
  if(h && h.id === dn.id && h.click) h.click(x, y);
}

// ---------------------------------------------------------------- shared drawing bits
function navHeader(title, back, act){
  if(back){
    ctx.font = `600 13.5px ${FU}`;
    const bw = ctx.measureText(back).width + 30, bx = 14, by = 26;
    const hov = act && !TOUCH && menu.pointerT < 600 && menu.mx >= bx - 6 && menu.mx <= bx + bw + 6 && menu.my >= by - 6 && menu.my <= by + 30;
    rr(bx, by, bw, 24, 12); ctx.fillStyle = hov ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.09)'; ctx.fill();
    ctx.strokeStyle = '#8cc4ff'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(bx + 15, by + 7); ctx.lineTo(bx + 10, by + 12); ctx.lineTo(bx + 15, by + 17); ctx.stroke();
    txt(back, bx + 21, by + 16.5, 13.5, '#8cc4ff', 600, 'left');
    if(act) hit(bx - 6, by - 6, bw + 12, 36, {id:'back', click:goBack});
  }
  if(title) heading(title, W / 2, 52, 24, '#ffffff');
}
function chevronRight(x, y, col = 'rgba(255,255,255,0.4)'){
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(x - 3, y - 5); ctx.lineTo(x + 2, y); ctx.lineTo(x - 3, y + 5); ctx.stroke();
}
function padlock(x, y, s, col = '#ffffff'){
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = col; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6, -2); ctx.lineTo(-6, -6); ctx.arc(0, -6, 6, Math.PI, 0); ctx.lineTo(6, -2); ctx.stroke();
  rr(-10, -3, 20, 16, 4); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = 'rgba(20,12,44,0.75)'; ctx.beginPath(); ctx.arc(0, 3.5, 2.4, 0, TAU); ctx.fill(); ctx.fillRect(-1, 4, 2, 5);
  ctx.restore();
}
function tileIcon(kind, x, y, s, col){
  rr(x, y, s, s, s * 0.27);
  if(kind === 'secret'){ const g = ctx.createLinearGradient(x, y, x + s, y + s); g.addColorStop(0, '#ffe27a'); g.addColorStop(1, '#c47a0a'); ctx.fillStyle = g; }
  else ctx.fillStyle = col;
  ctx.fill();
  ctx.save(); ctx.translate(x + s / 2, y + s / 2); ctx.scale(s / 22, s / 22);
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if(kind === 'sound'){
    ctx.beginPath(); ctx.moveTo(-7, -2.5); ctx.lineTo(-4, -2.5); ctx.lineTo(0, -6.5); ctx.lineTo(0, 6.5); ctx.lineTo(-4, 2.5); ctx.lineTo(-7, 2.5); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(1, 0, 3.6, -0.8, 0.8); ctx.stroke(); ctx.beginPath(); ctx.arc(1, 0, 6.6, -0.8, 0.8); ctx.stroke();
  } else if(kind === 'game'){
    rr(-8.5, -4.5, 17, 10, 5); ctx.fill();
    ctx.fillStyle = col; ctx.fillRect(-6, -0.8, 5, 1.8); ctx.fillRect(-4.4, -2.4, 1.8, 5);
    ctx.beginPath(); ctx.arc(3.2, -1.2, 1.3, 0, TAU); ctx.arc(5.6, 1.2, 1.3, 0, TAU); ctx.fill();
  } else if(kind === 'hero'){
    ctx.fillStyle = HERO.body; ctx.beginPath(); ctx.ellipse(0, 2, 8, 5.5, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = HERO.deep; ctx.lineWidth = 1; ctx.stroke();
    for(const [ex, ey, r] of [[-2.6, -3.4, 2.6], [2.8, -1.8, 2.2]]){ ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex, ey, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#14033f'; ctx.beginPath(); ctx.arc(ex + 0.7, ey + 0.4, r * 0.45, 0, TAU); ctx.fill(); }
  } else if(kind === 'keys'){
    ctx.lineWidth = 1.5; rr(-8.5, -5, 17, 10, 2); ctx.stroke();
    for(let r = 0; r < 2; r++) for(let c = 0; c < 4; c++) ctx.fillRect(-6.2 + c * 3.6, -2.8 + r * 3, 1.8, 1.8);
    ctx.fillRect(-4, 2.6, 8, 1.4);
  } else if(kind === 'star'){
    ctx.beginPath(); for(let k = 0; k < 10; k++){ const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 3.2 : 7.6; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
  } else if(kind === 'secret'){
    ctx.beginPath(); for(let k = 0; k < 8; k++){ const a = -Math.PI / 2 + k * Math.PI / 4, r = k % 2 ? 2.2 : 8; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(6, -6, 1.2, 0, TAU); ctx.arc(-6, 5, 1, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function toggleSwitch(x, y, k, accent = '#34c759'){
  rr(x, y, 40, 22, 11); ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fill();
  if(k > 0.01){ ctx.save(); ctx.globalAlpha *= k; rr(x, y, 40, 22, 11); ctx.fillStyle = accent; ctx.fill(); ctx.restore(); }
  const kx = x + 11 + k * 18;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(kx, y + 12.2, 9, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(kx, y + 11, 9, 0, TAU); ctx.fill();
}
// menu toasts drop down from the top, like a phone notification
function drawMenuToast(){
  if(toast.t <= 0) return;
  const el = toast.max - toast.t, inP = easeOutBack(clamp(el / 16, 0, 1)), outA = clamp(toast.t / 12, 0, 1);
  ctx.font = `600 13px ${FU}`;
  const tw = Math.min(W - 40, ctx.measureText(toast.text).width + 62), x = W / 2 - tw / 2, y = -36 + 44 * inP;
  ctx.save(); ctx.globalAlpha = outA;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; rr(x, y + 3, tw, 32, 16); ctx.fill();
  rr(x, y, tw, 32, 16); ctx.fillStyle = 'rgba(14,9,34,0.96)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; ctx.stroke();
  tileIcon('hero', x + 7, y + 5, 22, skinOf().light);
  txt(toast.text, x + 37, y + 20.5, 13, '#ffffff', 600, 'left');
  ctx.restore();
}

// ---------------------------------------------------------------- app icons
function appArt(i){
  const deco = CHAPTERS[i].deco, t = frame;
  const sky = (a, b, c) => { const g = ctx.createLinearGradient(0, 0, 0, 100); g.addColorStop(0, a); g.addColorStop(0.6, b); g.addColorStop(1, c); ctx.fillStyle = g; ctx.fillRect(0, 0, 100, 100); };
  const dots = (n, col, maxY) => { for(let k = 0; k < n; k++){ const tw = 0.5 + 0.5 * Math.sin(t * 0.05 + k * 1.3); ctx.fillStyle = `rgba(${col},${0.35 + 0.6 * tw})`; ctx.beginPath(); ctx.arc(hash(k * 13 + i) * 100, hash(k * 7 + i * 3) * maxY, 0.7 + hash(k) * 1.1, 0, TAU); ctx.fill(); } };
  if(deco === 'hills'){
    sky('#46b2ff', '#a4e2ff', '#e4f8ff');
    softGlow(74, 26, 24, 24, '255,244,180', 0.85);
    ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(74, 26, 11, 0, TAU); ctx.fill();
    cloud(((t * 0.2) % 150) - 34, 38, 0.36, THEMES.hills);
    ctx.fillStyle = '#9be08a'; ctx.beginPath(); ctx.ellipse(18, 96, 48, 30, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#56c04e'; ctx.beginPath(); ctx.ellipse(72, 104, 58, 40, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(64, 66); ctx.lineTo(64, 36); ctx.stroke();
    const fw = Math.sin(t * 0.1) * 2;
    ctx.fillStyle = '#ff4d6d'; ctx.beginPath(); ctx.moveTo(65, 36); ctx.quadraticCurveTo(74, 38 + fw, 84, 37); ctx.lineTo(82, 48); ctx.quadraticCurveTo(73, 47 - fw, 65, 49); ctx.closePath(); ctx.fill();
    for(const [fx, fy] of [[24, 82], [38, 88], [86, 80], [52, 92]]){ ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(fx, fy, 2.6, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffd54a'; ctx.beginPath(); ctx.arc(fx, fy, 1.1, 0, TAU); ctx.fill(); }
  } else if(deco === 'cave'){
    sky('#120d2e', '#261c58', '#1b5560');
    ctx.fillStyle = '#0a0720';
    for(let k = 0; k < 7; k++){ const x = k * 16 - 4; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 8, 10 + hash(k + 3) * 18); ctx.lineTo(x + 16, 0); ctx.fill(); }
    ctx.fillStyle = '#0b1a24'; ctx.beginPath(); ctx.ellipse(50, 104, 70, 16, 0, 0, TAU); ctx.fill();
    crystalCluster(50, 94, 1.45, '#7ff6e6', 1);
    crystalCluster(20, 98, 0.75, '#ff9ae0', 1);
    crystalCluster(82, 99, 0.8, '#b6a2ff', 1);
    for(let k = 0; k < 4; k++){ const tw = Math.max(0, Math.sin(t * 0.07 + k * 1.7)); ctx.fillStyle = `rgba(220,255,250,${tw})`; star(28 + k * 15, 40 + hash(k) * 20, 2 + tw * 2, 0); }
  } else if(deco === 'tower'){
    sky('#3a2c8c', '#dc768e', '#ffd08c');
    softGlow(50, 64, 44, 44, '255,232,186', 0.6);
    ctx.fillStyle = '#ffe3aa'; ctx.beginPath(); ctx.arc(50, 64, 25, 0, TAU); ctx.fill();
    cloud(4, 84, 0.42, THEMES.tower); cloud(60, 90, 0.36, THEMES.tower);
    ctx.fillStyle = '#3a2558';
    ctx.fillRect(39, 36, 22, 70);
    ctx.beginPath(); ctx.moveTo(34, 37); ctx.lineTo(50, 12); ctx.lineTo(66, 37); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#3a2558'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(50, 12); ctx.lineTo(50, 4); ctx.stroke();
    ctx.fillStyle = '#ff7ae0'; ctx.beginPath(); ctx.moveTo(50, 4); ctx.lineTo(58, 6.5 + Math.sin(t * 0.1)); ctx.lineTo(50, 9); ctx.closePath(); ctx.fill();
    softGlow(50, 54, 12, 12, '255,214,107', 0.8);
    rr(46, 48, 8, 12, 4); ctx.fillStyle = '#ffd36b'; ctx.fill();
  } else if(deco === 'fortress'){
    sky('#13050b', '#481020', '#9a2a1c');
    for(let k = 0; k < 6; k++){ const y = 100 - ((t * 0.4 + k * 19) % 100); ctx.fillStyle = `rgba(255,${150 + k * 12},70,${0.7 * (y / 100)})`; ctx.fillRect(10 + hash(k * 5) * 80, y, 2, 2); }
    ctx.fillStyle = '#22080f';
    ctx.fillRect(14, 50, 72, 56);
    for(let k = 0; k < 5; k++) ctx.fillRect(16 + k * 15, 44, 8, 8);
    ctx.fillRect(6, 36, 18, 70); ctx.fillRect(76, 36, 18, 70);
    for(const x of [6, 13, 76, 83]) ctx.fillRect(x, 30, 5, 7);
    const pulse = 0.7 + 0.3 * Math.sin(t * 0.08);
    softGlow(50, 92, 24, 20, '255,140,50', 0.7 * pulse);
    const g = ctx.createLinearGradient(0, 70, 0, 100); g.addColorStop(0, '#ffd36a'); g.addColorStop(1, '#ff5a1e');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(39, 100); ctx.lineTo(39, 80); ctx.arc(50, 80, 11, Math.PI, 0); ctx.lineTo(61, 100); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff7a2a'; ctx.fillRect(0, 96, 100, 4);
    rr(12, 58, 6, 8, 3); ctx.fillStyle = '#ff9a4a'; ctx.fill(); rr(82, 58, 6, 8, 3); ctx.fill();
  } else if(deco === 'sky'){
    sky('#8a7cff', '#f0b0ff', '#ffe4f2');
    skyIsland(50, 20, 0.62, '#c8b4f0', '#fff6ff', true);
    skyIsland(50, 84, 0.62, '#b39ae8', '#fff6ff', false);
    const oy = 52 + Math.sin(t * 0.06) * 2;
    softGlow(50, oy, 24, 24, '255,122,224', 0.75);
    const g = ctx.createRadialGradient(47, oy - 3, 1, 50, oy, 11);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.45, '#ffb8f0'); g.addColorStop(1, '#c43fa8');
    ctx.beginPath(); ctx.arc(50, oy, 11, 0, TAU); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#5a0f4a'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.strokeStyle = '#5a0f4a'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for(const d of [1, -1]){ ctx.beginPath(); ctx.moveTo(46.5, oy + d * 1.3); ctx.lineTo(50, oy + d * 5.2); ctx.lineTo(53.5, oy + d * 1.3); ctx.stroke(); }
  } else if(deco === 'canyon'){
    sky('#ff8a52', '#ffc88a', '#fff0d2');
    softGlow(50, 70, 40, 30, '255,236,190', 0.7);
    ctx.fillStyle = '#c56a3e'; ctx.beginPath(); ctx.moveTo(0, 0); for(let y = 0; y <= 100; y += 12) ctx.lineTo(20 + (hash(y + 3) - 0.5) * 10, y); ctx.lineTo(0, 100); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a24e2a'; ctx.beginPath(); ctx.moveTo(100, 0); for(let y = 0; y <= 100; y += 12) ctx.lineTo(78 + (hash(y + 9) - 0.5) * 10, y); ctx.lineTo(100, 100); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8a3e22'; ctx.fillRect(0, 92, 100, 8);
    wallIcon(50, 52, 3.3);
  } else if(deco === 'ice'){
    sky('#0e1f4c', '#3568ad', '#b8e2ff');
    dots(10, '255,255,255', 40);
    ctx.fillStyle = 'rgba(120,255,200,0.28)'; ctx.beginPath(); ctx.moveTo(0, 18); for(let x = 0; x <= 100; x += 10) ctx.lineTo(x, 18 + Math.sin(x * 0.08 + t * 0.03) * 5); for(let x = 100; x >= 0; x -= 10) ctx.lineTo(x, 28 + Math.sin(x * 0.08 + t * 0.03 + 1) * 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8fb4dc'; ctx.beginPath(); ctx.moveTo(-6, 100); ctx.lineTo(30, 46); ctx.lineTo(66, 100); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f4fbff'; ctx.beginPath(); ctx.moveTo(30, 46); ctx.lineTo(39, 59); ctx.lineTo(21, 59); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#6f94c4'; ctx.beginPath(); ctx.moveTo(40, 100); ctx.lineTo(76, 54); ctx.lineTo(112, 100); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,210,63,0.5)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for(const y of [56, 64, 72]){ ctx.beginPath(); ctx.moveTo(14 + (y % 3) * 4, y); ctx.lineTo(32, y); ctx.stroke(); }
    dashIcon(56, 64, 3.1, POWER_COLORS.dash);
  } else if(deco === 'nest'){
    sky('#1a1038', '#5a2a68', '#e0805a');
    for(let k = 0; k < 12; k++){ const x = (hash(k * 5) * 120 + t * 1.5) % 110 - 5, y = (hash(k * 9) * 100 + t * 3) % 100; ctx.strokeStyle = 'rgba(200,210,255,0.25)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 2, y + 7); ctx.stroke(); }
    if(t % 240 < 8){ ctx.fillStyle = 'rgba(255,246,210,0.35)'; ctx.fillRect(0, 0, 100, 100); }
    ctx.fillStyle = '#fff2a0'; ctx.beginPath(); ctx.moveTo(26, 6); ctx.lineTo(16, 26); ctx.lineTo(24, 26); ctx.lineTo(18, 42); ctx.lineTo(34, 20); ctx.lineTo(26, 20); ctx.lineTo(32, 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#4a2c16'; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, 96); ctx.quadraticCurveTo(50, 80, 110, 92); ctx.stroke();
    ctx.fillStyle = '#7a5232'; ctx.beginPath(); ctx.ellipse(52, 78, 34, 13, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(40,20,8,0.55)'; ctx.lineWidth = 1.4;
    for(let k = 0; k < 9; k++){ ctx.beginPath(); ctx.moveTo(22 + k * 7, 70 + hash(k) * 4); ctx.lineTo(28 + k * 7, 88 - hash(k + 4) * 4); ctx.stroke(); }
    ctx.fillStyle = '#3a2412'; ctx.beginPath(); ctx.ellipse(52, 72, 26, 6, 0, 0, TAU); ctx.fill();
    softGlow(52, 66, 30, 16, '255,226,150', 0.5);
    drawFicelle(52, 67, 50, -0.12, false, 8);
  } else if(deco === 'night'){
    sky('#060a24', '#1a1650', '#3a2a6a');
    dots(20, '255,246,220', 100);
    softGlow(50, 44, 36, 36, '255,214,90', 0.6);
    ctx.fillStyle = '#ffd54a'; star(50, 44, 25, -Math.PI / 2 + t * 0.01);
    ctx.fillStyle = '#fff6c0'; star(50, 44, 9, -Math.PI / 2 + t * 0.01);
    drawFicelle(50, 82, 54, -0.15, false, 7.5, 'gold');
  } else if(deco === 'cosmos'){
    sky('#05031a', '#1d0c4e', '#4a1a7a');
    softGlow(24, 30, 38, 26, '255,90,200', 0.35); softGlow(80, 72, 40, 30, '90,220,255', 0.3);
    dots(18, '220,240,255', 100);
    ringedPlanet(50, 44, 18);
    drawFicelle(50, 84, 52, -0.1, false, 7.5, 'crystal');
  }
}
function drawAppIcon(i, cx, cy, size, o = {}){
  const locked = !isUnlocked(i), r = size * 0.24, x = cx - size / 2, y = cy - size / 2;
  ctx.save();
  if(o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  if(o.sel) softGlow(cx, cy + size * 0.08, size * 0.95, size * 0.8, hexRGB(CH_ACCENT[i]).join(','), 0.4);
  ctx.fillStyle = 'rgba(6,3,20,0.45)'; rr(x + 1.5, y + 5, size, size, r); ctx.fill();
  ctx.save(); rr(x, y, size, size, r); ctx.clip();
  ctx.translate(x, y); ctx.scale(size / 100, size / 100);
  appArt(i);
  const gl = ctx.createLinearGradient(0, 0, 0, 100);
  gl.addColorStop(0, 'rgba(255,255,255,0.26)'); gl.addColorStop(0.42, 'rgba(255,255,255,0.05)'); gl.addColorStop(0.43, 'rgba(255,255,255,0)');
  ctx.fillStyle = gl; ctx.fillRect(0, 0, 100, 100);
  if(locked){ ctx.fillStyle = 'rgba(12,8,30,0.66)'; ctx.fillRect(0, 0, 100, 100); padlock(50, 48, 1.5, 'rgba(255,255,255,0.92)'); }
  ctx.restore();
  rr(x, y, size, size, r);
  ctx.strokeStyle = o.sel ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)'; ctx.lineWidth = o.sel ? 2.2 : 1; ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------- home page drawing
function homeIsland(cx, top){
  const g = ctx.createLinearGradient(0, top, 0, top + 90);
  g.addColorStop(0, '#6c4290'); g.addColorStop(1, '#22103a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - 108, top + 2);
  ctx.quadraticCurveTo(cx - 86, top + 30, cx - 56, top + 42);
  ctx.quadraticCurveTo(cx - 34, top + 82, cx - 8, top + 74);
  ctx.quadraticCurveTo(cx + 6, top + 104, cx + 24, top + 70);
  ctx.quadraticCurveTo(cx + 66, top + 54, cx + 108, top + 2);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2;
  for(const [a, b2, dy] of [[-80, 70, 18], [-50, 40, 34]]){ ctx.beginPath(); ctx.moveTo(cx + a, top + dy); ctx.quadraticCurveTo(cx + (a + b2) / 2, top + dy + 8, cx + b2, top + dy - 2); ctx.stroke(); }
  softGlow(cx - 30, top + 52, 12, 12, '127,246,230', 0.6);
  crystalCluster(cx - 30, top + 58, 0.45, '#7ff6e6', 1);
  ctx.strokeStyle = '#3f8a3a'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for(const [dx, len] of [[-92, 26], [-64, 40], [58, 34], [86, 22]]){
    const sw = REDUCED ? 0 : Math.sin(frame * 0.03 + dx) * 2.5;
    ctx.beginPath(); ctx.moveTo(cx + dx, top + 6); ctx.quadraticCurveTo(cx + dx + sw, top + 6 + len * 0.6, cx + dx + sw * 1.6, top + 6 + len); ctx.stroke();
    ctx.fillStyle = '#5cb84f'; ctx.beginPath(); ctx.ellipse(cx + dx + sw * 1.6, top + 6 + len, 2.4, 1.5, 0.4, 0, TAU); ctx.fill();
  }
  rr(cx - 112, top - 7, 224, 15, 7.5); ctx.fillStyle = '#7edc5c'; ctx.fill(); ctx.strokeStyle = '#2a5a20'; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(cx - 104, top - 5, 208, 1.6);
  ctx.fillStyle = '#4fb042';
  for(let k = 0; k < 16; k++){ const bx = cx - 104 + k * 14 + hash(k) * 6; if(Math.abs(bx - cx) < 50) continue; ctx.beginPath(); ctx.moveTo(bx - 3, top - 5); ctx.lineTo(bx, top - 11 - hash(k + 2) * 4); ctx.lineTo(bx + 3, top - 5); ctx.fill(); }
  for(const [dx, col] of [[-84, '#ffd54a'], [-58, '#ff9ad8'], [64, '#ffffff'], [90, '#ffd54a']]){
    ctx.strokeStyle = '#3f8a3a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(cx + dx, top - 5); ctx.lineTo(cx + dx, top - 13); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + dx, top - 14, 2.8, 0, TAU); ctx.fill();
  }
}
function homeRidge(base, amp, col, par, seed){
  const off = (menu.mx - W / 2) / W * par;
  ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-20, H);
  for(let x = -20; x <= W + 20; x += 10){ const wx = x + seed * 157 - off; ctx.lineTo(x, base + Math.sin(wx * 0.011 + seed) * amp + Math.sin(wx * 0.029 + seed * 2) * amp * 0.45); }
  ctx.lineTo(W + 20, H); ctx.closePath(); ctx.fill();
}
function drawHomeScene(){
  const t = frame, px = (menu.mx - W / 2) / W, py = (menu.my - H / 2) / H;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0e072e'); g.addColorStop(0.42, '#331868'); g.addColorStop(0.75, '#a3477d'); g.addColorStop(1, '#ff9d6c');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
  for(let i = 0; i < 80; i++){
    const x = ((hash(i * 13 + 5) * (W + 20) - px * 8 * (0.5 + hash(i))) % (W + 20) + W + 20) % (W + 20) - 10;
    const y = hash(i * 17 + 3) * 210 - py * 5;
    const tw = 0.5 + 0.5 * Math.sin(t * (0.02 + hash(i * 5) * 0.04) + i);
    const a = (0.25 + 0.65 * hash(i * 29)) * tw * clamp(1 - y / 240, 0, 1);
    if(a <= 0.02) continue;
    ctx.fillStyle = `rgba(255,244,230,${a})`; ctx.beginPath(); ctx.arc(x, y, 0.5 + hash(i * 3) * 1.1, 0, TAU); ctx.fill();
  }
  const st = t % 600;
  if(st < 44 && !REDUCED){
    const k = st / 44, sx = 300 - k * 240, sy = 30 + k * 60;
    const sg = ctx.createLinearGradient(sx, sy, sx + 60, sy - 15);
    sg.addColorStop(0, `rgba(255,248,226,${0.9 * (1 - k)})`); sg.addColorStop(1, 'rgba(255,248,226,0)');
    ctx.strokeStyle = sg; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 60, sy - 15); ctx.stroke();
  }
  // the sun setting behind XELIAX's island
  const sx = HERO_X + 4 - px * 10, sy = 222 - py * 6;
  softGlow(sx, sy, 240, 170, '255,170,120', 0.35);
  ctx.strokeStyle = 'rgba(255,220,180,0.13)'; ctx.lineWidth = 2;
  for(const r of [98, 116]){ ctx.beginPath(); ctx.arc(sx, sy, r + Math.sin(t * 0.02 + r) * 2, 0, TAU); ctx.stroke(); }
  const sun = ctx.createLinearGradient(0, sy - 82, 0, sy + 82);
  sun.addColorStop(0, '#ffeeb0'); sun.addColorStop(1, '#ff8a5e');
  ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(sx, sy, 82, 0, TAU); ctx.fill();
  // the magpie flies past now and then
  if(menu.fly){
    const f = menu.fly, fy = f.y + Math.sin(f.t * 0.06) * 6 - py * 4;
    ctx.save(); ctx.translate(f.x, fy); ctx.scale(0.7, 0.7);
    drawMagpie({x:-24, y:-20, w:48, h:40, state:'hover', phase:1, hitT:0, inv:0, face:-1, lost:!!save.s2Done});
    ctx.restore();
  }
  const cth = {cloud:'rgba(255,214,232,0.85)', cloudShade:'rgba(214,150,200,0.8)'};
  cloud(((t * 0.08 + 380) % (W + 200)) - 100 - px * 12, 116, 0.6, {cloud:'rgba(255,230,242,0.3)', cloudShade:'rgba(220,170,220,0.26)'});
  skyIsland(96 - px * 16, 196 + Math.sin(t * 0.02) * 3, 0.5, '#4a2470', '#6a3a90', false);
  skyIsland(604 - px * 16, 150 + Math.sin(t * 0.025 + 1) * 3, 0.36, '#3e1e62', '#5a3080', false);
  homeRidge(270, 24, '#5a2a74', 14, 1);
  homeRidge(300, 18, '#3d1c5c', 24, 2);
  cloud(((t * 0.12 + 40) % (W + 220)) - 110 - px * 18, 300, 0.9, cth);
  const hz = ctx.createLinearGradient(0, H - 70, 0, H);
  hz.addColorStop(0, 'rgba(255,170,130,0)'); hz.addColorStop(1, 'rgba(255,170,130,0.32)');
  ctx.fillStyle = hz; ctx.fillRect(-20, H - 70, W + 40, 90);
  for(let i = 0; i < 14; i++){
    const x = (hash(i * 31) * W + Math.sin(t * 0.01 + i) * 30 - px * 20 + W) % W, y = 120 + hash(i * 37) * 220 + Math.sin(t * 0.02 + i * 2) * 10;
    const a = 0.3 + 0.5 * Math.max(0, Math.sin(t * 0.04 + i * 1.3));
    softGlow(x, y, 7, 7, '255,236,170', a * 0.5);
    ctx.fillStyle = `rgba(255,246,200,${a})`; ctx.beginPath(); ctx.arc(x, y, 1.3, 0, TAU); ctx.fill();
  }
}
function waveTitle(text, cx, y, size, color){
  ctx.font = `400 ${size}px ${FD}`;
  const chars = [...text], ws = chars.map(ch => ctx.measureText(ch).width), total = ws.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  chars.forEach((ch, i) => {
    const k = clamp((menu.introT - 8 - i * 2.4) / 16, 0, 1), e = k < 1 ? easeOutBack(k) : 1;
    const wy = REDUCED ? 0 : Math.sin(frame * 0.045 + i * 0.55) * 2.2;
    if(k > 0){ ctx.save(); ctx.globalAlpha *= k; heading(ch, x + ws[i] / 2, y + wy - (1 - e) * 26, size, color); ctx.restore(); }
    x += ws[i];
  });
}
function drawHomeButton(b, i, act){
  const sel = menu.sel.home === i, k = easeOutCubic(clamp((menu.introT - 28 - i * 6) / 18, 0, 1));
  if(k <= 0) return;
  const w = HOME_BW, h = b.h, x = HOME_X - w / 2 - (1 - k) * 70, y = b.y;
  ctx.save(); ctx.globalAlpha *= k;
  const pop = sel ? 1.04 + (REDUCED ? 0 : Math.sin(frame * 0.12) * 0.012) : 1;
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(pop, pop); ctx.translate(-(x + w / 2), -(y + h / 2));
  if(i === 0){
    ctx.fillStyle = 'rgba(80,20,0,0.4)'; rr(x, y + 4, w, h, h / 2); ctx.fill();
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#ffe27a'); g.addColorStop(1, '#ff9a3c');
    rr(x, y, w, h, h / 2); ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; rr(x + 16, y + 4, w - 32, 4, 2); ctx.fill();
    if(sel){ rr(x, y, w, h, h / 2); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.stroke(); }
    ctx.font = `400 23px ${FD}`; const lw = ctx.measureText(b.label).width, lx = x + w / 2 + 12;
    ctx.fillStyle = '#4a1e00'; ctx.beginPath(); const tx = lx - lw / 2 - 24, ty = y + h / 2; ctx.moveTo(tx, ty - 8); ctx.lineTo(tx + 13, ty); ctx.lineTo(tx, ty + 8); ctx.closePath(); ctx.fill();
    heading(b.label, lx, y + 31, 23, '#3a1600', 'center', false);
  } else {
    rr(x, y, w, h, h / 2); ctx.fillStyle = sel ? 'rgba(255,255,255,0.2)' : 'rgba(18,10,44,0.74)'; ctx.fill();
    ctx.strokeStyle = sel ? '#ffd54a' : 'rgba(255,255,255,0.24)'; ctx.lineWidth = sel ? 2 : 1; ctx.stroke();
    const ix0 = x + 28, iy0 = y + h / 2;
    if(i === 1){
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); for(let q = 0; q < 16; q++){ const a = q / 16 * TAU + frame * (sel ? 0.02 : 0), r = q % 2 ? 5.6 : 7.4; ctx.lineTo(ix0 + Math.cos(a) * r, iy0 + Math.sin(a) * r); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = sel ? '#6a5aa0' : '#1d1240'; ctx.beginPath(); ctx.arc(ix0, iy0, 2.6, 0, TAU); ctx.fill();
    } else { ctx.fillStyle = '#ffd54a'; star(ix0, iy0, 7.5, -Math.PI / 2 + frame * (sel ? 0.03 : 0)); }
    txt(b.label, x + w / 2 + 8, y + h / 2 + 5.5, 16, '#ffffff', 600);
    if(i === 1 && bonusVisible() && !save.bonusFolderSeen){
      const bxx = x + w - 10, byy = y + 3, pulse = REDUCED ? 1 : 1 + Math.sin(frame * 0.15) * 0.08;
      ctx.save(); ctx.translate(bxx, byy); ctx.scale(pulse, pulse);
      ctx.fillStyle = '#ff3b30'; ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(14,9,34,0.9)'; ctx.lineWidth = 2; ctx.stroke();
      txt('1', 0, 4.5, 12, '#ffffff', 700);
      ctx.restore();
    }
  }
  ctx.restore();
  if(act) hit(x - 4, y - 3, w + 8, h + 6, {id:'btn' + i, click:() => homeActivate(i), hover:() => { menu.sel.home = i; }});
}
function drawHome(act){
  const T = menu.introT, bob = REDUCED ? 0 : Math.sin(frame * 0.03) * 3, top = HERO_Y + bob;
  const ia = easeOutCubic(clamp((T - 4) / 30, 0, 1));
  ctx.save(); ctx.globalAlpha *= ia; ctx.translate(0, (1 - ia) * 70);
  homeIsland(HERO_X, top);
  ctx.restore();
  if(T >= 16){
    const hop = Math.sin(homeHero.hop * Math.PI) * 26;
    ctx.fillStyle = 'rgba(30,10,40,0.3)'; ctx.beginPath(); ctx.ellipse(HERO_X, top + 1, 50 * (1 - hop / 80), 7, 0, 0, TAU); ctx.fill();
    if(menu.sel.home === 3){
      ctx.save(); ctx.strokeStyle = 'rgba(255,213,74,0.85)'; ctx.lineWidth = 2.5; ctx.setLineDash([7, 6]); ctx.lineDashOffset = -frame * 0.5;
      ctx.beginPath(); ctx.ellipse(HERO_X, top - 66, 82, 92, 0, 0, TAU); ctx.stroke(); ctx.restore();
    }
    drawHero(homeHero, HERO_X, top - hop, 4.4, {});
  }
  if(act) hit(HERO_X - 72, top - 166, 144, 172, {id:'hero', click:openPetFromHome, hover:() => { menu.sel.home = 3; }});
  // his speech bubble, above his head
  const b = menu.bubble;
  if(b && T > 40){
    const el = b.max - b.t, k = Math.min(easeOutBack(clamp(el / 14, 0, 1)), clamp(b.t / 12, 0, 1));
    if(k > 0.01){
      ctx.font = `600 13px ${FU}`;
      const tw = ctx.measureText(b.text).width + 28, bx = clamp(HERO_X + 30 - tw / 2, 336, W - 14 - tw), by = top - 196;
      ctx.save(); ctx.globalAlpha *= clamp(k, 0, 1);
      ctx.translate(HERO_X + 10, by + 32); ctx.scale(k, k); ctx.translate(-(HERO_X + 10), -(by + 32));
      ctx.fillStyle = 'rgba(20,8,40,0.25)'; rr(bx, by + 3, tw, 30, 15); ctx.fill();
      rr(bx, by, tw, 30, 15); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(HERO_X - 2, by + 28); ctx.lineTo(HERO_X + 6, by + 40); ctx.lineTo(HERO_X + 14, by + 28); ctx.closePath(); ctx.fill();
      txt(b.text, bx + tw / 2, by + 20, 13, '#2a1a5a', 600);
      ctx.restore();
    }
  }
  // the title, with the ficelle aux olives as its underline
  const tk = easeOutCubic(clamp(T / 24, 0, 1));
  ctx.save(); ctx.globalAlpha *= tk; heading('L\'aventure', HOME_X, 78 + (1 - tk) * 10, 26, '#f3ead6'); ctx.restore();
  ctx.font = `400 54px ${FD}`;
  const size = Math.min(54, 54 * 300 / Math.max(1, ctx.measureText('spécifique').width));
  waveTitle('spécifique', HOME_X, 132, size, '#ffffff');
  const fk = easeOutCubic(clamp((T - 30) / 24, 0, 1));
  if(fk > 0){ ctx.save(); ctx.globalAlpha *= fk; drawFicelle(HOME_X + 4, 151, 236 * (0.4 + 0.6 * fk), -0.015, false, 9); ctx.restore(); }
  HOME_BTN.forEach((bt, i) => drawHomeButton(bt, i, act));
  // signature
  const sk = easeOutCubic(clamp((T - 52) / 20, 0, 1));
  if(sk > 0){
    ctx.save(); ctx.globalAlpha *= sk;
    ctx.font = `500 12.5px ${FU}`; const a1 = 'un jeu de ', w1 = ctx.measureText(a1).width; ctx.font = `700 12.5px ${FU}`; const w2 = ctx.measureText('xeliax9').width;
    const sx = HOME_X - (w1 + w2) / 2;
    txt(a1, sx, 345, 12.5, '#e0d4ff', 500, 'left'); txt('xeliax9', sx + w1, 345, 12.5, '#ffd54a', 700, 'left');
    ctx.restore();
    if(act) hit(HOME_X - 64, 332, 128, 20, {id:'sig', click:() => demoOn() ? demoNo() : goPage('credits')});
  }
  if(!TOUCH && T > 70 && menu.pointerT > 300){
    ctx.save(); ctx.globalAlpha *= 0.85;
    promptLine([{key:'▲'}, {key:'▼'}, {text:'choisir'}, {gap:8}, {key:'Espace'}, {text:'valider'}], 18, '#e0d4ff');
    ctx.restore();
  }
}

// ---------------------------------------------------------------- chapters page drawing
function drawWorldView(){
  const cx = lerp(prevCamX, camX, ALPHA), cy = lerp(prevCamY, camY, ALPHA);
  viewX = cx; viewY = cy;
  drawBackground(cx, cy);
  ctx.save(); ctx.translate(-cx, -cy); drawWorld(); ctx.restore();
  drawAmbient(cx, cy);
  drawLighting(W / 2, H / 2);
}
function drawWorldPage(ox){
  ctx.save();
  ctx.beginPath(); ctx.rect(ox, 0, W, H); ctx.clip();
  ctx.translate(ox, 0);
  drawWorldView();
  const f = 0.3 * menu.bgFlash, g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(10,6,28,0.86)'); g.addColorStop(0.28, `rgba(10,6,28,${0.66 + f})`); g.addColorStop(0.64, `rgba(10,6,28,${0.64 + f})`); g.addColorStop(1, 'rgba(10,6,28,0.9)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
function drawChapters(act){ /* drawn by the 3D card deck (#chapters) */ }

function drawRow(r, x, y, w, h){
  const cy = y + h / 2;
  let lx = x + 14;
  if(r.icon){ tileIcon(r.icon, x + 12, cy - 11, 22, r.tile); lx = x + 46; }
  const col = r.danger ? (menu.resetT > 0 ? '#ff4d64' : '#ff7a8c') : r.kind === 'action' ? '#8cc4ff' : '#ffffff';
  txt(r.label, lx, cy + 5, 14, col, 600, 'left');
  if(r.kind === 'link'){
    chevronRight(x + w - 16, cy);
    let vx = x + w - 30;
    if(r.value){ txt(r.value, vx, cy + 4.5, 12.5, '#a8a0d8', 500, 'right'); ctx.font = `500 12.5px ${FU}`; vx -= ctx.measureText(r.value).width + 10; }
    if(r.badge){
      ctx.font = `700 10px ${FU}`; const bw = ctx.measureText('Nouveau').width + 14;
      rr(vx - bw, cy - 8, bw, 16, 8); ctx.fillStyle = '#ff3b30'; ctx.fill();
      txt('Nouveau', vx - bw / 2, cy + 3.5, 10, '#ffffff', 700);
    }
  } else if(r.kind === 'toggle'){
    const k = menu.knobs[r.id] === undefined ? (r.get() ? 1 : 0) : menu.knobs[r.id];
    toggleSwitch(x + w - 54, cy - 11, k, r.accent);
  } else if(r.kind === 'slider'){
    const [a, b] = sliderX(), v = r.get(), on = SET.sound, kx = a + (b - a) * v / r.max;
    rr(a, cy - 2.5, b - a, 5, 2.5); ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fill();
    if(v > 0){ rr(a, cy - 2.5, kx - a, 5, 2.5); ctx.fillStyle = on ? '#ffd54a' : '#8d86b0'; ctx.fill(); }
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.arc(kx, cy + 1.2, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(kx, cy, 8, 0, TAU); ctx.fill();
    txt(r.fmt(v), x + w - 14, cy + 4.5, 12.5, '#ffffff', 600, 'right');
  } else if(r.kind === 'choice'){
    const s = r.fmt(r.get());
    ctx.font = `600 13px ${FU}`; const sw = ctx.measureText(s).width, rx = x + w - 18;
    chevronRight(rx, cy, '#ffd54a');
    txt(s, rx - 12, cy + 4.5, 13, '#ffffff', 600, 'right');
    ctx.strokeStyle = '#ffd54a'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const lx2 = rx - 24 - sw; ctx.beginPath(); ctx.moveTo(lx2 + 3, cy - 5); ctx.lineTo(lx2 - 2, cy); ctx.lineTo(lx2 + 3, cy + 5); ctx.stroke();
  }
}
function drawListPage(p, act){
  const rows = pageRows(p);
  navHeader(PAGE_NAME[p], PAGE_NAME[PAGE_PARENT[p]], act);
  const {x, y, w} = LIST, rh = rows.length > 6 ? 31 : LIST.rh, h = rows.length * rh;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; rr(x, y + 4, w, h, 14); ctx.fill();
  rr(x, y, w, h, 14); ctx.fillStyle = 'rgba(20,13,46,0.94)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.stroke();
  const fs = clamp(menu.sel[p] || 0, 0, rows.length - 1);
  rows.forEach((r, j) => {
    const ry = y + j * rh;
    if(j > 0){ ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + (r.icon ? 46 : 14), ry, w - (r.icon ? 56 : 24), 1); }
    if(j === fs){
      ctx.save(); rr(x, y, w, h, 14); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x, ry, w, rh);
      ctx.fillStyle = '#ffd54a'; ctx.fillRect(x, ry + 7, 3, rh - 14);
      ctx.restore();
    }
    drawRow(r, x, ry, w, rh);
    if(act) hit(x, ry, w, rh, {id:p + ':' + r.id, click:px => rowClick(r, px), drag:r.kind === 'slider' ? px => sliderSet(r, px) : null, hover:() => { menu.sel[p] = j; }});
  });
  const foot = PAGE_FOOT[p] && PAGE_FOOT[p]();
  if(foot && rows.length <= 6) txt(foot, W / 2, y + h + 24, 11.5, '#c9c1f0', 500);
  if(!TOUCH) promptLine([{key:'▲'}, {key:'▼'}, {text:'choisir'}, {gap:8}, {key:'◀'}, {key:'▶'}, {text:'régler'}, {gap:8}, {key:'Espace'}, {text:'valider'}, {gap:8}, {key:'Échap'}, {text:'retour'}], 338, '#e0d4ff');
}
function drawLook(act){
  navHeader(PAGE_NAME.look, 'Paramètres', act);
  const cur = skinOf(), foc = SKINS[menu.sel.look] || cur, focOpen = skinOpen(foc);
  const px = 196, py = 292;
  softGlow(px, py - 66, 120, 100, hexRGB(cur.light).join(','), 0.32);
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.ellipse(px, py + 3, 74, 14, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1.4; ctx.stroke();
  const hop = Math.sin(titleHero.hop * Math.PI) * 18;
  drawHero(titleHero, px, py - hop, 3.7, focOpen ? {} : {tint:'#171032'});
  if(!focOpen) heading('?', px + 2, py - 150, 30, '#ffd54a');
  SKINS.forEach((s, j) => {
    const sx = 330 + (j % 5) * 54, sy = 104 + Math.floor(j / 5) * 64, open = skinOpen(s), on = s.id === cur.id, f = j === menu.sel.look;
    if(f){ ctx.strokeStyle = '#ffd54a'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(sx, sy, 24, 0, TAU); ctx.stroke(); }
    if(on){ ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(sx, sy, 20.5, 0, TAU); ctx.stroke(); }
    const g = ctx.createRadialGradient(sx - 5, sy - 6, 2, sx, sy, 18);
    g.addColorStop(0, s.light); g.addColorStop(1, s.body);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, 17, 0, TAU); ctx.fill();
    ctx.strokeStyle = s.deep; ctx.lineWidth = 1.4; ctx.stroke();
    for(const [ex, ey, r] of [[-5, -4, 4.4], [5, -1, 3.6]]){ ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(sx + ex, sy + ey, r, 0, TAU); ctx.fill(); ctx.fillStyle = '#14033f'; ctx.beginPath(); ctx.arc(sx + ex + 1.2, sy + ey + 0.8, r * 0.45, 0, TAU); ctx.fill(); }
    if(!open){ ctx.fillStyle = 'rgba(14,9,34,0.62)'; ctx.beginPath(); ctx.arc(sx, sy, 17.5, 0, TAU); ctx.fill(); padlock(sx, sy, 0.75); }
    txt(open || !(s.price || s.gems) ? s.name : s.price ? s.price + ' 🪙' : s.gems + ' 💎', sx, sy + 32, 10.5, open ? '#efe8ff' : s.price ? '#ffd54a' : s.gems ? '#9df0ff' : '#9d95c8', 600);
    if(act) hit(sx - 26, sy - 24, 52, 60, {id:'skin' + j, click:() => lookClick(j), hover:() => { menu.sel.look = j; }});
  });
  txt(foc.name, 438, 296, 17, '#ffffff', 700);
  txt(focOpen ? (foc.id === cur.id ? 'La couleur de XELIAX en ce moment' : 'Clique dessus pour la choisir') : skinHint(foc), 438, 314, 11, focOpen ? '#c9c1f0' : '#ffd54a', 500);
  txt(`🪙 ${save.bank} pièces   ·   💎 ${gemCount()} gemmes`, 438, 74, 12, '#ffe58a', 700);
  if(!TOUCH) promptLine([{key:'◀'}, {key:'▶'}, {text:'changer de couleur'}, {gap:10}, {key:'Échap'}, {text:'retour'}], 338, '#e0d4ff');
}
// page Commandes : chaque action a une touche lettre qu'on peut changer (+ des touches fixes)
const KEY_ROWS = [
  {id:'left', label:'Aller à gauche', fixed:['◀'], pad:'◀'}, {id:'right', label:'Aller à droite', fixed:['▶'], pad:'▶'},
  {id:'jump', label:'Sauter, double saut', fixed:['Espace', '▲'], pad:'▲'}, {id:'shoot', label:'Tirer (garder : super tir)', fixed:[], pad:'●'},
  {id:'dash', label:'Dash', fixed:['Maj'], pad:'»'}, {id:'talk', label:'Parler', fixed:['▼'], pad:'●'},
  {id:'pause', label:'Pause', fixed:['Échap'], pad:'II'},
];
function controlsActivate(j){
  if(j >= KEY_ROWS.length){   // dernière ligne : remettre les touches de départ
    SET.keys = Object.assign({}, KEY_DEF); persist(); menu.bindWait = null;
    showToast('Touches de départ remises', 90); SFX.menu(); return;
  }
  menu.bindWait = KEY_ROWS[j].id; menu.sel.controls = j; SFX.menu();
}
// la touche appuyée devient celle de l'action choisie (Échap annule) ; si une autre action l'avait, elles échangent
function bindKey(key){
  const a = menu.bindWait; menu.bindWait = null;
  if(key === 'Escape'){ SFX.menu(); return; }
  const k = key.toLowerCase(), name = id => KEY_ROWS.find(r => r.id === id).label;
  if(k.length !== 1 || k === ' '){ showToast('Choisis une lettre ou un chiffre', 100); SFX.hurt(); return; }
  if(k === 'm'){ showToast('M sert à couper le son : choisis une autre touche', 110); SFX.hurt(); return; }
  const other = Object.keys(SET.keys).find(o => o !== a && SET.keys[o] === k);
  if(other) SET.keys[other] = SET.keys[a];
  SET.keys[a] = k; persist(); SFX.coin();
  showToast(other ? `${name(a)} : ${k.toUpperCase()} (échangée avec « ${name(other)} »)` : `${name(a)} : touche ${k.toUpperCase()}`, 130);
}
function drawControls(act){
  navHeader(PAGE_NAME.controls, 'Paramètres', act);
  const x = 120, y = 84, w = 400, rh = 25, n = KEY_ROWS.length + 1, h = n * rh;
  const fs = clamp(menu.sel.controls || 0, 0, n - 1);
  txt('Clavier (clique pour changer)', x + 228, y - 8, 11, '#c9c1f0', 600); txt('Tactile', x + 362, y - 8, 11, '#c9c1f0', 600);
  rr(x, y, w, h, 14); ctx.fillStyle = 'rgba(20,13,46,0.94)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.stroke();
  for(let j = 0; j < n; j++){
    const ry = y + j * rh, cy = ry + rh / 2, r = KEY_ROWS[j];
    if(j > 0){ ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x + 14, ry, w - 28, 1); }
    if(j === fs){
      ctx.save(); rr(x, y, w, h, 14); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x, ry, w, rh);
      ctx.fillStyle = '#ffd54a'; ctx.fillRect(x, ry + 6, 3, rh - 12);
      ctx.restore();
    }
    if(act) hit(x, ry, w, rh, {id:'key:' + j, click:() => controlsActivate(j), hover:() => { if(!menu.bindWait) menu.sel.controls = j; }});
    if(!r){ txt('Remettre les touches de départ', x + 16, cy + 4.5, 13, '#8cc4ff', 600, 'left'); continue; }
    txt(r.label, x + 16, cy + 4.5, 13, '#ffffff', 600, 'left');
    const wait = menu.bindWait === r.id;
    const keys = [wait ? (Math.floor(frame / 20) % 2 ? '…' : '?') : keyName(r.id), ...r.fixed];
    ctx.font = `700 11px ${FU}`;
    const kws = keys.map(k => Math.max(19, ctx.measureText(k).width + 13)), total = kws.reduce((a, b) => a + b, 0) + (keys.length - 1) * 5;
    let kx = x + 228 - total / 2;
    keys.forEach((k, m) => {
      if(m === 0 && (wait || j === fs)){ rr(kx - 3, cy - 13, kws[0] + 6, 25, 7); ctx.strokeStyle = wait ? '#ff9a3c' : '#ffd54a'; ctx.lineWidth = 2; ctx.stroke(); }
      ctx.save(); if(m > 0) ctx.globalAlpha = 0.7; keycap(k, kx, cy + 4); ctx.restore(); kx += kws[m] + 5;
    });
    const pad = r.pad, pcx = x + 362;
    ctx.fillStyle = pad === '»' ? '#e0a400' : pad === '●' ? '#ff8a3d' : pad === 'II' ? '#d3c8fa' : '#5a2ee6';
    rr(pcx - (pad.length > 1 ? 18 : 11), cy - 10, pad.length > 1 ? 36 : 22, 20, 10); ctx.fill();
    txt(pad, pcx, cy + 4.5, 12, pad === 'II' ? '#2a1d63' : '#ffffff', 700, 'center', FD);
  }
  const foot = menu.bindWait ? 'Appuie sur la nouvelle touche… (Échap pour annuler)' : 'M : couper le son  ·  sur téléphone, les boutons tactiles sont sous le jeu';
  txt(foot, W / 2, y + h + 20, 11.5, menu.bindWait ? '#ffb86b' : '#c9c1f0', 500);
  if(!TOUCH) promptLine([{key:'▲'}, {key:'▼'}, {text:'choisir'}, {gap:8}, {key:'Espace'}, {text:'changer la touche'}, {gap:8}, {key:'Échap'}, {text:'retour'}], 338, '#e0d4ff');
}
function drawCreditItem(c, cy, act){
  if(c.k === 'logo'){
    heading('L\'aventure', W / 2, cy - 22, 20, '#f3ead6');
    heading('spécifique', W / 2, cy + 18, 40, '#ffffff');
    drawFicelle(W / 2 + 3, cy + 32, 170, -0.015, false, 7);
  } else if(c.k === 'small') txt(c.t, W / 2, cy + 4, 12.5, '#c9c1f0', 600);
  else if(c.k === 'name'){
    softGlow(W / 2, cy, 120, 40, '255,213,74', 0.25 + 0.1 * Math.sin(frame * 0.05));
    outlined('xeliax9', W / 2, cy + 15, 46, '#ffd54a', '#5a3a00', 6);
    for(let k = 0; k < 5; k++){ const a = frame * 0.03 + k * TAU / 5, tw = Math.max(0, Math.sin(frame * 0.08 + k * 2)); ctx.fillStyle = `rgba(255,246,200,${tw})`; star(W / 2 + Math.cos(a) * 98, cy + Math.sin(a) * 24, 2 + tw * 3, 0); }
    if(act) hit(W / 2 - 96, cy - 28, 192, 56, {id:'name', click:(x, y) => creditsTap(x, y)});
  } else if(c.k === 'role'){
    txt(c.r, W / 2, cy - 7, 12, '#c9c1f0', 500);
    txt(c.w, W / 2, cy + 14, 17, '#ffffff', 600);
  } else if(c.k === 'line') txt(c.t, W / 2, cy + 5, 17, '#ffffff', 600);
  else if(c.k === 'hero'){
    drawHero(creditsHero, W / 2, cy + 36, 2.7, {});
    txt('XELIAX, dans son propre rôle', W / 2, cy + 58, 13.5, '#f3ead6', 600);
  } else if(c.k === 'friends'){
    txt('Les amis', W / 2, cy - 46, 12, '#c9c1f0', 500);
    const names = ['Mamie Farine', 'Gaston', 'Olivia', 'Maître Levain'];
    creditNpcs.forEach((n, j) => {
      const x = W / 2 + (j - 1.5) * 96;
      drawNpc(n, x, cy + 22, 1.7, false, j < 2 ? 1 : -1);
      txt(names[j], x, cy + 44, 12.5, '#ffffff', 600);
    });
  } else if(c.k === 'magpie'){
    ctx.save(); ctx.translate(W / 2, cy - 14 + Math.sin(frame * 0.06) * 4); ctx.scale(1.2, 1.2);
    drawMagpie({x:-24, y:-20, w:48, h:40, state:'hover', phase:1, hitT:0, inv:0, face:1, lost:!!save.s2Done});
    ctx.restore();
    txt('Et La Pie Voleuse', W / 2, cy + 30, 17, '#ffffff', 600);
    txt(save.s2Done ? '(elle a fini par rendre la ficelle)' : '(rends-nous la ficelle !)', W / 2, cy + 48, 12, '#c9c1f0', 500);
  } else if(c.k === 'treasure'){
    txt('Et la vraie star', W / 2, cy - 26, 12, '#c9c1f0', 500);
    drawFicelle(W / 2, cy, 96, -0.08 + Math.sin(frame * 0.04) * 0.05, true, 12);
    txt('la ficelle aux olives', W / 2, cy + 34, 17, '#ffffff', 600);
  } else if(c.k === 'end'){
    heading('Merci d\'avoir joué !', W / 2, cy, 30, '#ffe58a');
    txt('À bientôt pour la suite des aventures de XELIAX', W / 2, cy + 24, 12.5, '#c9c1f0', 500);
  }
}
function drawCredits(act){
  navHeader('', menu.creditsFrom === 'settings' ? 'Paramètres' : 'Accueil', act);
  let y = H + 12 - menu.credY;
  for(const c of CREDITS){
    const cy = y + c.h / 2; y += c.h;
    if(cy < -90 || cy > H + 90) continue;
    const a = clamp(Math.min(cy - 58, H - 52 - cy) / 40, 0, 1);
    if(a <= 0.01) continue;
    ctx.save(); ctx.globalAlpha *= a;
    drawCreditItem(c, cy, act && a > 0.5);
    ctx.restore();
  }
  if(menu.credY >= credMax() - 1) promptLine(TOUCH ? [{key:'●'}, {text:'revenir'}] : [{key:'Échap'}, {text:'revenir'}], 338, '#e0d4ff');
  else if(!TOUCH) promptLine([{key:'Espace'}, {text:'plus vite'}], 338, 'rgba(224,212,255,0.7)');
}
function drawBonus(act){
  navHeader(PAGE_NAME.bonus, 'Paramètres', act);
  txt('Une catégorie cachée… bien trouvé !', W / 2, 74, 12.5, '#f0e2ff', 500);
  const fx = 128, fy = 88, fw = 384, fh = 214;
  ctx.fillStyle = 'rgba(0,0,0,0.2)'; rr(fx, fy + 5, fw, fh, 30); ctx.fill();
  rr(fx, fy, fw, fh, 30); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.24)'; ctx.lineWidth = 1.2; ctx.stroke();
  BONUS_CH.forEach((i, j) => {
    const cx = W / 2 + (j - (BONUS_CH.length - 1) / 2) * 180, cy = 146, s = j === menu.sel.bonus, c = CHAPTERS[i], open = isUnlocked(i);
    let ax = cx;
    if(s && menu.shakeT > 0) ax += Math.sin(menu.shakeT * 1.7) * menu.shakeT * 0.35;
    drawAppIcon(i, ax, cy - (s ? 3 : 0) + (REDUCED || !s ? 0 : Math.sin(frame * 0.05) * 1.4), 84 * (s ? 1.14 : 1), {sel:s});
    txt(c.name, cx, cy + 68, 14.5, open ? '#ffffff' : '#a49cd0', 600);
    txt(open ? `2 défis géants · à battre : ${fmt(c.parTime)}` : lockText(i), cx, cy + 86, 11.5, open ? '#d6ceff' : '#ff9aa8', 500);
    if(open){
      const got = c.bonus2 ? save.crystalFicelle : save.goldFicelle, label = `${c.bonus2 ? 'Ficelle de cristal' : 'Ficelle dorée'} : ${got ? 'gagnée !' : 'à gagner'}`;
      ctx.font = `600 11.5px ${FU}`; const lw = ctx.measureText(label).width;
      ctx.save(); ctx.globalAlpha *= got ? 1 : 0.45; drawFicelle(cx - lw / 2 - 14, cy + 100, 20, -0.3, false, 4.5, c.bonus2 ? 'crystal' : 'gold'); ctx.restore();
      txt(label, cx + 4, cy + 104, 11.5, got ? '#ffe58a' : '#c9c1f0', 600);
      const best = save.bestCh[i];
      if(best != null) txt(`Record ${fmt(best)}`, cx, cy + 121, 11, '#9fe8b0', 500);
    }
    if(act) hit(cx - 82, cy - 54, 164, 186, {id:'bonus' + j, click:() => { if(menu.sel.bonus === j) playChapter(i); else { menu.sel.bonus = j; SFX.menu(); } }});
  });
  if(TOUCH) txt('Touche un bonus pour le choisir, puis encore pour jouer', W / 2, 338, 11.5, '#d6ceff', 500);
  else promptLine([{key:'◀'}, {key:'▶'}, {text:'choisir'}, {gap:8}, {key:'Espace'}, {text:'jouer'}, {gap:8}, {key:'Échap'}, {text:'retour'}], 338, '#e0d4ff');
}

// ---------------------------------------------------------------- one menu frame
function drawPageContent(p, ox, act){
  if(ox <= -W || ox >= W) return;
  ctx.save(); ctx.translate(ox, 0);
  if(p === 'home') drawHome(act);
  else if(p === 'chapters') drawChapters(act);
  else if(p === 'look') drawLook(act);
  else if(p === 'controls') drawControls(act);
  else if(p === 'credits') drawCredits(act);
  else if(p === 'bonus') drawBonus(act);
  else drawListPage(p, act);
  ctx.restore();
}
// ---------------------------------------------------------------- the cover: press Space, it splits open onto the home page
function openSplash(){
  if(!menu.splash || menu.splash.open) return;
  initAudio();
  menu.splash.open = true; menu.splash.t = 0; menu.introT = 0; menu.heroIn = false;
  tone(140, 0.5, 'sawtooth', 0.035, 60); tone(520, 0.35, 'triangle', 0.04, 1300, 0.05); tone(1040, 0.3, 'sine', 0.03, 2080, 0.12);
}
function drawCover(){
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b0626'); g.addColorStop(0.5, '#2a1260'); g.addColorStop(1, '#0b0626');
  ctx.fillStyle = g; ctx.fillRect(-20, -20, W + 40, H + 40);
  for(let i = 0; i < 70; i++){
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(frame * 0.02 + i * 1.7));
    ctx.fillStyle = `rgba(255,244,230,${0.15 + 0.6 * hash(i * 29) * tw})`;
    ctx.beginPath(); ctx.arc(hash(i * 13 + 5) * W, hash(i * 17 + 3) * H, 0.5 + hash(i * 3) * 1.2, 0, TAU); ctx.fill();
  }
  softGlow(W / 2, H / 2, 300, 120, '160,110,255', 0.35 + 0.08 * Math.sin(frame * 0.05));
  heading('L\'aventure', W / 2, 140, 26, '#f3ead6');
  heading('spécifique', W / 2, 196, 60, '#ffffff');
  drawFicelle(W / 2 + 4, 214, 270, -0.015, false, 10);
  const hop = Math.abs(Math.sin(frame * 0.06)) * 10;
  drawHero(creditsHero, W / 2, 104 - hop, 1.8, {});
  if(REDUCED || Math.floor(frame / 32) % 2 === 0 || (menu.splash && menu.splash.open)){
    if(TOUCH) txt('Touche l\'écran pour commencer', W / 2, 286, 15, '#ffe58a', 600);
    else promptLine([{text:'Appuie sur'}, {key:'Espace'}, {text:'pour commencer'}], 286, '#ffe58a');
  }
  txt('un jeu de xeliax9', W / 2, 336, 12, '#a49cd0', 500);
}
function drawSplash(){
  const sp = menu.splash; if(!sp) return;
  const e = sp.open ? easeInOutCubic(clamp(sp.t / 54, 0, 1)) : 0;
  const off = e * (H / 2 + 30);
  for(const half of [0, 1]){
    ctx.save();
    ctx.translate(0, half ? off : -off);
    ctx.beginPath(); ctx.rect(-20, half ? H / 2 : -20, W + 40, H / 2 + 20); ctx.clip();
    drawCover();
    // a glowing seam where the cover splits
    const sy = H / 2, a = sp.open ? 1 - e : 0.35 + 0.2 * Math.sin(frame * 0.08);
    ctx.fillStyle = `rgba(255,214,120,${a})`; ctx.fillRect(-20, half ? sy : sy - 2, W + 40, 2);
    ctx.restore();
  }
  if(sp.open && sp.t < 20){ ctx.fillStyle = `rgba(255,240,200,${0.5 * (1 - sp.t / 20)})`; ctx.fillRect(0, H / 2 - 40 * (1 - sp.t / 20), W, 80 * (1 - sp.t / 20)); }
}
function drawMenu(){
  menu.hits = [];
  let sx = 0, sy = 0;
  if(shake > 0){ sx = shake * Math.sin(frame * 1.7) * 0.6; sy = shake * Math.cos(frame * 2.1) * 0.6; }
  ctx.save(); ctx.translate(sx, sy);
  const moving = menu.t < 1 && menu.from, e = moving ? easeInOutCubic(menu.t) : 1;
  const to = menu.page, from = moving ? menu.from : null;
  const oTo = moving ? menu.dir * W * (1 - e) : 0, oFrom = moving ? -menu.dir * W * e : 0;
  const homeBg = p => p !== 'chapters';
  if(homeBg(to) || (from && homeBg(from))){
    drawHomeScene();
    const dt = homeBg(to) ? PAGE_DIM[to] : 0, df = from && homeBg(from) ? PAGE_DIM[from] : 0;
    const dim = from ? (homeBg(to) && homeBg(from) ? lerp(df, dt, e) : homeBg(to) ? dt : df) : dt;
    if(dim > 0.003){ ctx.fillStyle = `rgba(10,6,28,${dim})`; ctx.fillRect(-20, -20, W + 40, H + 40); }
  }
  if(from === 'chapters') drawWorldPage(oFrom);
  if(to === 'chapters') drawWorldPage(oTo);
  if(from) drawPageContent(from, oFrom, false);
  drawPageContent(to, oTo, !moving && fadeDir === 0);
  drawMenuFx();
  ctx.restore();
  drawSplash();
}

function overlayDim(a=0.55){
  ctx.fillStyle = `rgba(10,6,28,${a * clamp(stateT / 12, 0, 1)})`;
  ctx.fillRect(0, 0, W, H);
}
function panelIn(){ return REDUCED ? 1 : easeOutBack(clamp(stateT / 18, 0, 1)); }
function panelBox(w, h, accent, y0){
  const s = 0.88 + 0.12 * panelIn();
  const x = W / 2 - w / 2, y = y0 === undefined ? H / 2 - h / 2 + 10 : y0;
  ctx.globalAlpha = clamp(stateT / 10, 0, 1);
  ctx.translate(W / 2, y + h / 2); ctx.scale(s, s); ctx.translate(-W / 2, -(y + h / 2));
  rr(x, y, w, h, 20); ctx.fillStyle = 'rgba(18,11,42,0.94)'; ctx.fill();
  ctx.strokeStyle = rgba(accent, 0.55); ctx.lineWidth = 1.5; ctx.stroke();
  return {x, y, w, h};
}
function panelContent(b){
  ctx.globalAlpha = clamp(stateT / 10, 0, 1);
  const s = 0.88 + 0.12 * panelIn();
  ctx.translate(W / 2, b.y + b.h / 2); ctx.scale(s, s); ctx.translate(-W / 2, -(b.y + b.h / 2));
}
const counted = (v, delay) => v * easeOutCubic(clamp((stateT - delay) / 40, 0, 1));

function drawPause(){
  overlayDim(0.55);
  ctx.save();
  const b = panelBox(320, 206, CH_ACCENT[chIndex]);
  heading('Pause', W / 2, b.y + 48, 32, '#ffffff');
  txt(`${chName(chIndex)}, salle ${rIndex + 1}, ${score} points`, W / 2, b.y + 70, 12.5, '#bfb6f0', 500);
  const rows = TOUCH ? [['▲', 'Reprendre'], ['●', 'Retour au menu']] : [['P', 'Reprendre'], ['R', 'Recommencer le chapitre'], ['Q', 'Retour au menu'], ['M', muted ? 'Activer le son' : 'Couper le son']];
  rows.forEach(([key2, label], i) => {
    const ry = b.y + 104 + i * 25;
    const kw = keycap(key2, b.x + 78, ry);
    txt(label, b.x + 78 + kw + 10, ry, 13, '#ffffff', 600, 'left');
  });
  ctx.restore();
}

function drawGameOver(){
  overlayDim(0.62);
  ctx.save();
  const b = panelBox(330, 210, '#ff4d6d', H / 2 - 92);
  ctx.restore();
  ctx.save();
  panelContent(b);
  drawHero(uiHero, W / 2, b.y + 4 + Math.sin(frame * 0.04) * 1.5, 1.8, {});
  heading('Game over', W / 2, b.y + 72, 34, '#ff8aa0');
  txt(chapter.bonus ? `XELIAX est tombé dans le bonus « ${chapter.name} », salle ${rIndex + 1}` : `XELIAX est tombé au chapitre ${chNum(chIndex)}${chapter.season === 2 ? ' (saison 2)' : ''}, salle ${rIndex + 1}`, W / 2, b.y + 94, 12.5, '#bfb6f0', 500);
  const again = room.boss ? 'recommencer la phase' : chapter.bonus ? 'recommencer la salle' : 'recommencer le chapitre';
  if(TOUCH){ promptLine([{key:'▲'}, {text:again}], b.y + 134); promptLine([{key:'●'}, {text:'menu'}], b.y + 162, '#bfb6f0'); }
  else { promptLine([{key:'Espace'}, {text:again}], b.y + 134); promptLine([{key:'Q'}, {text:'menu'}], b.y + 162, '#bfb6f0'); }
  ctx.restore();
}

function drawChapterClear(){
  overlayDim(0.6);
  if(!clearInfo) return;
  ctx.save();
  const b = panelBox(350, 238, CH_ACCENT[chIndex], H / 2 - 104);
  ctx.restore();
  ctx.save();
  panelContent(b);
  drawHero(uiHero, W / 2, b.y + 2 - Math.abs(Math.sin(frame * 0.16)) * 10, 1.8, {});
  heading(clearInfo.bonus ? 'Défi bonus réussi !' : `Chapitre ${chNum(chIndex)} terminé`, W / 2, b.y + 64, 27, CH_ACCENT[chIndex]);
  txt(clearInfo.bonus ? (!clearInfo.fast ? 'Trop lent pour la ficelle : R pour retenter !' : clearInfo.bonus2 ? 'La ficelle de cristal est à toi.' : 'La ficelle dorée est à toi.') : chapter.name, W / 2, b.y + 85, 12.5, '#bfb6f0', 500);
  const rows = [
    ['Temps', fmt(counted(clearInfo.time, 10)), clearInfo.newBest && stateT > 50 ? 'Record !' : ''],
    clearInfo.bonus ? ['Médaille', stateT > 40 ? (clearInfo.medal ? clearInfo.medal[0].toUpperCase() + clearInfo.medal.slice(1) : 'aucune') : '', clearInfo.medal === 'or' && stateT > 55 ? 'Or !' : '']
      : ['Pièces', `${Math.round(counted(clearInfo.coins, 20))} sur ${clearInfo.total}`, clearInfo.coins === clearInfo.total && stateT > 60 ? 'Toutes !' : ''],
    [clearInfo.bonus ? (clearInfo.bonus2 ? 'Ficelle de cristal' : 'Ficelle dorée') : 'Gemme secrète', stateT > 40 ? (clearInfo.bonus ? (clearInfo.fast ? 'gagnée' : 'trop lent') : clearInfo.gem ? 'trouvée' : 'manquée') : '', ''],
    chapter.season === 2 || chapter.bonus2 ? ['Pouvoirs', stateT > 45 ? ['gravité', hasWall && 'murs', hasDash && 'dash'].filter(Boolean).join(', ') : '', ''] : ['Recette', stateT > 45 ? recipeShort() : '', ''],
    ['Score', String(Math.round(counted(score, 30))), ''],
  ];
  rows.forEach(([k, v, tag], i) => {
    const ry = b.y + 109 + i * 20;
    txt(k, b.x + 58, ry, 12.5, '#bfb6f0', 500, 'left');
    txt(v, b.x + b.w - 58, ry, 13.5, '#ffffff', 700, 'right');
    if(tag){ ctx.font = `700 10px ${FU}`; const tw = ctx.measureText(tag).width + 12; rr(b.x + b.w - 58 - 112 - tw, ry - 11, tw, 15, 7); ctx.fillStyle = '#ffd54a'; ctx.fill(); txt(tag, b.x + b.w - 58 - 112 - tw / 2, ry, 10, '#3a2400', 700); }
  });
  const nextTxt = clearInfo.bonus ? 'retour au menu' : demoOn() && !isUnlocked(chIndex + 1) ? 'fin de la démo' : 'chapitre suivant';
  if(stateT >= 45 && (Math.floor(frame / 30) % 2 === 0 || REDUCED)) promptLine(TOUCH ? [{key:'▲'}, {text:nextTxt}] : [{key:'Espace'}, {text:nextTxt}], b.y + b.h - 15);
  ctx.restore();
}

function drawWin(){
  overlayDim(0.55);
  if(!REDUCED){
    const cols = ['#ffd54a', '#2ee6ff', '#ff6fa5', '#8cff7a', '#ff8a3d', '#b48cff'];
    for(let i = 0; i < 60; i++){
      const sp = 0.6 + hash(i * 7) * 1.2;
      const y = ((frame * sp + hash(i * 3) * (H + 40)) % (H + 40)) - 20;
      const x = hash(i * 11) * W + Math.sin(frame * 0.03 + i) * 12;
      ctx.save(); ctx.translate(x, y); ctx.rotate(frame * 0.05 * (hash(i) - 0.5) * 4);
      ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-2, -3, 4, 6);
      ctx.restore();
    }
  }
  if(!clearInfo) return;
  ctx.save();
  const b = panelBox(370, clearInfo.bonusNew ? 268 : 250, '#ffd54a', H / 2 - (clearInfo.bonusNew ? 104 : 98));
  ctx.restore();
  ctx.save();
  panelContent(b);
  drawHero(uiHero, W / 2, b.y + 2 - Math.abs(Math.sin(frame * 0.16)) * 12, 1.9, {ficelle:true});
  const s2 = clearInfo.season === 2;
  heading(s2 ? 'Saison 2 terminée !' : 'Victoire !', W / 2, b.y + 72, s2 ? 32 : 38, '#ffe58a');
  txt(s2 ? 'La pie a rendu la ficelle aux olives !' : 'XELIAX a retrouvé la ficelle aux olives.', W / 2, b.y + 93, 13, '#e9e2ff', 500);
  const rows = [
    ['Temps total', fmt(counted(elapsed, 10))],
    ['Record', runFromStart ? (clearInfo.runBest ? 'nouveau record !' : fmt(s2 ? save.bestRun2 : save.bestRun)) : 'compté depuis le chapitre 1'],
    ['Gemmes', `${gemsOf(s2 ? 2 : 1)} sur 4`],
    s2 ? ['Pouvoirs', 'gravité, murs, dash'] : ['Recette', recipeShort()],
    ['Score', String(Math.round(counted(score, 30)))],
  ];
  rows.forEach(([k, v], i) => {
    const ry = b.y + 120 + i * 20;
    txt(k, b.x + 52, ry, 12.5, '#bfb6f0', 500, 'left');
    txt(v, b.x + b.w - 52, ry, 13, '#ffffff', 700, 'right');
  });
  if(clearInfo.bonusNew && stateT > 60){
    ctx.save(); ctx.globalAlpha = clamp((stateT - 60) / 20, 0, 1);
    ctx.fillStyle = '#ffd54a'; star(b.x + 40, b.y + 222, 6, frame * 0.03);
    txt(s2 ? 'Psst… un nouveau bonus secret t\'attend dans les Paramètres !' : 'Psst… un bonus secret se cache dans les Paramètres !', b.x + 52, b.y + 226, 12, '#ffe58a', 600, 'left');
    ctx.restore();
  }
  if(stateT >= 45) promptLine(TOUCH ? [{key:'▲'}, {text:'retour au menu'}] : [{key:'Espace'}, {text:'retour au menu'}], b.y + b.h - 14);
  ctx.restore();
}

// the iris: a circle closes on XELIAX, then opens on the next room
function drawIris(){
  if(fade <= 0) return;
  const e = easeInOutCubic(clamp(fade, 0, 1));
  const r = (1 - e) * 760;
  let cx = W / 2, cy = H / 2;
  if(state === 'play' && room && !player.dead){ cx = clamp(ix(player) + player.w / 2 - viewX, 0, W); cy = clamp(iy(player) + player.h / 2 - viewY - 4, 0, H); }
  ctx.fillStyle = '#0d0820';
  ctx.beginPath(); ctx.rect(0, 0, W, H);
  if(r > 0.5) ctx.arc(cx, cy, r, 0, TAU, true);
  ctx.fill('evenodd');
  if(r > 0.5 && r < 200){ ctx.strokeStyle = 'rgba(123,86,255,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); }
}

