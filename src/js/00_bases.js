
'use strict';
// DEMO : version en ligne (node outils/build.js --demo) : seuls les chapitres 1 et 2 ; le build remplace false par true
const DEMO = /*@DEMO*/false;
// la démo bloque tant que l'admin n'est pas connecté (Paramètres → Connexion admin) : connecté, tout s'ouvre pour tester
function demoOn(){ return DEMO && !(save.settings && save.settings.creator); }
// numéro de version affiché en bas à gauche des menus : le build met celui du dernier fichier versions/vNN.txt
const VERSION = /*@VERSION*/'';
// =====================================================================
//  MATH & EASING
// =====================================================================
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeInCubic = t => t * t * t;
const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutBack = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
const TAU = Math.PI * 2;
function hash(n){
  n = Math.imul((n | 0) ^ 0x5bd1e995, 0x85ebca6b);
  n ^= n >>> 13; n = Math.imul(n, 0xc2b2ae35); n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
function hexRGB(hex){ const n = parseInt(hex.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgba(hex, a){ const [r, g, b] = hexRGB(hex); return `rgba(${r},${g},${b},${a})`; }
function shade(hex, amt){
  let [r, g, b] = hexRGB(hex);
  if(amt < 0){ r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; }
  else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}

// =====================================================================
//  CANVAS (crisp at any size: backing store follows the CSS size)
// =====================================================================
const canvas = document.getElementById('game');
let ctx = canvas.getContext('2d');      // swapped briefly to paint the chapter cards
const W = 640, H = 360;
let SCALE = 1;
let RES_K = 1;   // v54 : qualité automatique — baisse un peu la résolution si le PC n'arrive pas à suivre (en jeu seulement, v62)
const MEDIA_REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
let REDUCED = MEDIA_REDUCED;      // also on when « Animations réduites » is ticked in the settings
const TOUCH = !!(window.matchMedia && matchMedia('(hover: none), (pointer: coarse)').matches);
// v62 : texte net. Le canvas a exactement autant de pixels que l'écran lui en donne (un pixel du canvas = un pixel de l'écran,
// sinon le navigateur l'agrandit et tout devient flou). Menus, pause, résultats (CANVAS_UI) : toujours en pleine résolution,
// jusqu'à la 4K. En jeu : au plus 2560 px de large (2 pixels d'écran par pixel CSS au plus), fois RES_K (qualité automatique).
let CANVAS_UI = true;     // vrai dans les menus et écrans d'interface (mis à jour par la boucle, voir canvasModeSync)
let DEV_PX = null;        // taille exacte en pixels d'écran donnée par le navigateur (Chrome, Edge, Firefox récents)
function fitCanvas(){
  const r = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const cw = r.width || W;
  // (la taille exacte n'est crue que si elle colle à taille CSS × devicePixelRatio : certains navigateurs/émulateurs la donnent fausse)
  const dev = DEV_PX && Math.abs(DEV_PX[0] - cw * dpr) <= 2 ? DEV_PX : null;
  const devW = dev ? dev[0] : Math.round(cw * dpr), devH = dev ? dev[1] : Math.round(devW * H / W);
  let bw, bh;
  if(CANVAS_UI ? devW <= 3840 : (devW <= 2560 && dpr <= 2 && RES_K >= 1)){ bw = devW; bh = devH; }   // pixel pour pixel
  else {
    const cap = CANVAS_UI ? 3840 : Math.min(2560, Math.round(cw * Math.min(dpr, 2)));
    bw = Math.round(clamp(Math.min(devW, cap) * (CANVAS_UI ? 1 : RES_K), 320, 3840)); bh = Math.round(bw * H / W);
  }
  if(canvas.width !== bw || canvas.height !== bh){ canvas.width = bw; canvas.height = bh; }
  SCALE = bw / W;
}
// appelé à chaque image par la boucle : passe le canvas en pleine résolution dans les menus, en résolution « jeu » sinon
function canvasModeSync(ui){ if(ui !== CANVAS_UI){ CANVAS_UI = ui; fitCanvas(); } }
// le canvas doit commencer sur un pixel entier de l'écran (sinon l'image est rééchantillonnée, donc floue) : on arrondit sa taille
function snapCanvasBox(){
  const dpr = window.devicePixelRatio || 1;
  const vw = document.documentElement.clientWidth || window.innerWidth, vh = window.innerHeight;
  // taille en pixels d'écran, de même parité que la fenêtre pour que le centrage tombe sur un pixel entier
  const VW = Math.round(vw * dpr), VH = Math.round(vh * dpr);
  let dw = Math.floor(Math.min(VW, VH * W / H)); if((VW - dw) % 2) dw--;
  let dh = Math.min(VH, Math.round(dw * H / W)); if((VH - dh) % 2) dh--;
  if(dw < 2 || dh < 2) return;
  canvas.style.width = (dw / dpr) + 'px'; canvas.style.height = (dh / dpr) + 'px';
}
function onCanvasBox(){ snapCanvasBox(); fitCanvas(); }
if(window.ResizeObserver){
  const ro = new ResizeObserver(es => {
    const e = es[es.length - 1], d = e && e.devicePixelContentBoxSize && e.devicePixelContentBoxSize[0];
    DEV_PX = d ? [Math.round(d.inlineSize), Math.round(d.blockSize)] : null;
    fitCanvas();
  });
  try{ ro.observe(canvas, {box:'device-pixel-content-box'}); }catch(e){ ro.observe(canvas); }
}
window.addEventListener('resize', onCanvasBox);
if(window.visualViewport) visualViewport.addEventListener('resize', onCanvasBox);
onCanvasBox();

const FD = "'Young Serif', Georgia, 'Times New Roman', serif";
const FU = "'Barlow Semi Condensed', 'Arial Narrow', 'Helvetica Neue', sans-serif";
try{ if(document.fonts) ['400 20px "Young Serif"', '500 20px "Barlow Semi Condensed"', '600 20px "Barlow Semi Condensed"', '700 20px "Barlow Semi Condensed"'].forEach(f => document.fonts.load(f).catch(() => {})); }catch(e){}

// =====================================================================
//  PHYSICS
// =====================================================================
const STEP = 1000 / 60;
const GRAVITY = 0.55, MAX_FALL = 12, JUMP_V = -10.6, DJ_V = -9.2, SPRING_V = -15;
const RUN = 3.6, ACCEL_GROUND = 0.35, ACCEL_AIR = 0.2;
const COYOTE = 6, BUFFER = 7;
const SHOT_SPEED = 7.5, SHOT_COOLDOWN = 16, CHARGE_FULL = 40;
const FLOOR = 340;
// season 2: wall slide / wall jump, dash, slippery ice
const WALL_SLIDE = 2.2, WJ_VX = 4.8, WJ_VY = -9.9, WALL_LOCK = 11, WALL_COY = 6;
const DASH_V = 8.6, DASH_T = 11, DASH_CD = 18, ICE_ACCEL = 0.06;
const DASH_BUF = 6;          // a dash pressed a little too early (still cooling down) fires as soon as it can

