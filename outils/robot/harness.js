// in-engine harness: load a room object, run a scripted controller (string of a JS function body)
const { chromium } = require('playwright');
exports.open = async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:1280, height:800}});
  const errs = []; p.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n')[1]));
  await p.goto(require('url').pathToFileURL(process.env.GAME || require('path').resolve(__dirname, '../../dist/aventure.html')).href); await p.waitForTimeout(400);
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  return {b, p, errs, T:(fn, a) => p.evaluate(fn, a)};
};
