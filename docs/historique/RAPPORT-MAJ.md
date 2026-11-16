# RAPPORT-MAJ — nuit du 5 novembre 2026

Branche `refonte/v57-nuit` (partie de `main`, pas de `refonte/v56` : voir `BLOCAGE.md`).
Rien n'est fusionné. Une PR brouillon rejoue l'épreuve de la CI.

## En une phrase

Cinq changements livrés, testés et vérifiés à l'écran ; six demandes non faites, dont trois
parce qu'elles cassent un invariant ou une décision, trois parce que la donnée n'existe pas.

## Ce qui a été fait

| Commit | Ce que le citoyen voit de différent | Preuve |
|---|---|---|
| `ae3c72b` | « Voter » : trois démarches officielles en lien direct (inscription et bureau de vote, inscription en ligne, procuration) | 2 contrôles, vus rouges puis verts |
| `8dea027` | Zéro emoji : Ionicons partout (Repère du jour, réglages, signalement, niveaux de l'accueil, pictos, « Pour vous ») | garde « aucun emoji », vue rouge puis verte |
| `e542fd7` | Plus de plafond de taille sur les chiffres clés : le Dynamic Type agrandit tout | garde, vue rouge puis verte |
| `0ac31c5` | « Signaler une erreur » en bas de la fiche commune, de Qui décide, de l'argent et du vote | garde, vue rouge puis verte |
| `15b9074`, `f1f65bf` | « Ma voix » : le guide civique en accordéons, avec deux questions sourcées (assister au conseil, trouver ses décisions) | garde « source obligatoire », vue rouge puis verte ; capture relue |

Vérifications : `tsc --noEmit` vert ; 94 contrôles statiques de `apps/mobile/tests` verts ;
rendu web à 390 px relu (Ma voix, accueil des niveaux) ; 0 erreur JavaScript.

## Fichiers modifiés

`mono/apps/mobile/src/` : `app/voter.tsx`, `app/_layout.tsx`, `app/index.tsx`,
`app/bienvenue.tsx`, `app/pour-vous.tsx`, `app/argent.tsx`, `app/vote.tsx`,
`app/(onglets)/chez-vous.tsx`, `app/(onglets)/qui-decide.tsx`, `lib/elections.ts`,
`lib/composants.tsx`, `ui/picto.tsx`, `ui/resume.tsx`, `ui/page.tsx`, `ui/source.tsx`,
`ui/contact.tsx`, `ui/bandeau-repere.tsx`, `ui/reglages.tsx`, `ui/visuels.tsx`.
Tests : `apps/mobile/tests/conformite.test.mjs`, `apps/mobile/tests/vides-dates.test.mjs`.

## Décisions prises seul

- **Branche** : `refonte/v57-nuit` depuis `main`, poussée sur GitHub (sinon le travail meurt
  avec la session cloud). Pas de push sur `main`, pas de fusion.
- **Emojis** : la machinerie coupée depuis le 30/09 (`AVEC_EMOJIS`, `Emoji`, props `emoji`) est
  supprimée plutôt que convertie. Les signes de texte ✓ ✕ ↗ restent : ce ne sont pas des emojis.
- **Plafond de taille** : gardé sur les seuls libellés d'onglets, sinon la barre basse casse.
- **« Ma voix »** : l'écran « Voter » est renommé, même route `/voter` ; pas de second écran.
- **Accordéons** : écrits avec `Pressable` et un état, sans `react-native-collapsible`.
- **Une phrase non sourcée** (« la date des séances est annoncée par votre mairie ») a été
  remplacée par un renvoi à la mairie.

## Ce qui n'a pas été fait, et pourquoi

| Demande | Pourquoi |
|---|---|
| Taux de présence / assiduité de l'élu | **Interdit par l'invariant 8** (« jamais de donnée de présence ou d'absence »). |
| Site web refait en Next.js ou Astro | `mono/apps/web` est la **production** (Vite, publiée chaque matin par `collecte.yml`). La remplacer casse la publication. À décider à part. |
| Mode sombre par défaut | Contredit la décision **D67** (défaut « auto », gardé par `tests/profil.test.mjs`). « Auto » suit déjà le réglage sombre du téléphone. À trancher par toi. |
| Hémicycle du conseil municipal (majorité / opposition / NI) | **Aucune donnée** : le Répertoire national des élus ne dit pas qui est dans la majorité. Un hémicycle inventé casse les invariants 4 et 5. Composant non écrit (pas de code sans usage). |
| Badge « mis à jour il y a 2 min » | Existe déjà (`ui/fraicheur.tsx`, « il y a N jours », trois états de l'invariant 9). La collecte est quotidienne : « 2 min » serait faux. |
| Compte à rebours « Prochain conseil : J-X » | Aucune date de conseil municipal dans les données. Le compte à rebours des élections existe déjà (`ui/rappel-election.tsx`). |
| Résumé à 3 niveaux des votes | Les données ne portent que le titre du scrutin. Écrire « ce que propose l'auteur » à la main ou par un modèle est refusé (CONTEXTE_PROJET § 10). Il faut d'abord ingérer l'exposé des motifs. |
| Flux RSS dans Actus | Déjà fait (D81, `ui/cette-semaine-commune.tsx`). |

## Ce que je n'ai pas vérifié

- `pnpm test` du monorepo et `test_repere.mjs` : non lancés. La CI de la PR les rejoue.
- Contrastes : aucun nouveau couple de couleurs ; seuls les jetons existants (`encre`, `sourd`,
  `lien`) sont utilisés, déjà contrôlés par `theme.test.mjs`. Non mesurés à l'écran un par un.
- Rendu sur téléphone réel : non vu (web seulement).
- La fiche commune avec « Signaler une erreur » : non capturée (données absentes du conteneur).

## Prochaine action

Pousser `refonte/v56`, puis rejouer ces commits dessus (voir `BLOCAGE.md`).
