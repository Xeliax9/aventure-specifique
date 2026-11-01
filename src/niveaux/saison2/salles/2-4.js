{
  name:'Le Gecko Géant',
  label:'Combat de boss',
  start:{x:300, y:300},
  platforms:[
    {x:0, y:340, w:640, h:20},
    {x:140, y:236, w:90},
    {x:410, y:236, w:90},
    {x:270, y:150, w:100},
  ],
  walls:[{x:0, y:-300, w:40, h:300, slick:true}, {x:0, y:0, w:40, h:340}, {x:600, y:-300, w:40, h:300, slick:true}, {x:600, y:0, w:40, h:340}],
  signs:[{x:80, y:340, text:'Quand il tombe, saute-lui dessus ! Quand il court, monte !'}],
  powerUps:[{x:310, y:120, type:'life'}],
  coins:[[185, 206], [455, 206]],
  boss:{mode:'gecko', name:'Le Gecko Géant', hp:3, hp2:5, x:40, y:150, w:40, h:40},
  needsBoss:true,
  door:{x:520, y:300},
}
