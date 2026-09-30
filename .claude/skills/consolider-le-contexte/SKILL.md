---
name: consolider-le-contexte
description: Relecture hebdomadaire, hors session, de ce que les agents ont fait sur Repère, pour garder CLAUDE.md, CONTEXTE_PROJET.md et les skills vrais. Utilisée par la tâche planifiée du lundi ; propose, ne décide jamais.
---

# Consolider le contexte (« dreaming »)

Les sessions ne voient que leur propre travail. Cette relecture voit la semaine
entière, et cherche ce qu'aucune session n'a vu : ce qui est devenu faux, ce qui
revient, ce qui a disparu.

## Matière
- `git log --since="8 days ago"` sur **toutes** les branches distantes, avec les
  corps de commits (ils sont écrits comme des comptes rendus : mesure, correctif,
  preuve).
- Les PR ouvertes et fusionnées de la semaine.
- `node outils/derive_contexte.mjs` : dérives détectables mécaniquement.

## Ce qu'on cherche
1. **Faux** : une ligne de `CLAUDE.md` ou `CONTEXTE_PROJET.md` contredite par un
   commit de la semaine (chiffre, état, « non commencé » devenu fait).
2. **Disparu** : un fichier cité qui n'existe sur aucune branche ; un travail
   annoncé dans un document mais jamais poussé.
3. **Répété** : une même erreur, un même piège, une même consigne du porteur
   rencontrés dans deux sessions ou plus → proposer une ligne de skill ou une
   entrée de `CONTEXTE_PROJET.md` § 9.
4. **Traînant** : une branche sans activité depuis plus de 7 jours et non fusionnée ;
   une PR rouge ; une décision attendue du porteur depuis plus d'une semaine.

## Ce qu'on produit
- Une branche `docs/consolidation-AAAA-MM-JJ` et **une PR**, jamais une fusion.
- Chaque changement proposé cite sa preuve : hash du commit ou numéro de PR, et
  combien de fois le motif est apparu.
- Les invariants ne sont **jamais** modifiés par cette relecture ; une tension avec
  un invariant s'écrit dans la PR comme une question au porteur.
- Si rien n'est à changer : aucune PR, un compte rendu de trois lignes.
- Un message final court : proposé / signalé / rien à faire.
