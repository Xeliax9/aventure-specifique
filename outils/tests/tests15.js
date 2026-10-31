const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:800}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message + ' ' + (e.stack || '').split('\n')[1])); p.on('console', m => { if(m.type()==='error' && !/ERR_TUNNEL|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
  await p.goto(require('url').pathToFileURL(process.env.GAME || require('path').resolve(__dirname, '../../dist/aventure.html')).href); await p.waitForTimeout(600);
  await p.evaluate(()=>{ window.requestAnimationFrame = () => 0; }); await p.waitForTimeout(150);
  const out = await p.evaluate(()=>{
    const o=[]; const ok = (c, msg) => o.push((c ? 'PASS ' : 'FAIL ') + msg);
    const run=(n)=>{ for(let i=0;i<n;i++){ step(); if(i % 9 === 0) render(0.5); } };
    const go = (ci, ri) => { newRun(ci); fade=0; fadeDir=0; pendingAction=null; loadRoom(ci, ri); setState('play'); bannerT=0; toast.t=0; if(cine) finishCine(); };
    const release = () => { input.left = input.right = input.jumpHeld = false; input.jumpPressed = input.shootPressed = false; };

    // ---- the first double jump: tapping both jumps reaches the practice ledge for most timings
    let okCount = 0, tries = 0;
    for(let k = 3; k <= 16; k++){
      go(0, 1); hasDJ = true; release();
      player.x = 250; player.y = 340 - player.h; player.vy = 0; run(3);
      tries++;
      input.jumpPressed = true; input.jumpHeld = true; step(); input.jumpHeld = false;
      for(let f = 1; f < k; f++) step();
      input.jumpPressed = true; input.jumpHeld = true; step(); input.jumpHeld = false;
      for(let f = 0; f < 60; f++) step();
      if(player.onGround && player.standingOn === platforms[2]) okCount++;
    }
    ok(okCount >= tries - 2, `tapping jump + double jump lands on the practice ledge for ${okCount}/${tries} timings`);
    // a single jump can't
    go(0, 1); hasDJ = false; release(); player.x = 250; player.y = 340 - player.h; run(3);
    input.jumpPressed = true; input.jumpHeld = true; run(70); input.jumpHeld = false; run(20);
    ok(player.standingOn !== platforms[2], 'a single jump does not reach the ledge (the double jump is needed)');

    // ---- idle: questions at 10 s, backflip at 20 s, 3 presses to get up
    go(0, 0); release(); player.x = 100; player.y = 300; run(30);
    const lives0 = lives;
    run(600); ok(idle.phase === 'think', `after 10 s XELIAX wonders (${IDLE_Q[idle.q]})`);
    render(1);
    run(600); ok(idle.phase === 'flip' || idle.phase === 'ko', 'after 20 s he tries a backflip');
    run(60); ok(idle.phase === 'ko', 'he lands on his head (KO)');
    render(1);
    input.left = true; run(30); input.left = false;
    ok(idle.phase === 'ko', 'moving does not wake him');
    for(let i = 0; i < 3; i++){ input.jumpPressed = true; input.jumpHeld = true; step(); input.jumpHeld = false; run(8); }
    run(40);
    ok(idle.phase === '' && idle.bandage > 0, 'three presses of jump: he is back up, with a plaster');
    ok(lives === lives0, 'no life lost');
    input.right = true; const x0 = player.x; run(20); input.right = false;
    ok(player.x > x0 + 20, 'he can move again');
    // moving resets the idle clock
    run(500); input.left = true; step(); input.left = false; run(200);
    ok(idle.phase === '', 'pressing a key resets the idle timer');
    // getting hit while KO wakes him
    go(0, 0); release(); player.x = 100; player.y = 300; run(1300);
    ok(idle.phase === 'ko', 'KO again');
    player.invuln = 0; hurt(0); ok(idle.phase === '', 'a hit wakes him up');

    // ---- the key room (2-3): door locked until the key is picked up
    go(1, 2); ok(solids.length >= 5, 'La Descente: solid floors force the zigzag');

    // ---- bonus chapter
    save.unlocked = 5; save.bestCh[3] = 60000;
    for(let ri = 0; ri < 4; ri++){ go(4, ri); run(30); render(1); }
    ok(true, 'bonus rooms load and draw');
    go(4, 3);
    ok(key && key.kind === 'ficelle' && key.gold, 'Le Sommet: the golden ficelle waits at the top');
    const lv0 = lavaY; run(400); ok(lavaY < lv0, 'the lava rises in Le Sommet');
    player.x = key.x + 6; player.y = key.y - 10; player.vy = 0; run(3);
    ok(finaleT > 0, 'grabbing the golden ficelle starts the finale');
    run(170); render(1);
    ok(state === 'play', 'the finale waits for Space'); pressJump(); run(50); render(1);
    ok(state === 'chapter' && clearInfo.bonus && save.goldFicelle, 'bonus cleared, golden ficelle saved');
    confirmAction(); for(let i = 0; i < 80; i++) step();
    ok(state === 'title', 'back to the title after the bonus');
    // game over in a bonus room restarts that room only
    go(4, 2); lives = 1; player.invuln = 0; hurt(0); ok(state === 'over', 'game over in B-3');
    confirmAction(); for(let i = 0; i < 80; i++) step();
    ok(chIndex === 4 && rIndex === 2 && state === 'play' && lives === startLives(), 'retry restarts B-3 with full lives');
    // old saves that finished chapter 4 have the bonus unlocked
    ok(CHAPTERS.length === 10 && CHAPTERS[4].bonus && CHAPTERS[8].season === 2 && CHAPTERS[9].bonus2, 'season 1 + bonus + season 2 + bonus 2');

    // ---- XELIAX's corner (easter egg)
    toMenu(); fade = 0; fadeDir = 0; for(let i = 0; i < 30; i++) step();
    openPet(); ok(state === 'pet', 'pet mode opens');
    const feed = (i, n = 120) => { petGive(i); for(let f = 0; f < n; f++) step(); render(1); };
    pet.full = 0;
    feed(0); ok(pet.full === 1 && pet.dance >= 0, 'ficelle eaten: belly 1');
    feed(1); feed(2); ok(pet.full === 3, 'baguette + croissant: belly 3');
    feed(3, 90); ok(pet.parts.some(q => q.type === 'pit'), 'olive: he spits the pit');
    for(let f = 0; f < 80; f++) step();
    feed(4, 70); ok(pet.spicy > 0, 'piment: spicy!');
    feed(6, 90); ok(pet.spicy === 0, 'water calms the spice');
    const before = pet.full; feed(5, 60); ok(pet.full === before, 'brocoli refused');
    pet.full = 5; feed(0, 70); ok(pet.full === 5, 'full: refuses even the ficelle');
    petPointer(PET.x - 3.6 * PET.s, PET.y + -24.3 * PET.s); step(); ok(pet.bubble && [...PET_LINES.eye, ...PET_LINES.eye2, ...PET_LINES.hicScare].map(frTypo).includes(pet.bubble.text), 'poking an eye: ' + (pet.bubble && pet.bubble.text));
    petPointer(PET.x, PET.y - 14 * PET.s); step(); ok(pet.bubble && [...PET_LINES.tickle, ...PET_LINES.tickleMax].map(frTypo).includes(pet.bubble.text), 'tickling the belly: ' + (pet.bubble && pet.bubble.text));
    for(let i = 0; i < 8; i++){ petPointer(PET.x, PET.y - 14 * PET.s); step(); }
    ok(pet.crossT > 0, 'too many pokes: he gets annoyed');
    render(1);
    closePet(); for(let i = 0; i < 80; i++) step();
    ok(state === 'title', 'leaving the corner goes back to the title');
    return o;
  });
  console.log(out.join('\n'));
  // real clicks: XELIAX on the title opens his corner, the tray feeds him
  const el = await p.$('#game'); const box = await el.boundingBox();
  const at = (x, y) => [box.x + x * box.width / 640, box.y + y * box.height / 360];
  await p.evaluate(()=>{ toMenu(); fade = 0; fadeDir = 0; goPage('home', -1); for(let i = 0; i < 40; i++) step(); render(1); });
  await p.evaluate(()=>{ pet.full = 0; });
  await p.mouse.click(...at(470, 230));
  await p.evaluate(()=>{ for(let i = 0; i < 80; i++) step(); });
  console.log('click on title XELIAX -> state', await p.evaluate(() => state));
  const tx = await p.evaluate(() => trayX(0) + TRAY.w / 2);
  await p.mouse.click(...at(tx, 320));
  await p.evaluate(()=>{ for(let i = 0; i < 100; i++) step(); });
  console.log('click on the ficelle -> belly', await p.evaluate(() => pet.full));
  console.log('errors', errs);
  await b.close();
})();
