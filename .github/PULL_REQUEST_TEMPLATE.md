## Ce qui change

<!-- Une ou deux phrases. Lier l'issue : « Ferme #123 ». -->

## Ce qui était faux, et comment c'est vérifié

<!-- La mesure, le test vu rouge puis vert, la commande lancée. -->

## Ce qui n'est pas vérifié

<!-- Écrire « rien » si tout l'est. Ne pas arrondir. -->

## Liste de contrôle

- [ ] `npm test` passe depuis `mono/`
- [ ] `npm run verifier` passe depuis `mono/apps/mobile` (si l'application change)
- [ ] `node outils/derive_contexte.mjs` passe (si `CLAUDE.md`, `AGENTS.md`, une skill ou `CONTEXTE_PROJET.md` change)
- [ ] Chaque chiffre affiché porte sa source et sa date ; une absence de donnée donne une phrase vraie et un lien
- [ ] Aucun invariant de `CLAUDE.md` n'est touché, ou l'ADR qui l'amende est citée
- [ ] Capture d'écran jointe si l'interface change (sans donnée personnelle)
- [ ] Documentation à jour (`README.md`, `CHANGELOG.md`, `docs/`) si nécessaire
