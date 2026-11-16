# RESUME V40 — flux RSS officiels des mairies (D81) : état honnête

Date : 31/10/2026. Branche `test/sdk58-expo-go`. Rien n'est fusionné dans `main`.

**En une phrase** : l'amendement de la règle est fait, scellé et testé ; le collecteur RSS, sa chaîne et son affichage sont faits et testés en local ; le résumé par IA n'est pas fait (conflit avec D33) ; la couverture n'est pas mesurable depuis cette session.

## 1. Ce qui est fait

| Bloc | Résultat | Commit |
|---|---|---|
| 1 — Amendement ADR 0005, invariant 4, ADR 0007, stratégie | Fait. Invariant 4 réécrit dans `CLAUDE.md` et `AGENTS.md` (identiques, 119 lignes, plafond 120). Empreinte rescellée (`--sceller`, décision D81). Contrôle de contexte : 0 erreur. Tests d'invariants : 61/61. | `0de2656` |
| 2 — Collecte RSS, sans HTML | Fait. `mono/scripts/collecte-rss-mairies.mjs` : quatre adresses candidates, réponse HTML refusée sans analyse, liens du même domaine seulement, date requise et non future, trois entrées au plus, deux phrases au plus. `rss-parser` 3.13.0 ajouté. 8 tests sans réseau. | `c57dfdd` |
| 3 — Résumé Gemini | **Non fait.** Conflit avec D33 (relecture CEO obligatoire) et envoi de textes de mairies à un tiers (conditions non vérifiées). BLOCAGES §45. | — |
| 4 — Workflow CI | **Déplacé** : une étape de `outils/pipeline.sh`, après `pnpm install`, au lieu d'un workflow séparé (la chaîne est la seule à produire `mono/data/`, ignoré par git). Documentation : `docs/actus-rss.md`. Aucun secret requis. | (voir commit suivant) |
| 5 — Intégration app | Fait, `tsc` vert. Carte « Actus publiées par la mairie » pour toute commune qui a un flux, badge « Automatique · flux RSS officiel », date et ancienneté, lien vers le site de la mairie. Fonction pure `actusFlux` testée. **Non vue dans un navigateur.** | (voir commit suivant) |
| 6 — Rapport | Ce fichier. BLOCAGES §44 et §45. | ce commit |

## 2. Couverture

**Non mesurée.** Le réseau de la session refuse les sites des mairies (403) et l'API DILA est injoignable. Aucun nombre de communes avec flux n'est écrit ici. La chaîne quotidienne écrira ce nombre dans le champ `bilan` de `actuelles-rss.json`.

## 3. Vérifications faites

- `tsc --noEmit` (apps/mobile) : vert.
- `node --test tests/collecte-rss.test.mjs` : 9/9 (dont la garde de domaine, le refus HTML, le plafond de trois entrées).
- `node --test tests/invariants.test.mjs` : 61/61, avec le nouveau chemin public `/actuelles-rss.json`.
- Suite `npm test` complète : 221/223. L'échec restant, `runtime.test.mjs`, vient du navigateur Playwright absent de la session. Il n'est pas lié à ce lot.
- Contrôle de contexte (`outils/derive_contexte.mjs`) : 0 erreur après rescellement.

## 4. Ce qui n'est pas vérifié

- Les quatre adresses candidates : hypothèses. `/955.htm` vient du brief pour Versailles, sans confirmation.
- La base juridique (ADR 0007) : le raisonnement du brief (« le CADA autorise ») n'a pas été confirmé par la recherche. Avis juridique requis avant publication automatique.
- La licence de chaque flux : « non vérifiée » est écrit dans le fichier.
- L'affichage réel : aucune capture, aucun appareil.

## 5. Décisions pour le CEO

1. **Base juridique** : valider ADR 0007 par écrit, ou arrêter la publication des flux.
2. **Résumé IA** (BLOCAGES §45) : garder D33 (brouillon relu) ou l'amender par écrit.
3. **Lien sans carte** pour les communes sans flux (BLOCAGES §44) : ailleurs, ou rien.
4. **Fusion dans `main`** : sans elle, la chaîne ne tourne pas avec ce code, et le planificateur GitHub ne lance rien depuis cette branche.
5. **Mesure de couverture** : la première exécution de la chaîne après fusion donnera le chiffre ; il n'existe pas avant.

## 6. Pour tester

    cd mono
    node --test --test-concurrency=1 tests/collecte-rss.test.mjs tests/invariants.test.mjs
    node scripts/collecte-rss-mairies.mjs ./data     # réseau et mairies-idf.json requis
