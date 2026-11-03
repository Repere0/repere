# Audit performance (V42, bloc 4, mesures finales en V43)

Date : 31/10/2026. **Mesures sur le build web dans Chromium, pas sur iPhone.** Le test Expo Go sur téléphone n'a pas été fait : il n'y a pas d'appareil dans la session. Les chiffres du web ne sont pas ceux de l'application installée.

## Méthode

- Build : `npx expo export --platform web` avec `EXPO_PUBLIC_REPERE_DONNEES=/data`, données du build précédent copiées dans `data/`.
- Servi localement, avec **compression gzip** (texte seulement), comme Netlify le fait par défaut. **Cette compression n'a pas été vérifiée sur Netlify** : la session n'a pas accès à Netlify. Une mesure sans compression est donnée en annexe pour montrer l'écart.
- Deux conditions : réseau local, et **4G simulée** (latence 150 ms, 1,6 Mbit/s en réception, CPU ralenti ×4, par la session DevTools de Chromium).
- Pour chaque écran : **trois essais, médiane**. Le « premier texte » est le temps entre le début de la navigation et l'apparition de plus de 40 caractères dans la page : il inclut le téléchargement **et** l'exécution du JavaScript.
- Parcours accueil → fiche élu → budget : trois **navigations complètes** (pas la navigation interne de l'application), cache du navigateur chaud.
- Script : `mono/scripts/mesure-web.mjs perf`.

## Poids des fichiers (build web)

| Fichier | Non compressé | Compressé (gzip) |
|---|---|---|
| `entry-*.js` (paquet principal) | 1 117 241 o (1,07 Mo) | 294 242 o (287 Ko) |
| `__common-*.js` | 215 530 o | non mesuré séparément |

Les polices et images n'ont pas été pesées une à une. La liste complète des requêtes par écran est dans la colonne « requêtes » ci-dessous.

## Mesures par écran (médiane de 3 essais, en millisecondes)

| Écran | Local : premier texte | Local : chargement | Requêtes | Ko transférés (compressés) | 4G simulée : premier texte | 4G simulée : chargement |
|---|---|---|---|---|---|---|
| `/` | 735 | 92 | 15 | 656 | 4005 | 2218 |
| `/a-venir` | 414 | 75 | 9 | 545 | 3749 | 2224 |
| `/chez-vous` | 419 | 76 | 9 | 548 | 3732 | 2234 |
| `/elus` | 418 | 78 | 26 | 595 | 3724 | 2217 |
| `/qui-decide` | 437 | 87 | 9 | 544 | 3707 | 2214 |
| `/actus` | 730 | 80 | 9 | 544 | 4034 | 2260 |
| `/a-propos` | 706 | 77 | 8 | 540 | 3986 | 2219 |
| `/argent` | 709 | 78 | 8 | 543 | 3975 | 2207 |
| `/bienvenue` | 710 | 78 | 8 | 541 | 3978 | 2216 |
| `/confidentialite` | 714 | 80 | 8 | 541 | 3998 | 2225 |
| `/confort-lecture` | 711 | 77 | 8 | 541 | 3979 | 2222 |
| `/dictionnaire` | 709 | 74 | 8 | 541 | 4052 | 2227 |
| `/faq` | 702 | 73 | 8 | 541 | 4019 | 2232 |
| `/mes-elus` | 711 | 75 | 8 | 541 | 4055 | 2242 |
| `/partager` | 700 | 71 | 8 | 543 | 4033 | 2253 |
| `/pour-vous` | 703 | 75 | 9 | 546 | 3997 | 2216 |
| `/procedure` | 707 | 71 | 8 | 541 | 4001 | 2213 |
| `/recherche` | 711 | 75 | 10 | 546 | 4000 | 2211 |
| `/scrutins` | 705 | 77 | 11 | 549 | 4016 | 2218 |
| `/sources` | 700 | 72 | 8 | 540 | 4026 | 2237 |
| `/vote` | 706 | 74 | 8 | 542 | 4023 | 2237 |
| `/voter` | 713 | 76 | 8 | 540 | 4044 | 2234 |

**Parcours accueil → fiche élu → budget**

- Réseau local, premier texte : 721 ms → 718 ms → 717 ms (somme ≈ 2156 ms).
- 4G simulée, premier texte : 3969 ms → 3950 ms → 4040 ms (somme ≈ 12.0 s).

## Comparaison avec les cibles

| Cible | Source | Résultat |
|---|---|---|
| « Apple recommande moins de 400 ms pour la première interaction » | **Non vérifiée.** Aucune source lue dans la session : la brief la cite sans référence. | Ne pas s'en servir comme référence. |
| Optimiser ce qui dépasse 500 ms (brief) | Seuil de la brief | **Dépassé sur tous les écrans, en 4G simulée** (3,7 à 4,1 s) **et en local sur la plupart des écrans** (environ 700 ms). Les onglets sont à environ 415 ms en local, sous 500 ms. |

Le seuil de 400 ms, s'il était une référence, serait dépassé en local sur les onglets (415 ms) et sur la plupart des écrans.

## Optimisations appliquées

**Aucune.** Le seul gain identifié est de **réduire le paquet JavaScript principal** (1,07 Mo, 287 Ko compressé) : tout le texte n'apparaît qu'une fois ce paquet téléchargé et exécuté. Les mesures montrent que c'est là que se joue le premier texte. Cette réduction suppose de découper le build web (chargement des écrans à la demande), un changement de build qui n'a pas été fait dans cette session, parce que :

- il doit être mesuré avant et après, sur le même réseau simulé, pour prouver le gain ;
- il touche la chaîne de build partagée par tous les écrans, dont le comportement hors ligne (invariant 1).

Ce travail est reporté, avec sa mesure de départ ci-dessus, dans `BLOCAGES.md` §51.

## Annexe : sans compression

Le même test, servi sans compression, donne en 4G simulée un chargement médian d'environ **7,1 s** et **1,5 Mo** par écran (médiane des écrans, `scratchpad/perf.json`). La compression réduit le transfert moyen d'un écran d'environ 1 559 Ko à 550 Ko (facteur 2,8), et le premier texte en 4G simulée d'environ 8,9 s à environ 3,9 s. C'est pour cela que la mesure compressée est retenue comme référence, à condition que Netlify compresse comme l'hypothèse le suppose.

## Ce qui n'est pas mesuré

- L'application installée (Expo Go) sur iPhone ou Android.
- La compression réelle de Netlify (en-têtes de réponse).
- Les polices, images et la mémoire utilisée.
- Les temps d'interaction (toucher, défilement) : seul le premier affichage de texte est mesuré.
