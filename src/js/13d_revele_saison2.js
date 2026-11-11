// =====================================================================
//  RÉVÉLATION DE LA SAISON 2 (v55) : la première fois qu'on ouvre les chapitres
//  après avoir fini la saison 1, l'écran s'assombrit, « SAISON 2 » surgit, la pie
//  traverse l'écran en semant ses plumes et lâche les 4 nouveaux chapitres un par un.
//  Jouée une seule fois (save.s2Revealed) ; jamais dans la démo.
//  Bloquée 1,5 s, puis Espace / clic pour passer ; seule au bout de 9 s.
// =====================================================================
const RV_LOCK = 90, RV_LEN = 540, RV_OUT = 24;
const RV_POP = [70, 94, 118, 142];             // chaque carte surgit quand la pie passe au-dessus
const RV_CARD = {k:0.88, top:96, gap:20};
function rvCardX(j){
  const w = 136 * RV_CARD.k, total = 4 * w + 3 * RV_CARD.gap;
  return W / 2 - total / 2 + j * (w + RV_CARD.gap) + w / 2;
}
const rvPieX = t => rvCardX(0) + (t - RV_POP[0]) * (rvCardX(1) - rvCardX(0)) / (RV_POP[1] - RV_POP[0]);

// la saison 1 est finie et la saison 2 n'a jamais été montrée ; un joueur qui l'a déjà commencée ne la revoit pas
function revealDue(){
  if(DEMO || save.s2Revealed || save.bestCh[STORY_END] == null) return false;
  if(save.s2Seen || save.unlocked2 > 1 || save.bestCh.some((v, i) => i >= S2_FIRST && i <= S2_END && v != null)){ save.s2Revealed = true; persist(); return false; }
  return true;
}
function startReveal(){
  save.s2Revealed = true; persist();
  // une notification en cours (ex. « un bonus secret t'attend ») est gardée pour après
  menu.reveal = {t:0, out:-1, parts:[], toast:toast.t > 0 ? {text:toast.text, t:Math.max(toast.t, 160)} : null};
  toast.t = 0;
  menu.drag = null; menu.down = null;
}
function revealPress(){
  const R = menu.reveal;
  if(!R || R.out >= 0 || R.t < RV_LOCK) return;
  R.out = 0; SFX.menu();
}
function endReveal(){
  const R = menu.reveal; menu.reveal = null;
  refreshMainCh();
  selectApp(S2_FIRST, true);   // les cartes glissent jusqu'au premier monde de la saison 2
  menu.bgFlash = 1;
  menuFx(W / 2, 150, 34);
  SFX.checkpoint();
  if(R && R.toast) showToast(R.toast.text, R.toast.t);
  else showToast('Saison 2 débloquée : en route vers la pie !', 170);
}
function rvPart(o){ menu.reveal.parts.push(Object.assign({vx:0, vy:0, g:0, life:60, max:60, rot:0, vr:0}, o)); }
function rvBurst(x, y, col, n){
  for(let i = 0; i < n; i++){
    const a = Math.random() * TAU, s = 1.2 + Math.random() * 3.2;
    rvPart({type:i % 3 ? 'dot' : 'star', x, y, vx:Math.cos(a) * s, vy:Math.sin(a) * s - 1, g:0.07, life:40 + Math.random() * 25, max:65, col:i % 2 ? col : '#ffe58a', rot:Math.random() * TAU, vr:(Math.random() - 0.5) * 0.3});
  }
}

// appelée à chaque image du menu (updateMenu)
function updateReveal(){
  const R = menu.reveal;
  if(!R){
    if(state === 'title' && menu.page === 'chapters' && menu.t >= 1 && fadeDir <= 0 && !menu.pauseKeys && !menu.splash && revealDue()) startReveal();
    return;
  }
  if(menu.page !== 'chapters' || state !== 'title'){ menu.reveal = null; return; }   // on a quitté la page (tests, retour forcé)
  const t = ++R.t;
  if(R.out >= 0){ if(++R.out >= RV_OUT){ endReveal(); return; } }
  else if(t >= RV_LEN) R.out = 0;
  // les sons et les étincelles
  if(t === 18){ SFX.power(); addShake(4); rvBurst(W / 2, 46, '#ffd54a', 26); }
  if(t === 44){ tone(880, 0.22, 'sawtooth', 0.035, 1500); tone(1320, 0.12, 'square', 0.02, 900, 0.16); }   // le cri de la pie
  RV_POP.forEach((p, j) => {
    if(t !== p) return;
    const i = S2_FIRST + j, cx = rvCardX(j), cy = RV_CARD.top + 98 * RV_CARD.k;
    SFX.bloop(); tone(523 * Math.pow(1.26, j), 0.12, 'triangle', 0.05, 1046 * Math.pow(1.26, j), 0.03);
    rvBurst(cx, cy, CH_ACCENT[i], 22);
  });
  if(t === 166){ endTune([523, 659, 784, 1047, 1319], 0.09, 'triangle', 0.05); addShake(3); }
  // la pie sème ses plumes en passant
  const px = rvPieX(t);
  if(px > -40 && px < W + 40 && t % 3 === 0)
    rvPart({type:'feather', x:px + (Math.random() - 0.5) * 16, y:92, vx:(Math.random() - 0.5) * 0.8, vy:0.3 + Math.random() * 0.5, life:150, max:150, rot:Math.random() * TAU, vr:(Math.random() - 0.5) * 0.06, white:Math.random() < 0.3, ph:Math.random() * TAU});
  for(const p of R.parts){
    if(p.type === 'feather'){ p.ph += 0.06; p.x += p.vx + Math.sin(p.ph) * 0.7; p.y += p.vy; p.rot = Math.sin(p.ph) * 0.7 + p.vr * p.life; }
    else { p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= 0.98; p.rot += p.vr; }
    p.life--;
  }
  R.parts = R.parts.filter(p => p.life > 0);
}

// ---------------------------------------------------------------- dessin
function rvWrap(text, maxW){
  const words = text.split(' '), lines = [];
  let cur = '';
  for(const w of words){ const tryL = cur ? cur + ' ' + w : w; if(ctx.measureText(tryL).width > maxW && cur){ lines.push(cur); cur = w; } else cur = tryL; }
  if(cur) lines.push(cur);
  return lines.slice(0, 2);
}
// une carte comme celles du paquet des chapitres (136 × 196), dessinée sur le canevas
function rvCard(i, flash){
  const acc = CH_ACCENT[i], ch = CHAPTERS[i], open = isUnlocked(i);
  ctx.save();
  ctx.shadowColor = acc; ctx.shadowBlur = 18 + 10 * Math.sin(frame * 0.08);
  rr(0, 0, 136, 196, 18);
  const g = ctx.createLinearGradient(0, 0, 0, 196); g.addColorStop(0, '#21164c'); g.addColorStop(1, '#140d33');
  ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  ctx.save();
  rr(0, 0, 136, 196, 18); ctx.clip();
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 136, 108); ctx.clip(); ctx.translate(0, -14); ctx.scale(1.36, 1.36); appArt(i); ctx.restore();
  // la pastille en haut à droite
  ctx.font = `700 9.5px ${FU}`;
  const bt = open ? 'Nouveau' : 'Bientôt 🔒', bw = ctx.measureText(bt).width + 14;
  rr(136 - 8 - bw, 8, bw, 18, 9); ctx.fillStyle = open ? '#3a9bff' : 'rgba(14,9,34,0.78)'; ctx.fill();
  txt(bt, 136 - 8 - bw / 2, 21, 9.5, '#ffffff', 700);
  txt(`SAISON 2 · CH. ${ch.num}`, 10, 124, 8.5, acc, 700, 'left');
  ctx.font = `400 15px ${FD}`; ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff';
  const nw = ctx.measureText(ch.name).width;
  if(nw > 116) ctx.font = `400 ${Math.floor(15 * 116 / nw * 10) / 10}px ${FD}`;   // un nom trop long rapetisse un peu
  ctx.fillText(ch.name, 10, 142);
  ctx.font = `500 10px ${FU}`;
  rvWrap(tagline(i), 116).forEach((l, k) => txt(l, 10, 157 + k * 12, 10, '#d2cbf6', 500, 'left'));
  txt(`${ch.rooms.length} salles${open ? ' · à toi de jouer !' : ''}`, 10, 189, 9.5, open ? '#9fe8b0' : '#bfb6f0', 600, 'left');
  if(flash > 0){ ctx.fillStyle = `rgba(255,255,255,${flash})`; ctx.fillRect(0, 0, 136, 196); }
  ctx.restore();
  rr(0, 0, 136, 196, 18); ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineWidth = 1; ctx.stroke();
  rr(1, 1, 134, 194, 17); ctx.strokeStyle = rgba(acc, 0.55 + 0.35 * Math.sin(frame * 0.09)); ctx.lineWidth = 2; ctx.stroke();
}
function rvFeather(p){
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
  ctx.fillStyle = p.white ? '#f4f1ff' : '#1a1430';
  ctx.beginPath(); ctx.ellipse(0, 0, 8, 2.8, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = p.white ? '#1a1430' : '#2f5ad8'; ctx.beginPath(); ctx.ellipse(4.5, 0, 3, 2, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(7, 0); ctx.stroke();
  ctx.restore();
}
function drawReveal(){
  const R = menu.reveal; if(!R) return;
  const t = R.t, out = R.out >= 0 ? easeInOutCubic(R.out / RV_OUT) : 0, vis = 1 - out;
  ctx.save();
  // l'écran s'assombrit, une lueur rose et violette au milieu
  ctx.fillStyle = `rgba(10,6,28,${0.84 * clamp(t / 24, 0, 1) * vis})`; ctx.fillRect(-20, -20, W + 40, H + 40);
  ctx.globalAlpha = vis;
  softGlow(W / 2, 190, 330, 150, '199,155,255', 0.22 * clamp(t / 40, 0, 1));
  softGlow(W / 2, 46, 160, 50, '255,122,224', 0.2 * clamp((t - 18) / 20, 0, 1));
  // des rayons qui tournent derrière le titre
  if(t > 18 && !REDUCED){
    ctx.save(); ctx.translate(W / 2, 48); ctx.rotate(frame * 0.004);
    ctx.globalAlpha = vis * 0.07 * clamp((t - 18) / 30, 0, 1); ctx.fillStyle = '#ffe58a';
    for(let k = 0; k < 14; k++){ ctx.rotate(TAU / 14); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(380, -26); ctx.lineTo(380, 26); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  // « SAISON 2 » surgit
  if(t >= 18){
    const k = clamp((t - 18) / 22, 0, 1), s = REDUCED ? 1 : easeOutBack(k);
    ctx.save(); ctx.globalAlpha = vis * clamp(k * 2, 0, 1); ctx.translate(W / 2, 54); ctx.scale(s, s);
    heading('SAISON 2', 0, 0, 38, '#ffd54a');
    ctx.restore();
  }
  if(t >= 34){ ctx.save(); ctx.globalAlpha = vis * clamp((t - 34) / 16, 0, 1); txt('La pie voleuse', W / 2, 76, 13, '#ff9ad8', 700); ctx.restore(); }
  // les 4 cartes, une par une
  RV_POP.forEach((p, j) => {
    if(t < p) return;
    const i = S2_FIRST + j, k = clamp((t - p) / 20, 0, 1), s = (REDUCED ? 1 : easeOutBack(k)) * RV_CARD.k;
    const cx = rvCardX(j), cy = RV_CARD.top + 98 * RV_CARD.k + Math.sin(frame * 0.05 + j * 1.3) * 2.5 * k;
    ctx.save(); ctx.globalAlpha = vis * clamp(k * 3, 0, 1);
    ctx.translate(cx, cy); ctx.rotate((1 - k) * (j % 2 ? 0.35 : -0.35)); ctx.scale(s, s); ctx.translate(-68, -98);
    rvCard(i, clamp(1 - (t - p) / 14, 0, 1) * 0.85);
    ctx.restore();
  });
  // la pie qui traverse (elle tient encore la ficelle)
  const px = rvPieX(t);
  if(px > -60 && px < W + 60){
    ctx.save(); ctx.translate(px, 86 + Math.sin(t * 0.25) * 5); ctx.scale(0.8, 0.8);
    drawMagpie({x:-24, y:-20, w:48, h:40, state:'hover', phase:1, hitT:0, inv:0, face:1, lost:false});
    ctx.restore();
  }
  for(const p of R.parts){
    ctx.save(); ctx.globalAlpha = vis * clamp(p.life / 25, 0, 1);
    if(p.type === 'feather') rvFeather(p);
    else { ctx.fillStyle = p.col; if(p.type === 'star') star(p.x, p.y, 4, p.rot); else { ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, TAU); ctx.fill(); } }
    ctx.restore();
  }
  // « 4 nouveaux chapitres ! »
  if(t >= 166){
    const k = clamp((t - 166) / 18, 0, 1), s = REDUCED ? 1 : easeOutBack(k);
    ctx.save(); ctx.globalAlpha = vis * clamp(k * 2, 0, 1); ctx.translate(W / 2, 302); ctx.scale(s, s);
    heading('4 nouveaux chapitres !', 0, 0, 22, '#ffffff');
    ctx.restore();
  }
  ctx.restore();
  if(R.out < 0 && t >= RV_LOCK){
    if(t >= 200){ if(REDUCED || Math.floor(frame / 30) % 2 === 0) promptLine(TOUCH ? [{key:'▲'}, {text:'découvrir la saison 2'}] : [{key:'Espace'}, {text:'découvrir la saison 2'}], 336, '#ffe58a'); }
    else drawSkipHint();
  }
}
