// =====================================================================
//  PEOPLE OF THE WORLD: the four steps of the ficelle aux olives
// =====================================================================
const NPCS = {
  farine:{
    name:'Mamie Farine', step:0, title:'la pâte', voice:520, accent:'#f3dfc0',
    lines:[
      'Oh, bonjour XELIAX ! Tu pars chercher la ficelle aux olives ? Alors il faut d\'abord savoir comment on la fait.',
      'Une ficelle, c\'est une baguette toute fine. Pour en faire quatre : 500 g de farine, 330 g d\'eau, 10 g de sel, 5 g de levure fraîche et 150 g d\'olives.',
      'Mélange la farine et l\'eau, puis laisse reposer 30 minutes. Ensuite seulement, ajoute le sel et la levure.',
      'Pour la suite, demande aux gens que tu croiseras en chemin. Bon voyage, mon petit !',
    ],
  },
  gaston:{
    name:'Gaston', step:1, title:'pétrir et laisser pousser', voice:260, accent:'#ffd36b',
    lines:[
      'Salut ! Moi c\'est Gaston. Ça sent le pain jusqu\'ici, tu ne trouves pas ?',
      'Pétris ta pâte une dizaine de minutes, jusqu\'à ce qu\'elle soit lisse et qu\'elle ne colle presque plus.',
      'Égoutte bien les olives dénoyautées, coupe-les en morceaux et ajoute-les à la toute fin du pétrissage.',
      'Puis laisse lever 1 h 30 sous un torchon, en rabattant la pâte une fois à mi-chemin. Bien au chaud, pas comme dans ma grotte !',
    ],
  },
  olivia:{
    name:'Olivia', step:2, title:'façonner', voice:780, accent:'#b5d66a',
    lines:[
      'Bonjour ! Je suis une olive, alors la ficelle aux olives, c\'est un peu ma famille.',
      'Coupe la pâte en quatre morceaux égaux et laisse-les se détendre 20 minutes.',
      'Roule chaque morceau en un boudin très fin d\'environ 50 cm. C\'est cette finesse qui en fait une ficelle.',
      'Pose-les sur un torchon fariné et laisse-les lever encore 45 minutes. Tout doux avec mes cousines !',
    ],
  },
  levain:{
    name:'Maître Levain', step:3, title:'la cuisson', voice:200, accent:'#ffb36b',
    lines:[
      'Halte ! Je suis Maître Levain, boulanger depuis toujours. Le Seigneur Pourpre m\'a volé ma plus belle ficelle aux olives.',
      'Préchauffe le four à 250 °C, avec un petit bol d\'eau dedans pour faire de la vapeur.',
      'Avec une lame bien coupante, fais trois ou quatre entailles en biais sur chaque ficelle.',
      'Enfourne 15 à 18 minutes, jusqu\'à ce que la croûte soit bien dorée. Va, et ramène-moi cette ficelle !',
    ],
  },
};

// season 2: the same friends, with news about the magpie
Object.assign(NPCS, {
  farine2:{
    name:'Mamie Farine', base:'farine', step:null, title:'la pie voleuse', voice:520, accent:'#f3dfc0',
    lines:[
      'XELIAX ! Une pie voleuse t\'a chipé la ficelle aux olives, juste sous ton nez !',
      'Elle s\'est envolée vers le ciel. Là-haut, la gravité fait n\'importe quoi…',
      'Touche les orbes roses et tu marcheras au plafond. Ramène-moi cette ficelle, mon petit !',
    ],
  },
  gaston2:{
    name:'Gaston', base:'gaston', step:null, title:'les ventouses', voice:260, accent:'#ffd36b',
    lines:[
      'Salut XELIAX ! La pie est passée en rase-mottes, elle a filé au fond des gorges.',
      'Elle t\'a volé ton double saut ? Je l\'ai vu tomber tout au fond de la faille. J\'irai le chercher pour toi, promis.',
      'En attendant, ici, on apprend à grimper !',
      'Prends ces ventouses : colle-toi aux murs, glisse, et saute d\'un mur à l\'autre pour grimper.',
      'Par contre, sur les parois lisses et brillantes, rien ne tient. Même pas moi !',
    ],
  },
  gaston3:{
    name:'Gaston', base:'gaston', step:null, title:'le double saut', voice:260, accent:'#ffd36b',
    lines:[
      'Te revoilà ! Tu grimpes aux murs comme un vrai gecko maintenant.',
      'Regarde ce que j\'ai trouvé au fond de la faille : ton double saut ! Il est juste là, devant toi.',
      'Plus haut, la faille s\'élargit : saut de mur, puis double saut.',
    ],
  },
  olivia2:{
    name:'Olivia', base:'olivia', step:null, title:'le dash', voice:780, accent:'#b5d66a',
    lines:[
      'Brrr ! Il fait un froid de canard sur ce glacier.',
      'Tu as arraché le dash au Gecko Géant ? Bravo ! Il marche aussi juste après ton double saut.',
      'Avec le dash, fonce droit dans les murs de glace : ils volent en éclats !',
      'Et attention au sol gelé : ça glisse, et pas qu\'un peu.',
    ],
  },
  levain2:{
    name:'Maître Levain', base:'levain', step:null, title:'le nid', voice:200, accent:'#ffb36b',
    lines:[
      'La pie a bâti son nid tout là-haut, au cœur de l\'orage.',
      'Elle garde la ficelle aux olives au milieu de tous ses trésors qui brillent.',
      'Sers-toi de tout ce que tu as appris, XELIAX. Et ramène-la avant qu\'elle ne rassisse !',
    ],
  },
});
const npcLook = who => (NPCS[who] && NPCS[who].base) || who;

function npcLegs(col){
  ctx.strokeStyle = col; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-4, -7); ctx.lineTo(-5, -0.5); ctx.moveTo(4, -7); ctx.lineTo(5, -0.5); ctx.stroke();
}
function npcMouth(x, y, open, col){
  ctx.strokeStyle = col; ctx.lineWidth = 1;
  if(open){ ctx.fillStyle = '#4a1f26'; ctx.beginPath(); ctx.ellipse(x, y + 0.6, 2, 1.6, 0, 0, TAU); ctx.fill(); }
  else { ctx.beginPath(); ctx.arc(x, y - 1, 2.4, 0.25 * Math.PI, 0.75 * Math.PI); ctx.stroke(); }
}
function npcMamie(bob, blink, mouth){
  const ln = '#5a4632', cy = -15 + bob;
  npcLegs(ln);
  ctx.beginPath(); ctx.ellipse(0, cy, 11, 10, 0, 0, TAU); ctx.fillStyle = '#f3e7d3'; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = '#8fb8d8'; ctx.fillRect(-12, cy + 1, 24, 12);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-3, cy + 4, 6, 4);
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(0, cy, 11, 10, 0, 0, TAU); ctx.strokeStyle = ln; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#b9b0a6'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(-2, cy - 10, 5, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-5.5, cy - 13.5, 3, 0, TAU); ctx.fill(); ctx.stroke();
  for(const ex of [-1.5, 5]){
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex, cy - 3, 3, 0, TAU); ctx.fill();
    ctx.strokeStyle = ln; ctx.lineWidth = 0.9; ctx.stroke();
    ctx.fillStyle = ln;
    if(blink) ctx.fillRect(ex - 1.4, cy - 3.2, 2.8, 0.7);
    else { ctx.beginPath(); ctx.arc(ex + 0.6, cy - 3, 1, 0, TAU); ctx.fill(); }
  }
  ctx.beginPath(); ctx.moveTo(1.5, cy - 3); ctx.lineTo(2, cy - 3); ctx.stroke();
  ctx.fillStyle = 'rgba(255,140,150,0.45)'; ctx.beginPath(); ctx.arc(-4.5, cy + 1.5, 1.8, 0, TAU); ctx.arc(8, cy + 1.5, 1.8, 0, TAU); ctx.fill();
  npcMouth(2.5, cy + 4, mouth, ln);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for(const [fx, fy] of [[-7, cy + 6], [6, cy - 7], [-3, cy + 8]]){ ctx.beginPath(); ctx.arc(fx, fy, 0.7, 0, TAU); ctx.fill(); }
}
function npcGaston(bob, blink, mouth){
  const ln = '#3b2f27', cy = -14 + bob;
  npcLegs(ln);
  const beam = ctx.createLinearGradient(8, 0, 64, 0);
  beam.addColorStop(0, 'rgba(255,236,160,0.32)'); beam.addColorStop(1, 'rgba(255,236,160,0)');
  ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(7, cy - 12); ctx.lineTo(64, cy - 28); ctx.lineTo(64, cy + 6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, cy, 12, 11, 0, 0, TAU); ctx.fillStyle = '#8a7768'; ctx.fill(); ctx.strokeStyle = ln; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#b5a497'; ctx.beginPath(); ctx.ellipse(0, cy + 4.5, 7, 5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#f4a3b4'; ctx.beginPath(); ctx.ellipse(10, cy + 0.5, 4, 3, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = ln; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = ln; ctx.beginPath(); ctx.arc(12.5, cy - 0.2, 0.7, 0, TAU); ctx.fill();
  ctx.strokeStyle = ln; ctx.lineWidth = 1.2;
  for(const ex of [1, 6]){
    ctx.beginPath();
    if(blink){ ctx.moveTo(ex - 1.5, cy - 4); ctx.lineTo(ex + 1.5, cy - 4); }
    else ctx.arc(ex, cy - 3.5, 1.5, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }
  npcMouth(6, cy + 5, mouth, ln);
  ctx.fillStyle = '#ffcc33'; ctx.strokeStyle = '#7a5600'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(0, cy - 7, 10, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
  rr(-11.5, cy - 8, 23, 2.6, 1.3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff6c8'; ctx.beginPath(); ctx.arc(6, cy - 12, 2.4, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#efe6d8'; ctx.lineWidth = 1;
  for(const k of [-1, 0, 1]){ ctx.beginPath(); ctx.moveTo(-11 + k, cy + 4); ctx.lineTo(-13 + k, cy + 7); ctx.stroke(); }
}
function npcOlivia(bob, blink, mouth){
  const ln = '#33461a', cy = -16 + bob;
  npcLegs(ln);
  const g = ctx.createLinearGradient(-9, cy - 12, 9, cy + 12);
  g.addColorStop(0, '#b3cf5c'); g.addColorStop(1, '#6b8a2a');
  ctx.beginPath(); ctx.ellipse(0, cy, 9.5, 12, 0, 0, TAU); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = ln; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.ellipse(-4, cy - 6, 2.2, 4, -0.3, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#5a4020'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(0, cy - 12); ctx.quadraticCurveTo(1, cy - 15, 0.5, cy - 17); ctx.stroke();
  ctx.fillStyle = '#7fae4a'; ctx.strokeStyle = '#3d5a1e'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(4.5, cy - 17, 4.5, 2, -0.4, 0, TAU); ctx.fill(); ctx.stroke();
  for(const ex of [-2.5, 3.5]){
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(ex, cy - 2, 2.6, blink ? 0.5 : 3.2, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = ln; ctx.lineWidth = 0.8; ctx.stroke();
    if(!blink){ ctx.fillStyle = '#1a2008'; ctx.beginPath(); ctx.arc(ex + 0.6, cy - 1.6, 1.3, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.moveTo(ex + 1.6, cy - 5); ctx.lineTo(ex + 2.6, cy - 6.2); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,120,140,0.5)'; ctx.beginPath(); ctx.arc(-5.5, cy + 3, 1.6, 0, TAU); ctx.arc(6.5, cy + 3, 1.6, 0, TAU); ctx.fill();
  npcMouth(1, cy + 5.5, mouth, ln);
}
function npcLevain(bob, blink, mouth){
  const ln = '#5a3a1e', cy = -14 + bob;
  npcLegs('#3a2a20');
  ctx.save(); ctx.translate(-9, cy + 4); ctx.rotate(-0.6);
  rr(-2, -11, 4, 18, 2); ctx.fillStyle = '#d99a52'; ctx.fill(); ctx.strokeStyle = '#6a3a14'; ctx.lineWidth = 0.9; ctx.stroke();
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(0, cy, 11, 10.5, 0, 0, TAU); ctx.fillStyle = '#efd2a8'; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(-12, cy + 1.5, 24, 12);
  ctx.fillStyle = 'rgba(200,190,170,0.5)'; ctx.beginPath(); ctx.arc(-3, cy + 6, 2, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.beginPath(); ctx.ellipse(0, cy, 11, 10.5, 0, 0, TAU); ctx.strokeStyle = ln; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#c9c2b8'; ctx.lineWidth = 1;
  rr(-6, cy - 17, 12, 8, 1.5); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-4.5, cy - 19, 4.5, 0, TAU); ctx.moveTo(5.5, cy - 21.5); ctx.arc(0.5, cy - 21.5, 5, 0, TAU); ctx.moveTo(9.5, cy - 19); ctx.arc(5, cy - 19, 4.5, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillRect(-5.5, cy - 18, 11, 6);
  ctx.fillStyle = '#2a1a10';
  for(const ex of [1, 6]){
    if(blink) ctx.fillRect(ex - 1.3, cy - 4, 2.6, 0.7);
    else { ctx.beginPath(); ctx.arc(ex, cy - 4, 1.1, 0, TAU); ctx.fill(); }
  }
  ctx.strokeStyle = '#8a8a8a'; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-0.5, cy - 7); ctx.lineTo(2.5, cy - 7.5); ctx.moveTo(4.5, cy - 7.5); ctx.lineTo(7.5, cy - 7); ctx.stroke();
  ctx.fillStyle = '#e7a87e'; ctx.beginPath(); ctx.arc(4, cy - 0.5, 2.2, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8a8a8a';
  ctx.beginPath(); ctx.ellipse(1.5, cy + 2.6, 3.6, 1.6, 0.35, 0, TAU); ctx.moveTo(10.1, cy + 2.6); ctx.ellipse(6.5, cy + 2.6, 3.6, 1.6, -0.35, 0, TAU); ctx.fill();
  if(mouth){ ctx.fillStyle = '#4a1f26'; ctx.beginPath(); ctx.ellipse(4, cy + 5.2, 1.8, 1.3, 0, 0, TAU); ctx.fill(); }
}

function drawNpc(n, x, y, sc=1, talking=false, face=1){
  const bob = Math.sin(n.t * 2) * 0.7, blink = n.blink > 0;
  const mouth = talking && Math.sin(frame * 0.55) > -0.2;
  ctx.save();
  ctx.translate(x, y); ctx.scale(sc * face, sc);
  ctx.fillStyle = 'rgba(20,10,40,0.2)'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 2.4, 0, 0, TAU); ctx.fill();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const look = npcLook(n.who);
  if(look === 'farine') npcMamie(bob, blink, mouth);
  else if(look === 'gaston') npcGaston(bob, blink, mouth);
  else if(look === 'olivia') npcOlivia(bob, blink, mouth);
  else npcLevain(bob, blink, mouth);
  ctx.restore();
}

// "E Parler" bubble above someone you can talk to
function drawNpcPrompt(n){
  if(n.near <= 0.01 || state !== 'play' || idle.phase) return;
  const s = Math.max(0.01, easeOutBack(n.near));
  const D = NPCS[n.who], learned = D.step == null ? !!(save.talked && save.talked[n.who]) : save.recipe[D.step];
  const label = learned ? 'Reparler' : 'Parler', keyLabel = TOUCH ? '●' : keyName('talk');
  ctx.font = `700 11px ${FU}`;
  const kw = Math.max(19, ctx.measureText(keyLabel).width + 13);
  ctx.font = `600 11px ${FU}`;
  const tw = kw + 6 + ctx.measureText(label).width + 16;
  ctx.save();
  ctx.globalAlpha = Math.min(1, n.near * 1.5);
  ctx.translate(n.x + 13, n.y - 48); ctx.scale(s, s);
  rr(-tw / 2, -14, tw, 24, 12); ctx.fillStyle = 'rgba(14,9,34,0.86)'; ctx.fill();
  ctx.strokeStyle = rgba(D.accent, 0.8); ctx.lineWidth = 1.2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-4, 9.5); ctx.lineTo(0, 15); ctx.lineTo(4, 9.5); ctx.closePath(); ctx.fillStyle = 'rgba(14,9,34,0.86)'; ctx.fill();
  keycap(keyLabel, -tw / 2 + 8, 3);
  txt(label, -tw / 2 + 8 + kw + 6, 2.5, 11, '#ffffff', 600, 'left');
  ctx.restore();
}

function wrapLines(text, maxW){
  const words = text.split(' '), lines = [];
  let cur = '';
  for(const w of words){
    const test = cur ? cur + ' ' + w : w;
    if(ctx.measureText(test).width > maxW && cur){ lines.push(cur); cur = w; }
    else cur = test;
  }
  if(cur) lines.push(cur);
  return lines;
}

function drawTalk(){
  if(state !== 'talk' || !talk) return;
  const D = talk.data, n = talk.npc, full = D.lines[talk.line];
  const inP = easeOutCubic(clamp(stateT / 12, 0, 1));
  const top = n.y - viewY > H * 0.45;          // keep the speakers visible
  const bx = 20, bw = W - 40, bh = 122;
  const by = top ? 42 - (1 - inP) * 18 : H - 12 - bh + (1 - inP) * 18;
  ctx.save();
  ctx.globalAlpha = inP;
  rr(bx, by, bw, bh, 16); ctx.fillStyle = 'rgba(14,9,34,0.94)'; ctx.fill();
  ctx.strokeStyle = rgba(D.accent, 0.7); ctx.lineWidth = 1.5; ctx.stroke();
  // portrait
  const pcx = bx + 56, pcy = by + 60;
  ctx.save();
  ctx.beginPath(); ctx.arc(pcx, pcy, 40, 0, TAU);
  ctx.fillStyle = rgba(D.accent, 0.12); ctx.fill();
  ctx.clip();
  drawNpc(n, pcx, pcy + 41, 1.8, talk.chars < full.length, 1);
  ctx.restore();
  ctx.beginPath(); ctx.arc(pcx, pcy, 40, 0, TAU); ctx.strokeStyle = rgba(D.accent, 0.45); ctx.lineWidth = 1.2; ctx.stroke();
  // name and the recipe step this person teaches
  const tx = bx + 112;
  heading(D.name, tx, by + 29, 18, '#ffffff', 'left', false);
  ctx.font = `400 18px ${FD}`;
  const nameW = ctx.measureText(D.name).width;
  const chip = D.step == null ? `Saison 2 : ${D.title}` : `Recette, étape ${D.step + 1} sur 4 : ${D.title}`;
  ctx.font = `600 11px ${FU}`;
  const cw = ctx.measureText(chip).width + 18;
  rr(tx + nameW + 12, by + 14, cw, 19, 9.5); ctx.fillStyle = rgba(D.accent, 0.16); ctx.fill();
  txt(chip, tx + nameW + 21, by + 27.5, 11, D.accent, 600, 'left');
  // the line being said, typed out letter by letter
  ctx.font = `500 14.5px ${FU}`;
  const lines = wrapLines(full, bx + bw - 22 - tx);
  let shown = Math.floor(talk.chars);
  lines.forEach((ln, i) => {
    const part = ln.slice(0, Math.max(0, shown));
    shown -= ln.length + 1;
    if(part) txt(part, tx, by + 54 + i * 17, 14.5, '#efeaff', 500, 'left');
  });
  // progress, and what to press next
  const fy = by + bh - 12;
  for(let i = 0; i < D.lines.length; i++){
    ctx.fillStyle = i <= talk.line ? D.accent : 'rgba(255,255,255,0.2)';
    ctx.beginPath(); ctx.arc(tx + 3 + i * 11, fy - 4, 2.8, 0, TAU); ctx.fill();
  }
  if(talk.chars >= full.length){
    const last = talk.line === D.lines.length - 1;
    const keyLabel = TOUCH ? '▲' : 'Espace', label = last ? 'fermer' : 'suite';
    ctx.font = `500 12px ${FU}`;
    const lw = ctx.measureText(label).width;
    ctx.font = `700 11px ${FU}`;
    const kw = Math.max(19, ctx.measureText(keyLabel).width + 13);
    const hx = bx + bw - 16 - lw - 6 - kw, bob = REDUCED ? 0 : Math.sin(frame * 0.15) * 1.2;
    keycap(keyLabel, hx, fy + bob);
    txt(label, hx + kw + 6, fy - 0.5 + bob, 12, '#bfb6f0', 500, 'left');
  }
  ctx.restore();
}

// letterbox bars, the boss's name card, and "Combat !" when it starts
function drawCine(){
  if(!cine){
    if(fightPop > 0 && state === 'play'){
      const t = 60 - fightPop;
      const s = easeOutBack(clamp(t / 12, 0, 1)), a = clamp(fightPop / 15, 0, 1);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(W / 2, 176); ctx.scale(s, s);
      heading('Combat !', 0, 0, 40, '#ffe58a');
      ctx.restore();
    }
    return;
  }
  const c = cine, k = cineBars(), bar = 22 * k;
  ctx.fillStyle = '#07040f';
  ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  const a = clamp((c.t - 40) / 20, 0, 1) * clamp((c.dur - 20 - c.t) / 20, 0, 1);
  if(a > 0 && boss){
    const cy = c.bandY;
    ctx.save();
    ctx.globalAlpha = a;
    const band = ctx.createLinearGradient(0, 0, W, 0);
    band.addColorStop(0, 'rgba(10,6,26,0)'); band.addColorStop(0.2, 'rgba(10,6,26,0.66)'); band.addColorStop(0.8, 'rgba(10,6,26,0.66)'); band.addColorStop(1, 'rgba(10,6,26,0)');
    ctx.fillStyle = band; ctx.fillRect(0, cy - 40, W, 80);
    const rise = easeOutCubic(clamp((c.t - 40) / 26, 0, 1));
    if(c.kind === 'intro'){
      txt(room.label || 'Combat de boss', W / 2, cy - 18, 12.5, '#ff8aa0', 600);
      heading(boss.name, W / 2, cy + 14 + (1 - rise) * 8, 34, '#ffffff');
      txt(BOSS_EPITHET[boss.mode] || '', W / 2, cy + 32, 13, '#e9e2ff', 500);
    } else {
      txt(c.kind === 'phase3' ? 'Phase 3 — dernière phase' : 'Phase 2', W / 2, cy - 18, 12.5, '#ff8aa0', 600);
      heading(c.kind === 'phase3' ? `${boss.name} est hors d’elle !` : `${boss.name} est ${boss.fem ? 'furieuse' : 'furieux'} !`, W / 2, cy + 12 + (1 - rise) * 8, 28, '#ffffff');
      if(c.kind === 'phase3') txt('Elle enchaîne les plongeons : saute-lui dessus ou dash quand elle est coincée !', W / 2, cy + 31, 12, '#ffd27a', 500);
      else if(boss.mode === 'magpie') txt('Armure de babioles : seul un dash peut la toucher !', W / 2, cy + 31, 13, '#ffd27a', 500);
      else if(room.phase2Spikes) txt('Attention : des pics vont sortir du sol', W / 2, cy + 31, 13, '#ffd27a', 500);
    }
    ctx.restore();
  }
  if(c.skippable && !c.skip && c.t > 20 && k > 0.9){
    ctx.save();
    ctx.font = `700 11px ${FU}`;
    const keyLabel = TOUCH ? '▲' : 'Espace';
    const kw = Math.max(19, ctx.measureText(keyLabel).width + 13);
    keycap(keyLabel, W - 70 - kw, H - 6);
    txt('passer', W - 62, H - 6.5, 12, '#bfb6f0', 500, 'left');
    ctx.restore();
  }
}

