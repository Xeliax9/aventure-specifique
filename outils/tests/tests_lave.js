// La lave ne tue que si on touche vraiment sa surface (bord de la fosse, saut au-dessus).
const { chromium } = require('playwright');
(async()=>{
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:800}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(require('url').pathToFileURL(process.env.GAME || require('path').resolve(__dirname, '../../dist/aventure.html')).href); await p.waitForTimeout(600);
  const out = await p.evaluate(()=>{
    const o=[]; const ok = (c, msg) => o.push((c ? 'PASS ' : 'FAIL ') + msg);
    const clean = () => { fade=0; fadeDir=0; pendingAction=null; };
    input.left = input.right = input.jumpHeld = false;
    const fresh = () => { newRun(3); clean(); loadRoom(3,0); setState('play'); if(typeof finishCine === 'function' && cine) finishCine();
      lives = 5; player.invuln = 0; player.dead = false; player.vx = 0; player.vy = 0; };
    // 1) au bord de la plateforme (x 0..530, y 340), le corps dépasse au-dessus de la fosse de lave (x 530)
    fresh();
    const L = spikes.find(s => s.lava);
    ok(L && L.x === 530 && L.y === 345, '4-1 : fosse de lave trouvée (x 530, y 345)');
    player.x = 530 - player.w + 6; player.y = 340 - player.h; player.onGround = true;
    for(let i = 0; i < 30; i++) step();
    ok(lives === 5 && !player.dead, `au bord de la plateforme, à côté de la lave : vivant (x ${player.x.toFixed(1)}, vies ${lives})`);
    // 2) juste au-dessus de la lave (pieds 3 px au-dessus de la surface dessinée)
    fresh();
    player.x = 700; player.y = 345 - player.h - 3; player.vy = -0.2; player.onGround = false; player.standingOn = null;
    step();
    ok(lives === 5 && !player.dead, 'juste au-dessus de la lave, en saut : vivant');
    // 3) qui tombe dedans meurt
    fresh();
    player.x = 700; player.y = 250; player.vy = 0; player.onGround = false; player.standingOn = null;
    let died = false; for(let i = 0; i < 90 && !died; i++){ step(); if(player.dead || lives < 5) died = true; }
    ok(died && player.y + player.h < 345 + 30, `tomber dans la lave tue, dès la surface (pieds y ${(player.y + player.h).toFixed(0)})`);
    // 4) même en chute rapide on ne traverse pas
    fresh();
    player.x = 900; player.y = 300; player.vy = MAX_FALL; player.onGround = false; player.standingOn = null;
    died = false; for(let i = 0; i < 20 && !died; i++){ step(); if(player.dead || lives < 5) died = true; }
    ok(died, 'chute rapide dans la lave : mort (pas de traversée)');
    return o;
  });
  out.forEach(l => console.log(l)); errs.forEach(e => console.log('ERROR ' + e));
  const fails = out.filter(l => l.startsWith('FAIL')).length + errs.length;
  console.log(fails ? fails + ' FAIL' : 'ALL PASS');
  await b.close(); process.exit(fails ? 1 : 0);
})();
