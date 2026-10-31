{
  name:'Le Yéti des Glaces',
  label:'Combat de boss',
  start:{x:80, y:300},
  platforms:[
    {x:0, y:340, w:640, h:20},
    {x:110, y:226, w:100},
    {x:430, y:226, w:100},
  ],
  walls:[{x:0, y:-300, w:32, h:300, slick:true}, {x:0, y:0, w:32, h:340}, {x:608, y:-300, w:32, h:300, slick:true}, {x:608, y:0, w:32, h:340}],
  signs:[{x:60, y:340, text:'Son casque le protège : dash quand il est sonné !'}],
  powerUps:[{x:310, y:150, type:'life'}],
  coins:[[160, 196], [480, 196]],
  boss:{mode:'yeti', name:'Le Yéti des Glaces', hp:3, hp2:3, x:450, y:286, w:52, h:54},
  needsBoss:true,
  door:{x:300, y:300},
}
