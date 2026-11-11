// =====================================================================
//  v54 : LES POUVOIRS DÉJÀ REÇUS (au moins une fois, gardés dans la sauvegarde)
//  Tant que XELIAX n'a jamais reçu un pouvoir, les menus n'en parlent pas :
//  page Commandes (et celle de la pause), bouton tactile du dash, cartes et
//  indices des chapitres, XELIAX armé dans « Comment battre… ».
//  save.powers = {dj, shoot, gravity, wall, dash} ; pour une ancienne sauvegarde,
//  on déduit ce qui a déjà été reçu des chapitres finis. Admin / créateur : tout.
// =====================================================================
const seenPowers = () => (save.powers && typeof save.powers === 'object') ? save.powers : (save.powers = {});   // aussi après un « tout effacer »
// dans la démo (chapitres 1 et 2), seul le double saut peut avoir été reçu
const POWERS_DEMO = {dj:true};
function powerSeen(k){
  if(SET.creator) return true;
  if(demoOn() && !POWERS_DEMO[k]) return false;
  if(seenPowers()[k]) return true;
  const s2 = !!(save.s2Seen || save.unlocked2 > 1 || save.s2Done);
  if(k === 'dj') return s2 || save.unlocked > 1 || save.bestCh.some(v => v != null);   // chapitre 1 fini = double saut ramassé
  if(k === 'shoot') return s2 || save.bestCh.some((v, i) => v != null && i >= 2 && i <= STORY_END);   // v55 : chapitre 3 fini = arme reçue du Gardien
  if(k === 'gravity') return s2;                                                        // la saison 2 commence tête en bas
  if(k === 'wall' || k === 'dash') return save.unlocked2 > 2 || !!save.s2Done;          // monde 2 fini : ventouses (2-1) et dash (Gecko)
  return false;
}
// pendant une partie : ce que XELIAX a en ce moment est noté pour toujours
function notePowers(){
  const p = seenPowers();
  let changed = false;
  const note = (k, on) => { if(on && !p[k]){ p[k] = true; changed = true; } };
  note('dj', hasDJ); note('shoot', canShoot); note('wall', hasWall); note('dash', hasDash); note('gravity', gdir < 0);
  if(changed) persist();
}
// page Commandes : seulement les actions déjà connues
const KEY_POWER = {shoot:'shoot', dash:'dash'};
function keyRows(){
  return KEY_ROWS.filter(r => !KEY_POWER[r.id] || powerSeen(KEY_POWER[r.id]))
    .map(r => r.id === 'jump' && !powerSeen('dj') ? Object.assign({}, r, {label:'Sauter'}) : r);
}
// cartes et indices des chapitres de la saison 2 : pas un mot d'un pouvoir pas encore reçu
const TAGLINE_HIDDEN = {gravity:'La pie file vers le ciel !', wall:'Il va falloir grimper !', dash:'Des plumes noires sur la glace'};
function tagline(i){
  const c = CHAPTERS[i], k = c && c.season === 2 && !c.bonus ? ['', 'gravity', 'wall', 'dash'][c.num] : '';
  return k && !powerSeen(k) ? TAGLINE_HIDDEN[k] : (TAGLINE[i] || '');
}
// écran tactile : le bouton du dash n'apparaît qu'une fois le dash reçu
let padDashShown = null;
function syncPowerPad(){
  const v = powerSeen('dash');
  if(v === padDashShown) return;
  padDashShown = v;
  const b = document.getElementById('dash');
  if(b) b.hidden = !v;
}
