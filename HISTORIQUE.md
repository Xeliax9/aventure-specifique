# Historique du projet (résumé de la conversation avec Claude dans l'application, jusqu'au 31 octobre 2026)

À lire avec `CLAUDE.md`. Ce fichier résume ce qui a été décidé et ce que l'utilisateur a aimé ou non.

## Ce que l'utilisateur veut (ses retours, à respecter)
- Les niveaux doivent être **aussi bons que la saison 1** : lisibles, chemin clair, ennemis et pièges « stress » mais justes.
- Il **déteste** : niveaux vides ou bizarres, plateformes trop collées où on avance tout droit, piques cachées ou sur les
  murs qu'il faut escalader, passages « impossibles » au pixel près, structures labyrinthiques, répétition.
- Il **aime** : sauter → prendre une orbe → resauter pour atteindre une plateforme ; les planches qui tombent ;
  les tours de glace où l'on grimpe avec saut de mur + dash vers le même mur ; des cœurs placés par-ci par-là.
- Il a menacé de tout recommencer si le résultat est médiocre : vérifier chaque niveau (route2 + robot + coup d'œil).
- Toujours lui dire quand les fichiers sont mis à jour et lui rappeler `git add . / git commit / git push`.

## Chronologie (versions du jeu)
- v28 : double saut confisqué en 2-1 et 2-2 (Gaston), rendu en 2-3 ; en 3-1 le « double saut amélioré » donne le dash.
- v29 : version mobile — bouton sauter plus grand, collé au bord droit, zone tactile tolérante (le doigt le plus proche).
- v30 : **planches qui tombent** (`fall:true`, suivent la gravité, pont sur les piques, écrasent les ennemis, reviennent
  à leur place à la mort) ; **fin de saison 1** : XELIAX saute de joie, va manger la ficelle, la pie la lui vole
  (seulement la ficelle normale, pas la dorée ni la cristal). Mamie Farine (saison 2) le mentionne.
- v31 : bug du yéti corrigé (après un coup de dash, il blessait XELIAX ; un boss saison 2 touché est inoffensif un instant) ;
  « Bats le boss pour ouvrir ! » n'apparaît plus qu'une fois.
- v32 : mondes 1 et 2 de la saison 2 refaits façon saison 1 ; Glacier 3-2 / 3-3 remis comme avant mais corrigés
  (plus de piques sur le dessus des blocs « Rebondis de bloc en bloc », plus de piques sur les murs à grimper,
  ajout de canons à flammes, chauves-souris, plateforme cassable). Une tentative de tours de glace vides a été refusée.
- v33 : monde 2 validé par l'utilisateur, + un cœur par salle. Monde 1 jugé « moyen » à partir de 1-2.
- v34 : monde 1 refait encore (1-1 gardé) ; 4-1 L'Orage et 4-2 Le Grand Arbre refaits (ils étaient « impossibles »).
  Projet découpé en fichiers (`src/`, `outils/`), mis sur GitHub (Xeliax9/aventure-specifique).

## À faire / idées en attente
- Faire jouer et valider le nouveau monde 1 (1-2 Chemin des Nuages, 1-3 Les Planches, 1-4 Tempête Rose) et 4-1 / 4-2.
- Idée de l'utilisateur (dessin) : niveaux « tour de glace » — mur de gauche et de droite, on grimpe en zigzag
  (saut de mur puis dash vers le même mur), plateforme cassable au milieu, bloc suspendu avec piques sur un côté,
  chauve-souris en haut, machine qui tire des flammes tout droit, piques en bas du mur de droite. À intégrer proprement
  dans le Glacier sans le vider.
- GitHub Pages possible (copier `dist/aventure.html` en `index.html`) pour un lien public.
- Le jeu est aussi publié comme page Claude (lien privé de l'utilisateur) : la version là-bas peut être en retard.

## Rappel sécurité
- Le mode créateur (debug) a un mot de passe visible dans le code : ce n'est pas une vraie protection.
