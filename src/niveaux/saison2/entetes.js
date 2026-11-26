// season 2 chapter headers; rooms come from rooms/<num>-<room>.js
// v62 : parTime = temps de l'or du contre-la-montre (argent +25 %, bronze +50 %) ; estimations à affiner en jouant
module.exports = [
  {name:'Le Ciel Renversé', season:2, num:1, parTime:150000, deco:'sky', grants:{dj:true, shoot:true}, rooms:['1-1', '1-2', '1-3', '1-4', '1-5', '1-6']},
  {name:'Les Gorges', season:2, num:2, parTime:180000, deco:'canyon', grants:{dj:true, shoot:true}, rooms:['2-1', '2-2', '2-3', '2-4']},
  {name:'Le Glacier', season:2, num:3, parTime:210000, deco:'ice', grants:{dj:true, shoot:true, wall:true, dash:true}, rooms:['3-1', '3-2', '3-3', '3-4', '3-5']},
  {name:'Le Nid de la Pie', season:2, num:4, parTime:210000, deco:'nest', grants:{dj:true, shoot:true, wall:true, dash:true}, rooms:['4-1', '4-2', '4-3']},
];
