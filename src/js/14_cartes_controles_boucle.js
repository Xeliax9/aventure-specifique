// =====================================================================
//  CHAPTER DECK: the chapters as a 3D stack of cards (HTML + CSS 3D), laid
//  over the canvas. menu.scroll (shared with the keyboard and the wheel)
//  drives it; every frame each card gets its transform from its distance
//  to the centre, so dragging, flinging and snapping all stay smooth.
// =====================================================================
const deck = {root:document.getElementById('chapters'), cards:[], on:false, drag:null, k:1, built:false};
const DECK_GAP = 118;       // first neighbour, then the stack tightens
function deckEl(tag, cls, parent, text){ const e = document.createElement(tag); if(cls) e.className = cls; if(text) e.textContent = text; if(parent) parent.appendChild(e); return e; }
function buildDeck(){
  const st = deck.root.querySelector('.stage');
  deck.glow = deckEl('div', 'glow', st);
  deck.back = deckEl('button', 'back', st, 'Accueil'); deck.back.tabIndex = -1;
  deck.head = deckEl('div', 'head', st);
  deckEl('b', '', deck.head, 'Chapitres'); deck.season = deckEl('span', '', deck.head);
  deck.deckEl = deckEl('div', 'deck', st);
  for(const i of ALL_MAIN){
    const c = deckEl('div', 'card', deck.deckEl);
    const cv = deckEl('canvas', '', c);
    const badge = deckEl('div', 'badge', c);
    const body = deckEl('div', 'body', c);
    const kick = deckEl('div', 'kick', body), name = deckEl('div', 'name', body, CHAPTERS[i].name), tag = deckEl('div', 'tag', body, TAGLINE[i] || '');
    const stat = deckEl('div', 'stat', c), shade = deckEl('div', 'shade', c), ring = deckEl('div', 'ring', c);
    c.style.setProperty('--c', CH_ACCENT[i]); kick.style.color = CH_ACCENT[i];
    deck.cards.push({i, el:c, cv, g:cv.getContext('2d'), badge, kick, stat, shade, painted:-99, key:''});
  }
  deck.play = deckEl('button', 'play', st, 'JOUER'); deck.play.tabIndex = -1;
  deck.hint = deckEl('div', 'hint', st, TOUCH ? 'Glisse les cartes, touche celle du milieu pour jouer' : '◀ ▶ ou glisser : choisir · S : saison · Espace : jouer · Échap : retour');
  deck.back.addEventListener('click', () => { if(deckLive()){ goBack(); canvas.focus({preventScroll:true}); } });
  deck.play.addEventListener('click', () => { if(deckLive()){ playChapter(menuSel); canvas.focus({preventScroll:true}); } });
  const D = deck.deckEl;
  D.addEventListener('pointerdown', ev => {
    if(!deckLive()) return;
    initAudio();
    try{ D.setPointerCapture(ev.pointerId); }catch(e){}
    deck.drag = {x0:ev.clientX, s0:menu.scroll, lx:ev.clientX, v:0, moved:false, card:ev.target.closest('.card')};
    ev.preventDefault();
  });
  D.addEventListener('pointermove', ev => {
    const d = deck.drag; if(!d) return;
    const dx = (ev.clientX - d.x0) / deck.k;
    if(Math.abs(dx) > 6 && !d.moved){ d.moved = true; D.classList.add('drag'); menu.drag = {moved:true}; }
    if(d.moved){
      menu.scroll = d.s0 - dx * APP.step / DECK_GAP;
      d.v = d.v * 0.6 + ((ev.clientX - d.lx) / deck.k) * APP.step / DECK_GAP * 0.4; d.lx = ev.clientX;
      const k = nearestApp(menu.scroll);
      if(MAIN_CH[k] !== menuSel) selectApp(MAIN_CH[k], true);
    }
  });
  const end = ev => {
    const d = deck.drag; deck.drag = null; menu.drag = null; D.classList.remove('drag');
    if(!d) return;
    if(d.moved){ selectApp(MAIN_CH[nearestApp(menu.scroll - d.v * 7)], true); return; }   // fling, then snap to the nearest card
    if(ev.type === 'pointercancel' || !d.card) return;
    const c = deck.cards.find(q => q.el === d.card);
    if(!c) return;
    if(c.i === menuSel) playChapter(c.i); else selectApp(c.i);        // a side card glides to the middle
    canvas.focus({preventScroll:true});
  };
  D.addEventListener('pointerup', end);
  D.addEventListener('pointercancel', end);
  deck.root.addEventListener('wheel', ev => { ev.preventDefault(); if(deckLive()) menuWheel(Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY); }, {passive:false});
  deck.built = true;
}
// ---- admin login (debugging): the right password turns the creator mode on, which opens everything
// seule l'empreinte SHA-256 du mot de passe est dans le code (le jeu est public sur GitHub) : on ne peut pas le relire
const ADMIN_HASH = '1f86c446121a0219e5eae8c531981ee550b0844384f1603bc0c9eb625b2c3d91';
async function sha256hex(t){
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
const adminEl = document.getElementById('admin'), adminInput = adminEl.querySelector('input'), adminErr = adminEl.querySelector('.err');
let adminOpen = false;
function openAdmin(){
  const r = canvas.getBoundingClientRect();
  Object.assign(adminEl.style, {left:r.left + 'px', top:r.top + 'px', width:r.width + 'px', height:r.height + 'px'});
  adminEl.classList.add('on'); adminOpen = true; adminErr.textContent = ''; adminInput.value = '';
  setTimeout(() => adminInput.focus(), 30);
}
function closeAdmin(){ adminEl.classList.remove('on'); adminOpen = false; canvas.focus({preventScroll:true}); }
// no <form>: a sandboxed page may block form submission, so Enter and the button call this directly
async function adminTry(){
  let good = false;
  try{ good = await sha256hex(adminInput.value) === ADMIN_HASH; }catch(e){}
  if(good){
    SET.creatorFound = true; setSetting('creator', true);
    closeAdmin(); showToast('Admin connecté : tout est débloqué', 140); SFX.power();
  } else { adminErr.textContent = 'Mot de passe incorrect'; adminInput.select(); SFX.hurt(); }
}
adminEl.querySelector('.ok').addEventListener('click', adminTry);
adminEl.querySelector('.no').addEventListener('click', closeAdmin);
adminInput.addEventListener('keydown', ev => {
  ev.stopPropagation();
  if(ev.key === 'Enter'){ ev.preventDefault(); adminTry(); }
  else if(ev.key === 'Escape'){ ev.preventDefault(); closeAdmin(); }
});
const deckLive = () => state === 'title' && menu.page === 'chapters' && menu.t >= 1 && fade < 0.3;
function placeDeck(){
  const r = canvas.getBoundingClientRect();
  const s = deck.root.style;
  s.left = r.left + 'px'; s.top = r.top + 'px'; s.width = r.width + 'px'; s.height = r.height + 'px';
  const k = r.width / W;
  if(Math.abs(k - deck.k) > 1e-4 || !deck.placed){
    deck.k = k; deck.placed = true;
    // zoom (et non transform: scale) : le navigateur redessine le texte des cartes à la bonne taille, sans flou
    deck.root.querySelector('.stage').style.zoom = k;
    const px = Math.round(136 * k * Math.min(window.devicePixelRatio || 1, 2) * 1.15);
    for(const c of deck.cards){ c.cv.width = px; c.cv.height = Math.round(px * 108 / 136); c.painted = -99; }
  }
}
// the card art reuses the app-icon drawings: point the drawing helpers at the card's canvas for a moment
function paintCard(c){
  const g = c.g, k = c.cv.width / 136, prev = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.cv.width, c.cv.height);
  ctx = g;
  try{ g.setTransform(k * 1.36, 0, 0, k * 1.36, 0, -14 * k); appArt(c.i); }
  finally{ ctx = prev; }
  c.painted = frame;
}
function cardInfo(i){
  const ch = CHAPTERS[i], locked = !isUnlocked(i), best = save.bestCh[i];
  const notInDemo = demoOn() && (ch.bonus || ch.season === 2 || i > 1);
  const badge = locked ? [notInDemo ? 'Démo 🔒' : 'Verrouillé 🔒', ''] : best != null ? ['Complété ⭐', 'done'] : isNewApp(i) ? ['Nouveau', 'new'] : ['Débloqué', ''];
  const kick = ch.season === 2 ? `Saison 2 · Ch. ${ch.num}` : `Saison 1 · Ch. ${i + 1}`;
  const stat = locked ? (notInDemo ? '🔒 Pas dans la démo' : '🔒 Finis le chapitre d\'avant')
    : `${ch.rooms.length} salles · ${best != null ? 'record ' + fmt(best) : 'pas de record'}${save.gems[i] ? ' · 💎' : ''}`;
  return {locked, badge, kick, stat};
}
function syncDeck(){
  const show = deckLive();
  if(show && !deck.built) buildDeck();
  if(show !== deck.on){ deck.on = show; deck.root.classList.toggle('on', show); deck.root.setAttribute('aria-hidden', show ? 'false' : 'true'); if(!show && deck.drag){ deck.drag = null; menu.drag = null; } }
  if(!show) return;
  placeDeck();
  const acc = CH_ACCENT[menuSel];
  deck.root.style.setProperty('--accent', acc);
  deck.season.textContent = seasonOf(menuSel) === 2 ? 'Saison 2 · La pie voleuse' : 'Saison 1 · La ficelle disparue';
  if(!TOUCH){ const h = '◀ ▶ ou glisser : choisir · ' + (s2Visible() ? 'S : saison · ' : '') + 'Espace : jouer · Échap : retour'; if(deck.hint.textContent !== h) deck.hint.textContent = h; }
  deck.head.classList.toggle('dim', toast.t > 0);
  const pulse = REDUCED ? 0 : Math.sin(frame * 0.07) * 0.012;
  for(const c of deck.cards){
    const k = appIndex(c.i), d = (appPos(k) - menu.scroll) / APP.step, a = Math.abs(d), sg = Math.sign(d), n = Math.min(a, 1);
    if(k < 0 || a > 3.4){ c.el.style.visibility = 'hidden'; continue; }
    c.el.style.visibility = 'visible';
    let x = sg * (n * DECK_GAP + Math.max(0, a - 1) * 74);
    if(c.i === menuSel && menu.shakeT > 0) x += Math.sin(menu.shakeT * 1.7) * menu.shakeT * 0.5;
    const z = -n * 100 - Math.max(0, a - 1) * 70;
    const ry = -sg * n * 25;
    const sc = (1.13 + (1 - n) * pulse) * (1 - n) + 0.85 * n - Math.max(0, a - 1) * 0.04;
    c.el.style.transform = `translateX(${x.toFixed(2)}px) translateZ(${z.toFixed(1)}px) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
    c.el.style.opacity = (a <= 1 ? 1 - 0.4 * n : Math.max(0, 0.6 - (a - 1) * 0.3)).toFixed(3);
    c.el.style.zIndex = String(100 - Math.round(a * 10));
    c.shade.style.opacity = (0.42 * n).toFixed(3);
    c.el.classList.toggle('active', c.i === menuSel && a < 0.5);
    const info = cardInfo(c.i), key = info.badge[0] + info.stat + info.locked;
    if(key !== c.key){
      c.key = key; c.badge.textContent = info.badge[0]; c.badge.className = 'badge ' + info.badge[1];
      c.kick.textContent = info.kick; c.stat.textContent = info.stat; c.el.classList.toggle('locked', info.locked);
    }
    if(frame - c.painted >= (a < 1.5 ? 2 : 8)) paintCard(c);
  }
  const locked = !isUnlocked(menuSel);
  deck.play.classList.toggle('locked', locked);
  deck.play.textContent = locked ? (cardInfo(menuSel).badge[0] === 'Démo 🔒' ? 'DÉMO 🔒' : 'VERROUILLÉ 🔒') : 'JOUER';
}
window.addEventListener('resize', () => { deck.placed = false; });

// numéro de version, discret, en bas à gauche des menus
function drawVersion(){
  if(!VERSION) return;
  ctx.save(); ctx.globalAlpha = 0.55;
  txt(VERSION + (DEMO ? (SET.creator ? ' · démo (admin : tout ouvert)' : ' · démo') : ''), 8, H - 8, 10, '#e0d4ff', 600, 'left');
  ctx.restore();
}
function render(alpha){
  if(alpha !== undefined) ALPHA = alpha;
  if(!room) return;
  fxTick = frame !== lastRenderFrame; lastRenderFrame = frame;
  syncDeck();
  if(state === 'pet'){ drawPet(); drawIris(); return; }
  if(state === 'ending'){ drawEnding(); drawEndSkip(); drawIris(); return; }
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  if(state === 'title'){ drawMenu(); drawMenuToast(); drawVersion(); drawIris(); return; }
  const cx = lerp(prevCamX, camX, ALPHA), cy = lerp(prevCamY, camY, ALPHA);
  viewX = cx; viewY = cy;
  let sx = 0, sy = 0;
  if(shake > 0){ sx = shake * (Math.sin(frame * 1.7) * 0.6 + Math.sin(frame * 3.3) * 0.4); sy = shake * (Math.cos(frame * 2.1) * 0.6 + Math.sin(frame * 4.1) * 0.4); }
  ctx.save();
  ctx.translate(sx, sy);
  drawBackground(cx, cy);
  ctx.save();
  ctx.translate(-cx, -cy);
  drawWorld();
  ctx.restore();
  drawAmbient(cx, cy);
  const hx = ix(player) + player.w / 2 - cx, hy = iy(player) + player.h / 2 - cy;
  drawLighting(hx, hy);
  ctx.restore();

  // the HUD steps aside while a boss makes its entrance
  const ck = cineBars();
  if(ck < 0.99){ ctx.save(); ctx.globalAlpha = 1 - ck; drawHUD(); ctx.restore(); }
  drawCine();
  drawFinaleOverlay(cx, cy);
  drawFinalePrompt();
  drawBanner();
  if(state === 'pause') drawPause();
  if(state === 'over') drawGameOver();
  if(state === 'chapter') drawChapterClear();
  if(state === 'win') drawWin();
  drawTalk();
  drawToast();
  drawBossDemo();
  drawFlyers();
  drawIris();
}

// =====================================================================
//  INPUT
// =====================================================================
function confirmAction(){
  if(fadeDir !== 0) return true;
  if(bossDemo && state === 'play'){ input.demoNext = true; return true; }
  if(state === 'title'){ menuKey('enter'); return true; }
  if(state === 'over'){
    // boss rooms: retry the current phase; anywhere else: back to the start of the chapter
    if(room.boss) transition(restartPhase);
    else if(chapter.bonus) transition(restartRoom);
    else transition(() => { continues++; startChapter(chIndex, false); anim.appear = 0; setState('play'); });
    return true;
  }
  if((state === 'chapter' || state === 'win') && stateT < 45) return true;
  if(state === 'chapter'){
    if(clearInfo && clearInfo.bonus){ toMenu(); return true; }
    if(demoOn() && !isUnlocked(chIndex + 1)){ toMenu(); showToast('Fin de la démo : merci d\'avoir joué ! La suite arrive bientôt', 260); return true; }
    transition(() => { startChapter(chIndex + 1, true); anim.appear = 0; setState('play'); });
    return true;
  }
  if(state === 'win'){
    // end of season 2: after the ending, the credits roll
    const s2 = clearInfo && clearInfo.season === 2;
    toMenu();
    if(s2) goPage('credits', 1);
    return true;
  }
  if(state === 'talk'){ advanceTalk(); return true; }
  if(state === 'pause'){ setState('play'); return true; }
  return false;
}

function pressJump(){
  initAudio();
  input.jumpHeld = true;
  if(confirmAction()) return;
  input.jumpPressed = true;
}

function backToMenu(){ if(state === 'pause' || state === 'over') toMenu(); else if(state === 'pet') closePet(); }

function togglePause(){
  if(state === 'play' && fadeDir === 0) setState('pause');
  else if(state === 'pause') setState('play');
}

window.addEventListener('keydown', e => {
  if(adminOpen) return;           // typing the admin password
  if(state === 'title' && menu.bindWait){ e.preventDefault(); if(!e.repeat) bindKey(e.key); return; }   // page Commandes : on attend la nouvelle touche
  let k = e.key.toLowerCase();
  if(state === 'play' || state === 'talk') k = gameKey(k);   // touches choisies par le joueur
  if(k === 'a' && state === 'chapter' && feedbackBtn){ if(!e.repeat) openFeedback(); return; }   // fin de la démo : donner son avis
  if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault();
  initAudio();
  if(state === 'pet'){
    if(e.repeat) return;
    if(k === 'a' || k === 'arrowleft') petSelect(-1);
    else if(k === 'd' || k === 'arrowright') petSelect(1);
    else if(k === ' ' || k === 'w' || k === 'arrowup' || k === 'enter') petGive(pet.sel);
    else if(k === 'e' || k === 's' || k === 'arrowdown') petTouch('belly');
    else if(k === 'escape' || k === 'q' || k === 'p') closePet();
    else if(k === 'm') setMuted(!muted);
    return;
  }
  if(state === 'title'){
    if(k === 'backspace') e.preventDefault();
    if(k === 'm'){ if(!e.repeat) setMuted(!muted); return; }
    menuKey(k, e.repeat);
    return;
  }
  if(k === 'a' || k === 'arrowleft') input.left = true;
  if(k === 'd' || k === 'arrowright') input.right = true;
  if((k === 'w' || k === ' ' || k === 'arrowup' || k === 'enter') && !e.repeat) pressJump();
  if(k === 'j' && !e.repeat && state === 'play'){ input.shootPressed = true; input.shootHeld = true; }
  if((k === 'k' || k === 'shift') && !e.repeat && state === 'play') input.dashPressed = true;
  if((k === 'e' || k === 's' || k === 'arrowdown') && !e.repeat) interact();
  if((k === 'p' || k === 'escape') && !e.repeat){ if(state === 'talk') endTalk(); else togglePause(); }
  if(k === 'r' && !e.repeat && isSpeedrun()) srRestart();
  if(k === 'm' && !e.repeat) setMuted(!muted);
  if(k === 'q' && !e.repeat) backToMenu();
  if(k === 'c' && !e.repeat && state === 'over') confirmAction();
  if(k === 'r' && !e.repeat && state === 'pause') transition(() => { startChapter(chIndex, false); anim.appear = 0; setState('play'); });
});
window.addEventListener('keyup', e => {
  const k = gameKey(e.key.toLowerCase());
  if(k === 'a' || k === 'arrowleft') input.left = false;
  if(k === 'd' || k === 'arrowright') input.right = false;
  if(k === 'w' || k === ' ' || k === 'arrowup' || k === 'enter'){ input.jumpHeld = false; menu.credFast = false; }
  if(k === 'j') input.shootHeld = false;
});
window.addEventListener('blur', () => { input.left = input.right = input.jumpHeld = input.shootHeld = false; if(state === 'play') setState('pause'); });

const PAD_FN = {};
function bindPad(id, down, up){
  const b = document.getElementById(id);
  const d = ev => { ev.preventDefault(); initAudio(); down(); };
  const u = ev => { ev.preventDefault(); if(up) up(); };
  PAD_FN[id] = {down, up};
  b.addEventListener('mousedown', d);
  b.addEventListener('mouseup', u);
  b.addEventListener('mouseleave', u);
}
bindPad('left',  () => { if(state === 'title') menuKey('arrowleft'); else if(state === 'pet') petSelect(-1); else input.left = true; },  () => { input.left = false; });
bindPad('right', () => { if(state === 'title') menuKey('arrowright'); else if(state === 'pet') petSelect(1); else input.right = true; }, () => { input.right = false; });
bindPad('jump',  () => { if(state === 'pet') petGive(pet.sel); else if(state === 'title') menuKey('enter'); else pressJump(); }, () => { input.jumpHeld = false; menu.credFast = false; });
bindPad('shoot', () => { if(state === 'title'){ menuKey('escape'); return; } if(state === 'pet'){ closePet(); return; } if(interact()) return; if(state === 'play'){ input.shootPressed = true; input.shootHeld = true; } else backToMenu(); }, () => { input.shootHeld = false; });
bindPad('pause', () => { if(state === 'title'){ menuKey('escape'); return; } if(state === 'pet') closePet(); else togglePause(); });
bindPad('dash', () => { if(state === 'play') input.dashPressed = true; });
// fingers on the pad: each one belongs to the nearest button (within a generous radius), and can slide from one to another
(function(){
  const pad = document.getElementById('pad'), held = new Map();      // touch id -> button id
  const ids = ['left', 'right', 'jump', 'dash', 'shoot', 'pause'];
  function pick(x, y){
    let best = null, bd = 1e9;
    for(const id of ids){
      const r = document.getElementById(id).getBoundingClientRect();
      if(!r.width || getComputedStyle(pad).display === 'none') continue;
      const dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom);
      const d = Math.hypot(dx, dy) + (id === 'jump' ? -10 : id === 'pause' ? 12 : 0);   // jump is the easiest to hit
      if(d < bd){ bd = d; best = id; }
    }
    return bd < 56 ? best : null;
  }
  function set(tid, id){
    const was = held.get(tid);
    if(was === id) return;
    if(was){ held.delete(tid); if(![...held.values()].includes(was)){ document.getElementById(was).classList.remove('on'); if(PAD_FN[was].up) PAD_FN[was].up(); } }
    if(id){
      const already = [...held.values()].includes(id);
      held.set(tid, id);
      if(!already){ document.getElementById(id).classList.add('on'); PAD_FN[id].down(); }
    }
  }
  const touch = ev => {
    // only touches that land on (or near) a button are ours; anything else is left to the page
    const mine = [...ev.changedTouches].some(t => held.has(t.identifier) || (ev.type === 'touchstart' && pick(t.clientX, t.clientY)));
    if(!mine) return;
    ev.preventDefault(); initAudio();
    const live = new Set();
    for(const t of ev.touches){ if(!held.has(t.identifier) && !(ev.type === 'touchstart' && pick(t.clientX, t.clientY))) continue; live.add(t.identifier); set(t.identifier, pick(t.clientX, t.clientY)); }
    for(const tid of [...held.keys()]) if(!live.has(tid)) set(tid, null);
  };
  for(const t of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) document.addEventListener(t, touch, {passive:false});
})();

// menus: taps, drags (the apps, sliders, credits) and the wheel; in a level, tap to confirm an overlay
function canvasPoint(ev){
  const r = canvas.getBoundingClientRect();
  return [(ev.clientX - r.left) / r.width * W, (ev.clientY - r.top) / r.height * H];
}
canvas.addEventListener('pointerdown', ev => {
  initAudio();
  canvas.focus({preventScroll:true});
  const [x, y] = canvasPoint(ev);
  if(state === 'pet'){ if(fadeDir === 0) petPointer(x, y); return; }
  if(state === 'ending'){ input.jumpPressed = true; return; }
  if(state === 'title'){ try{ canvas.setPointerCapture(ev.pointerId); }catch(e){} menuPointerDown(x, y); return; }
  const fb = feedbackBtn;   // fin de la démo : bouton « Donne ton avis »
  if(state === 'chapter' && fb && x >= fb.x && x <= fb.x + fb.w && y >= fb.y && y <= fb.y + fb.h){ openFeedback(); return; }
  if(state === 'over' || state === 'chapter' || state === 'win' || state === 'pause' || state === 'talk') confirmAction();
  else if(state === 'play'){
    if(idle.phase === 'ko'){ idleWake(); return; }
    if(finaleT > 0){ input.jumpPressed = true; return; }
    if(nearNpc){ interact(); return; }
    const wx = x + viewX, wy = y + viewY;
    if(Math.abs(wx - (player.x + player.w / 2)) < 22 && wy > player.y - 14 && wy < player.y + player.h + 4) pokeHero();
  }
});
canvas.addEventListener('pointermove', ev => {
  const [x, y] = canvasPoint(ev);
  if(state === 'title') menuPointerMove(x, y, (ev.buttons & 1) === 1 || ev.pointerType === 'touch');
  else if(canvas.style.cursor) canvas.style.cursor = '';
});
canvas.addEventListener('pointerup', ev => { if(state === 'title'){ const [x, y] = canvasPoint(ev); menuPointerUp(x, y); } });
canvas.addEventListener('pointercancel', () => { menu.drag = null; menu.down = null; });
canvas.addEventListener('wheel', ev => {
  if(state !== 'title') return;
  ev.preventDefault();
  menuWheel(Math.abs(ev.deltaX) > Math.abs(ev.deltaY) ? ev.deltaX : ev.deltaY);
}, {passive:false});
// poking XELIAX during a level: he giggles
function pokeHero(){
  anim.wobV += 1.1; setFace(anim, 'open', 26);
  [988, 1175, 1319].forEach((f, k) => tone(f, 0.06, 'triangle', 0.035, null, k * 0.06));
  popup(player.x + player.w / 2, player.y - 6, pick(['Hihi !', 'Hé !', 'Ça chatouille !']), '#ffe58a');
  idle.t = 0;
}

// =====================================================================
//  LOOP: fixed 60 Hz simulation, frames in between are interpolated
// =====================================================================
let last = null, acc = 0;
// physics run at a fixed 60 steps per second; drawing happens on every screen refresh (60, 120, 144 Hz…)
// with positions interpolated between steps, so a 120 Hz screen shows 120 smooth images per second
let fpsShown = 0, fpsAcc = 0, fpsN = 0;
function loop(ts){
  if(last !== null){ fpsAcc += ts - last; fpsN++; if(fpsAcc >= 500){ fpsShown = Math.round(fpsN * 1000 / fpsAcc); fpsAcc = 0; fpsN = 0; } }
  if(last === null) last = ts;
  acc += Math.min(ts - last, 100);
  last = ts;
  while(acc >= STEP){ step(); acc -= STEP; }
  render(acc / STEP);
  if(SET.fps){ ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0); rr(W - 74, H - 24, 66, 18, 9); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fill(); txt(`${fpsShown} img/s`, W - 41, H - 11, 11, fpsShown >= 100 ? '#9fe8b0' : '#ffffff', 700); }
  requestAnimationFrame(loop);
}

// keep a run going when the page is updated while someone is playing
function hotData(){
  return {v:1, state, chIndex, rIndex, score, lives, elapsed, hasDJ, canShoot, hasWall, hasDash, runFromStart, continues, chStartTime, chCoins, chGem, collected:[...collected]};
}
function restoreFrom(d){
  try{
    if(!(d && d.v === 1 && Number.isInteger(d.chIndex) && CHAPTERS[d.chIndex] && CHAPTERS[d.chIndex].rooms[d.rIndex])) return false;
    if(!['play', 'pause', 'over', 'talk'].includes(d.state)) return false;
    score = d.score | 0; lives = Math.max(1, d.lives | 0); elapsed = +d.elapsed || 0;
    hasDJ = !!d.hasDJ; canShoot = !!d.canShoot; hasWall = !!d.hasWall; hasDash = !!d.hasDash; runFromStart = !!d.runFromStart; continues = d.continues | 0;
    chStartTime = +d.chStartTime || 0; chCoins = d.chCoins | 0; chGem = !!d.chGem;
    collected = new Set(Array.isArray(d.collected) ? d.collected : []);
    chCoinsTotal = CHAPTERS[d.chIndex].rooms.reduce((a, r) => a + (r.coins || []).length, 0);
    hud.lastLives = lives;
    loadRoom(d.chIndex, d.rIndex);
    bannerT = 0; timerRunning = elapsed > 0;
    setState('pause');
    return true;
  }catch(e){ return false; }
}
function start(data){
  menuSel = defaultChapter();
  menu.page = 'home'; menu.t = 1; menu.from = null; menu.introT = 0; menu.splash = {open:false, t:0};
  menu.scroll = appPos(appIndex(menuSel));
  if(!restoreFrom(data || {})){ loadRoom(menuSel, 0); setState('title'); }
  requestAnimationFrame(loop);
}
try{ if(window.claude && window.claude.hot && window.claude.hot.snapshot) window.claude.hot.snapshot(hotData); }catch(e){}
if(window.claude && window.claude.hot && window.claude.hot.ready) window.claude.hot.ready(start);
else start((window.claude && window.claude.hot && window.claude.hot.data) || {});
