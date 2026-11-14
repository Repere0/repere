# ADR 0010 — Gamification, mais du quiz seulement

- Date : 13 novembre 2026
- Statut : accepté (décision du porteur du 13/11/2026)
- Amende : invariant 6 (gamification) et invariant 2 (contenu de `repere.profil`)

## La décision, mot pour mot

> AVANT : « Aucune gamification des votes, aucun score, aucun classement politique. »
> APRÈS : « La gamification (points, rangs, streaks) est autorisée UNIQUEMENT pour le module de
> culture civique (Quiz du dictionnaire). Elle reste strictement interdite pour tout ce qui touche
> aux élus, aux votes, aux partis et aux territoires. »

## Pourquoi la ligne tient

Le quiz ne porte que sur du **vocabulaire institutionnel** : « qu'est-ce qu'un exercice budgétaire »,
« qu'est-ce qu'une circonscription ». Une définition a une bonne réponse, vérifiable, publiée dans le
dictionnaire de Repère. Gagner des points là-dessus, c'est apprendre un mot, pas prendre parti.

Un vote, une position, un élu, un parti, une commune n'ont pas de bonne réponse. Y attacher un point,
un rang ou une série ferait de Repère un juge. C'est exactement ce que l'invariant 6 interdit, et
l'amendement ne le touche pas.

## Ce qui est construit

- **+10 points par réponse juste**, dix rangs (14/11/2026, porteur ; quatre à l'origine) : Néo-citoyen (0-50),
  Apprenti (51-100), Citoyen (101-200), Initié (201-350), Averti (351-550), Éclairé (551-800), Expert (801-1100),
  Maître (1101-1500), Mentor (1501-2000), Sage (2001 et plus).
- Les points vivent dans `repere.profil`, **sur l'appareil**. Pas de troisième clé de stockage
  (invariant 2 : c'est ce qu'amende cet ADR). Rien ne part sur le réseau.
- **Aucun classement entre lecteurs**, et il n'y en aura pas : Repère ne sait rien des autres
  lecteurs, et ne veut rien en savoir. Il n'y a donc rien à comparer.
- Le partage est une **image**, par le partage du téléphone : « J'ai atteint le rang de X sur Repère.
  Peux-tu faire mieux ? ». Elle ne nomme ni élu, ni parti, ni commune, ni vote.
- Un total illisible ou négatif revient à 0. On ne répare jamais un compteur vers le haut.

## La preuve que la ligne est tenue

**Aucune garde du banc n'a été desserrée.** `MOTS_GAMIFICATION` et `MOTS_CLASSEMENT`
(`packages/data-utils/src/invariants.js`) interdisent toujours « bonne réponse », « mauvaise
réponse », « score de vote », « tu as gagné », « classement », « palmarès », « meilleur », « pire »
dans **tout** le code affiché, quiz compris.

Le quiz a dû être écrit autour de ces interdits — il dit « Juste » et « Faux », il compte des
« points », il nomme un « rang ». Les deux contrôles sont restés rouges tant que ce n'était pas le
cas, et ils sont verts maintenant sans qu'une seule exception ait été ajoutée. Si un jour quelqu'un
attache un point à un vote, ces mêmes gardes le refuseront.

## Conséquences

- `CLAUDE.md` et `AGENTS.md` : invariants 2 et 6 mis à jour ; `.claude/invariants.sha256` à resceller.
- `packages/core/src/profil.js` : `points`, `RANGS`, `rangPour`, `nettoyerPoints`.
- À surveiller : la tentation d'étendre les points à « a lu une fiche d'élu », « a consulté un vote ».
  Ce serait hors du module de culture civique, donc hors de cet amendement.
