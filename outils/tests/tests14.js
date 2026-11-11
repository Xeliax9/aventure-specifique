const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:800}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console', m => { if(m.type()==='error') errs.push('console: ' + m.text()); });
  await p.goto(require('url').pathToFileURL(process.env.GAME || require('path').resolve(__dirname, '../../dist/aventure.html')).href); await p.waitForTimeout(600);
  const out = await p.evaluate(()=>{
    const o=[]; const run=(n,r=7)=>{for(let i=0;i<n;i++){step(); if(i%r===0) render(0.5);}};
    const ok = (c, msg) => o.push((c ? 'PASS ' : 'FAIL ') + msg);
    const clean = () => { fade=0; fadeDir=0; pendingAction=null; };
    // v55 : après la présentation d'un boss vient « Prêt ? » (les cœurs se remplissent) : on passe les deux
    const skipIntro = () => { finishCine(); if(cine && cine.kind === 'ready') finishCine(); };
    input.left = input.right = false;
    save.demoSeen = {slime:1, swoop:1, arena:1, ascent:1, gecko:1, yeti:1, magpie:1};
    // ---- random play in every room (no exceptions allowed)
    for(let ci=0;ci<CHAPTERS.length;ci++) for(let ri=0;ri<CHAPTERS[ci].rooms.length;ri++){
      newRun(ci); clean(); loadRoom(ci,ri); lives=999; setState('play');
      try{
        for(let f=0;f<1400;f++){
          input.left = Math.random()<0.3; input.right = !input.left && Math.random()<0.6;
          if(Math.random()<0.08){ input.jumpPressed=true; input.jumpHeld=true; } if(Math.random()<0.05) input.jumpHeld=false;
          if(Math.random()<0.05) input.shootPressed=true;
          if(Math.random()<0.02) interact();
          if(state === 'talk' && Math.random() < 0.2) confirmAction();
          step(); if(f%5===0) render(Math.random());
          if(state!=='play' && state!=='over' && state!=='talk') break;
          if(fadeDir){ clean(); exitT=0; anim.exit=0; }
        }
      }catch(e){ o.push(`${ci+1}-${ri+1} ERROR ${e.message} ${e.stack.split('\n')[1]}`); }
    }
    input.left = input.right = input.jumpHeld = false;
    o.push('random rooms done');

    // ---- boss intro cinematic: 5 s, no attacks, no damage, clock paused, controls locked
    seenCine.clear();
    newRun(1); clean(); loadRoom(1,3); lives=5; setState('play'); timerRunning = true;
    ok(cine && cine.kind === 'intro' && cine.dur === 300 && !cine.skippable, 'slime intro cinematic starts (300 frames, not skippable the first time)');
    const t0 = elapsed, x0 = player.x;
    input.right = true; hurt(0); run(150); input.right = false;
    ok(lives === 5, 'hurt() ignored during the cinematic');
    ok(Math.abs(player.x - x0) < 1, 'XELIAX cannot walk during the cinematic');
    ok(elapsed === t0, 'timer paused during the cinematic');
    ok(bullets.length === 0, 'boss does not attack during the cinematic');
    run(170);
    ok(cine && cine.kind === 'ready' && boss.onGround && boss.y + boss.h === FLOOR, 'intro ends after ~5 s with the slime on the floor, then « Prêt ? »');
    { const bx = boss.x, by = boss.y, hop = boss.hopT, px = player.x; input.right = true; const fills = [];
      let moved = false;
      for(let i = 0; cine && i < 200; i++){ step(); if(cine){ fills.push(heartFill); if(boss.x !== bx || boss.y !== by || Math.abs(player.x - px) > 1) moved = true; } }
      input.right = false;
      ok(!moved && fills.length > 60, '« Prêt ? » : the boss and XELIAX do not move');
      ok(fills.includes(1) && fills.includes(2) && fills.includes(4) && lives === 5, '« Prêt ? » : the hearts fill one by one (' + [...new Set(fills)].join(',') + ')');
      ok(cine === null && heartFill === null && fightPop > 0, 'then « Combat ! »');
      run(80); ok(boss.hopT !== hop || boss.x !== bx || boss.y !== by, 'the boss moves again after « Combat ! »'); }
    run(10); ok(elapsed > t0, 'timer runs again after the cinematic');
    // second time: skippable
    loadRoom(1,3); setState('play'); ok(cine && cine.skippable, 'intro skippable the second time');
    run(25); input.jumpPressed = true; run(1); run(25);
    ok(cine && cine.kind === 'ready', 'skip with jump ends it quickly (then « Prêt ? »)');

    // ---- owl: stomping while it flies back up, or landing on its head while it hovers, never hurts
    newRun(2); clean(); loadRoom(2,4); setState('play'); skipIntro(); lives=5; player.invuln=0; powerUps = [];
    boss.state='rise'; boss.inv=0; boss.x=300; boss.y=220; const hpA = boss.hp;
    player.x = boss.x + 17; player.y = boss.y - player.h - 1; player.vy = 3; player.onGround=false; player.standingOn=null;
    step();
    ok(lives === 5 && player.vy < 0 && boss.hp === hpA, `landing on the rising owl bounces, no damage either way (lives ${lives}, vy ${player.vy.toFixed(1)}, hp ${boss.hp})`);
    boss.state='rise'; boss.inv=0; boss.y=260; player.invuln=0; player.x = boss.x + boss.w - 4; player.y = boss.y + 8; player.vy = 0; player.vx = 0;
    step();
    ok(lives === 5, 'touching the rising owl from the side is harmless');
    boss.state='hover'; boss.stT=999; boss.inv=0; boss.y=120; player.invuln=0; player.x = boss.x + 17; player.y = boss.y - player.h - 1; player.vy = 3;
    step();
    ok(lives === 5 && boss.state === 'grab' && player.held, 'landing on the hovering owl: it grabs XELIAX (v52)');
    player.held = false; player.slam = false;
    boss.state='hover'; boss.y=120; player.invuln=0; player.x = boss.x + 20; player.y = boss.y + 10; player.vy = -2;
    step();
    ok(lives === 4, 'hitting the hovering owl from below still hurts');
    // stunned stomp still scores
    boss.state='stunned'; boss.stT=999; boss.inv=0; boss.y = FLOOR - boss.h; player.invuln=0; const hpB = boss.hp;
    player.x = boss.x + 17; player.y = boss.y - player.h - 1; player.vy = 3; step();
    ok(boss.hp === hpB - 1 && boss.state === 'rise', 'stomping the stunned owl hits it');

    // ---- owl phase 2 (v52): no spikes, the side platforms turn fragile
    newRun(2); clean(); loadRoom(2,4); setState('play'); skipIntro(); lives=5; powerUps = [];
    boss.hp=1; boss.state='stunned'; boss.stT=999; boss.inv=0; boss.x=292; boss.y=FLOOR-boss.h;
    player.invuln=0; player.x = boss.x + 17; player.y = boss.y - player.h - 1; player.vy = 3; player.onGround=false;
    step();
    ok(boss.phase === 2 && cine && cine.kind === 'phase2', 'last phase-1 hit starts the phase-2 cinematic');
    ok(spikes.length === 0, 'no spikes in phase 2');
    run(280);
    ok(cine === null && !player.dead && lives === 5, `phase-2 cinematic over, XELIAX alive (lives ${lives})`);
    ok(platforms.filter(p => p.p2crumble).length === 2 && platforms.filter(p => p.p2crumble).every(p => p.crumble && p.back === 600), 'side platforms are fragile, back after 10 s');

    // ---- owl phase 2 (v52): a bomb breaks a fragile platform at once, it comes back after 10 s; the middle one holds
    const sidePl = platforms.find(p => p.p2crumble), midPl = platforms.find(p => p.y === 176);
    const dropBomb = q => bullets.push({x:q.x + 40, y:q.y - 20, w:12, h:12, vx:0, vy:2, grav:0.12, kind:'bomb'});
    boss.state = 'rise'; boss.y = 300; player.x = 20; player.y = FLOOR - player.h; player.invuln = 9999;
    dropBomb(sidePl); run(12);
    ok(sidePl.gone, 'a bomb breaks the fragile side platform');
    dropBomb(midPl); run(12);
    ok(!midPl.gone, 'the middle platform survives bombs');
    let backF = 0; while(sidePl.gone && backF < 700){ boss.state = 'rise'; boss.y = 300; step(); backF++; }
    ok(backF > 560 && backF <= 600, `the broken platform comes back after 10 s (${backF} frames)`);

    // ---- owl sweep (v52): random attacks, never three of a kind, both sides, U-turn in phase 2 only
    const sides = new Set(); let seq = '', maxRun = 0, curRun = 0, last = '';
    newRun(2); clean(); loadRoom(2,4); setState('play'); skipIntro(); bossDemo = null; powerUps = []; player.x = 20; player.y = FLOOR - player.h;
    for(let i = 0; i < 300; i++){
      boss.state = 'hover'; boss.stT = 1; boss.fireT = 999; step();
      const a = boss.state === 'warn' ? 'd' : 's';
      if(a === 's') sides.add(boss.sx);
      seq += a; curRun = a === last ? curRun + 1 : 1; last = a; maxRun = Math.max(maxRun, curRun);
    }
    ok(seq[0] === 'd' && seq.includes('s') && maxRun <= 2, `attacks are mixed, at most 2 in a row (${seq.slice(0, 16)})`);
    ok(sides.size === 2, 'the sweep starts from either side');
    const sweepRun = phase => { boss.phase = phase; boss.state = 'sweep'; boss.x = 300; boss.vx = phase === 2 ? 9 : 7; boss.turned = false; boss.turnT = 0; boss.y = FLOOR - boss.h - 6; player.invuln = 9999;
      let n = 0, t = false; while(boss.state === 'sweep' && n < 300){ step(); if(boss.turned) t = true; n++; } return t; };
    let u1 = 0, u2 = 0; for(let i = 0; i < 40; i++){ if(sweepRun(1)) u1++; if(sweepRun(2)) u2++; }
    ok(u1 === 0 && u2 > 5 && u2 < 35, `U-turn in phase 2 only (phase 1: ${u1}/40, phase 2: ${u2}/40)`);
    ok(boss.state === 'rise', 'the sweep always ends');

    // ---- talking: Mamie Farine teaches step 1
    save.recipe = [false,false,false,false];
    newRun(0); clean(); loadRoom(0,0); setState('play'); bannerT = 0;
    const n0 = npcs[0];
    player.x = n0.x + 13 - player.w/2 + 6; player.y = n0.y - player.h; player.vy = 0;
    run(12);
    ok(nearNpc === n0, 'standing next to Mamie Farine shows the prompt');
    ok(interact() && state === 'talk', 'E opens the conversation');
    run(30); render(1);
    let guard = 0; while(state === 'talk' && guard++ < 50){ confirmAction(); run(3); }
    ok(state === 'play' && save.recipe[0] === true, 'finishing the conversation teaches step 1');
    ok(toast.text.startsWith('Recette apprise'), 'toast: ' + toast.text);
    ok(JSON.parse(localStorage.getItem(SAVE_KEY)).recipe[0] === true, 'recipe saved');
    // every NPC line fits in three lines of the dialog box
    ctx.font = `500 14.5px ${FU}`;
    let maxLines = 0, worst = '';
    for(const k in NPCS) for(const L of NPCS[k].lines){ const n = wrapLines(L, (20 + (W - 40) - 22) - (20 + 112)).length; if(n > maxLines){ maxLines = n; worst = L.slice(0, 40); } }
    ok(maxLines <= 3, `dialog lines wrap to at most ${maxLines} lines (${worst}…)`);
    // NPCs exist where planned
    const where = [];
    for(let ci=0;ci<4;ci++) CHAPTERS[ci].rooms.forEach((r, ri) => (r.npcs||[]).forEach(n => where.push(`${n.who}@${ci+1}-${ri+1}`)));
    o.push('npcs: ' + where.join(', '));

    // ---- final boss rules still hold (shield), escape + finale
    newRun(3); clean(); loadRoom(3,2); setState('play'); skipIntro(); lives=99; canShoot=true;
    o.push(`arena hp=${boss.maxHp}`);
    { let minX = 1e9; for(let i = 0; i < 700; i++){ player.invuln = 99; step(); minX = Math.min(minX, boss.x); } ok(minX < 160, 'phase 1: he changes side (min x ' + Math.round(minX) + ')'); }
    const shootAt = () => shots.push({x:boss.x + 10, y:boss.y + 10, w:10, h:5, vx:0, vy:0});
    shootAt(); step(); const hp1 = boss.hp; shootAt(); step(); const hp2 = boss.hp;
    run(60); shootAt(); step(); const hp3 = boss.hp;
    ok(hp1 === boss.maxHp - 1 && hp2 === boss.maxHp - 1 && hp3 === boss.maxHp - 2, `shield: ${hp1}, ${hp2}, ${hp3} (of ${boss.maxHp})`);
    for(let i=0;i<20 && boss.hp>0;i++){ boss.inv=0; shootAt(); step(); }
    for(let i=0;i<300 && !(rIndex===3);i++){ step(); }
    for(let i=0;i<40;i++) step();
    ok(rIndex === 3 && cine && cine.kind === 'intro', 'ascent room starts with its own entrance');
    run(320 + READY_DUR + 10);
    ok(cine === null && Math.abs(boss.y - 880) < 60, `ascent intro done, boss at y ${boss.y.toFixed(0)}`);
    ok(Math.abs(player.x - 309) < 40 && player.y > 950 && room.hotFloor.x0 === 0 && room.hotFloor.lava, 'phase 2: XELIAX starts on the small central ledge, the whole floor is lava (x ' + Math.round(player.x) + ')');
    lives=99; for(let i=0;i<30 && boss.alive && !boss.dying;i++){ boss.inv=0; bossDamage(); step(); }
    // v55 : sa fin : gros plan, « Nonnnn, tu vas le payerrr !! », la lave monte, XELIAX ne bouge pas, puis l'envol
    { const seen = {z:false, shout:false, lava:1e9, px:null, moved:false}; let launched = false;
      input.right = true;
      for(let i = 0; i < 260 + ASCENT_OUTRO && !(launched && !launch); i++){
        if(bossOutro()){ if(camZoom.z > 1.5) seen.z = true; if(boss.shout) seen.shout = true; seen.lava = Math.min(seen.lava, lavaY); if(seen.px === null) seen.px = player.x; else if(Math.abs(player.x - seen.px) > 1) seen.moved = true; }
        step(); if(i % 9 === 0) render(0.5); if(launch) launched = true; }
      input.right = false;
      ok(seen.z && seen.shout, 'final boss beaten: close-up and his shout');
      ok(seen.lava < room.hotFloor.y - 10, 'the lava starts rising during the scene (y ' + Math.round(seen.lava) + ')');
      ok(!seen.moved, 'XELIAX cannot move during the scene');
      ok(camZoom.z === 1, 'the camera is back to normal');
      run(10); ok(launched && player.onGround && Math.abs(player.y + player.h - 805) < 3, 'escape: the lava throws XELIAX onto a ledge (y ' + Math.round(player.y + player.h) + ')');
      const lv = lavaY; run(60); ok(lv - lavaY > 35, 'the lava rises fast (' + (lv - lavaY).toFixed(0) + ' px in 1 s)'); }
    // v55 : mort pendant la fuite : on reprend au début de la fuite (pas le boss), cœurs pleins, pas de « Prêt ? »
    { const c0 = continues; lives = 1; player.invuln = 0; killPlayer(); ok(state === 'over', 'game over during the escape');
      confirmAction(); run(30);
      ok(rIndex === 3 && !boss.alive && currentPhase() === 'escape' && lives === 5 && !cine && heartFill === null && continues === c0 + 1, `escape retry: the escape again, not the boss (room ${rIndex + 1}, lives ${lives})`);
      for(let i = 0; i < 120 && launch; i++) step(); run(5);
      ok(Math.abs(player.y + player.h - 805) < 3, 'escape retry: thrown onto the ledge again'); }
    run(130); ok(!boss.alive, 'the death scene ends'); ok(key && key.kind === 'ficelle', 'escape: ficelle waits at the top');
    player.x = key.x + 6; player.y = key.y - 10; player.vy = 0; run(3);
    ok(finaleT > 0, 'finale started'); run(STEAL_END - 30); pressJump(); step(); ok(state === 'play', 'Space does nothing before the end of the scene'); run(60); ok(state === 'play' && finaleT >= finaleEnd() && steal && steal.got, 'the magpie steals the ficelle, then the finale waits for Space'); pressJump(); step(); ok(state === 'win', 'win screen');
    render(1);
    // game over rules (v55 : dans une salle de boss, tout le combat recommence, à la phase 1, cœurs pleins)
    newRun(0); clean(); loadRoom(0,2); setState('play'); lives=1; killPlayer(); confirmAction(); run(60); ok(chIndex===0 && rIndex===0, 'normal game over -> start of chapter');
    newRun(1); clean(); loadRoom(1,3); setState('play'); skipIntro(); lives=99;
    for(let i=0;i<3;i++){ boss.inv=0; bossDamage(); run(3); }
    ok(boss.phase === 2 && cine && cine.kind === 'phase2', 'slime phase 2 has its cinematic');
    skipIntro(); lives=1; player.invuln=0; hurt(0); ok(state === 'over', 'game over in phase 2');
    confirmAction(); run(60);
    ok(boss.phase === 1 && boss.hp === room.boss.hp && lives === 5 && cine && cine.kind === 'intro' && cine.skippable && heartFill === 0, `slime retry: phase 1, full hp (${boss.hp}), 5 hearts (shown empty until « Prêt ? »)`);
    skipIntro(); ok(boss.phase === 1 && lives === 5 && !cine, 'slime retry: the fight starts at phase 1');
    // the Gardien: death in phase 2 -> phase 1, fragile platforms solid again, no phase-2 spikes
    newRun(2); clean(); loadRoom(2,4); setState('play'); skipIntro(); boss.hp=1; boss.inv=0; bossDamage(); skipIntro();
    ok(boss.phase === 2 && platforms.filter(p => p.p2crumble).every(p => p.crumble), 'owl phase 2: side platforms fragile');
    lives=1; player.invuln=0; hurt(0); confirmAction(); run(60);
    ok(boss.phase === 1 && boss.hp === 5 && boss.maxHp === 5 && lives === 5 && platforms.filter(p => p.p2crumble).every(p => !p.crumble && !p.gone), `owl retry: phase 1, ${boss.hp}/${boss.maxHp} hp, 5 hearts, side platforms solid again`);
    { skipIntro(); const bx = boss.x; run(30); ok(cine === null && boss.phase === 1, 'owl retry: the fight is on again'); }
    // pause, R in a boss room: the same (phase 1, full hearts), and it is not a « continue »
    newRun(2); clean(); loadRoom(2,4); setState('play'); skipIntro(); boss.hp=1; boss.inv=0; bossDamage(); skipIntro();
    lives = 2; { const c0 = continues; setState('pause'); pauseRestart(); for(let i = 0; i < 40 && fadeDir !== 0; i++) step(); run(5);
      ok(boss.phase === 1 && boss.hp === 5 && lives === 5 && continues === c0 && cine && cine.kind === 'intro', `pause restart: whole fight again, 5 hearts (continues ${continues - c0})`); }
    // the final boss: death in L'Ascension (his phase 2) -> back to phase 1 (the arena room)
    newRun(3); clean(); loadRoom(3,3); setState('play'); skipIntro(); lives=1; player.invuln=0; hurt(0); ok(state === 'over', 'game over in the ascent');
    confirmAction(); run(60);
    ok(rIndex === 2 && boss && boss.mode === 'arena' && boss.hp === boss.maxHp && lives === 5, `final boss retry: back to phase 1 (room ${rIndex + 1}, ${boss && boss.mode})`);
    // v55 : the Gardien drops the weapon, the door waits until XELIAX takes it, chapter 4 starts armed
    newRun(2); clean(); loadRoom(2,4); setState('play'); skipIntro(); canShoot = false; lives = 99; player.invuln = 9999;
    boss.hp = 1; boss.inv = 0; bossDamage(); skipIntro(); boss.hp = 1; boss.inv = 0; bossDamage();
    for(let i = 0; i < 300 && boss.alive; i++) step();
    { const r = powerUps.find(p => p.id === 'boss-reward');
      ok(!boss.alive && r && r.type === 'shoot' && doorLocked(), 'Gardien beaten: he drops the weapon, the door waits');
      player.x = r.x; player.y = r.y; player.vy = 0; step(); step();
      ok(canShoot && !doorLocked(), 'weapon taken: XELIAX can shoot, the door opens'); }
    newRun(3); ok(canShoot && !(CHAPTERS[3].rooms[0].powerUps || []).some(p => p.type === 'shoot'), 'chapter 4 starts armed, no weapon to pick up in 4-1');
    return o;
  });
  console.log(out.join('\n')); console.log('errors', errs);
  await b.close();
})();
