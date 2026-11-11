{
  name:'La Tempête Rose',
  width:2900,
  start:{x:40, y:280},
  platforms:[
    {x:0, y:320, w:360, h:40, solid:true},
    {x:430, y:250, w:110, h:20},
    {x:620, y:170, w:110, h:20},
    {x:810, y:320, w:200, h:40, solid:true},
    {x:1010, y:0, w:920, h:40, solid:true},
    {x:1010, y:320, w:980, h:40, solid:true},
    {x:2000, y:0, w:310, h:40, solid:true},
    {x:2070, y:40, w:18, h:58, solid:true, hang:true},
    {x:2160, y:40, w:18, h:58, solid:true, hang:true},
    {x:2350, y:320, w:550, h:40, solid:true},
    {x:1010, y:-260, w:24, h:260, solid:true},   // gemme : hors de l'écran, empêche d'atterrir sur le toit du couloir (pas de raccourci)
  ],
  // gemme : orbe en trop (900,150) au double saut → on tombe vers le haut → le rideau du haut remet à l'endroit et rend le double saut → double saut au-dessus de l'écran
  flips:[{x:1200, y:0, w:16, h:360, set:-1}, {x:1440, y:0, w:16, h:360, set:1}, {x:1680, y:0, w:16, h:360, set:-1}, {x:1900, y:0, w:16, h:360, set:1}, {x:2050, y:222}, {x:2312, y:165}, {x:900, y:150}, {x:770, y:6, w:240, h:12, set:1}],
  springs:[{x:300, y:320}],
  spikes:[{x:1230, y:320, w:200}, {x:1460, y:40, w:210, down:true}, {x:1700, y:320, w:190}, {x:2500, y:320, w:50}, {x:2000, y:40, w:70, down:true}, {x:2178, y:40, w:132, down:true}],
  enemies:[{on:0, from:120, to:260, speed:1.1}, {on:3, from:40, to:160, speed:1.2}, {on:4, from:240, to:420, speed:1.2, ceil:true}, {on:5, from:460, to:660, speed:1.3}, {on:9, from:240, to:460, speed:1.3}],
  bats:[{x:530, y:120, ax:60, ay:30, speed:0.04}, {x:1560, y:180, ax:60, ay:40, speed:0.045}, {x:2450, y:200, ax:60, ay:30, speed:0.045}],
  signs:[
    {x:1080, y:320, text:'Les rideaux roses : en haut, en bas !'},
  ],
  powerUps:[{x:890, y:-66, type:'gem'}, {x:2114, y:48, type:'life'}],   // gemme au-dessus de l'écran ; la pièce à (900, 60) est l'indice
  checkpoints:[{x:850, y:320}, {x:1050, y:320}, {x:2400, y:320}],
  coins:[[150, 290], [300, 200], [485, 220], [675, 140], [760, 220], [900, 290], [900, 60], [1100, 290], [1200, 200], [1300, 80], [1400, 80], [1440, 200], [1540, 290], [1640, 290], [1680, 200], [1780, 80], [1860, 80], [2010, 180], [2124, 100], [2220, 140], [2290, 170], [2350, 260], [2450, 290], [2650, 290], [2800, 290]],
  door:{x:2840, y:280},
}
