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
  un tag (`git tag -a v0.9.NN -m "…" && git push origin v0.9.NN`) ; tags v0.9.34 → v0.9.NN = versions 34 → NN.
  Attention : chaque tag poussé sur un commit qui contient le workflow republie le site (pousser le plus récent en dernier).
  Releases GitHub : Claude n'a pas accès au compte ; préparer des liens pré-remplis (`perso/RELEASES_A_CREER.md`). Le workflow construit avec `--demo` : version démo
  (`DEMO` dans `00_bases.js` : chapitres 1 et 2 seulement ; Crédits, Nourrir XELIAX bloqués ; Paramètres : Son, Jeu, Commandes, Connexion admin ; `demoOn()` = démo active, l'admin connecté lève tout).
  Enlever `--demo` du workflow pour mettre le jeu complet en ligne.

## Commandes
- Construire : `node outils/build.js`
- Tests (Playwright, `npm install` une fois) : `node outils/tests/tests19.js`, `tests_s2.js`, `tests14.js`, `tests_ouverture.js` (a besoin de `dist/demo.html` : `node outils/build.js --demo --out dist/demo.html`)
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

## État (v54 = v0.9.54, 9 novembre 2026, publiée ; v53 et v54 sur le même commit, tags v0.9.53 et v0.9.54)
- v54 : motifs et accessoires des couleurs à acheter (`pat`, `acc`, `desc`, `ghost` dans `SKINS` ; `drawSkinPattern`, `drawSkinAcc` ; `drawHero(..., {skin})` = aperçu boutique).
  Indice de la suite (`12c_indice_suite.js`) : `clearInfo.teaser` avant les résultats, passable après une première vue (`save.teaserSeen`).
  Pause : R = recommencer la salle (`pauseRestartRoom`, `roomEntry`), C = le chapitre. Qualité automatique `RES_K` (00_bases, `autoQuality`) ; page des chapitres sans flou CSS ni recalcul à chaque image (`setCss`, `setText`).
  Fin v54 (9 nov.) : rendu 240 Hz (`onView`/`spikesOnView` hors écran, `platCached`, `glowSprite`, `VIG_SPR`, `SKY_GRAD`) ; Or/Cristal (`shineGold`, `shineCrystal`), Émeraude/Galaxie légendaires (`legend:true`, `legendTex`) ;
  flammes Lave (`LAVA_FLAMES`, `drawSkinGlowOver` après `drawLighting`) ; piment = `{recolor}` ; Nuit 400 pièces / Corail gratuite (`save.nuitPaid`) ; `save.allCoins` = « Complété ⭐⭐ » ; chant du coin (`SONG_TUNE`).
  Démo : connexion admin à part (`settings.demoAdmin`, `demoSaveView`) ; le mode créateur du jeu complet n'ouvre plus la démo.
  Démo : `skinOf()` renvoie toujours Indigo (boutique fermée, sauvegarde partagée avec le jeu complet).
- Ouverture du chapitre 1 (v53) : `12b_ouverture_saison1.js`, état `opening`, 10 s ; lancée seulement depuis le menu (`playChapter`), pas par `newRun` ; passable après une première vue (`save.openingSeen`), comme la fin de la saison 2.
- `demo.html` et `aventure.html` ouverts en local partagent la même sauvegarde : `s2Visible` renvoie toujours faux dans la démo (sauf admin connecté).
- Chapitre 3 de la saison 1 (v52) : 3-2 L'Escalier refaite (sans chauves-souris, un thème par étage), nouvelle 3-4 Le Chemin de Ronde, boss Gardien en 3-5 (`loadRoom(2,4)`).
  Gardien : 5 + 5 PV, plus de piques ; `p2crumble` = plateforme fragile en phase 2 (`back:600` = retour après 10 s) ; sauter sur lui en vol = `grab` puis `player.slam` (jeté au sol, un cœur).
  Une bombe casse aussitôt une plateforme `p2crumble` (`breakPlatform`) ; celle du milieu reste solide. Rasage : 7 / 9 px/image, attaque et côté au hasard (`b.same` : deux fois de suite au plus), attente variable, demi-tour possible en phase 2 (`b.turnT`).
  Gemme du chapitre 3 : dans 3-4, au-dessus de l'écran (y −68), la pièce à y 30 est le seul indice. Les autres gemmes n'ont pas été retouchées.
- Pause (v52) : lignes cliquables (`pauseBtns`), `pauseRestart` (boss : reprend la phase sans rendre de cœurs), `openPauseKeys` (page Commandes, retour à la pause via `menu.pauseKeys`).
- Fuite finale : lave à 1,35 px/image ; le robot sans erreur bloque vers 1,8.
- Bonus Le Cosmos (v52) : salle 1 refaite d'après `capture pour correction/level design.png` (1210 × 680) ; `parTime` 90000 (1 min 30, choisi par l'utilisateur en v53). Tête en bas, le saut ne fait que 64 à 73 px.
  `route2` ignore les portes (`hp`) : les tester dans le vrai moteur. Après une téléportation dans un test, recaler la caméra, sinon les tirs disparaissent.
- Menu : la saison 2 n'apparaît qu'après la fin de la saison 1 (`s2Visible`, `refreshMainCh`) ; plus de barre de téléphone.
- v48 (retours GitHub de hugomslv) : touches dessinées cliquables dans les menus (`PROMPT_KEY`) ; touches au choix
  (page Commandes, `SET.keys`, `gameKey`) ; option saut automatique (`SET.autoJump`) ; cartes de chapitres nettes (`zoom`) ;
  numéro de version `v0.9.NN` en bas à gauche (`VERSION`, mis par le build d’après `versions/`) ; tag GitHub `v0.9.NN`
  (0.9 = démo ; passer en 1.0.0 quand le jeu complet sort en ligne). Mot de passe admin : seule l’empreinte SHA-256 (`ADMIN_HASH`).
- `perso/` (ignoré par git) : notes pour l'utilisateur, dont `perso/A_TESTER.md` (liste de choses à tester).
- `capture pour correction/` (ignoré par git) : captures d’écran que l’utilisateur dépose pour signaler un défaut.
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
