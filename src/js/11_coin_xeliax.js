// =====================================================================
//  EASTER EGG: "Le coin de XELIAX" (click XELIAX on the title screen).
//  Feed him, tickle him, poke his eyes: he reacts to everything.
// =====================================================================
const FOODS = [
  {id:'ficelle',   name:'Ficelle',   fill:1,   crumb:'#d9a05a', price:350},
  {id:'pain',      name:'Baguette',  fill:1,   crumb:'#e2b06a'},
  {id:'croissant', name:'Croissant', fill:1,   crumb:'#f0c070', price:150},
  {id:'olive',     name:'Olive',     fill:0.5, crumb:'#6f8f2a', price:80},
  {id:'piment',    name:'Piment',    fill:0.5, crumb:'#e5352f', price:200},
  {id:'brocoli',   name:'Brocoli',   fill:0,   crumb:'#4f9a3a', price:50},
  {id:'eau',       name:'Eau',       fill:0,   crumb:'#7fd0ff'},
  {id:'tel',       name:'Téléphone', fill:0,   crumb:'#e5352f', phone:true},
];
// his answers on the phone, Talking Ben style
const PHONE_ANSWERS = [
  {text:'Oui.', face:'smile', voice:[175, 0.32, 220]},
  {text:'Non.', face:'sad', voice:[165, 0.36, 110]},
  {text:'Hô hô hô !', face:'open', laugh:true},
  {text:'Beurk…', face:'hurt', voice:[120, 0.45, 80]},
];
const PET = {x:320, y:262, s:3.3};
const TRAY = {y:296, w:52, h:56, gap:10};
// the clickable bits of the room
const PET_WIN = {x:452, y:54, w:150, h:106};
const PET_LINES = {
  ficelle:['MA FICELLE AUX OLIVES !', 'Le goût du bonheur…', 'Encore ! Encore !', 'Croustillante dehors, moelleuse dedans !', 'C\'est pour ça que je me bats !', 'Mamie Farine serait fière de toi.', 'Miam ! Les olives sont bien juteuses.', 'Je pourrais en manger cent !'],
  pain:['Miam, du bon pain !', 'Croustillant à souhait.', 'Ça, c\'est une vraie baguette.', 'Rien de tel qu\'une baguette bien cuite.', 'Crac, crac ! Écoute cette croûte.', 'Il manque juste un peu de beurre.', 'Du pain frais, quel bonheur !'],
  croissant:['Un croissant ! Trop bien !', 'Pur beurre, j\'adore.', 'Ça s\'émiette partout, hihi.', 'Feuilleté parfait !', 'Ah, le goût du dimanche matin…', 'J\'ai du beurre plein les tentacules.', 'Un croissant, c\'est une baguette qui fait du yoga.'],
  olive:['Pfft ! Le noyau…', 'Oups, il y avait un noyau.', 'Noyau en vue ! Pfiou !', 'Elle était dénoyautée, tu disais ?', 'Pas mal, mais je les préfère dans la ficelle.', 'La prochaine fois, je vise la fenêtre.'],
  brocoli:['Beurk ! Non merci.', 'Pas de légumes, je suis en vacances.', 'Remballe-moi ça.', 'Un arbre ? Je ne mange pas les arbres.', 'Non, non et non.', 'Les héros ne mangent pas de brocoli.'],
  brocoli2:['Tu insistes ?', 'Toujours non !', 'Même pas en rêve.', 'Tu ne lâches rien, toi…'],
  brocoliYes:['Bon… d\'accord. Une seule bouchée.', 'Pff… si ça te fait plaisir.'],
  brocoliEat:['BEURK ! Plus jamais !', 'C\'est vert… et ça a le goût de vert.', 'Je me sens tout chose…'],
  full:['Je n\'en peux plus…', 'Mon ventre va exploser.', 'Plus une miette, promis.', 'Non merci, je suis plein.', 'Même une ficelle ne rentre plus.', 'Il faut d\'abord que je digère.'],
  fullNow:['Ouf, je suis plein !', 'Plein comme une baguette farcie !', 'Mon ventre est au maximum.'],
  hungry:['J\'ai un petit creux…', 'Tu n\'aurais pas du pain ?', 'Ça sent bon la boulangerie ici.', 'Mon ventre réclame une ficelle.', 'Je mangerais bien un croissant.', 'Il y a des choses sur ce plateau, non ?', 'J\'ai faim ! J\'ai faim ! J\'ai faim !'],
  happy:['La ficelle aux olives, c\'est la vie.', 'On est bien, là.', 'Tu me chatouilles ?', 'Il fait bon dans la boulangerie.', 'J\'adore l\'odeur du pain chaud.', 'Un jour, j\'ouvrirai ma propre boulangerie.', 'Je suis content que tu sois là.'],
  tips:['Psst… tu peux éteindre ma lampe, si tu veux.', 'Tu as vu la fenêtre ? Clique dessus.', 'Les baguettes de l\'étagère sont décoratives. Enfin… normalement.', 'Le téléphone, c\'est pour me poser des questions !', 'Tu savais que je suis chatouilleux du ventre ?'],
  stuffed:['Je crois que j\'ai trop mangé…', 'Une petite sieste, peut-être.', 'Je suis rond comme un pain de campagne.', 'Plus jamais je ne mange autant… jusqu\'à demain.', 'Je ne peux plus bouger.'],
  tickle:['Hihihi ! Ça chatouille !', 'Arrête, hihi !', 'Pas le ventre !', 'Hihi ! Pas là !', 'Ha ha ! Je suis très chatouilleux !', 'Hi hi hi hi !', 'Gnihihi !'],
  tickleMax:['HA HA HA ! Pitié !', 'J\'en peux plus, HA HA HA !', 'Stop ! Je vais rouler par terre !'],
  eye:['Aïe, mon œil !', 'Hé ! Ça va pas ?', 'Je ne vois plus rien…', 'Ouille ! C\'est fragile, ça.', 'Mes yeux ne sont pas des boutons !', 'Je vois des étoiles…'],
  eye2:['Encore l\'œil ?!', 'Pas encore mon œil !', 'Tu le fais exprès ?'],
  pat:['Hé hé…', 'Encore des caresses ?', 'Trop gentil.', 'Mmmh, j\'aime bien.', 'Tu me décoiffes !', 'Hi hi, merci.', 'Là, juste là…'],
  patMany:['Je pourrais rester comme ça toute la journée…', 'Ronron… euh, je veux dire : merci.', 'Tu es la personne la plus gentille du monde.'],
  limb:['Hé, mes tentacules !', 'Ça gigote tout seul !', 'Attention, c\'est mon bras préféré.', 'Ça va faire des nœuds !', 'Tentacules en folie !', 'Laisse mes pattes tranquilles !'],
  boop:['Boop !', 'C\'était mon nez, ça ?', 'Bip !', 'Je n\'ai pas de nez, tu sais.', 'Boop boop !', 'Pouet !'],
  annoyed:['Arrête de me toucher !', 'Bon, ça suffit maintenant.', 'Laisse-moi tranquille !', 'Tu es pénible, là.'],
  sulk:['Hmpf.', 'Je boude.', '…', 'Hmpf !', 'Je ne te parle plus.'],
  forgive:['Bon… je te pardonne.', 'C\'est bon, je ne boude plus.', 'Allez, on fait la paix ?'],
  water:['Glou glou… rafraîchissant !', 'Ah, ça désaltère.', 'De l\'eau bien fraîche, parfait.', 'Glouglouglou… ahhh !'],
  waterSpicy:['Ahhh… merci, ça va mieux.', 'Ouf ! Tu m\'as sauvé la vie.', 'Pschhh… le feu est éteint.'],
  spicy:['ÇA PIQUE !!!', 'AÏE AÏE AÏE !', 'C\'EST DU FEU !!!', 'MA LANGUE !!!'],
  spicy2:['DOUBLE PIQUANT !!!', 'JE SUIS UN DRAGON !!!', 'C\'EST UN VOLCAN !!!'],
  spicyBeg:['De l\'eau ! Vite !', 'De l\'eau, s\'il te plaît !', 'Au secours, ma langue brûle !'],
  burp:['BUUURP !', 'BUUURRRP !', 'BURP !'],
  burpSorry:['Oups… pardon.', 'Ce n\'était pas moi.', 'Excuse-moi !', 'Pardon, la baguette voulait ressortir.'],
  fast:['Doucement, je n\'ai qu\'une bouche !', 'Tu me fais manger trop vite !', 'Pas si vite, je vais avoir le hoquet…'],
  bye:['À plus tard !', 'Reviens vite !', 'Bonne aventure !', 'N\'oublie pas mes ficelles !', 'Salut, et merci pour le repas !', 'Bisous !'],
  byeSleep:['Zzz… à plus… tard…', 'Mmh… bonne nuit…'],
  sleepy:['Ouaaah… je bâille…', 'Je ferme les yeux juste une seconde…', 'Petite sieste…', 'Je suis un peu fatigué…'],
  wake:['Hein ?! Je ne dormais pas !', 'Quoi ? Qui ? Où ?', 'Je rêvais de ficelles géantes…', 'Cinq minutes de plus…', 'Ah ! Tu m\'as fait peur.', 'Je réfléchissais… les yeux fermés.'],
  wakeSelf:['Ah, quelle bonne sieste !', 'J\'ai rêvé que j\'étais une baguette.', 'Ouaaah… j\'ai dormi longtemps ?', 'Me revoilà, en pleine forme !'],
  lonely:['Tu es toujours là ?', 'Youhou ?', 'Je m\'ennuie un peu…', 'On joue ?', 'Hé ho ! Il y a quelqu\'un ?'],
  muse:['Et si les olives rêvaient de nous ?', 'Pourquoi dit-on « une » baguette mais « un » pain ?', 'Une ficelle, c\'est une baguette au régime ?', 'Si je mange une ficelle, je deviens plus long ?', 'Le pain, c\'est de la farine qui a réussi.', 'Celui qui a inventé le croissant mérite une médaille.', 'Est-ce que les brocolis ont des amis ?', 'Combien de baguettes pour aller jusqu\'à la Lune ?'],
  growl:['Mon ventre gargouille…', 'Tu as entendu ? C\'est mon ventre.', 'Grrr… pardon, c\'est mon estomac.', 'Mon ventre fait la conversation tout seul.'],
  sneeze:['À mes souhaits ! Ah… c\'est moi.', 'Fichue farine !', 'Pardon, c\'est la farine.', 'Il y a trop de farine ici !'],
  hicStart:['Hic ! Oh non, le hoquet…', 'Hic ! Pas encore…'],
  hicEnd:['Ouf, c\'est passé.', 'Fini, le hoquet !', 'Ça y est, plus de hoquet.'],
  hicCure:['Glou… hic… glou… Ça y est, c\'est passé !', 'L\'eau, ça marche à tous les coups !'],
  hicScare:['Ah ! Tu m\'as fait peur… Tiens, plus de hoquet !', 'Waaah ! … Oh, le hoquet est parti !'],
  fly:['Une mouche !', 'Bzzz… Qui fait ce bruit ?', 'Va-t\'en, la mouche !', 'Elle me tourne autour…'],
  flyCatch:['Je vais l\'attraper !', 'Attends un peu, toi…'],
  flyEat:['Hop ! Croustillant…', 'Gloups. Ça a un goût de mouche.', 'Protéines !', 'Miam… non, en fait, beurk.'],
  flyMiss:['Raté !', 'Elle est trop rapide !', 'Reviens, froussarde !'],
  juggle:['Regarde ! Je jongle !', 'Attention, numéro de cirque !', 'Trois olives, quatre tentacules. Facile !'],
  juggleOk:['Ta-da !', 'Applaudissements, s\'il vous plaît !', 'Et je ne les ai même pas mangées !'],
  juggleFail:['Aïe ! Sur la tête…', 'Bon, il me faut encore de l\'entraînement.', 'Ça arrive aux meilleurs.'],
  juggleStop:['Oh ! Tu m\'as fait tout lâcher.', 'Oups, mes olives !'],
  bird:['Oh, un petit oiseau !', 'Salut, l\'oiseau !', 'Il vient chercher des miettes.', 'Cui cui ! Ça veut dire « bonjour ».'],
  birdGone:['Il est parti…', 'Au revoir, petit oiseau !', 'Tu lui as fait peur !'],
  birdLeave:['Bon vol, l\'oiseau !', 'À demain, petit oiseau.'],
  song:['La la la, la ficelle aux olives…', 'Pom pom pom… je suis boulanger…', 'Tralala, la pâte lève…', 'Ding ding dong, le pain est bon…'],
  stretch:['Hmmmf… petit étirement.', 'Ahh, ça fait du bien.', 'Un, deux… étirement !'],
  lampOff:['Hé ! Qui a éteint ?', 'J\'ai un peu peur du noir…', 'Je ne vois plus mes ficelles !', 'Allume, s\'il te plaît !'],
  lampOn:['Ah, la lumière !', 'Merci, c\'est mieux.', 'Ouf ! Il faisait tout noir.'],
  lampWake:['Ah ! La lumière… J\'étais bien, moi.', 'Aïe, ça éblouit !'],
  lampSleep:['Bon… puisqu\'il fait noir, dodo.', 'Il fait noir… c\'est l\'heure de la sieste.'],
  windowDay:['Il fait beau dehors !', 'Les plaines m\'attendent.', 'Tu vois ce nuage ? On dirait une baguette.', 'Un jour, je repartirai à l\'aventure.'],
  windowNight:['Regarde toutes ces étoiles…', 'La lune ressemble à un croissant !', 'Il fait nuit, les olives dorment.', 'La nuit, la boulangerie est toute calme.'],
  shelf:['Pas touche, c\'est pour la vitrine !', 'Ces baguettes sont décoratives.', 'Celle-là, c\'est Mamie Farine qui l\'a faite.', 'Attention, l\'étagère est fragile !'],
  shelfDrop:['Oups ! Bon… elle est à moi maintenant.', 'Elle est tombée toute seule, hein ?'],
  shelfFull:['Même tombée, je n\'ai plus de place.'],
  shelfEmpty:['Il n\'y a plus rien à faire tomber.', 'Je crois qu\'on a fait assez de bêtises.'],
  call:['Le téléphone sonne !', 'Tiens, un appel !', 'Tu décroches pour moi ?'],
  callMissed:['Tant pis, ils rappelleront.', 'Trop tard ! C\'était sûrement Mamie Farine.', 'Bon, ils laisseront un message.'],
  callBusy:['Chut ! Je suis au téléphone.', 'Attends, je parle à quelqu\'un.'],
  callFirst:['Le téléphone d\'abord !', 'Décroche, ça sonne !'],
  callHang:['Oups, je dois te laisser. Salut !', 'Je te rappelle ! Salut !'],
  phoneFood:['Oh, à manger ! Je raccroche.', 'Attends, on m\'apporte à manger. Salut !'],
};
// three times the same thing in a row
const PET_AGAIN = {
  ficelle:['Encore une ficelle ? Tu me gâtes !', 'Ficelle, ficelle, ficelle… le paradis.'],
  pain:['Toujours du pain… je vais finir en baguette.', 'Trois baguettes ! J\'ai la croûte qui pousse.'],
  croissant:['Trois croissants ! Je brille de beurre.', 'Je deviens un croissant, je le sens.'],
  olive:['Olive, olive, olive… je deviens tout vert.', 'J\'ai une collection de noyaux, maintenant.'],
  eau:['Encore de l\'eau ? Je fais glouglou quand je bouge !', 'Je suis un aquarium, maintenant.'],
};
// what he thinks of the menu ("previous>current")
const PET_COMBO = {
  'pain>eau':'Du pain et de l\'eau… comme en prison !',
  'eau>pain':'De l\'eau et du pain… comme en prison !',
  'ficelle>olive':'Des olives en plus des olives ? J\'adore.',
  'olive>ficelle':'L\'apéritif, puis le plat principal !',
  'pain>croissant':'Après le pain, la viennoiserie. Menu complet !',
  'croissant>pain':'Le croissant en entrée ? Original.',
  'croissant>eau':'Un croissant et un verre d\'eau : petit-déjeuner de champion.',
  'olive>eau':'L\'apéro à l\'eau, c\'est très sage.',
  'ficelle>croissant':'Salé puis sucré, j\'aime les contrastes.',
};
// incoming calls: '…' is the other person talking
const PET_CALLS = [
  {id:'farine', voice:520, lines:['Allô ? Ah, Mamie Farine !', '…', 'Oui, je mange bien. Surtout des ficelles.', '…', 'Non, pas de brocoli…', '…', 'Gros bisous, Mamie !']},
  {id:'gaston', voice:260, lines:['Allô ? Salut Gaston !', '…', 'Tu t\'es encore perdu dans ta grotte ?', '…', 'Suis les cristaux, ils brillent !', '…', 'De rien. Salut !']},
  {id:'olivia', voice:780, lines:['Allô ? Coucou Olivia !', '…', 'Non, je n\'ai mangé aucune de tes cousines…', '…', 'Bon, peut-être une ou deux.', '…', 'Allô ? Elle a raccroché.']},
  {id:'levain', voice:200, lines:['Allô ? Oui, Maître Levain ?', '…', 'Le four à 250 °C, promis.', '…', 'Trois entailles en biais, je sais !', '…', 'À vos ordres, chef !']},
  {id:'pizza', voice:340, lines:['Allô ?', '…', 'Non, ici ce n\'est pas la pizzeria.', '…', 'Une baguette, à la limite.', '…', 'Il a raccroché…']},
  {id:'pub', voice:430, lines:['Allô ?', '…', 'Une assurance pour tentacules ?', '…', 'Non merci, mes tentacules vont très bien !']},
  {id:'nobody', voice:0, lines:['Allô ?', '…', 'Allô ? Il y a quelqu\'un ?', '…', 'Bizarre, j\'entends juste quelqu\'un mâcher.']},
  {id:'pourpre', voice:120, needs:'end', lines:['Allô ?', '…', 'LE SEIGNEUR POURPRE ?!', '…', 'Non, tu ne récupéreras pas la ficelle !', '…', 'Il a raccroché. Ouf.']},
];
// rare answers on the phone
const PHONE_RARE = [
  {text:'Peut-être…', face:'smile', voice:[150, 0.5, 190]},
  {text:'Demande à Mamie Farine.', face:'smile', voice:[210, 0.45, 250]},
];
const pick = list => list[Math.floor(Math.random() * list.length)];
// French spacing: no line break before ! ? ; : »
const frTypo = s => s.replace(/ ([!?;:»])/g, ' $1').replace(/« /g, '« ');
const pet = {
  hero:makeCharAnim(), sel:0, full:0, fullT:0, spicy:0, hot2:false, flight:null, eating:null, after:[],
  bubble:null, parts:[], taps:[], hy:0, hvy:0, dance:0, turn:0, crossT:0, idleT:0, hint:1, shake:0,
  look:null, lookAt:null, phone:null, lastAns:-1,
  ev:null, nextEv:420, quiet:0, lastEv:'', lastCall:'', lastLine:{}, hist:[], eats:[], broc:0,
  tickN:0, patN:0, lastTouch:'', lastTouchF:-999, lidT:0, lean:0,
  dark:false, darkT:0, darkK:0, lampSw:0, shelfN:0, shelfGone:0, shelfWob:0, green:0, leaving:0,
};
// a line from a pool, never the same one twice in a row
function line(key){
  const L = PET_LINES[key];
  if(L.length < 2) return L[0];
  let s;
  do s = pick(L); while(s === pet.lastLine[key]);
  pet.lastLine[key] = s;
  return s;
}
function petNight(){ const hr = new Date().getHours(); return hr >= 20 || hr < 7; }

// what he says when you come in: depends on the time, your visits and your progress
function petGreeting(){
  const P = save.pet = Object.assign({visits:0, last:0, meals:0}, save.pet || {});
  const now = Date.now(), away = P.last ? now - P.last : 0, hr = new Date().getHours();
  P.visits++; P.last = now; persist();
  const n = P.visits;
  if(n === 1) return ['Coucou ! Bienvenue dans mon petit coin de boulangerie.', 'Tu peux me nourrir, me chatouiller… ou même m\'appeler !'];
  if([5, 10, 25, 50, 100].includes(n)) return [`C'est ta ${n}e visite ! Tu m'aimes bien, hein ?`, 'Moi aussi, je t\'aime bien.'];
  if(pet.full >= 5) return [line('stuffed')];
  if(away > 0 && away < 90e3) return [pick(['Déjà de retour ?', 'Tu as oublié quelque chose ?', 'Rebonjour !', 'Re-coucou !'])];
  if(away > 3 * 864e5) return ['Ça faisait longtemps ! Tu m\'as manqué.', 'J\'ai un de ces creux…'];
  const pool = [];
  if(hr < 5) pool.push('Il est tard… Tu ne dors pas, toi non plus ?', 'Chut… tout le monde dort à la boulangerie.');
  else if(hr < 11) pool.push('Bonjour ! Le pain sort tout juste du four.', 'Bonjour ! Tu as pris ton petit-déjeuner ?');
  else if(hr < 14) pool.push('C\'est l\'heure du déjeuner ! J\'ai faim.', 'Midi ! On mange quoi ?');
  else if(hr < 18) pool.push('C\'est l\'heure du goûter, non ?', 'Un petit croissant pour le goûter ?');
  else if(hr < 22) pool.push('Bonsoir ! Une petite faim avant le dîner ?', 'Bonsoir ! La boulangerie va bientôt fermer.');
  else pool.push('Bonsoir… Un dernier en-cas avant de dormir ?', 'Il se fait tard, hein ?');
  if(save.goldFicelle) pool.push('Tu as vu ma ficelle dorée ? Je ne la mangerai jamais… enfin, peut-être.');
  if(save.crystalFicelle) pool.push('Ma ficelle de cristal brille même dans le noir. Pratique pour les goûters de minuit !');
  else if(save.bestCh[3] != null) pool.push('Grâce à toi, j\'ai retrouvé la ficelle aux olives !', 'Le Seigneur Pourpre ? Plus de nouvelles depuis !');
  else pool.push('On repart bientôt chercher la ficelle aux olives ?');
  const learned = save.recipe.filter(Boolean).length;
  if(learned === 4) pool.push('Je connais toute la recette de la ficelle par cœur !');
  else if(learned > 0) pool.push(`Je connais déjà ${learned} étape${learned > 1 ? 's' : ''} de la recette sur 4.`);
  pool.push('Coucou ! Tu as quelque chose à manger ?', 'Te revoilà !', 'Ah, c\'est toi ! Super.');
  const first = pick(pool);
  if(/manger|faim|goûter|en-cas|mange/.test(first)) return [first];
  return [first, pick(['Tu as quelque chose à manger ?', 'Tu m\'as apporté un truc à grignoter ?', 'On mange quoi ?'])];
}

function openPet(){
  setState('pet');
  pet.flight = null; pet.eating = null; pet.after = []; pet.parts = []; pet.taps = []; pet.phone = null; pet.ev = null;
  pet.hy = 0; pet.hvy = 0; pet.dance = 0; pet.turn = 0; pet.crossT = 0; pet.idleT = 0; pet.hint = 1; pet.spicy = 0;
  pet.quiet = 0; pet.nextEv = 420 + Math.random() * 240; pet.leaving = 0; pet.lookAt = null; pet.lean = 0;
  pet.dark = false; pet.darkT = 0; pet.darkK = 0; pet.green = 0; pet.lidT = 0; pet.tickN = 0; pet.patN = 0;
  pet.hero.appear = 0; pet.hero.lid = 0;
  const [first, ...more] = petGreeting();
  petSay(first, 150);
  let t = 150;
  for(const ln of more){
    pet.after.push({t, greet:true, run(){ if(!pet.ev && !pet.flight && !pet.eating && !pet.phone) petSay(ln, 130); }});
    t += 130;
  }
  SFX.bloop();
}
function closePet(){
  if(fadeDir !== 0 || pet.leaving) return;
  const asleep = pet.ev && pet.ev.type === 'sleep';
  if(pet.phone){ pet.phone = null; if(pet.ev && pet.ev.type === 'call') pet.ev = null; }
  pet.flight = null; pet.after = [];
  petSay(asleep ? line('byeSleep') : line('bye'), 200);
  if(!asleep) setFace(pet.hero, 'smile', 60);
  pet.leaving = 30;
}

function petSay(text, t=110){ pet.bubble = {text:frTypo(text), t, max:t}; pet.idleT = 0; }
function petMouth(){ return {x:PET.x + 2 * PET.s * pet.hero.fx, y:PET.y + pet.hy + (HB.cy + 3.5) * PET.s}; }
function trayX(i){ const total = FOODS.length * TRAY.w + (FOODS.length - 1) * TRAY.gap; return (W - total) / 2 + i * (TRAY.w + TRAY.gap); }
function petBusy(){ return !!(pet.flight || pet.eating || (pet.phone && pet.phone.stage !== 'listen')); }
function onPhone(){ const ph = pet.phone; return !!ph && (ph.stage === 'ring' ? ph.t >= 24 : ph.stage !== 'incoming'); }
function petHop(v){ if(pet.hy >= 0){ pet.hvy = -v; } }
function petPart(o){ const p = Object.assign({x:0, y:0, vx:0, vy:0, g:0.15, life:40, max:40, rot:0, vr:0, s:1}, o); pet.parts.push(p); return p; }
function onCall(){ return !!pet.phone && pet.phone.stage === 'call'; }

function petSelect(d){ pet.sel = (pet.sel + d + FOODS.length) % FOODS.length; SFX.menu(); }

// any real interaction: wakes him up, stops small idle shows, resets his boredom
const PET_SHORT = ['song', 'muse', 'stretch', 'lonely', 'growl', 'chat'];
function petInteract(){
  pet.hint = 0; pet.quiet = 0; pet.nextEv = 360 + Math.random() * 300;
  pet.after = pet.after.filter(a => !a.greet);
  const ev = pet.ev;
  if(!ev) return false;
  if(ev.type === 'sleep'){ petWake(); return true; }
  if(ev.type === 'juggle'){ juggleDrop(false); return true; }
  if(PET_SHORT.includes(ev.type)) pet.ev = null;
  return false;
}
function petWake(text){
  const h = pet.hero;
  pet.ev = null; pet.darkT = 0;
  setFace(h, 'o', 40); petHop(6); h.wobV += 1.2;
  for(const e of h.eyes){ e.vx += (Math.random() - 0.5) * 1.2; e.vy -= 0.8; }
  petSay(text || line('wake'), 110);
  tone(300, 0.12, 'triangle', 0.05, 900);
}

// food has to be bought with the coins from the levels (the baguette, the water and the phone are free)
const foodOpen = f => SET.creator || !f.price || !!(save.food || {})[f.id];
function buyFood(f){
  if(save.bank < f.price){ petSay('Il faut ' + f.price + ' pièces pour ça… tu en as ' + save.bank + '.', 120); SFX.hurt(); return; }
  save.bank -= f.price; save.food = save.food || {}; save.food[f.id] = true; persist();
  petSay(f.name + ' achetée ! Miam, j\'ai hâte !', 120); SFX.key();
}
function petGive(i){
  if(pet.leaving) return;
  pet.sel = i;
  const f = FOODS[i];
  if(!foodOpen(f)){ buyFood(f); return; }
  if(petInteract()) return;
  if(f.phone){ petPhone(); return; }
  if(pet.phone && pet.phone.stage === 'incoming'){ petSay(line('callFirst'), 60); return; }
  if(onCall()){ petSay(line('callBusy'), 60); return; }
  if(petBusy()) return;
  if(pet.phone){ pet.phone = null; petSay(line('phoneFood'), 70); tone(900, 0.05, 'square', 0.03); }
  const m = petMouth();
  let refuse = f.fill > 0 && pet.full >= 5;
  if(f.id === 'brocoli'){
    if(pet.broc >= 2){ pet.broc = 0; petSay(line('brocoliYes'), 70); }   // third time: fine, one bite
    else { refuse = true; pet.broc++; }
  }
  pet.flight = {f, t:0, x0:trayX(i) + TRAY.w / 2, y0:TRAY.y + 20, x1:m.x, y1:m.y, refuse};
  SFX.menu();
}

// the phone: press it and he picks up, then every press is a question he answers.
// Sometimes it rings by itself: press it to let him answer.
function petPhone(){
  const ph = pet.phone;
  if(!ph){
    if(pet.flight || pet.eating) return;
    pet.phone = {stage:'ring', t:0, ans:null};
    return;
  }
  if(ph.stage === 'incoming'){ ph.stage = 'call'; ph.t = 0; ph.next = 999; return; }
  if(ph.stage === 'call'){
    pet.phone = null; if(pet.ev && pet.ev.type === 'call') pet.ev = null;
    petSay(line('callHang'), 90); tone(900, 0.05, 'square', 0.03);
    return;
  }
  if(ph.stage !== 'listen') return;
  let A;
  if(Math.random() < 0.1) A = pick(PHONE_RARE);
  else {
    let k = Math.floor(Math.random() * PHONE_ANSWERS.length);
    if(k === pet.lastAns) k = (k + 1 + Math.floor(Math.random() * (PHONE_ANSWERS.length - 1))) % PHONE_ANSWERS.length;
    pet.lastAns = k; A = PHONE_ANSWERS[k];
  }
  ph.stage = 'think'; ph.t = 0; ph.ans = A;
  petSay('Hmmm…', 40);
  tone(140, 0.3, 'triangle', 0.04, 150);
}
function pickCall(){
  const pool = PET_CALLS.filter(c => (!c.needs || save.bestCh[3] != null) && c.id !== pet.lastCall);
  const c = pick(pool);
  pet.lastCall = c.id;
  return c;
}
function updatePhone(){
  const ph = pet.phone, h = pet.hero;
  if(!ph) return;
  ph.t++;
  if(ph.stage === 'ring'){
    if(ph.t === 1 || ph.t === 13) [1320, 1480].forEach((q, k) => tone(q, 0.05, 'square', 0.025, null, k * 0.05));
    if(ph.t === 24){ setFace(h, 'o', 20); h.wobV += 0.4; tone(220, 0.1, 'triangle', 0.05, 300); }
    if(ph.t === 34){ ph.stage = 'listen'; ph.t = 0; petSay('Allô ? Pose-moi une question.', 130); }
  } else if(ph.stage === 'incoming'){
    const r = ph.t % 45;
    if(r === 1 || r === 13) [1320, 1480].forEach((q, k) => tone(q, 0.06, 'square', 0.03, null, k * 0.05));
    if(ph.t > 330){
      pet.phone = null; if(pet.ev && pet.ev.type === 'call') pet.ev = null;
      petSay(line('callMissed'), 110); setFace(h, 'sad', 60);
    }
  } else if(ph.stage === 'call'){
    if(ph.t === 1){ setFace(h, 'o', 20); h.wobV += 0.4; tone(220, 0.1, 'triangle', 0.05, 300); ph.next = 22; ph.i = 0; }
    if(--ph.next <= 0){
      const L = ph.call.lines[ph.i++];
      if(L === undefined){
        pet.phone = null; if(pet.ev && pet.ev.type === 'call') pet.ev = null;
        tone(900, 0.05, 'square', 0.03); tone(700, 0.05, 'square', 0.03, null, 0.08);
        return;
      }
      if(L === '…'){
        ph.next = 75; petSay('…', 70);
        const v = ph.call.voice;
        for(let k = 0; k < 5; k++){
          if(v) tone(v * (0.85 + Math.random() * 0.35), 0.06, 'square', 0.016, null, 0.1 + k * 0.11);
          else tone(150 + Math.random() * 80, 0.05, 'square', 0.02, null, 0.1 + k * 0.14);   // chewing noises…
        }
      } else {
        ph.next = 64 + L.length * 2.2;
        petSay(L, ph.next - 4);
        setFace(h, /!/.test(L) ? 'open' : 'smile', 30); h.wobV += 0.3;
        tone(h.curFace === 'open' ? 240 : 190, 0.18, 'sawtooth', 0.03, 230);
      }
    }
    if(ph.call.lines[ph.i - 1] === '…' && ph.t % 24 === 0) h.wobV += 0.25;   // nodding along
  } else if(ph.stage === 'listen'){
    if(ph.t > 720){ pet.phone = null; petSay('Bon… je raccroche.', 90); tone(900, 0.05, 'square', 0.03); }
  } else if(ph.stage === 'think'){
    if(ph.t >= 40){
      const A = ph.ans;
      ph.stage = 'answer'; ph.t = 0;
      petSay(A.text, 80); setFace(h, A.face, 75);
      if(A.laugh){
        [196, 175, 147].forEach((q, k) => tone(q, 0.17, 'sawtooth', 0.045, q * 0.92, k * 0.19));
        h.wobV += 0.9; petHop(4);
      } else {
        tone(A.voice[0], A.voice[1], 'sawtooth', 0.045, A.voice[2]);
        if(A.face === 'hurt'){ h.wobV -= 0.6; pet.shake = 10; }
        else h.wobV += 0.35;
      }
    }
  } else if(ph.stage === 'answer'){
    if(ph.t >= 80){ ph.stage = 'listen'; ph.t = 0; }
  }
}

function petTouch(part){
  if(pet.leaving) return;
  const h = pet.hero;
  const hic = pet.ev && pet.ev.type === 'hiccup';
  if(petInteract()) return;
  if(onCall()){ petSay(line('callBusy'), 60); h.wobV += 0.4; return; }
  if(pet.crossT > 0){ if(!pet.bubble || pet.bubble.max - pet.bubble.t > 40) petSay(line('sulk'), 50); return; }
  pet.taps.push(frame);
  pet.taps = pet.taps.filter(t => frame - t < 150);
  if(pet.taps.length >= 7){
    pet.taps = []; pet.tickN = 0; pet.patN = 0;
    pet.crossT = 110; setFace(h, 'hurt', 70);
    petSay(line('annoyed'), 100);
    tone(200, 0.2, 'sawtooth', 0.04, 120);
    return;
  }
  // a fright cures the hiccups
  if(hic && (part === 'eye' || part === 'boop')){
    pet.ev = null; setFace(h, 'o', 40); petHop(6); h.wobV += 1.2;
    petSay(line('hicScare'), 120);
    tone(1200, 0.08, 'square', 0.04, 500);
    return;
  }
  const again = pet.lastTouch === part && frame - pet.lastTouchF < 150;
  pet.lastTouch = part; pet.lastTouchF = frame;
  if(part === 'eye'){
    for(const e of h.eyes){ e.vx += (Math.random() - 0.5) * 1.6; e.vy += (Math.random() - 0.5) * 1.6; }
    h.blinkP = 0.001; setFace(h, 'hurt', 45); h.wobV += 0.5;
    petSay(again ? line('eye2') : line('eye'), 90);
    tone(760, 0.07, 'square', 0.035, 1400);
  } else if(part === 'belly'){
    pet.tickN = again ? pet.tickN + 1 : 1;
    if(pet.tickN >= 4){
      // a real laughing fit: he rolls over
      pet.tickN = 0;
      h.spin = 0.001; petHop(7); h.wobV += 2; setFace(h, 'open', 90); pet.dance = 70;
      petSay(line('tickleMax'), 110);
      [880, 1040, 1180, 1320, 1180, 1480, 1320, 1760].forEach((f, k) => tone(f, 0.07, 'triangle', 0.045, null, k * 0.06));
      for(let k = 0; k < 6; k++) petPart({type:'note', x:PET.x + (Math.random() - 0.5) * 90, y:PET.y - 90 - Math.random() * 30, vx:(Math.random() - 0.5) * 1.6, vy:-1.3, g:0, life:55, max:55});
    } else {
      h.wobV += 1.3; setFace(h, 'open', 50); petHop(3);
      petSay(line('tickle'), 90);
      [880, 1040, 1180, 1040, 1320].forEach((f, k) => tone(f, 0.07, 'triangle', 0.04, null, k * 0.07));
      for(let k = 0; k < 3; k++) petPart({type:'note', x:PET.x + (Math.random() - 0.5) * 60, y:PET.y - 90, vx:(Math.random() - 0.5) * 1.2, vy:-1.2, g:0, life:50, max:50});
    }
  } else if(part === 'pat'){
    pet.patN = again ? pet.patN + 1 : 1;
    const many = pet.patN >= 5;
    if(many) pet.patN = 0;
    h.blinkP = 0.001; setFace(h, 'smile', 60); h.wobV -= 0.4;
    if(many){ pet.lidT = 100; tone(90, 0.9, 'sine', 0.05, 75); }
    petSay(many ? line('patMany') : line('pat'), many ? 130 : 90);
    [660, 880].forEach((f, k) => tone(f, 0.12, 'sine', 0.04, null, k * 0.1));
    for(let k = 0; k < (many ? 9 : 3); k++) petPart({type:'heart', x:PET.x + (Math.random() - 0.5) * (many ? 90 : 50), y:PET.y - 110 - Math.random() * (many ? 30 : 0), vx:(Math.random() - 0.5) * 0.8, vy:-1, g:-0.01, life:60, max:60, s:0.8 + (many ? Math.random() * 0.5 : 0)});
  } else if(part === 'limb'){
    for(const l of [...h.arms, ...h.legs]){ l.amp += 0.9; l.ph += 2; }
    h.wobV += 0.5;
    petSay(line('limb'), 80);
    tone(500, 0.12, 'triangle', 0.04, 900);
  } else {
    h.wobV += 0.7; setFace(h, 'o', 24);
    petSay(line('boop'), 70);
    tone(980, 0.06, 'sine', 0.05, 620);
  }
}

// the lamp, the window and the bread shelf can be clicked too
function petLamp(){
  const h = pet.hero;
  pet.dark = !pet.dark; pet.darkT = 0; pet.lampSw = 1;
  tone(pet.dark ? 520 : 900, 0.04, 'square', 0.035); tone(pet.dark ? 380 : 1200, 0.04, 'square', 0.03, null, 0.05);
  pet.hint = 0; pet.quiet = 0; pet.after = pet.after.filter(a => !a.greet);
  if(pet.ev && pet.ev.type === 'sleep'){ if(!pet.dark) petWake(line('lampWake')); return; }
  if(pet.ev && PET_SHORT.includes(pet.ev.type)) pet.ev = null;
  if(onCall() || (pet.phone && pet.phone.stage === 'incoming')) return;
  if(pet.dark){
    setFace(h, 'o', 50); h.wobV += 0.6;
    for(const e of h.eyes){ e.vx += (Math.random() - 0.5) * 1.4; e.vy += (Math.random() - 0.5) * 1.4; }
    petSay(line('lampOff'), 100);
  } else { setFace(h, 'smile', 40); petSay(line('lampOn'), 90); }
}
function petWindow(){
  if(petInteract()) return;
  if(onCall() || (pet.phone && pet.phone.stage === 'incoming')) return;
  pet.turn = 0; pet.lookAt = {x:PET_WIN.x + 75, y:PET_WIN.y + 50, t:100};
  setFace(pet.hero, 'smile', 40);
  petSay(petNight() ? line('windowNight') : line('windowDay'), 110);
  tone(700, 0.08, 'sine', 0.03, 900);
}
function petShelf(){
  if(petInteract()) return;
  if(onCall() || (pet.phone && pet.phone.stage === 'incoming')) return;
  const h = pet.hero;
  pet.turn = 80; pet.lookAt = {x:120, y:120, t:90}; pet.shelfWob = 1;
  tone(260, 0.06, 'triangle', 0.04, 200);
  if(pet.shelfGone > 0){ petSay(line('shelfEmpty'), 90); return; }
  if(++pet.shelfN < 3 || pet.flight || pet.eating){ petSay(line('shelf'), 90); return; }
  // third time: the baguette falls off the shelf… and he eats it
  pet.shelfN = 0; pet.shelfGone = 1800;
  const bp = petPart({type:'food', id:'pain', x:84, y:120, vx:1.7, vy:-1.5, g:0.3, life:200, max:200, rot:-0.08, vr:0.08, bounce:true});
  tone(200, 0.15, 'triangle', 0.05, 90, 0.5);
  setFace(h, 'o', 50); h.wobV += 0.5;
  petSay('Oh non !', 60);
  const grab = {t:75, run(){
    if(pet.leaving) return;
    if(pet.flight || pet.eating || onCall()){ grab.t = 30; pet.after.push(grab); return; }
    if(pet.full >= 5){ petSay(line('shelfFull'), 100); bp.life = 40; return; }
    bp.life = 0;
    const m = petMouth();
    pet.flight = {f:FOODS[1], t:0, x0:bp.x, y0:bp.y, x1:m.x, y1:m.y, refuse:false};
    petSay(line('shelfDrop'), 110);
  }};
  pet.after.push(grab);
}

// where the pointer landed
function petPointer(x, y){
  if(pet.leaving) return;
  const bk = pet.back || {x:W - 136, w:120};
  if(x >= bk.x - 4 && x <= bk.x + bk.w + 4 && y >= 8 && y <= 44){ closePet(); return; }
  for(let i = 0; i < FOODS.length; i++){
    const tx = trayX(i);
    if(x >= tx && x <= tx + TRAY.w && y >= TRAY.y && y <= TRAY.y + TRAY.h){ petGive(i); return; }
  }
  const ev = pet.ev;
  if(ev && ev.type === 'fly' && (ev.stage === 'buzz' || ev.stage === 'catch') && Math.hypot(x - ev.x, y - ev.y) < 24){ flySnap(); return; }
  if(ev && ev.type === 'bird' && ev.stage !== 'out' && Math.hypot(x - ev.x, y - (ev.y - 8)) < 24){ birdShoo(); return; }
  const lx = (x - PET.x) / PET.s * (pet.hero.fx >= 0 ? 1 : -1), ly = (y - PET.y - pet.hy) / PET.s;
  const inE = (cx, cy, rx, ry) => ((lx - cx) / rx) ** 2 + ((ly - cy) / ry) ** 2 <= 1.3;
  let part = null;
  if(inE(-3.6, -24.3, 4.2, 5.9) || inE(4, -24.9, 4.1, 6.3)) part = 'eye';
  else if(ly < -26 && ly > -36 && Math.abs(lx) < 15) part = 'pat';
  else if(Math.abs(lx) <= 15 && ly >= -26 && ly < -17.5) part = 'boop';
  else if(Math.abs(lx) <= 15 && ly >= -17.5 && ly < -11) part = 'belly';
  else if(Math.abs(lx) < 30 && ly >= -30 && ly <= 1) part = 'limb';
  if(part){ petTouch(part); return; }
  if(Math.abs(x - 300) < 24 && y < 58){ petLamp(); return; }
  if(x >= PET_WIN.x - 8 && x <= PET_WIN.x + PET_WIN.w + 8 && y >= PET_WIN.y - 8 && y <= PET_WIN.y + PET_WIN.h + 14){ petWindow(); return; }
  if(x >= 30 && x <= 208 && y >= 94 && y <= 148){ petShelf(); }
}

function petReact(f){
  const h = pet.hero, P = save.pet;
  const prev = pet.hist[pet.hist.length - 1];
  pet.hist.push(f.id); if(pet.hist.length > 5) pet.hist.shift();
  const streak3 = pet.hist.length >= 3 && pet.hist.slice(-3).every(x => x === f.id);
  if(f.id !== 'brocoli') pet.broc = 0;
  const wasFull = pet.full;
  if(f.fill > 0){ pet.full = Math.min(5, pet.full + f.fill); pet.fullT = 0; }
  if(P){ P.meals = (P.meals || 0) + 1; persist(); }
  pet.eats.push(frame); pet.eats = pet.eats.filter(t => frame - t < 420);
  let quiet = false;     // the reaction already says enough: no follow-up line
  if(f.id === 'ficelle'){
    pet.dance = 130; setFace(h, 'open', 120);
    petSay(line('ficelle'), 130);
    [784, 988, 1175, 1568, 1175, 1568].forEach((q, k) => tone(q, 0.12, 'triangle', 0.05, null, k * 0.09));
    for(let k = 0; k < 10; k++) petPart({type:'heart', x:PET.x + (Math.random() - 0.5) * 80, y:PET.y - 90 - Math.random() * 30, vx:(Math.random() - 0.5) * 1.6, vy:-1 - Math.random(), g:-0.01, life:70, max:70, s:0.8 + Math.random() * 0.6});
  } else if(f.id === 'pain'){
    setFace(h, 'smile', 60); petHop(4);
    petSay(line('pain'), 110);
    [659, 784, 988].forEach((q, k) => tone(q, 0.1, 'triangle', 0.045, null, k * 0.08));
  } else if(f.id === 'croissant'){
    setFace(h, 'open', 60); petHop(6); h.spin = 0.001;
    petSay(line('croissant'), 110);
    [784, 1047, 1319].forEach((q, k) => tone(q, 0.1, 'triangle', 0.045, null, k * 0.07));
    for(let k = 0; k < 6; k++) petPart({type:'star', x:PET.x + (Math.random() - 0.5) * 90, y:PET.y - 70 - Math.random() * 50, vx:0, vy:-0.4, g:0, life:40, max:40, rot:Math.random() * 6, vr:0.1, s:1});
  } else if(f.id === 'olive'){
    setFace(h, 'o', 18);
    pet.after.push({t:14, run(){
      const mm = petMouth();
      petPart({type:'pit', x:mm.x, y:mm.y, vx:4.2 * (h.fx >= 0 ? 1 : -1), vy:-4, g:0.35, life:150, max:150, rot:0, vr:0.3, bounce:true});
      tone(520, 0.08, 'square', 0.04, 180);
      setFace(h, 'open', 30);
      petSay(line('olive'), 100);
    }});
  } else if(f.id === 'piment'){
    // a second one while it still burns: dragon mode
    const dbl = pet.spicy > 0 || prev === 'piment';
    pet.spicy = dbl ? 340 : 260; pet.hot2 = dbl;
    setFace(h, 'open', 200);
    petSay(dbl ? line('spicy2') : line('spicy'), 110);
    tone(300, 0.6, 'sawtooth', 0.05, 1200);
    if(dbl){ pet.shake = 30; tone(150, 0.8, 'sawtooth', 0.05, 600, 0.2); }
    quiet = true;
  } else if(f.id === 'eau'){
    if(pet.spicy > 0){
      pet.spicy = 0; pet.hot2 = false;
      for(let k = 0; k < 10; k++) petPart({type:'steam', x:PET.x + (Math.random() - 0.5) * 70, y:PET.y - 120, vx:(Math.random() - 0.5) * 0.8, vy:-1.2 - Math.random(), g:-0.01, life:50, max:50, s:1 + Math.random()});
      setFace(h, 'smile', 80);
      petSay(line('waterSpicy'), 120);
      quiet = true;
    } else if(pet.ev && pet.ev.type === 'hiccup'){
      pet.ev = null; setFace(h, 'smile', 80);
      petSay(line('hicCure'), 120);
      quiet = true;
    } else if(streak3){
      // sloshing
      setFace(h, 'o', 40); h.wobV += 1.4; pet.shake = 20;
      petSay(pick(PET_AGAIN.eau), 120);
      for(let k = 0; k < 4; k++) tone(300 + k * 90, 0.08, 'sine', 0.04, 500, k * 0.12);
      quiet = true;
    } else {
      setFace(h, 'smile', 50);
      petSay(line('water'), 100);
    }
  } else if(f.id === 'brocoli'){
    // eaten at last… and he turns green
    pet.green = 260; setFace(h, 'hurt', 130); pet.shake = 30; h.wobV -= 0.8;
    petSay(line('brocoliEat'), 130);
    tone(160, 0.5, 'sawtooth', 0.04, 70);
    quiet = true;
  }
  // a follow-up remark: same food again, a menu combo, a milestone, a full belly
  let follow = null;
  if(!quiet){
    if(streak3 && PET_AGAIN[f.id]) follow = pick(PET_AGAIN[f.id]);
    else if(prev && PET_COMBO[prev + '>' + f.id]) follow = PET_COMBO[prev + '>' + f.id];
    else if(P && [10, 25, 50, 100, 250, 500, 1000].includes(P.meals)) follow = `Et de ${P.meals} ! Ça fait ${P.meals} bouchées que tu me donnes.`;
    else if(wasFull < 5 && pet.full >= 5) follow = line('fullNow');
  }
  if(follow) pet.after.push({t:f.id === 'olive' ? 130 : 105, run(){ if(!pet.flight && !pet.eating && !onCall() && !(pet.ev && pet.ev.type === 'sleep')) petSay(follow, 120); }});
  // eating too fast gives him the hiccups
  const fast = pet.eats.length >= 4 && !pet.ev;
  if(fast){
    pet.eats = [];
    pet.after.push({t:follow ? 230 : 120, run(){
      if(pet.ev || onCall()) return;
      petSay(line('fast'), 90);
      pet.after.push({t:80, run(){ if(!pet.ev && !pet.phone) startEv('hiccup'); }});
    }});
  } else if(f.fill > 0 && pet.full >= 4 && Math.random() < 0.55){
    // a big belly sometimes has something to say
    pet.after.push({t:follow ? 240 : 150, run(){
      if(onCall() || (pet.ev && pet.ev.type === 'sleep')) return;
      setFace(h, 'open', 40); h.wobV += 1; pet.shake = 14;
      petSay(line('burp'), 70);
      tone(120, 0.5, 'sawtooth', 0.06, 55);
      pet.after.push({t:70, run(){ setFace(h, 'smile', 40); petSay(line('burpSorry'), 80); }});
    }});
  }
}

// ---------------------------------------------------------------- little events when you leave him alone
function petIdleEvent(){
  pet.nextEv = 360 + Math.random() * 320;
  pet.quiet++;
  if(pet.lastEv !== 'sleep' && (pet.quiet >= 5 || (pet.full >= 4.5 && Math.random() < 0.35) || (petNight() && pet.quiet >= 3 && Math.random() < 0.25))){ startEv('sleep'); return; }
  const opts = [['chat', 3], ['muse', 2], ['song', 1.2], ['stretch', 0.8], ['sneeze', 1], ['hiccup', 0.7], ['fly', 1.2], ['call', 1.1], ['bird', 1.2]];
  if(pet.full < 1.5) opts.push(['growl', 2.2]);
  if(pet.full >= 1.5 && pet.full < 4.5) opts.push(['juggle', 1.4]);
  if(pet.quiet >= 3) opts.push(['lonely', 2.5]);
  const pool = opts.filter(o => o[0] !== pet.lastEv || o[0] === 'chat');
  let r = Math.random() * pool.reduce((s, o) => s + o[1], 0);
  for(const [type, w] of pool){ if((r -= w) <= 0){ startEv(type); return; } }
  startEv('chat');
}
function startEv(type, text){
  const h = pet.hero;
  pet.lastEv = type;
  const ev = pet.ev = {type, t:0, dur:120};
  if(type === 'sleep'){
    ev.dur = 1300 + Math.random() * 700;
    petSay(text || line('sleepy'), 100); setFace(h, 'o', 50);
    tone(330, 0.7, 'sine', 0.03, 200);
  } else if(type === 'hiccup'){
    ev.n = 5 + Math.floor(Math.random() * 4); ev.next = 8; ev.first = true; ev.dur = 1e9;
  } else if(type === 'sneeze'){
    ev.dur = 150; petSay('Ah… ah…', 80);
  } else if(type === 'fly'){
    ev.stage = 'buzz'; ev.x = PET_WIN.x + 30; ev.y = PET_WIN.y + 40; ev.vx = -2.5; ev.vy = 0.5;
    ev.tx = PET.x; ev.ty = PET.y - 120; ev.dur = 460 + Math.random() * 120;
  } else if(type === 'call'){
    ev.dur = 1e9;
    pet.phone = {stage:'incoming', t:0, call:pickCall(), i:0, next:999};
    petSay(line('call'), 90); setFace(h, 'o', 30);
  } else if(type === 'juggle'){
    ev.dur = 250; ev.fail = Math.random() < 0.35;
    petSay(line('juggle'), 100);
  } else if(type === 'bird'){
    ev.stage = 'in'; ev.x = W + 20; ev.y = 26;
    ev.sx = PET_WIN.x + 40 + Math.random() * 70; ev.sy = PET_WIN.y + PET_WIN.h + 6; ev.dur = 520;
  } else if(type === 'song'){
    ev.dur = 170; petSay(line('song'), 150);
  } else if(type === 'stretch'){
    ev.dur = 100; petSay(line('stretch'), 90); tone(200, 0.5, 'sine', 0.03, 320);
  } else if(type === 'muse'){
    ev.dur = 170; petSay(line('muse'), 165);
  } else if(type === 'growl'){
    ev.dur = 70; pet.shake = 26; setFace(h, 'o', 40); h.wobV += 0.8;
    petSay(line('growl'), 110);
    tone(70, 0.45, 'sawtooth', 0.05, 55); tone(90, 0.4, 'sawtooth', 0.04, 60, 0.4);
  } else if(type === 'lonely'){
    ev.dur = 110; petSay(line('lonely'), 100);
  } else {
    ev.dur = 1;
    petSay(pet.full >= 5 ? line('stuffed') : pet.full < 2 ? line('hungry') : Math.random() < 0.35 ? line('tips') : line('happy'), 120);
  }
}
// where the juggled olives are
function jugglePos(t, i){
  const u = t * 0.016 + i / 3, p = u % 1, dir = Math.floor(u) % 2 ? 1 : -1;
  return {x:PET.x + dir * lerp(-40, 40, p), y:PET.y + pet.hy - 106 - Math.sin(p * Math.PI) * 70};
}
function juggleDrop(bonk){
  const ev = pet.ev, h = pet.hero;
  if(!ev || ev.type !== 'juggle') return;
  pet.ev = null;
  for(let i = 0; i < 3; i++){
    const p = jugglePos(ev.t, i);
    const onHead = bonk && i === 0;
    petPart({type:'food', id:'olive', x:onHead ? PET.x + 4 : p.x, y:onHead ? PET.y - 190 : p.y, vx:onHead ? 0 : (Math.random() - 0.5) * 3, vy:onHead ? 0 : -1, g:0.3, life:130, max:130, rot:0, vr:0.15, bounce:true, head:onHead});
  }
  if(bonk){
    pet.after.push({t:22, run(){
      setFace(h, 'hurt', 60); h.wobV -= 1.2; pet.shake = 10;
      tone(400, 0.1, 'square', 0.05, 150);
      for(let k = 0; k < 3; k++) petPart({type:'star', x:PET.x + (Math.random() - 0.5) * 40, y:PET.y - 120, vx:(Math.random() - 0.5) * 2, vy:-1, g:0.02, life:40, max:40, rot:0, vr:0.2, s:0.8});
      petSay(line('juggleFail'), 110);
    }});
  } else petSay(line('juggleStop'), 80);
}
function flySnap(){
  const ev = pet.ev, h = pet.hero;
  pet.hint = 0; pet.quiet = 0;
  ev.stage = 'eat'; ev.t = 0; ev.x0 = ev.x; ev.y0 = ev.y;
  setFace(h, 'open', 20); petHop(5);
  tone(600, 0.06, 'square', 0.035, 1000);
}
function birdShoo(){
  const ev = pet.ev;
  pet.hint = 0; pet.quiet = 0;
  ev.stage = 'out'; ev.t = 0;
  setFace(pet.hero, 'sad', 50);
  petSay(line('birdGone'), 90);
  [2400, 2000, 2600].forEach((q, k) => tone(q, 0.05, 'sine', 0.025, q * 1.3, k * 0.06));
}
function petLookAt(x, y){ return {x:clamp((x - PET.x) / 70, -1, 1), y:clamp((y - (PET.y - 80)) / 70, -1, 1)}; }

function updatePetEv(){
  const ev = pet.ev, h = pet.hero;
  if(!ev) return;
  ev.t++;
  const end = () => { if(pet.ev === ev) pet.ev = null; };
  if(ev.type === 'sleep'){
    if(ev.t > 80 && ev.t % 85 === 0){
      petPart({type:'z', x:PET.x + 28, y:PET.y + pet.hy - 112, vx:0.45, vy:-0.55, g:0, life:95, max:95, s:0.8 + Math.random() * 0.5});
      tone(105, 0.7, 'triangle', 0.025, 80); setFace(h, 'o', 30);
    }
    if(ev.t >= ev.dur){ end(); pet.darkT = 0; pet.quiet = 0; pet.nextEv = 600 + Math.random() * 300; petSay(line('wakeSelf'), 120); setFace(h, 'open', 40); petHop(4); tone(400, 0.2, 'sine', 0.04, 800); }
  } else if(ev.type === 'hiccup'){
    if(--ev.next <= 0){
      petHop(3.5); h.wobV += 0.9; setFace(h, 'o', 14);
      petSay(ev.first ? line('hicStart') : 'Hic !', ev.first ? 90 : 36);
      ev.first = false;
      tone(620 + Math.random() * 120, 0.07, 'square', 0.04, 1100);
      ev.next = 55 + Math.random() * 55;
      if(--ev.n <= 0){ end(); pet.after.push({t:60, run(){ if(!pet.ev && !onCall()) petSay(line('hicEnd'), 100); }}); }
    }
  } else if(ev.type === 'sneeze'){
    if(ev.t < 72) pet.lean = -0.14 * ev.t / 72;
    if(ev.t === 40){ petSay('Aaah…', 40); tone(500, 0.3, 'sine', 0.02, 700); }
    if(ev.t === 72){
      pet.lean = 0.3; petSay('ATCHOUM !', 60); setFace(h, 'open', 30); petHop(5); h.wobV -= 1.6; pet.shake = 12;
      const m = petMouth(), d = h.fx >= 0 ? 1 : -1;
      for(let k = 0; k < 18; k++) petPart({type:'flour', x:m.x, y:m.y, vx:d * (1.5 + Math.random() * 3.5), vy:(Math.random() - 0.6) * 2.2, g:-0.005, life:50 + Math.random() * 30, max:80, s:0.7 + Math.random() * 0.8});
      tone(900, 0.25, 'sawtooth', 0.05, 120);
    }
    if(ev.t === 150){ petSay(line('sneeze'), 110); setFace(h, 'smile', 40); end(); }
  } else if(ev.type === 'fly'){
    if(ev.stage === 'buzz' || ev.stage === 'catch'){
      if(ev.t % 50 === 1){ ev.tx = PET.x + (Math.random() - 0.5) * 240; ev.ty = PET.y - 60 - Math.random() * 130; }
      const jit = ev.stage === 'catch' ? 1.8 : 0.9;
      ev.vx += (ev.tx - ev.x) * 0.004 + (Math.random() - 0.5) * jit; ev.vy += (ev.ty - ev.y) * 0.004 + (Math.random() - 0.5) * jit;
      ev.vx *= 0.93; ev.vy *= 0.93; ev.x += ev.vx; ev.y += ev.vy;
      ev.x = clamp(ev.x, 20, W - 20); ev.y = clamp(ev.y, 20, PET.y - 10);
      if(ev.t % 14 === 0) tone(180 + Math.random() * 40, 0.08, 'sawtooth', 0.008, 220);
      pet.look = pet.look || petLookAt(ev.x, ev.y);
    }
    if(ev.stage === 'buzz'){
      if(ev.t === 40){ petSay(line('fly'), 100); setFace(h, 'o', 30); }
      if(ev.t >= ev.dur){ ev.stage = 'catch'; ev.t = 0; ev.win = Math.random() < 0.5; petSay(line('flyCatch'), 70); }
    } else if(ev.stage === 'catch'){
      if(ev.t % 14 === 0){ petHop(4); tone(400, 0.06, 'triangle', 0.03, 700); }
      if(ev.t === 64){
        if(ev.win){ ev.stage = 'eat'; ev.t = 0; ev.x0 = ev.x; ev.y0 = ev.y; }
        else { ev.stage = 'away'; ev.t = 0; petSay(line('flyMiss'), 90); setFace(h, 'sad', 60); }
      }
    } else if(ev.stage === 'eat'){
      const m = petMouth(), k = Math.min(1, ev.t / 12);
      ev.x = lerp(ev.x0, m.x, k); ev.y = lerp(ev.y0, m.y, k);
      if(ev.t < 12) setFace(h, 'open', 4);
      if(ev.t === 12){ tone(160, 0.1, 'square', 0.05, 80); setFace(h, 'smile', 20); h.wobV += 0.6; }
      if(ev.t === 34){ petSay(line('flyEat'), 110); end(); }
    } else if(ev.stage === 'away'){
      ev.vx += (PET_WIN.x + 75 - ev.x) * 0.012; ev.vy += (PET_WIN.y + 30 - ev.y) * 0.012;
      ev.vx *= 0.9; ev.vy *= 0.9; ev.x += ev.vx; ev.y += ev.vy;
      if(ev.t % 10 === 0) tone(200, 0.06, 'sawtooth', 0.006, 260);
      if(ev.t > 70) end();
    }
  } else if(ev.type === 'call'){
    if(!pet.phone) end();
  } else if(ev.type === 'juggle'){
    if(ev.t % 21 === 0) tone(700 + (Math.floor(ev.t / 21) % 3) * 120, 0.04, 'triangle', 0.03);
    if(ev.t >= ev.dur){
      if(ev.fail) juggleDrop(true);
      else {
        end(); petSay(line('juggleOk'), 100); petHop(5); setFace(h, 'open', 60);
        [784, 988, 1175, 1568].forEach((q, k) => tone(q, 0.1, 'triangle', 0.045, null, k * 0.08));
        for(let k = 0; k < 6; k++) petPart({type:'star', x:PET.x + (Math.random() - 0.5) * 100, y:PET.y - 130 - Math.random() * 40, vx:0, vy:-0.4, g:0, life:45, max:45, rot:Math.random() * 6, vr:0.1, s:1});
      }
    }
  } else if(ev.type === 'bird'){
    if(ev.stage === 'in'){
      const d = Math.hypot(ev.sx - ev.x, ev.sy - ev.y);
      ev.x += (ev.sx - ev.x) * 0.05; ev.y += (ev.sy - ev.y) * 0.05 - Math.sin(ev.t * 0.2) * 0.4 * Math.min(1, d / 40);
      if(d < 2.5){ ev.stage = 'sit'; ev.t = 0; ev.x = ev.sx; ev.y = ev.sy; }
    } else if(ev.stage === 'sit'){
      if(ev.t === 20){ petSay(line('bird'), 110); setFace(h, 'open', 30); }
      if(ev.t % 70 === 35) [2200, 2600].forEach((q, k) => tone(q, 0.05, 'sine', 0.025, q * 1.2, k * 0.08));
      if(ev.t >= ev.dur){ ev.stage = 'out'; ev.t = 0; petSay(line('birdLeave'), 90); }
      pet.look = pet.look || petLookAt(ev.x, ev.y - 8);
    } else if(ev.stage === 'out'){
      ev.x += 3.2; ev.y -= 1.6 + Math.sin(ev.t * 0.3);
      if(ev.t > 90) end();
    }
  } else if(ev.type === 'song'){
    const notes = [523, 587, 659, 523, 659, 698, 784, 0, 784, 698, 659, 587, 523];
    if(ev.t % 12 === 1){
      const q = notes[Math.floor(ev.t / 12)];
      if(q) tone(q, 0.11, 'triangle', 0.035);
      if(q && ev.t % 24 === 1) petPart({type:'note', x:PET.x + 40 + Math.random() * 20, y:PET.y - 100, vx:0.6, vy:-1, g:0, life:50, max:50});
    }
    pet.lean = Math.sin(ev.t * 0.1) * 0.12;
    if(ev.t >= ev.dur) end();
  } else if(ev.t >= ev.dur) end();
}

function updatePet(){
  const h = pet.hero;
  pet.idleT++;
  if(pet.leaving > 0 && --pet.leaving === 0) transition(() => { setState('title'); });
  updatePhone();
  if(pet.bubble && --pet.bubble.t <= 0) pet.bubble = null;
  if(pet.dance > 0) pet.dance--;
  if(pet.crossT > 0 && --pet.crossT === 0 && !pet.ev && !pet.phone){ petSay(line('forgive'), 100); setFace(h, 'smile', 40); }
  if(pet.shake > 0) pet.shake--;
  if(pet.turn > 0) pet.turn--;
  if(pet.lidT > 0) pet.lidT--;
  if(pet.green > 0) pet.green--;
  if(pet.shelfGone > 0) pet.shelfGone--;
  pet.lampSw *= 0.985; pet.shelfWob *= 0.94; pet.lean *= 0.9;
  pet.darkK += ((pet.dark ? 1 : 0) - pet.darkK) * 0.15;
  // digestion
  if(pet.full > 0 && ++pet.fullT > 720){ pet.full = Math.max(0, pet.full - 1); pet.fullT = 0; }
  for(const a of pet.after) a.t--;
  const due = pet.after.filter(a => a.t <= 0);
  pet.after = pet.after.filter(a => a.t > 0);
  due.forEach(a => a.run());

  // the food flies in an arc towards the mouth
  const fl = pet.flight;
  pet.look = null;
  if(fl){
    fl.t++;
    const k = Math.min(1, fl.t / 30), m = petMouth();
    fl.x1 = m.x; fl.y1 = m.y;
    fl.x = lerp(fl.x0, fl.x1, k); fl.y = lerp(fl.y0, fl.y1, k) - Math.sin(k * Math.PI) * 80; fl.rot = k * 5;
    pet.look = {x:clamp((fl.x - PET.x) / 70, -1, 1), y:clamp((fl.y - (PET.y - 70)) / 70, -1, 1)};
    if(fl.refuse){
      if(fl.t === 16){ pet.turn = 70; setFace(h, 'sad', 80); tone(220, 0.25, 'triangle', 0.05, 130); }
      if(fl.t >= 30){
        pet.flight = null;
        petPart({type:'food', id:fl.f.id, x:fl.x, y:fl.y, vx:-2.5 * (h.fx >= 0 ? 1 : -1), vy:-3, g:0.32, life:120, max:120, rot:fl.rot, vr:0.2, bounce:true});
        petSay(fl.f.id === 'brocoli' ? (pet.broc >= 2 ? line('brocoli2') : line('brocoli')) : line('full'), 110);
      }
    } else {
      if(fl.t > 14) setFace(h, 'open', 4);
      if(fl.t >= 30){
        pet.flight = null;
        pet.eating = {f:fl.f, t:0, dur:fl.f.id === 'eau' ? 46 : 38};
        h.wobV += 0.5;
      }
    }
  }
  // chewing (or drinking)
  const ea = pet.eating;
  if(ea){
    ea.t++;
    setFace(h, Math.floor(ea.t / 5) % 2 ? 'o' : 'smile', 3);
    const m = petMouth();
    if(ea.f.id === 'eau'){
      if(ea.t % 8 === 0){ tone(420 + Math.random() * 300, 0.05, 'sine', 0.04); petPart({type:'drop', x:m.x + (Math.random() - 0.5) * 10, y:m.y, vx:(Math.random() - 0.5) * 1.5, vy:-1.5, g:0.15, life:26, max:26}); }
    } else if(ea.t % 9 === 0){
      tone(150 + Math.random() * 80, 0.05, 'square', 0.03);
      for(let k = 0; k < 2; k++) petPart({type:'crumb', color:ea.f.crumb, x:m.x + (Math.random() - 0.5) * 16, y:m.y + 4, vx:(Math.random() - 0.5) * 2.2, vy:-1 - Math.random(), g:0.25, life:40, max:40, rot:Math.random() * 6, vr:0.2});
    }
    h.wobV += Math.sin(ea.t * 0.6) * 0.06;
    if(ea.t >= ea.dur){ pet.eating = null; petReact(ea.f); }
  }
  // spicy: red, hopping, breathing fire, then begging for water
  if(pet.spicy > 0){
    pet.spicy--;
    if(pet.spicy > 130 && pet.hy >= 0 && pet.spicy % 2 === 0) petHop(5 + Math.random() * 2);
    const fireTop = pet.hot2 ? 320 : 230;
    if(pet.spicy > 150 && pet.spicy < fireTop){
      const m = petMouth();
      for(let k = 0; k < (pet.hot2 ? 3 : 2); k++) petPart({type:'fire', x:m.x, y:m.y, vx:(h.fx >= 0 ? 1 : -1) * (3 + Math.random() * (pet.hot2 ? 5 : 3)), vy:(Math.random() - 0.5) * 1.8, g:-0.05, life:26, max:26, s:(1 + Math.random()) * (pet.hot2 ? 1.4 : 1)});
      if(pet.spicy % 10 === 0) tone(90 + Math.random() * 40, 0.12, 'sawtooth', 0.035, 60);
      if(pet.hot2 && pet.spicy % 30 === 0) pet.shake = 10;
    }
    if(pet.spicy % 9 === 0) petPart({type:'steam', x:PET.x + (Math.random() - 0.5) * 60, y:PET.y + pet.hy - 105, vx:(Math.random() - 0.5) * 0.6, vy:-1.4, g:-0.01, life:40, max:40, s:0.8 + Math.random() * 0.6});
    if(pet.spicy === 130){ petSay(line('spicyBeg'), 130); setFace(h, 'o', 120); }
    if(pet.spicy === 0) pet.hot2 = false;
  }
  // little events and idle chatter when nothing happens
  updatePetEv();
  if(pet.dark){
    pet.darkT++;
    if(pet.darkT === 300 && !pet.ev && !petBusy() && !pet.phone && !pet.leaving) startEv('sleep', line('lampSleep'));
  }
  if(!pet.ev && !petBusy() && !pet.phone && !pet.leaving && !pet.bubble && pet.crossT <= 0 && pet.spicy <= 0 && pet.idleT > pet.nextEv) petIdleEvent();
  if(!pet.look && pet.lookAt){ pet.look = petLookAt(pet.lookAt.x, pet.lookAt.y); if(--pet.lookAt.t <= 0) pet.lookAt = null; }
  // hop physics
  pet.hvy += 0.55; pet.hy += pet.hvy;
  if(pet.hy >= 0){ if(pet.hvy > 2) h.wobV += pet.hvy * 0.05; pet.hy = 0; pet.hvy = 0; }
  // particles
  for(const p of pet.parts){
    p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life--;
    if(p.head && p.y > PET.y - 118 && p.vy > 0){ p.head = false; p.vy = -3.5; p.vx = 2.2; }     // bonk!
    if(p.bounce && p.y > PET.y + 4 && p.vy > 0){ p.y = PET.y + 4; p.vy *= -0.45; p.vx *= 0.7; if(Math.abs(p.vy) < 0.8){ p.vy = 0; p.g = 0; p.vr *= 0.5; } }
  }
  pet.parts = pet.parts.filter(p => p.life > 0);
  // XELIAX himself
  const ev = pet.ev, sleeping = !!ev && ev.type === 'sleep';
  stepCharAnim(h, {
    vx:0, vy:pet.hy < 0 ? pet.hvy : 0, onGround:pet.hy >= 0, facing:pet.turn > 0 ? -1 : 1,
    cheer:pet.dance > 0 || pet.spicy > 130 || (!!ev && (ev.type === 'juggle' || (ev.type === 'fly' && ev.stage === 'catch'))),
    phone:onPhone(),
    look:pet.look || (onPhone() ? {x:0.5, y:-0.55} : pet.idleT > 200 ? null : {x:0.2, y:0.1}),
    hurt:false, akimbo:pet.crossT > 0, think:!!ev && ev.type === 'muse',
    wave:pet.leaving > 0 || (!!ev && (ev.type === 'lonely' || (ev.type === 'bird' && ev.stage === 'sit' && ev.t > 20 && ev.t < 110))),
    sleep:sleeping, stretch:!!ev && ev.type === 'stretch' && ev.t < 75,
  });
  if(Math.abs(pet.lean) > 0.002) h.lean = lerp(h.lean, pet.lean, 0.35);
  // eyelids: closed when asleep, half closed when blissful or about to sneeze
  const lidT = sleeping ? (ev.t > 40 ? 1 : 0.4) : pet.lidT > 0 ? 0.8 : (ev && ev.type === 'sneeze' && ev.t < 72) ? Math.min(0.7, ev.t / 60) : 0;
  h.lid = (h.lid || 0) + (lidT - (h.lid || 0)) * (sleeping ? 0.04 : 0.25);
  h.sx = 1 + pet.full * 0.05 + (pet.shake > 0 ? Math.sin(pet.shake * 1.3) * 0.05 : 0);
  h.sy = 1 - pet.full * 0.02;
  if(sleeping) h.sy += Math.sin(frame * 0.05) * 0.03;
  if(ev && ev.type === 'stretch' && ev.t < 75){ const k = Math.sin(Math.min(1, ev.t / 40) * Math.PI / 2); h.sy *= 1 + 0.1 * k; h.sx *= 1 - 0.05 * k; }
}

// ---------------------------------------------------------------- drawing
function drawBaguette(x, y, len, rot, th){
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  const g = ctx.createLinearGradient(0, -th / 2, 0, th / 2);
  g.addColorStop(0, '#f6cf86'); g.addColorStop(0.55, '#d9963f'); g.addColorStop(1, '#9a5a20');
  rr(-len / 2, -th / 2, len, th, th / 2); ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = '#5a3210'; ctx.lineWidth = Math.max(1, th * 0.12); ctx.stroke();
  ctx.strokeStyle = '#fbe6b8'; ctx.lineWidth = Math.max(1, th * 0.14); ctx.lineCap = 'round';
  for(let i = 0; i < 3; i++){ const cx = -len * 0.3 + i * len * 0.3; ctx.beginPath(); ctx.moveTo(cx - th * 0.35, th * 0.18); ctx.lineTo(cx + th * 0.2, -th * 0.25); ctx.stroke(); }
  ctx.restore();
}
function drawFood(id, x, y, s=1, rot=0){
  if(id === 'ficelle'){ drawFicelle(x, y, 38 * s, rot - 0.35, false, 7 * s); return; }
  if(id === 'pain'){ drawBaguette(x, y, 36 * s, rot - 0.35, 11 * s); return; }
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if(id === 'croissant'){
    const segs = [[-12, 4, 5.5, 4.5, -0.9], [-6.5, -1, 7, 6, -0.45], [0, -3, 8, 7, 0], [6.5, -1, 7, 6, 0.45], [12, 4, 5.5, 4.5, 0.9]];
    for(const [sx, sy, rx, ry, r] of segs){
      const g = ctx.createLinearGradient(0, sy - ry, 0, sy + ry);
      g.addColorStop(0, '#f8d58c'); g.addColorStop(1, '#c47a2c');
      ctx.beginPath(); ctx.ellipse(sx, sy, rx, ry, r, 0, TAU); ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = '#6a3c12'; ctx.lineWidth = 1; ctx.stroke();
    }
  } else if(id === 'olive'){
    ctx.beginPath(); ctx.ellipse(0, 0, 7, 9, 0.2, 0, TAU);
    const g = ctx.createRadialGradient(-2, -3, 1, 0, 0, 10);
    g.addColorStop(0, '#b5d66a'); g.addColorStop(1, '#5a7a22');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#2f4410'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#e5352f'; ctx.beginPath(); ctx.ellipse(0.8, -6.5, 2.6, 1.6, 0.2, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-2.5, -2, 1.4, 2.6, 0.3, 0, TAU); ctx.fill();
  } else if(id === 'piment'){
    ctx.beginPath(); ctx.moveTo(-9, -5);
    ctx.bezierCurveTo(-4, -9, 8, -6, 12, 6);
    ctx.bezierCurveTo(13, 9, 10, 9, 8, 6);
    ctx.bezierCurveTo(4, 0, -3, 0, -9, 1);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, -8, 0, 8);
    g.addColorStop(0, '#ff6a4a'); g.addColorStop(1, '#b3121c');
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = '#5a0a0e'; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#4caf3c'; ctx.beginPath(); ctx.ellipse(-10, -2, 3, 4, 0.4, 0, TAU); ctx.fill(); ctx.strokeStyle = '#1f5a18'; ctx.stroke();
    ctx.strokeStyle = '#2f7a24'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-11, -4); ctx.quadraticCurveTo(-14, -9, -11, -12); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(1, -4, 4, 1.2, 0.35, 0, TAU); ctx.fill();
  } else if(id === 'brocoli'){
    ctx.fillStyle = '#b8e08a'; ctx.strokeStyle = '#3f6a22'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-3, 2); ctx.lineTo(-2, 11); ctx.lineTo(3, 11); ctx.lineTo(4, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    for(const [bx, b2, r] of [[-6, -1, 5], [0, -5, 6], [6, -1, 5], [-2, 1, 4], [3, 1, 4]]){
      ctx.beginPath(); ctx.arc(bx, b2, r, 0, TAU); ctx.fillStyle = '#3f8f2c'; ctx.fill(); ctx.strokeStyle = '#1f4f16'; ctx.stroke();
    }
    ctx.fillStyle = 'rgba(200,255,160,0.5)';
    for(const [bx, b2] of [[-6, -3], [0, -8], [5, -3]]){ ctx.beginPath(); ctx.arc(bx, b2, 1.2, 0, TAU); ctx.fill(); }
  } else if(id === 'tel'){
    const ph = pet.phone, ring = ph && (ph.stage === 'ring' || (ph.stage === 'incoming' && ph.t % 45 < 26)) ? Math.sin(frame * 1.6) * 0.18 : 0;
    ctx.rotate(ring);
    ctx.fillStyle = '#e5352f'; ctx.strokeStyle = '#5a0a0e'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-11, 9); ctx.lineTo(-8, -1); ctx.lineTo(8, -1); ctx.lineTo(11, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff2e0'; ctx.beginPath(); ctx.arc(0, 4.5, 3.6, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#5a0a0e'; for(let k = 0; k < 6; k++){ const an = k * 1.05; ctx.beginPath(); ctx.arc(Math.cos(an) * 2.3, 4.5 + Math.sin(an) * 2.3, 0.45, 0, TAU); ctx.fill(); }
    if(!onPhone()){
      ctx.fillStyle = '#e5352f';
      ctx.beginPath(); ctx.moveTo(-11, -4); ctx.quadraticCurveTo(0, -9, 11, -4); ctx.lineTo(11, -1.5); ctx.quadraticCurveTo(0, -5.5, -11, -1.5); ctx.closePath(); ctx.fill(); ctx.stroke();
      rr(-13, -5.5, 6, 5, 2); ctx.fill(); ctx.stroke(); rr(7, -5.5, 6, 5, 2); ctx.fill(); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-6, 0.5, 4, 1);
  } else if(id === 'eau'){
    ctx.beginPath(); ctx.moveTo(-7, -10); ctx.lineTo(7, -10); ctx.lineTo(5.5, 10); ctx.lineTo(-5.5, 10); ctx.closePath();
    ctx.fillStyle = 'rgba(230,246,255,0.55)'; ctx.fill();
    ctx.save(); ctx.clip();
    const g = ctx.createLinearGradient(0, -4, 0, 10);
    g.addColorStop(0, '#9fe0ff'); g.addColorStop(1, '#3f9be0');
    ctx.fillStyle = g; ctx.fillRect(-8, -4 + Math.sin(frame * 0.1) * 0.6, 16, 16);
    ctx.restore();
    ctx.strokeStyle = '#2f5f8a'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-7, -10); ctx.lineTo(7, -10); ctx.lineTo(5.5, 10); ctx.lineTo(-5.5, 10); ctx.closePath(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-4.6, -7, 1.6, 13);
  }
  ctx.restore();
}

function drawPetRoom(){
  // a warm bakery corner
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#f7e2bb'); g.addColorStop(0.72, '#efc28c'); g.addColorStop(1, '#d99a5e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(255,255,255,0.13)';
  for(let x = 8; x < W; x += 40) ctx.fillRect(x, 0, 16, PET.y);
  // window onto the plains
  const wx = PET_WIN.x, wy = PET_WIN.y, ww = PET_WIN.w, wh = PET_WIN.h, night = petNight();
  rr(wx - 8, wy - 8, ww + 16, wh + 16, 10); ctx.fillStyle = '#8a5a34'; ctx.fill();
  ctx.save(); rr(wx, wy, ww, wh, 4); ctx.clip();
  const sg = ctx.createLinearGradient(0, wy, 0, wy + wh);
  sg.addColorStop(0, night ? '#0f1a4a' : '#64c4ff'); sg.addColorStop(1, night ? '#3a4f94' : '#d9f2ff');
  ctx.fillStyle = sg; ctx.fillRect(wx, wy, ww, wh);
  if(night){
    // stars and a croissant moon (it follows your real clock)
    ctx.fillStyle = '#ffffff';
    for(let k = 0; k < 14; k++){
      ctx.globalAlpha = 0.55 + 0.45 * Math.sin(frame * 0.05 + k * 1.7);
      ctx.fillRect(wx + 4 + (k * 53) % (ww - 8), wy + 6 + (k * 37) % 58, 1.7, 1.7);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff6c9'; ctx.beginPath(); ctx.arc(wx + 112, wy + 28, 13, 0, TAU); ctx.fill();
    ctx.fillStyle = '#152159'; ctx.beginPath(); ctx.arc(wx + 118, wy + 23, 11.5, 0, TAU); ctx.fill();
  } else {
    ctx.fillStyle = '#fff6c9'; ctx.beginPath(); ctx.arc(wx + 112, wy + 28, 13, 0, TAU); ctx.fill();
    const cxo = (frame * 0.15) % (ww + 80) - 40;
    ctx.fillStyle = '#ffffff';
    for(const [dx, dy, r] of [[0, 0, 9], [10, -5, 11], [22, 0, 8]]){ ctx.beginPath(); ctx.arc(wx + cxo + dx, wy + 36 + dy, r, 0, TAU); ctx.fill(); }
  }
  ctx.fillStyle = night ? '#3c5a6a' : '#b7e6a8'; ctx.beginPath(); ctx.moveTo(wx, wy + wh); for(let x = 0; x <= ww; x += 6) ctx.lineTo(wx + x, wy + 74 + Math.sin(x * 0.05) * 8); ctx.lineTo(wx + ww, wy + wh); ctx.fill();
  ctx.fillStyle = night ? '#2c4a50' : '#88d07e'; ctx.beginPath(); ctx.moveTo(wx, wy + wh); for(let x = 0; x <= ww; x += 6) ctx.lineTo(wx + x, wy + 90 + Math.sin(x * 0.07 + 2) * 6); ctx.lineTo(wx + ww, wy + wh); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#8a5a34'; ctx.fillRect(wx + ww / 2 - 3, wy, 6, wh); ctx.fillRect(wx, wy + wh / 2 - 3, ww, 6);
  rr(wx - 14, wy + wh + 6, ww + 28, 8, 3); ctx.fillStyle = '#7a4a26'; ctx.fill();
  // shelf of bread
  rr(34, 132, 170, 9, 3); ctx.fillStyle = '#8a5a34'; ctx.fill();
  ctx.fillStyle = '#6a4024'; ctx.fillRect(50, 141, 6, 14); ctx.fillRect(180, 141, 6, 14);
  const shw = Math.sin(frame * 0.6) * 0.07 * pet.shelfWob;
  if(pet.shelfGone <= 0) drawBaguette(84, 120, 64, -0.08 + shw, 12);
  drawBaguette(150, 116, 60, 0.12 - shw, 11);
  ctx.save(); ctx.translate(118, 122);
  const bg = ctx.createRadialGradient(-4, -6, 2, 0, 0, 16);
  bg.addColorStop(0, '#f6cf86'); bg.addColorStop(1, '#a86226');
  ctx.beginPath(); ctx.ellipse(0, 0, 15, 11, 0, Math.PI, 0); ctx.closePath(); ctx.fillStyle = bg; ctx.fill(); ctx.strokeStyle = '#5a3210'; ctx.lineWidth = 1.2; ctx.stroke();
  ctx.strokeStyle = '#fbe6b8'; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -2); ctx.stroke();
  ctx.restore();
  // hanging lamp (it can be switched off, and it swings when you do)
  ctx.save(); ctx.translate(300, 0); ctx.rotate(Math.sin(frame * 0.12) * pet.lampSw * 0.3); ctx.translate(-300, 0);
  ctx.strokeStyle = '#4a3020'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(300, 0); ctx.lineTo(300, 34); ctx.stroke();
  if(!pet.dark) softGlow(300, 60, 170, 120, '255,226,160', 0.35);
  ctx.fillStyle = '#5a3a24'; ctx.beginPath(); ctx.moveTo(284, 46); ctx.lineTo(316, 46); ctx.lineTo(306, 34); ctx.lineTo(294, 34); ctx.closePath(); ctx.fill();
  ctx.fillStyle = pet.dark ? '#8a7a64' : '#fff2c4'; ctx.beginPath(); ctx.arc(300, 48, 5, 0, Math.PI); ctx.fill();
  ctx.restore();
  // counter
  const cg = ctx.createLinearGradient(0, PET.y, 0, H);
  cg.addColorStop(0, '#a8693a'); cg.addColorStop(1, '#7a4724');
  ctx.fillStyle = cg; ctx.fillRect(0, PET.y + 8, W, H);
  ctx.fillStyle = '#d39a62'; ctx.fillRect(0, PET.y, W, 9);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(0, PET.y, W, 2);
  ctx.strokeStyle = 'rgba(60,30,12,0.35)'; ctx.lineWidth = 1;
  for(let x = 60; x < W; x += 120){ ctx.beginPath(); ctx.moveTo(x, PET.y + 10); ctx.lineTo(x, H); ctx.stroke(); }
}

function drawPetParts(){
  for(const p of pet.parts){
    const a = clamp(p.life / p.max, 0, 1);
    ctx.save(); ctx.globalAlpha = Math.min(1, a * 2);
    if(p.type === 'heart') heartIcon(p.x, p.y, 11 * p.s, '#ff5d8f', '#7a1236');
    else if(p.type === 'crumb'){ ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-1.6, -1.6, 3.2, 3.2); }
    else if(p.type === 'steam'){ ctx.globalAlpha = a * 0.5; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(p.x, p.y, (4 + (1 - a) * 8) * p.s, 0, TAU); ctx.fill(); }
    else if(p.type === 'fire'){
      const r = (3 + (1 - a) * 7) * p.s;
      ctx.globalAlpha = a;
      ctx.fillStyle = a > 0.6 ? '#fff3a0' : a > 0.3 ? '#ffb23a' : '#ff5a1f';
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, TAU); ctx.fill();
    }
    else if(p.type === 'star'){ ctx.fillStyle = '#ffe066'; star(p.x, p.y, 4.5 * p.s, p.rot); }
    else if(p.type === 'drop'){ ctx.fillStyle = '#7fd0ff'; ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, TAU); ctx.fill(); }
    else if(p.type === 'note'){
      ctx.globalAlpha = a; ctx.translate(p.x, p.y); ctx.rotate(Math.sin(p.life * 0.2) * 0.25);
      ctx.fillStyle = '#5a2a10'; ctx.strokeStyle = '#5a2a10'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(0, 0, 3.8, 2.7, -0.4, 0, TAU); ctx.fill();
      ctx.fillRect(2.6, -13, 1.5, 13);
      ctx.beginPath(); ctx.moveTo(4, -13); ctx.quadraticCurveTo(9.5, -10, 7.5, -4.5); ctx.stroke();
    }
    else if(p.type === 'pit'){ ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = '#8a5a2a'; ctx.beginPath(); ctx.ellipse(0, 0, 2.6, 4, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4a2a10'; ctx.lineWidth = 1; ctx.stroke(); }
    else if(p.type === 'food') drawFood(p.id, p.x, p.y, 1, p.rot);
    else if(p.type === 'z'){ ctx.globalAlpha = Math.min(1, a * 1.5); outlined('z', p.x, p.y, (14 + (1 - a) * 10) * p.s, '#ffffff', '#3a2a6a', 3, FU, 700); }
    else if(p.type === 'flour'){ ctx.globalAlpha = a * 0.75; ctx.fillStyle = '#fffaf0'; ctx.beginPath(); ctx.arc(p.x, p.y, (2 + (1 - a) * 6) * p.s, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
}

function drawFly(ev){
  const a = ev.stage === 'away' ? clamp(1 - ev.t / 70, 0, 1) : 1;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(ev.x, ev.y); ctx.scale(1.5, 1.5);
  const w = Math.sin(frame * 1.7) * 0.5 + 0.5;
  ctx.fillStyle = 'rgba(225,242,255,0.85)'; ctx.strokeStyle = 'rgba(60,60,90,0.6)'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.ellipse(-2.4, -3, 3.4, 1.5 + w * 1.4, -0.6, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(2.4, -3, 3.4, 1.5 + w * 1.4, 0.6, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#2a2a33';
  ctx.beginPath(); ctx.ellipse(0, 0, 3.3, 2.4, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(2.9, -0.4, 1.7, 0, TAU); ctx.fill();
  ctx.fillStyle = '#d0453a'; ctx.beginPath(); ctx.arc(3.5, -0.9, 0.75, 0, TAU); ctx.fill();
  ctx.restore();
}
function drawBird(ev){
  const sitting = ev.stage === 'sit';
  ctx.save(); ctx.translate(ev.x, ev.y); ctx.scale(1.35, 1.35);
  if(ev.stage === 'out') ctx.scale(-1, 1);          // flies off to the right
  if(sitting){
    ctx.strokeStyle = '#d98a2b'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-1.5, -4); ctx.lineTo(-2.2, 0); ctx.moveTo(1.5, -4); ctx.lineTo(2.2, 0); ctx.stroke();
  }
  const pk = sitting && ev.t % 90 > 68 ? Math.sin((ev.t % 90 - 68) / 22 * Math.PI) * 0.45 : 0;
  ctx.translate(0, -9); ctx.rotate(-pk);
  ctx.fillStyle = '#7a9ad8'; ctx.strokeStyle = '#2a3a6a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(5.5, -1); ctx.lineTo(11.5, -4.5); ctx.lineTo(11, 1.5); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 7, 5.5, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f3e6c8'; ctx.beginPath(); ctx.ellipse(-1.5, 2, 4, 2.6, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#7a9ad8'; ctx.beginPath(); ctx.arc(-5, -4, 4, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#f0a030'; ctx.beginPath(); ctx.moveTo(-8.4, -4.6); ctx.lineTo(-11.8, -3.4); ctx.lineTo(-8.4, -2.4); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1d1442'; ctx.beginPath(); ctx.arc(-6.2, -4.8, 0.95, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(1, -1); ctx.rotate(sitting ? 0.15 : Math.sin(frame * 0.9) * 0.9 - 0.3);
  ctx.fillStyle = '#5a7ac0'; ctx.beginPath(); ctx.ellipse(2.5, 0, 5, 2.6, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function drawPet(){
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  drawPetRoom();
  const h = pet.hero, ev = pet.ev;
  if(ev && ev.type === 'bird') drawBird(ev);
  // shadow on the counter
  const sh = 1 - clamp(-pet.hy / 80, 0, 0.6);
  ctx.fillStyle = 'rgba(70,30,10,0.25)'; ctx.beginPath(); ctx.ellipse(PET.x, PET.y + 2, 44 * sh * (1 + pet.full * 0.05), 7 * sh, 0, 0, TAU); ctx.fill();
  const spicyK = clamp(pet.spicy / 120, 0, 1), greenK = clamp(pet.green / 80, 0, 1) * 0.7;
  const tint = spicyK > 0 ? mixHex(HERO.body, '#d4243a', spicyK) : greenK > 0 ? mixHex(HERO.body, '#5aa83a', greenK) : null;
  const jx = pet.spicy > 130 ? (Math.random() - 0.5) * 3 : 0;
  drawHero(h, PET.x + jx, PET.y + pet.hy, PET.s, {tint, phone:onPhone()});
  // the curly cord from the handset to the phone on the tray
  if(onPhone()){
    const tx = trayX(FOODS.length - 1) + TRAY.w / 2, ty = TRAY.y + 14;
    const sx = PET.x + 24 * PET.s * (h.fx >= 0 ? 1 : -1), sy = PET.y + pet.hy - 30 * PET.s;
    ctx.strokeStyle = '#b8222c'; ctx.lineWidth = 1.6; ctx.beginPath();
    for(let k = 0; k <= 40; k++){
      const u = k / 40, x = lerp(sx, tx, u), y = lerp(sy, ty, u) + Math.sin(u * Math.PI) * 30;
      ctx.lineTo(x + Math.cos(u * 60) * 3, y + Math.sin(u * 60) * 3);
    }
    ctx.stroke();
  }
  // lights off: everything but the window goes dark
  if(pet.darkK > 0.01){
    ctx.save(); ctx.globalAlpha = pet.darkK;
    ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.rect(PET_WIN.x - 8, PET_WIN.y - 8, PET_WIN.w + 16, PET_WIN.h + 16);
    ctx.fillStyle = 'rgba(12,8,32,0.62)'; ctx.fill('evenodd');
    ctx.restore();
  }
  drawPetParts();
  if(ev && ev.type === 'juggle') for(let i = 0; i < 3; i++){ const p = jugglePos(ev.t, i); drawFood('olive', p.x, p.y, 0.8, ev.t * 0.2 + i); }
  if(ev && ev.type === 'fly') drawFly(ev);
  // flying food
  if(pet.flight) drawFood(pet.flight.f.id, pet.flight.x, pet.flight.y, 1.1, pet.flight.rot);
  // speech bubble
  if(pet.bubble){
    const b = pet.bubble, el = b.max - b.t;
    const s = easeOutBack(clamp(el / 10, 0, 1)), a = clamp(b.t / 12, 0, 1);
    ctx.font = `600 13px ${FU}`;
    const lines = wrapLines(b.text, 190);
    const tw = Math.max(...lines.map(l => ctx.measureText(l).width)) + 28, th = lines.length * 17 + 16;
    const bx = PET.x + 62, by = 122 - th / 2 + pet.hy * 0.5;
    ctx.save(); ctx.globalAlpha = a;
    ctx.translate(bx, by + th); ctx.scale(s, s); ctx.translate(-bx, -(by + th));
    rr(bx, by, tw, th, 14); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#1d1442'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx + 16, by + th - 1); ctx.lineTo(bx - 6, by + th + 16); ctx.lineTo(bx + 32, by + th - 1); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(bx + 16, by + th); ctx.lineTo(bx - 6, by + th + 16); ctx.lineTo(bx + 32, by + th); ctx.stroke();
    lines.forEach((ln, i) => txt(ln, bx + 14, by + 22 + i * 17, 13, '#1d1442', 600, 'left'));
    ctx.restore();
  }
  // title and belly meter
  heading('Le coin de XELIAX', 22, 36, 21, '#5a2a10', 'left', false);
  txt('Ventre', 22, 58, 12, '#7a4a26', 600, 'left');
  for(let i = 0; i < 5; i++){
    const full = pet.full >= i + 1 ? 1 : pet.full > i ? 0.6 : 0.25;
    ctx.save(); ctx.globalAlpha = full;
    drawBaguette(78 + i * 24, 54, 20, -0.25, 6.5);
    ctx.restore();
  }
  // back button
  const backKey = TOUCH ? '●' : 'Échap';
  ctx.font = `700 11px ${FU}`;
  const bkw = Math.max(19, ctx.measureText(backKey).width + 13);
  ctx.font = `600 12.5px ${FU}`;
  const bw = bkw + ctx.measureText('Retour').width + 28, bxx = W - 16 - bw;
  pet.back = {x:bxx, w:bw};
  rr(bxx, 12, bw, 28, 14); ctx.fillStyle = 'rgba(90,42,16,0.85)'; ctx.fill();
  keycap(backKey, bxx + 8, 31);
  txt('Retour', bxx + 8 + bkw + 9, 30.5, 12.5, '#ffffff', 600, 'left');
  // your coins (to buy food)
  rr(W - 118, 12, 104, 28, 14); ctx.fillStyle = 'rgba(90,42,16,0.85)'; ctx.fill();
  txt('🪙 ' + save.bank, W - 66, 30.5, 13, '#ffe58a', 700);
  // the food tray
  for(let i = 0; i < FOODS.length; i++){
    const x = trayX(i), sel = i === pet.sel && !TOUCH;
    const lift = sel ? -3 : 0;
    rr(x, TRAY.y + lift, TRAY.w, TRAY.h, 12);
    ctx.fillStyle = sel ? '#fff7e6' : 'rgba(255,244,224,0.88)'; ctx.fill();
    ctx.strokeStyle = sel ? '#5a2a10' : 'rgba(90,42,16,0.45)'; ctx.lineWidth = sel ? 2 : 1.2; ctx.stroke();
    const locked = !foodOpen(FOODS[i]);
    if(locked) ctx.globalAlpha = 0.35;
    drawFood(FOODS[i].id, x + TRAY.w / 2, TRAY.y + 22 + lift, 1, 0);
    ctx.globalAlpha = 1;
    if(locked){
      // a little padlock and the price
      ctx.fillStyle = '#5a2a10'; rr(x + TRAY.w / 2 - 7, TRAY.y + 20 + lift, 14, 11, 2); ctx.fill();
      ctx.strokeStyle = '#5a2a10'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + TRAY.w / 2, TRAY.y + 20 + lift, 4.5, Math.PI, 0); ctx.stroke();
      txt(FOODS[i].price + ' 🪙', x + TRAY.w / 2, TRAY.y + 48 + lift, 10.5, '#b07a00', 700);
    } else {
      ctx.font = `600 10.5px ${FU}`;
      const nw = ctx.measureText(FOODS[i].name).width, fs = nw > TRAY.w - 8 ? 10.5 * (TRAY.w - 8) / nw : 10.5;
      txt(FOODS[i].name, x + TRAY.w / 2, TRAY.y + 48 + lift, fs, '#5a2a10', 600);
    }
    if(FOODS[i].phone && pet.phone && pet.phone.stage === 'incoming' && pet.phone.t % 45 < 26){
      const cx = x + TRAY.w / 2, cy = TRAY.y + 22 + lift;
      ctx.strokeStyle = '#e5352f'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      for(let k = 0; k < 2; k++){
        ctx.beginPath(); ctx.arc(cx, cy, 15 + k * 5, -0.55, 0.55); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, 15 + k * 5, Math.PI - 0.55, Math.PI + 0.55); ctx.stroke();
      }
    }
  }
  const ph = pet.phone;
  let hint = null;
  if(ph && ph.stage === 'incoming') hint = TOUCH ? 'Le téléphone sonne : touche-le pour qu\'il décroche !' : 'Le téléphone sonne : clique dessus pour qu\'il décroche !';
  else if(ph && ph.stage === 'listen' && ph.t > 40) hint = 'Pose ta question dans ta tête, puis appuie encore sur le téléphone';
  else if(ev && ev.type === 'sleep' && ev.t > 240) hint = TOUCH ? 'Chut… il dort. Touche-le pour le réveiller.' : 'Chut… il dort. Clique sur lui pour le réveiller.';
  else if(ev && ev.type === 'fly' && ev.stage === 'buzz' && ev.t > 60) hint = TOUCH ? 'Touche la mouche !' : 'Clique sur la mouche !';
  else if(pet.hint > 0) hint = TOUCH ? 'Touche un aliment, le téléphone, ou XELIAX' : 'Clique sur un aliment, le téléphone ou XELIAX  (◀ ▶ et Espace pour choisir, E pour chatouiller)';
  if(hint){
    hint = frTypo(hint);
    ctx.font = `600 11px ${FU}`;
    const hw = ctx.measureText(hint).width + 22;
    ctx.save(); ctx.globalAlpha = 0.8 + 0.2 * Math.sin(frame * 0.08);
    rr(W / 2 - hw / 2, 274, hw, 18, 9); ctx.fillStyle = 'rgba(255,244,224,0.92)'; ctx.fill();
    txt(hint, W / 2, 287, 11, '#5a2a10', 600);
    ctx.restore();
  }
}
// mix two #rrggbb colours
function mixHex(a, b, k){
  const A = hexRGB(a), B = hexRGB(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * k));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

