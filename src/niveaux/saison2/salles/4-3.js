{
  name:'La Pie Voleuse',
  label:'Boss final',
  ending2:true,
  start:{x:80, y:300},
  platforms:[
    {x:0, y:340, w:640, h:20},
    {x:0, y:-200, w:640, h:234, solid:true, slick:true},
  ],
  flips:[{x:0, y:34, w:26, h:306}, {x:614, y:34, w:26, h:306}, {x:160, y:187}, {x:480, y:187}],
  signs:[{x:120, y:340, text:'Le foin est trop mou : fais-la plonger vers le plafond !'}, {x:470, y:34, text:'Bords et orbes retournent la gravité', ceil:true}],
  powerUps:[{x:310, y:306, type:'life'}],
  coins:[[150, 312], [490, 312], [320, 60]],
  boss:{mode:'magpie', name:'La Pie Voleuse', fem:true, hp:3, hp2:3, hp3:5, x:440, y:150, w:48, h:40},
  door:null,
}
