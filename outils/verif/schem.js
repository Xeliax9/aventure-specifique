// Schematic of a season 2 room + the route found by route2 (frame by frame), written as JSON for schem.py.
// usage: node schem.js 1-2 [--gem] [--nodash] ; env NOLONE=1 to forbid single-wall climbs
const fs = require('fs');
const R2 = require('./route2.js');
const C = R2.C;
const CH = new Function(fs.readFileSync(__dirname + '/../cache/chapters2.js', 'utf8') + '; return CHAPTERS2;')();
const tag = process.argv[2];
const wantGem = process.argv.includes('--gem');
const [cn, rn] = tag.split('-').map(Number);
const c = CH.find(x => x.num === cn), room = c.rooms[rn - 1];
const abil = Object.assign({dj:false, wall:false, dash:false}, c.grants);
for(const r of c.rooms.slice(0, rn)) for(const pu of (r.powerUps || [])){ if(pu.type === 'wall') abil.wall = true; if(pu.type === 'dash') abil.dash = true; }
if(process.argv.includes('--nodash')) abil.dash = false;
if(process.argv.includes('--nowall')) abil.wall = false;
const a = R2.analyse(room, abil, new Set());
const out = {tag, room, abil, path:[], reach:a.reach, err:a.err || null, nodes:[]};
if(!a.err){
  // all reached nodes (for a reachability overlay)
  for(const [i, d] of a.dist){ const r = a.R[i]; out.nodes.push(r.kind === 'stand' ? {k:'s', g:r.g, lo:r.lo, hi:r.hi, y:r.y, d} : {k:'w', g:r.g, x:r.side > 0 ? r.w.x - C.PW : r.w.x + r.w.w, y:r.y, side:r.side, d}); }
  // target: door (or gem with --gem)
  let best = null;
  const gemBox = (room.powerUps || []).find(p => p.type === 'gem');
  for(const [i, d] of a.dist){
    const r = a.R[i];
    let ok = false;
    if(!wantGem && r.kind === 'stand' && room.door && r.g > 0 && r.lo <= room.door.x + 26 && r.hi + 22 >= room.door.x && Math.abs(r.y + 28 - (room.door.y + 40)) < 4) ok = true;
    if(!wantGem && room.door && room.door.ceil && r.kind === 'stand' && r.g < 0 && r.lo <= room.door.x + 26 && r.hi + 22 >= room.door.x && Math.abs(r.y - room.door.y) < 4) ok = true;
    if(ok && (best == null || d < a.dist.get(best))) best = i;
  }
  if(wantGem && gemBox){
    // pick the node from which a program touches the gem: re-run the BFS frontier is costly, so look for the node whose
    // stored edge trajectory passes the gem (approximation: nearest reached node to the gem)
    let bd = 1e9;
    for(const [i, d] of a.dist){ const r = a.R[i]; const x = r.kind === 'stand' ? (r.lo + r.hi) / 2 : (r.side > 0 ? r.w.x - 22 : r.w.x + r.w.w); const dd = Math.hypot(x - gemBox.x, r.y - gemBox.y); if(dd < bd){ bd = dd; best = i; } }
  }
  if(best != null){
    const chain = []; for(let k = best; k !== undefined; k = a.par.get(k)) chain.unshift(k);
    for(let ci = 1; ci < chain.length; ci++){
      const from = a.R[chain[ci - 1]], info = a.edgeInfo.get(chain[ci]), prog = info.prog;
      const st = from.kind === 'stand' ? {x:info.x, y:from.y, g:from.g, onGround:true, ice:!!from.p.ice}
        : {x:from.side > 0 ? from.w.x - C.PW : from.w.x + from.w.w, y:from.y, g:from.g, onGround:false, coyote:0, vy:C.WALL_SLIDE * from.g, sliding:true, wallSide:from.side, wallT:C.WALL_COY, usedDJ:true, dashReady:true, facing:from.side, curWall:from.w};
      const geo = a.geo;
      const s = Object.assign({x:0, y:0, vx:0, vy:0, onGround:true, coyote:C.COY, buffer:0, usedDJ:false, noCut:false, g:1, facing:1,
        wallSide:0, wallT:0, wallLock:0, sliding:false, dashT:0, dashDir:1, dashReady:true, dashCD:0, dashBuf:0, ice:false,
        jumps:0, wjumps:0, djs:0, dashes:0, broke:0, flipped:false, left:false}, st);
      s.disarmed = new Set(geo.orbs.filter(o => o.x < s.x + 22 && o.x + o.w > s.x && o.y < s.y + 28 && o.y + o.h > s.y).map(o => o.i));
      s.vx = prog.vx0;
      const broken = new Set(info.crumble !== undefined ? geo.plats.filter(p => p.id === info.crumble) : []);
      const pts = [];
      for(let f = 0; f < 240; f++){
        const dir = f < prog.k ? prog.d1 : prog.d2;
        let pressed = false, held = false;
        if(prog.jump !== 'walk'){ if(f === 0) pressed = true; held = f < (prog.jump === 'tap' ? 2 : 45); }
        if(prog.dj >= 0){ if(f === prog.dj) pressed = true; if(f >= prog.dj && f < prog.dj + 45) held = true; }
        const dashPress = (prog.dash >= 0 && f === prog.dash) || (prog.dash2 > 0 && f === prog.dash2) || (prog.dash3 > 0 && f === prog.dash3);
        const dd = dashPress && prog.ddir ? prog.ddir : dir;
        R2.frameStep(geo, s, dashPress ? dd : dir, pressed, held, dashPress, broken);
        pts.push([Math.round(s.x + 11), Math.round(s.y + 14), s.dashT > 0 ? 1 : 0, s.g]);
        if(!s.onGround) s.left = true;
        if(s.onGround && s.left) break;
        if(s.sliding && f > 1 && !(from.kind === 'wall' && s.wallObj === from.w && Math.abs(s.y - from.y) < 24)) break;
      }
      out.path.push({prog, pts});
    }
  }
}
fs.writeFileSync(__dirname + `/schem/${tag}.json`, JSON.stringify(out));
console.log(tag, room.name, 'path edges', out.path.length, 'reach', JSON.stringify(a.reach));
