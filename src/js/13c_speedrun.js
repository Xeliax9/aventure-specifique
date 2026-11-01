// =====================================================================
//  SPEEDRUN MODE (the bonus challenges): one hit and you're out (no hearts,
//  back to the last flag at once), a big timer with splits at every flag
//  (green = faster than your record, red = slower), medals, a ghost of
//  your best run, and R to start again instantly.
// =====================================================================
const SR_GHOST_STEP = 2;           // the ghost keeps one position every 2 frames
const srun = {f:0, splits:[], ghost:[], pop:null, popT:0, gAnim:null};
function isSpeedrun(){ return !!(chapter && chapter.bonus); }
function srData(){ save.speed = save.speed || {}; return save.speed[chIndex] || null; }
// medals: gold = the time to beat, silver = +25 %, bronze = +50 %
function srMedal(ci, t){
  const par = CHAPTERS[ci].parTime;
  if(t == null || !par) return null;
  return t <= par ? 'or' : t <= par * 1.25 ? 'argent' : t <= par * 1.5 ? 'bronze' : null;
}
const SR_MEDAL_COL = {or:'#ffd54a', argent:'#d8e2f0', bronze:'#e09a5a'};

function srReset(){ srun.f = 0; srun.splits = []; srun.ghost = []; srun.pop = null; srun.popT = 0; srun.gAnim = makeCharAnim(); srun.gAnim.appear = 1; }
// every frame of the run: the clock, and the ghost recording
function srTick(){
  if(!isSpeedrun() || !timerRunning || state !== 'play') return;
  if(srun.f % SR_GHOST_STEP === 0) srun.ghost.push(rIndex, Math.round(player.x), Math.round(player.y), gdir < 0 ? -1 : 1);
  srun.f++;
  if(srun.popT > 0) srun.popT--;
}
// a flag reached or a new room: compare with the record
function srSplit(){
  if(!isSpeedrun()) return;
  const t = elapsed - chStartTime, i = srun.splits.length, best = srData();
  srun.splits.push(t);
  const ref = best && best.splits ? best.splits[i] : null;
  srun.pop = {t, d:ref == null ? null : t - ref}; srun.popT = 150;
}
// one hit and you're out: straight back to the last flag, the clock keeps running
function srDeath(){
  addShake(7); hud.flash = 1; heroPop(); SFX.hurt();
  player.dead = true; respawnT = 22;
}
// R: start the whole challenge again, at once
function srRestart(){
  if(!isSpeedrun() || state === 'title') return;
  if(state === 'pause' || state === 'over' || state === 'play' || state === 'chapter'){
    startChapter(chIndex, false);
    elapsed = 0; chStartTime = 0; timerRunning = false; finaleT = 0; steal = null;
    lives = 99; srReset(); setState('play'); fade = 0; fadeDir = 0; bannerT = 0;
    anim.appear = 0; SFX.bloop(); showToast('C\'est reparti !', 50);
  }
}
// the run is over: keep the record, its splits and its ghost
function srFinish(t){
  const best = srData(), medal = srMedal(chIndex, t);
  clearInfo.medal = medal; clearInfo.srBest = best ? best.t : null;
  if(!best || t < best.t){
    save.speed[chIndex] = {t, splits:srun.splits.slice(), ghost:srun.ghost.slice(), medal};
    clearInfo.srNew = true;
  }
}

// ---- drawing: the ghost of the best run (world coordinates)
function drawSrGhost(){
  if(!isSpeedrun() || !timerRunning && srun.f === 0) return;
  const best = srData();
  if(!best || !best.ghost) return;
  const i = Math.floor(srun.f / SR_GHOST_STEP) * 4, g = best.ghost;
  if(i + 3 >= g.length || g[i] !== rIndex) return;
  const x = g[i + 1], y = g[i + 2], up = g[i + 3] < 0, px = i >= 4 && g[i - 4] === rIndex ? g[i - 3] : x;
  stepCharAnim(srun.gAnim, {vx:x - px, vy:0, onGround:true, facing:x >= px ? 1 : -1});
  ctx.save();
  const cy = y + player.h / 2;
  if(up){ ctx.translate(0, cy); ctx.scale(1, -1); ctx.translate(0, -cy); }
  drawHero(srun.gAnim, x + player.w / 2, y + player.h, 1, {alpha:0.35});
  ctx.restore();
}
// ---- drawing: the big timer, the last split, the medal you're on track for (screen)
function drawSrHud(){
  if(!isSpeedrun() || state !== 'play') return;
  const t = elapsed - chStartTime, best = srData();
  const medal = srMedal(chIndex, t);
  ctx.save();
  rr(W / 2 - 74, 6, 148, 34, 12); ctx.fillStyle = 'rgba(14,9,34,0.82)'; ctx.fill();
  ctx.strokeStyle = medal ? SR_MEDAL_COL[medal] : '#ff6a6a'; ctx.lineWidth = 2; ctx.stroke();
  outlined(fmt(t), W / 2, 31, 20, '#ffffff', '#1d1442', 4, FU, 700, 'center');
  txt(best ? 'record ' + fmt(best.t) : 'pas encore de record', W / 2, 52, 10.5, '#d6ceff', 600, 'center');
  if(srun.pop && srun.popT > 0){
    const p = srun.pop, a = Math.min(1, srun.popT / 20);
    ctx.globalAlpha = a;
    const s = p.d == null ? 'Drapeau ' + srun.splits.length + ' · ' + fmt(p.t) : (p.d <= 0 ? '−' : '+') + (Math.abs(p.d) / 1000).toFixed(2) + ' s';
    const col = p.d == null ? '#ffffff' : p.d <= 0 ? '#5dff8a' : '#ff6a6a';
    outlined(s, W / 2, 74, 16, col, '#1d1442', 4, FU, 700, 'center');
    ctx.globalAlpha = 1;
  }
  txt('R : recommencer', W - 12, H - 10, 10.5, 'rgba(255,255,255,0.55)', 600, 'right');
  ctx.restore();
}
