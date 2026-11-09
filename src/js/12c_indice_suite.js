// =====================================================================
//  v54 : PETITE ANIMATION DE FIN DE CHAPITRE — un indice de la suite
//  Avant l'écran des résultats : une fenêtre s'ouvre sur le chapitre
//  suivant, le voleur la traverse (l'ombre en saison 1, la pie en
//  saison 2), puis le nom du prochain chapitre apparaît. ~4 s.
//  La première fois on la regarde en entier ; ensuite Espace la passe.
// =====================================================================
const TZ_LEN = 230;
function startTeaser(){
  const next = chIndex + 1;
  if(!clearInfo || !CHAPTERS[next] || CHAPTERS[next].bonus || CHAPTERS[next].season !== chapter.season) return;
  if(!save.teaserSeen || typeof save.teaserSeen !== 'object') save.teaserSeen = {};
  clearInfo.teaser = {t:0, next, skippable:!!save.teaserSeen[chIndex], s2:chapter.season === 2};
  save.teaserSeen[chIndex] = true;
}
function endTeaser(){ if(clearInfo) clearInfo.teaser = null; stateT = 0; }
function updateTeaser(){
  const z = clearInfo.teaser;
  z.t++; stateT = 0;   // l'écran des résultats attend la fin de l'animation
  if(z.t === 24){ tone(330, 0.16, 'triangle', 0.045); tone(440, 0.22, 'triangle', 0.045, null, 0.12); }
  if(z.t === 70) SFX.warn();
  if(z.t === 132){ tone(392, 0.14, 'sine', 0.05); tone(523, 0.14, 'sine', 0.05, null, 0.1); tone(659, 0.3, 'sine', 0.05, null, 0.2); }
  if(z.t >= TZ_LEN) endTeaser();
}
function teaserSkip(){
  const z = clearInfo && clearInfo.teaser;
  if(!z) return false;
  if(z.skippable && z.t > 20){ SFX.menu(); endTeaser(); }
  return true;
}
function drawTeaser(){
  const z = clearInfo.teaser, t = z.t, acc = CH_ACCENT[z.next] || '#ffd54a';
  const inA = easeOutCubic(clamp(t / 30, 0, 1)), out = 1 - clamp((t - (TZ_LEN - 22)) / 22, 0, 1);
  ctx.save();
  ctx.globalAlpha = out;
  ctx.fillStyle = `rgba(8,4,24,${0.93 * inA})`; ctx.fillRect(0, 0, W, H);
  const bar = 30 * inA;
  ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  // la fenêtre sur le prochain chapitre (l'image de sa carte), qui avance doucement
  const fw = 300, fh = 160, fx = W / 2 - fw / 2, fy = 52 + (1 - inA) * 24;
  const op = easeOutBack(clamp((t - 8) / 30, 0.001, 1));
  ctx.save();
  ctx.translate(W / 2, fy + fh / 2); ctx.scale(op, op); ctx.translate(-W / 2, -(fy + fh / 2));
  softGlow(W / 2, fy + fh / 2, fw * 0.7, fh * 0.8, hexRGB(acc).join(','), 0.35);
  ctx.save();
  rr(fx, fy, fw, fh, 14); ctx.clip();
  const zm = 3.1 + t * 0.003;
  ctx.save();
  ctx.translate(W / 2, fy + fh / 2); ctx.scale(zm, zm); ctx.translate(-50, -56);
  appArt(z.next);
  ctx.restore();
  // le voleur passe au loin, petit et discret, dans le ciel de l'image (il disparaît aux bords du cadre)
  const k = clamp((t - 60) / 100, 0, 1);
  if(k > 0 && k < 1){
    const x = lerp(fx + fw + 30, fx - 30, k), y = fy + 34 + Math.sin(k * Math.PI * 3) * 5;
    ctx.save(); ctx.translate(x, y);
    ctx.globalAlpha *= 0.55 * Math.sin(k * Math.PI);
    if(z.s2){ ctx.scale(0.36, 0.36); drawMagpie({x:-24, y:-20, w:48, h:40, state:'hover', phase:1, hitT:0, inv:0, face:-1, lost:false}); }
    else { ctx.scale(0.3, 0.3); opShadow(0, 0, -1, true); }
    ctx.restore();
  }
  ctx.restore();
  rr(fx, fy, fw, fh, 14); ctx.strokeStyle = acc; ctx.lineWidth = 3; ctx.stroke();
  ctx.restore();
  // le nom du chapitre suivant
  const a1 = clamp((t - 120) / 20, 0, 1), a2 = clamp((t - 145) / 20, 0, 1);
  if(a1 > 0){
    ctx.globalAlpha = out * a1;
    txt('Prochain chapitre', W / 2, fy + fh + 26, 12, '#bfb6f0', 600);
    outlined(`${chNum(z.next)}. ${CHAPTERS[z.next].name}`, W / 2, fy + fh + 58 - (1 - a1) * 8, 28, acc, '#120a2e', 6);
  }
  if(a2 > 0){
    ctx.globalAlpha = out * a2;
    const locked = demoOn() && !isUnlocked(z.next);
    txt(locked ? 'Bientôt, dans le jeu complet…' : tagline(z.next) + '…', W / 2, fy + fh + 80, 13, '#ffffff', 500);
  }
  ctx.restore();
  if(z.skippable && t > 20 && t < TZ_LEN - 22) drawSkipHint();
}
