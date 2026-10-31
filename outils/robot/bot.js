// macro bot inside the engine. program: list of commands
//  ['walk', x]            walk (on ground) until centre x reached (stops)
//  ['air', dir, n]        hold dir for n frames (dir -1/0/1)
//  ['jump']  ['dj']  ['dash', dir]
//  ['until', 'ground']    hold current dir until on ground
//  ['climb', side, y]     cling on wall `side` and climb by wall-jump + dash back until player.y < y
//  ['land', dir]          hold dir until onGround
//  ['wj']                 wall jump now (must be on wall)
exports.run = async (T, roomFn, start, prog, maxF = 3000) => T(([roomSrc, start, prog, maxF]) => {
  const ci = CHAPTERS.findIndex(c => c.season === 2 && c.num === 3);
  const [ri, room] = eval('(' + roomSrc + ')')();
  if(room) CHAPTERS[ci].rooms[ri] = room;
  startChapter(ci, false); hasDash = true; hasDJ = true; hasWall = true; loadRoom(ci, ri); setState('play');
  if(start) checkpoint = {x:start[0], y:start[1], g:1};
  resetPlayer(); lives = 99; for(let i = 0; i < 5; i++) step();
  const log = []; let pc = 0, t = 0, dir = 0, deaths = 0, sub = 0;
  const P = () => player, cx = () => player.x + player.w / 2;
  for(let f = 0; f < maxF && pc < prog.length; f++){
    const c = prog[pc]; let next = false;
    input.jumpPressed = false; input.dashPressed = false;
    const hold = d => { dir = d; };
    if(c[0] === 'walk'){ const d = Math.sign(c[1] - cx()); if(Math.abs(c[1] - cx()) < 3 && P().onGround){ hold(0); next = true; } else hold(d); }
    else if(c[0] === 'air'){ hold(c[1]); if(++t >= c[2]) next = true; }
    else if(c[0] === 'jump'){ input.jumpPressed = true; input.jumpHeld = true; next = true; }
    else if(c[0] === 'dj'){ input.jumpPressed = true; input.jumpHeld = true; next = true; }
    else if(c[0] === 'dash'){ hold(c[1]); input.dashPressed = true; next = true; }
    else if(c[0] === 'land'){ hold(c[1]); if(P().onGround && t++ > 1) next = true; }
    else if(c[0] === 'to'){ const d = c[1] - cx(); hold(Math.abs(d) < 4 ? 0 : Math.sign(d)); if(P().onGround && t++ > 1) next = true; }
    else if(c[0] === 'wj'){ input.jumpPressed = true; next = true; }
    else if(c[0] === 'climb'){
      const side = c[1];
      if(P().y < c[2] && sub === 0 && P().wallSide === side && P().wallT > 0 && !P().onGround){ next = true; }
      else if(sub === 0){ hold(side); if(P().wallSide === side && P().wallT > 0 && !P().onGround){ input.jumpPressed = true; input.jumpHeld = true; sub = 1; t = 0; } }
      else { hold(0); if(++t === 14){ hold(side); input.dashPressed = true; sub = 0; } }
    }
    input.left = dir < 0; input.right = dir > 0;
    if(next){ log.push(c[0] + '>' + (player.x|0) + ',' + (player.y|0)); pc++; t = 0; sub = 0; }
    const was = P().dead; step();
    if(P().dead && !was){ deaths++; log.push('DEAD@' + f + ' cmd' + (pc) + ' ' + (P().x|0) + ',' + (P().y|0)); break; }
    if(exitT > 0){ log.push('DOOR@' + f); break; }
  }
  log.push('end pc' + pc + '/' + prog.length + ' at ' + (player.x|0) + ',' + (player.y|0) + ' ground ' + player.onGround);
  return log;
}, [roomFn.toString(), start, prog, maxF]);
