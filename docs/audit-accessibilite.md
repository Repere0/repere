# Audit accessibilité (V42, bloc 3, complété en V43)

Date : 31/10/2026. **Il n'y a ni iPhone ni téléphone Android dans cette session.** Aucun lecteur d'écran (VoiceOver, TalkBack) n'a été utilisé. Les parties A et B sont donc une analyse **statique** du code : elles disent ce que le code déclare, pas ce qu'un lecteur d'écran annonce. La partie C a été **mesurée** dans Chromium.

## Ce qui a été fait

- Audit statique : `mono/scripts/audit-a11y.mjs`, qui lit le JSX de `apps/mobile/src/app` avec l'analyseur TypeScript du projet (relançable : `node mono/scripts/audit-a11y.mjs`).
- Mesure clavier : `mono/scripts/mesure-web.mjs clavier`, dans Chromium, sur le build web exporté (`expo export --platform web`), servi avec compression et repli sur `index.html`.

## Corrections de la brief

- **Critère « focus visible »** : la brief cite 2.4.11 (WCAG 2.2). Le critère 2.4.11 est *Focus Not Obscured* (le focus n'est pas masqué). Le critère « focus visible » est **2.4.7**, et l'indicateur de contraste relève de **1.4.11**. Les trois sont mesurés ci-dessous.
- **Nombre d'écrans** : la brief parle de 18 écrans. L'application en compte **24** dans `src/app` (hors `_layout` et de la route de prévisualisation `dev-impact`).

## A) VoiceOver (iOS) : analyse statique, non vérifiée à l'écran

Règle appliquée : un élément interactif **sans nom accessible** (ni `accessibilityLabel`, ni texte) fait échouer l'écran. Un champ de saisie sans étiquette aussi. Les rôles absents et les images sans étiquette sont signalés comme réserves, sans faire échouer l'écran.

Les composants maison (`Plus`, `Choix`, `Interrupteur`, `Lien`, `Resultat`, `Case`, `GroupeRow`…) sont vérifiés là où ils sont définis, sur leur `Pressable` natif : chacun porte un `accessibilityLabel`.

| Écran | Éléments interactifs natifs | Sans nom | Sans rôle | Images sans étiquette | Verdict statique |
|---|---|---|---|---|---|
| `(onglets)/a-venir.tsx` | 8 | 0 | 0 | 0 | **PASS** |
| `(onglets)/chez-vous.tsx` | 0 | 0 | 0 | 0 | **PASS** |
| `(onglets)/elus.tsx` | 1 | 0 | 0 | 0 | **PASS** |
| `(onglets)/qui-decide.tsx` | 4 | 0 | 0 | 0 | **PASS** |
| `a-propos.tsx` | 3 | 0 | 0 | 0 | **PASS** |
| `actus.tsx` | 1 | 0 | 0 | 0 | **PASS** |
| `annuaire-fiche.tsx` | 0 | 0 | 0 | 0 | **PASS** |
| `argent.tsx` | 0 | 0 | 0 | 0 | **PASS** |
| `bienvenue.tsx` | 6 | 0 | 0 | 0 | **PASS** |
| `confidentialite.tsx` | 0 | 0 | 0 | 0 | **PASS** |
| `confort-lecture.tsx` | 2 | 0 | 0 | 0 | **PASS** |
| `dictionnaire.tsx` | 3 | 0 | 0 | 0 | **PASS** |
| `elu.tsx` | 4 | 0 | 0 | 0 | **PASS** |
| `faq.tsx` | 2 | 0 | 0 | 0 | **PASS** |
| `index.tsx` | 18 | 0 | 0 | 0 | **PASS** |
| `mes-elus.tsx` | 1 | 0 | 0 | 0 | **PASS** |
| `partager.tsx` | 3 | 0 | 0 | 0 | **PASS** |
| `pour-vous.tsx` | 3 | 0 | 0 | 0 | **PASS** |
| `procedure.tsx` | 4 | 0 | 0 | 0 | **PASS** |
| `recherche.tsx` | 1 | 0 | 0 | 0 | **PASS** |
| `scrutins.tsx` | 5 | 0 | 0 | 0 | **PASS** |
| `sources.tsx` | 1 | 0 | 0 | 0 | **PASS** |
| `vote.tsx` | 3 | 0 | 0 | 0 | **PASS** |
| `voter.tsx` | 1 | 0 | 0 | 0 | **PASS** |

**Résultat : 24 écrans de `src/app` (81 fichiers audités au total, `_layout.tsx` et `dev-impact.tsx` exclus) sur 24 passent la règle statique.** Ce résultat ne dit rien de :

- l'**ordre de lecture** (non mesurable sans lecteur d'écran) ;
- la **qualité** des libellés (une étiquette peut être présente et mal formulée) ;
- les écrans dont les éléments sont des composants partagés sans `Pressable` natif dans `src/app` : ils sont audités dans `src/ui`, qui passe aussi (0 échec).

**À faire sur iPhone** : parcourir les 24 écrans de `src/app` (81 fichiers audités au total, `_layout.tsx` et `dev-impact.tsx` exclus) avec VoiceOver, et noter pour chaque écran l'ordre de lecture et les libellés lus.

## B) TalkBack (Android) : analyse statique, non vérifiée

Même analyse que A : TalkBack s'appuie lui aussi sur `accessibilityLabel` et `accessibilityRole`. **Les différences entre les deux lecteurs n'ont pas été mesurées** : elles demandent un téléphone Android. Le même tableau statique s'applique donc, sans différence vérifiée.

## C) Clavier (web) : mesuré dans Chromium

Conditions : viewport 390 × 844, thème clair, 22 écrans navigables sans paramètre, Tab répété jusqu'au retour au premier arrêt (plafond de 80 arrêts). Les écrans `annuaire-fiche` et `elu` demandent des paramètres : ils ne sont pas inclus dans ce tableau.

| Écran | Arrêts de focus | Sans indicateur | Masqués par un élément fixe | Feuilles ouvertes et fermeture par Échap | Erreur JavaScript |
|---|---|---|---|---|---|
| `/` | 16 | 0 | 0 | Échap : fermée | - |
| `/a-venir` | 7 | 0 | 0 | Échap : fermée | - |
| `/chez-vous` | 7 | 0 | 0 | Échap : fermée | - |
| `/elus` | 80 | 0 | 0 | Échap : fermée | - |
| `/qui-decide` | 7 | 0 | 0 | Échap : fermée | - |
| `/actus` | 20 | 0 | 0 | - | erreur JS : Share is not supported in this browser |
| `/a-propos` | 1 | 0 | 0 | - | - |
| `/argent` | 2 | 0 | 0 | - | - |
| `/bienvenue` | 18 | 0 | 0 | - | - |
| `/confidentialite` | 1 | 0 | 0 | - | - |
| `/confort-lecture` | 14 | 0 | 0 | - | - |
| `/dictionnaire` | 22 | 0 | 0 | - | - |
| `/faq` | 3 | 0 | 0 | - | - |
| `/mes-elus` | 2 | 0 | 0 | - | - |
| `/partager` | 2 | 0 | 0 | - | - |
| `/pour-vous` | 12 | 0 | 0 | - | - |
| `/procedure` | 9 | 0 | 0 | - | - |
| `/recherche` | 2 | 0 | 0 | - | - |
| `/scrutins` | 3 | 0 | 0 | - | - |
| `/sources` | 2 | 0 | 0 | - | - |
| `/vote` | 2 | 0 | 0 | - | - |
| `/voter` | 2 | 0 | 0 | - | - |


**Constats :**

1. **Tous les arrêts de focus ont un indicateur** (234 arrêts, 0 sans indicateur). Il s'agit d'un contour de 1 px `rgb(16,16,16)` sur la plupart des écrans, et d'un contour teal 2 px sur un écran.
2. **Aucun arrêt masqué** par la barre d'onglets : le critère 2.4.11 est satisfait sur les écrans mesurés.
3. **Échap ferme les feuilles mesurées** : « Réglages de l'affichage » et « Pourquoi je vois ça : le montant de Melun ». La feuille « Source » (`ui/source.tsx`) n'a pas été atteinte par le test : **non vérifiée**.
4. **`/elus`** : la liste des élus dépasse 80 arrêts de focus, le test s'arrête au plafond. Une liste longue se parcourt touche par touche : constat, pas défaut mesuré.
5. **`/actus`** : une erreur JavaScript au chargement, `Share is not supported in this browser`. C'est le partage natif de React Native, non pris en charge sur le web. Sans effet sur le téléphone, mais le bouton de partage ne marche pas sur le web.
6. **Contraste du contour (1.4.11)** : sur fond clair `#F5F2EC`, le contour `#101010` atteint **17,03:1**.

**Thème sombre** (mesuré : les pixels de la capture d'écran, pas la valeur calculée) : l'anneau de focus est **blanc `#FFFFFF`** sur le fond `#161513`, soit **18,25:1**. La mesure porte sur un seul élément (le bouton « Partager » de l'écran « Actus »), dans Chromium. **Ce résultat corrige une hypothèse antérieure** (1,04:1, retirée, voir `BLOCAGES.md` §50 ; tirée de la valeur calculée `rgb(16,16,16)`, qui n'est pas la couleur peinte). Il n'est pas démontré que **tous** les éléments en thème sombre aient un contraste suffisant : c'est à vérifier sur iPhone.

## Libellés corrigés

**Aucun libellé n'a été modifié.** L'audit statique n'a trouvé aucun élément interactif sans nom accessible, et la mesure clavier n'a relevé aucun problème de focus. Les réécritures de texte visible sont dans `docs/audit-copy.md`, qui n'est pas appliqué (décision D90).

## Ce qui reste à faire

- Parcourir les 24 écrans de `src/app` (81 fichiers audités au total, `_layout.tsx` et `dev-impact.tsx` exclus) avec VoiceOver et TalkBack sur appareil, et noter l'ordre de lecture et les libellés lus.
- Mesurer la feuille « Source » et les écrans `annuaire-fiche` et `elu` avec paramètres.
- Corriger le partage sur le web (`Share` non supporté) : sans effet sur le téléphone, à traiter avec la version web.
- Mesurer le focus en thème sombre sur chaque type de contrôle, pas seulement sur le bouton « Partager ».
