# Journal des modifications

Toutes les modifications notables de Repère sont consignées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet adopte le [versionnage sémantique](https://semver.org/lang/fr/). Aucune version n'a encore été étiquetée (`git tag`) : les dates ci-dessous sont celles des commits qui en témoignent.

## [Non publié]

### Ajouté
- Fichiers communautaires : `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`, `.editorconfig`, modèles d'issue et de demande de fusion, `CODEOWNERS`.
- Analyse CodeQL, revue des dépendances sur les demandes de fusion, alertes Dependabot.

### Modifié
- Les workflows tournent sur `ubuntu-24.04` au lieu de `ubuntu-latest` : depuis le 15/11/2026, `ubuntu-latest` est Ubuntu 26.04, où Playwright 1.56 ne s'installe pas.
- Les notes de version et rapports des versions précédentes passent de la racine à `docs/historique/`.

### Retiré
- Sept copies anciennes de l'application mono-fichier (`app_repere_v18_13` à `v18_19`), une copie de secours `.bak` et une archive de débogage, soit environ 125 Mo dans l'arbre de travail. Elles restent dans l'historique Git.

## [0.1.0] — bêta Île-de-France, en cours

Version déclarée dans `mono/apps/mobile/app.json`. Rien n'est publié sur les magasins.

### Ajouté
- Le Parlement : l'Assemblée et le Sénat, l'hémicycle dessiné d'après le plan réel de la salle (13/11/2026, ADR 0009).
- Premier lancement en trois écrans avec un prénom facultatif gardé sur l'appareil ; quiz civique du dictionnaire avec points et rangs, au seul quiz (13–14/11/2026, ADR 0009 et 0010).
- Présidentielle 2027 : candidats, photos sous licence libre, sites de campagne quand ils existent (12–14/11/2026, ADR 0008).
- Actualités lues dans le flux RSS officiel des mairies, jamais dans leur HTML (31/10/2026, ADR 0007).
- Comparaisons factuelles entre communes, annoncées comme des calculs (30/10/2026, ADR 0002).
- Application Expo (React Native) sur les vraies données : qui décide, finances de la commune, votes des députés, questions au Gouvernement (à partir du 29/09/2026).

### Modifié
- La production bascule de l'application mono-fichier vers le monorepo `mono/` (23/09/2026).

## Ère mono-fichier (v18.x, août–septembre 2026)

Application PWA en un seul fichier HTML (`app_repere_v18_20.html`), collecte quotidienne des sources publiques à partir du 18/08/2026. Ses notes de version sont dans `docs/historique/RESUME-v*.md`.

[Non publié]: https://github.com/Repere0/repere/commits/main
[0.1.0]: https://github.com/Repere0/repere/blob/main/mono/apps/mobile/app.json
