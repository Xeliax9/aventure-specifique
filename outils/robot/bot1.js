// robot for season 2 world 1 (dj + shoot only). usage: node bot1.js <room 1-N> <progfile.json> [shotsPrefix]
// prog: [{start:[x,y,g]}?, cmds...]; cmds as outils/robot/bot.js plus ['wait', n], ['shoot'], ['snap', name], ['until', 'flip'], ['jumpAt', x] (walk until centre x then jump)
const path = require('path');
const { chromium } = require(path.resolve('C:/Users/Xeliax9/Documents/MAIN(pas_le_character_hein)/STPLEVRAITPS/aventure-specifique/node_modules/playwright'));
(async () => {
  const [tag, progFile, shots] = process.argv.slice(2);
  const all = require(path.resolve(progFile));
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1280, height:720}});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(require('url').pathToFileURL(path.resolve('C:/Users/Xeliax9/Documents/MAIN(pas_le_character_hein)/STPLEVRAITPS/aventure-specifique/dist/aventure.html')).href);
  await p.waitForTimeout(400);
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  for(const [name, prog] of Object.entries(all)){
    let snaps = [];
    const res = await p.evaluate(([tag, prog]) => {
      const ri = +tag.split('-')[1] - 1;
      const ci = CHAPTERS.findIndex(c => c.season === 2 && c.num === +tag.split('-')[0]);
      startChapter(ci, false); hasDJ = true; canShoot = true; hasDash = false; hasWall = false; loadRoom(ci, ri); setState('play');
      let cmds = prog;
      if(prog[0] && prog[0].start){ const s = prog[0].start; checkpoint = {x:s[0], y:s[1], g:s[2] || 1}; cmds = prog.slice(1); }
      resetPlayer(); lives = 99; for(let i = 0; i < 5; i++) step();
      const log = []; let pc = 0, t = 0, dir = 0; const snaps = [];
      const P = () => player, cx = () => player.x + player.w / 2;
      const g0 = () => gdir;
      let lastG = gdir;
      for(let f = 0; f < 4000 && pc < cmds.length; f++){
        const c = cmds[pc]; let next = false;
        input.jumpPressed = false; input.shootPressed = false;
        if(c[0] === 'walk'){ const d = Math.sign(c[1] - cx()); if(Math.abs(c[1] - cx()) < 3 && P().onGround){ dir = 0; next = true; } else dir = d; }
        else if(c[0] === 'go'){ dir = Math.sign(c[1] - cx()); if(Math.abs(c[1] - cx()) < 3){ next = true; } }
        else if(c[0] === 'air'){ dir = c[1]; if(++t >= c[2]) next = true; }
        else if(c[0] === 'wait'){ dir = 0; if(++t >= c[1]) next = true; }
        else if(c[0] === 'jump' || c[0] === 'dj'){ input.jumpPressed = true; input.jumpHeld = true; next = true; }
        else if(c[0] === 'release'){ input.jumpHeld = false; next = true; }
        else if(c[0] === 'shoot'){ input.shootPressed = true; next = true; }
        else if(c[0] === 'land'){ dir = c[1]; if(P().onGround && t++ > 1) next = true; }
        else if(c[0] === 'flip'){ dir = c[1]; if(gdir !== lastG) next = true; }
        else if(c[0] === 'waitE'){ dir = 0; const e = enemies[c[1]]; if(!e.alive || (e.x >= c[2] && e.x <= c[3] && (!c[4] || e.dir === c[4]))) next = true; }
        else if(c[0] === 'waitY'){ dir = 0; if(player.y >= c[1]) next = true; }
        else if(c[0] === 'info'){ log.push('INFO enemies alive: ' + enemies.map(e => e.alive ? 1 : 0).join('') + ' planks: ' + platforms.filter(p => p.fall).map(p => (p.x|0) + ',' + (p.y|0)).join(' ')); next = true; }
        input.left = dir < 0; input.right = dir > 0;
        if(next){ log.push(c[0] + (c[1] !== undefined ? c[1] : '') + '>' + (player.x|0) + ',' + (player.y|0) + ' g' + gdir + ' f' + f); pc++; t = 0; if(c[0] === 'snap') return {log, snap:c[1], pc, done:false}; }
        lastG = gdir;
        const was = P().dead, lv0 = lives; step(); if(lives < lv0) log.push("HIT@" + f + " cmd" + pc + " " + (P().x|0) + "," + (P().y|0) + " g" + gdir);
        if(P().dead && !was){ log.push('DEAD@' + f + ' cmd' + pc + ' ' + (P().x|0) + ',' + (P().y|0) + ' g' + gdir); break; }
        if(exitT > 0){ log.push('DOOR@' + f); break; }
      }
      log.push('end pc' + pc + '/' + cmds.length + ' at ' + (player.x|0) + ',' + (player.y|0) + ' ground ' + player.onGround + ' g' + gdir + ' lives ' + lives);
      return {log, done:true};
    }, [tag, prog]);
    console.log('== ' + name); for(const l of res.log) console.log('  ' + l);
  }
  if(shots){
    // free-run screenshots: shots is "x1,y1,g;x2,y2,g" positions to teleport the camera/player
    for(const [i, spot] of shots.split(';').entries()){
      const [x, y, g] = spot.split(',').map(Number);
      await p.evaluate(([tag, x, y, g]) => {
        const ri = +tag.split('-')[1] - 1, ci = CHAPTERS.findIndex(c => c.season === 2 && c.num === +tag.split('-')[0]);
        startChapter(ci, false); hasDJ = true; canShoot = true; loadRoom(ci, ri); setState('play');
        checkpoint = {x, y, g:g || 1}; resetPlayer(); for(let k = 0; k < 40; k++) step(); render(1);
      }, [tag, x, y, g]);
      await p.locator('#game').screenshot({path:`shot_${tag}_${i}.png`});
    }
  }
  if(errs.length) console.log('ERRORS', errs);
  await b.close();
})();
