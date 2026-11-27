  // ==== END SEASON 2 ====
  // v62 : le bonus « Le Cosmos » (ancien chapitre 9, le dernier) est supprimé. Il était à la fin de la liste :
  // aucun autre chapitre ne change de numéro. Ne rien ajouter à la place 9 sans lire `cosmosGone` dans 01.
];
const S2_FIRST = 5, S2_END = 8;        // season 2: chapters 5 to 8 (after the bonus)
const COSMOS_OLD = 9;                  // v62 : l'ancienne place du Cosmos (les sauvegardes y gardent peut-être des restes)
const seasonOf = i => (CHAPTERS[i] && CHAPTERS[i].season) || 1;
const chNum = i => CHAPTERS[i].num || i + 1;
