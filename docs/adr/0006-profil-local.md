# ADR 0006 — Profil de lecture, stocké sur l'appareil seulement

- **Date :** 30/10/2026
- **Statut :** appliqué le 30/10/2026 (V26, bloc 0). Invariant 2 amendé dans `CLAUDE.md` et `AGENTS.md`, puis scellé (`.claude/invariants.sha256`).

## Décision

1. **Une seconde clé locale est autorisée : `repere.profil`.** Elle porte uniquement des réglages de lecture : `niveauZoom`, `tailleTexte`, `contraste`, `espacement`, `policeDyslexie`, `animationsReduites`, `modeDaltonien`, `masquerImages`. Aucune identité, aucune commune, aucun historique.
2. **Même mécanisme que `repere.departement`** (`mono/apps/mobile/src/lib/memoire.ts`) : sur le web, la clé `localStorage` ; sur le téléphone, un fichier dans le dossier cache de l'application.
3. **Aucune transmission.** Aucune requête ne porte ces réglages. Aucun compte, email, traceur ni cookie.
4. **Une clé de plus, pas une porte ouverte.** Les seules clés autorisées sont désormais `repere.departement` et `repere.profil`. Toute autre clé reste refusée par le contrôle statique (`mono/tests/invariants.test.mjs`) et par le contrôle à l'exécution (`mono/tests/runtime.test.mjs`).

## Pourquoi

Les réglages d'accessibilité (taille du texte, contraste, daltonisme, réduction des animations) doivent survivre à une fermeture de l'application. Les stocker sur le téléphone plutôt que dans un compte garde l'invariant 1 (fonctionnement hors ligne) et l'invariant 2 (aucune donnée du lecteur ne part).

## Limites

- **Sur le téléphone, le système peut vider le dossier cache** s'il manque de place. Le lecteur retrouve alors les réglages par défaut. Aucune donnée n'est perdue ailleurs.
- **Les réglages ne suivent pas le lecteur** d'un appareil à l'autre. C'est voulu : rien ne part.

## Amendement D57 (30/10/2026, V31 bloc 1)

- **Décision CEO D57** : `repere.profil` porte aussi un champ `themes` : la liste des thèmes d'intérêt choisis par le lecteur, parmi une liste fixe (`mono/packages/core/src/themes.js` : Santé, École, Transport, Environnement, Budget, Sécurité, Économie). Vide par défaut.
- **Ce que cela change** : le champ ne règle plus seulement la lecture. Il dit ce que le lecteur veut suivre. Il reste sur l'appareil, n'est jamais transmis, et ne contient ni identité, ni commune, ni historique.
- **Ce qui ne change pas** : la clé reste la même (`repere.profil`), aucune autre clé n'est ajoutée, et la règle « aucune transmission » s'applique.
- **Limite connue** : le rangement des publications par thème se fait par mots-clés dans le titre. Il peut se tromper (exemple : « sécurité sociale » est rangé dans Sécurité). L'écran « Pour vous » le dit au lecteur.

## Amendement D67 (V35, bloc 1) — mode d'affichage

- **Décision CEO D67** : `repere.profil` porte aussi un champ `mode` : `auto` (suit le système), `clair` ou `sombre`. Défaut : `auto`. Le choix fait avec la roue des réglages est gardé sur l'appareil, comme les autres réglages de lecture.
- **Ce qui ne change pas** : aucune nouvelle clé (`repere.profil` reste la seconde et dernière clé), aucune transmission, aucune identité.
- **Sans profil** (accueil pas encore répondu) : le choix reste en mémoire pour la session, et n'écrit aucun profil. Écrire un profil à ce moment sauterait l'accueil (le profil absent déclenche l'accueil).
- **Sceau** : l'empreinte des invariants est régénérée (`node outils/derive_contexte.mjs --sceller`) sur décision du porteur, dans la même PR.
