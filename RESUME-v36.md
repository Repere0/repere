# RESUME v36 — audit complet, corrections et déblocage des données

Date : 31/10/2026. Branche `test/sdk58-expo-go` (jamais fusionnée dans `main`, PR #174 non touchée). Commit de tête : celui qui contient ce fichier ; l'historique complet est dans `git log`.

## 0. Date de début du projet

- **Premier commit : 13/08/2026**, « Repère v18.13 - app, générateur PWA, banc de test, documents ».
- Première version Expo : **29/09/2026** (~57.0.26). SDK 54 puis 58 testés le 30/10 sur la branche de test.
- 664 commits sur la branche de test (437 sur `main`), 752 fichiers suivis. Détail : `docs/historique-projet.md`.

## 1. Ce qui a été fait dans cette session

| Bloc | Résultat | Commit |
|---|---|---|
| 0 | Historique du projet, chronologie V1 → V36 | `ae0ca16` |
| B1 | Procédure du jeton Netlify ; **jeton non régénéré** (décision du CEO) | `065b240` |
| B2 | Script des groupes politiques, seuil 90 %, testé ; **fichier non produit** (proxy 403 sur data.assemblee-nationale.fr ; URL du brief fausse) | `1dec22e` |
| B3 | Photos : script déjà dans la chaîne ; licences testées ; **couverture non mesurée** (Wikidata et Commons injoignables) | `8051117` |
| B4 | Actus : fichier vide vérifié, procédure rappelée ; aucune actu inventée | `c94cefc` |
| B5 | **Problème trouvé** : le `.env` n'atteint aucun build publié (BLOCAGES §39) ; aucun code changé | `9ab773c` |
| B6 | Test de commune gardée : `commune-web.mjs` **passe** (15 vérifications) après rebuild ; testé en navigateur | (existant, V32) |
| M1 | Calendrier groupé par jour ; **18 cibles, pas 15** (décision produit) | `dd743ff` (V35), doc `33746c5` |
| M2 | Graisse du texte : fait en V35 (D69) | `0a3005e` |
| M3 | Mode d'affichage gardé : fait en V35 (D67) ; `mode-web.mjs` passe | `3e5c81d` |
| M4 | Bleu-sarcelle : **FAIL validateur confirmé** (chroma 0,094) ; décision CEO : conserver | `9ab773c` |
| M5 | Niveau rue vide : documenté | `9ab773c` |
| M6 | Splash : `#161513` et repère `#F3F0EA` **mesurés dans l'image** ; conforme | `33746c5` |
| M7 | Date de début : bloc 0 | `ae0ca16` |
| m1–m3 | SDK 58 : aucun `Text` avec fragments, aucun `AppleZoom`/`Link.Trigger`, `tsc` passe | (aucun changement) |
| m4 | Clavier de l'accueil : `KeyboardAvoidingView` présent sur iOS ; Android non vérifié | `8c14c2b` |
| m5–m6 | `annuaire-fiche.tsx` : chaque date formatée une fois, paramètres typés | (déjà fait) |
| m7 | U+2019 : `’` déjà utilisé dans `conformite.test.mjs` | (déjà fait) |
| m8 | `DatePublication` : non modifié (brief ambigu) | — |
| m9 | `ActuCarte` : aucun tableau à un élément trouvé | — |
| m10 | `as never` : aucune occurrence dans `src` | (déjà fait) |
| m11 | Confidentialité : ligne séparée sous « Affichage » dans le menu | (en place) |
| m12 | `dateFr` : **non modifié** (voir §4) | — |
| m13 | Compteur rouge : test de hauteurs remplacé par un test de comportement (V29) ; non relancé (`runtime.test` exige `apps/web/dist`) | (V29) |
| m14 | `commune-web.mjs` : cité dans `mobile.yml` (étape web) ; hors liste `node --test` car il a besoin d'un navigateur | — |
| m15 | Onboarding : `onboarding-web.mjs` **passe** | (V34) |
| 4 | Audit WCAG par écran (19 écrans) : `docs/audit-wcag.md` | `9508462` |
| 5 | Audit des données contre les sources : `docs/audit-data.md` | `aae2929` |
| 6 | Inventaire : `docs/audit-etat-actuel.md` | `bcc2f42` |
| 7 | Score par dimension : `docs/score-dimensions.md` | `9765de3` |
| 8 | Synthèse : `docs/SYNTHESE-AUDIT.md` | `ca432da` |
| 9 | Ce rapport | ce commit |

Tests lancés : `tsc --noEmit` (appli mobile) : passe. `node --test` sur les fichiers touchés : 126 passent (dont les 8 de B2 et les 4 de B3). Navigateur, sur un build exporté ce jour : `commune-web` (15), `onboarding-web`, `zoom-web`, `mode-web` : zéro échec.

## 2. Score honnête par dimension

| # | Dimension | Verdict |
|---|---|---|
| 1 | Savoir qui décide | PARTIEL (maires IDF 1 262/1 262 ; députés 574/577 ; sénateurs absents ; groupes non affichés) |
| 2 | Où va l'argent | PARTIEL (budgets IDF 1 262/1 262 ; France 34 570/34 969 ; pas de détail par école) |
| 3 | Votes des élus | PARTIEL (12 scrutins retenus sur 9 155 ; sénateurs absents) |
| 4 | Impact sur ma vie | PARTIEL (pas de champ d'impact ; 8 événements saisis à la main) |
| 5 | Agir | NON (contact masqué en production ; pas de pétitions, conseils, consultations) |
| 6 | Se préparer aux élections | PARTIEL (dates et guide OK ; pas de bureau de vote ni de candidats) |

**Score final : 0/6 complètes, 5/6 partielles, 1/6 absente.**

## 3. Dix faiblesses

1. Publication automatique en panne depuis le 25/10 (jeton Netlify refusé, HTTP 401) — BLOCAGES §37.
2. Adresse de contact absente en production (`.env` non publié) — BLOCAGES §39.
3. Accueil toujours sombre : le choix « Clair » ne s'y applique pas (`index.tsx`, ligne 43).
4. Accueil : date de publication à 2,83:1 (SC 1.4.3) et anneau de focus clavier à 1,04:1 (SC 1.4.11).
5. Groupes politiques non affichés ; fichier non produit — BLOCAGES §38.
6. Sénateurs absents (aucune source).
7. Actualité locale vide : « Ma rue » n'a rien à montrer.
8. 574 députés sur 577 : trois sièges sans explication.
9. Calendrier : 18 cibles au premier écran, objectif 15 non atteint.
10. Régions : 14 sur 18 ; textes de loi et amendements absents.

## 4. Dix quick wins (moins de deux heures)

1. Passer `EXPO_PUBLIC_CONTACT_EMAIL` dans le build (valeur à confirmer par le CEO).
2. Remplacer le jeton Netlify (action du CEO).
3. Relire la cause du run `collecte.yml` du 31/10 à 11 h 14 (l'API ne donne que l'étape d'alerte).
4. Corriger l'anneau de focus de l'accueil web, sans toucher la palette.
5. Identifier les trois députés manquants (archive AMO30 nécessaire).
6. Rapprocher le rôle `header` de `h1` sur le web là où ce n'est pas le premier titre.
7. Mettre à jour les dépendances mineures (`react`, `expo`, `expo-router`, `react-native-safe-area-context`), avec tests.
8. Compléter `docs/data/groupes-politiques.md` avec le premier résultat CI.
9. Décider de `dateFr` pour les valeurs invalides (m12) : aujourd'hui, un texte non ISO est rendu tel quel, et un test le fige.
10. Dire quelles 4 communes IDF n'ont pas de comptes 2025.

Non faits, à trancher : le mode clair sur l'accueil (décision de direction), la couleur du texte secondaire sur fond sombre (changement de palette), la cible calendrier (choix produit).

## 5. Cinq chemins à tester sur iPhone (Marie, Karim, Thomas)

Personas : `docs/personas.md`. Ils ne viennent pas d'une enquête.

1. **Onglet Élus** (Marie, Thomas) : l'ouverture a planté en V34 (BLOCAGES §35), cause corrigée mais non vue sur appareil.
2. **Accueil à la taille « très grand » (26)** (Marie) : la pastille « Chercher une commune » passe à la ligne ; la hiérarchie repose maintenant sur la taille, pas sur le gras.
3. **Mode clair puis sombre** (Karim, Thomas) : vérifier que l'accueil reste sombre quand on choisit « Clair ». C'est le point 3 des faiblesses.
4. **Calendrier, séances groupées par jour** (Thomas) : lisibilité des 18 cibles, des pastilles de source.
5. **Partage d'un vote en image** (Karim) : rendu de la carte et du lien.

## 6. Ce qui reste bloqué

- **AMO30 (groupes)** : le proxy refuse `data.assemblee-nationale.fr` (403, décision de politique, non contournée). La CI le joint peut-être. BLOCAGES §38.
- **Netlify (publication)** : le jeton doit être remplacé par le CEO. BLOCAGES §37 ; procédure dans `docs/netlify-token.md`.
- **Actualité locale** : trois communes pilotes vides, sans source officielle rédigée. Décision éditoriale. `docs/strategie-editoriale.md`.
- **Contact** : valeur à définir et à passer dans le build. BLOCAGES §39.
- **Photos d'élus** : couverture non mesurée (Wikidata et Commons injoignables).
- **Test sur appareil** : aucun iPhone ni Android dans cette session. Tout ce qui est dit « vérifié » l'est dans Chromium à 390 px.

## 7. Limites de cette session

- Données en ligne (AN, OFGL, RNE) : dates non relues ; seules celles du dépôt sont citées.
- Le chiffre officiel des communes d'Île-de-France n'a pas été confirmé ; le 1 262 du brief est celui du catalogue du dépôt.
- `runtime.test.mjs` n'a pas été exécuté (il exige `apps/web/dist`).
- La cause du run `collecte.yml` du 31/10 à 11 h 14 n'a pas été relue en détail.
- Deux points du brief ne correspondaient pas au dépôt : l'URL d'AMO30 indiquée au §23 de BLOCAGES (elle est dans `outils/collecte.py`, ligne 59), et le fichier `photos-elus.json` (le format réel est par département).
