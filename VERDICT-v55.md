# VERDICT V55 — 04/11/2026

## État local

- `tsc --noEmit` (mono/apps/mobile) : **0 erreur**, sur l'état final
  (4 commits locaux inclus).
- Export web (`expo export --platform web`) : réussi, sans erreur.
- Socle partagé + invariants + tests mobile (ordre de `mobile.yml`,
  290 tests sur les 292 exécutables ici) : **286 / 288** verts.
  Les 2 échecs (`index.json` ne déclare pas `questionsGouvernement` ;
  142 exercices OFGL incohérents avec la population) sont des données
  locales, confirmés pré-existants (même échec sur `0c70fce`, avant
  toute modification V55).
- `conformite.test.mjs` et `decoupage.test.mjs` n'ont pas pu tourner
  sur ce poste (chemin Windows doublé dans le premier ; fichier
  `data/decoupage-idf.json` absent localement pour le second) — tous
  deux indépendants de V55, à régénérer séparément.
- Parcours navigateur (`parcours-web.mjs`, 360/390/430 px) : **3 échecs
  sur l'écran « Le calendrier »**, confirmés pré-existants (même
  échec sur `0c70fce`) — aucun fichier touché par V55 n'intervient sur
  cet écran.
- `zoom-web.mjs` : 1 échec pré-existant confirmé (« Qui décide » en vue
  « rue » montre encore « Assemblée nationale » — reproduit à
  l'identique sur `0c70fce`), sans lien avec les fichiers modifiés.
- Tous les autres parcours (`commune-web`, `mode-web`, `onboarding-web`,
  `elections-web`, `partage-texte-web`) : zéro échec.
- `recherche-web.mjs` : 2 échecs (recherche d'un scrutin par thème),
  sur un écran que V55 n'a pas touché — probable lacune de données,
  non creusé plus loin (hors périmètre V55).

**Aucune régression attribuable à V55 ne subsiste** : chaque échec
listé plus haut a été vérifié contre le code d'avant V55 (`0c70fce`)
et s'y reproduit à l'identique. Deux régressions ont bien été
introduites puis trouvées et corrigées pendant cette session (la
précision Île-de-France Mobilités masquée, le titre tronqué) : voir
RESUME-v55.md.

## Checklist pour vérification sur iPhone (les 5 écrans demandés)

1. **Accueil** — ordre : marque + logo + ⚙️ en haut → titre « Votre
   citoyenneté, expliquée. » (2 lignes, sans troncature) → recherche →
   liens → (si commune choisie) repère du jour et chiffres. **Vérifier
   en particulier l'absence du bouton ⚙️ flottant** (bloc 1) : si tu le
   vois encore, c'est que le cache Expo Go n'a pas été vidé — recharge
   à fond avant de conclure à un vrai bug.
2. **Qui décide** — timeline verticale à points colorés ; la carte
   Intercommunalité tient en 3-4 lignes avec un « Voir plus » ; plus de
   bloc Henri Mellier.
3. **Calendrier** — pas de bouton flottant (déjà vérifié : aucun dans
   le code).
4. **Fiche d'un élu sans parti publié** (annuaire, onglet Élus) — plus
   de carte « Ce que Repère n'affiche pas » ; une ligne discrète en
   pied à la place. (Mathilde Panot, citée dans le brief, est une
   députée : sa fiche réelle est `elu.tsx`, qui affichait déjà un badge
   de parti si la donnée existe — à vérifier séparément si elle a une
   fiche publiée dans ce jeu de données.)
5. **Melun (ou toute commune avec un projet financé)** — bouton « Voir
   le Repère du jour › » (plus de texte tronqué) ; carte budget avec
   un label par part une fois « Voir plus » ouvert.

## PRÊT POUR LES 5 TESTEURS ?

**PRESQUE.**

Pas OUI, parce que :
1. Le bloc 1 (bouton flottant) n'a pas pu être confirmé *résolu sur un
   vrai iPhone* — seulement « absent du code », avec une hypothèse de
   cache non vérifiable depuis ce poste. C'est le seul point bloquant
   du brief que je ne peux pas certifier à 100 %.
2. Le commit automatique `e216f5e` est déjà sur `origin` (poussé par
   la tâche planifiée avant que je m'en aperçoive, pas par moi) : pas
   de PR ouverte, rien de cassé, mais ce n'est pas le « commits locaux,
   tu relis, tu pousses » prévu — à prendre en compte avant de pousser
   le reste.

Pas NON : tsc à 0 erreur, aucune régression attribuable à V55 sur les
290 tests exécutables ici, 9 écrans vérifiés par capture d'écran réelle
(accueil x2 états, chez-vous x4, qui-décide x2, fiche annuaire x1,
budget déplié x1), deux régressions trouvées en vérifiant ont été
corrigées avant ce rapport plutôt que découvertes plus tard.
