# RESUME V51 — 03/11/2026

Branche : `test/sdk58-expo-go`. Détail des blocages et des mesures : `BLOCAGES.md` §55 (autre passe) et §56 (cette passe).

## Commits (ordre chronologique)

- `2c511db` — feat(repere-du-jour) : carte, logique dans `@repere/core`, premier jet (autre passe).
- `011b156` — docs(blocages) : téléchargements refusés (autre passe).
- `3718d06` — fix(ci) : attendu du parcours navigateur aligné sur « X € de salaires » (autre passe).
- `32256da` — fix(repere-du-jour) : carte sous les trois réponses, rotation sans répétition, réglage « Ma rue » (cette passe).

## Fait

- **Carte « Le Repère du jour »** : placée **sous** les trois réponses, pas en tête. Raison mesurée : en tête, les réponses descendent de 363/571/807 px à 940/1148/1384 px (écran 390 x 844). Le test de parcours l'impose.
- **Rotation** : le tirage par empreinte donnait 14 faits identiques à la veille sur 30 jours. Remplacé par une rotation sans mémoire : **0** identique à la veille, intervalle minimal **6 jours** par emplacement (fixture : 12 budget, 6 élus).
- **Bug « Ma rue »** corrigé : la carte affichait le vote et la circonscription (nationaux). Le réglage filtre désormais avant la sélection.
- **Contrôles ajoutés** au fichier `mono/tests/repere-du-jour.test.mjs` : rotation sur 30 jours, « Ma rue » sans national. Il compte 14 contrôles, tous verts.
- **Documentation** : `docs/concept-repere-du-jour.md` (concept, règles, limites, comment ajouter un modèle).

## En cours / non fait

- **Groupes politiques (D133)** : non fait. Aucune donnée AMO30 dans le dépôt ; `groupeDe()` renvoie toujours « Inconnu ».
- **Données D136** : `nosparlementaires.fr` (deputes, senateurs) : code 000, connexion refusée par le proxy. `senat.fr` : 000. `data.assemblee-nationale.fr` : 403 (déjà connu). Rien écrit dans `data/`. NosParlementaires n'est pas une source officielle au sens de l'invariant 4 ; sa licence n'est pas vérifiée.
- **Repère du jour : 19 modèles, pas 30** (12 budget, 7 élus). Les élus sont limités à ce que le dépôt publie par commune. Aucun modèle écrit pour atteindre un nombre.
- **Non-répétition sur 30 jours** : impossible sans mémoire locale, interdite par l'invariant 2. Limite documentée.
- **Histoire, sénateurs** : skip (sources injoignables ; D135).
- **Placement** : « en premier » (demande V51) écarté au profit de « sous les trois réponses » (règle « Réponses d'abord »). **Décision CEO à confirmer.**

## Vérifications

- `tsc --noEmit` (mono/apps/mobile) : 0 erreur.
- Invariants `tests/invariants.test.mjs` : 61/61 (après `pnpm build`). `derive_contexte.mjs` : 0 erreur, 3 avertissements (inchangés).
- Navigateur, build reproduit comme la CI (expo export web + pnpm build, serveurs 8811 et 8821) :
  - `parcours-web` : 225 OK, réponses à 363/571/807 px ;
  - `zoom-web` : 0 échec ;
  - `commune`, `recherche`, `elections`, `partage-texte`, `onboarding`, `mode` : 0 échec ;
  - `meme-verite` : 116 OK, 0 échec, code de sortie 0.
- `runtime.test.mjs` : **non vérifié tel que la CI le lance**. La CI l'exécute sur `../site_engendre`, produit par `test-mono-pipeline.yml` avec collecte réseau. Lancé ici sur `apps/web/dist`, 8 échecs, tous sur le calendrier et les scrutins solennels (données absentes de ce dépôt), plus un contrôle de licence Assemblée. Ce résultat ne vaut pas verdict CI.

## Blocages restants

1. Groupes politiques : données AMO30 à déposer ou collecte CI à confirmer.
2. Placement de la carte : confirmer « sous les réponses » ou assouplir le test de parcours.
3. Invariant 2 : autoriser une clé locale pour une non-répétition sur 30 jours, ou accepter la limite de 6 jours.
4. Modèles : 11 de moins que la cible de 30. Pistes à sourcer : adjoints (RNE), population (exercice).
5. CI : résultat sur `32256da` à lire (voir VERDICT-v51.md).
