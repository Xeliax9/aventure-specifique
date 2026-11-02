// Rassemble le jeu : src/ -> dist/aventure.html (un seul fichier, jouable hors ligne)
//   1. la saison 2 est générée depuis src/niveaux/saison2/entetes.js + salles/<monde>-<salle>.js
//   2. les fichiers de src/js et src/niveaux sont mis bout à bout dans l'ordre de src/ordre.json
// usage : node outils/build.js [--out chemin.html] [--demo]
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), SRC = path.join(ROOT, 'src');
const out = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : path.join(ROOT, 'dist', 'aventure.html');

// ---- saison 2 : une salle par fichier
const S2 = path.join(SRC, 'niveaux', 'saison2');
const headers = require(path.join(S2, 'entetes.js'));
const q = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";
function lit(v){
  if(v === null) return 'null';
  if(typeof v === 'string') return q(v);
  if(typeof v === 'number' || typeof v === 'boolean') return String(v);
  if(Array.isArray(v)) return '[' + v.map(lit).join(', ') + ']';
  return '{' + Object.entries(v).map(([k, x]) => `${k}:${lit(x)}`).join(', ') + '}';
}
const ORDER = ['name', 'label', 'width', 'height', 'sky', 'deco', 'tint', 'armed', 'shootUp', 'finale', 'gold', 'lava', 'barrierY', 'startG',
  'needsKey', 'keyAt', 'keySpot', 'start', 'platforms', 'walls', 'flips', 'springs', 'spikes', 'turrets', 'enemies', 'bats', 'signs',
  'powerUps', 'checkpoints', 'npcs', 'coins', 'boss', 'phase2Spikes', 'needsBoss', 'door'];
const LIST = new Set(['platforms', 'walls', 'flips', 'spikes', 'signs', 'turrets', 'enemies', 'bats']);
function roomText(r){
  const keys = [...ORDER.filter(k => k in r), ...Object.keys(r).filter(k => !ORDER.includes(k))];
  const o = []; let head = [];
  const flush = () => { if(head.length){ o.push('        ' + head.join(', ') + ','); head = []; } };
  for(const k of keys){
    const v = r[k];
    if(LIST.has(k) && Array.isArray(v) && v.length > 2){ flush(); o.push(`        ${k}:[`); v.forEach(x => o.push(`          ${lit(x)},`)); o.push('        ],'); }
    else if(['name', 'label', 'start', 'door', 'coins', 'checkpoints', 'powerUps', 'npcs', 'springs', 'boss', 'lava', 'keyAt', 'keySpot'].includes(k)){ flush(); o.push(`        ${k}:${lit(v)},`); }
    else head.push(`${k}:${lit(v)}`);
  }
  flush();
  return '      {\n' + o.join('\n') + '\n      },';
}
const loadRoom = tag => new Function('FLOOR', 'return (' + fs.readFileSync(path.join(S2, 'salles', tag + '.js'), 'utf8') + ');')(340);
const chapters = headers.map(h => {
  const rooms = h.rooms.map(loadRoom);
  const head = Object.entries(h).filter(([k]) => k !== 'rooms').map(([k, v]) => `${k}:${lit(v)}`).join(', ');
  return {obj:{...h, rooms}, text:'  {\n    ' + head + ',\n    rooms:[\n' + rooms.map(roomText).join('\n') + '\n    ],\n  },'};
});
const body = chapters.map(c => c.text).join('\n');
fs.writeFileSync(path.join(SRC, 'niveaux', 'saison2.js'), '  // ==== SEASON 2 ====\n' + body + '\n');
fs.mkdirSync(path.join(ROOT, 'outils', 'cache'), {recursive:true});
fs.writeFileSync(path.join(ROOT, 'outils', 'cache', 'chapters2.js'), 'const CHAPTERS2 = [\n' + body + '\n];\n');

// ---- assemblage
const order = JSON.parse(fs.readFileSync(path.join(SRC, 'ordre.json'), 'utf8'));
let js = order.map(f => fs.readFileSync(path.join(SRC, f), 'utf8')).join('');
// --demo : version en ligne, seuls les chapitres 1 et 2 (voir DEMO dans src/js/00_bases.js)
if(process.argv.includes('--demo')) js = js.replace('/*@DEMO*/false', 'true');
// numéro de version : 0.9.NN, NN = le plus grand versions/vNN.txt
const vMax = Math.max(0, ...fs.readdirSync(path.join(ROOT, 'versions')).map(f => +(/^v(\d+)\.txt$/.exec(f) || [])[1] || 0));
js = js.replace("/*@VERSION*/''", () => `'v0.9.${vMax}'`);   // affiché « v0.9.50 » (0.9 = démo, jeu pas fini ; 1.0.0 = jeu complet en ligne) ; le tag GitHub a le même nom
const css = fs.readFileSync(path.join(SRC, 'style.css'), 'utf8');
const page = fs.readFileSync(path.join(SRC, 'page.html'), 'utf8');
const html = page.replace('/*@CSS*/', () => css).replace('/*@JS*/', () => js);
fs.mkdirSync(path.dirname(out), {recursive:true});
fs.writeFileSync(out, html);
console.log('ok :', path.relative(process.cwd(), out), (html.length / 1024).toFixed(0) + ' Ko', '| saison 2 :', chapters.map(c => `${c.obj.num}:${c.obj.rooms.length}`).join(' '));
