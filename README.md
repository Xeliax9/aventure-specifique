# L'aventure spécifique

Le jeu est découpé en petits fichiers dans `src/`. Le script `outils/build.js` les rassemble en **un seul fichier**,
`dist/aventure.html`, qu'on ouvre dans un navigateur pour jouer (aucune connexion nécessaire).

## Jouer
Ouvre `dist/aventure.html` dans ton navigateur.

## Modifier puis reconstruire
```
node outils/build.js
```
(Il faut [Node.js](https://nodejs.org). Le fichier `dist/aventure.html` est réécrit.)

## Où est quoi
| Dossier / fichier | Contenu |
|---|---|
| `src/page.html`, `src/style.css` | la page (boutons tactiles, mise en page) |
| `src/ordre.json` | l'ordre dans lequel les fichiers sont assemblés |
| `src/js/00_bases.js` | maths, canvas, constantes de la physique (saut, gravité, dash…) |
| `src/niveaux/saison1.js` | les niveaux de la saison 1 |
| `src/niveaux/saison2/salles/<monde>-<salle>.js` | **une salle de la saison 2 par fichier** (ex. `1-2.js`) |
| `src/niveaux/saison2/entetes.js` | les mondes de la saison 2 (nom, décor, pouvoirs, liste des salles) |
| `src/niveaux/saison2.js` | généré automatiquement depuis les salles : ne pas modifier à la main |
| `src/niveaux/bonus.js` | les chapitres bonus |
| `src/js/01_…` à `14_…` | couleurs et sons, chargement, effets, dialogues, mise à jour du jeu, boss, dessins, menus, contrôles |
| `outils/tests/` | tests automatiques (`npm install` une fois, puis `npm test`) |
| `outils/verif/route2.js` | vérifie qu'une salle de la saison 2 est faisable : `npm run route` |
| `outils/robot/` | un robot qui joue un parcours dans le vrai moteur |
