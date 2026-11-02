# L'aventure spécifique

Un jeu de plateforme en français, fait maison : aide **XELIAX** à retrouver la ficelle aux olives !
Sauts, double saut, tir, boss… et bien d'autres surprises.

## 🎮 Jouer à la démo
**👉 https://xeliax9.github.io/aventure-specifique/**

Directement dans le navigateur, sur ordinateur ou sur téléphone, sans rien installer.
La démo contient les **chapitres 1 et 2** ; la suite arrive bientôt.
Ta progression est gardée dans ton navigateur.

| Action | Clavier | Téléphone |
|---|---|---|
| Bouger | A / D ou ◀ ▶ | ◀ ▶ |
| Sauter, double saut | W, Espace ou ▲ | ▲ |
| Tirer (garder : super tir) | J | ● |
| Parler | E ou ▼ | ● |
| Pause | P ou Échap | II |

Les touches se changent dans **Paramètres → Commandes** (pratique en AZERTY).

## 💬 Donner ton avis
Un bug, une idée, un niveau trop dur ? [Ouvre une issue](https://github.com/Xeliax9/aventure-specifique/issues/new)
(compte GitHub gratuit), ou clique sur « Donne ton avis » à la fin de la démo. Merci !

Les nouveautés de chaque version sont dans les [Releases](https://github.com/Xeliax9/aventure-specifique/releases)
(la version s'affiche en bas à gauche du menu).

---

## 🛠️ Pour les développeurs

Le jeu est découpé en petits fichiers dans `src/`. Le script `outils/build.js` les rassemble en **un seul fichier**,
`dist/aventure.html`, qu'on ouvre dans un navigateur pour jouer (aucune connexion nécessaire).

### Construire
```
node outils/build.js           # le jeu complet -> dist/aventure.html
node outils/build.js --demo    # la démo (celle du site)
```
(Il faut [Node.js](https://nodejs.org). Le dossier `dist/` n'est pas versionné, il est généré par le build.)

### Publier
Le site est publié automatiquement (GitHub Actions) à chaque tag `v0.9.NN` poussé :
`git tag -a v0.9.NN -m "…" && git push origin v0.9.NN`. Le numéro NN suit `versions/vNN.txt`.

### Où est quoi
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
| `versions/vNN.txt` | ce qui a changé à chaque version, expliqué simplement |
| `outils/tests/` | tests automatiques (`npm install` une fois, puis `npm test`) |
| `outils/verif/route2.js` | vérifie qu'une salle de la saison 2 est faisable : `npm run route` |
| `outils/robot/` | un robot qui joue un parcours dans le vrai moteur |
