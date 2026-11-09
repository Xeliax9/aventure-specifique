
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
let RES_K = 1;   // v54 : qualité automatique — baisse un peu la résolution si le PC n'arrive pas à suivre
const MEDIA_REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
let REDUCED = MEDIA_REDUCED;      // also on when « Animations réduites » is ticked in the settings
const TOUCH = !!(window.matchMedia && matchMedia('(hover: none), (pointer: coarse)').matches);
function fitCanvas(){
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const bw = Math.round(clamp((r.width || W) * dpr * RES_K, 320, 2240));
  const bh = Math.round(bw * H / W);
  if(canvas.width !== bw || canvas.height !== bh){ canvas.width = bw; canvas.height = bh; }
  SCALE = bw / W;
}
if(window.ResizeObserver) new ResizeObserver(fitCanvas).observe(canvas);
else window.addEventListener('resize', fitCanvas);
fitCanvas();

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

