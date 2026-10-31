const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:800}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto(require('url').pathToFileURL(process.env.GAME || require('path').resolve(__dirname, '../../dist/aventure.html')).href); await p.waitForTimeout(500);
  await p.evaluate(()=>{ window.requestAnimationFrame = () => 0; localStorage.clear(); });
  const out = await p.evaluate(()=>{
    const o=[]; const ok=(c,m)=>o.push((c?'PASS ':'FAIL ')+m);
    const run = (n, f) => { for(let i=0;i<n;i++){ if(f && f(i) === false) return i; step(); if(i%5===0) render(Math.random()); } return n; };
    const clean = () => { fade=0; fadeDir=0; pendingAction=null; };
    const until = (cond, max=3000) => { for(let i=0;i<max;i++){ if(cond()) return i; player.invuln = 99; step(); if(i%7===0) render(1); } return -1; };
    try{
    // ---- season structure
    ok(CHAPTERS.length === 10 && CHAPTERS[5].season === 2 && CHAPTERS[8].num === 4, 'ten chapters, 5..8 are season 2');
    ok(isUnlocked(5) && !isUnlocked(6), 'season 2: chapter 1 open, chapter 2 locked');
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

    // ---- the gecko: stomp it when it falls, phase 2 it stays stuck on the wall
    newRun(6); clean(); loadRoom(6, 3); setState('play'); lives = 99;
    ok(cine && cine.kind === 'intro', 'gecko entrance');
    run(330); ok(!cine && boss.state === 'crawl', 'gecko crawls on the wall after its entrance (' + boss.state + ')');
    const states = new Set(); let hits = 0;
    for(let round = 0; round < 8 && boss.alive && !boss.dying; round++){
      const t = until(() => (boss.state === 'stun' || boss.state === 'stuck') && boss.inv <= 0 && !cine, 2500);
      if(t < 0) break;
      states.add(boss.state);
      player.invuln = 0; player.x = boss.x + boss.w / 2 - player.w / 2; player.y = boss.y - player.h - 30; player.vy = 2; player.onGround = false; player.standingOn = null;
      const hp = boss.hp, ph = boss.phase;
      run(14);
      if(boss.hp < hp || boss.phase > ph || !boss.alive || boss.dying) hits++;
      if(cine){ finishCine(); }
    }
    ok(boss.dying > 0, 'gecko: a death scene plays'); run(130);
    ok(!boss.alive && hits === 6, `gecko beaten with 6 stomps (states seen: ${[...states].join(', ')})`);
    ok(states.has('stun') && states.has('stuck'), 'phase 1 it falls on the floor, phase 2 it is stuck on the wall');
    ok(!doorLocked(), 'door opens');
    // ---- the yeti: stomps do nothing, dash when dizzy
    newRun(7); clean(); loadRoom(7, 3); setState('play'); lives = 99; hasDash = true;
    run(330); ok(!cine && boss.state === 'walk', 'yeti walks after its entrance');
    until(() => boss.state === 'dizzy' && !cine, 1500);
    ok(boss.state === 'dizzy', 'yeti charges into a wall and gets dizzy');
    const hp0 = boss.hp;
    player.invuln = 0; player.x = boss.x + boss.w / 2 - player.w / 2; player.y = boss.y - player.h - 20; player.vy = 2; player.onGround = false; run(10);
    ok(boss.hp === hp0, 'stomping the yeti does nothing (ice helmet)');
    let yhits = 0;
    for(let round = 0; round < 10 && boss.alive && !boss.dying; round++){
      if(until(() => boss.state === 'dizzy' && boss.inv <= 0 && !cine, 2500) < 0) break;
      const d = boss.x + boss.w / 2 < W / 2 ? -1 : 1;     // stand on the open side and dash into it
      player.invuln = 0; player.y = FLOOR - player.h; player.vy = 0; player.onGround = true; player.x = d < 0 ? boss.x + boss.w + 30 : boss.x - 30 - player.w;
      player.dashReady = true; player.dashCD = 0; player.facing = -d;
      input.left = d < 0; input.right = d > 0; input.dashPressed = true;
      const hp = boss.hp, ph = boss.phase;
      run(14); input.left = input.right = false;
      if(boss.hp < hp || boss.phase > ph || !boss.alive || boss.dying) yhits++;
      if(cine) finishCine();
    }
    run(130);
    ok(!boss.alive && yhits === 6, `yeti beaten with 6 dashes (${yhits})`);
    // icicles in phase 2 appeared?
    // ---- the magpie: floor and ceiling, then the ficelle, then the ending
    newRun(8); clean(); loadRoom(8, 2); setState('play'); lives = 99;
    run(330); ok(!cine && boss.state === 'hover', 'magpie hovers after her entrance');
    // phase 1: she only gets stuck in the ceiling (wait upside down, stomp her from below);
    // phase 2: her trinket armour only gives way to a dash
    let mhits = 0, ceilHits = 0, dashHits = 0, floorStuckP1 = false;
    for(let round = 0; round < 16 && boss.alive && !boss.dying; round++){
      const p2 = boss.phase === 2;
      until(() => !boss.nestT, 300);          // let her shake the nest first
      if(!p2 && gdir > 0){ setGravity(-1); run(40); }
      if(until(() => boss.state === 'stuck' && boss.inv <= 0 && !cine, 2500) < 0) break;
      const ceil = boss.ceil;
      if(!p2 && !ceil) floorStuckP1 = true;
      player.invuln = 0; player.onGround = false; player.standingOn = null;
      const hp = boss.hp, ph = boss.phase;
      if(!p2){ gdir = -1; player.x = boss.x + boss.w / 2 - player.w / 2; player.y = boss.y + boss.h + 30; player.vy = -2; run(14); }
      else {
        const d = boss.x + boss.w / 2 < W / 2 ? -1 : 1;
        gdir = ceil ? -1 : 1; player.y = ceil ? 34 : FLOOR - player.h; player.vy = 0; player.onGround = true;
        player.x = d < 0 ? boss.x + boss.w + 30 : boss.x - 30 - player.w;
        player.dashReady = true; player.dashCD = 0; player.facing = -d;
        input.left = d < 0; input.right = d > 0; input.dashPressed = true;
        run(14); input.left = input.right = false;
      }
      if(boss.hp < hp || boss.phase > ph || !boss.alive || boss.dying){ mhits++; if(ceil) ceilHits++; if(p2) dashHits++; }
      if(cine) finishCine();
    }
    ok(boss.dying > 0 && mhits === 6 && ceilHits >= 3 && dashHits === 3 && !floorStuckP1, `magpie beaten: 3 stomps on the ceiling, then 3 dashes (${mhits} hits, ceiling ${ceilHits}, dash ${dashHits})`);
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
    // second time the ending can be skipped
    startEnding(); run(40); input.jumpPressed = true; run(1); ok(END.t >= END_SHOTS.E, 'the ending can be skipped the second time');
    run(200);
    }catch(e){ o.push('ERROR ' + e.message + ' ' + e.stack.split('\n').slice(0, 3).join(' | ')); }
    return o;
  });
  console.log(out.join('\n')); console.log('errors', errs.slice(0, 5));
  await b.close();
})();
