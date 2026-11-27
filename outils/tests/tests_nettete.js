// v62 : texte net — dans les menus, le canvas a autant de pixels que l'écran (taille CSS × devicePixelRatio),
// même après une baisse de la qualité automatique en jeu ; un clic dans un menu tombe toujours au bon endroit.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const game = require('url').pathToFileURL(process.env.GAME || require('path').resolve(__dirname, '../../dist/aventure.html')).href;
  const out = [], errs = [];
  for(const [dsf, w, h] of [[1, 1280, 720], [1.25, 1536, 864], [1.5, 1280, 720], [2, 960, 540], [1, 2560, 1440], [3, 800, 400]]){
    const c = await b.newContext({viewport:{width:w, height:h}, deviceScaleFactor:dsf});
    const p = await c.newPage();
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if(m.type() === 'error') errs.push('console: ' + m.text()); });
    await p.goto(game); await p.waitForTimeout(500);
    const r = await p.evaluate(async () => {
      const o = [], ok = (c, m) => o.push((c ? 'PASS ' : 'FAIL ') + m);
      const wait = n => new Promise(res => { let k = 0; const f = () => (++k >= n ? res() : requestAnimationFrame(f)); requestAnimationFrame(f); });
      const sharp = lbl => { const rc = canvas.getBoundingClientRect(), dpr = devicePixelRatio;
        ok(Math.abs(canvas.width - rc.width * dpr) <= 1.5 && Math.abs(canvas.height - rc.height * dpr) <= 1.5,
          `${lbl} : canvas ${canvas.width}x${canvas.height} = CSS ${rc.width.toFixed(1)}x${rc.height.toFixed(1)} × ${dpr}`); };
      goPage('settings'); menu.t = 1; await wait(3); sharp('Paramètres');
      // une partie qui rame : la qualité baisse en jeu…
      newRun(0); loadRoom(0, 1); fade = 0; fadeDir = 0; setState('play'); await wait(3);
      RES_K = 0.6; fitCanvas(); await wait(2);
      ok(canvas.width < canvas.getBoundingClientRect().width * devicePixelRatio - 2, 'en jeu, la qualité automatique peut baisser la résolution');
      setState('pause'); await wait(3); sharp('pause après un jeu lent');
      setState('title'); goPage('settings'); menu.t = 1; await wait(3); sharp('Paramètres après un jeu lent');
      // les clics : coordonnées du jeu indépendantes de la taille du canvas
      const rc = canvas.getBoundingClientRect();
      const [x, y] = canvasPoint({clientX: rc.left + rc.width / 2, clientY: rc.top + rc.height / 4});
      ok(Math.abs(x - W / 2) < 0.5 && Math.abs(y - H / 4) < 0.5, `clic au bon endroit (${x.toFixed(1)}, ${y.toFixed(1)})`);
      return o;
    });
    out.push(...r.map(s => s.replace(/^(PASS|FAIL) /, `$1 [×${dsf} ${w}x${h}] `)));
    await c.close();
  }
  await b.close();
  console.log(out.join('\n'));
  const fails = out.filter(s => s.startsWith('FAIL')).length;
  console.log(`\n${out.length - fails} PASS, ${fails} FAIL, ${errs.length} erreurs JS` + (errs.length ? '\n' + errs.join('\n') : ''));
  process.exit(fails || errs.length ? 1 : 0);
})();
