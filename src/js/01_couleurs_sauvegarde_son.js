// =====================================================================
//  LOOK: one palette per chapter world, plus the hero's own colours
// =====================================================================
const THEMES = {
  hills: {
    sky:['#64c4ff', '#b3e6ff', '#effaff'], dark:false,
    far:'#b7e6a8', mid:'#88d07e', tree:'#3f9a4c', cloud:'#ffffff', cloudShade:'#d6ecff',
    top:'#7edc5c', topDark:'#3f9f3a', body:['#d6965a', '#a5663a'], line:'#4a2a14',
    mover:['#fff2cf', '#f2b04f'], jet:'#ffffff', doorFrame:'#b9a88f', turret:['#9aa0bf', '#6c7090'],
  },
  cave: {
    sky:['#0f2833', '#1b4651', '#245c62'], dark:true, darkness:'rgba(3,10,18,0.42)',
    far:'#12333f', mid:'#0c2630', crystal:['#7ff6e6', '#ff9ae0', '#b6a2ff'],
    top:'#63e6c4', topDark:'#2d9c86', body:['#706e9b', '#45436d'], line:'#14172c',
    mover:['#d4fbff', '#5fb9d6'], jet:'#7ff6e6', doorFrame:'#5b5983', turret:['#7d7aa8', '#4b4973'],
  },
  tower: {
    sky:['#5a46ab', '#f0858b', '#ffd08c'], dark:false,
    far:'#d896ad', mid:'#a5679a', near:'#704a83', cloud:'#ffd9cc', cloudShade:'#f2a9a8',
    top:'#fbf0dd', topDark:'#cdb89e', body:['#c4b2a0', '#937f73'], line:'#3e2a3a',
    mover:['#ffffff', '#a9c4ff'], jet:'#ffe8a8', doorFrame:'#a8968a', turret:['#a7a0b8', '#6f6880'],
  },
  fortress: {
    sky:['#1a0710', '#4a1220', '#932c22'], dark:true, darkness:'rgba(22,2,8,0.34)',
    far:'#3c1020', mid:'#2a0a14', near:'#19060c',
    top:'#ff9a4a', topDark:'#c2462a', body:['#5b4654', '#33262f'], line:'#12080d', crack:'#ff7a2a',
    mover:['#ffd9b8', '#c9603e'], jet:'#ffb347', doorFrame:'#5d4853', turret:['#73606c', '#45353f'],
  },
  night: {
    sky:['#060a24', '#1a1650', '#4a2f74'], dark:true, darkness:'rgba(4,3,18,0.28)',
    far:'#262060', mid:'#18143f',
    top:'#ffd970', topDark:'#c9a043', body:['#3d3878', '#221e4e'], line:'#0b0920',
    mover:['#fff6d8', '#e0b65a'], jet:'#ffe9a8', doorFrame:'#7a72b8', turret:['#a49be0', '#6a62a8'],
  },
};
THEMES.ascent = { ...THEMES.fortress, sky:['#260709', '#55130f', '#8a2913'] };
// season 2
THEMES.sky = {
  sky:['#8a7cff', '#f0b0ff', '#ffe4f2'], dark:false,
  far:'#efd2ff', mid:'#dcb6f6', cloud:'#ffffff', cloudShade:'#f4d8ff',
  top:'#fff6ff', topDark:'#e0b0ee', body:['#c8b4f0', '#8f78c8'], line:'#3a2870',
  mover:['#ffffff', '#ffa8e6'], jet:'#ffffff', doorFrame:'#b4a2e0', turret:['#c8baf0', '#8e7ec8'], slick:'#a8bde6',
  bat:['#e86ab8', '#ff9ad6', '#ffe0f4'],
};
THEMES.canyon = {
  sky:['#ff8f5a', '#ffc98a', '#fff0d2'], dark:false,
  far:'#eea070', mid:'#d27848', near:'#9a4a2a', cloud:'#fff3e0', cloudShade:'#ffd8b0',
  top:'#f8cf86', topDark:'#c07a3c', body:['#d88250', '#9e4c2c'], line:'#4a1e10',
  mover:['#fff2dc', '#ff9a4a'], jet:'#ffe6b8', doorFrame:'#b98466', turret:['#cfa48a', '#8f6a56'], slick:'#cbbcae',
  bat:['#7a3c20', '#a8603a', '#f0c090'],
};
THEMES.ice = {
  sky:['#102454', '#3a72b4', '#bfe6ff'], dark:false,
  far:'#e0f2ff', mid:'#a8d0f0', near:'#78a6d2',
  top:'#f6fcff', topDark:'#b0d4ec', body:['#b2d0ec', '#6f94c4'], line:'#1c3456',
  mover:['#ffffff', '#a8dcff'], jet:'#e6f8ff', doorFrame:'#94b2d2', turret:['#bfd2e6', '#7c94b6'], slick:'#d0e6f8',
  bat:['#3a6aa8', '#5a8ad0', '#d0ecff'],
};
THEMES.cosmos = {
  sky:['#04021a', '#170a44', '#3a1470'], dark:true, darkness:'rgba(4,2,22,0.3)',
  far:'#2a1660', mid:'#1a0e40', near:'#120a2e', crystal:['#7ff6ff', '#ff9ae0', '#b6a2ff'],
  top:'#8ff4ff', topDark:'#3aa8c8', body:['#3b3184', '#1c1650'], line:'#07051a', crack:'#ff7ae0',
  mover:['#eafcff', '#7fd8ff'], jet:'#9ff0ff', doorFrame:'#6a62b8', turret:['#9a8fe0', '#5a52a0'], slick:'#6a64b4',
  bat:['#2c2066', '#5a3ec0', '#c8b8ff'],
};
THEMES.nest = {
  sky:['#1c1240', '#5e2c6c', '#e8845a'], dark:true, darkness:'rgba(10,4,26,0.3)',
  far:'#3e2456', mid:'#2c163e', near:'#1c0e2a',
  top:'#d6ac70', topDark:'#946a3c', body:['#86603e', '#523422'], line:'#1c0e08', crack:'#ffcf6a',
  mover:['#ffeccc', '#dca44a'], jet:'#ffdc98', doorFrame:'#94724e', turret:['#a494b4', '#706080'], slick:'#9a8cb4',
  bat:['#221a30', '#3a2e4c', '#8a7aa8'],
};
const CH_ACCENT = ['#3fbf5a', '#a879ff', '#ff9a52', '#ff5c5c', '#ffd54a', '#ff7ae0', '#ff9a3c', '#6fd0ff', '#c79bff', '#7ff6ff'];
const CRITTER = ['#ff8a3d', '#ff5fa2', '#2ec4b6', '#ff4d4d', '#7fd6ff', '#ff9ad8', '#e0763a', '#5fb8ff', '#9b7bd6', '#ff7ae0'];
const STORY_END = 3;     // the adventure ends with chapter 4; the bonus comes after
const HERO = { body:'#3b0cad', deep:'#1c0552', light:'#7b56ff', eye:'#ffffff', line:'#0c0222', mouth:'#14033f', tongue:'#ff6b9a' };
const POWER_COLORS = { doubleJump:'#2ee6ff', life:'#ff4d6d', shoot:'#ff8a3d', gem:'#9fe8ff', wall:'#7dff9a', dash:'#ffd23f', gravity:'#ff7ae0' };
const S2_BOSS = new Set(['gecko', 'yeti', 'magpie']);

// =====================================================================
//  SAVE
// =====================================================================
const SAVE_KEY = 'platformer_save_v2';
const freshSave = () => ({ unlocked:1, gems:CHAPTERS.map(() => false), bestRun:null, bestCh:CHAPTERS.map(() => null), recipe:[false,false,false,false], unlocked2:1, bestRun2:null, seen:{} });
let save = freshSave();
try{ const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if(s) save = Object.assign(save, s); }catch(e){}
if(!Array.isArray(save.recipe) || save.recipe.length !== 4) save.recipe = [false,false,false,false];
while(save.bestCh.length < CHAPTERS.length) save.bestCh.push(null);
while(save.gems.length < CHAPTERS.length) save.gems.push(false);
if(!save.seen || typeof save.seen !== 'object') save.seen = {};
if(!(save.unlocked2 >= 1)) save.unlocked2 = 1;
if(save.bestCh[3] != null) save.unlocked = Math.max(save.unlocked, 5);   // finished the adventure
// the two secret bonuses: « Les Étoiles » once season 1 is finished, « Le Cosmos » once season 2 is.
// The creator mode (a secret in the credits) opens everything without touching the real progress.
const bonusOpen = () => save.bestCh[3] != null || SET.creator;
const isUnlocked = i => {
  const c = CHAPTERS[i];
  if(SET.creator) return true;
  if(c.bonus) return c.bonus2 ? !!save.s2Done : save.bestCh[3] != null;
  return c.season === 2 ? c.num <= save.unlocked2 : i < save.unlocked;
};
const bonusVisible = () => CHAPTERS.some((c, i) => c.bonus && isUnlocked(i));
const isNewApp = i => isUnlocked(i) && !save.seen[i] && save.bestCh[i] == null && !(i === S2_FIRST && save.s2Seen);
function persist(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }catch(e){} }

// =====================================================================
//  AUDIO (tiny synth, starts after the first key press or tap)
// =====================================================================
let ac = null, muted = false, VOL = 1;
function initAudio(){
  if(ac) return;
  try{ ac = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ ac = null; }
}
function tone(f, d, type='square', v=0.05, f2=null, delay=0){
  if(muted || !ac || VOL <= 0) return;
  const t = ac.currentTime + delay;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t);
  if(f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
  g.gain.setValueAtTime(v * VOL, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g).connect(ac.destination);
  o.start(t); o.stop(t + d + 0.02);
}
const SFX = {
  jump(){ tone(380,.12,'triangle',.06,760); },
  flip(){ tone(520,.16,'triangle',.05,1250); },
  coin(){ tone(988,.06,'square',.03); tone(1319,.12,'square',.03,null,.06); },
  stomp(){ tone(300,.12,'square',.05,90); },
  hurt(){ tone(240,.25,'sawtooth',.05,70); },
  shoot(){ tone(900,.08,'square',.025,300); },
  bossHit(){ tone(160,.15,'square',.06,80); tone(600,.06,'triangle',.05); },
  bossShot(){ tone(200,.1,'triangle',.05,400); },
  bossFlee(){ tone(180,.7,'sawtooth',.05,900); },
  turret(){ tone(500,.06,'triangle',.02,250); },
  ting(){ tone(1800,.07,'triangle',.03,1400); },
  spring(){ tone(200,.25,'triangle',.07,900); },
  crumble(){ tone(120,.2,'sawtooth',.035,60); },
  checkpoint(){ [660,880,1100].forEach((f,i)=>tone(f,.09,'triangle',.05,null,i*.06)); },
  thud(){ tone(90,.2,'square',.06,40); },
  land(){ tone(150,.07,'triangle',.05,90); },
  warn(){ tone(700,.08,'square',.035); tone(700,.08,'square',.035,null,.12); },
  power(){ [523,659,784,1047].forEach((f,i)=>tone(f,.1,'triangle',.05,null,i*.07)); },
  key(){ [784,988,1319].forEach((f,i)=>tone(f,.12,'triangle',.06,null,i*.08)); },
  door(){ tone(440,.2,'triangle',.05,880); },
  bloop(){ tone(260,.14,'sine',.07,720); },
  splat(){ tone(180,.2,'sawtooth',.04,50); tone(90,.25,'triangle',.05,null,.05); },
  menu(){ tone(660,.05,'triangle',.04); },
  crack(){ tone(1400,.05,'square',.05,300); tone(90,.25,'square',.07,40,.03); tone(520,.12,'triangle',.04,180,.1); },
  win(){ [523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.16,'triangle',.06,null,i*.12)); },
  over(){ [392,330,262,196].forEach((f,i)=>tone(f,.25,'triangle',.06,null,i*.2)); },
  walljump(){ tone(300,.09,'square',.035,620); tone(520,.06,'triangle',.03,null,.03); },
  dash(){ tone(180,.16,'sawtooth',.03,900); tone(1200,.08,'triangle',.025,500,.02); },
  gravity(g){ tone(g < 0 ? 420 : 840,.22,'sine',.06,g < 0 ? 1100 : 300); tone(g < 0 ? 630 : 1260,.14,'triangle',.03,g < 0 ? 1600 : 500,.04); },
  glass(){ tone(2200,.09,'square',.03,900); tone(1400,.2,'triangle',.04,300,.03); tone(3000,.05,'sine',.03,null,.06); },
};

// =====================================================================
//  SETTINGS (kept in the save): sound, volume, lives, timer, screen shake,
//  reduced animations, XELIAX's colour, and the secret creator mode
// =====================================================================
const SKINS = [
  {id:'indigo', name:'Indigo', body:'#3b0cad', deep:'#1c0552', light:'#7b56ff'},
  {id:'menthe', name:'Menthe', body:'#0d8a70', deep:'#04382d', light:'#3fd6ae'},
  {id:'framboise', name:'Framboise', body:'#b8145a', deep:'#4a0624', light:'#ff5c9a'},
  {id:'ocean', name:'Océan', body:'#1456b0', deep:'#07234d', light:'#4fa6ff'},
  {id:'citrouille', name:'Citrouille', body:'#d05a14', deep:'#561f04', light:'#ffa25c'},
  {id:'nuit', name:'Nuit', body:'#262046', deep:'#0b0918', light:'#6a63a8'},
  {id:'or', name:'Or', body:'#c08a0a', deep:'#553a00', light:'#ffd85a', lock:'gold'},
  {id:'cristal', name:'Cristal', body:'#2a9cc0', deep:'#0a4458', light:'#b4f2ff', lock:'crystal'},
];
save.settings = Object.assign({vol:8, sound:true, shake:true, reduced:false, timer:true, lives:5, skin:'indigo', creator:false, creatorFound:false}, save.settings || {});
if(![3, 5, 7, 9].includes(save.settings.lives)) save.settings.lives = 5;
const SET = save.settings;
const skinOpen = s => !s.lock || SET.creator || (s.lock === 'gold' ? !!save.goldFicelle : !!save.crystalFicelle);
const skinOf = () => SKINS.find(s => s.id === SET.skin && skinOpen(s)) || SKINS[0];
const startLives = () => SET.lives || 5;
function applySettings(){
  REDUCED = MEDIA_REDUCED || !!SET.reduced;
  muted = !SET.sound;
  VOL = Math.pow(clamp(SET.vol, 0, 10) / 8, 1.5);
  const s = skinOf();
  HERO.body = s.body; HERO.deep = s.deep; HERO.light = s.light;
}
function setSetting(k, v){ SET[k] = v; applySettings(); persist(); }
function setMuted(v){ setSetting('sound', !v); }
applySettings();

