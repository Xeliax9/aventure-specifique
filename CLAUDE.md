# L'aventure spécifique — notes pour Claude

Jeu de plateforme en canvas (un seul fichier HTML jouable hors ligne), en français. Héros : XELIAX.
Saison 1 (4 chapitres + bonus) et saison 2 (4 mondes : 1 gravité, 2 gorges/murs, 3 glacier/dash, 4 nid de la pie).

## Toujours
- Répondre **en français**, avec une typographie soignée (« », espaces avant : ; ! ?).
- Après chaque modification : reconstruire (`node outils/build.js`), lancer les tests, puis **rappeler à l'utilisateur
  de faire `git add .`, `git commit -m "…"`, `git push`** (ou proposer de le faire pour lui).
- Ne pas mettre de piques sur les murs qu'on doit escalader ; pas de pièges invisibles ; niveaux lisibles comme la saison 1.
- À chaque nouvelle version : ajouter `versions/vNN.txt` (changements expliqués simplement, en français).

## Organisation
- `src/page.html`, `src/style.css` : la page ; `src/ordre.json` : ordre d'assemblage des scripts.
- `src/js/00_bases.js` … `14_cartes_controles_boucle.js` : le moteur, découpé par thème (physique dans 00 et 05).
- `src/niveaux/saison1.js`, `bonus.js` : niveaux saison 1 et bonus.
- `src/niveaux/saison2/salles/<monde>-<salle>.js` : **une salle saison 2 par fichier** ; `entetes.js` : les mondes.
- `src/niveaux/saison2.js` est **généré** par le build : ne pas le modifier à la main.
- `dist/aventure.html` : le jeu assemblé (à ouvrir dans un navigateur) ; **pas suivi par git** (généré par le build).
- En ligne : https://xeliax9.github.io/aventure-specifique/, publié par `.github/workflows/pages.yml` quand on pousse
  un tag (`git tag vNN && git push origin vNN`). Le workflow construit avec `--demo` : version démo
  (`DEMO` dans `00_bases.js` : chapitres 1 et 2 seulement ; Crédits, Nourrir XELIAX bloqués ; Paramètres : Son, Jeu, Commandes, Connexion admin ; `demoOn()` = démo active, l'admin connecté lève tout).
  Enlever `--demo` du workflow pour mettre le jeu complet en ligne.

## Commandes
- Construire : `node outils/build.js`
- Tests (Playwright, `npm install` une fois) : `node outils/tests/tests19.js`, `tests_s2.js`, `tests14.js`
- Vérifier qu'une salle saison 2 est faisable (copie exacte de la physique) :
  `node outils/verif/route2.js outils/cache/chapters2.js 2-3 --gates` (avec la variable `NOLONE=1` pour interdire
  l'escalade d'un seul mur). `--gates` dit quels éléments sont obligatoires / évitables, `--verbose` liste les étapes.
- Robot qui joue un parcours dans le vrai moteur : `outils/robot/bot.js` (+ `harness.js`) pour le Glacier ;
  `outils/robot/bot1.js <salle> <parcours.json>` pour le monde 1 (double saut + tir, planches qui bougent) ;
  parcours validés dans `outils/robot/parcours/`. **route2 ne simule pas les planches qui tombent** : pour elles, le robot.
- Node.js n'est pas installé sur le PC : Claude télécharge un Node portable dans son dossier temporaire.

## Physique utile (px, 60 images/s)
Saut ~102 px de haut, double saut ~178, dash ~95 px à l'horizontale, course 3,6 px/image.
Mur : saut de mur 4,8 px/image d'éloignement, ~89 px de montée ; cheminée de 60 à 90 px de large.
Orbes roses = inversent la gravité ; rideaux (`w`,`h`,`set`) = forcent une direction.
Planches `fall:true` : tombent dans le sens de la gravité, se posent sur les pointes des piques (pont), écrasent les
ennemis. `again:true` : reviennent après s'être posées. `lift:true` : planche-parachute (descend lentement en portant
XELIAX ; tête en bas, elle monte). `free:true` : libre dès le début, suit la gravité à chaque orbe.
Hérisson (`spiky:true`) : ni saut dessus, ni dash, ni tir — seule une planche qui tombe le bat.
Sortir par le haut de l'écran la tête en bas = mort ; passer sous le bas de l'écran la tête en bas = mort.

## État (v48, 2 novembre 2026)
- Menu : la saison 2 n'apparaît qu'après la fin de la saison 1 (`s2Visible`, `refreshMainCh`) ; plus de barre de téléphone.
- v48 (retours GitHub de hugomslv) : touches dessinées cliquables dans les menus (`PROMPT_KEY`) ; touches au choix
  (page Commandes, `SET.keys`, `gameKey`) ; option saut automatique (`SET.autoJump`) ; cartes de chapitres nettes (`zoom`) ;
  numéro de version `v1.0.NN` en bas à gauche (`VERSION`, mis par le build d'après `versions/`) ; tag GitHub `v1.0.NN`.
- `perso/` (ignoré par git) : notes pour l'utilisateur, dont `perso/A_TESTER.md` (liste de choses à tester).
- S2 monde 1 : 1-1 Tête en bas, 1-2 Chemin des Nuages, 1-3 Les Planches (validée et adorée), 1-4 Les Parachutes,
  1-5 Le Pont Retourné (nouvelles, à faire valider), 1-6 La Tempête Rose (ex-1-4, validée).
- S2 monde 2 : validé (un cœur par salle). v42 : 2-2 poteaux infranchissables par le haut + fin bas-haut-bas-haut ; 2-3 piques côté milieu, on grimpe entre poteau et mur. Cinématique en 2-1 : la pie vole le double saut (`djSteal`), Gaston le rend en 2-3.
- Glacier : raccourcis de 3-2 et 3-3 bouchés (v42) ; 3-4 La Tour de Glace (nouvelle, dessin de l'utilisateur), boss Yéti en 3-5.
- S2 monde 4 : la pie (4-3) a 3 phases (3 / 3 / 5 PV) ; la phase 3 enchaîne les plongeons (validée et adorée).
- Saison 1 : boss final : phase 1 change de côté (`sideT`), phase 2 sol tout en lave (`hotFloor.lava`), envol sur une plateforme (`launchTo`) puis lave rapide ; avant : sol brûlant (`hotFloor`) et attaque spéciale toutes les 10 s
  (pluie de feu, anneaux, spirale) ; fin de saison 1 avec feux d'artifice, « QUOI ?! » et carton « À suivre… ».
- Boutique : pièces → tirelire (`save.bank`), couleurs à acheter (`price`) ou à débloquer avec les gemmes (`gems`).
- Bonus = mode speedrun (`13c_speedrun.js`) : chrono + temps intermédiaires, médailles, fantôme (`save.speed`), R = recommencer, un coup = mort sans cœurs.
- Tir : attrape les pièces, ennemi abattu = +1 pièce, super tir en gardant la touche (`CHARGE_FULL`).
