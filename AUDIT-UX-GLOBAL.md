# Audit UX global de l'application mobile, 11 novembre 2026

Branche `feat/grande-refonte-ux`. Demande du porteur : réduire les pages, supprimer les doublons,
uniformiser chargements et transitions. **Rien n'est vérifié sur iPhone** : captures et mesures à
390 × 844 dans Chromium, sur l'export web.

## Ce qui est fait, et ce qui ne l'est pas

- **Fait : le doublon le plus coûteux, les deux accueils.** L'application avait deux écrans d'accueil
  pour une même commune ; elle n'en a plus qu'un. C'est le changement d'ergonomie de cette passe.
- **Fait : un écran supprimé** (« Mes élus »), un point d'entrée unique pour les réglages, des
  chargements uniformes, un chargement sans fin corrigé.
- **Pas fait : la réduction massive du nombre de pages.** L'application passe de 29 à 28 écrans. Quatre
  autres fusions sont décrites plus bas, avec leur coût ; aucune n'est appliquée, parce que chacune
  retire un contenu ou un partage que des contrôles protègent, et qu'aucune ne peut être validée sur
  un téléphone depuis ici. Ce n'est donc pas encore « le niveau international » : c'est une
  architecture plus nette, pas un nouveau dessin.

## 1. Architecture : ce que l'audit a trouvé

La barre basse a déjà quatre onglets (Aujourd'hui, Qui décide, Finances, Le calendrier). Le défaut
n'était pas le nombre d'onglets : c'était ce qui vivait en dehors d'eux.

| doublon constaté | où | décision |
|---|---|---|
| **Deux accueils.** `/` (sans barre d'onglets) et l'onglet « Aujourd'hui » montraient pour la même commune le budget, le vote du député, les décideurs et les dernières publications. Avec une commune gardée, le lecteur ouvrait `/`, puis devait toucher « Voir ce qui se passe à … » pour atteindre les onglets. | `app/index.tsx`, `(onglets)/chez-vous.tsx` | **Appliqué.** Avec une commune gardée, l'application s'ouvre sur « Aujourd'hui ». `/` redevient le choix de la commune, atteint par « ‹ Communes ». |
| **« Mes élus » et « Qui décide »** : même source (`chaineDecision`), mêmes personnes, deux mises en page. | `app/mes-elus.tsx` | **Appliqué.** « Mes élus » est supprimé ; la tuile de l'accueil ouvre « Qui décide ». |
| **Tuiles « Qui décide » et « Le calendrier »** dans « Aller plus loin », juste au-dessus des onglets du même nom. | `(onglets)/chez-vous.tsx` | **Appliqué.** Retirées. À leur place, les accès qui n'existaient que sur l'ancien accueil : Présidentielle 2027, Ma voix, L'Assemblée, Pour vous. |
| **Réglages et informations éparpillés** : le confort de lecture n'était atteignable que depuis `/` ; confidentialité, à propos et FAQ depuis la roue. | `ui/reglages.tsx` | **Appliqué.** La roue des onglets est le seul point d'entrée ; le confort de lecture y est ajouté. |
| **Deux fiches d'élu** : `elu` (depuis « Qui décide », avec les votes) et `annuaire-fiche` (depuis la liste « Élus », avatar centré, sans vote). | `app/elu.tsx`, `app/annuaire-fiche.tsx` | **Proposé.** Voir § 4. |
| **Trois fils de publications** : « Actualités » (faits de la rédaction), « Pour vous » (tout, filtré par sujets), « Repère du jour » (trois faits du jour). | `actus`, `pour-vous`, `repere-du-jour` | **Proposé.** Voir § 4. |
| **Trois écrans d'élection** : « Ma voix », « Présidentielle 2027 », « Les règles ». | `voter`, `presidentielle-2027`, `reglement-2027` | **Proposé.** Voir § 4. |
| **`/argent` et l'onglet « Finances »** : deux routes, un seul composant. | `argent.tsx`, `(onglets)/finances.tsx` | **Laissé.** Le lecteur ne voit pas deux écrans : la route `/argent` ouvre le même écran au-dessus de la barre, avec un retour vers « Aujourd'hui ». |
| **`dev-impact`** | outil de relecture, monté seulement en développement | **Laissé.** Il ne rend rien dans l'application publiée. |

Capture : [avant et après de l'ouverture](docs/audit-ux/un-seul-accueil.jpg) (ancien accueil ; ouverture
actuelle ; bas d'« Aujourd'hui » ; roue).

## 2. Ce qui change pour le lecteur

1. Il a gardé sa commune : l'application s'ouvre sur elle, onglets visibles. Un geste de moins à
   chaque ouverture. Une seule fois par lancement ; « ‹ Communes » mène toujours au choix.
2. Première ouverture, ou aucune commune gardée : rien ne change.
3. Le rappel de la prochaine élection, qui vivait sur l'ancien accueil, est maintenant sous les
   réponses d'« Aujourd'hui ».
4. La roue (en haut à droite de chaque onglet) : affichage, confort de lecture, confidentialité,
   à propos, questions fréquentes.

**Ce que le lecteur perd, à savoir avant de fusionner :**

- « Mes élus » disait en toutes lettres que les sénateurs et les conseillers régionaux ne sont pas
  dans les données de Repère. « Qui décide » ne le dit pas. La phrase est perdue.
- « Mes élus » avait un bouton « Partager » (texte). « Qui décide » n'en a pas.
- Un lien `/mes-elus` déjà partagé n'ouvre plus rien. La bêta n'est pas lancée : risque jugé nul.
- Les blocs de l'ancien accueil (budget, vote, dernières publications) restent dans `index.tsx` et
  s'affichent encore quand on revient au choix de commune avec une commune gardée. Ils doublent
  « Aujourd'hui ». Les retirer touche une quinzaine de contrôles : non fait.

## 3. Chargements, états, transitions

| constat | correction |
|---|---|
| Quatre chargements de l'écran des scrutins et un de la présidentielle étaient une carte ou un texte « Chargement… », pas le squelette commun. | `SquelettesListe` partout. |
| **Questions au Gouvernement : « Chargement » restait affiché pour toujours** quand le relevé n'arrivait pas. Un état faux. | Une phrase d'absence et la source officielle, après l'échec ; le squelette seulement pendant l'attente. |
| Transitions | Déjà uniformes, relues et laissées : glissement du système pour la pile, montée depuis le bas pour la recherche et le partage, fondu pour les onglets, tout passant par `ui/mouvement.ts` (qui respecte « réduire les animations »). |

Auto-audit visuel : l'outil mesuré d'hier (`tests/audit-ui-web.mjs`) repasse sans écart sur les 28
écrans et les deux thèmes. Les défauts de densité et d'alignement relevés à l'œil ont été corrigés
dans la PR #183 ; cette passe n'en a pas trouvé de nouveaux sur les écrans touchés. Dix liens portent
encore un chevron tapé en texte (« › ») au lieu d'une icône : non corrigé, des parcours les lisent.

## 4. Les fusions proposées, non appliquées

Par ordre de gain pour le lecteur. Chacune demande un oui du porteur, parce qu'elle retire quelque chose.

1. **Une seule fiche d'élu.** `annuaire-fiche` rejoint `elu` : même en-tête, les votes quand ils existent.
   Coût : `elu` attend une commune (votes filtrés par circonscription) ; la fiche d'annuaire porte le
   partage en image. Il faut choisir ce que devient ce partage. 28 → 27.
2. **Un seul fil.** « Actualités » devient un filtre de « Pour vous ». Coût : « Actualités » n'a que les
   faits validés par le porteur ; « Pour vous » mélange scrutins, faits et comptes. Les deux n'ont pas la
   même promesse éditoriale. 27 → 26.
3. **Les règles dans la présidentielle.** `reglement-2027` devient un quatrième onglet de
   `presidentielle-2027`. Coût : deux barres d'onglets empilées (candidats / débats / réunions / règles,
   puis les quatre fiches). À redessiner. 26 → 25.
4. **Vider l'ancien accueil.** Retirer de `index.tsx` les blocs que « Aujourd'hui » porte déjà. Aucun
   écran en moins, mais 300 lignes et le dernier doublon visible.
5. **« Repère du jour ».** Ses trois faits sont ceux des réponses d'« Aujourd'hui ». Il ne reste propre
   à cet écran que le partage en story. À garder tant que le partage y vit.

## 5. Contrôles

- Banc 334 / 334, `tsc` 0 erreur, audit mesuré sans écart, neuf parcours navigateur verts en local.
- Contrôles modifiés parce que le produit a changé, pas pour passer : `parcours.test.mjs` (le lien
  vers « Qui décide » est l'onglet), `parcours-web.mjs` (réouverture directe ; onglets au lieu de
  tuiles), `zoom-web.mjs` (confort de lecture par la roue), `commune-web.mjs` et
  `partage-texte-web.mjs` (« Mes élus » retiré).
- `DESIGN.md` est créé à la racine : il n'existait pas dans le dépôt. Il recopie les valeurs du code.

## 6. Non vérifié

- iPhone : l'ouverture directe sur « Aujourd'hui » (délai, éclair de l'ancien accueil avant la
  bascule), les gestes de retour, les zones sûres, VoiceOver.
- Dans Chromium, l'ancien accueil reste à l'écran le temps de charger la liste des communes, puis
  bascule. Durée non mesurée ; sur un téléphone lent, cela peut se voir.
- Les écrans vus seulement vides dans le conteneur (scrutins, questions au Gouvernement, calendrier,
  groupe) : la CI les mesure.
