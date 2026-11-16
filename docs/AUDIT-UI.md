# Audit UI/UX — les fondamentaux, écran par écran (16/11/2026)

Branche `audit/ui-fondamentaux`, depuis `main` à 628093ef. **Aucun code de l'application n'a été modifié.** Les mesures brutes sont dans `docs/audit-ui-2026-11-16/mesures.json`, les captures et les sondes dans le même dossier.

## Comment c'est mesuré, et ce qui ne l'est pas

- **Montage** : export web de l'application (`npm run build:web`) servi en local. 29 écrans en clair et en sombre, en Chromium avec émulation iPhone (390 × 844, tactile, user-agent iOS). Profil de lecture par défaut ; commune choisie : Melun (77288).
- **Outils** :
  - `axe-core` 4.10 pour l'accessibilité automatique ;
  - une sonde maison qui mesure les tailles de texte, les interlignes, les contrastes, les cibles tactiles et l'écart entre elles, l'alignement sur la grille de 4, les pavés de texte, les noms accessibles, le décalage de mise en page (CLS) et la présence d'un bouton retour ;
  - une seconde sonde qui ralentit (4 s par fichier) ou coupe les fichiers `/data/`, pour voir les états de chargement et d'erreur.
- **Limites, dites franchement** :
  1. **Pas de WebKit** : seul Chromium est installé dans le conteneur, et `playwright install` y est interdit. Le rendu Safari et le natif iOS (VoiceOver, Dynamic Type, gestes) ne sont **pas mesurés**.
  2. **Pas de Lighthouse** : il n'est pas installé. axe-core couvre la partie accessibilité.
  3. **Données incomplètes** : le conteneur ne joint pas `repereapp.netlify.app`. Les scrutins détaillés, l'agenda et les actualités RSS manquent à l'export local. **Calendrier, scrutins et questions au Gouvernement n'ont donc été vus qu'à l'état vide.**
  4. Les critères **C7** (retour visuel au toucher) et **C10** (proximité, alignement) ne se mesurent pas tous automatiquement. C7 est jugé sur le code : `pressed`, `enfonce`, `Pression`. C10 est jugé sur les captures.
  5. **Score** = critères conformes / critères applicables. « — » veut dire sans objet : écran sans donnée asynchrone pour C6.

**Règles de notation** (mesures) :

| Critère | ✅ conforme | ⚠️ partiel | ❌ non conforme |
|---|---|---|---|
| C1 | un titre, puis un élément dominant | plusieurs éléments de même poids | aucun titre |
| C2 | ≤ 5 % des espacements hors de la grille de 4 | ≤ 15 % | au-delà |
| C3 | — | interligne < 1,35 sur du texte de corps sur plusieurs lignes | texte < 12 px |
| C4 | — | — | texte sous 4,5:1 (3:1 en grand) |
| C5 | — | deux cibles à moins de 8 px | cible < 44 px |
| C9 | — | pavé de plus de 4 lignes, ou plus de 150 mots, ou plus de 20 cibles dans le premier écran | les deux |
| C11 | — | titres mal structurés | violation axe « critical » ou « serious » |
| C12 | — | — | CLS > 0,1 au chargement normal |

## 1. Tableau récapitulatif

C1 hiérarchie · C2 grille · C3 typographie · C4 contrastes · C5 cibles · C6 états · C7 retour visuel · C8 navigation · C9 densité · C10 proximité et alignement · C11 accessibilité · C12 performance perçue

| Écran | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 | C10 | C11 | C12 | Non conformes | Score | Priorité |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `accueil` | ⚠️ | ❌ | ✅ | ✅ | ⚠️ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | C2, C6, C11, C12 | 6/12 | P0 |
| `qui-decide` | ✅ | ⚠️ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ⚠️ | ⚠️ | ✅ | C6, C9 | 7/12 | P0 |
| `chez-vous` | ⚠️ | ❌ | ✅ | ✅ | ⚠️ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | C2, C6, C11 | 7/12 | P0 |
| `finances` | ⚠️ | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | C2, C6 | 8/12 | P0 |
| `argent` | ⚠️ | ⚠️ | ✅ | ✅ | ✅ | ❌ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | C6 | 7/12 | P0 |
| `a-venir` (calendrier) | ✅ | ❌ | ⚠️ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | C2, C6 | 8/12 | P0 |
| `elus` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | — | 10/12 | P2 |
| `elu` | ✅ | ❌ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ | ✅ | ❌ | ✅ | C2, C11 | 8/12 | P1 |
| `annuaire-fiche` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ⚠️ | ✅ | — | 9/12 | P2 |
| `groupe` | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | — | 10/12 | P2 |
| `scrutins` | ❌ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | C1 | 4/12 | P1 |
| `qag` | ❌ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ | C1 | 4/12 | P1 |
| `vote` | ✅ | ❌ | ⚠️ | ✅ | ✅ | ❌ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | C2, C6 | 6/12 | P0 |
| `presidentielle-2027` | ⚠️ | ❌ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | C2 | 7/12 | P1 |
| `pour-vous` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | C11 | 11/12 | P0 |
| `sources` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | — | 10/12 | P2 |
| `confort-lecture` | ❌ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | C1, C11 | 9/11 | P0 |
| `actus` | ✅ | ❌ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ⚠️ | ❌ | ✅ | ⚠️ | ✅ | C2, C9 | 6/12 | P1 |
| `repere-du-jour` | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | ❌ | ⚠️ | ✅ | ⚠️ | ✅ | C8 | 6/12 | P0 |
| `dictionnaire` | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ | ❌ | ✅ | ⚠️ | ⚠️ | C9 | 6/12 | P1 |
| `quiz` | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | C1, C8, C11 | 9/12 | P0 |
| `recherche` | ❌ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ | C1, C7 | 7/12 | P1 |
| `procedure` | ✅ | ✅ | ✅ | ✅ | ⚠️ | — | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | — | 8/11 | P2 |
| `partager` | ✅ | ❌ | ❌ | ✅ | ✅ | — | ✅ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ | C2, C3 | 7/11 | P1 |
| `faq` | ✅ | ✅ | ✅ | ✅ | ⚠️ | — | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | C11 | 9/11 | P1 |
| `a-propos` | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ❌ | ✅ | ✅ | ⚠️ | ✅ | C8 | 9/11 | P0 |
| `confidentialite` | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | C8, C9, C11 | 8/11 | P0 |
| `soutenir` | ✅ | ❌ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | C2 | 9/11 | P1 |
| `bienvenue` | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | — | 10/11 | P2 |

**Bilan** : 13 écrans en P0, 10 en P1, 6 en P2. Les P0 viennent presque tous de **trois défauts partagés** (§ 3), pas de 13 problèmes distincts.

## 2. Les 10 problèmes les plus graves

| # | Prio | Problème | Preuve (mesure) | Écrans |
|---|---|---|---|---|
| 1 | **P0** | **Fausse phrase pendant le chargement** : « Aucune commune n'est choisie » et un bouton « Revenir à l'accueil » s'affichent alors que la commune **est** gardée. L'accueil montre d'abord « Où habitez-vous ? », puis bascule sur Melun. | Avec 1,5 s de latence par fichier, Melun n'apparaît qu'après **7,1 s** ; avec 4 s, après **17,2 s**. Pendant ce temps, l'écran dit faux et propose de partir. CLS de l'accueil : **0,24** (« mauvais » au-delà de 0,25, « à améliorer » au-delà de 0,1). Cause, lue dans le code : `AvecDonnees` (`ui/page.tsx`) teste `choix`, qui n'est restauré (`lib/selection.tsx`) qu'après `chargerCommunesBeta()`. `retenue` est pourtant déjà lue. C'est contraire à la doctrine du vide : une absence produit une phrase **vraie**. Capture : `etats-reseau-lent-panne.jpg`. | qui-décide, finances, argent, vote, calendrier, accueil, chez-vous |
| 2 | **P0** | **Écrans sans bouton retour** | Aucun bouton retour mesuré en haut de l'écran. Ces écrans n'ont pas de `headerLeft` dans `_layout.tsx` ; sur le web ou la PWA, une ouverture par lien direct est une impasse. | repère-du-jour, quiz, à-propos, confidentialité |
| 3 | **P0** | **Accessibilité « critical »** : les puces sélectionnables (`role` checkbox/radio) n'exposent pas leur état coché. | axe `aria-required-attr` : 13 nœuds sur confort-lecture, 7 sur pour-vous, 4 sur quiz. Un lecteur d'écran web ne sait pas ce qui est choisi. Natif iOS **non vérifié**. S'y ajoutent `aria-prohibited-attr` (accueil, élu) et des zones défilantes non focalisables (faq, confidentialité). | confort-lecture, pour-vous, quiz, accueil, élu, faq, confidentialité |
| 4 | P1 | **L'étiquette passe pour un titre** : les surtitres en capitales (« L'ARGENT DE LA COMMUNE », « VOTRE DÉPUTÉ », « TAILLE DU TEXTE ») sont exposés comme titres de niveau 1. | Deux titres de niveau 1 ou plus sur 21 écrans ; un titre vide sur 25 écrans (axe `empty-heading`). Scrutins et questions au Gouvernement n'ont **aucun** titre ; confort-lecture et quiz n'ont pas de titre d'écran. | presque tous |
| 5 | P1 | **Le libellé retour ment** : il est figé par écran, alors que l'action est `router.back()`. | 11 écrans. Exemples : le dictionnaire dit « ‹ Le calendrier » d'où qu'on vienne ; la fiche élu dit « ‹ Qui décide », même ouverte depuis un groupe ; scrutins dit « ‹ Votre député » sous un en-tête « Le Parlement ». | élu, dictionnaire, procédure, scrutins, qag, partager, vote, argent, sources, actus, annuaire-fiche |
| 6 | P1 | **Navigation à trois systèmes** : 4 onglets, un accueil-hub et 20 écrans empilés. La barre d'onglets disparaît dès qu'on sort des 4 onglets. Deux routes affichent le même contenu (`/` et `/chez-vous`, `/finances` et `/argent`) avec des retours différents. | Captures `ecrans-1.jpg` : `chez-vous` et `accueil` sont identiques, `argent` et `finances` aussi. L'action en haut à droite change d'un écran à l'autre : mode et réglages, partager, ou copier le lien. | transversal |
| 7 | P1 | **L'échelle typographique est contournée** : `TYPO` définit 7 tailles (34/28/22/17/15/14/13), mais le code en écrit 20 en dur. | Littéraux `fontSize` relevés : 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 28, 34, 36, 40, 44, 50, 52, 72. 21 tailles rendues, de 11 à 60 px. Le chiffre héros fait 59,5 px (accueil, finances). | transversal |
| 8 | P1 | **Espacements hors de la grille de 4** : `PAS = 4` existe, mais 47 des 106 espacements écrits en dur n'en sont pas des multiples (2, 3, 6, 7…). | Part rendue hors grille : partager 40 %, calendrier 30 %, élu 23 %, présidentielle 19 %, accueil et finances 18 %. | transversal |
| 9 | P1 | **Message de fraîcheur inexact à la première visite hors ligne** : « ce qui s'affiche est la dernière publication reçue sur cet appareil », alors que rien n'a jamais été reçu. Le bandeau s'insère en haut et pousse la page. | Sonde « panne ». CLS de 0,116 à 0,133 quand le bandeau arrive (scrutins, présidentielle, dictionnaire). La formulation de l'invariant 9 est à revoir avec le porteur. | scrutins, qag, présidentielle, dictionnaire |
| 10 | P1 | **Densité** : pavés de plus de 4 lignes, premiers écrans chargés. | Actualités : 8 pavés, jusqu'à 12 lignes. Confidentialité : 10 lignes. Dictionnaire : 7 lignes, et 27 cibles dans le premier écran (alphabet). Qui décide : 158 mots dans le premier écran. | actus, dictionnaire, confidentialité, qui-décide |

Hors du Top 10, à noter :
- La recherche n'a **aucun indicateur de focus** : `outline: none`, et la bordure ne change pas.
- 7 `Pressable` sans retour visuel : vote ×3, scrutins, dictionnaire, réglages.
- Animations de 500 à 900 ms, au-delà des 300 ms attendues : `DUREE.apparition` 520, `DUREE.remplissage` 500, quiz 900.
- « À propos » dit « Contact : bientôt disponible dans la bêta », alors que le README donne repere0@protonmail.com. Incohérence de contenu.

## 3. Défauts récurrents (à corriger une seule fois)

1. **État « commune en cours de restauration » absent** : un seul composant (`AvecDonnees`) et un seul contexte (`selection.tsx`) causent le n° 1 sur 7 écrans.
2. **En-tête non unifié** : le bouton retour, son libellé, le titre et l'action de droite sont choisis écran par écran dans `_layout.tsx`. D'où les n° 2, 5 et 6.
3. **`Etiquette` déclarée comme titre** : un composant partagé (`ui/page.tsx`, `Etiquette` et `Question`) cause le n° 4 sur presque tous les écrans.
4. **Valeurs en dur au lieu des jetons** (`TYPO`, `PAS`) : n° 7 et 8.
5. **Puces et segments** : l'état coché n'est pas exposé sur le web (n° 3), et les segments sont collés à 4 px les uns des autres.

## 4. Points forts (à ne pas casser)

- **Contrastes** : zéro texte sous AA, en clair comme en sombre, sur 29 écrans.
- **Cibles** : aucune sous 44 px (`CIBLE = 48`).
- **Texte** : aucun texte sous 12 px, sauf les aperçus réduits des cartes de partage, une exception déjà documentée.
- **Robustesse** : aucun débordement horizontal, aucune erreur JavaScript.
- **Retour au toucher** : 133 `Pressable` sur 140 en ont un (`enfonce`, `Pression`), avec une variante pour le mouvement réduit.
- **Squelettes de chargement** présents (`ui/squelette.tsx`). L'écran Élus en panne est exemplaire : phrase vraie, cause, bouton « Réessayer ».
- **États vides** au contenu juste : une phrase qui dit pourquoi, puis un lien vers la source officielle (scrutins, groupe, annuaire).
- **Source et date** sur chaque écran de données.

## 5. Recommandations pour le design system

1. **Typographie** : `TYPO` devient la seule source des tailles. Ajouter un niveau `heros` (48) pour le chiffre clé et retirer les 13 tailles hors échelle. Une garde de test interdit `fontSize:` en dur hors de `theme.ts`.
2. **Espacement** : des jetons `ESPACE = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 }` remplacent les littéraux. Une garde de test interdit les valeurs qui ne sont pas multiples de 4.
3. **Un composant `Entete`** : titre de l'écran, retour qui lit l'historique réel (« Retour » si l'origine est inconnue), une action de droite au plus, au même endroit partout. Les écrans à-propos, confidentialité, repère-du-jour et quiz y passent.
4. **Titres** : `Etiquette` n'est plus un titre ; `Question` porte le seul niveau 1 de l'écran ; les sections passent en niveau 2.
5. **Le bandeau de fraîcheur réserve sa place** dès le premier rendu (hauteur fixe ou en flux sous le titre), pour supprimer les décalages de mise en page.
6. **Puces sélectionnables** : `accessibilityState={{ checked }}` doit donner `aria-checked` sur le web ; sinon, passer `aria-checked` explicitement.

## 6. Plan de correction en trois vagues

Effort : S < ½ journée, M ≈ 1 journée, L > 2 jours.

### Vague 1 — P0 : beaucoup d'impact, peu d'effort

| # | Correction | Effort | Fichiers | Impact pour le lecteur |
|---|---|---|---|---|
| 1.1 | Quand `retenue` existe mais pas encore `choix`, afficher l'état de chargement, jamais « Aucune commune ». Sur l'accueil, ne pas montrer « Où habitez-vous ? » si une commune est gardée. | S | `ui/page.tsx`, `lib/selection.tsx`, `app/index.tsx` | Plus de phrase fausse, plus de bascule à l'arrivée sur l'accueil (CLS 0,24 vers moins de 0,1) |
| 1.2 | Relancer la restauration de la commune si `chargerCommunesBeta()` échoue (aujourd'hui, un `catch` silencieux). | S | `lib/selection.tsx` | La commune revient d'elle-même quand le réseau revient |
| 1.3 | Bouton retour sur repère-du-jour, quiz, à-propos et confidentialité. | S | `app/_layout.tsx` | Fin des impasses en lien direct |
| 1.4 | `aria-checked` exposé sur les puces et les segments. | S | `ui/chips-themes.tsx`, `app/confort-lecture.tsx`, `ui/quiz.tsx`, `ui/reglages.tsx` | Lecteur d'écran : on sait ce qui est choisi |
| 1.5 | Zones défilantes focalisables (faq, confidentialité), attribut interdit retiré (accueil, élu). | S | `app/faq.tsx`, `app/confidentialite.tsx` ; pour accueil et élu, le nœud fautif est à localiser (sélecteur dans `mesures.json`) | Clavier et lecteur d'écran |

Preuve attendue : la sonde `etats.cjs` ne voit plus « Aucune commune » quand une commune est gardée ; axe ne remonte plus rien en critical ni en serious ; `nav.cjs` trouve un bouton retour sur les 29 écrans. Chaque garde est d'abord vue rouge (skill `prouver-une-garde`).

### Vague 2 — P1 : cohérence

| # | Correction | Effort | Fichiers | Impact |
|---|---|---|---|---|
| 2.1 | Composant `Entete` unique, avec un retour qui lit l'historique (§ 5.3). | M | `ui/retour.tsx` vers `ui/entete.tsx`, `app/_layout.tsx` | Le libellé retour dit vrai ; mêmes repères partout |
| 2.2 | Fusionner les routes doublons (`/chez-vous` → `/`, `/argent` → `/finances`) par redirection. | S | `app/chez-vous`, `app/argent.tsx`, liens | Un écran, une adresse |
| 2.3 | Titres : un seul niveau 1 par écran ; `Etiquette` n'est plus un titre ; un titre pour scrutins, qag, recherche, confort-lecture et quiz. | S | `ui/page.tsx`, écrans cités | Hiérarchie visuelle et rotor VoiceOver |
| 2.4 | Jetons `TYPO` et `ESPACE` partout, avec une garde de test. | L | ~40 fichiers de `src/`, `lib/theme.ts`, `tests/` | Rythme visuel régulier, fin des « presque pareil » |
| 2.5 | Bandeau de fraîcheur à place réservée ; phrase juste quand rien n'a jamais été reçu (« Pas encore de publication sur cet appareil »). Formulation à valider par le porteur (invariant 9). | M | `ui/fraicheur.tsx`, `@repere/data-utils` | Plus de saut à l'arrivée ; message exact |
| 2.6 | Couper les pavés : 3 lignes, puis « Lire la suite ». Dictionnaire : alphabet replié derrière la recherche. | M | `app/actus.tsx`, `app/dictionnaire.tsx`, `app/confidentialite.tsx`, `app/(onglets)/qui-decide.tsx` | Moins de surcharge |

### Vague 3 — P2 : finition

| # | Correction | Effort | Fichiers | Impact |
|---|---|---|---|---|
| 3.1 | Indicateur de focus visible sur les champs (bordure plus épaisse). | S | `app/recherche.tsx`, `app/elus.tsx`, `app/dictionnaire.tsx` | Feedback de saisie |
| 3.2 | Retour visuel sur les 7 `Pressable` qui n'en ont pas. | S | `app/vote.tsx`, `app/scrutins.tsx`, `app/dictionnaire.tsx`, `ui/reglages.tsx` | Chaque toucher répond |
| 3.3 | Durées d'animation ramenées à 300 ms au plus (apparition 520 → 240, remplissage 500 → 300, quiz 900 → 300). | S | `lib/theme.ts`, `ui/quiz.tsx`, `ui/bandeau-repere.tsx` | Sensation de vitesse |
| 3.4 | Segments espacés de 8 px, ou présentés comme un seul contrôle. | S | segments de finances, présidentielle, procédure | Moins de touchers ratés |
| 3.5 | Contact cohérent entre « À propos » et le README. | S | `app/a-propos.tsx` | Confiance |
| 3.6 | Rejouer l'audit sur **WebKit et iPhone réel** (VoiceOver, Dynamic Type), avec les données complètes publiées. | M | — | Ce que cet audit n'a pas pu voir |

## 7. Validation demandée

Rien n'est codé. La vague 1 attend ton accord. Deux points sont à trancher avant la vague 2 :
- la phrase du bandeau de fraîcheur quand rien n'a encore été reçu (invariant 9) ;
- la fusion des routes doublons, qui change les adresses que les testeurs ont peut-être déjà enregistrées.
