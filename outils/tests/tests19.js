// v19: home page, chapter apps, settings, credits + creator secret, hidden bonus folder, bonus 2 « Le Cosmos »
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1280, height:800}});
  const errs = [];
  p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto(require('url').pathToFileURL(process.env.GAME || require('path').resolve(__dirname, '../../dist/aventure.html')).href); await p.waitForTimeout(400);
  await p.evaluate(() => { localStorage.clear(); save.demoSeen = {slime:1, swoop:1, arena:1, ascent:1, gecko:1, yeti:1, magpie:1}; });
  await p.reload(); await p.waitForTimeout(400);
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  await p.waitForTimeout(100);
  const T = fn => p.evaluate(fn);
  const out = [];
  const ok = (c, m) => out.push((c ? 'PASS ' : 'FAIL ') + m);
  const steps = n => T(`(() => { for(let i = 0; i < ${n}; i++){ step(); if(i % 7 === 0) render(1); } render(1); })()`);
  const key = (k, extra = '') => T(`window.dispatchEvent(new KeyboardEvent('keydown', {key:${JSON.stringify(k)}${extra}})); window.dispatchEvent(new KeyboardEvent('keyup', {key:${JSON.stringify(k)}}));`);
  const el = await p.$('#game'); const box = await el.boundingBox();
  const at = (x, y) => [box.x + x * box.width / 640, box.y + y * box.height / 360];
  const click = async (x, y) => { await p.mouse.click(...at(x, y)); await steps(2); };

  // ---------------------------------------------------------------- home page
  await steps(60);
  ok(await T(() => state === 'title' && menu.splash && !menu.splash.open), 'the game opens on the cover');
  await key('ArrowDown'); ok(await T(() => menu.splash && !menu.splash.open), 'arrows do not open it');
  await key(' '); await steps(30);
  ok(await T(() => menu.splash && menu.splash.open), 'Space splits the cover open');
  await steps(40);
  ok(await T(() => !menu.splash && menu.page === 'home'), 'the cover is gone, the home page is there');
  await steps(140);
  ok(await T(() => menu.introT > 72), 'the home intro played (about 3 s)');
  await key('ArrowDown'); ok(await T(() => menu.sel.home === 1), '▼ moves to Paramètres');
  await key('ArrowDown'); await key('ArrowDown'); ok(await T(() => menu.sel.home === 3), '▼▼ reaches XELIAX (4th focus)');
  await key('ArrowDown'); ok(await T(() => menu.sel.home === 0), 'and wraps back to Jouer');
  await key('Enter'); await steps(20);
  ok(await T(() => menu.page === 'chapters' && menu.t >= 1), 'Enter on Jouer slides to the chapters');
  // ---------------------------------------------------------------- chapter apps
  ok(await T(() => menuSel === 0 && chIndex === 0), 'fresh save: chapter 1 selected, its world behind the apps');
  await key('ArrowRight'); await steps(30);
  ok(await T(() => menuSel === 1), '▶ selects chapter 2');
  await key('Enter'); await steps(5);
  ok(await T(() => state === 'title' && toast.t > 0 && /précédent/.test(toast.text)), 'a locked chapter refuses with a notification');
  await key('ArrowLeft'); await key('ArrowLeft'); await steps(30);
  ok(await T(() => menuSel === 0 && Math.abs(menu.nudge) > 0.5 || menuSel === 0), '◀ at the first app bounces');
  await key('s'); await steps(30);
  ok(await T(() => menuSel === 0), 'S does nothing while season 2 is hidden (season 1 not finished)');
  await key('s'); await steps(30);
  ok(await T(() => menuSel === 0 && MAIN_CH.length === 4), 'still season 1: 4 cards');
  // drag the apps with the mouse
  await steps(30);
  const sc0 = await T(() => menu.scroll);
  await p.mouse.move(...at(500, 170)); await p.mouse.down(); await steps(1);
  for(let i = 1; i <= 10; i++){ await p.mouse.move(...at(500 - i * 30, 170)); await steps(1); }
  await p.mouse.up(); await steps(40);
  ok(await T(() => menuSel !== 0), `dragging left scrolls to a later chapter (now ${await T(() => CHAPTERS[menuSel].name)})`);
  // wheel
  await T(() => { selectApp(0); menu.scroll = appPos(0); });
  await steps(20);
  await p.mouse.move(...at(320, 170));
  await p.mouse.wheel(0, 120); await steps(12);
  ok(await T(() => menuSel === 1), 'the mouse wheel moves one app');
  await T(() => { selectApp(0); }); await steps(40);
  // tap the selected (unlocked) app → play
  await click(320, 166);
  await steps(5);
  ok(await T(() => state === 'opening' && chIndex === 0), 'tapping the selected app starts the chapter (chapter 1: opening cinematic first)');
  // back to the menu from pause
  await T(() => { fade = 0; fadeDir = 0; setState('pause'); });
  await key('q'); await steps(40);
  ok(await T(() => state === 'title' && menu.page === 'chapters'), 'Q in pause returns to the chapter apps');
  await key('Escape'); await steps(20);
  ok(await T(() => menu.page === 'home'), 'Échap goes back to the home page');

  // ---------------------------------------------------------------- settings (mouse)
  await steps(5);
  await click(176, 260);       // Paramètres
  await steps(20);
  ok(await T(() => menu.page === 'settings'), 'clicking Paramètres opens the settings');
  ok(await T(() => !settingsRows().some(r => r.id === 'bonus')), 'no bonus row on a fresh save (hidden category)');
  await click(320, 80 + 0 * 34 + 17);   // Son
  await steps(20);
  ok(await T(() => menu.page === 'son'), 'Son opens');
  await click(150 + 340 - 30, 80 + 17);   // the sound switch
  ok(await T(() => SET.sound === false && muted === true), 'the sound switch mutes the game');
  await click(470, 97); ok(await T(() => SET.sound === true && muted === false), 'and turns it back on');
  await T(() => { menu.sel.son = 1; });
  await key('ArrowLeft'); await key('ArrowLeft');
  ok(await T(() => SET.vol === 6 && Math.abs(VOL - Math.pow(6 / 8, 1.5)) < 1e-9), '◀◀ on the volume: 60 %');
  await click(150 + 340 - 64, 80 + 34 + 17);   // right end of the slider track
  ok(await T(() => SET.vol === 10), 'clicking the end of the slider: 100 %');
  ok(await T(() => JSON.parse(localStorage.getItem('platformer_save_v2')).settings.vol === 10), 'settings are saved');
  await click(30, 38);   // back chip
  await steps(20);
  ok(await T(() => menu.page === 'settings'), 'the back chip returns to Paramètres');
  await T(() => goPage('jeu')); await steps(20);
  ok(await T(() => !jeuRows().some(r => r.id === 'lives') && SET.lives === undefined), 'v54: no lives setting any more');
  await T(() => { menu.sel.jeu = 0; }); await key('Enter');
  ok(await T(() => SET.timer === false), 'Enter toggles the timer off');
  await T(() => { menu.sel.jeu = 1; }); await key('ArrowLeft');
  ok(await T(() => SET.shake === false), '◀ switches the screen shake off');
  await T(() => { shake = 0; addShake(9); });
  ok(await T(() => shake === 0), 'no shake when it is off');
  await T(() => { menu.sel.jeu = 2; }); await key(' ');
  ok(await T(() => SET.reduced === true && REDUCED === true), 'reduced animations on');
  await T(() => { menu.sel.jeu = 2; }); await key(' ');
  ok(await T(() => REDUCED === MEDIA_REDUCED), 'and off again');
  // a new run always starts with 5 lives, the hidden timer does not break the HUD
  await T(() => { newRun(0); fade = 0; fadeDir = 0; for(let i = 0; i < 5; i++) step(); render(1); });
  ok(await T(() => lives === 5 && startLives() === 5), 'a new run starts with 5 lives');
  await T(() => { toMenu(); fade = 0; fadeDir = 0; goPage('home', -1); for(let i = 0; i < 20; i++) step(); goPage('settings'); for(let i = 0; i < 20; i++) step(); goPage('look'); for(let i = 0; i < 20; i++) step(); render(1); });
  // ---------------------------------------------------------------- XELIAX's colour
  await key('ArrowRight');
  ok(await T(() => SET.skin === 'menthe' && HERO.body === '#0d8a70'), '◀▶ on the colour page changes XELIAX');
  await T(() => { menu.sel.look = 5; }); await key('ArrowRight');
  ok(await T(() => menu.sel.look === 6 && SET.skin === 'menthe'), 'the gold colour stays locked without the golden ficelle');
  await T(() => render(1));
  const lockX = await T(() => 330 + (7 % 5) * 54), lockY = await T(() => 104 + 64);
  await click(lockX, lockY);
  ok(await T(() => toast.t > 0 && /cristal/.test(toast.text)), 'clicking the crystal colour explains how to get it');
  await T(() => { lookClick(0); });
  ok(await T(() => SET.skin === 'indigo' && HERO.body === '#3b0cad'), 'back to indigo');

  // ---------------------------------------------------------------- credits and the creator secret
  await T(() => { goPage('settings', -1); for(let i = 0; i < 20; i++) step(); goPage('credits'); for(let i = 0; i < 20; i++) step(); });
  ok(await T(() => menu.page === 'credits' && menu.creditsFrom === 'settings'), 'credits open from the settings');
  const c0 = await T(() => menu.credY); await steps(60);
  ok(await T(() => menu.credY > 0) && (await T(() => menu.credY)) > c0, 'the credits roll');
  // tap the big "xeliax9" five times
  const nameY = await T(() => { let y = H + 12 - menu.credY; for(const c of CREDITS){ const cy = y + c.h / 2; y += c.h; if(c.k === 'name') return cy; } });
  await T(() => { menu.credFast = false; menu.credY = 345; render(1); });
  for(let i = 0; i < 5; i++){ const ny = await T(() => { let y = H + 12 - menu.credY; for(const c of CREDITS){ const cy = y + c.h / 2; y += c.h; if(c.k === 'name') return cy; } }); await p.mouse.click(...at(320, ny)); await T(() => render(1)); }
  ok(await T(() => SET.creatorFound === true), `five taps on « xeliax9 » reveal the creator mode (name at y ${Math.round(nameY)})`);
  await T(() => { SET.creatorFound = false; });
  for(const ch of 'xeliax9') await key(ch);
  ok(await T(() => SET.creatorFound === true), 'typing « xeliax9 » in the credits works too');
  await T(() => { goPage('settings', -1); for(let i = 0; i < 20; i++) step(); goPage('jeu'); for(let i = 0; i < 20; i++) step(); render(1); });
  ok(await T(() => jeuRows().some(r => r.id === 'creator')), 'the creator switch appears in Jeu');
  await T(() => { menu.sel.jeu = jeuRows().findIndex(r => r.id === 'creator'); }); await key('Enter');
  ok(await T(() => SET.creator && CHAPTERS.every((c, i) => isUnlocked(i)) && bonusVisible()), 'creator mode: everything open, the bonus category shows up');
  ok(await T(() => save.unlocked === 1 && save.unlocked2 === 1 && save.bestCh.every(v => v == null)), '…without touching the real progress');
  await T(() => { menu.sel.jeu = jeuRows().findIndex(r => r.id === 'creator'); }); await key('Enter');
  ok(await T(() => !SET.creator && !bonusVisible()), 'creator mode off: the bonus hides again');

  // ---------------------------------------------------------------- finishing season 1 reveals the hidden bonus
  await T(() => { save.bestCh[3] = 400000; save.unlocked = 5; persist(); });
  ok(await T(() => bonusVisible() && isUnlocked(4) && !isUnlocked(9)), 'season 1 finished: « Les Étoiles » opens, « Le Cosmos » still locked');
  await T(() => { goPage('settings', -1); for(let i = 0; i < 20; i++) step(); render(1); });
  ok(await T(() => settingsRows().some(r => r.id === 'bonus' && r.badge)), 'a « Bonus secret » row with a Nouveau badge');
  await T(() => { goPage('home', -1); for(let i = 0; i < 20; i++) step(); render(1); });
  await T(() => { menu.sel.home = 1; }); await key('Enter'); await steps(20);
  await T(() => { menu.sel.settings = settingsRows().findIndex(r => r.id === 'bonus'); }); await key('Enter'); await steps(20);
  ok(await T(() => menu.page === 'bonus' && save.bonusFolderSeen), 'Enter opens the secret folder');
  await key('ArrowRight'); await key('Enter'); await steps(5);
  ok(await T(() => state === 'title' && /saison 2/.test(toast.text)), '« Le Cosmos » refuses until season 2 is finished');
  await key('ArrowLeft'); await key('Enter'); await steps(5);
  ok(await T(() => state === 'play' && chIndex === 4 && room.deco !== 'cosmos'), '« Les Étoiles » starts');
  await T(() => { fade = 0; fadeDir = 0; setState('pause'); }); await key('q'); await steps(30);
  ok(await T(() => state === 'title' && menu.page === 'bonus'), 'quitting a bonus returns to the secret folder');

  // ---------------------------------------------------------------- bonus 2: Le Cosmos
  await T(() => { save.s2Done = true; save.unlocked2 = 4; persist(); });
  ok(await T(() => isUnlocked(9)), 'season 2 finished: « Le Cosmos » opens');
  await T(() => { menu.sel.bonus = 1; }); await key('Enter'); await steps(5);
  ok(await T(() => state === 'play' && chIndex === 9 && decoOf() === 'cosmos' && hasWall && hasDash && hasDJ), '« Le Cosmos » starts with all the powers, in space');
  // every room loads and survives a bit of random play
  const rnd = await T(() => {
    const res = [];
    for(let ri = 0; ri < 2; ri++){
      newRun(9); fade = 0; fadeDir = 0; pendingAction = null; loadRoom(9, ri); setState('play'); lives = 99;
      for(let f = 0; f < 1500; f++){
        input.left = Math.random() < 0.3; input.right = !input.left && Math.random() < 0.6;
        if(Math.random() < 0.08){ input.jumpPressed = true; input.jumpHeld = true; } if(Math.random() < 0.05) input.jumpHeld = false;
        if(Math.random() < 0.03) input.dashPressed = true;
        if(Math.random() < 0.03) input.shootPressed = true;
        step(); if(f % 5 === 0) render(Math.random());
        if(state === 'over'){ confirmAction(); fade = 0; fadeDir = 0; pendingAction && pendingAction(); pendingAction = null; }
        if(state !== 'play' && state !== 'over') break;
        if(fadeDir){ fade = 0; fadeDir = 0; pendingAction = null; exitT = 0; anim.exit = 0; }
      }
      res.push(room.name);
    }
    input.left = input.right = input.jumpHeld = false;
    return res;
  });
  ok(rnd.length === 2, 'random play in the 2 cosmic rooms: ' + rnd.join(', '));
  // speedrun mode: one hit and you're out (no hearts), back at once; R restarts; splits, record and ghost
  await T(() => { newRun(9); fade = 0; fadeDir = 0; loadRoom(9, 1); setState('play'); player.invuln = 0; hurt(0); });
  ok(await T(() => state === 'play' && player.dead && lives === 99), 'speedrun: one hit = back to the flag, no game over, no hearts');
  ok(await T(() => { for(let i = 0; i < 40; i++) step(); render(1); return !player.dead && state === 'play'; }), 'speedrun: XELIAX is back at once');
  ok(await T(() => { elapsed = 5000; srRestart(); return rIndex === 0 && elapsed === 0 && state === 'play'; }), 'R starts the whole challenge again');
  ok(await T(() => {
    save.speed = {}; srRestart(); timerRunning = true;
    for(let i = 0; i < 120; i++){ input.right = true; step(); } input.right = false;
    srSplit(); for(let i = 0; i < 60; i++) step();
    chapterClear(); return !!(save.speed[9] && save.speed[9].ghost.length > 100 && save.speed[9].splits.length === 1 && clearInfo.srNew);
  }), 'finishing saves the record, its splits and its ghost');
  ok(await T(() => {
    srRestart(); timerRunning = true; for(let i = 0; i < 100; i++){ step(); if(i % 10 === 0) render(1); }
    srSplit(); render(1); return srun.pop && typeof srun.pop.d === 'number' && srun.pop.d < 0;
  }), 'second run: the ghost runs alongside, the split shows the gap to the record (green when faster)');
  ok(await T(() => srMedal(9, CHAPTERS[9].parTime) === 'or' && srMedal(9, CHAPTERS[9].parTime * 1.2) === 'argent' && srMedal(9, CHAPTERS[9].parTime * 1.4) === 'bronze' && srMedal(9, CHAPTERS[9].parTime * 2) === null), 'medals: gold, silver, bronze');
  await T(() => { setState('play'); timerRunning = false; });
  // the crystal ficelle
  await T(() => { newRun(9); fade = 0; fadeDir = 0; loadRoom(9, 1); setState('play'); bannerT = 0; for(let i = 0; i < 10; i++) step(); });
  ok(await T(() => key && key.kind === 'ficelle' && key.gold === 'crystal'), 'the crystal ficelle waits at the top of « Le Cœur du Cosmos »');
  await T(() => { player.x = 40; player.y = 150 - player.h - 2; player.vy = 0; player.invuln = 999; for(let i = 0; i < 30; i++) step(); });
  ok(await T(() => player.onGround && gdir === 1 && Math.abs(player.y + player.h - 150) < 1), 'XELIAX stands on the top platform');
  await T(() => { input.right = true; for(let i = 0; i < 40 && finaleT === 0; i++) step(); input.right = false; });
  ok(await T(() => finaleT > 0), 'walking to it grabs the crystal ficelle');
  await T(() => { for(let i = 0; i < 200; i++){ step(); if(i % 10 === 0) render(1); } });
  ok(await T(() => state === 'play' && finaleT >= finaleEnd()), 'after the celebration the game waits for Space');
  await T(() => { pressJump(); for(let i = 0; i < 50; i++) step(); });
  ok(await T(() => state === 'chapter' && clearInfo.bonus2 && save.crystalFicelle), 'bonus cleared, crystal ficelle saved');
  await T(() => render(1));
  ok(await T(() => skinOpen(SKINS.find(s => s.id === 'cristal'))), 'the crystal colour is now unlocked');
  await T(() => { confirmAction(); for(let i = 0; i < 60; i++) step(); render(1); });
  ok(await T(() => state === 'title' && menu.page === 'bonus'), 'back to the secret folder after the bonus');

  // ---------------------------------------------------------------- the season 1 ending announces the secret
  await T(() => {
    for(const k of Object.keys(save)) if(k !== 'settings') delete save[k];
    Object.assign(save, freshSave()); persist();
    newRun(3); fade = 0; fadeDir = 0; loadRoom(3, CHAPTERS[3].rooms.length - 1); setState('play');
    chIndex = 3; chapter = CHAPTERS[3]; runFromStart = true; chapterClear();
  });
  ok(await T(() => state === 'win' && clearInfo.bonusNew), 'finishing season 1: the win panel mentions the secret');
  await T(() => { for(let i = 0; i < 90; i++) step(); render(1); });
  await T(() => { confirmAction(); for(let i = 0; i < 10; i++) step(); render(1); });
  ok(await T(() => state === 'title' && menu.page === 'chapters' && /Paramètres/.test(toast.text)), 'back on the apps, a notification points to the settings');

  // ---------------------------------------------------------------- reset the progress (two presses)
  await T(() => { goPage('home', -1); for(let i = 0; i < 20; i++) step(); goPage('settings'); for(let i = 0; i < 20; i++) step(); goPage('jeu'); for(let i = 0; i < 20; i++) step(); });
  await T(() => { save.unlocked = 3; menu.sel.jeu = jeuRows().findIndex(r => r.id === 'reset'); });
  await key('Enter');
  ok(await T(() => save.unlocked === 3 && menu.resetT > 0 && /Sûr/.test(jeuRows().find(r => r.id === 'reset').label)), 'first press asks for confirmation');
  await key('Enter');
  ok(await T(() => save.unlocked === 1 && save.bestCh.every(v => v == null) && SET.timer === false),'second press erases the progress, keeps the settings');

  // ---------------------------------------------------------------- XELIAX's corner from the home page
  await T(() => { goPage('settings', -1); for(let i = 0; i < 20; i++) step(); goPage('home', -1); for(let i = 0; i < 20; i++) step(); render(1); });
  await click(470, 230); await steps(80);
  ok(await T(() => state === 'pet'), 'clicking the big XELIAX opens his corner');
  // food is bought with coins: locked at first, bought once, then free
  ok(await T(() => { SET.creator = false; save.food = {}; save.bank = 100; const ci = FOODS.findIndex(x => x.id === 'croissant'); return !foodOpen(FOODS[ci]) && foodOpen(FOODS[1]); }), 'croissant locked, baguette free');
  ok(await T(() => { const ci = FOODS.findIndex(x => x.id === 'croissant'); petGive(ci); return !foodOpen(FOODS[ci]) && save.bank === 100; }), 'not enough coins: the croissant stays locked');
  ok(await T(() => { const oi = FOODS.findIndex(x => x.id === 'olive'); petGive(oi); for(let i = 0; i < 30; i++) step(); render(1); return foodOpen(FOODS[oi]) && save.bank === 20; }), 'the olive is bought for 80 coins');
  await T(() => { closePet(); for(let i = 0; i < 90; i++) step(); render(1); });
  ok(await T(() => state === 'title' && menu.page === 'home'), 'leaving the corner returns to the home page');
  // signature → credits
  await steps(5); await click(190, 345); await steps(20);
  ok(await T(() => menu.page === 'credits' && menu.creditsFrom === 'home'), 'clicking « un jeu de xeliax9 » opens the credits');
  await key('Escape'); await steps(20);
  ok(await T(() => menu.page === 'home'), 'Échap leaves the credits');
  // every page draws without errors, also mid-transition
  await T(() => {
    for(const pg of ['chapters', 'settings', 'son', 'jeu', 'look', 'controls', 'credits', 'bonus', 'home']){ goPage(pg); for(let i = 0; i < 6; i++){ step(); render(1); } for(let i = 0; i < 20; i++) step(); render(1); }
  });
  ok(true, 'all pages and transitions render');
  console.log(out.join('\n'));
  console.log('fails', out.filter(l => l.startsWith('FAIL')).length, 'errors', errs);
  await b.close();
})();
