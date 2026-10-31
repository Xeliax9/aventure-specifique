# L'aventure spécifique — notes pour Claude

Jeu de plateforme en canvas (un seul fichier HTML jouable hors ligne), en français. Héros : XELIAX.
Saison 1 (4 chapitres + bonus) et saison 2 (4 mondes : 1 gravité, 2 gorges/murs, 3 glacier/dash, 4 nid de la pie).

## Toujours
- Répondre **en français**, avec une typographie soignée (« », espaces avant : ; ! ?).
- Après chaque modification : reconstruire (`node outils/build.js`), lancer les tests, puis **rappeler à l'utilisateur
  de faire `git add .`, `git commit -m "…"`, `git push`** (ou proposer de le faire pour lui).
- Ne pas mettre de piques sur les murs qu'on doit escalader ; pas de pièges invisibles ; niveaux lisibles comme la saison 1.

## Organisation
- `src/page.html`, `src/style.css` : la page ; `src/ordre.json` : ordre d'assemblage des scripts.
- `src/js/00_bases.js` … `14_cartes_controles_boucle.js` : le moteur, découpé par thème (physique dans 00 et 05).
- `src/niveaux/saison1.js`, `bonus.js` : niveaux saison 1 et bonus.
- `src/niveaux/saison2/salles/<monde>-<salle>.js` : **une salle saison 2 par fichier** ; `entetes.js` : les mondes.
- `src/niveaux/saison2.js` est **généré** par le build : ne pas le modifier à la main.
- `dist/aventure.html` : le jeu assemblé (à ouvrir dans un navigateur).

## Commandes
- Construire : `node outils/build.js`
- Tests (Playwright, `npm install` une fois) : `node outils/tests/tests19.js`, `tests_s2.js`, `tests14.js`
- Vérifier qu'une salle saison 2 est faisable (copie exacte de la physique) :
  `node outils/verif/route2.js outils/cache/chapters2.js 2-3 --gates` (avec la variable `NOLONE=1` pour interdire
  l'escalade d'un seul mur). `--gates` dit quels éléments sont obligatoires / évitables, `--verbose` liste les étapes.
- Robot qui joue un parcours dans le vrai moteur : `outils/robot/bot.js` (+ `harness.js`).

## Physique utile (px, 60 images/s)
Saut ~102 px de haut, double saut ~178, dash ~95 px à l'horizontale, course 3,6 px/image.
Mur : saut de mur 4,8 px/image d'éloignement, ~89 px de montée ; cheminée de 60 à 90 px de large.
Orbes roses = inversent la gravité ; rideaux (`w`,`h`,`set`) = forcent une direction.
Planches `fall:true` : tombent dans le sens de la gravité, se posent sur les pointes des piques (pont).
Sortir par le haut de l'écran la tête en bas = mort.

## État (v34, 31 octobre 2026)
- S2 monde 1 refait (1-1 Tête en bas, 1-2 Chemin des Nuages, 1-3 Les Planches, 1-4 Tempête Rose) : à faire valider.
- S2 monde 2 : validé par l'utilisateur (un cœur par salle).
- Glacier 3-2 / 3-3 : version d'origine corrigée.
- S2 monde 4 : 4-1 et 4-2 refaits plus justes : à faire valider.
- Fin de saison 1 : la pie vole la ficelle (scène dans `05_mise_a_jour.js`, `updateSteal`).
