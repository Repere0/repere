# Synthèse de l'audit (V36)

Date : 31/10/2026. Branche `test/sdk58-expo-go`. Chaque point renvoie à sa source : fichier du dépôt, mesure (`docs/audit-*.md`), test ou blocage (`BLOCAGES.md`).

## 1. Résumé exécutif

- Repère est une application mobile (Expo, SDK 58 sur la branche de test ; SDK 57 sur `main`), en développement depuis le 13/08/2026 (premier commit, `docs/historique-projet.md`).
- **Score citoyen : 0/6 dimensions complètes, 5/6 partielles, 1/6 absente** (`docs/score-dimensions.md`).
- Les données sont solides là où elles existent : 1 262 communes d'Île-de-France sur 1 262 ont un maire et un budget (`docs/audit-data.md`).
- La publication automatique est **en panne** : la collecte échoue depuis le 25/10, à l'étape Netlify (HTTP 401, jeton refusé). Le site publié n'est plus mis à jour. C'est le point le plus urgent, et il ne se règle pas dans le dépôt (BLOCAGES §37).
- L'adresse de contact n'arrivera pas en production avec la configuration actuelle : `.env` n'est pas publié (BLOCAGES §39).
- Les groupes politiques, les sénateurs, les textes de loi et les amendements ne sont pas affichés.
- Le contrôle WCAG par écran passe sur le contraste et les cibles tactiles, avec deux échecs sur l'accueil (`docs/audit-wcag.md`).
- Rien n'a été inventé : l'actualité locale est vide, les photos sont filtrées par licence, les sources et leurs dates sont affichées.

## 2. Score par dimension

| # | Dimension | Verdict | Preuve principale |
|---|---|---|---|
| 1 | Savoir qui décide | PARTIEL | maires 1 262/1 262 IDF ; députés 574/577 ; sénateurs absents (`audit-data.md`) |
| 2 | Où va l'argent | PARTIEL | budgets 1 262/1 262 IDF, 34 570/34 969 France ; pas de détail par école |
| 3 | Votes des élus | PARTIEL | 12 scrutins retenus (`scripts/scrutins.json`) sur 9 155 dans la source |
| 4 | Impact sur ma vie | PARTIEL | pas de champ `impact_citoyen` (grep sans résultat) ; 8 événements à la main |
| 5 | Agir | NON | contact masqué faute de variable (§39) ; pas de pétitions, conseils, consultations |
| 6 | Se préparer aux élections | PARTIEL | dates et guide OK ; pas de bureau de vote ni de candidats |

Score final : **0/6 complètes, 5/6 partielles, 1/6 absente.**

## 3. Cinq forces à ne pas casser

1. **Couverture IDF complète sur les maires et les budgets** : 1 262 communes, toutes avec comptes (`mono/data/departments/`, `audit-data.md`).
2. **Pas de donnée inventée** : `data/actus-hebdo.json` vide pour les trois communes pilotes ; photos d'élus filtrées par licence libre et rapprochement strict (`photos-licences.test.mjs`, 4 cas ; ADR 0004).
3. **Sources et dates visibles** : chaque écran donne la source et la date de relevé (`sources.tsx`, `source.tsx`, `fraicheur.tsx`).
4. **Parcours web testés et verts** : `commune-web.mjs` (15 vérifications), `onboarding-web.mjs`, `zoom-web.mjs`, `mode-web.mjs` ont passé le 31/10 sur un build récent.
5. **Chaîne qui refuse d'écraser** : les nouveaux scripts (`collecte-groupes.mjs`, seuil 90 %) et les anciens (`mono_donnees.py`, `projets_etat.py`) gardent le relevé de la veille plutôt que d'écrire un fichier maigre.

## 4. Dix faiblesses, classées par impact

1. **Publication automatique en panne** depuis le 25/10 (`collecte.yml`, BLOCAGES §37) : le site ne suit plus la source. *Impact : toute l'application.*
2. **Contact absent en production** (BLOCAGES §39) : la dimension « Agir » reste à NON. *Impact : confiance et retours des testeurs.*
3. **Accueil toujours sombre** : il ignore le choix « Clair » (`index.tsx`, ligne 43), contrairement au réglage D67. *Impact : un utilisateur qui a choisi clair ne l'obtient pas sur le premier écran.*
4. **Accueil : contraste et focus** : date de publication à 2,83:1 (SC 1.4.3) et anneau de focus à 1,04:1 (SC 1.4.11) (`audit-wcag.md`). *Impact : utilisateurs malvoyants et clavier, sur le web.*
5. **Groupes politiques absents** : le script existe (`1dec22e`), la donnée n'est pas produite (BLOCAGES §38). *Impact : dimension 1.*
6. **Sénateurs absents** : aucune source intégrée. *Impact : dimension 1 et promesse « qui décide ».*
7. **Actualité locale vide** : « Ma rue » n'affiche rien sur le calendrier ni sur les actus (BLOCAGES §41). *Impact : le niveau le plus proche de l'utilisateur est vide.*
8. **Trois députés manquants** (574 sur 577), cause non identifiée (`audit-data.md`). *Impact : une circonscription peut être sans député affiché.*
9. **Calendrier à 18 cibles au premier écran, pas 15** (`audit-final-visuel.md`, M1). *Impact : densité, décision produit.*
10. **Régions : 14 sur 18** (codes 02, 03, 06, 94 absents) ; textes de loi et amendements absents. *Impact : dimension 1 et 3.*

## 5. Dix quick wins (moins de deux heures)

Les estimations sont grossières ; elles ne remplacent pas une relecture.

1. **Passer `EXPO_PUBLIC_CONTACT_EMAIL` dans le build** (`mobile.yml`, `pipeline.sh`, `eas.json`) : ~30 min. *Valeur à confirmer par le CEO.* (§39)
2. **Remplacer le jeton Netlify** : 15 min, action du CEO. (§37)
3. **Relire la cause du run `collecte.yml` du 31/10 à 11 h 14** : 20 min. L'API ne donne que l'étape d'alerte finale.
4. **Corriger l'anneau de focus sur l'accueil web** (couleur de contour sur fond sombre) : ~1 h. Ne touche pas la palette. (`audit-wcag.md`, point 3)
5. **Identifier les trois députés manquants** en comparant `deputes.json` à AMO30 : ~1 h, nécessite l'archive. (§38)
6. **Rapprocher le rôle `header` de `h1` sur le web** là où un titre n'est pas le premier de l'écran : ~2 h. (`audit-wcag.md`, structure)
7. **Mettre à jour les dépendances mineures** (`react`, `expo`, `expo-router`, `react-native-safe-area-context`) : ~1 h, avec tests. (`audit-etat-actuel.md`, D)
8. **Compléter `docs/data/groupes-politiques.md` avec le premier résultat CI** dès qu'il existe : 15 min.
9. **Ajouter un test de non-régression sur `dateFr`** : la règle « texte inchangé si invalide » est testée (`core.test.mjs:733`), la décision reste à prendre (m12).
10. **Vérifier les 4 communes IDF sans comptes 2025** : 30 min, pour dire lesquelles et pourquoi.

## 6. Cinq chantiers structurants (plus d'une semaine)

1. **Groupes politiques et sénateurs** : une source propre pour les 348 sénateurs, et l'affichage du groupe sur « Qui décide ». (dimension 1)
2. **Impact citoyen** : un champ, rédigé et relu par un juriste, pour chaque scrutin présenté. Aujourd'hui 12 scrutins sur 9 155. (dimensions 3 et 4 ; `docs/juridique/`)
3. **Actualité locale** : une procédure éditoriale tenue (relecteur, source officielle, rythme). Aujourd'hui trois communes, vides. (`docs/strategie-editoriale.md`)
4. **Agir** : pétitions, agenda des conseils municipaux, consultations : aucune donnée à ce jour. (dimension 5)
5. **Test sur appareil réel** : iPhone et Android, les trois personas de `docs/personas.md`. Tout ce qui est dit « vérifié » dans ce dépôt l'est dans Chromium à 390 px, pas sur un téléphone.

## 7. Recommandation pour la prochaine session

1. **Décisions CEO d'abord** : jeton Netlify ; valeur de `EXPO_PUBLIC_CONTACT_EMAIL` et où la définir ; mode clair sur l'accueil (oui ou non) ; cible calendrier (15 ou 18) ; couleur du texte secondaire sur fond sombre.
2. **Vérifier le premier run CI avec `collecte-groupes.mjs`** : le journal doit donner `groupes : N députés sur 574`. Si le seuil de 90 % échoue, c'est l'hypothèse sur la forme d'AMO30 qui est fausse.
3. **Corriger les deux échecs d'accueil** (contraste de la date, anneau de focus) après la décision 3.
4. **Passer sur iPhone** les trois parcours des personas (`docs/personas.md`) avant toute nouvelle fonctionnalité.
5. Ne pas ajouter de sources (sénateurs, textes, amendements) avant d'avoir corrigé la publication.
