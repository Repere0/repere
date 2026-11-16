# BLOCAGE — nuit du 5 novembre 2026

## La branche `refonte/v56` est inaccessible

Le brief demandait de travailler sur la branche locale `refonte/v56`. Elle n'existe que sur ton
PC (14 commits jamais poussés, d'après `design-v57/BLOCAGES-DESIGN.md`). La demande d'accès au
dossier `~/repere` du PC a été **refusée automatiquement** (contrôle d'accès aux dossiers, sans
toi pour valider).

**Ce que j'ai fait à la place** : une branche `refonte/v57-nuit`, partie de `main` (commit
`0c70fce`, PR #174), poussée sur GitHub pour que le travail ne soit pas perdu avec la session.

**Conséquence** : `refonte/v57-nuit` et ta `refonte/v56` ont divergé. Elles touchent en partie
les mêmes fichiers (`index.tsx`, `bienvenue.tsx`, `systeme.tsx` côté v56 ; `bienvenue.tsx`,
`index.tsx` côté nuit). Les trois emojis de l'accueil cités dans BLOCAGES-DESIGN B-10
viennent de v56 : ils ne sont pas sur `main`, donc pas retirés ici.

**Ce qu'il faut faire** : pousser `refonte/v56` (ou me donner l'accès au dossier), puis
rebaser l'une sur l'autre. Les commits de la nuit sont petits et séparés : ils se rejouent un
par un (`git cherry-pick`).
