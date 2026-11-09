// v53 : cinématique d'ouverture du chapitre 1 ; la pie reste cachée dans la démo. Usage : node outils/tests/tests_ouverture.js [dossier-captures]
const { chromium } = require('playwright');
const path = require('path'), url = require('url');
(async () => {
  const shots = process.argv[2];
  const b = await chromium.launch();
  const out = [], ok = (c, m) => out.push((c ? 'PASS ' : 'FAIL ') + m);
  const open = async file => {
    const p = await b.newPage({viewport:{width:1280, height:720}});
    p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.goto(url.pathToFileURL(path.resolve(__dirname, '../../dist', file)).href);
    await p.waitForTimeout(300);
    await p.evaluate(() => { localStorage.clear(); });
    await p.reload(); await p.waitForTimeout(300);
    await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
    await p.waitForTimeout(100);
    return p;
  };
  const p = await open('aventure.html');
  const T = fn => p.evaluate(fn);
  const run = n => p.evaluate(`(() => { for(let i = 0; i < ${n}; i++) step(); render(1); })()`);

  // première fois : impossible de passer, dure 10 s, le chrono ne tourne pas
  await T(() => { menu.splash = null; playChapter(0); });
  ok(await T(() => state === 'opening' && !OP.skippable), 'chapitre 1 : la cinématique démarre, pas de saut la première fois');
  for(const [name, t] of [['a-aube', 80], ['a-vol', 150], ['b-reveil', 290], ['c-cri', 360], ['d-course', 470], ['e-titre', 585]]){
    const now = await T(() => OP.t);
    await run(t - now);
    if(shots) await p.screenshot({path:path.join(shots, name + '.png')});
    if(name === 'a-aube'){ await T(() => { input.jumpPressed = true; }); await run(2); ok(await T(() => state === 'opening' && !OP.done), 'Espace ne passe pas la première fois'); }
  }
  await run(600 - await T(() => OP.t) - 2);
  ok(await T(() => state === 'opening'), 'encore là juste avant 10 s');
  await run(40);
  ok(await T(() => state === 'play' && chIndex === 0 && rIndex === 0 && fadeDir <= 0), 'le niveau 1 commence après 10 s');
  ok(await T(() => elapsed === 0 && !timerRunning), 'le chrono ne compte pas la cinématique');
  ok(await T(() => save.openingSeen === true), 'la cinématique est retenue comme vue');

  // recommencer après une mort : pas de cinématique
  await T(() => { startChapter(0, false); setState('play'); });
  ok(await T(() => state === 'play'), 'recommencer le chapitre ne la rejoue pas');

  // deuxième fois : Espace passe
  await T(() => { setState('title'); fade = 0; fadeDir = 0; playChapter(0); });
  await run(40);
  ok(await T(() => state === 'opening' && OP.skippable), 'la deuxième fois, on peut passer');
  await T(() => { input.jumpPressed = true; }); await run(40);
  ok(await T(() => state === 'play'), 'Espace passe la cinématique');

  // les autres chapitres n'ont pas de cinématique
  await T(() => { setState('title'); fade = 0; fadeDir = 0; save.unlocked = 2; playChapter(1); });
  ok(await T(() => state === 'play'), 'chapitre 2 : pas de cinématique');
  ok(await T(() => CHAPTERS[BONUS_CH[1]].parTime === 90000), 'Cosmos : temps à battre de 1 min 30');
  ok(!p.errs.length, 'aucune erreur JavaScript (jeu complet) ' + p.errs.join(' | '));

  // démo, avec une sauvegarde qui a fini la saison 1
  const d = await open('demo.html');
  const D = fn => d.evaluate(fn);
  ok(await D(() => { save.bestCh[STORY_END] = 60000; save.unlocked2 = 2; save.s2Done = true; return !s2Visible(); }), 'démo : saison 2 cachée malgré une sauvegarde complète');
  ok(await D(() => { menu.splash = null; menu.page = 'home'; menu.fly = null; menu.flyT = 1; let seen = false; for(let i = 0; i < 4000; i++){ menu.flyT = Math.min(menu.flyT, 1); updateMenu(); if(menu.fly) seen = true; } return !seen; }), 'démo : la pie ne passe jamais');
  ok(await D(() => { for(let i = 0; i < 300; i++) if(/pie|Ma ficelle est bien/.test(homeLine())) return false; return true; }), 'démo : XELIAX ne parle pas de la pie');
  ok(await D(() => { SET.creator = true; const v = s2Visible(); SET.creator = false; return v; }), 'démo : admin connecté, la saison 2 réapparaît');
  // v54 : la pie qui vole quand l'admin se déconnecte disparaît aussitôt (et la bulle qui parle d'elle aussi)
  ok(await D(() => {
    setSetting('creator', true); menu.splash = null; menu.page = 'home'; menu.fly = null; menu.flyT = 1; updateMenu();
    if(!menu.fly) return false;
    menu.bubble = {text:'La pie n’a qu’à bien se tenir !', t:200, max:230, s2:true};
    settingsRows().find(r => r.id === 'admin').act();
    updateMenu();
    let seen = !!menu.fly || !!menu.bubble;
    for(let i = 0; i < 4000; i++){ menu.flyT = Math.min(menu.flyT, 1); updateMenu(); if(menu.fly) seen = true; }
    return !SET.creator && !seen;
  }), 'démo : admin déconnecté pendant que la pie vole, elle disparaît et ne revient pas');
  ok(await D(() => { SET.creatorFound = true; return !jeuRows().some(r => r.id === 'creator'); }), 'démo : pas d\'interrupteur « mode créateur » (seulement la connexion admin)');
  ok(await D(() => { playChapter(0); return state === 'opening'; }), 'démo : la cinématique se joue aussi');
  ok(!d.errs.length, 'aucune erreur JavaScript (démo) ' + d.errs.join(' | '));

  // v54 : jeu complet en mode créateur puis démo dans le même navigateur (même sauvegarde en local)
  await D(() => {
    const s = JSON.parse(localStorage.getItem('platformer_save_v2'));
    s.unlocked = 5; s.unlocked2 = 4; s.s2Done = true; s.bestCh[STORY_END] = 60000;
    s.settings.creator = true; s.settings.creatorFound = true; delete s.settings.demoAdmin;
    s.owned = Object.assign(s.owned || {}, {lave:true}); s.settings.skin = 'galaxie';
    localStorage.setItem('platformer_save_v2', JSON.stringify(s));
  });
  await d.reload(); await d.waitForTimeout(300); await D(() => { window.requestAnimationFrame = () => 0; });
  ok(await D(() => demoOn() && !SET.creator && !s2Visible() && !isUnlocked(S2_FIRST)), 'démo : le mode créateur du jeu complet n\'ouvre pas la démo');
  ok(await D(() => { menu.splash = null; menu.page = 'home'; menu.fly = null; let seen = false; for(let i = 0; i < 4000; i++){ menu.flyT = Math.min(menu.flyT, 1); updateMenu(); if(menu.fly) seen = true; } return !seen; }), 'démo : la pie ne passe pas non plus dans ce cas');
  ok(await D(() => skinOf().id === 'indigo'), 'démo : XELIAX garde la couleur de départ (pas celle du jeu complet)');
  ok(await D(() => { setSetting('creator', true); const st = JSON.parse(localStorage.getItem('platformer_save_v2')).settings; const a = st.creator === true && st.demoAdmin === true && s2Visible();
    setSetting('creator', false); const st2 = JSON.parse(localStorage.getItem('platformer_save_v2')).settings; return a && st2.creator === true && st2.demoAdmin === false && !s2Visible(); }),
    'démo : connexion admin rangée à part, le mode créateur du jeu complet reste intact');
  await d.goto(url.pathToFileURL(path.resolve(__dirname, '../../dist/aventure.html')).href); await d.waitForTimeout(300);   // même navigateur, même sauvegarde
  ok(await D(() => SET.creator === true && s2Visible() && isUnlocked(S2_FIRST)), 'jeu complet : toujours en mode créateur après la démo');
  ok(await D(() => skinOf().id === 'galaxie'), 'jeu complet : la couleur choisie revient');
  ok(!d.errs.length, 'aucune erreur JavaScript (démo puis jeu complet) ' + d.errs.join(' | '));

  console.log(out.join('\n'));
  console.log(`${out.filter(x => x.startsWith('PASS')).length} réussis, ${out.filter(x => x.startsWith('FAIL')).length} échoués`);
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
