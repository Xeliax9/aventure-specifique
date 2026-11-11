
// =====================================================================
//  FIN DE LA SAISON 1 : XELIAX savoure sa ficelle… et la pie la lui vole
// =====================================================================
// t = finaleT (60 images/s) :
//   1-100 VICTOIRE et feux d'artifice, 100-190 petits sauts de joie,
//   200-255 il se calme et regarde sa ficelle, 255-300 il l'approche lentement, 300-335 il la renifle (yeux fermés),
//   335-355 il recule un peu (élan), 355-372 il ouvre grand la bouche et tremble d'envie, 372-388 il croque…
//   376 la pie surgit d'un coup (rien ne l'annonce avant), 388 elle arrache la ficelle (arrêt sur image),
//   388-410 elle remonte (« QUOI ?! »), 410-470 elle nargue XELIAX (« Chac-chac ! », clin d'œil), 470-570 elle s'envole,
//   550 carton « À suivre… », STEAL_END : la touche Espace marche enfin (3 s après le titre).
const FIN = {calm:200, bring:255, sniff:300, wind:335, open:355, bite:372, swoop:370, snatch:388, hover:410, leave:470, card:550};
// Espace ne marche qu'une fois le carton « À suivre… » affiché depuis 3 s (pas de passage en martelant la touche)
const STEAL_END = FIN.card + 55 + 180;
let finFeathers = [];

// l'endroit de la ficelle dans la main / devant la bouche (repère de XELIAX : pieds en 0, face vers +x)
function finEatPos(e, tip, by){
  const w = e > 0 ? easeInOutCubic(Math.min(1, e / 0.55)) : 0;
  const x1 = 25 - 19 * e, y1 = by + 4;
  return {x:tip.x + 7 + (x1 - tip.x - 7) * w, y:tip.y - 3 + (y1 - tip.y + 3) * w, rot:-0.45 * (1 - w)};
}
// la même chose dans le monde (pour que la pie vise juste)
function finFicelleWorld(){
  const S = steal, e = S ? S.eat || 0 : 0, by = HB.cy, fx = player.facing;
  const p = finEatPos(e, {x:24, y:by - 1}, by);
  return {x:player.x + player.w / 2 + fx * p.x, y:player.y + player.h + 0.5 + p.y};
}
// la pose de XELIAX pendant la scène (passée à stepCharAnim)
function stealPose(t){
  const S = steal;
  if(!S || t < FIN.calm) return null;
  if(!S.got) return {cheer:false, eat:S.eat || 0, look:t < FIN.open ? {x:0.85, y:0.5} : {x:0.55, y:0.95}};
  if(t < FIN.leave + 60 && S.on) return {cheer:false, look:{x:clamp((S.x - player.x - player.w / 2) * player.facing / 90, -1, 1), y:-0.7}};
  return {cheer:false};
}

function updateSteal(t){
  const S = steal, sd = player.facing;
  S.pX = S.x; S.pY = S.y;
  if(t < 100 && frame % 22 === 0) confetti(player.x + player.w / 2, player.y - 6, 10);
  if(t >= 100 && t < 190 && (t - 100) % 30 === 0 && player.onGround){
    player.vy = -6; player.onGround = false; player.standingOn = null; player.sy = 0.8; player.sx = 1.2;
    tone(660 + (t - 100) * 4, 0.08, 'triangle', 0.04); confetti(player.x + player.w / 2, player.y - 6, 6);
  }
  updateFinFeathers();

  // ---- XELIAX savoure : il approche la ficelle, la renifle, prend son élan, ouvre grand… et croque
  if(!S.got && t >= FIN.calm){
    let e = 0;
    if(t >= FIN.bring && t < FIN.sniff) e = 0.55 * easeInOutCubic((t - FIN.bring) / (FIN.sniff - FIN.bring));
    else if(t >= FIN.sniff && t < FIN.wind) e = 0.55 + Math.sin((t - FIN.sniff) * 0.25) * 0.015;
    else if(t >= FIN.wind && t < FIN.bite) e = 0.55 - 0.15 * easeInOutCubic(Math.min(1, (t - FIN.wind) / 18));
    else if(t >= FIN.bite) e = 0.4 + 0.6 * Math.pow(Math.min(1, (t - FIN.bite) / (FIN.snatch - FIN.bite)), 2.2);
    S.eat = e;
    if(t === FIN.calm + 10){ setFace(anim, 'smile', 90); showToast('Miam… enfin ma ficelle aux olives !', 150); }
    if(t >= FIN.sniff && t < FIN.wind){
      anim.lid = Math.min(0.85, (anim.lid || 0) + 0.06);                   // les yeux se ferment de bonheur
      if(t === FIN.sniff + 4){ tone(392, 0.5, 'sine', 0.025, 330); }
      if(t === FIN.sniff + 18){ tone(330, 0.6, 'sine', 0.025, 262); }
      if(t % 9 === 0){ const p = finFicelleWorld(); particles.push({x:p.x + (Math.random() - 0.5) * 16, y:p.y - 4, vx:(Math.random() - 0.5) * 0.3, vy:-0.55, life:46, max:46, color:'#fff1c8', grav:-0.004, size:2.4, type:'puff', drag:0.97}); }
    } else anim.lid = Math.max(0, (anim.lid || 0) - 0.12);
    if(t >= FIN.wind && t < FIN.open){ const k = Math.min(1, (t - FIN.wind) / 12); anim.sx = 1 + 0.07 * k; anim.sy = 1 - 0.07 * k; }
    if(t === FIN.open){ setFace(anim, 'open', FIN.snatch - FIN.open + 4); tone(523, 0.12, 'triangle', 0.035); }
    if(t >= FIN.open && t < FIN.bite){ anim.sx = 1.05 + Math.sin(t * 1.3) * 0.015; anim.sy = 0.95 - Math.sin(t * 1.3) * 0.015; }
    if(t >= FIN.bite){ const k = (t - FIN.bite) / (FIN.snatch - FIN.bite); anim.sx = 0.96; anim.sy = 1.04 + 0.04 * k; }
  }

  // ---- la pie surgit d'un coup, d'en haut devant XELIAX, droit sur la ficelle
  if(t === FIN.swoop){
    const g = finFicelleWorld();
    S.on = true; S.sc = 1.15; S.trail = []; S.beak = 0; S.legs = 0; S.wink = 0; S.say = 0;
    S.gx = g.x + sd * 10; S.gy = g.y;
    S.x0 = sd > 0 ? camX + W + 80 : camX - 80; S.y0 = Math.max(camY - 50, S.gy - 170);      // du coin haut de l'écran, devant lui
    S.x = S.x0; S.y = S.y0; S.pX = S.x; S.pY = S.y; S.face = -sd; S.ang = 0.9; S.flap = 0;
    tone(1400, 0.22, 'sawtooth', 0.03, 300); tone(90, 0.25, 'triangle', 0.05, 50);      // un « fffuit ! » soudain
  }
  if(S.on && !S.got){
    const g = finFicelleWorld(); S.gx = g.x + sd * 10; S.gy = g.y;
    const q = clamp((t - FIN.swoop) / (FIN.snatch - FIN.swoop), 0, 1), e = Math.pow(q, 1.25);
    const cx = S.gx + sd * 150, cy = S.gy - 15;
    const bx = (1 - e) * (1 - e) * S.x0 + 2 * (1 - e) * e * cx + e * e * S.gx;
    const by = (1 - e) * (1 - e) * S.y0 + 2 * (1 - e) * e * cy + e * e * S.gy;
    // inclinée vers sa trajectoire, ailes collées, puis grandes ouvertes et pattes en avant juste avant d'attraper
    const dx = 2 * (1 - e) * (cx - S.x0) + 2 * e * (S.gx - cx), dy = 2 * (1 - e) * (cy - S.y0) + 2 * e * (S.gy - cy);
    S.ang = clamp(Math.atan2(dy, Math.abs(dx) + 0.001), -0.4, 1.25) * (q > 0.8 ? 1 - (q - 0.8) * 4 : 1);
    S.wing = q < 0.75 ? 'tuck' : 'flare'; S.legs = q > 0.6 ? 1 : 0; S.beak = q > 0.7 ? 1 : 0.2;
    const o = finBeakOffset(S); S.x = bx - o.x; S.y = by - o.y;
    S.trail.push({x:S.x, y:S.y}); if(S.trail.length > 7) S.trail.shift();
    if(t === FIN.snatch){
      S.got = true; S.lost = false; S.eat = 0; S.beak = 0; S.wing = 'flap'; S.flapSpd = 0.6;
      SFX.crack(); addShake(6); setFace(anim, 'o', 150); anim.lid = 0; anim.sx = anim.sy = 1;
      hitStop = REDUCED ? 0 : 14;                          // arrêt sur image : la pie, la ficelle au bec
      player.vy = -3.5; player.onGround = false; player.standingOn = null; player.sx = 0.75; player.sy = 1.3;
      tone(1250, 0.07, 'square', 0.04, 1500); tone(1250, 0.07, 'square', 0.035, 1500, 0.1); tone(110, 0.6, 'sawtooth', 0.05, 55);
      burst(S.gx, S.gy, 8, '#ffffff', 2, 26, 0.02, 3, 'puff');
      for(let i = 0; i < 7; i++) finFeather(S.x + (Math.random() - 0.5) * 24, S.y + (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 3, -1 - Math.random() * 1.5);
      S.x1 = S.x; S.y1 = S.y; S.hx = S.gx + sd * 90; S.hy = Math.max(S.gy - 50, camY + 70);
    }
  } else if(S.on && S.got){
    const k = t - FIN.snatch;
    if(t === FIN.snatch + 3){ tone(150, 0.08, 'square', 0.05, 90); popup(player.x + player.w / 2 + sd * 16, player.y - 2, 'CLAC !', '#ffffff'); }  // il croque… dans le vide
    if(t === FIN.leave + 34) showToast('La pie ! Elle a volé la ficelle aux olives !', 110);
    if(t < FIN.hover){
      // elle remonte en chandelle, ailes battantes, encore tournée vers lui
      const q = easeOutCubic(k / (FIN.hover - FIN.snatch));
      S.x = S.x1 + (S.hx - S.x1) * q; S.y = S.y1 + (S.hy - S.y1) * q - Math.sin(q * Math.PI) * 24;
      S.ang = -0.35 * (1 - q); S.legs = Math.max(0, 1 - k / 10); S.flapSpd = 0.6; S.wing = 'flap';
      S.trail.push({x:S.x, y:S.y}); if(S.trail.length > 7) S.trail.shift();
    } else if(t < FIN.leave){
      // sur place, elle le nargue : tête qui penche, petits cris, clin d'œil
      const h = t - FIN.hover;
      S.trail.length = 0;
      S.x = S.hx + Math.sin(h * 0.06) * 6; S.y = S.hy + Math.sin(h * 0.16) * 5;
      S.ang = Math.sin(h * 0.16) * 0.06; S.flapSpd = 0.42; S.wing = 'flap';
      S.tilt = Math.sin(h * 0.32) * 0.28; S.beak = 0;
      // (le « QUOI ?! » de XELIAX d'abord, puis son cri moqueur, puis le clin d'œil)
      if(h >= 18 && h < 42 && h % 7 < 3) S.beak = 0.6;
      if(h >= 18 && h < 42 && h % 7 === 0){ S.beak = 1; tone(1500 - h * 8, 0.06, 'square', 0.035, 1100); tone(1700 - h * 8, 0.05, 'square', 0.025, 1300, 0.07); }
      S.say = h >= 18 && h < 46 ? 1 : 0;
      S.wink = h >= 44 && h < 56 ? 1 : 0;
      if(h === 46) tone(1900, 0.05, 'sine', 0.03, 2400);
      if(h === 20) setFace(anim, 'o', 60);
    } else {
      // et elle s'en va, demi-tour et grands coups d'ailes, en semant des plumes
      const k2 = t - FIN.leave;
      S.say = 0; S.wink = 0; S.tilt = 0; S.beak = 0;
      if(k2 === 0){ S.face = sd; burst(S.x, S.y, 6, '#ffffff', 1.4, 20, 0, 3, 'puff'); finFeather(S.x, S.y, -sd, -0.5); tone(700, 0.15, 'triangle', 0.03, 1300); }
      S.x = S.hx + sd * (k2 * 1.2 + k2 * k2 * 0.045); S.y = S.hy - k2 * 1.1 - k2 * k2 * 0.012 - Math.sin(k2 * 0.25) * 4;
      S.ang = -0.25 - Math.min(0.2, k2 * 0.004); S.flapSpd = 0.55; S.wing = 'flap';
      S.trail.push({x:S.x, y:S.y}); if(S.trail.length > 6) S.trail.shift();
      if(k2 % 13 === 6 && k2 < 80) finFeather(S.x - sd * 20, S.y + 4, -sd * 0.4, 0.2);
      if(k2 % 16 === 0 && k2 < 60) tone(1300 - k2 * 5, 0.06, 'square', 0.025, 950 - k2 * 4);
      if(k2 === 10){ setFace(anim, 'hurt', 140); player.vy = -6.5; player.onGround = false; player.standingOn = null; }
      if(k2 === 34 && player.onGround){ player.vy = -6.5; player.onGround = false; player.standingOn = null; }
      if(S.x < camX - 120 || S.x > camX + W + 120 || S.y < camY - 120) S.on = false;
    }
    if(S.wing === 'flap'){ S.flap = (S.flap || 0) + S.flapSpd; if(Math.sin(S.flap) > 0.97 && Math.random() < 0.3) tone(220, 0.04, 'triangle', 0.012, 160); }
  }
}

// le bec de la pie dans le monde (pour qu'il tombe pile sur la ficelle)
const PIE_BEAK = {x:33, y:-9};
function finBeakOffset(S){
  const a = S.ang || 0, s = S.sc || 1;
  return {x:S.face * s * (PIE_BEAK.x * Math.cos(a) - PIE_BEAK.y * Math.sin(a)), y:s * (PIE_BEAK.x * Math.sin(a) + PIE_BEAK.y * Math.cos(a))};
}

function finFeather(x, y, vx, vy){
  finFeathers.push({x, y, vx, vy, rot:Math.random() * TAU, ph:Math.random() * TAU, life:170 + Math.random() * 60, white:Math.random() < 0.35, s:0.8 + Math.random() * 0.5});
}
function updateFinFeathers(){
  if(finaleT <= 1) finFeathers = [];
  for(const f of finFeathers){
    f.ph += 0.07; f.vx *= 0.96; f.vy = Math.min(f.vy + 0.05, 0.75);
    f.x += f.vx + Math.sin(f.ph) * 0.7; f.y += f.vy; f.rot = Math.sin(f.ph) * 0.9 + 1.2; f.life--;
  }
  finFeathers = finFeathers.filter(f => f.life > 0);
}
function drawFinFeather(f){
  ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.scale(f.s, f.s);
  ctx.globalAlpha = Math.min(1, f.life / 40);
  ctx.beginPath(); ctx.moveTo(-8, 0); ctx.quadraticCurveTo(-1, -4.2, 8, -0.6); ctx.quadraticCurveTo(0, 3.2, -8, 0); ctx.closePath();
  ctx.fillStyle = f.white ? '#f4f2ff' : '#1a1430'; ctx.fill();
  ctx.strokeStyle = f.white ? '#9a96b8' : '#2b6f8a'; ctx.lineWidth = 0.8; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10, 0.8); ctx.lineTo(7, -0.6); ctx.strokeStyle = f.white ? '#c8c4e0' : '#3fe0c0'; ctx.lineWidth = 0.7; ctx.stroke();
  ctx.restore();
}

// la pie, en détail : noire à reflets bleu-vert, ventre et épaules blancs, longue queue irisée, ailes qui battent
//   o.wing : 'flap' (battements, angle o.flap), 'tuck' (collées, en piqué), 'flare' (grandes ouvertes pour freiner)
//   o.beak 0-1 (bec ouvert), o.legs 0-1 (pattes sorties), o.tilt (tête penchée), o.wink, o.ficelle
function drawPie(x, y, face, sc, o){
  const fl = o.wing === 'tuck' ? -0.15 : o.wing === 'flare' ? -1.35 : Math.sin(o.flap || 0);   // -1 ailes en haut, +1 en bas
  ctx.save(); ctx.translate(x, y); ctx.scale(face * sc, sc); ctx.rotate(o.ang || 0);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // longue queue étagée, irisée vert-bleu
  const sw = Math.sin(frame * 0.12) * 0.06 + (o.wing === 'tuck' ? 0 : fl * 0.05);
  for(let i = 2; i >= 0; i--){
    ctx.save(); ctx.translate(-13, 2); ctx.rotate(0.12 + sw + (i - 1) * 0.09);
    const L = 44 - i * 6;
    const g = ctx.createLinearGradient(0, 0, -L, 0);
    g.addColorStop(0, '#16112a'); g.addColorStop(0.45, '#1d5a66'); g.addColorStop(0.8, '#3a3aa8'); g.addColorStop(1, '#5b2f8a');
    ctx.beginPath(); ctx.moveTo(0, -3.5); ctx.quadraticCurveTo(-L * 0.6, -4.5, -L, -2.2); ctx.quadraticCurveTo(-L - 3, 0, -L, 2.2); ctx.quadraticCurveTo(-L * 0.6, 4.5, 0, 3.5); ctx.closePath();
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#07040f'; ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = 'rgba(120,255,220,0.45)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(-3, -0.6); ctx.lineTo(-L + 4, -0.6); ctx.stroke();
    ctx.restore();
  }
  // aile du fond (plus sombre)
  pieWing(-1, -5, fl, true);
  // pattes : sorties pour attraper, repliées en vol
  if(o.legs > 0.05){
    ctx.strokeStyle = '#2a2a36'; ctx.lineWidth = 1.8;
    for(const lx of [2, 7]){
      const ex = lx + 6 * o.legs, ey = 10 + 9 * o.legs;
      ctx.beginPath(); ctx.moveTo(lx, 8); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.lineWidth = 1.2;
      for(const a of [-0.6, 0, 0.6]){ ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex + Math.cos(a) * 4.5, ey + Math.sin(a) * 4.5 + 1); ctx.stroke(); }
      ctx.lineWidth = 1.8;
    }
  }
  // corps : dos noir à reflets, flanc et ventre blancs
  const gb = ctx.createRadialGradient(4, -6, 2, 0, 0, 20);
  gb.addColorStop(0, '#2c2a52'); gb.addColorStop(1, '#100c20');
  ctx.beginPath(); ctx.ellipse(0, 0, 18, 12, -0.05, 0, TAU); ctx.fillStyle = gb; ctx.fill();
  ctx.strokeStyle = '#05030a'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, 18, 12, -0.05, 0, TAU); ctx.clip();
  ctx.fillStyle = '#f4f2ff'; ctx.beginPath(); ctx.ellipse(1, 7, 13, 7.5, -0.1, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(160,150,200,0.45)'; ctx.beginPath(); ctx.ellipse(-2, 11, 12, 3, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(80,220,200,0.18)'; ctx.beginPath(); ctx.ellipse(-4, -8, 12, 3, -0.1, 0, TAU); ctx.fill();
  ctx.restore();
  // aile de devant
  pieWing(1, -3, fl, false);
  // tête (penchée quand elle nargue)
  ctx.save(); ctx.translate(15, -6); ctx.rotate(o.tilt || 0);
  ctx.beginPath(); ctx.arc(2, -3, 9.5, 0, TAU);
  const gh = ctx.createRadialGradient(4, -7, 1, 2, -3, 11); gh.addColorStop(0, '#34306a'); gh.addColorStop(1, '#100c20');
  ctx.fillStyle = gh; ctx.fill(); ctx.strokeStyle = '#05030a'; ctx.lineWidth = 1.4; ctx.stroke();
  ctx.strokeStyle = 'rgba(110,240,220,0.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(2, -3, 7, -2.6, -1.4); ctx.stroke();
  // œil : blanc, pupille, reflet ; sourcil narquois ; clin d'œil
  if(o.wink){ ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(5, -4, 3, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke(); }
  else {
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(5, -4.5, 3.6, 0, TAU); ctx.fill();
    ctx.fillStyle = '#14082a'; ctx.beginPath(); ctx.arc(6.2, -4.3, 1.9, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(5.6, -5.1, 0.7, 0, TAU); ctx.fill();
  }
  ctx.strokeStyle = '#000000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0.5, -10); ctx.lineTo(9, -7.5); ctx.stroke();
  // bec en deux parties, qui s'ouvre
  const bo = (o.beak || 0) * 0.32;
  ctx.fillStyle = '#4a4a5a'; ctx.strokeStyle = '#1a1a24'; ctx.lineWidth = 0.8;
  ctx.save(); ctx.translate(9, -3); ctx.rotate(-bo);
  ctx.beginPath(); ctx.moveTo(0, -3); ctx.quadraticCurveTo(7, -3, 12, -0.5); ctx.lineTo(0, 0.6); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(2, -2.4, 5, 0.8);
  ctx.restore();
  ctx.save(); ctx.translate(9, -2); ctx.rotate(bo);
  ctx.fillStyle = '#3a3a48'; ctx.beginPath(); ctx.moveTo(0, -0.2); ctx.lineTo(10, 0.3); ctx.quadraticCurveTo(5, 2.6, 0, 2.2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  if(o.ficelle) drawFicelle(24, 1, 26, 0.32, false, 5, false);
  ctx.restore();
  ctx.restore();
}
// une aile : couvertures bleu nuit, rémiges blanches à bout noir (la tache blanche de la pie en vol)
function pieWing(ox, oy, fl, back){
  ctx.save(); ctx.translate(ox, oy);
  ctx.rotate(-fl * 0.95 - 0.15);
  ctx.scale(1, 0.55 + 0.45 * Math.abs(fl));               // vue de profil : l'aile s'aplatit au milieu du battement
  const dark = back ? 0.55 : 0;
  for(let i = 4; i >= 0; i--){
    const a = -2.55 + i * 0.16, L = 26 - i * 2.2;
    ctx.save(); ctx.rotate(a);
    ctx.beginPath(); ctx.ellipse(L * 0.55, 0, L * 0.55, 3.4, 0, 0, TAU);
    ctx.fillStyle = back ? '#56527a' : '#f4f2ff'; ctx.fill();
    ctx.strokeStyle = '#0a0820'; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(L * 0.9, 0, L * 0.18, 2.6, 0, 0, TAU); ctx.fillStyle = '#100c20'; ctx.fill();
    ctx.restore();
  }
  ctx.beginPath(); ctx.moveTo(2, 2); ctx.quadraticCurveTo(-8, -10, -20, -10); ctx.quadraticCurveTo(-10, -2, -2, 4); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, -20, -10);
  g.addColorStop(0, back ? '#151230' : '#1d2a6a'); g.addColorStop(1, back ? '#1f2a50' : '#2f5ad8');
  ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#0a0820'; ctx.lineWidth = 1.1; ctx.stroke();
  if(!back){ ctx.strokeStyle = 'rgba(63,224,192,0.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-1, 0); ctx.quadraticCurveTo(-9, -7, -17, -8.5); ctx.stroke(); }
  if(dark){ ctx.fillStyle = 'rgba(8,4,20,' + dark * 0.5 + ')'; ctx.beginPath(); ctx.moveTo(2, 2); ctx.quadraticCurveTo(-8, -10, -20, -10); ctx.quadraticCurveTo(-10, -2, -2, 4); ctx.fill(); }
  ctx.restore();
}

function drawSteal(){
  drawDJOrb();
  if(!steal) return;
  for(const f of finFeathers) drawFinFeather(f);
  if(!steal.on || steal.sc === undefined) return;
  const S = steal, al = typeof ALPHA === 'number' ? ALPHA : 1;
  const x = S.pX === undefined ? S.x : S.pX + (S.x - S.pX) * al, y = S.pY === undefined ? S.y : S.pY + (S.y - S.pY) * al;
  const o = {wing:S.wing, flap:S.flap, ang:S.ang, beak:S.beak, legs:S.legs, tilt:S.tilt, wink:S.wink, ficelle:S.got};
  // traînée : des traits de vitesse et des « fantômes » pâles derrière elle
  const tr = S.trail || [];
  if(tr.length > 1){
    ctx.save(); ctx.lineCap = 'round';
    for(let i = 1; i < tr.length; i++){
      const a = i / tr.length;
      ctx.strokeStyle = 'rgba(200,240,255,' + (0.35 * a) + ')'; ctx.lineWidth = 2 + 5 * a;
      ctx.beginPath(); ctx.moveTo(tr[i - 1].x, tr[i - 1].y); ctx.lineTo(tr[i].x, tr[i].y); ctx.stroke();
    }
    ctx.restore();
    if(!S.got) for(let i = 0; i < tr.length - 1; i += 2){ ctx.save(); ctx.globalAlpha = 0.12 + 0.1 * i / tr.length; drawPie(tr[i].x, tr[i].y, S.face, S.sc, o); ctx.restore(); }
  }
  softGlow(x, y, 46, 34, '200,230,255', 0.18);       // pour qu'on la voie bien même dans le noir
  drawPie(x, y, S.face, S.sc, o);
  if(S.say){
    // son cri, « Chac-chac ! », dans une bulle en étoile
    const bx = x - S.face * 34, by = Math.max(y - 44, viewY + 66) + Math.sin(frame * 0.5) * 1.5;   // sous la barre du haut
    ctx.save(); ctx.translate(bx, by); ctx.rotate(Math.sin(frame * 0.4) * 0.05);
    ctx.beginPath(); for(let i = 0; i < 16; i++){ const r = i % 2 ? 15 : 21, an = i * Math.PI / 8; ctx.lineTo(Math.cos(an) * r * 2.3, Math.sin(an) * r * 0.9); }
    ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#1a1430'; ctx.lineWidth = 2; ctx.stroke();
    outlined('Chac-chac !', 0, 5, 13, '#2f5ad8', '#ffffff', 3, FD, 400, 'center');
    ctx.restore();
  }
}
