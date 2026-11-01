// =====================================================================
//  TALKING TO PEOPLE (each one teaches a step of the ficelle aux olives)
// =====================================================================
let npcs = [], nearNpc = null, talk = null;

function interact(){
  if(state === 'talk'){ advanceTalk(); return true; }
  if(state === 'play' && nearNpc && player.onGround && !player.dead && !cine && finaleT === 0 && exitT === 0 && fadeDir === 0){
    talk = {npc:nearNpc, data:NPCS[nearNpc.who], line:0, chars:0, blip:0};
    player.vx = 0;
    player.facing = nearNpc.x + 13 > player.x + player.w / 2 ? 1 : -1;
    setState('talk');
    SFX.menu();
    return true;
  }
  return false;
}
function endTalk(){ talk = null; setState('play'); }
function advanceTalk(){
  if(!talk) return;
  const D = talk.data, L = D.lines[talk.line];
  if(talk.chars < L.length){ talk.chars = L.length; return; }
  talk.line++; talk.chars = 0; talk.blip = 0;
  if(talk.line < D.lines.length){ SFX.menu(); return; }
  if(D.step == null){
    save.talked = save.talked || {}; save.talked[talk.npc.who] = true; persist();
    const n = talk.npc;
    endTalk();
    if(n.gives) npcGive(n);
    return;
  }
  const isNew = !save.recipe[D.step];
  save.recipe[D.step] = true; persist();
  const n = talk.npc;
  endTalk();
  if(isNew){
    const all = save.recipe.every(Boolean);
    showToast(all ? 'Tu connais toute la recette de la ficelle aux olives !' : `Recette apprise : étape ${D.step + 1} sur 4`, all ? 170 : 130);
    sparkle(n.x + 13, n.y - 30, 14, '#ffe066');
    SFX.key();
  }
}
// someone hands XELIAX a power at the end of the talk (Gaston gives the suckers in 2-1)
function npcGive(n){
  if(n.gives === 'wall' && hasWall) return;
  if(n.gives === 'wall') hasWall = true;
  const cx = player.x + player.w / 2, cy = player.y + player.h / 2, col = POWER_COLORS[n.gives] || '#ffffff';
  ring(cx, cy, col, 6, 50, 26); sparkle(cx, cy, 16, col); burst(cx, cy, 12, col, 2.4, 30, 0.02, 3, 'star');
  setFace(anim, 'open', 60); anim.wobV += 0.6;
  SFX.power();
  showToast('Gaston t\'a donné les ventouses ! Saute contre un mur', 190);
}
function animNpcs(){
  for(const n of npcs){
    n.t += 0.05;
    if(n.blink > 0) n.blink--;
    else if(Math.random() < 0.006) n.blink = 7;
  }
}
function stepTalk(){
  animNpcs();
  if(!talk) return;
  const L = talk.data.lines[talk.line];
  if(talk.chars < L.length){
    talk.chars = Math.min(L.length, talk.chars + 1.5);
    const shown = Math.floor(talk.chars);
    if(shown >= talk.blip + 3){
      talk.blip = shown;
      if(L[shown - 1] !== ' ') tone(talk.data.voice * (0.9 + Math.random() * 0.2), 0.035, 'triangle', 0.025);
    }
  }
}

// game over in a bonus room: only that room starts again
function restartRoom(){
  continues++;
  lives = startLives();
  loadRoom(chIndex, rIndex);
  bannerT = 0;
  player.invuln = 60;
  anim.appear = 0;
  setState('play');
  showToast('On recommence la salle', 90);
}

