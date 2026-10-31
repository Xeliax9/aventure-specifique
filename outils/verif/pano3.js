// panoramas of every non-boss room: in-game rendering, camera stepped across the room, stitched with PIL
const { chromium } = require('playwright');
(async()=>{
  const only = process.argv[2];
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:800}});
  const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto(require('url').pathToFileURL(process.env.GAME || require('path').resolve(__dirname, '../../dist/aventure.html')).href); await p.waitForTimeout(700);
  await p.evaluate(()=>{ window.requestAnimationFrame = () => 0; drawHUD = () => {}; drawLighting = () => {}; });
  await p.waitForTimeout(150);
  const el = await p.$('#game');
  const rooms = await p.evaluate(()=>CHAPTERS.flatMap((c, ci) => c.rooms.map((r, ri) => ({ci, ri, tag:c.season === 2 ? `S2-${c.num}-${ri + 1}` : `${c.bonus ? 'B' : ci + 1}-${ri + 1}`, boss:!!r.boss, w:r.width || 640, h:r.height || 360}))).filter(r => !r.boss));
  const meta = [];
  for(const r of rooms){
    if(only && !only.split(',').includes(r.tag)) continue;
    await p.evaluate(([ci, ri]) => { newRun(ci); fade=0; fadeDir=0; pendingAction=null; loadRoom(ci, ri); setState('play'); bannerT=0; toast.t=0; if(cine) finishCine(); for(let i=0;i<30;i++) step(); player.dead = true; for(const s of signs) s.show = 0; }, [r.ci, r.ri]);
    const xs = [], ys = [];
    for(let x = 0; ; x += 640){ const cx = Math.min(x, r.w - 640); xs.push(cx); if(cx >= r.w - 640) break; }
    for(let y = 0; ; y += 360){ const cy = Math.min(y, r.h - 360); ys.push(cy); if(cy >= r.h - 360) break; }
    const shots = [];
    for(const cy of ys) for(const cx of xs){
      await p.evaluate(([cx, cy]) => { camX = prevCamX = cx; camY = prevCamY = cy; render(1); }, [cx, cy]);
      const f = `pv/${r.tag}_${cx}_${cy}.png`;
      await el.screenshot({path:f});
      shots.push({f, cx, cy});
    }
    meta.push({tag:r.tag, w:r.w, h:r.h, shots});
  }
  require('fs').writeFileSync('pv/meta.json', JSON.stringify(meta));
  console.log('errors', errs);
  await b.close();
})();
