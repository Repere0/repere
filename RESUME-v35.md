# RESUME v35 — 31/10/2026

Branche : `test/sdk58-expo-go`. Blocs 1 à 5 traités, bloc 6 = ce rapport. Rien fusionné dans `main`, aucune branche supprimée, PR #174 inchangée. Rien vérifié sur iPhone.

## 1. Ce qui est fait

| Bloc | Décision | Commit | État |
|---|---|---|---|
| 1 | D67 mode sombre persisté | 3e5c81d | Fait. Champ `mode` (auto, clair, sombre) dans `repere.profil`. Invariant 2 amendé (CLAUDE.md et AGENTS.md identiques), ADR 0006 amendé, sceau régénéré. Pas de nouvelle clé. |
| 2 | D68 densité calendrier | dd743ff | **Partiel.** Une carte par jour, hiérarchie jour > heure > titre > institution > source. Cibles au premier écran : 19 → 18 (objectif 15, non atteint). |
| 3 | D69 graisse | 0a3005e | Fait, avec une réserve de mesure (voir plus bas). Sonde (poids CSS 600+) : accueil 0 %, fiche élu 27 %, budget 17 %, calendrier 26 %, élus 13 %. Avec les polices Bricolage : 11 à 34 %. |
| 4 | D70 personas | b6fa4c3 | Fait, avec un point à trancher (voir plus bas). |
| 5 | CI | — | Voir plus bas : en cours, pas rouge. |

Décisions CEO reprises telles quelles : D64 (splash sombre), D65 (carte de vote sans sujet), D66 (bleu-sarcelle hors chroma, invariant 7 prime). Gardées, rien changé.

## 2. Points à connaître

- **D67, le sceau.** Modifier l'invariant 2 impose de régénérer `.claude/invariants.sha256`. Je l'ai fait sur la décision D67, dans la même PR, et c'est écrit dans l'ADR 0006.
- **D67, sans profil.** Tant que l'accueil n'a pas été répondu, le choix du mode reste en mémoire et n'écrit rien : écrire un profil sauterait l'accueil. Une fois le profil écrit, le mode est gardé.
- **Bug trouvé en route (bloc 1).** Passer de sombre à clair à chaud laissait l'en-tête des onglets sombre jusqu'au rechargement. Corrigé dans le même commit. La cause : l'en-tête ne s'abonnait pas au thème.
- **D68, le calendrier n'atteint pas 15.** Il reste 18 cibles au premier écran. Pour descendre à 15, il faut retirer un des trois choix suivants, qui sont des décisions produit : filtres (Tout, Assemblée, Sénat) en menu (-2), lien « Source » du relevé (-1), ou la rangée des sept jours. Je n'ai rien retiré sans votre accord.
- **D68, mesure.** La sonde compte aussi les éléments des écrans empilés sous le calendrier (`aria-hidden`). Dans le flux réel : 28 cibles dont 10 masquées. Les chiffres du rapport comptent seulement les cibles accessibles.
- **D69, interprétation.** La sonde compte le poids CSS. Les titres et les chiffres sont en police Bricolage (faces « titre » et « affiche »), que la sonde ne voit pas. Je donne les deux mesures. La cible « 30 à 40 % » est respectée sur les cinq écrans dans les deux mesures. Sur l'accueil, la sonde tombe à 0 % : la hiérarchie repose sur la taille et la police de titre. C'est à regarder sur iPhone.
- **D69, périmètre.** Les cinq écrans audités et les composants partagés qu'ils utilisent (onglets, cartes, liens). Les autres écrans (Voter, Scrutins, Pour vous...) reçoivent aussi les composants partagés, mais ne sont pas mesurés.
- **D70, les personas.** Le brief dit qu'ils étaient déjà dans les rapports V28-V34. Les rapports V29, V30 et V31 disent qu'ils ne sont définis nulle part dans le dépôt. Le fichier `docs/personas.md` les définit maintenant, et l'indique. À confirmer.
- **Test ajouté au workflow.** `mode-web.mjs` est cité dans `.github/workflows/mobile.yml`, comme l'exige le test de conformité (`chaine.test.mjs`).
- **Non lancé ici : `runtime.test.mjs`.** Il exige un build `apps/web/dist` et le pipeline complet. Il n'a pas été relancé dans cette session. Le contrôle des clés de stockage a été fait par le test statique (`invariants.test.mjs`) et par `mode-web.mjs` (aucune clé ajoutée).

## 3. CI (bloc 5)

Lecture à 01:20 (Paris), via `gh api` :

- `0a3005e` (HEAD, bloc 3) : **en attente**.
- `dd743ff` (bloc 2) : **en cours**.
- `3e5c81d` (bloc 1) : annulée, remplacée par les pushes suivants. Ce n'est pas un échec.

Ce n'est pas rouge. Je n'ai pas de résultat final : à relire avant toute fusion. Les blocs 4 (`b6fa4c3`, documentation) ne déclenchent pas la chaîne mobile.

**Chaîne de données (collecte, sur `main`) : rouge.** Le dernier run (`6bc4f41`, 31/10 à 00:55) a échoué à l'étape « Publier sur Netlify ». Le message dit « le site en ligne est inchangé ». Les journaux ne sont pas lisibles depuis cette session, donc je ne peux pas relire le code HTTP de la sonde. Le diagnostic précédent (BLOCAGES 37) était **HTTP 401** : le jeton Netlify est refusé. Je n'ai pas corrigé : c'est un secret du dépôt, à remplacer par le CEO.

## 4. Ce qui nécessite le CEO (par priorité)

1. **Jeton Netlify** : remplacer `NETLIFY_AUTH_TOKEN` (le run `6bc4f41` est en échec). Puis relancer `collecte.yml` sur `main`. Sans cela, le site ne reçoit plus de données publiées depuis le 25/10 (BLOCAGES 37).
2. **AMO30** : le fichier des groupes politiques n'est pas dans le dépôt. Il est à télécharger à la main depuis data.assemblee-nationale.fr, puis à rattacher aux votes (`docs/pr-release.md` ligne 52). Sans lui, les votes ne sont pas rattachés à un groupe.
3. **Actualités locales hebdo** : `data/actus-hebdo.json` (semaine 2026-W45, publication prévue le 02/11) contient trois communes (77284, 77288, 78646) avec titre, résumé et source **vides**. Rien ne s'affiche tant que ce n'est pas rempli. Je n'ai rien inventé.
4. **Contenu éditorial, impact des votes** : 5 à 10 scrutins à expliquer. Aucun texte n'existe encore.
5. **Juriste, droit à l'image** : les photos d'élus viennent de Wikimedia Commons sous licences libres, avec crédit affiché (ADR 0004). Une relecture juridique est recommandée avant une bêta publique. Je ne l'ai pas faite et je ne peux pas la faire.
6. **Tests sur iPhone** avec les parcours de Marie, Karim et Thomas (`docs/personas.md`). Rien n'a été vérifié sur appareil : splash, icône, mode, calendrier, cartes, graisse.

## 5. Les bugs critiques qui restent après V35

Je n'en ai que deux, et aucun n'est corrigé dans cette session :

1. **Publication des données en échec** (run `6bc4f41` rouge sur `main`). Le site ne reçoit plus de données : critique pour la fraîcheur du calendrier et des chiffres publiés. Cause connue, correction côté CEO (point 1).
2. **Crash de l'onglet Élus** : corrigé dans le bloc V34 (cause de la mutation de Proxy gelé), avec une garde de test. Non confirmé sur iPhone. Si le crash revient, c'est le premier risque à vérifier.

Risques, pas bugs confirmés : la hiérarchie de l'accueil (sonde à 0 % de gras), et le calendrier au-dessus de l'objectif (18 cibles pour 15).

## 6. Fichiers et vérifications

- Tests : `mobile` (liste de `mobile.yml`, 267/267), `profil.test`, `invariants.test`, `onboarding-web`, `mode-web`, `zoom-web`, `parcours-web`, `partage-story-web` : zéro échec à chaque bloc. `tsc` : 0 erreur.
- Mesures : `v35/` dans le dossier de travail, non commité (sonde ux-ui-audit).
- Données de test calendrier : sortie réelle du normaliseur (`mono/scripts/agenda-an.mjs`) sur `outils/agenda_an.json`, 40 séances à venir. Aucune séance inventée.
