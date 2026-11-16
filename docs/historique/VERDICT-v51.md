# VERDICT V51 — 03/11/2026

## État CI

- **Commit `32256da`** : job « Mobile (application, socle partagé) » **vert**, épreuve « chaîne de publication » **verte**.
- Ce vert vient après la correction de la carte (sous les trois réponses). Le commit précédent `3718d06` était rouge sur « Parcours dans un navigateur » : les trois réponses étaient repoussées sous le pli.
- Non couvert par la CI : `runtime.test.mjs` tel que `test-mono-pipeline.yml` le lance (sur `../site_engendre`, avec collecte réseau). Non reproductible dans cette session.

## Ce qui est intégré

- **Groupes politiques** : rien. Aucune donnée AMO30 dans le dépôt, « Inconnu » partout. Aucun groupe écrit de mémoire.
- **Sénateurs** : rien (skip, D135).
- **Repère du jour** : livré, 19 modèles (12 budget, 7 élus) sur 30 visés. Placé **sous** les trois réponses. Rotation sans répétition le lendemain, intervalle minimal de 6 jours. « Ma rue » respecté.

## Top 5 des tests iPhone pour le CEO

1. « Chez vous » sur 390 x 844 : les trois réponses tiennent dans le premier écran, la carte « Le Repère du jour » vient juste après.
2. Changer de jour (ou attendre le lendemain) : la carte doit proposer des faits différents.
3. Réglage « Ma rue » : aucun vote ni circonscription nationaux dans la carte.
4. Bouton « Partager » d'un fait : le texte, la source et le lien sont corrects.
5. Mode sombre : contraste de la carte et des sources lisible.

## PRÊT POUR LES 5 TESTEURS ?

**PRESQUE.** Raisons :
1. CI verte sur `32256da`, tests navigateur et invariants vérifiés localement.
2. **Placement de la carte à confirmer** : « en premier » (demande V51) est incompatible avec « Réponses d'abord » sur 844 px. Décision CEO.
3. **Rendu iPhone non vérifié** (clair, sombre, grande police).
4. Groupes politiques absents (« Inconnu » : honnête, mais visible).
5. 19 modèles sur 30 ; non-répétition sur 30 jours impossible sans mémoire locale (invariant 2).
