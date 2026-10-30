# Fusion de `test/sdk58-expo-go` dans `main` — prête à déclencher

Préparée le 30/10/2026 (V22, bloc 4). Le CEO déclenche la fusion. Claude ne touche pas à `main`.

## L'essentiel en 6 lignes

1. **La fusion passe sans conflit** à la date du 30/10/2026. Essai fait sur une copie jetable de `main` (`6bc4f41`, « Collecte du 30/10/2026 ») : 0 fichier en conflit, puis 251/251 tests, 0 erreur d'invariant, 0 erreur `tsc`, site public reconstruit sans erreur.
2. **Fusionner ne publie rien.** Aucun workflow ne se déclenche sur un push vers `main`. La production change à la collecte suivante : chaque jour à 05 h 47 UTC (06 h 47 à Paris), ou plus tôt si le CEO lance `gh workflow run collecte.yml --ref main`.
3. **Durée de publication : non mesurée ici.** `gh` n'est pas authentifié dans cette session, donc impossible de lire la durée des dernières collectes. `docs/rapport_pages.md` estime la chaîne seule à environ 2 min, sans compter l'installation, les collectes réseau et l'envoi Netlify. **Ne pas promettre « 5 min »** : ouvrir l'onglet Actions et lire la durée réelle de la dernière collecte.
4. **Les testeurs lisent la production, pas la branche.** Leurs données viennent du site public, publié depuis `main`. Le code de l'application vient de l'ordinateur du CEO (Expo, branche `test/sdk58-expo-go`) : la fusion ne le change pas.
5. **Le site public change aussi.** 19 fichiers du site et du socle partagé sont touchés : voir l'annexe. Ce ne sont pas que des données.
6. **Annulation possible en 1 minute** côté Netlify (republier le déploiement précédent), puis proprement par un revert. Voir « Rollback ».

## Comment fusionner (2 minutes)

`main` est protégée : la fusion passe par une pull request.

1. Sur GitHub : *Pull requests* → *New* → base `main`, compare `test/sdk58-expo-go`.
2. Titre proposé : « Bêta mobile IDF (V8-V22) : actus locales, mandats terminés, sources ». Description : le lien vers ce fichier.
3. Attendre les vérifications de la PR : `epreuve.yml` (le site et le socle sont touchés, donc elle tourne) et `mobile.yml`. **Ne pas fusionner si l'une est rouge.**
4. Choisir **« Create a merge commit »**. Les 171 commits gardent leur identifiant, auquel renvoient les fichiers RESUME, et le revert reste un seul geste (`git revert -m 1`).
5. Puis `gh workflow run collecte.yml --ref main` pour publier sans attendre le lendemain matin, ou attendre 06 h 47.
6. Contrôler : le résumé de l'exécution doit montrer l'étape Netlify en vert, puis le site public doit servir `/data/actus-hebdo.json`.

**Si la fusion attend plusieurs jours** : la collecte quotidienne ajoute un commit par jour sur `main`. Ces commits ne touchent que des sorties de la chaîne, que la branche ne modifie pas. Le risque de conflit reste faible, mais il n'est vérifié que pour le 30/10. Refaire l'essai juste avant (voir « Vérifier soi-même »).

## Rollback

Du plus rapide au plus propre :

1. **Netlify, environ 1 minute** : tableau de bord du site → *Deploys* → le déploiement d'avant la fusion → *Publish deploy*. Le site et les données redeviennent ceux d'avant, mais `main` porte toujours la fusion : la collecte suivante, à 06 h 47, republiera la version fusionnée. C'est une mesure d'urgence, pas une fin.
2. **Revert, environ 10 minutes** : `git revert -m 1 <commit de fusion>` sur une branche, PR vers `main`, fusion, puis `gh workflow run collecte.yml --ref main`. La production revient durablement à l'état d'avant.
3. **Données seules** : pour une actu fautive, vider l'entrée dans `data/actus-hebdo.json` (PR, puis collecte). Pour un mandat terminé erroné, retirer l'entrée de `mono/apps/mobile/src/lib/mandats-termines.ts`. Celui-ci est dans le code de l'application : relancer Expo suffit, aucune PR n'est nécessaire pour les testeurs.

**Ne jamais** pousser en force sur `main`, ni supprimer la branche après la fusion.

## Vérifier soi-même que la fusion passe encore

```bash
git fetch origin
git worktree add --detach ../essai-fusion origin/main
cd ../essai-fusion
git merge --no-commit --no-ff origin/test/sdk58-expo-go   # « Automatic merge went well » attendu
git diff --name-only --diff-filter=U                       # vide attendu
git merge --abort
cd - && git worktree remove ../essai-fusion
```

## Ce que la fusion apporte en production (résumé)

- **Site public** : écrans Aujourd'hui, Calendrier, Ce qui a décidé, Qui décide ; vocabulaire partagé (`mots.js`) ; votes vides ; comparaisons budgétaires factuelles (D23) ; recherche.
- **Données publiées en plus** : `actus-hebdo.json` (vide tant que le CEO ne l'a pas rempli), `agregats-regionaux.json`, `mairies-idf.json` (sites des mairies, D28), photos libres des élus (D27). Leur couverture réelle n'est pas encore connue : aucune collecte de vérification n'a été lue.
- **Workflows** : `collecte.yml` gagne la garde `HORS_MAIN` et les nouvelles collectes ; `mobile.yml` lance la liste complète des tests partagés et le test des cartes de partage.

## Annexe — liste exhaustive des fichiers (182 : 112 ajoutés, 70 modifiés, 0 supprimé)

Calculée entre `main` (`6bc4f41`) et la branche, base commune `0a81f95`.

### Site public et socle partagé — PUBLIÉ en production (19)

- modifié `mono/apps/web/src/App.jsx`
- modifié `mono/apps/web/src/routes/Aujourdhui.jsx`
- modifié `mono/apps/web/src/routes/AujourdhuiJournal.jsx`
- modifié `mono/apps/web/src/routes/AujourdhuiTerritoire.jsx`
- modifié `mono/apps/web/src/routes/Calendrier.jsx`
- modifié `mono/apps/web/src/routes/CeQuiADecide.jsx`
- modifié `mono/apps/web/src/routes/QuiDecide.jsx`
- ajouté `mono/packages/core/src/actualites.js`
- modifié `mono/packages/core/src/aujourdhui.js`
- modifié `mono/packages/core/src/comptes.js`
- modifié `mono/packages/core/src/faits.js`
- modifié `mono/packages/core/src/format.js`
- modifié `mono/packages/core/src/index.js`
- modifié `mono/packages/core/src/mots.js`
- modifié `mono/packages/core/src/recherche.js`
- modifié `mono/packages/core/src/visuels.js`
- modifié `mono/packages/core/src/votes.js`
- ajouté `mono/packages/core/src/votesVides.js`
- modifié `mono/packages/data-utils/src/client.js`

### Chaîne de collecte et données — exécuté et PUBLIÉ à la prochaine collecte (11)

- ajouté `data/actus-hebdo.json`
- modifié `mono/package.json`
- ajouté `mono/scripts/agregats-regionaux.mjs`
- ajouté `mono/scripts/collecte-photos-elus.mjs`
- ajouté `mono/scripts/collecte-sites-mairies.mjs`
- ajouté `mono/scripts/photos-retirees.json`
- modifié `mono/scripts/scrutins-solennels.mjs`
- modifié `outils/pipeline.sh`
- ajouté `outils/teaser_scrutins_etat.sh`
- ajouté `outils/test_scrutins_solennels_erreurs.sh`
- ajouté `outils/test_teaser_scrutins_etat.sh`

### Workflows GitHub — actifs dès la fusion (2)

- modifié `.github/workflows/collecte.yml`
- modifié `.github/workflows/mobile.yml`

### Application mobile (n'atteint pas les testeurs par la fusion : ils chargent le code depuis l'ordinateur du CEO) (85)

- ajouté `mono/apps/mobile/.env.example`
- modifié `mono/apps/mobile/README.md`
- modifié `mono/apps/mobile/app.json`
- modifié `mono/apps/mobile/assets/android-icon-background.png`
- modifié `mono/apps/mobile/assets/android-icon-foreground.png`
- modifié `mono/apps/mobile/assets/android-icon-monochrome.png`
- modifié `mono/apps/mobile/assets/favicon.png`
- modifié `mono/apps/mobile/assets/icon.png`
- modifié `mono/apps/mobile/assets/splash-icon.png`
- ajouté `mono/apps/mobile/eas.json`
- modifié `mono/apps/mobile/package-lock.json`
- modifié `mono/apps/mobile/package.json`
- modifié `mono/apps/mobile/src/app/(onglets)/_layout.tsx`
- modifié `mono/apps/mobile/src/app/(onglets)/a-venir.tsx`
- modifié `mono/apps/mobile/src/app/(onglets)/chez-vous.tsx`
- ajouté `mono/apps/mobile/src/app/(onglets)/elus.tsx`
- modifié `mono/apps/mobile/src/app/(onglets)/qui-decide.tsx`
- modifié `mono/apps/mobile/src/app/_layout.tsx`
- ajouté `mono/apps/mobile/src/app/a-propos.tsx`
- ajouté `mono/apps/mobile/src/app/actus.tsx`
- ajouté `mono/apps/mobile/src/app/annuaire-fiche.tsx`
- modifié `mono/apps/mobile/src/app/argent.tsx`
- ajouté `mono/apps/mobile/src/app/confidentialite.tsx`
- modifié `mono/apps/mobile/src/app/dictionnaire.tsx`
- modifié `mono/apps/mobile/src/app/elu.tsx`
- ajouté `mono/apps/mobile/src/app/faq.tsx`
- modifié `mono/apps/mobile/src/app/index.tsx`
- modifié `mono/apps/mobile/src/app/partager.tsx`
- modifié `mono/apps/mobile/src/app/procedure.tsx`
- modifié `mono/apps/mobile/src/app/scrutins.tsx`
- modifié `mono/apps/mobile/src/app/vote.tsx`
- modifié `mono/apps/mobile/src/lib/absences.ts`
- modifié `mono/apps/mobile/src/lib/cache.ts`
- modifié `mono/apps/mobile/src/lib/composants.tsx`
- ajouté `mono/apps/mobile/src/lib/groupes.ts`
- ajouté `mono/apps/mobile/src/lib/mandats-termines.ts`
- ajouté `mono/apps/mobile/src/lib/moyenne.ts`
- ajouté `mono/apps/mobile/src/lib/niveaux.ts`
- ajouté `mono/apps/mobile/src/lib/palette.ts`
- ajouté `mono/apps/mobile/src/lib/photos.ts`
- modifié `mono/apps/mobile/src/lib/prefet.ts`
- modifié `mono/apps/mobile/src/lib/theme.ts`
- ajouté `mono/apps/mobile/src/lib/themeChoix.ts`
- ajouté `mono/apps/mobile/src/types/annuaire.ts`
- ajouté `mono/apps/mobile/src/ui/avatar.tsx`
- ajouté `mono/apps/mobile/src/ui/badge-groupe.tsx`
- ajouté `mono/apps/mobile/src/ui/cette-semaine-commune.tsx`
- ajouté `mono/apps/mobile/src/ui/dernieres-publications.tsx`
- ajouté `mono/apps/mobile/src/ui/entree.tsx`
- modifié `mono/apps/mobile/src/ui/fraicheur.tsx`
- ajouté `mono/apps/mobile/src/ui/logo.tsx`
- ajouté `mono/apps/mobile/src/ui/loupe.tsx`
- modifié `mono/apps/mobile/src/ui/page.tsx`
- ajouté `mono/apps/mobile/src/ui/partage/bouton-partage.tsx`
- ajouté `mono/apps/mobile/src/ui/partage/carte-story.tsx`
- ajouté `mono/apps/mobile/src/ui/partage/donnees.ts`
- ajouté `mono/apps/mobile/src/ui/partage/messages.ts`
- ajouté `mono/apps/mobile/src/ui/partage/use-partage-story.ts`
- ajouté `mono/apps/mobile/src/ui/partage/variantes/actu.story.tsx`
- ajouté `mono/apps/mobile/src/ui/partage/variantes/agenda.story.tsx`
- ajouté `mono/apps/mobile/src/ui/partage/variantes/chiffre.story.tsx`
- ajouté `mono/apps/mobile/src/ui/partage/variantes/elu.story.tsx`
- ajouté `mono/apps/mobile/src/ui/partage/variantes/vote.story.tsx`
- ajouté `mono/apps/mobile/src/ui/picto.tsx`
- ajouté `mono/apps/mobile/src/ui/reglages.tsx`
- modifié `mono/apps/mobile/src/ui/reponse.tsx`
- modifié `mono/apps/mobile/src/ui/retour.tsx`
- modifié `mono/apps/mobile/src/ui/semaine.tsx`
- modifié `mono/apps/mobile/src/ui/source.tsx`
- ajouté `mono/apps/mobile/src/ui/squelette.tsx`
- modifié `mono/apps/mobile/src/ui/visuels.tsx`
- ajouté `mono/apps/mobile/tests/absences.test.mjs`
- ajouté `mono/apps/mobile/tests/chaine.test.mjs`
- ajouté `mono/apps/mobile/tests/cibles.test.mjs`
- ajouté `mono/apps/mobile/tests/conformite.test.mjs`
- ajouté `mono/apps/mobile/tests/dictionnaire.test.mjs`
- ajouté `mono/apps/mobile/tests/niveaux.test.mjs`
- ajouté `mono/apps/mobile/tests/onglets.test.mjs`
- modifié `mono/apps/mobile/tests/parcours-web.mjs`
- ajouté `mono/apps/mobile/tests/parcours.test.mjs`
- ajouté `mono/apps/mobile/tests/partage-story-web.mjs`
- ajouté `mono/apps/mobile/tests/recherche-flou.test.mjs`
- ajouté `mono/apps/mobile/tests/theme.test.mjs`
- ajouté `mono/apps/mobile/tests/vides-dates.test.mjs`
- modifié `mono/apps/mobile/tsconfig.json`

### Tests (aucun effet en production) (8)

- modifié `mono/tests/core.test.mjs`
- modifié `mono/tests/donnees.test.mjs`
- modifié `mono/tests/invariants.test.mjs`
- modifié `mono/tests/meme-verite.mjs`
- modifié `mono/tests/ordre-faits.test.mjs`
- modifié `mono/tests/runtime.test.mjs`
- ajouté `mono/tests/vote-vide-site.test.mjs`
- ajouté `mono/tests/votes-vides.test.mjs`

### Documentation et outils locaux (aucun effet en production) (57)

- modifié `.claude/invariants.sha256`
- modifié `.gitignore`
- modifié `AGENTS.md`
- ajouté `APP_STORE_READINESS.md`
- ajouté `BLOCAGES.md`
- modifié `CLAUDE.md`
- ajouté `RESUME-v10.md`
- ajouté `RESUME-v12.md`
- ajouté `RESUME-v13.md`
- ajouté `RESUME-v14.md`
- ajouté `RESUME-v15.md`
- ajouté `RESUME-v16.md`
- ajouté `RESUME-v18.md`
- ajouté `RESUME-v19.md`
- ajouté `RESUME-v20.md`
- ajouté `RESUME-v21.md`
- ajouté `RESUME-v3.md`
- ajouté `RESUME-v6.md`
- ajouté `RESUME-v7.md`
- ajouté `RESUME-v8.md`
- ajouté `RESUME-v9.md`
- ajouté `docs/accessibilite.md`
- ajouté `docs/adr/0001-couleurs-partis.md`
- ajouté `docs/adr/0002-comparaisons-territoriales.md`
- ajouté `docs/adr/0003-couleurs-votes.md`
- ajouté `docs/adr/0004-photos-elus.md`
- ajouté `docs/adr/0005-sites-mairies.md`
- ajouté `docs/app-store-metadata.md`
- ajouté `docs/audit-5s.md`
- ajouté `docs/cette-semaine.md`
- ajouté `docs/checklist-distribution.md`
- ajouté `docs/data/cette-semaine-format.md`
- ajouté `docs/data/evenements-format.md`
- ajouté `docs/data/groupes-politiques.md`
- ajouté `docs/data/photos-elus.md`
- ajouté `docs/data/sites-mairies.md`
- ajouté `docs/juridique/droit-image-elus.md`
- ajouté `docs/kit-testeur.md`
- ajouté `docs/partage-story.md`
- ajouté `docs/partage-story/story-annuaire.png`
- ajouté `docs/partage-story/story-budget.png`
- ajouté `docs/partage-story/story-vote.png`
- ajouté `docs/performance.md`
- ajouté `docs/privacy-policy-hosting.md`
- ajouté `docs/privacy-policy.md`
- ajouté `docs/seo.md`
- ajouté `docs/strategie-editoriale.md`
- ajouté `docs/tableau-debrief.csv`
- ajouté `docs/tableau-retours.csv`
- ajouté `docs/template-debrief.md`
- ajouté `docs/testeurs.md`
- ajouté `docs/ux/animations.md`
- ajouté `docs/ux/etats-vides.md`
- ajouté `docs/ux/logo.md`
- ajouté `docs/ux/micro-copie.md`
- modifié `docs/ux/systeme-visuel-2026.md`
- ajouté `scripts/lancer-pour-testeurs.ps1`
