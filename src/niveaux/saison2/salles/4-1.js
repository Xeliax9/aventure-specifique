{
  name:'L\'Orage',
  width:2900, height:480,
  start:{x:40, y:400},
  // v62 : un examen de fin dans l'ordre des mondes : vitre (dash), cheminée (murs), couloir tête en bas (orbes),
  // grand trou (dash + double saut), fosse sous un rocher (planches qui font un pont)
  platforms:[
    {x:0, y:440, w:900, h:40, solid:true},
    {x:820, y:60, w:24, h:330, solid:true, hang:true},
    {x:900, y:200, w:300, h:280, solid:true},
    {x:1200, y:-200, w:620, h:240, solid:true},
    {x:1760, y:300, w:200, h:180, solid:true},
    {x:2240, y:300, w:160, h:180, solid:true},
    {x:2400, y:400, w:500, h:80, solid:true},
    {x:1280, y:420, w:100, h:60, solid:true},   // gemme : corniche cachée au fond du gouffre, sous le couloir tête en bas (hors du champ de la caméra) ; trop loin du bloc suivant pour servir de raccourci
    {x:2440, y:-200, w:240, h:480, solid:true},   // rocher au-dessus de la fosse : on ne peut pas sauter par-dessus
    {x:2404, y:330, w:138, fall:true},
    {x:2544, y:330, w:138, fall:true},
  ],
  walls:[{x:420, y:240, w:30, h:200, glass:true}],   // vitre trop haute pour être sautée : dash !
  flips:[{x:1250, y:110}, {x:1790, y:134}, {x:1340, y:228}],   // 3e orbe : en trop, pour descendre vers la gemme (et remonter)
  spikes:[{x:640, y:440, w:60}, {x:1420, y:40, w:60, down:true}, {x:2400, y:400, w:280}],
  enemies:[{on:0, from:520, to:620, speed:1.2}, {on:2, from:60, to:260, speed:1.3}, {on:3, from:60, to:200, speed:1.2, ceil:true}, {on:3, from:300, to:460, speed:1.3, ceil:true}, {on:4, from:20, to:170, speed:1.3}, {on:6, from:310, to:400, speed:1.1}],
  bats:[{x:870, y:250, ax:30, ay:60, speed:0.04}, {x:1450, y:250, ax:120, ay:30, speed:0.04}, {x:2050, y:200, ax:60, ay:40, speed:0.045}],
  signs:[
    {x:300, y:440, text:'Dernier monde : tout ce que tu as appris !'},
    {x:2350, y:300, text:'Souviens-toi des planches : elles font un pont !'},
  ],
  powerUps:[{x:1050, y:166, type:'life'}, {x:1238, y:384, type:'gem'}],   // gemme au-dessus du vide, entre la corniche cachée et le mur du bloc ; pièces (1330, 300) et (1330, 350) = indices
  checkpoints:[{x:600, y:440}, {x:960, y:200}, {x:1800, y:300}, {x:2280, y:300}],
  npcs:[{who:'levain2', x:180, y:440}],
  coins:[[120, 410], [300, 410], [380, 410], [500, 410], [700, 380], [870, 380], [870, 300], [870, 220], [960, 170], [1120, 170], [1250, 160], [1330, 300], [1330, 350], [1300, 80], [1380, 80], [1520, 80], [1660, 80], [1740, 80], [1790, 200], [1860, 270], [2010, 230], [2100, 200], [2190, 230], [2320, 270], [2470, 300], [2610, 300], [2740, 370], [2800, 370]],
  door:{x:2840, y:360},
}
