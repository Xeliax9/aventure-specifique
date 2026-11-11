const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:800}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto(require('url').pathToFileURL(process.env.GAME || require('path').resolve(__dirname, '../../dist/aventure.html')).href); await p.waitForTimeout(500);
  await p.evaluate(()=>{ window.requestAnimationFrame = () => 0; localStorage.clear(); save.demoSeen = {slime:1, swoop:1, arena:1, ascent:1, gecko:1, yeti:1, magpie:1}; });
  const out = await p.evaluate(()=>{
    const o=[]; const ok=(c,m)=>o.push((c?'PASS ':'FAIL ')+m);
    const run = (n, f) => { for(let i=0;i<n;i++){ if(f && f(i) === false) return i; step(); if(i%5===0) render(Math.random()); } return n; };
    const clean = () => { fade=0; fadeDir=0; pendingAction=null; };
    const until = (cond, max=3000) => { for(let i=0;i<max;i++){ if(cond()) return i; player.invuln = 99; step(); if(i%7===0) render(1); } return -1; };
    try{
    // ---- season structure
    ok(CHAPTERS.length === 10 && CHAPTERS[5].season === 2 && CHAPTERS[8].num === 4, 'ten chapters, 5..8 are season 2');
    ok(isUnlocked(5) && !isUnlocked(6), 'season 2: chapter 1 open, chapter 2 locked');
    toMenu(); clean(); menuSel = 0; switchSeason(2); ok(menuSel === 0 && MAIN_CH.join() === '0,1,2,3', 'fresh save: season 2 hidden until season 1 is finished');
    save.bestCh[3] = 90000; save.unlocked = 5;
    toMenu(); clean(); menuSel = 0; switchSeason(2); ok(menuSel === 5 && MAIN_CH.slice(4).join() === '5,6,7,8', 'switching to season 2 selects its first app');
    menuMove(-1); ok(seasonOf(menuSel) === 1, '◀ from the first season 2 card goes back to season 1');
    render(1);
    // ---- random play in every season 2 room: no exceptions
    for(let ci = 5; ci < 9; ci++) for(let ri = 0; ri < CHAPTERS[ci].rooms.length; ri++){
      newRun(ci); clean(); loadRoom(ci, ri); lives = 999; setState('play'); hasWall = true; hasDash = true;
      for(let f = 0; f < 1500; f++){
        input.left = Math.random() < 0.3; input.right = !input.left && Math.random() < 0.6;
        if(Math.random() < 0.08){ input.jumpPressed = true; input.jumpHeld = true; } if(Math.random() < 0.05) input.jumpHeld = false;
        if(Math.random() < 0.03) input.dashPressed = true;
        if(Math.random() < 0.03) input.shootPressed = true;
        if(Math.random() < 0.01) interact();
        if(state === 'talk') confirmAction();
        step(); if(f % 5 === 0) render(Math.random());
        if(state === 'ending'){ for(let k = 0; k < 50; k++){ step(); render(1); } break; }
        if(state !== 'play' && state !== 'over' && state !== 'talk') break;
        if(fadeDir){ clean(); exitT = 0; anim.exit = 0; }
      }
    }
    input.left = input.right = input.jumpHeld = false;
    o.push('random play in all season 2 rooms done');

    // ---- 2-1: Gaston gives the suckers at the end of his talk
    newRun(6); clean(); loadRoom(6, 0); setState('play'); cine = null; steal = null; hasWall = false;
    ok(!powerUps.some(p => p.type === 'wall'), '2-1: no suckers lying on the floor');
    { const g = npcs.find(n => n.who === 'gaston2'); player.x = g.x + 4; player.y = g.y - player.h; player.vy = 0; player.onGround = true; for(let i = 0; i < 5; i++){ player.x = g.x + 4; step(); }
      ok(interact() && state === 'talk', 'talking to Gaston');
      for(let i = 0; i < 40 && state === 'talk'; i++){ advanceTalk(); advanceTalk(); }
      ok(state === 'play' && hasWall, 'at the end of the talk, Gaston gives the suckers'); }
    // ---- the gecko: stomp it when it falls, phase 2 it stays stuck on the wall
    newRun(6); clean(); loadRoom(6, CHAPTERS[6].rooms.length - 1); setState('play'); lives = 99;
    ok(cine && cine.kind === 'intro', 'gecko entrance');
    run(330 + READY_DUR + 10);   /* v55 : + « Prêt ? » */ ok(!cine && boss.state === 'crawl', 'gecko crawls on the wall after its entrance (' + boss.state + ')');
    const states = new Set(); let hits = 0; let dmg = 0; const realDamage = bossDamage; bossDamage = function(){ dmg++; return realDamage.apply(this, arguments); };
    for(let round = 0; round < 20 && boss.alive && !boss.dying; round++){
      // phase 2: it is only dazed after 5 shots while on the walls
      const t = until(() => { if(boss.phase === 2 && (boss.state === 'crawl' || boss.state === 'climb') && boss.inv <= 0 && frame % 20 === 0) geckoShot(boss, 1); return (boss.state === 'stun' || boss.state === 'stuck') && boss.inv <= 0 && !cine; }, 2500);
      if(t < 0) break;
      states.add(boss.state);
      player.invuln = 0; player.x = boss.x + boss.w / 2 - player.w / 2; player.y = boss.y - player.h - 30; player.vy = 2; player.onGround = false; player.standingOn = null;
      const hp = boss.hp, ph = boss.phase;
      run(14);
      if(boss.hp < hp || boss.phase > ph || !boss.alive || boss.dying) hits++;
      if(cine){ finishCine(); }
    }
    ok(boss.dying > 0, 'gecko: a death scene plays'); run(130);
    bossDamage = realDamage;
    ok(!boss.alive && dmg === 8, `gecko beaten with 8 hits (${dmg} hits, states seen: ${[...states].join(', ')})`);
    ok(states.has('stun') && states.has('stuck'), 'phase 1 it falls on the floor, phase 2 it is stuck on the wall');
    const rew = powerUps.find(p => p.id === 'boss-reward');
    ok(rew && rew.type === 'dash' && doorLocked(), 'the gecko drops the dash, the door waits for it');
    hasDash = false; player.invuln = 99; player.x = rew.x; player.y = rew.y; player.vy = 0; run(3);
    ok(hasDash && rew.got, 'XELIAX takes the dash');
    ok(!doorLocked(), 'door opens');
    ok(!(CHAPTERS[7].rooms[0].powerUps || []).some(p => p.type === 'dash') && CHAPTERS[7].grants.dash, 'the glacier starts with the dash, no dash pick-up in 3-1');
    // ---- gecko phase 2: goes down every 15 s, acid stays 5 s, 5 real shots daze it at the top of the wall
    newRun(6); clean(); loadRoom(6, CHAPTERS[6].rooms.length - 1); setState('play'); lives = 99; run(330);
    boss.hp = 1; bossDamage(); if(cine) finishCine(); run(5);
    ok(boss.phase === 2, 'gecko phase 2 (' + boss.phase + ')');
    const runStarts = []; let acidEnd = -1, runEnd = -1;
    for(let i = 0; i < 2200; i++){
      player.invuln = 99; player.x = 300; player.y = 150 - player.h; player.vy = 0;
      const st = boss.state; step(); if(i % 7 === 0) render(1);
      if(boss.state === 'prep' && st !== 'prep') runStarts.push(i);
      if(st === 'run' && boss.state === 'climb' && runEnd < 0) runEnd = i;
      if(runEnd >= 0 && acidEnd < 0 && !fires.some(f => f.acid)) acidEnd = i;
    }
    ok(runStarts.length >= 2 && Math.abs(runStarts[1] - runStarts[0] - 900) < 60, 'gecko goes down every 15 s (' + runStarts.join(',') + ')');
    ok(runEnd > 0 && acidEnd - runEnd >= 295 && acidEnd - runEnd <= 305, 'acid stays 5 s after the run (' + (acidEnd - runEnd) + ' frames)');
    // real shots: stand level with it on the wall, facing it
    let got = 0;
    for(let i = 0; i < 1500 && boss.state !== 'stuck' && boss.state !== 'stuckUp'; i++){
      player.invuln = 99;
      if(boss.state === 'crawl' && boss.inv <= 0){
        player.x = boss.side < 0 ? 200 : 420; player.y = boss.y + 6; player.vy = 0; player.facing = boss.side; player.shotCD = 0; player.chargeT = 0;
        canShoot = true; if(i % 12 === 0){ input.shootPressed = true; input.shootHeld = false; }
      }
      const before = boss.shots || 0; step(); if((boss.shots || 0) > before) got++;
    }
    ok(got >= 4 && (boss.state === 'stuckUp' || boss.state === 'stuck'), 'real shots count, it is dazed after 5 (' + got + ' counted, ' + boss.state + ')');
    run(40); ok(boss.state === 'stuck' && Math.abs(boss.y - 40) < 2, 'stuck at the top of the wall (y ' + Math.round(boss.y) + ')');
    // ---- the yeti: stomps do nothing, dash when dizzy
    newRun(7); clean(); loadRoom(7, CHAPTERS[7].rooms.length - 1); setState('play'); lives = 99; hasDash = true;
    run(330 + READY_DUR + 10); ok(!cine && boss.state === 'walk', 'yeti walks after its entrance');
    until(() => boss.state === 'dizzy' && !cine, 1500);
    ok(boss.state === 'dizzy', 'yeti charges into a wall and gets dizzy');
    const hp0 = boss.hp;
    player.invuln = 0; player.x = boss.x + boss.w / 2 - player.w / 2; player.y = boss.y - player.h - 20; player.vy = 2; player.onGround = false; run(10);
    ok(boss.hp === hp0, 'stomping the yeti does nothing (ice helmet)');
    let yhits = 0;
    for(let round = 0; round < 20 && boss.alive && !boss.dying; round++){
      if(until(() => boss.state === 'dizzy' && boss.inv <= 0 && !cine, 2500) < 0) break;
      const d = boss.x + boss.w / 2 < W / 2 ? -1 : 1;     // stand on the open side and dash into it
      player.invuln = 0; player.y = FLOOR - player.h; player.vy = 0; player.onGround = true; player.x = d < 0 ? boss.x + boss.w + 30 : boss.x - 30 - player.w;
      player.dashReady = true; player.dashCD = 0; player.facing = -d; boss.shL = boss.shR = 0;
      input.left = d < 0; input.right = d > 0; input.dashPressed = true;
      const hp = boss.hp, ph = boss.phase;
      run(14); input.left = input.right = false;
      if(boss.hp < hp || boss.phase > ph || !boss.alive || boss.dying) yhits++;
      if(cine) finishCine();
    }
    run(130);
    ok(!boss.alive && yhits === 8, `yeti beaten with 8 dashes (${yhits})`);
    // icicles in phase 2 appeared?
    // ---- the magpie: floor and ceiling, then the ficelle, then the ending
    newRun(8); clean(); loadRoom(8, CHAPTERS[8].rooms.length - 1); setState('play'); lives = 99;
    run(330 + READY_DUR + 10); ok(!cine && boss.state === 'hover', 'magpie hovers after her entrance');
    // every phase: when she is stuck, dash into her -> slammed against the side -> dazed -> 10 shots = 1 life
    let mhits = 0, pushes = 0, shotsFired = 0, stompHurt = false, ceilP1 = true, carried = false;
    for(let round = 0; round < 80 && boss.alive && !boss.dying; round++){
      until(() => !boss.nestT, 300);
      if(boss.phase === 1 && gdir > 0){ setGravity(-1); run(40); }
      if(until(() => boss.state === 'stuck' && boss.inv <= 0 && !cine, 2500) < 0) break;
      const ceil = boss.ceil;
      if(boss.phase === 1 && !ceil) ceilP1 = false;
      const hp = boss.hp, ph = boss.phase;
      // a stomp does nothing
      if(round === 0){
        gdir = ceil ? -1 : 1; player.invuln = 0;
        player.x = boss.x + boss.w / 2 - player.w / 2; player.y = ceil ? boss.y + boss.h + 20 : boss.y - player.h - 20; player.vy = 3 * gdir; player.onGround = false; player.standingOn = null;
        run(10); if(boss.hp < hp) stompHurt = true;
        if(boss.state !== 'stuck') continue;
      }
      // dash into her, towards the nearest side
      const d = boss.x + boss.w / 2 < W / 2 ? -1 : 1;
      gdir = ceil ? -1 : 1; player.y = ceil ? 34 : FLOOR - player.h; player.vy = 0; player.onGround = true; player.invuln = 99;
      player.x = d < 0 ? boss.x + boss.w + 30 : boss.x - 30 - player.w;
      player.dashReady = true; player.dashCD = 0; player.facing = d;
      input.left = d < 0; input.right = d > 0; input.dashPressed = true;
      run(6); input.left = input.right = false;
      if(boss.state !== 'pushed' && boss.state !== 'dazed') continue;
      pushes++;
      until(() => boss.state === 'dazed', 120);
      // stand level with her and shoot until she loses a life or comes round
      const before = boss.shotsLeft;
      for(let i = 0; i < 400 && boss.state === 'dazed' && boss.hp === hp && boss.phase === ph; i++){
        player.invuln = 99; gdir = ceil ? -1 : 1;
        player.y = ceil ? 34 : FLOOR - player.h; player.vy = 0; player.onGround = true;
        player.x = boss.x + boss.w / 2 < W / 2 ? boss.x + boss.w + 60 : boss.x - 60 - player.w; player.facing = boss.x + boss.w / 2 < W / 2 ? -1 : 1;
        canShoot = true; if(player.shotCD <= 0){ input.shootPressed = true; shotsFired++; }
        step(); if(i % 7 === 0) render(1);
      }
      if(round > 0 && before < MAGPIE_SHOTS) carried = true;
      if(boss.hp < hp || boss.phase > ph || !boss.alive || boss.dying) mhits++;
      if(cine) finishCine();
    }
    ok(!stompHurt, 'jumping on the magpie does nothing');
    ok(ceilP1, 'phase 1: she only gets stuck in the ceiling');
    ok(boss.dying > 0 && mhits === 11 && pushes >= 11, `magpie beaten: dash to slam her, then 10 shots per life (${mhits} lives, ${pushes} slams, ${shotsFired} shots)`);
    ok(carried || shotsFired >= 110, 'the shot count is kept between dazes');
    run(70);
    setGravity(1);
    ok(key && key.kind === 'ficelle', 'she drops the ficelle aux olives');
    player.x = key.x > W / 2 ? 40 : W - 70; player.y = FLOOR - player.h; player.vy = 0;
    const ky0 = key.y; run(170); ok(!key.fall && key.y + key.h <= FLOOR, 'it lands on the floor (from y ' + ky0.toFixed(0) + ' to ' + key.y.toFixed(0) + ', fall ' + key.fall + ', vy ' + key.vy.toFixed(2) + ', got ' + key.got + ')');
    player.x = key.x + 6; player.y = FLOOR - player.h; player.vy = 0; run(3);
    ok(finaleT > 0, 'XELIAX grabs it');
    run(90); ok(state === 'play' && finaleT >= 80, 'she waits for Space with the ficelle'); pressJump(); step(); ok(state === 'ending', 'the ending cinematic starts');
    const seen = new Set();
    for(let i = 0; i < 1100 && state === 'ending'; i++){ step(); render(1); seen.add(END.t < END_SHOTS.B ? 'A' : END.t < END_SHOTS.C ? 'B' : END.t < END_SHOTS.D ? 'C' : END.t < END_SHOTS.E ? 'D' : 'E'); }
    ok(seen.size === 5 && state === 'ending' && END.t === END_LEN, `all five shots played (${[...seen].join('')}), the end card waits for Space`);
    run(200); ok(state === 'ending', 'still waiting on the end card');
    pressJump(); step();
    ok(state === 'win', 'Space: the win screen');
    ok(clearInfo && clearInfo.season === 2 && save.s2Done, 'season 2 marked as finished');
    render(1);
    run(60); confirmAction(); run(5); ok(state === 'title' && menu.page === 'credits', 'after the win screen, the credits roll (' + state + ' ' + menu.page + ')'); render(1);
    // second time the ending can be skipped
    startEnding(); run(40); input.jumpPressed = true; run(1); ok(END.t >= END_SHOTS.E, 'the ending can be skipped the second time');
    run(200);
    }catch(e){ o.push('ERROR ' + e.message + ' ' + e.stack.split('\n').slice(0, 3).join(' | ')); }
    return o;
  });
  console.log(out.join('\n')); console.log('errors', errs.slice(0, 5));
  await b.close();
})();
