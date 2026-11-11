{
  name:'Le Dash',
  width:1920,
  height:560,
  start:{x:40, y:480},
  platforms:[
    {x:0, y:520, w:560, h:40},
    {x:0, y:240, w:700, h:40, solid:true},
    {x:880, y:520, w:240, h:40, ice:true},
    {x:960, y:400, w:400, h:40, solid:true},
    {x:1200, y:520, w:400, h:40},
    {x:1260, y:40, w:40, h:340, solid:true},
    {x:1600, y:120, w:40, h:440, solid:true},
    {x:1640, y:120, w:280, h:40, solid:true},
    {x:150, y:-200, w:420, h:396, solid:true},   // gemme : le grenier au-dessus du couloir de départ (tunnel bas sous ce bloc, puis saut de mur sur sa face gauche)
  ],
  walls:[{x:400, y:280, w:30, h:240, glass:true}, {x:1200, y:440, w:30, h:80, glass:true}, {x:440, y:196, w:24, h:44, glass:true}, {x:290, y:196, w:24, h:44, glass:true}],
  spikes:[{x:960, y:440, w:400, down:true}, {x:150, y:196, w:420, down:true}],
  enemies:[{on:2, from:20, to:220, speed:1}],
  signs:[
    {x:300, y:520, text:'{dash} : dash ! Fonce dans le mur de glace'},
    {x:890, y:520, text:'Plafond piquant : dash au ras du sol'},
    {x:1420, y:520, text:'Trop large ? Saut de mur, puis dash !'},
  ],
  powerUps:[{x:64, y:0, type:'gem'}],   // gemme tout en haut à gauche du grenier ; la pièce à (690, 205) et les vitres qui dépassent du plafond sont les indices
  checkpoints:[{x:900, y:520}, {x:1460, y:520}],
  npcs:[{who:'olivia2', x:100, y:520}],
  coins:[[160, 490], [340, 490], [470, 490], [600, 400], [690, 205], [700, 360], [820, 420], [940, 490], [1040, 490], [1160, 490], [1240, 490], [1340, 460], [1450, 400], [1540, 300], [1350, 240], [1480, 160], [1580, 80], [1700, 90], [1800, 90]],
  door:{x:1860, y:80},
}
