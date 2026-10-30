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
