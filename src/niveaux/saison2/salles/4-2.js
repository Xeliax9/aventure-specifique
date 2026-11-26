{
  name:'Le Grand Arbre',
  width:800, height:1440,
  start:{x:60, y:1360},
  platforms:[
    {x:0, y:0, w:40, h:1440, solid:true},
    {x:760, y:0, w:40, h:1440, solid:true},
    {x:40, y:1400, w:720, h:40, solid:true},
    {x:656, y:1000, w:24, h:320, solid:true, hang:true},   // v62 : cheminée de 80 px avec le mur de droite
    {x:360, y:1000, w:220, h:24, solid:true},
    {x:200, y:900, w:80, crumble:true},
    {x:60, y:800, w:80, crumble:true},
    {x:120, y:520, w:24, h:240, solid:true, hang:true},   // v62 : cheminée de 80 px avec le mur de gauche
    {x:260, y:520, w:300, h:24, solid:true},
    {x:400, y:240, w:360, h:24, solid:true},
    {x:40, y:0, w:720, h:40, solid:true},
  ],
  walls:[{x:300, y:1280, w:30, h:120, glass:true}],
  flips:[{x:600, y:440}],
  spikes:[{x:480, y:1400, w:80}, {x:520, y:264, w:60, down:true}],   // v62 : plus de piques au plafond près de la porte : un moment calme avant la pie
  turrets:[{x:736, y:830, dir:'left', rate:120, hp:2}],
  enemies:[{on:4, from:20, to:200, speed:1.2}, {on:8, from:40, to:260, speed:1.2}, {on:9, from:40, to:300, speed:1.3, ceil:true}],
  bats:[{x:500, y:1200, ax:80, ay:40, speed:0.04}, {x:420, y:700, ax:100, ay:40, speed:0.04}, {x:260, y:330, ax:100, ay:40, speed:0.045}],
  signs:[
    {x:420, y:1000, text:'Les branches fragiles cassent : grimpe vite !'},
    {x:330, y:40, text:'Le nid est derrière la porte : respire un bon coup !', ceil:true},
  ],
  powerUps:[{x:470, y:966, type:'life'}],
  checkpoints:[{x:420, y:1400}, {x:400, y:1000}, {x:300, y:520}, {x:700, y:264, ceil:true}],
  coins:[[200, 1370], [420, 1370], [720, 1300], [720, 1180], [720, 1060], [560, 970], [240, 870], [100, 770], [80, 680], [80, 590], [210, 490], [400, 490], [520, 490], [600, 380], [650, 290], [450, 290], [360, 200], [300, 60], [230, 60], [160, 60]],
  door:{x:70, y:40, ceil:true},
}
