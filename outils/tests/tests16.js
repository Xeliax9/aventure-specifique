const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:800}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto(require('url').pathToFileURL(process.env.GAME || require('path').resolve(__dirname, '../../dist/aventure.html')).href); await p.waitForTimeout(600);
  await p.evaluate(()=>{ localStorage.clear(); });
  await p.reload(); await p.waitForTimeout(600);
  await p.evaluate(()=>{ window.requestAnimationFrame = () => 0; }); await p.waitForTimeout(150);
  const out = await p.evaluate(()=>{
    const o=[]; const ok = (c, msg) => o.push((c ? 'PASS ' : 'FAIL ') + msg);
    const run=(n)=>{ for(let i=0;i<n;i++){ step(); if(i % 9 === 0) render(0.5); } };
    const go = (ci, ri) => { newRun(ci); fade=0; fadeDir=0; pendingAction=null; loadRoom(ci, ri); setState('play'); bannerT=0; toast.t=0; if(cine) finishCine(); };
    // ---- bonus card hidden until the adventure is finished
    toMenu(); fade=0; fadeDir=0; run(30);
    ok(MAIN_CH.length === 4 && !isUnlocked(4) && !bonusVisible(), 'fresh save: 4 chapter apps (season 2 hidden), no bonus anywhere');
    menuSel = 3; menuMove(1); ok(menuSel === 3, 'right from chapter 4 stays (no season 2 yet)');
    menuSel = 0;
    save.bestCh[3] = 90000; save.unlocked = 5;
    toMenu(); fade=0; fadeDir=0; run(5);
    ok(MAIN_CH.length === 8, 'after finishing season 1: the 4 season 2 apps appear');
    menuSel = 3; menuMove(1); ok(menuSel === 5, 'right from chapter 4 goes to season 2, chapter 1');
    menuSel = 0; run(5); render(1);
    ok(isUnlocked(4) && bonusVisible() && !MAIN_CH.includes(4), 'after finishing chapter 4: the bonus opens, hidden in the settings (not among the apps)');
    // ---- every room fits its 1.5x size and loads
    const sizes = CHAPTERS.flatMap(c => c.rooms.filter(r => !r.boss).map(r => (r.width || 640) * (r.height || 360)));
    ok(sizes.every(a => a >= 640 * 360 * 1.5), 'every normal room is at least 1.5x a screen');
    // ---- solid walls
    go(0, 3);
    const w = {x:200, y:200, w:40, h:140, solid:true, dx:0, dy:0, cT:0, gone:false, rT:0, appear:1, seed:1, move:null};
    platforms.push(w); solids = platforms.filter(q => q.solid);
    player.x = 100; player.y = 312; player.vy = 0; run(5);
    input.right = true; run(60); input.right = false;
    ok(Math.abs(player.x + player.w - w.x) < 1 && !player.dead, `a wall blocks XELIAX sideways (x ${player.x.toFixed(1)})`);
    go(1, 2);    // La Descente: solid floors cannot be jumped through
    const shelf = solids.find(s => s.w >= 400 && s.y > 200);
    player.x = shelf.x + 200; player.y = shelf.y + shelf.h + 4; player.vy = -10; player.onGround = false;
    run(6);
    ok(player.y >= shelf.y + shelf.h - 0.5, 'you bump your head on a solid floor from below');
    // ---- wooden gates break with shots (J)
    go(3, 0); canShoot = true;
    const gate = solids.find(s => s.gate);
    ok(!!gate, 'Les Portes has a wooden gate');
    player.x = gate.x - 120; player.y = 312; player.vy = 0; player.facing = 1; run(10);
    let presses = 0;
    for(let i = 0; i < 12 && !gate.gone; i++){
      window.dispatchEvent(new KeyboardEvent('keydown', {key:'j'})); window.dispatchEvent(new KeyboardEvent('keyup', {key:'j'}));
      presses++; run(20);
    }
    ok(gate.gone, `J shoots the gate down (${presses} shots)`);
    // F no longer shoots
    const n0 = shots.length; window.dispatchEvent(new KeyboardEvent('keydown', {key:'f'})); step();
    ok(shots.length === n0, 'F does nothing now');
    // ---- signs show the shoot key
    ok(signText('Ramasse l\'arme : {shoot} pour tirer').includes('J'), 'the sign says J');
    return o;
  });
  console.log(out.join('\n')); console.log('errors', errs);
  await b.close();
})();
